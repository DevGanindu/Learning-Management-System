"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, AlertCircle, Camera, Upload, User } from "lucide-react";
import Image from "next/image";

interface StudentData {
    grade: { name: string };
    isActive: boolean;
    lockedDueToPayment: boolean;
    payments: { status: string }[];
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
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        // Fetch dashboard data
        fetch("/api/student/dashboard")
            .then(res => res.json())
            .then(data => {
                setStudent(data.student);
                setUser(data.user);
                setMaterialsCount(data.materialsCount);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentPayment = student?.payments[0];

    return (
        <div className="px-2 sm:px-0">
            {/* Profile Section - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Profile Image */}
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                            />
                            {uploadingImage ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                        </label>
                    </div>

                    {/* Profile Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h1>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {student?.grade.name}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${student?.isActive && !student?.lockedDueToPayment
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {student?.isActive && !student?.lockedDueToPayment ? "Active" : "Locked"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Stats - Mobile Responsive Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                My Grade
                            </p>
                            <p className="text-xl sm:text-3xl font-bold text-gray-900">
                                {student?.grade.name}
                            </p>
                        </div>
                        <div className="bg-blue-500 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                Materials
                            </p>
                            <p className="text-xl sm:text-3xl font-bold text-gray-900">
                                {materialsCount}
                            </p>
                        </div>
                        <div className="bg-green-500 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Quick Access
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    <a
                        href="/student/materials"
                        className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all group active:scale-[0.98]"
                    >
                        <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-primary flex-shrink-0" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">
                            View My Materials
                        </span>
                    </a>
                    <a
                        href="/student/payments"
                        className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all group active:scale-[0.98]"
                    >
                        <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-primary flex-shrink-0" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">
                            View Payment History
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
