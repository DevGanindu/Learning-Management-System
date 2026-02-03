"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, AlertCircle, Camera, User, Video, DollarSign, Bell, Sparkles, ArrowRight, Clock, Calendar } from "lucide-react";
import Link from "next/link";

interface StudentData {
    grade: { name: string };
    isActive: boolean;
    lockedDueToPayment: boolean;
    payments: { status: string; month: number; year: number; dueDate: string }[];
}

interface UserData {
    name: string;
    email: string;
    profileImage: string | null;
}

export default function StudentDashboard() {
    const [student, setStudent] = useState<StudentData | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [materialsCount, setMaterialsCount] = useState(0);
    const [classesCount, setClassesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [greeting, setGreeting] = useState("Hello");

    useEffect(() => {
        // Set greeting based on time of day
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Fetch dashboard data
        fetch("/api/student/dashboard")
            .then(res => res.json())
            .then(data => {
                setStudent(data.student);
                setUser(data.user);
                setMaterialsCount(data.materialsCount);
                setClassesCount(data.classesCount || 0);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success && user) {
                setUser({ ...user, profileImage: data.imageUrl });
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
        } finally {
            setUploadingImage(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const currentPayment = student?.payments[0];
    const isPaid = currentPayment?.status === "PAID";
    const firstName = user?.name?.split(" ")[0] || "Student";

    return (
        <div className="pb-6">
            {/* Welcome Header - Gradient Background */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-28 mb-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative">
                    <div className="flex items-center gap-1 text-blue-100 text-sm mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>{greeting}!</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{firstName} 👋</h1>
                    <p className="text-blue-100 text-sm md:text-base">Ready to learn something new today?</p>
                </div>
            </div>

            {/* Profile Card - Overlapping Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 -mt-20 mx-2 md:mx-0 relative z-10 mb-6">
                <div className="flex items-center gap-4">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                    <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                            />
                            {uploadingImage ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-3.5 h-3.5" />
                            )}
                        </label>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-gray-900 text-lg truncate">{user?.name}</h2>
                        <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                {student?.grade.name}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${
                                student?.isActive && !student?.lockedDueToPayment
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    student?.isActive && !student?.lockedDueToPayment ? "bg-green-500" : "bg-red-500"
                                }`}></span>
                                {student?.isActive && !student?.lockedDueToPayment ? "Active" : "Locked"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mx-2 md:mx-0 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-500">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{materialsCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Study Materials</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Video className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-500">Scheduled</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{classesCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Online Classes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${isPaid ? "bg-green-100" : "bg-amber-100"}`}>
                            <DollarSign className={`w-5 h-5 ${isPaid ? "text-green-600" : "text-amber-600"}`} />
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                            {isPaid ? "Paid" : "Pending"}
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                        {currentPayment ? `${new Date(0, currentPayment.month - 1).toLocaleString('default', { month: 'short' })} ${currentPayment.year}` : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">This Month</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{student?.grade.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Current Grade</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mx-2 md:mx-0">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>Quick Actions</span>
                   
                </h3>
                <div className="space-y-3">
                    <Link
                        href="/student/materials"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
                    >
                        <div className="bg-white/20 p-3 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">My Materials</p>
                            <p className="text-blue-100 text-sm">Access your study resources</p>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/student/classes"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white hover:from-green-600 hover:to-emerald-700 transition-all active:scale-[0.98] shadow-md shadow-green-500/20"
                    >
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Video className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Online Classes</p>
                            <p className="text-green-100 text-sm">Join live classes</p>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/student/payments"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white hover:from-purple-600 hover:to-indigo-700 transition-all active:scale-[0.98] shadow-md shadow-purple-500/20"
                    >
                        <div className="bg-white/20 p-3 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Payment History</p>
                            <p className="text-purple-100 text-sm">View your payment records</p>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
