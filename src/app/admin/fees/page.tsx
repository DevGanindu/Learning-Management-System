"use client";

import { useState, useEffect } from "react";
import { DollarSign, Edit2, Save, X, GraduationCap } from "lucide-react";

interface Grade {
    id: string;
    name: string;
    level: number;
    monthlyFee: number;
}

export default function FeesManagementPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch grades on mount
    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const res = await fetch("/api/grades");
            const data = await res.json();
            if (Array.isArray(data)) {
                setGrades(data);
            }
        } catch (error) {
            console.error("Failed to fetch grades:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (grade: Grade) => {
        setEditingId(grade.id);
        setEditValue(grade.monthlyFee.toString());
        setMessage(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveGradeFee = async (gradeId: string) => {
        const newFee = parseFloat(editValue);
        if (isNaN(newFee) || newFee < 0) {
            setMessage({ type: "error", text: "Please enter a valid fee amount" });
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch("/api/grades", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gradeId, monthlyFee: newFee }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setGrades(prev => prev.map(g => 
                    g.id === gradeId ? { ...g, monthlyFee: newFee } : g
                ));
                setEditingId(null);
                setEditValue("");
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update fee" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update fee" });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Class Fee Management</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Set and manage monthly fees for each grade level
                </p>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {/* Fees Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-gray-900">Grade Fees</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        These fees will be applied when generating monthly payments for students
                    </p>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading grades...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Monthly Fee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <GraduationCap className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {grade.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Level {grade.level}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === grade.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Rs.</span>
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        min="0"
                                                        step="100"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        Rs. {grade.monthlyFee.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === grade.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => saveGradeFee(grade.id)}
                                                        disabled={updating}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {updating ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        disabled={updating}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(grade)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit Fee
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">How fees work</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Each grade can have a different monthly fee</li>
                    <li>• When a new student is approved, their first payment is created with their grade&apos;s fee</li>
                    <li>• When you generate monthly payments, each student gets their grade-specific fee</li>
                    <li>• Changing a fee will automatically update all <strong>unpaid</strong> payments for that grade</li>
                    <li>• Already paid payments will not be affected</li>
                </ul>
            </div>
        </div>
    );
}
