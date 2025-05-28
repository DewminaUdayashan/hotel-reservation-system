"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { useCreateCustomer } from "@/hooks/users/users.admin";
import { useWatch } from "react-hook-form";

// 👇 Conditional Zod Schema for agency fields
const formSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(5),
    homeTown: z.string().optional(),
    customerType: z.enum(["individual", "agency"]),
    agencyName: z.string().optional(),
    agencyPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "agency") {
      if (!data.agencyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agency name is required",
          path: ["agencyName"],
        });
      }
      if (!data.agencyPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agency phone is required",
          path: ["agencyPhone"],
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
};

export const AddCustomerDialog = ({ isOpen, onClose, onSuccess }: Props) => {
  const [open, setOpen] = useState(isOpen);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: "individual",
    },
  });

  const customerType = useWatch({ control, name: "customerType" });
  const createCustomer = useCreateCustomer();

  const onSubmit = async (values: FormData) => {
    createCustomer.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Customer created",
          description: "The customer has been successfully added.",
        });
        reset();
        setOpen(false);
        onSuccess?.();
        onClose?.();
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create customer.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">+ Add Customer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new customer to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <Input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          <Input placeholder="First Name" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}

          <Input placeholder="Last Name" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}

          <Input placeholder="Phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}

          <Input placeholder="Home Town" {...register("homeTown")} />

          <Select
            value={customerType}
            onValueChange={(val) =>
              setValue("customerType", val as "individual" | "agency")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>

          {customerType === "agency" && (
            <>
              <Input placeholder="Agency Name" {...register("agencyName")} />
              {errors.agencyName && (
                <p className="text-sm text-red-500">
                  {errors.agencyName.message}
                </p>
              )}

              <Input placeholder="Agency Phone" {...register("agencyPhone")} />
              {errors.agencyPhone && (
                <p className="text-sm text-red-500">
                  {errors.agencyPhone.message}
                </p>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Saving..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
