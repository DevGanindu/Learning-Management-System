import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, ExternalLink, Lock, AlertCircle, Calendar, Clock, Users, PlayCircle, Sparkles, ArrowLeft } from "lucide-react";

const PLATFORM_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
    ZOOM: { bg: "bg-blue-500", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
    TEAMS: { bg: "bg-purple-500", text: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
    MEET: { bg: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700" },
    OTHER: { bg: "bg-gray-500", text: "text-gray-600", badge: "bg-gray-100 text-gray-700" },
};

const PLATFORM_ICONS: Record<string, string> = {
    ZOOM: "📹",
    TEAMS: "💼",
    MEET: "🎥",
    OTHER: "📺",
};

function extractPlatform(description: string | null): string {
    if (!description) return "OTHER";
    const match = description.match(/^\[(\w+)\]/);
    return match ? match[1] : "OTHER";
}

function cleanDescription(description: string | null): string {
    if (!description) return "";
    return description.replace(/^\[\w+\]\s*/, "");
}

export default async function StudentClassesPage() {
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
                        Your account has been locked due to payment issues. Please complete your payment to access online classes.
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

    // Fetch online classes for student's grade
    const classes = await prisma.material.findMany({
        where: {
            gradeId: student.gradeId,
            type: "ONLINE_CLASS",
        },
        include: {
            uploader: { select: { name: true } },
        },
        orderBy: { uploadedAt: "desc" },
    });

    return (
        <div className="pb-6">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 pt-6 pb-20 md:px-8 md:pt-8 md:pb-24 mb-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative">
                    <Link href="/student" className="inline-flex items-center gap-1 text-green-100 text-sm mb-3 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <Video className="w-7 h-7" />
                        Online Classes
                    </h1>
                    <p className="text-green-100 text-sm md:text-base">
                        Live class links for {student.grade.name}
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 -mt-16 mx-2 md:mx-0 relative z-10 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Video className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                            <p className="text-gray-500 text-sm">Available Classes</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{student.grade.name}</p>
                        <p className="text-xs text-gray-500">Your Grade</p>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="mx-2 md:mx-0">
                {classes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Your teachers will add class links soon</p>
                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Check back later!</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classes.map(classLink => {
                            const platform = extractPlatform(classLink.description);
                            const desc = cleanDescription(classLink.description);
                            const colors = PLATFORM_COLORS[platform] || PLATFORM_COLORS.OTHER;
                            const emoji = PLATFORM_ICONS[platform] || PLATFORM_ICONS.OTHER;

                            return (
                                <div
                                    key={classLink.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                                >
                                    {/* Card Header */}
                                    <div className={`${colors.bg} px-4 py-3 flex items-center justify-between`}>
                                        <span className="text-white font-medium flex items-center gap-2">
                                            <span className="text-lg">{emoji}</span>
                                            {platform}
                                        </span>
                                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                            Live Class
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{classLink.title}</h3>
                                        
                                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                            <Users className="w-4 h-4" />
                                            <span>By {classLink.uploader.name}</span>
                                        </div>

                                        {desc && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                                                {desc}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Added {new Date(classLink.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Join Button */}
                                        <a
                                            href={classLink.link || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-center gap-2 w-full py-3.5 ${colors.bg} text-white rounded-xl hover:opacity-90 transition-all active:scale-[0.98] font-semibold shadow-lg`}
                                            style={{ boxShadow: `0 10px 25px -5px ${platform === 'ZOOM' ? 'rgba(59, 130, 246, 0.3)' : platform === 'TEAMS' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                            Join Class Now
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Help Text */}
            {classes.length > 0 && (
                <div className="mx-2 md:mx-0 mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-center text-green-700 text-sm">
                        💡 <span className="font-medium">Tip:</span> Make sure you have the required app installed before joining a class.
                    </p>
                </div>
            )}
        </div>
    );
}
