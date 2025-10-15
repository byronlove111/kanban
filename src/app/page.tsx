'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, Plus, GripVertical, Trash2, Download, Upload, MoreVertical, ChevronRight } from 'lucide-react'
import { useState, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableCard({ card }: { card: any }) {
  const { openBoard, deleteCard } = useStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-border/40 bg-white group"
        onClick={() => openBoard(card.id)}
      >
        <CardContent className="p-4 flex items-start gap-3">
          <button
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-relaxed break-words">
              {card.title}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation()
                openBoard(card.id)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Supprimer cette carte ?')) deleteCard(card.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DroppableColumn({ column }: { column: any }) {
  const { cards, addCard, deleteColumn } = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const columnCards = column.cardIds.map((id: string) => cards[id]).filter(Boolean)

  const handleAdd = () => {
    if (title.trim()) {
      addCard(column.id, title.trim())
      setTitle('')
      inputRef.current?.focus()
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setTitle('')
  }

  return (
    <div className="flex flex-col h-full w-80 flex-shrink-0">
      <div 
        ref={setNodeRef}
        className={`bg-muted/30 rounded-xl p-4 flex flex-col h-full border transition-all duration-200 ${
          isOver ? 'border-primary bg-primary/5 shadow-lg' : 'border-border/40'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">
              {column.title}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
              {columnCards.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 hover:opacity-100 transition-opacity"
            onClick={() => {
              if (confirm('Supprimer cette colonne et toutes ses cartes ?')) deleteColumn(column.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Cards */}
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto space-y-0 min-h-[100px] pb-2 scrollbar-thin">
            {columnCards.map((card: any) => (
              <SortableCard key={card.id} card={card} />
            ))}
            {columnCards.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-border/40 rounded-lg">
                Glissez une carte ici
              </div>
            )}
          </div>
        </SortableContext>

        {/* Add Card */}
        {isAdding ? (
          <div className="mt-2 space-y-2">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la carte..."
              autoFocus
              className="bg-white border-border/60 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="flex-1">
                Ajouter
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground hover:bg-accent border-2 border-dashed border-transparent hover:border-border/40"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une carte
          </Button>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const {
    boards,
    columns,
    cards,
    currentBoardId,
    history,
    goBack,
    addColumn,
    moveCard,
    exportData,
    importData,
    reset,
  } = useStore()

  const [newColumnName, setNewColumnName] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentBoard = boards[currentBoardId]
  const boardColumns = currentBoard?.columnIds.map(id => columns[id]).filter(Boolean) || []

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Si on survole une colonne directement
    const overColumn = columns[overId]
    if (overColumn) {
      const activeCard = cards[activeId]
      if (activeCard && activeCard.columnId !== overId) {
        // Déplacer à la fin de la colonne
        moveCard(activeId, overId, overColumn.cardIds.length)
      }
      return
    }

    // Si on survole une carte
    const activeColumn = Object.values(columns).find(col => col.cardIds.includes(activeId))
    const overColumnFromCard = Object.values(columns).find(col => col.cardIds.includes(overId))

    if (activeColumn && overColumnFromCard) {
      const overIndex = overColumnFromCard.cardIds.indexOf(overId)
      if (activeColumn.id !== overColumnFromCard.id) {
        moveCard(activeId, overColumnFromCard.id, overIndex)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Si on drop sur une colonne
    const overColumn = columns[overId]
    if (overColumn) {
      const activeCard = cards[activeId]
      if (activeCard) {
        moveCard(activeId, overId, overColumn.cardIds.length)
      }
      return
    }

    // Si on drop sur une carte
    const activeColumn = Object.values(columns).find(col => col.cardIds.includes(activeId))
    const overColumnFromCard = Object.values(columns).find(col => col.cardIds.includes(overId))

    if (activeColumn && overColumnFromCard) {
      const overIndex = overColumnFromCard.cardIds.indexOf(overId)
      moveCard(activeId, overColumnFromCard.id, overIndex)
    }
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kanban-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      importData(content)
    }
    reader.readAsText(file)
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim())
      setNewColumnName('')
      setIsAddingColumn(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goBack}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentBoard?.title}</h1>
            {history.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Niveau {history.length + 1}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="hover:bg-accent">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Importer les données
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm('Réinitialiser toutes les données ? Cette action est irréversible.')) reset()
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Réinitialiser tout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {boardColumns.map((column) => (
              <DroppableColumn key={column.id} column={column} />
            ))}

            {/* Add Column */}
            {isAddingColumn ? (
              <div className="w-80 flex-shrink-0">
                <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Nom de la colonne..."
                    autoFocus
                    className="mb-3 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddColumn()
                      if (e.key === 'Escape') setIsAddingColumn(false)
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddColumn} className="flex-1">
                      Ajouter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingColumn(false)
                        setNewColumnName('')
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-80 flex-shrink-0">
                <Button
                  variant="outline"
                  className="w-full h-fit py-8 border-2 border-dashed border-border/60 hover:border-primary hover:bg-accent/50 transition-all"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une colonne
                </Button>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <Card className="w-80 shadow-2xl rotate-3 cursor-grabbing border-primary">
                <CardContent className="p-4 flex items-start gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium flex-1">
                    {cards[activeId]?.title}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  )
}
