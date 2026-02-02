import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DollarSign, CheckCircle, XCircle, Calendar, AlertCircle } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default async function StudentPaymentsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
        redirect("/login");
    }

    // Get student info with all payments
    const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        include: {
            grade: true,
            payments: {
                orderBy: [{ year: "desc" }, { month: "desc" }],
            },
        },
    });

    if (!student) {
        redirect("/login");
    }

    const currentMonthPayment = student.payments.find(
        p => p.year === new Date().getFullYear() && p.month === new Date().getMonth() + 1
    );

    const totalPaid = student.payments.filter(p => p.status === "PAID").length;
    const totalUnpaid = student.payments.filter(p => p.status === "UNPAID").length;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
                <p className="text-gray-600 mt-2">View your payment status and history</p>
            </div>

            {/* Account Status Alert */}
            {student.lockedDueToPayment && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Account Locked</p>
                        <p className="text-red-700 text-sm">
                            Your account has been locked due to unpaid fees. Please contact your administrator to restore access.
                        </p>
                    </div>
                </div>
            )}

            {/* Current Month Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Month Status</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
                        </p>
                        <p className="text-gray-600 mt-1">
                            {student.grade.name}
                        </p>
                    </div>
                    {currentMonthPayment ? (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentMonthPayment.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {currentMonthPayment.status === "PAID" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <span className="font-medium">{currentMonthPayment.status}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">No Record</span>
                        </div>
                    )}
                </div>
                {currentMonthPayment && currentMonthPayment.status === "UNPAID" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Amount Due:</span>
                            <span className="font-medium">Rs. {currentMonthPayment.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium">{new Date(currentMonthPayment.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}
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
                            <DollarSign className="w-6 h-6 text-white" />
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

            {/* Payment History */}
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
