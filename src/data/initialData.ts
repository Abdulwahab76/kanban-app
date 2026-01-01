import type { KanbanData } from "../../types";



export const initialData: KanbanData = {
    columns: {
        todo: {
            id: 'todo',
            title: 'To Do',
            cards: [
                { id: '1', title: 'UI/UX Design in the age of AI', progress: 0, tags: ['Important'], avatars: ['https://i.pravatar.cc/32?img=1', 'https://i.pravatar.cc/32?img=2'] },
                { id: '2', title: 'Responsive Website Design', progress: 0, tags: ['Meh'], avatars: ['https://i.pravatar.cc/32?img=3'] },
            ],
        },
        doing: {
            id: 'doing',
            title: 'In Progress',
            cards: [
                { id: '3', title: 'Machine Learning Progress', progress: 52, tags: ['Important'], avatars: ['https://i.pravatar.cc/32?img=1', 'https://i.pravatar.cc/32?img=2'] },
            ],
        },
        done: {
            id: 'done',
            title: 'Completed',
            cards: [
                { id: '4', title: 'User flow confirmation for fintech App', progress: 100, tags: ['Important'], avatars: ['https://i.pravatar.cc/32?img=1', 'https://i.pravatar.cc/32?img=2'] },
            ],
        },
    },
}