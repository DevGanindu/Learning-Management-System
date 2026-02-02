"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    links: {
        href: string;
        label: string;
        icon: LucideIcon;
    }[];
}

export default function Sidebar({ links }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-56 md:w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-3 md:p-4 hidden md:block shrink-0">
            <nav className="space-y-1.5 md:space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href ||
                        (link.href !== "/admin" && link.href !== "/teacher" && link.href !== "/student" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all text-sm md:text-base",
                                isActive
                                    ? "bg-primary text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
