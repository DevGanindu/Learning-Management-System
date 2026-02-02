"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, User, MapPin, Phone, GraduationCap, Calendar,
    Users, CheckCircle, XCircle, Clock, Mail, CreditCard
} from "lucide-react";

interface StudentProfile {
    id: string;
    studentId: string;
    address: string | null;
    parentName: string | null;
    parentPhone: string | null;
    approvalStatus: string;
    enrollmentDate: string;
    isActive: boolean;
    lockedDueToPayment: boolean;
    user: {
        name: string;
        email: string;
        phone: string | null;
        profileImage: string | null;
    };
    grade: {
        id: string;
        name: string;
        level: number;
    };
    payments: {
        id: string;
        month: number;
        year: number;
        amount: number;
        status: string;
        paidDate: string | null;
    }[];
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function StudentProfilePage() {
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
                <Link href="/admin/students" className="text-primary hover:underline mt-2 inline-block">
                    Back to Students
                </Link>
            </div>
        );
    }

    const statusBadge = {
        APPROVED: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
        PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
        REJECTED: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    }[student.approvalStatus] || { bg: "bg-gray-100", text: "text-gray-800", icon: Clock };

    const StatusIcon = statusBadge.icon;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {student.user.profileImage ? (
                            <img
                                src={student.user.profileImage}
                                alt={student.user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-10 h-10 text-primary" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{student.user.name}</h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {student.approvalStatus}
                            </span>
                        </div>
                        <p className="text-lg font-mono text-primary">{student.studentId}</p>
                        <p className="text-gray-600 mt-1">{student.grade.name}</p>
                    </div>

                    {/* Account Status */}
                    <div className="text-right">
                        {student.lockedDueToPayment && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                <XCircle className="w-4 h-4" />
                                Payment Locked
                            </span>
                        )}
                        {!student.isActive && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                Inactive
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        Parent/Guardian Information
                    </h2>
                    <div className="space-y-4">
                        {student.parentName ? (
                            <>
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Parent Name</p>
                                        <p className="text-gray-900">{student.parentName}</p>
                                    </div>
                                </div>
                                {student.parentPhone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Parent Phone</p>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        Academic Information
                    </h2>
                    <div className="space-y-4">
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

                {/* Recent Payments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        Recent Payments
                    </h2>
                    {student.payments.length > 0 ? (
                        <div className="space-y-3">
                            {student.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {MONTHS[payment.month - 1]} {payment.year}
                                        </p>
                                        <p className="text-sm text-gray-500">Rs. {payment.amount.toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.status === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {payment.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No payment records</p>
                    )}
                </div>
            </div>
        </div>
    );
}
