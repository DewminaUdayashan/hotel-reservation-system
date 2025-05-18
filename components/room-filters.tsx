"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { roomTypes } from "@/lib/data"

type RoomFiltersProps = {
  onFilter?: () => void
  className?: string
  showPriceFilter?: boolean
  compact?: boolean
}

export function RoomFilters({ onFilter, className, showPriceFilter = true, compact = false }: RoomFiltersProps) {
const filters = useStore((state) => state.filters)
const setFilters = useStore((state) => state.setFilters)
const clearFilters = useStore((state) => state.clearFilters)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: filters.checkIn,
    to: filters.checkOut,
  })

  const [priceRange, setPriceRange] = useState<number[]>([100, 400])
  const [activeFilters, setActiveFilters] = useState(0)

  // Update local state when global filters change
  useEffect(() => {
    setDateRange({
      from: filters.checkIn,
      to: filters.checkOut,
    })
  }, [filters.checkIn, filters.checkOut])

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.checkIn && filters.checkOut) count++
    if (filters.roomType) count++
    if (filters.guests) count++
    setActiveFilters(count)
  }, [filters])

  // Handle date selection
  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    if (range.from && range.to) {
      setFilters({
        checkIn: range.from,
        checkOut: range.to,
      })
    }
  }

  // Handle room type selection
  const handleRoomTypeChange = (value: string) => {
    setFilters({ roomType: value })
  }

  // Handle guests selection
  const handleGuestsChange = (value: string) => {
    setFilters({ guests: value })
  }

  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
  }

  // Handle filter application
  const handleApplyFilters = () => {
    // In a real app, we might apply price filters here too
    if (onFilter) onFilter()
  }

  // Handle filter reset
  const handleResetFilters = () => {
    clearFilters()
    setPriceRange([100, 400])
  }

  // Check if search button should be enabled
  const isSearchEnabled = !!(filters.checkIn && filters.checkOut)

  return (
    <div className={cn("bg-background rounded-lg border p-4", className)}>
      <div className={cn("flex flex-col gap-4", compact ? "md:flex-row md:items-end" : "")}>
        {/* Date Range */}
        <div className={cn("flex-1", compact ? "md:max-w-[240px]" : "")}>
          <div className="font-medium mb-2">Stay Dates</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Select dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Room Type */}
        <div className={cn("flex-1", compact ? "md:max-w-[200px]" : "")}>
          <div className="font-medium mb-2">Room Type</div>
          <Select value={filters.roomType} onValueChange={handleRoomTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {roomTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guests */}
        <div className={cn("flex-1", compact ? "md:max-w-[180px]" : "")}>
          <div className="font-medium mb-2">Guests</div>
          <Select value={filters.guests} onValueChange={handleGuestsChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select guests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any number</SelectItem>
              <SelectItem value="1">1 Guest</SelectItem>
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="3">3 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
              <SelectItem value="5">5+ Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range (only shown when showPriceFilter is true) */}
        {showPriceFilter && !compact && (
          <div className="flex-1">
            <div className="font-medium mb-2">Price Range</div>
            <div className="px-2">
              <Slider
                defaultValue={[100, 400]}
                value={priceRange}
                onValueChange={handlePriceChange}
                min={50}
                max={500}
                step={10}
                className="my-6"
              />
              <div className="flex items-center justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className={cn("flex-1", compact ? "md:max-w-[120px]" : "")}>
          <Button className="w-full" onClick={handleApplyFilters} disabled={!isSearchEnabled}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.roomType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {roomTypes.find((t) => t.id === filters.roomType)?.name || filters.roomType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters({ roomType: undefined })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove room type filter</span>
              </Button>
            </Badge>
          )}
          {filters.guests && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.guests} {Number.parseInt(filters.guests) === 1 ? "Guest" : "Guests"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters({ guests: undefined })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove guests filter</span>
              </Button>
            </Badge>
          )}
          {filters.checkIn && filters.checkOut && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {format(filters.checkIn, "MMM d")} - {format(filters.checkOut, "MMM d")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters({ checkIn: undefined, checkOut: undefined })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove date filter</span>
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleResetFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
