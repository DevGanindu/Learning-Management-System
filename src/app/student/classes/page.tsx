import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, ExternalLink, Lock, AlertCircle, Calendar } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
    ZOOM: "bg-blue-100 text-blue-700",
    TEAMS: "bg-purple-100 text-purple-700",
    MEET: "bg-green-100 text-green-700",
    OTHER: "bg-gray-100 text-gray-700",
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Locked</h1>
                    <p className="text-gray-600 mb-6">
                        Your account has been locked due to payment issues. Please contact your administrator to resolve this.
                    </p>
                    <Link
                        href="/student/payments"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Online Classes</h1>
                <p className="text-gray-600 mt-2">
                    Live class links for {student.grade.name}
                </p>
            </div>



            {/* Classes Grid */}
            {classes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No online classes scheduled</p>
                    <p className="text-gray-400 text-sm mt-2">Your teachers will add class links soon</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(classLink => {
                        const platform = extractPlatform(classLink.description);
                        const desc = cleanDescription(classLink.description);
                        const platformColor = PLATFORM_COLORS[platform] || PLATFORM_COLORS.OTHER;

                        return (
                            <div
                                key={classLink.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <Video className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${platformColor}`}>
                                            {platform}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{classLink.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">By {classLink.uploader.name}</p>
                                {desc && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{desc}</p>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Added {new Date(classLink.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <a
                                    href={classLink.link || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Join Class
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
