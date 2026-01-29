export const Footer = ({ boardId }: { boardId: string | null }) => (
    <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
            <div className="py-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Kanban Board v1.0</span>
                    </div>
                    {boardId && (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                                ID: {boardId.substring(0, 8)}...
                            </code>
                        </div>
                    )}
                </div>


            </div>
        </div>
    </footer>
);
