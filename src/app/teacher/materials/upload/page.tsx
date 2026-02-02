"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Youtube, Video, Loader2, X } from "lucide-react";

interface Grade {
    id: string;
    name: string;
    level: number;
}

type MaterialType = "PDF" | "DOC" | "YOUTUBE" | "ONLINE_CLASS";

export default function UploadMaterialPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [grades, setGrades] = useState<Grade[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<MaterialType>("PDF");
    const [gradeId, setGradeId] = useState("");
    const [link, setLink] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState("");

    useEffect(() => {
        fetch("/api/grades")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch grades");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setGrades(data);
                } else {
                    console.error("Grades response is not an array:", data);
                }
            })
            .catch(console.error);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!validTypes.includes(file.type)) {
                setError("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
                return;
            }
            setSelectedFile(file);
            setError("");
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return null;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await res.json();
            setUploadedFileUrl(data.fileUrl);
            return data.fileUrl;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            let fileUrl = uploadedFileUrl;

            // Upload file if selected and not already uploaded
            if ((type === "PDF" || type === "DOC") && selectedFile && !uploadedFileUrl) {
                fileUrl = await uploadFile();
                if (!fileUrl) {
                    setIsSubmitting(false);
                    return;
                }
            }

            // Validate required fields
            if (!title.trim()) {
                setError("Title is required");
                setIsSubmitting(false);
                return;
            }

            if (!gradeId) {
                setError("Please select a grade");
                setIsSubmitting(false);
                return;
            }

            if ((type === "YOUTUBE" || type === "ONLINE_CLASS") && !link.trim()) {
                setError("Link is required for this type");
                setIsSubmitting(false);
                return;
            }

            if ((type === "PDF" || type === "DOC") && !fileUrl) {
                setError("Please upload a file");
                setIsSubmitting(false);
                return;
            }

            // Create material
            const res = await fetch("/api/materials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    gradeId,
                    fileUrl: (type === "PDF" || type === "DOC") ? fileUrl : undefined,
                    link: (type === "YOUTUBE" || type === "ONLINE_CLASS") ? link : undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create material");
            }

            router.push("/teacher/materials");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = [
        { value: "PDF", label: "PDF Document", icon: FileText, color: "text-red-600" },
        { value: "DOC", label: "Word Document", icon: FileText, color: "text-blue-600" },
        { value: "YOUTUBE", label: "YouTube Video", icon: Youtube, color: "text-red-600" },
        { value: "ONLINE_CLASS", label: "Online Class Link", icon: Video, color: "text-green-600" },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/teacher/materials"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Materials
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Upload Material</h1>
                <p className="text-gray-600 mt-2">Add a new learning material for students</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Material Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Material Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {typeOptions.map(option => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setType(option.value as MaterialType);
                                        setSelectedFile(null);
                                        setUploadedFileUrl("");
                                        setLink("");
                                    }}
                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${type === option.value
                                        ? "border-primary bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${option.color}`} />
                                    <span className="font-medium text-gray-900">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter material title"
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Optional description"
                    />
                </div>

                {/* Grade */}
                <div className="mb-6">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                        Grade *
                    </label>
                    <select
                        id="grade"
                        value={gradeId}
                        onChange={(e) => setGradeId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    >
                        {grades.length === 0 ? (
                            <option value="">Loading grades...</option>
                        ) : (
                            <>
                                <option value="">Select a grade...</option>
                                {grades.map(grade => (
                                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                {/* File Upload (for PDF/DOC) */}
                {(type === "PDF" || type === "DOC") && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File *
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {selectedFile ? (
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setUploadedFileUrl("");
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
                            >
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-600">Click to select a file</p>
                                <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (max 10MB)</p>
                            </button>
                        )}
                    </div>
                )}

                {/* Link (for YouTube/Online Class) */}
                {(type === "YOUTUBE" || type === "ONLINE_CLASS") && (
                    <div className="mb-6">
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                            {type === "YOUTUBE" ? "YouTube URL *" : "Meeting Link *"}
                        </label>
                        <input
                            id="link"
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={type === "YOUTUBE" ? "https://youtube.com/..." : "https://zoom.us/..."}
                            required
                        />
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <Link
                        href="/teacher/materials"
                        className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Upload Material"}
                    </button>
                </div>
            </form>
        </div>
    );
}
