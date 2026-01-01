import './index.css'
import Column from './components/Column'
import { useKanban } from './hooks/useKanban'
import type { JSX } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'


export default function App(): JSX.Element {
  const { data, addCard, moveCard } = useKanban()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeCardId = active.id as string
    const overColumnId = over.id as string

    moveCard(activeCardId, overColumnId)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-100 p-6 flex gap-6 overflow-x-auto justify-center items-center md:flex-row flex-col">
        {Object.values(data.columns).map(column => (
          <Column key={column.id} column={column} addCard={addCard} />
        ))}
      </div>
    </DndContext>
  )
}