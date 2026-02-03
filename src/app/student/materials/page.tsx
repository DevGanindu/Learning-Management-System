import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Youtube, Video, Download, ExternalLink, Lock, AlertCircle, PlayCircle, BookOpen, ArrowLeft, Sparkles, Filter, FolderOpen } from "lucide-react";

export default async function StudentMaterialsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
        redirect("/login");
    }

    // Get student info with payment status
    const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        include: {
            grade: true,
            payments: {
                where: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                },
                take: 1,
            },
        },
    });

    if (!student) {
        redirect("/login");
    }

    const isPaid = student.payments[0]?.status === "PAID";
    const isLocked = student.lockedDueToPayment;

    // If locked, show locked message
    if (isLocked) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Locked</h1>
                    <p className="text-gray-600 mb-6 text-sm">
                        Your account has been locked due to payment issues. Please complete your payment to access materials.
                    </p>
                    <Link
                        href="/student/payments"
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] font-medium shadow-lg shadow-primary/20"
                    >
                        View Payment Status
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch materials for student's grade
    const materials = await prisma.material.findMany({
        where: {
            gradeId: student.gradeId,
        },
        include: {
            uploader: { select: { name: true } },
        },
        orderBy: { uploadedAt: "desc" },
    });

    // Separate materials by type
    const onlineClasses = materials.filter(m => m.type === "ONLINE_CLASS");
    const documents = materials.filter(m => m.type === "PDF" || m.type === "DOC");
    const videos = materials.filter(m => m.type === "YOUTUBE");

    return (
        <div className="pb-6">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 pt-6 pb-20 md:px-8 md:pt-8 md:pb-24 mb-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative">
                    <Link href="/student" className="inline-flex items-center gap-1 text-blue-100 text-sm mb-3 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <BookOpen className="w-7 h-7" />
                        My Materials
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base">
                        Learning resources for {student.grade.name}
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 -mt-16 mx-2 md:mx-0 relative z-10 mb-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2">
                        <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Video className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{onlineClasses.length}</p>
                        <p className="text-xs text-gray-500">Classes</p>
                    </div>
                    <div className="p-2 border-x border-gray-100">
                        <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{documents.length}</p>
                        <p className="text-xs text-gray-500">Documents</p>
                    </div>
                    <div className="p-2">
                        <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Youtube className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{videos.length}</p>
                        <p className="text-xs text-gray-500">Videos</p>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Pills */}
            <div className="flex gap-2 mx-2 md:mx-0 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <a
                    href="#online-classes"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors whitespace-nowrap text-sm font-medium shadow-md shadow-green-500/20 active:scale-95"
                >
                    <Video className="w-4 h-4" />
                    <span>Classes ({onlineClasses.length})</span>
                </a>
                <a
                    href="#documents"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors whitespace-nowrap text-sm font-medium shadow-md shadow-blue-500/20 active:scale-95"
                >
                    <FileText className="w-4 h-4" />
                    <span>Docs ({documents.length})</span>
                </a>
                <a
                    href="#videos"
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors whitespace-nowrap text-sm font-medium shadow-md shadow-red-500/20 active:scale-95"
                >
                    <Youtube className="w-4 h-4" />
                    <span>Videos ({videos.length})</span>
                </a>
            </div>

            <div className="mx-2 md:mx-0">
                {materials.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Your teachers will add materials soon</p>
                        <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Check back later!</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Online Classes Section */}
                        {onlineClasses.length > 0 && (
                            <section id="online-classes">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-500 p-2.5 rounded-xl shadow-md shadow-green-500/20">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Online Classes</h2>
                                        <p className="text-xs text-gray-500">{onlineClasses.length} available</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {onlineClasses.map(material => (
                                        <div
                                            key={material.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="bg-green-100 text-green-600 p-2.5 rounded-xl flex-shrink-0">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">By {material.uploader.name}</p>
                                                    {material.description && (
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(material.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                        {material.link && (
                                                            <a
                                                                href={material.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
                                                            >
                                                                <PlayCircle className="w-4 h-4" />
                                                                Join
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Documents Section */}
                        {documents.length > 0 && (
                            <section id="documents">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-500 p-2.5 rounded-xl shadow-md shadow-blue-500/20">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                                        <p className="text-xs text-gray-500">{documents.length} available</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {documents.map(material => (
                                        <div
                                            key={material.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                                                    material.type === "PDF" 
                                                        ? "bg-red-100 text-red-600" 
                                                        : "bg-blue-100 text-blue-600"
                                                }`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h3 className="font-semibold text-gray-900 mb-1 truncate">{material.title}</h3>
                                                            <p className="text-xs text-gray-500 mb-2">By {material.uploader.name}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                                                            material.type === "PDF"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}>
                                                            {material.type}
                                                        </span>
                                                    </div>
                                                    {material.description && (
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(material.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                        {material.fileUrl && (
                                                            <a
                                                                href={material.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Videos Section */}
                        {videos.length > 0 && (
                            <section id="videos">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-500 p-2.5 rounded-xl shadow-md shadow-red-500/20">
                                        <Youtube className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Video Lessons</h2>
                                        <p className="text-xs text-gray-500">{videos.length} available</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {videos.map(material => (
                                        <div
                                            key={material.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="bg-red-100 text-red-600 p-2.5 rounded-xl flex-shrink-0">
                                                    <Youtube className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">By {material.uploader.name}</p>
                                                    {material.description && (
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(material.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                        {material.link && (
                                                            <a
                                                                href={material.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                Watch
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Help Text */}
            {materials.length > 0 && (
                <div className="mx-2 md:mx-0 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-center text-blue-700 text-sm">
                        📚 <span className="font-medium">Keep learning!</span> New materials are added regularly by your teachers.
                    </p>
                </div>
            )}
        </div>
    );
}
