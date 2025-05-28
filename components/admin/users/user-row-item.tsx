import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth/useAuth";
import { HotelUser, User } from "@/lib/types/user";
import { Edit, Hotel, Pencil } from "lucide-react";
import { use } from "react";
import { AssignHotelDialog } from "./assign-hotel-dialog";

type Props = {
  user: HotelUser;
  onUpdate: () => void;
};
export const UserRowItem = ({ user, onUpdate }: Props) => {
  const { user: authUser } = useAuth();
  const isCurrentUser = user.id === authUser?.id;

  return (
    <TableRow>
      <TableCell>
        {isCurrentUser && (
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        )}
      </TableCell>
      <TableCell>{user.id} </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell className="capitalize">{user.role}</TableCell>
      <TableCell>
        {user.hotelId && user.hotelName && user.hotelName}
        {!isCurrentUser && (
          <AssignHotelDialog
            disabled={isCurrentUser}
            userId={user.id}
            currentHotelId={user.hotelId}
            onAssigned={onUpdate}
            trigger={
              <Button size="icon" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
        )}
        {isCurrentUser && "Full access"}
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button size="icon" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
