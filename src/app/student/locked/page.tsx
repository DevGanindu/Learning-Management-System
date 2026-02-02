import { AlertCircle, Lock } from "lucide-react";

export default function StudentLockedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Account Locked
                    </h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-red-900 mb-1">
                                    Payment Due
                                </p>
                                <p className="text-sm text-red-700">
                                    Your account has been locked due to unpaid monthly fees. Please contact the administrator to resolve this issue and unlock your account.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>
                            <strong>What to do:</strong>
                        </p>
                        <ol className="text-left list-decimal list-inside space-y-1">
                            <li>Contact the administrator</li>
                            <li>Complete your monthly payment</li>
                            <li>Your account will be automatically unlocked</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
