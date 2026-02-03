import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, CheckCircle, XCircle, Calendar, AlertCircle, ArrowLeft, CreditCard, Receipt, TrendingUp } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
    const totalAmount = student.payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = student.payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="pb-6">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 pt-6 pb-20 md:px-8 md:pt-8 md:pb-24 mb-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative">
                    <Link href="/student" className="inline-flex items-center gap-1 text-purple-100 text-sm mb-3 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <CreditCard className="w-7 h-7" />
                        My Payments
                    </h1>
                    <p className="text-purple-100 text-sm md:text-base">
                        View your payment status and history
                    </p>
                </div>
            </div>

            {/* Account Status Alert */}
            {student.lockedDueToPayment && (
                <div className="mx-2 md:mx-0 -mt-16 relative z-10 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-800 font-semibold text-sm">Account Locked</p>
                            <p className="text-red-700 text-xs">
                                Please contact your administrator to restore access.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Month Status Card */}
            <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mx-2 md:mx-0 relative z-10 mb-6 ${!student.lockedDueToPayment ? '-mt-16' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current Month</p>
                        <p className="text-lg font-bold text-gray-900">
                            {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
                        </p>
                    </div>
                    {currentMonthPayment ? (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                            currentMonthPayment.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                        }`}>
                            {currentMonthPayment.status === "PAID" ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                            {currentMonthPayment.status}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            No Record
                        </div>
                    )}
                </div>
                
                {currentMonthPayment && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="text-lg font-bold text-gray-900">Rs. {currentMonthPayment.amount.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="text-lg font-bold text-gray-900">{new Date(currentMonthPayment.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mx-2 md:mx-0 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{student.payments.length}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-600">{totalPaid}</p>
                    <p className="text-xs text-gray-500">Paid</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <XCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-xl font-bold text-amber-600">{totalUnpaid}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
            </div>

            {/* Payment History */}
            <div className="mx-2 md:mx-0">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Payment History
                </h3>
                
                {student.payments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Records</h3>
                        <p className="text-gray-500 text-sm">Your payment history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {student.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${
                                            payment.status === "PAID"
                                                ? "bg-green-100"
                                                : "bg-amber-100"
                                        }`}>
                                            {payment.status === "PAID" ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-amber-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {SHORT_MONTHS[payment.month - 1]} {payment.year}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">Rs. {payment.amount.toLocaleString()}</p>
                                        <span className={`text-xs font-medium ${
                                            payment.status === "PAID"
                                                ? "text-green-600"
                                                : "text-amber-600"
                                        }`}>
                                            {payment.status === "PAID" 
                                                ? `Paid ${payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : ''}`
                                                : "Pending"
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {student.payments.length > 0 && (
                <div className="mx-2 md:mx-0 mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-purple-600 font-medium">Total Paid Amount</p>
                            <p className="text-lg font-bold text-purple-700">Rs. {paidAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-purple-600 font-medium">Payment Rate</p>
                            <p className="text-lg font-bold text-purple-700">
                                {student.payments.length > 0 ? Math.round((totalPaid / student.payments.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
