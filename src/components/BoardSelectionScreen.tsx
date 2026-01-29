export const BoardSelectionScreen = ({
    boards,
    onCreateBoard,
    onSelectBoard,
    user
}: {
    boards: any[];
    onCreateBoard: () => void;
    onSelectBoard: (id: string) => void;
    user: any;
}) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Kanban Boards</h1>
                        <p className="text-gray-600 mt-2">Select a board or create a new one</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create Board Card */}
                <div
                    onClick={onCreateBoard}
                    className="group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 group-hover:text-blue-500">
                        <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-4 transition">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg">Create New Board</h3>
                        <p className="text-sm mt-2 text-center">Start organizing your projects</p>
                    </div>
                </div>

                {/* Existing Boards */}
                {boards.map(board => (
                    <div
                        key={board.id}
                        onClick={() => onSelectBoard(board.id)}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600">
                                    {board.title}
                                </h3>
                                {board.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                        {board.description}
                                    </p>
                                )}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${board.is_public ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {board.is_public ? 'Public' : 'Private'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-500">You</span>
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-blue-500 transition">
                                Click to open →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {boards.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No boards yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Create your first board to start organizing tasks and projects in a visual way.
                    </p>
                    <button
                        onClick={onCreateBoard}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                    >
                        Create Your First Board
                    </button>
                </div>
            )}
        </div>
    </div>
);
