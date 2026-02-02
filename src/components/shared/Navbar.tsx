"use client";

import { LucideIcon, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarProps {
    userName: string;
    role: string;
    links?: {
        href: string;
        label: string;
        icon: LucideIcon;
    }[];
}

export default function Navbar({ userName, role, links = [] }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button - visible below md breakpoint */}
                        {links.length > 0 && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        )}

                        <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-base md:text-lg">LMS</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg md:text-xl font-bold text-gray-900">NextLMS</h1>
                            <p className="text-xs text-gray-600 capitalize">{role} Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500 capitalize">{role}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay - visible below md breakpoint */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg px-4 py-4 animate-in slide-in-from-top-2">
                    <div className="flex flex-col space-y-2">
                        {/* User Info for Mobile */}
                        <div className="mb-4 pb-4 border-b border-gray-100 sm:hidden">
                            <p className="text-sm font-medium text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500 capitalize">{role}</p>
                        </div>

                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href ||
                                (link.href !== "/admin" && link.href !== "/teacher" && link.href !== "/student" && pathname.startsWith(link.href));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        isActive
                                            ? "bg-primary text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
