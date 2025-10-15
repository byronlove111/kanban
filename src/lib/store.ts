'use client'

import { create } from 'zustand'
import { AppState, Board, Column, Card } from '@/types'

const STORAGE_KEY = 'kanban-data'

const getInitialState = (): AppState => {
  if (typeof window === 'undefined') return createDefaultState()
  
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load data')
    }
  }
  return createDefaultState()
}

function createDefaultState(): AppState {
  const boardId = 'root'
  const col1 = 'col-1'
  const col2 = 'col-2'
  const col3 = 'col-3'

  return {
    boards: {
      [boardId]: { id: boardId, title: 'Mes Projets', columnIds: [col1, col2, col3] }
    },
    columns: {
      [col1]: { id: col1, title: 'À Faire', boardId, cardIds: [] },
      [col2]: { id: col2, title: 'En Cours', boardId, cardIds: [] },
      [col3]: { id: col3, title: 'Terminé', boardId, cardIds: [] }
    },
    cards: {},
    currentBoardId: boardId,
    history: []
  }
}

const saveState = (state: AppState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export const useStore = create<AppState & {
  // Navigation
  openBoard: (cardId: string) => void
  goBack: () => void
  
  // Cards
  addCard: (columnId: string, title: string) => void
  deleteCard: (cardId: string) => void
  moveCard: (cardId: string, targetColumnId: string, newIndex: number) => void
  
  // Columns
  addColumn: (title: string) => void
  deleteColumn: (columnId: string) => void
  
  // Export/Import
  exportData: () => string
  importData: (json: string) => void
  reset: () => void
}>((set, get) => ({
  ...getInitialState(),

  openBoard: (cardId: string) => set((state) => {
    const card = state.cards[cardId]
    if (!card) return state

    let subBoardId = `board-${cardId}`
    
    if (!state.boards[subBoardId]) {
      const c1 = `col-${cardId}-1`
      const c2 = `col-${cardId}-2`
      const c3 = `col-${cardId}-3`

      const newState = {
        ...state,
        boards: {
          ...state.boards,
          [subBoardId]: {
            id: subBoardId,
            title: card.title,
            parentCardId: cardId,
            columnIds: [c1, c2, c3]
          }
        },
        columns: {
          ...state.columns,
          [c1]: { id: c1, title: 'À Faire', boardId: subBoardId, cardIds: [] },
          [c2]: { id: c2, title: 'En Cours', boardId: subBoardId, cardIds: [] },
          [c3]: { id: c3, title: 'Terminé', boardId: subBoardId, cardIds: [] }
        },
        currentBoardId: subBoardId,
        history: [...state.history, state.currentBoardId]
      }
      saveState(newState)
      return newState
    }

    const newState = {
      ...state,
      currentBoardId: subBoardId,
      history: [...state.history, state.currentBoardId]
    }
    saveState(newState)
    return newState
  }),

  goBack: () => set((state) => {
    if (state.history.length === 0) return state
    const newHistory = [...state.history]
    const prevBoard = newHistory.pop()!
    const newState = { ...state, currentBoardId: prevBoard, history: newHistory }
    saveState(newState)
    return newState
  }),

  addCard: (columnId: string, title: string) => set((state) => {
    const column = state.columns[columnId]
    if (!column) return state

    const id = generateId()
    const newState = {
      ...state,
      cards: {
        ...state.cards,
        [id]: {
          id,
          title,
          columnId,
          boardId: column.boardId,
          order: column.cardIds.length
        }
      },
      columns: {
        ...state.columns,
        [columnId]: { ...column, cardIds: [...column.cardIds, id] }
      }
    }
    saveState(newState)
    return newState
  }),

  deleteCard: (cardId: string) => set((state) => {
    const card = state.cards[cardId]
    if (!card) return state

    const column = state.columns[card.columnId]
    const { [cardId]: removed, ...restCards } = state.cards
    
    const newState = {
      ...state,
      cards: restCards,
      columns: {
        ...state.columns,
        [column.id]: {
          ...column,
          cardIds: column.cardIds.filter(id => id !== cardId)
        }
      }
    }
    saveState(newState)
    return newState
  }),

  moveCard: (cardId: string, targetColumnId: string, newIndex: number) => set((state) => {
    const card = state.cards[cardId]
    if (!card) return state

    const sourceColumn = state.columns[card.columnId]
    const targetColumn = state.columns[targetColumnId]

    const newSourceIds = sourceColumn.cardIds.filter(id => id !== cardId)
    const newTargetIds = targetColumn.id === sourceColumn.id 
      ? newSourceIds 
      : [...targetColumn.cardIds]
    
    newTargetIds.splice(newIndex, 0, cardId)

    const newState = {
      ...state,
      cards: {
        ...state.cards,
        [cardId]: { ...card, columnId: targetColumnId }
      },
      columns: {
        ...state.columns,
        [sourceColumn.id]: { ...sourceColumn, cardIds: newSourceIds },
        [targetColumn.id]: { ...targetColumn, cardIds: newTargetIds }
      }
    }
    saveState(newState)
    return newState
  }),

  addColumn: (title: string) => set((state) => {
    const board = state.boards[state.currentBoardId]
    if (!board) return state

    const id = generateId()
    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [id]: { id, title, boardId: board.id, cardIds: [] }
      },
      boards: {
        ...state.boards,
        [board.id]: { ...board, columnIds: [...board.columnIds, id] }
      }
    }
    saveState(newState)
    return newState
  }),

  deleteColumn: (columnId: string) => set((state) => {
    const column = state.columns[columnId]
    if (!column) return state

    const board = state.boards[column.boardId]
    const { [columnId]: removed, ...restColumns } = state.columns
    
    const newCards = { ...state.cards }
    column.cardIds.forEach(id => delete newCards[id])

    const newState = {
      ...state,
      columns: restColumns,
      cards: newCards,
      boards: {
        ...state.boards,
        [board.id]: {
          ...board,
          columnIds: board.columnIds.filter(id => id !== columnId)
        }
      }
    }
    saveState(newState)
    return newState
  }),

  exportData: () => {
    const state = get()
    return JSON.stringify({
      boards: state.boards,
      columns: state.columns,
      cards: state.cards,
      currentBoardId: state.currentBoardId,
      history: state.history,
      exportedAt: new Date().toISOString()
    }, null, 2)
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json)
      const newState = {
        boards: data.boards,
        columns: data.columns,
        cards: data.cards,
        currentBoardId: data.currentBoardId,
        history: data.history || []
      }
      saveState(newState)
      set(newState)
    } catch (e) {
      alert('Erreur lors de l\'import')
    }
  },

  reset: () => {
    const newState = createDefaultState()
    saveState(newState)
    set(newState)
  }
}))

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
