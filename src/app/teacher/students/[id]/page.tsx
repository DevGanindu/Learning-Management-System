"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, User, MapPin, Phone, GraduationCap, Calendar,
    Users, Mail
} from "lucide-react";

interface StudentProfile {
    id: string;
    studentId: string;
    address: string | null;
    parentName: string | null;
    parentPhone: string | null;
    enrollmentDate: string;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    grade: {
        id: string;
        name: string;
        level: number;
    };
}

export default function TeacherStudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchStudent(params.id as string);
        }
    }, [params.id]);

    const fetchStudent = async (id: string) => {
        try {
            const res = await fetch(`/api/students/${id}/profile`);
            if (!res.ok) {
                throw new Error("Failed to fetch student");
            }
            const data = await res.json();
            setStudent(data);
        } catch (err) {
            setError("Student not found");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{error || "Student not found"}</p>
                <button onClick={() => router.back()} className="text-primary hover:underline mt-2">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Students</span>
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{student.user.name}</h1>
                        <p className="text-primary font-mono">{student.studentId}</p>
                        <p className="text-gray-600 text-sm mt-1">{student.grade.name}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Contact Information
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-900">{student.user.email}</p>
                            </div>
                        </div>
                        {student.user.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-gray-900">{student.user.phone}</p>
                                </div>
                            </div>
                        )}
                        {student.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-gray-900">{student.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Parent/Guardian
                    </h2>
                    <div className="space-y-4">
                        {student.parentName ? (
                            <>
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="text-gray-900">{student.parentName}</p>
                                    </div>
                                </div>
                                {student.parentPhone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="text-gray-900">{student.parentPhone}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">No parent information provided</p>
                        )}
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        Academic Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Grade</p>
                                <p className="text-gray-900">{student.grade.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Enrollment Date</p>
                                <p className="text-gray-900">
                                    {new Date(student.enrollmentDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
