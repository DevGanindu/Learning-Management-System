"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Lock, LockOpen, DollarSign, Users, Eye, Search } from "lucide-react";

interface Student {
    id: string;
    studentId?: string;
    isActive: boolean;
    lockedDueToPayment: boolean;
    enrollmentDate: string;
    user: { name: string; email: string };
    grade: { id: string; name: string; level: number };
    payments: { status: string }[];
}

interface Grade {
    id: string;
    name: string;
    level: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (studentId: string, studentName: string) => {
        if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            return;
        }

        setDeleting(studentId);
        try {
            const res = await fetch(`/api/students/${studentId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setStudents(prev => prev.filter(s => s.id !== studentId));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete student");
            }
        } catch (error) {
            alert("Failed to delete student");
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        // Fetch grades
        fetch("/api/grades")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGrades(data);
                }
            })
            .catch(console.error);

        // Fetch students
        fetch("/api/students")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStudents(data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    // Filter by grade first, then by search query
    const filteredStudents = students
        .filter(s => selectedGrade === "all" || s.grade.id === selectedGrade)
        .filter(s => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                s.user.name.toLowerCase().includes(query) ||
                (s.studentId && s.studentId.toLowerCase().includes(query)) ||
                s.user.email.toLowerCase().includes(query)
            );
        });

    const gradeStats = grades.map(grade => ({
        ...grade,
        count: students.filter(s => s.grade.id === grade.id).length,
    }));

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-600 mt-2">Manage all student accounts by grade</p>
                </div>
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or Student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-80"
                    />
                </div>
            </div>

            {/* Grade Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {gradeStats.map(grade => (
                    <button
                        key={grade.id}
                        onClick={() => setSelectedGrade(grade.id)}
                        className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all text-left ${selectedGrade === grade.id
                            ? "border-primary bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-2xl font-bold text-gray-900">{grade.count}</p>
                        <p className="text-sm text-gray-600">{grade.name}</p>
                    </button>
                ))}
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
                            All Students ({students.length})
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
                                {grade.name} ({gradeStats.find(g => g.id === grade.id)?.count || 0})
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading students...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No students found {selectedGrade !== "all" ? "in this grade" : ""}</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => {
                                    const currentPayment = student.payments[0];
                                    const isLocked = student.lockedDueToPayment || !student.isActive;

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {student.user.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {student.user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {student.grade.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isLocked ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                        <Lock className="w-3 h-3" />
                                                        Locked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                        <LockOpen className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {currentPayment ? (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentPayment.status === 'PAID'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {currentPayment.status}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                                        No Record
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/students/${student.id}`}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="View Profile"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(student.id, student.user.name)}
                                                        disabled={deleting === student.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/payments/${student.id}`}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Payment History"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
