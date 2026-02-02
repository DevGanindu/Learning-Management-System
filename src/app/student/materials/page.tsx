import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Youtube, Video, Download, ExternalLink, Lock, AlertCircle, PlayCircle } from "lucide-react";

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
                    <div className="bg-red-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Account Locked</h1>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                        Your account has been locked due to payment issues. Please contact your administrator to resolve this.
                    </p>
                    <Link
                        href="/student/payments"
                        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
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

    const TYPE_ICONS: Record<string, typeof FileText> = {
        PDF: FileText,
        DOC: FileText,
        YOUTUBE: Youtube,
        ONLINE_CLASS: Video,
    };

    const TYPE_COLORS: Record<string, string> = {
        PDF: "bg-red-100 text-red-700",
        DOC: "bg-blue-100 text-blue-700",
        YOUTUBE: "bg-red-100 text-red-700",
        ONLINE_CLASS: "bg-green-100 text-green-700",
    };

    return (
        <div className="px-2 sm:px-0">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Materials</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Learning materials for {student.grade.name}
                </p>
            </div>


            {/* Category Tabs - Mobile Scrollable */}
            <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                <a
                    href="#online-classes"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-sm sm:text-base"
                >
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Online Classes ({onlineClasses.length})</span>
                </a>
                <a
                    href="#documents"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap text-sm sm:text-base"
                >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Documents ({documents.length})</span>
                </a>
                <a
                    href="#videos"
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap text-sm sm:text-base"
                >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Videos ({videos.length})</span>
                </a>
            </div>

            {materials.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">No materials available yet</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">Your teachers will add materials soon</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Online Classes Section */}
                    {onlineClasses.length > 0 && (
                        <section id="online-classes">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-green-500 p-2 rounded-lg">
                                    <Video className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Online Classes</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {onlineClasses.map(material => (
                                    <div
                                        key={material.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="bg-green-100 text-green-700 p-2 rounded-lg flex-shrink-0">
                                                <Video className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500">By {material.uploader.name}</p>
                                            </div>
                                        </div>
                                        {material.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                                {material.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {new Date(material.uploadedAt).toLocaleDateString()}
                                            </span>
                                            {material.link && (
                                                <a
                                                    href={material.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <PlayCircle className="w-4 h-4" />
                                                    Join Class
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Documents Section */}
                    {documents.length > 0 && (
                        <section id="documents">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Documents</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documents.map(material => {
                                    const Icon = TYPE_ICONS[material.type] || FileText;
                                    const colorClass = TYPE_COLORS[material.type] || "bg-gray-100 text-gray-700";

                                    return (
                                        <div
                                            key={material.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500">By {material.uploader.name}</p>
                                                </div>
                                            </div>
                                            {material.description && (
                                                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {material.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(material.uploadedAt).toLocaleDateString()}
                                                </span>
                                                {material.fileUrl && (
                                                    <a
                                                        href={material.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs sm:text-sm rounded-lg hover:bg-primary/90 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Videos Section */}
                    {videos.length > 0 && (
                        <section id="videos">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-red-500 p-2 rounded-lg">
                                    <Youtube className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Video Lessons</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {videos.map(material => (
                                    <div
                                        key={material.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="bg-red-100 text-red-700 p-2 rounded-lg flex-shrink-0">
                                                <Youtube className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500">By {material.uploader.name}</p>
                                            </div>
                                        </div>
                                        {material.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                                {material.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {new Date(material.uploadedAt).toLocaleDateString()}
                                            </span>
                                            {material.link && (
                                                <a
                                                    href={material.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Watch
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
