import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, DollarSign, CheckCircle, XCircle, UserPlus } from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth();

    // Fetch statistics
    const [totalStudents, activeStudents, totalPayments, paidPayments] = await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { isActive: true, lockedDueToPayment: false } }),
        prisma.payment.count({
            where: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
            },
        }),
        prisma.payment.count({
            where: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                status: 'PAID',
            },
        }),
    ]);

    const stats = [
        {
            title: "Total Students",
            value: totalStudents,
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Active Students",
            value: activeStudents,
            icon: CheckCircle,
            color: "bg-green-500",
        },
        {
            title: "Payments This Month",
            value: `${paidPayments}/${totalPayments}`,
            icon: DollarSign,
            color: "bg-purple-500",
        },
        {
            title: "Locked Accounts",
            value: totalStudents - activeStudents,
            icon: XCircle,
            color: "bg-red-500",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session?.user?.name}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                        href="/admin/students"
                        className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all group"
                    >
                        <Users className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">
                            Manage Students
                        </span>
                    </a>
                    <a
                        href="/admin/registrations"
                        className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                        <span className="font-medium text-gray-700 group-hover:text-green-500">
                            Registrations
                        </span>
                    </a>
                    <a
                        href="/admin/payments"
                        className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                        <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                        <span className="font-medium text-gray-700 group-hover:text-purple-500">
                            Manage Payments
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
