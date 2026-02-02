"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, User, MapPin, Phone, Users, GraduationCap, Search, Filter } from "lucide-react";

interface Registration {
    id: string;
    studentId: string;
    address: string | null;
    parentName: string | null;
    parentPhone: string | null;
    approvalStatus: string;
    enrollmentDate: string;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    grade: {
        name: string;
    };
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, [filter]);

    const fetchRegistrations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/registrations?status=${filter}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setRegistrations(data);
            }
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (studentId: string, action: "APPROVED" | "REJECTED") => {
        setProcessingId(studentId);
        try {
            const res = await fetch("/api/admin/registrations", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, action }),
            });

            if (res.ok) {
                // Remove from current list
                setRegistrations(prev => prev.filter(r => r.id !== studentId));
            }
        } catch (error) {
            console.error("Failed to process registration:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
    };

    return (
        <div className="px-2 sm:px-0">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Registrations</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Review and approve student registration requests
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or Student ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status === "PENDING" && <Clock className="w-4 h-4 inline mr-1" />}
                                {status === "APPROVED" && <CheckCircle className="w-4 h-4 inline mr-1" />}
                                {status === "REJECTED" && <XCircle className="w-4 h-4 inline mr-1" />}
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Registrations List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No {filter.toLowerCase()} registrations found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRegistrations.map((reg) => (
                        <div
                            key={reg.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                {/* Student Info */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{reg.user.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[reg.approvalStatus]}`}>
                                            {reg.approvalStatus}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">ID:</span>
                                            <span className="font-mono">{reg.studentId}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">Grade:</span>
                                            <span>{reg.grade.name}</span>
                                        </div>
                                        {reg.user.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{reg.user.phone}</span>
                                            </div>
                                        )}
                                        {reg.parentName && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">Parent:</span>
                                                <span>{reg.parentName}</span>
                                            </div>
                                        )}
                                    </div>

                                    {reg.address && (
                                        <div className="flex items-start gap-2 text-gray-600 text-sm mt-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span>{reg.address}</span>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-400 mt-3">
                                        Registered: {new Date(reg.enrollmentDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                {filter === "PENDING" && (
                                    <div className="flex gap-2 lg:flex-col">
                                        <button
                                            onClick={() => handleAction(reg.id, "APPROVED")}
                                            disabled={processingId === reg.id}
                                            className="flex-1 lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {processingId === reg.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(reg.id, "REJECTED")}
                                            disabled={processingId === reg.id}
                                            className="flex-1 lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
