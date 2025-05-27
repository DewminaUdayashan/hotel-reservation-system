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

export default function AdminCustomersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerType, setCustomerType] = useState<string | undefined>(
    undefined
  );
  const [orderDir, setOrderDir] = useState("DESC");

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useAdminCustomers({
    page,
    search: debouncedSearch,
    customerType,
    orderBy: "createdAt",
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

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select
            value={customerType || "any"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>

          <Link href="/admin/customers/new">
            <Button variant="default">+ Add Customer</Button>
          </Link>
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
            {customers.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell>{cust.customerId}</TableCell>
                <TableCell>{cust.email}</TableCell>
                <TableCell>
                  {cust.firstName} {cust.lastName}
                </TableCell>
                <TableCell className="capitalize">
                  {cust.customerType}
                </TableCell>
                <TableCell>{cust.phone}</TableCell>
                <TableCell>
                  {new Date(cust.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/customers/${cust.id}/edit`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
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
