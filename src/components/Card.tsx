import type { JSX } from "react"
import type { CardType } from "../../types"
import { useDraggable } from '@dnd-kit/core'



type CardProps = {
    card: CardType
}


export default function Card({ card }: CardProps): JSX.Element {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: card.id
    })

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer" ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}>
            {card.tags && card.tags.length > 0 && (
                <div className="flex gap-1 mb-2">
                    {card.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-gray-200">{tag}</span>
                    ))}
                </div>
            )}
            <p className="font-medium">{card.title}</p>
            {card.progress !== undefined && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${card.progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{card.progress}%</p>
                </div>
            )}
            {card.avatars && (
                <div className="flex -space-x-2 mt-3">
                    {card.avatars.map((avatar, i) => (
                        <img key={i} src={avatar} alt="avatar" className="w-6 h-6 rounded-full border-2 border-white" />
                    ))}
                </div>
            )}
        </div>
    )
}