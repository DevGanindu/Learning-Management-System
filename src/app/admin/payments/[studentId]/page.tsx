import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Calendar, DollarSign } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default async function StudentPaymentHistory({
    params,
}: {
    params: Promise<{ studentId: string }>;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    const { studentId } = await params;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: { select: { name: true, email: true } },
            grade: { select: { name: true } },
            payments: {
                orderBy: [{ year: "desc" }, { month: "desc" }],
            },
        },
    });

    if (!student) {
        redirect("/admin/payments");
    }

    const totalPaid = student.payments.filter(p => p.status === "PAID").length;
    const totalUnpaid = student.payments.filter(p => p.status === "UNPAID").length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/payments"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Payments
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{student.user.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-600">{student.user.email}</p>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {student.grade.name}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.lockedDueToPayment
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                        {student.lockedDueToPayment ? "Account Locked" : "Account Active"}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
                            <p className="text-3xl font-bold text-gray-900">{student.payments.length}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Paid</p>
                            <p className="text-3xl font-bold text-green-600">{totalPaid}</p>
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
                            <p className="text-3xl font-bold text-red-600">{totalUnpaid}</p>
                        </div>
                        <div className="bg-red-500 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                    {student.payments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No payment records found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Paid Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {student.payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {MONTHS[payment.month - 1]} {payment.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                            Rs. {payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(payment.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {payment.paidDate
                                                ? new Date(payment.paidDate).toLocaleDateString()
                                                : "-"}
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
