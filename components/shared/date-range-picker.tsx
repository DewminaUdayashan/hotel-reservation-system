import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";

type Props = {
  dateRange?: DateRange;
  onSelect: (dateRange: DateRange) => void;
  popOverTrigger?: React.ReactNode;
};

export const DateRangePicker = ({
  dateRange,
  onSelect,
  popOverTrigger,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {popOverTrigger ?? (
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d, yyyy")} -{" "}
                  {format(dateRange.to, "MMM d, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              <span>Select dates</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(dateRange) => {
            onSelect({
              from: dateRange?.from,
              to: dateRange?.to,
            });
          }}
          numberOfMonths={2}
          disabled={(date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  );
};
