"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Plus, Edit, Trash2, ExternalLink, Filter, Calendar } from "lucide-react";

interface ClassLink {
    id: string;
    title: string;
    description: string | null;
    link: string;
    uploadedAt: string;
    grade: { name: string; level: number };
    uploader: { name: string };
}

interface Grade {
    id: string;
    name: string;
    level: number;
}

const PLATFORM_COLORS: Record<string, string> = {
    ZOOM: "bg-blue-100 text-blue-700",
    TEAMS: "bg-purple-100 text-purple-700",
    MEET: "bg-green-100 text-green-700",
    OTHER: "bg-gray-100 text-gray-700",
};

function extractPlatform(description: string | null): string {
    if (!description) return "OTHER";
    const match = description.match(/^\[(\w+)\]/);
    return match ? match[1] : "OTHER";
}

function cleanDescription(description: string | null): string {
    if (!description) return "";
    return description.replace(/^\[\w+\]\s*/, "");
}

export default function TeacherClassesPage() {
    const [classes, setClasses] = useState<ClassLink[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/grades")
            .then(res => res.json())
            .then(data => setGrades(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams({ teacherOnly: "true" });
        if (selectedGrade !== "all") params.append("gradeId", selectedGrade);

        fetch(`/api/classes?${params}`)
            .then(res => res.json())
            .then(data => {
                setClasses(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [selectedGrade]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class link?")) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setClasses(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setDeleting(null);
        }
    };

    const gradeStats = grades.map(grade => ({
        ...grade,
        count: classes.filter(c => c.grade.name === grade.name).length,
    }));

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Online Classes</h1>
                    <p className="text-gray-600 mt-2">Manage your online class links (Zoom, Teams, Meet)</p>
                </div>
                <Link
                    href="/teacher/classes/add"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add Class Link
                </Link>
            </div>

            {/* Grade Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {gradeStats.map(grade => (
                    <button
                        key={grade.id}
                        onClick={() => setSelectedGrade(grade.id)}
                        className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all text-left ${selectedGrade === grade.id
                                ? "border-primary bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-2xl font-bold text-gray-900">{grade.count}</p>
                        <p className="text-sm text-gray-600">{grade.name}</p>
                    </button>
                ))}
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Filter by Grade</h2>
                </div>
                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="all">All Grades</option>
                    {grades.map(grade => (
                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                </select>
            </div>

            {/* Classes Grid */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Loading classes...
                </div>
            ) : classes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No online classes found</p>
                    <Link
                        href="/teacher/classes/add"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Your First Class
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(classLink => {
                        const platform = extractPlatform(classLink.description);
                        const desc = cleanDescription(classLink.description);

                        return (
                            <div
                                key={classLink.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <Video className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${PLATFORM_COLORS[platform]}`}>
                                            {platform}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/teacher/classes/${classLink.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(classLink.id)}
                                            disabled={deleting === classLink.id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{classLink.title}</h3>
                                {desc && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{desc}</p>
                                )}
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {classLink.grade.name}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(classLink.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <a
                                    href={classLink.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Join Class
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
