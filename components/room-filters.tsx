"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRoomTypes } from "@/hooks/rooms/rooms";
import { DateRangePicker } from "./shared/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoomFilterStore } from "@/lib/stores/useRoomFilterStore";

type RoomFiltersProps = {
  onFilter?: () => void;
  className?: string;
  showPriceFilter?: boolean;
  compact?: boolean;
};

export function RoomFilters({
  onFilter,
  className,
  showPriceFilter = true,
  compact = false,
}: RoomFiltersProps) {
  const { data: roomTypes } = useRoomTypes();

  const filters = useRoomFilterStore((state) => state.filters);
  const setFilters = useRoomFilterStore((state) => state.setFilters);
  const clearFilters = useRoomFilterStore((state) => state.clearFilters);

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.checkIn,
    to: filters.checkOut,
  });

  const [priceRange, setPriceRange] = useState<number[] | undefined>(
    filters.minPrice !== undefined && filters.maxPrice !== undefined
      ? [filters.minPrice, filters.maxPrice]
      : undefined
  );

  const [localFilters, setLocalFilters] = useState({
    roomType: filters.roomType,
    capacity: filters.capacity,
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    setActiveFilters(
      [
        localFilters.checkIn && localFilters.checkOut,
        localFilters.roomType,
        localFilters.capacity,
        localFilters.minPrice !== undefined &&
          localFilters.maxPrice !== undefined,
      ].filter(Boolean).length
    );
  }, [localFilters]);

  const handleDateSelect = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    setDateRange(range);
    setLocalFilters((prev) => ({
      ...prev,
      checkIn: range.from,
      checkOut: range.to,
    }));
  };

  const handleRoomTypeChange = (value: string) => {
    const type = roomTypes?.find((t) => t.id === Number.parseInt(value));
    setLocalFilters((prev) => ({
      ...prev,
      roomType: type,
    }));
  };

  const handleGuestsChange = (value: string) => {
    const guests = value === "any" ? undefined : Number(value);
    setLocalFilters((prev) => ({
      ...prev,
      capacity: guests,
    }));
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  };

  const handleApplyFilters = () => {
    setFilters({ ...localFilters });
    if (onFilter) onFilter();
  };

  const handleResetFilters = () => {
    clearFilters();
    setDateRange({ from: undefined, to: undefined });
    setPriceRange(undefined);
    setLocalFilters({
      roomType: undefined,
      capacity: undefined,
      checkIn: undefined,
      checkOut: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const isSearchEnabled =
    !!localFilters.checkIn ||
    !!localFilters.checkOut ||
    !!localFilters.roomType ||
    !!localFilters.capacity ||
    (localFilters.minPrice !== undefined &&
      localFilters.maxPrice !== undefined);

  return (
    <div className={cn("bg-background rounded-lg border p-4", className)}>
      <div
        className={cn(
          "flex flex-col gap-4",
          compact ? "md:flex-row md:items-end" : ""
        )}
      >
        {/* Date Range */}
        <div className={cn("flex-1", compact ? "md:max-w-[240px]" : "")}>
          <div className="font-medium mb-2">Stay Dates</div>
          <DateRangePicker
            dateRange={dateRange}
            onSelect={(range) =>
              handleDateSelect({
                from: range.from,
                to: range.to,
              })
            }
          />
        </div>

        {/* Room Type */}
        <div className={cn("flex-1", compact ? "md:max-w-[200px]" : "")}>
          <div className="font-medium mb-2">Room Type</div>
          <Select
            value={localFilters.roomType?.id?.toString()}
            onValueChange={handleRoomTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {roomTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guests */}
        <div className={cn("flex-1", compact ? "md:max-w-[180px]" : "")}>
          <div className="font-medium mb-2">Guests</div>
          <Select
            value={localFilters.capacity?.toString()}
            onValueChange={handleGuestsChange}
          >
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

        {/* Price Range */}
        {showPriceFilter && !compact && (
          <div className="flex-1">
            <div className="font-medium mb-2">Price Range</div>
            <div className="px-2">
              <Slider
                value={priceRange ?? [0, 0]}
                onValueChange={handlePriceChange}
                min={50}
                max={500}
                step={10}
                className="my-6"
                draggable
              />
              {priceRange && (
                <div className="flex items-center justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className={cn("flex-1", compact ? "md:max-w-[120px]" : "")}>
          <Button
            className="w-full"
            onClick={handleApplyFilters}
            disabled={!isSearchEnabled}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {localFilters.roomType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {roomTypes?.find((t) => t.id === localFilters.roomType!.id)?.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, roomType: undefined }))
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {localFilters.capacity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {localFilters.capacity}{" "}
              {localFilters.capacity === 1 ? "Guest" : "Guests"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, capacity: undefined }))
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {localFilters.checkIn && localFilters.checkOut && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {format(localFilters.checkIn, "MMM d")} -{" "}
              {format(localFilters.checkOut, "MMM d")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    checkIn: undefined,
                    checkOut: undefined,
                  }))
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleResetFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
