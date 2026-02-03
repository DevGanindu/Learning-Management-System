import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { LayoutDashboard, FileText, Video, Users, Settings, DollarSign, UserPlus, GraduationCap } from "@/components/shared/Icons";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "TEACHER") {
        redirect('/login');
    }

    const sidebarLinks = [
        {
            href: "/teacher",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/teacher/students",
            label: "Students",
            icon: Users,
        },
        {
            href: "/teacher/materials",
            label: "Materials",
            icon: FileText,
        },
        {
            href: "/teacher/classes",
            label: "Online Classes",
            icon: Video,
        },
        // Admin section - Teachers have admin privileges
        {
            href: "/admin",
            label: "Admin Panel",
            icon: Settings,
        },
        {
            href: "/admin/registrations",
            label: "Registrations",
            icon: UserPlus,
        },
        {
            href: "/admin/payments",
            label: "Payments",
            icon: DollarSign,
        },
        {
            href: "/admin/fees",
            label: "Class Fees",
            icon: GraduationCap,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar userName={session.user.name || "Teacher"} role="Teacher" links={sidebarLinks} />
            <div className="flex">
                <Sidebar links={sidebarLinks} />
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}

