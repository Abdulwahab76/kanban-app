export const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your boards...</p>
            <p className="text-sm text-gray-400 mt-2">Getting everything ready for you</p>
        </div>
    </div>
);

export const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-red-800">Something went wrong</p>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
            >
                Try Again
            </button>
        </div>
    </div>
);
