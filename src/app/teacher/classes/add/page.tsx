"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video, Loader2 } from "lucide-react";

interface Grade {
    id: string;
    name: string;
    level: number;
}

type Platform = "ZOOM" | "TEAMS" | "MEET" | "OTHER";

export default function AddClassPage() {
    const router = useRouter();

    const [grades, setGrades] = useState<Grade[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [platform, setPlatform] = useState<Platform>("ZOOM");
    const [link, setLink] = useState("");
    const [gradeId, setGradeId] = useState("");

    useEffect(() => {
        fetch("/api/grades")
            .then(res => res.json())
            .then(data => {
                setGrades(data);
                if (data.length > 0) setGradeId(data[0].id);
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (!title.trim()) {
                setError("Title is required");
                setIsSubmitting(false);
                return;
            }

            if (!link.trim()) {
                setError("Meeting link is required");
                setIsSubmitting(false);
                return;
            }

            if (!gradeId) {
                setError("Please select a grade");
                setIsSubmitting(false);
                return;
            }

            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    platform,
                    link,
                    gradeId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to add class");
            }

            router.push("/teacher/classes");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const platformOptions = [
        { value: "ZOOM", label: "Zoom", color: "bg-blue-100 text-blue-700 border-blue-200" },
        { value: "TEAMS", label: "Microsoft Teams", color: "bg-purple-100 text-purple-700 border-purple-200" },
        { value: "MEET", label: "Google Meet", color: "bg-green-100 text-green-700 border-green-200" },
        { value: "OTHER", label: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/teacher/classes"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Classes
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Add Online Class</h1>
                <p className="text-gray-600 mt-2">Add a new online class link for students</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Platform Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Platform
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {platformOptions.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setPlatform(option.value as Platform)}
                                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${platform === option.value
                                        ? `${option.color} border-current`
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <Video className="w-5 h-5" />
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Class Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Weekly Math Class"
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
                        placeholder="Schedule or additional notes..."
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
                        {grades.map(grade => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                    </select>
                </div>

                {/* Meeting Link */}
                <div className="mb-6">
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Link *
                    </label>
                    <input
                        id="link"
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={
                            platform === "ZOOM" ? "https://zoom.us/j/..." :
                                platform === "TEAMS" ? "https://teams.microsoft.com/..." :
                                    platform === "MEET" ? "https://meet.google.com/..." :
                                        "https://..."
                        }
                        required
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Link
                        href="/teacher/classes"
                        className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Adding..." : "Add Class"}
                    </button>
                </div>
            </form>
        </div>
    );
}
