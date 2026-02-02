import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FileText, Youtube, Video } from "lucide-react";

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

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session?.user?.name}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                Grades Covered
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {gradeDistribution.length}
                            </p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Recent Uploads
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {materialsByType.length > 0 ? materialsByType[0]._count : 0}
                            </p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg">
                            <Youtube className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <a
                    href="/teacher/materials/upload"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                    <FileText className="w-5 h-5" />
                    Upload New Material
                </a>
            </div>
        </div>
    );
}
