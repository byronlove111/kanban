export type Card = {
  id: string
  title: string
  columnId: string
  boardId: string
  order: number
}

export type Column = {
  id: string
  title: string
  boardId: string
  cardIds: string[]
}

export type Board = {
  id: string
  title: string
  parentCardId?: string
  columnIds: string[]
}

export type AppState = {
  boards: Record<string, Board>
  columns: Record<string, Column>
  cards: Record<string, Card>
  currentBoardId: string
  history: string[]
}
