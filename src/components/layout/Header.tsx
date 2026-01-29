import { useState } from "react";


export const Header = ({
    user,
    currentBoard,
    columns,
    getCardsForColumn,
    onBack,
    onAddColumn,
    onLogout
}: {
    user: any;
    currentBoard: any;
    columns: any[];
    getCardsForColumn: (id: string) => any[];
    onBack: () => void;
    onAddColumn: () => void;
    onLogout: () => void;
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const totalCards = columns.reduce(
        (sum, col) => sum + getCardsForColumn(col.id).length,
        0
    );

    return (
        <header className="bg-white shadow-lg  ">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Boards</span>
                        </button>

                        <div className="flex-1 md:flex-none">
                            <h1 className="text-xl font-bold text-gray-900 truncate">
                                {currentBoard?.title || 'Loading...'}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{columns.length} columns</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{totalCards} cards</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-normal">
                        <button
                            onClick={onAddColumn}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Column
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-20 py-2">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-medium text-gray-900">Signed in as</p>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(user.email || '');
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy Email
                                            </button>

                                            <button
                                                onClick={() => {
                                                    window.open('https://app.supabase.com', '_blank');
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                </svg>
                                                Supabase Dashboard
                                            </button>
                                        </div>

                                        <div className="border-t pt-2">
                                            <button
                                                onClick={onLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
