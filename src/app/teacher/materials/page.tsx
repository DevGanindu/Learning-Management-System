"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Youtube, Video, Plus, Edit, Trash2, Download, ExternalLink, Filter } from "lucide-react";

interface Material {
    id: string;
    title: string;
    description: string | null;
    type: "PDF" | "DOC" | "YOUTUBE" | "ONLINE_CLASS";
    fileUrl: string | null;
    link: string | null;
    uploadedAt: string;
    grade: { name: string; level: number };
    uploader: { name: string };
}

interface Grade {
    id: string;
    name: string;
    level: number;
}

const TYPE_ICONS = {
    PDF: FileText,
    DOC: FileText,
    YOUTUBE: Youtube,
    ONLINE_CLASS: Video,
};

const TYPE_COLORS = {
    PDF: "bg-red-100 text-red-700",
    DOC: "bg-blue-100 text-blue-700",
    YOUTUBE: "bg-red-100 text-red-700",
    ONLINE_CLASS: "bg-green-100 text-green-700",
};

export default function TeacherMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
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
        if (selectedType !== "all") params.append("type", selectedType);

        fetch(`/api/materials?${params}`)
            .then(res => res.json())
            .then(data => {
                setMaterials(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [selectedGrade, selectedType]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setMaterials(prev => prev.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setDeleting(null);
        }
    };

    const getTypeStats = () => {
        return {
            PDF: materials.filter(m => m.type === "PDF").length,
            DOC: materials.filter(m => m.type === "DOC").length,
            YOUTUBE: materials.filter(m => m.type === "YOUTUBE").length,
            ONLINE_CLASS: materials.filter(m => m.type === "ONLINE_CLASS").length,
        };
    };

    const stats = getTypeStats();

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Materials</h1>
                    <p className="text-gray-600 mt-2">Manage your learning materials and uploads</p>
                </div>
                <Link
                    href="/teacher/materials/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Upload Material
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.PDF}</p>
                            <p className="text-sm text-gray-600">PDFs</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.DOC}</p>
                            <p className="text-sm text-gray-600">Documents</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Youtube className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.YOUTUBE}</p>
                            <p className="text-sm text-gray-600">YouTube</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Video className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.ONLINE_CLASS}</p>
                            <p className="text-sm text-gray-600">Classes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">All Grades</option>
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="PDF">PDF Documents</option>
                            <option value="DOC">Word Documents</option>
                            <option value="YOUTUBE">YouTube Videos</option>
                            <option value="ONLINE_CLASS">Online Classes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Loading materials...
                </div>
            ) : materials.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No materials found</p>
                    <Link
                        href="/teacher/materials/upload"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Upload Your First Material
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map(material => {
                        const Icon = TYPE_ICONS[material.type];
                        const colorClass = TYPE_COLORS[material.type];

                        return (
                            <div
                                key={material.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/teacher/materials/${material.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(material.id)}
                                            disabled={deleting === material.id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
                                {material.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {material.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {material.grade.name}
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(material.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {/* Action buttons based on type */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {material.fileUrl ? (
                                        <a
                                            href={material.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download File
                                        </a>
                                    ) : material.link ? (
                                        <a
                                            href={material.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open Link
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
