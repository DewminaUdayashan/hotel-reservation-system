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
import { Customer } from "@/lib/types/user";
import { useAdminCustomers } from "@/hooks/users/users.admin";
import { AddCustomerDialog } from "@/components/admin/customers/add-customer-dialog";
import { toast } from "@/hooks/use-toast";

export default function AdminCustomersListPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerType, setCustomerType] = useState<string | undefined>(
    undefined
  );
  const [orderDir, setOrderDir] = useState("DESC");
  const [orderBy, setOrderBy] = useState("createdAt");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, refetch } = useAdminCustomers({
    page,
    search: debouncedSearch,
    customerType,
    orderBy,
    orderDir,
  });

  const customers: Customer[] = data?.data || [];
  const total = data?.totalCount || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const handleTypeChange = (value: string) => {
    setCustomerType(value === "any" ? undefined : value);
    setPage(1);
  };

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    setPage(1);
  };

  const handleOrderDirChange = (value: string) => {
    setOrderDir(value);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search by name, email or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <Select
            value={customerType || "any"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>
          <h2>Sort By :</h2>
          <Select value={orderBy} onValueChange={handleOrderByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Joined Date</SelectItem>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="lastName">Last Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orderDir} onValueChange={handleOrderDirChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">Ascending</SelectItem>
              <SelectItem value="DESC">Descending</SelectItem>
            </SelectContent>
          </Select>

          <AddCustomerDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSuccess={() => {
              refetch();
              toast({
                title: "Customer added successfully",
                description: "The new customer account has been created.",
              });
            }}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customerId}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  {customer.firstName} {customer.lastName}
                </TableCell>
                <TableCell className="capitalize">
                  {customer.customerType}
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
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
