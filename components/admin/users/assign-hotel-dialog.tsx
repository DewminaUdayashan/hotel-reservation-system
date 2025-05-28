import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllHotels } from "@/hooks/hotels/hotels";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAssignUserToHotel } from "@/hooks/users/users.admin";
import { toast } from "@/hooks/use-toast";

type AssignHotelDialogProps = {
  userId: number;
  currentHotelId?: number;
  trigger: React.ReactNode;
  onAssigned?: () => void;
  disabled?: boolean;
};

export const AssignHotelDialog = ({
  userId,
  currentHotelId,
  trigger,
  onAssigned,
  disabled,
}: AssignHotelDialogProps) => {
  const { data: hotels } = useAllHotels();
  const [selectedHotelId, setSelectedHotelId] = useState<string | undefined>(
    currentHotelId?.toString()
  );
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  const assignHotel = useAssignUserToHotel();

  const handleAssign = async () => {
    if (!selectedHotelId) {
      setValidationError("Please select a hotel before assigning.");
      return;
    }

    assignHotel.mutate(
      {
        userId,
        hotelId: Number(selectedHotelId),
      },
      {
        onSuccess: () => {
          toast({
            title: "User assigned",
            description: "User has been successfully assigned to the hotel.",
          });
          setValidationError("");
          setOpen(false);
          onAssigned?.();
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to assign user to the hotel.";

          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCancel = () => {
    setValidationError("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Hotel</DialogTitle>
        </DialogHeader>

        <Select
          value={selectedHotelId}
          onValueChange={(value) => {
            setSelectedHotelId(value);
            setValidationError("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select hotel" />
          </SelectTrigger>
          <SelectContent>
            {hotels?.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id.toString()}>
                {hotel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {validationError && (
          <p className="text-sm text-red-500 mt-2">{validationError}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={disabled || assignHotel.isPending}
          >
            {assignHotel.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
