// import type { JSX } from 'react'
// import type { ColumnType } from '../../types'
// import Column from './Column'
// import { useKanban } from '../hooks/useKanban'


// type BoardProps = {
//     columns: Record<string, ColumnType>
//     moveCard: (fromCol: string, toCol: string, cardId: string) => void
// }


// export default function Board({ columns }: BoardProps): JSX.Element {
//     const { data, addCard } = useKanban()

//     return (
//         <div className="board">
//             {Object.values(data).map(col => (
//                 <Column key={col.id} column={col} addCard={addCard} />
//             ))}
//         </div>
//     )
// }