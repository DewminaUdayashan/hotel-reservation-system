"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HotelUser, User } from "@/lib/types/user";
import { useAllHotels } from "@/hooks/hotels/hotels";
import { useAdminUsers } from "@/hooks/users/users.admin";
import { AddUserDialog } from "@/components/admin/users/add-user-dialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { UserRowItem } from "@/components/admin/users/user-row-item";

export default function AdminUsersListPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [hotelId, setHotelId] = useState<number | undefined>(undefined);

  const { data: hotels } = useAllHotels();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, refetch } = useAdminUsers({
    page,
    search: debouncedSearch,
    role,
    hotelId,
  });

  const users: HotelUser[] = data?.data || [];
  const total = data?.totalCount || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const handleRoleChange = (value: string) => {
    setRole(value === "any" ? undefined : value);
    setPage(1);
  };

  const handleHotelChange = (value: string) => {
    setHotelId(value === "any" ? undefined : Number(value));
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <Select value={role || "any"} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Roles</SelectItem>
              <SelectItem value="clerk">Clerk</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={hotelId?.toString() || "any"}
            onValueChange={handleHotelChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by hotel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Hotels</SelectItem>
              {hotels?.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AddUserDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRowItem key={user.id} user={user} onUpdate={refetch} />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
