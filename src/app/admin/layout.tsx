import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { LayoutDashboard, Users, DollarSign, UserPlus, GraduationCap } from "@/components/shared/Icons";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect('/login');
    }

    const sidebarLinks = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/admin/registrations",
            label: "Registrations",
            icon: UserPlus,
        },
        {
            href: "/admin/students",
            label: "Students",
            icon: Users,
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
            <Navbar userName={session.user.name || "Admin"} role="Admin" links={sidebarLinks} />
            <div className="flex">
                <Sidebar links={sidebarLinks} />
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
