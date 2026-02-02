"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    User, MapPin, Phone, GraduationCap, Calendar,
    Users, Mail, Search, ChevronRight
} from "lucide-react";

interface Student {
    id: string;
    studentId: string;
    address: string | null;
    parentName: string | null;
    parentPhone: string | null;
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

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/teacher/students");
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by grade
    const studentsByGrade = filteredStudents.reduce((acc, student) => {
        const gradeName = student.grade.name;
        if (!acc[gradeName]) {
            acc[gradeName] = [];
        }
        acc[gradeName].push(student);
        return acc;
    }, {} as Record<string, Student[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Directory</h1>
                <p className="text-gray-600 mt-1">View student information and contact details</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, student ID, or grade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Students by Grade */}
            {Object.keys(studentsByGrade).length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No students found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(studentsByGrade)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([gradeName, gradeStudents]) => (
                            <div key={gradeName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-primary" />
                                        {gradeName}
                                        <span className="text-sm font-normal text-gray-500">
                                            ({gradeStudents.length} students)
                                        </span>
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {gradeStudents.map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/teacher/students/${student.id}`}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.user.name}</p>
                                                    <p className="text-sm text-gray-500 font-mono">{student.studentId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {student.user.phone && (
                                                    <span className="hidden sm:flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        {student.user.phone}
                                                    </span>
                                                )}
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
