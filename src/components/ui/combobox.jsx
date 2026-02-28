"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Combobox({ options, value, onChange, placeholder, emptyText, pageSize = 10 }) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filterText = (s) => (s || "").toString().toLowerCase()

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    const needle = filterText(searchTerm)
    return options.filter((option) => {
      const hay = filterText(`${option.label ?? ""} ${option.value ?? ""}`)
      return hay.includes(needle)
    })
  }, [options, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageItems = filteredOptions.slice(pageStart, pageStart + pageSize)

  React.useEffect(() => {
    // reset page when search changes
    setPage(1)
  }, [searchTerm])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-9 text-sm"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder || "Selecione..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-80 overflow-y-auto">
        <Command>
          <CommandInput
            placeholder={placeholder || "Pesquisar..."}
            value={searchTerm}
            onValueChange={(v) => setSearchTerm(v)}
            className="h-8 text-sm"
          />
          <CommandEmpty>{emptyText || "Nenhum item encontrado."}</CommandEmpty>
          <CommandGroup>
            {pageItems.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {filteredOptions.length > pageSize && (
            <div className="flex items-center justify-between px-2 py-2 border-t bg-white sticky bottom-0">
              <button
                className="text-xs px-2 py-1 rounded border disabled:opacity-50"
                onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="text-xs px-2 py-1 rounded border disabled:opacity-50"
                onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}