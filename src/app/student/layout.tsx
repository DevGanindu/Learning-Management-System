import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { LayoutDashboard, BookOpen, DollarSign, Video } from "@/components/shared/Icons";

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "STUDENT") {
        redirect('/login');
    }

    const sidebarLinks = [
        {
            href: "/student",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/student/materials",
            label: "My Materials",
            icon: BookOpen,
        },
        {
            href: "/student/classes",
            label: "Online Classes",
            icon: Video,
        },
        {
            href: "/student/payments",
            label: "Payments",
            icon: DollarSign,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar userName={session.user.name || "Student"} role="Student" links={sidebarLinks} />
            <div className="flex">
                <Sidebar links={sidebarLinks} />
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}

