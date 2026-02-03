import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FileText, Youtube, Video, Eye, Upload, Users, Settings, UserPlus, DollarSign, GraduationCap, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboard() {
    const session = await auth();

    // Fetch statistics
    const materialsCount = await prisma.material.count({
        where: { uploadedById: session?.user?.id },
    });

    const materialsByType = await prisma.material.groupBy({
        by: ['type'],
        where: { uploadedById: session?.user?.id },
        _count: true,
    });

    const gradeDistribution = await prisma.material.groupBy({
        by: ['gradeId'],
        where: { uploadedById: session?.user?.id },
        _count: true,
    });

    // Fetch student count
    const studentsCount = await prisma.student.count({
        where: { approvalStatus: "APPROVED" },
    });

    // Fetch pending registrations count
    const pendingRegistrations = await prisma.student.count({
        where: { approvalStatus: "PENDING" },
    });

    const navLinks = [
        { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, color: "bg-blue-500" },
        { href: "/teacher/students", label: "Students", icon: Users, color: "bg-green-500" },
        { href: "/teacher/materials", label: "Materials", icon: FileText, color: "bg-purple-500" },
        { href: "/teacher/classes", label: "Online Classes", icon: Video, color: "bg-red-500" },
    ];

    const adminLinks = [
        { href: "/admin", label: "Admin Panel", icon: Settings, color: "bg-gray-600" },
        { href: "/admin/registrations", label: "Registrations", icon: UserPlus, color: "bg-orange-500", badge: pendingRegistrations },
        { href: "/admin/payments", label: "Payments", icon: DollarSign, color: "bg-emerald-500" },
        { href: "/admin/fees", label: "Class Fees", icon: GraduationCap, color: "bg-indigo-500" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session?.user?.name}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Total Materials
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {materialsCount}
                            </p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Active Students
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {studentsCount}
                            </p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Grades Covered
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {gradeDistribution.length}
                            </p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Pending Requests
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {pendingRegistrations}
                            </p>
                        </div>
                        <div className="bg-orange-500 p-3 rounded-lg">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher Tools */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Teacher Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/teacher/materials/upload" className="group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <Upload className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Upload</h3>
                            <p className="text-blue-100 text-sm">Add materials</p>
                        </div>
                    </Link>
                    
                    <Link href="/teacher/materials" className="group">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Materials</h3>
                            <p className="text-green-100 text-sm">View uploads</p>
                        </div>
                    </Link>
                    
                    <Link href="/teacher/students" className="group">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Students</h3>
                            <p className="text-purple-100 text-sm">{studentsCount} enrolled</p>
                        </div>
                    </Link>
                    
                    <Link href="/teacher/classes" className="group">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <Video className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Classes</h3>
                            <p className="text-red-100 text-sm">Online sessions</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Admin Tools */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Admin Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin" className="group">
                        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <Settings className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Admin</h3>
                            <p className="text-gray-300 text-sm">Control panel</p>
                        </div>
                    </Link>
                    
                    <Link href="/admin/registrations" className="group relative">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            {pendingRegistrations > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                                    {pendingRegistrations}
                                </span>
                            )}
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <UserPlus className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Requests</h3>
                            <p className="text-orange-100 text-sm">Registrations</p>
                        </div>
                    </Link>
                    
                    <Link href="/admin/payments" className="group">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Payments</h3>
                            <p className="text-emerald-100 text-sm">Manage fees</p>
                        </div>
                    </Link>
                    
                    <Link href="/admin/fees" className="group">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg">Class Fees</h3>
                            <p className="text-indigo-100 text-sm">Set pricing</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
