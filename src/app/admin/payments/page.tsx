"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, CheckCircle, XCircle, Filter, Users, Calendar, History, Plus, RefreshCw, Search } from "lucide-react";

interface Payment {
    id: string;
    amount: number;
    month: number;
    year: number;
    status: "PAID" | "UNPAID";
    paidDate: string | null;
    dueDate: string;
    student: {
        id: string;
        studentId?: string;
        lockedDueToPayment: boolean;
        user: { name: string; email: string };
        grade: { name: string; level: number };
    };
}

interface Grade {
    id: string;
    name: string;
    level: number;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch grades on mount
    useEffect(() => {
        fetch("/api/grades")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGrades(data);
                }
            })
            .catch(console.error);
    }, []);

    // Function to generate payments for all approved students (uses grade-specific fees)
    const generatePayments = async () => {
        setGenerating(true);
        setMessage(null);
        try {
            const res = await fetch("/api/payments/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month: selectedMonth,
                    year: selectedYear,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message || `Created ${data.created} payment records` });
                // Refresh the payments list
                fetchPayments();
            } else {
                setMessage({ type: "error", text: data.error || "Failed to generate payments" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to generate payments" });
        } finally {
            setGenerating(false);
        }
    };

    const fetchPayments = () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            month: selectedMonth.toString(),
            year: selectedYear.toString(),
        });
        if (selectedGrade !== "all") {
            params.append("gradeId", selectedGrade);
        }

        fetch(`/api/payments?${params}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPayments(data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    // Fetch payments when filters change
    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams({
            month: selectedMonth.toString(),
            year: selectedYear.toString(),
        });
        if (selectedGrade !== "all") {
            params.append("gradeId", selectedGrade);
        }

        fetch(`/api/payments?${params}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPayments(data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [selectedGrade, selectedMonth, selectedYear]);

    const togglePaymentStatus = async (paymentId: string, currentStatus: string) => {
        setUpdating(paymentId);
        try {
            const newStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
            const res = await fetch("/api/payments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, status: newStatus }),
            });

            if (res.ok) {
                const updatedPayment = await res.json();
                setPayments(prev =>
                    prev.map(p => p.id === paymentId ? { ...p, status: newStatus, paidDate: updatedPayment.paidDate } : p)
                );
            }
        } catch (error) {
            console.error("Failed to update payment:", error);
        } finally {
            setUpdating(null);
        }
    };

    // Filter payments by search query
    const filteredPayments = payments.filter(p => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.student.user.name.toLowerCase().includes(query) ||
            (p.student.studentId && p.student.studentId.toLowerCase().includes(query)) ||
            p.student.user.email.toLowerCase().includes(query)
        );
    });

    const paidCount = filteredPayments.filter(p => p.status === "PAID").length;
    const unpaidCount = filteredPayments.filter(p => p.status === "UNPAID").length;

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Manage student payments and view payment history
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                        />
                    </div>
                    <button
                        onClick={generatePayments}
                        disabled={generating}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {generating ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        {generating ? "Generating..." : "Generate Monthly Payments"}
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                            <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Paid</p>
                            <p className="text-3xl font-bold text-green-600">{paidCount}</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Unpaid</p>
                            <p className="text-3xl font-bold text-red-600">{unpaidCount}</p>
                        </div>
                        <div className="bg-red-500 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Grade Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">All Grades</option>
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Month Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {MONTHS.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    </div>
                    {/* Year Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {/* Generate years dynamically from 2023 to current year + 1 */}
                            {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => 2023 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grade Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                        <button
                            onClick={() => setSelectedGrade("all")}
                            className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${selectedGrade === "all"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            All Grades
                        </button>
                        {grades.map(grade => (
                            <button
                                key={grade.id}
                                onClick={() => setSelectedGrade(grade.id)}
                                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${selectedGrade === grade.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {grade.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading payments...</div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No payment records found for this period</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.student.user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.student.user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {payment.student.grade.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Rs. {payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${payment.status === "PAID"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}>
                                                {payment.status === "PAID" ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.student.lockedDueToPayment
                                                ? "bg-red-100 text-red-800"
                                                : "bg-green-100 text-green-800"
                                                }`}>
                                                {payment.student.lockedDueToPayment ? "Locked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => togglePaymentStatus(payment.id, payment.status)}
                                                    disabled={updating === payment.id}
                                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${payment.status === "PAID"
                                                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                >
                                                    {updating === payment.id
                                                        ? "..."
                                                        : payment.status === "PAID"
                                                            ? "Mark Unpaid"
                                                            : "Mark Paid"}
                                                </button>
                                                <Link
                                                    href={`/admin/payments/${payment.student.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                >
                                                    <History className="w-3 h-3" />
                                                    History
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
