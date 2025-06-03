import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type PaymentMethod = "credit-card" | "cash";

export function CheckoutConfirmationDialog({
  open,
  onClose,
  onConfirm,
  totalAmount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    transactionId?: string;
  }) => void;
  totalAmount: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const schema = useMemo(() => {
    return z
      .object({
        paymentMethod: z.enum(["credit-card", "cash"]),
        amountPaid: z
          .number({ invalid_type_error: "Amount must be a number" })
          .positive("Amount must be greater than 0"),
        transactionId: z
          .string()
          .optional()
          .refine(
            (val) => {
              if (paymentMethod === "credit-card")
                return val && val.trim() !== "";
              return true;
            },
            { message: "Transaction ID is required", path: ["transactionId"] }
          ),
      })
      .refine((data) => data.amountPaid >= totalAmount, {
        message: "Amount paid cannot be less than the total amount",
        path: ["amountPaid"],
      });
  }, [paymentMethod, totalAmount]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "cash" as PaymentMethod,
      amountPaid: 0,
      transactionId: "",
    },
  });

  const amountPaid = watch("amountPaid");

  // Auto-fill credit-card amount
  useEffect(() => {
    setPaymentMethod(watch("paymentMethod"));
    if (watch("paymentMethod") === "credit-card") {
      setValue("amountPaid", totalAmount);
    } else {
      setValue("amountPaid", 0);
    }
  }, [watch("paymentMethod"), setValue, totalAmount]);

  const changeAmount =
    paymentMethod === "cash" && amountPaid > totalAmount
      ? amountPaid - totalAmount
      : 0;

  const onSubmit = handleSubmit((data) => {
    onConfirm(data);
    reset();
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Payment and Check-Out</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Total Amount</Label>
            <p className="font-semibold text-lg">${totalAmount.toFixed(2)}</p>
          </div>

          <div>
            <Label>Payment Method</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setPaymentMethod(val as PaymentMethod);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-red-600 mt-1">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div>
            <Label>Amount Paid</Label>
            <Controller
              name="amountPaid"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  disabled={paymentMethod === "credit-card"}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
            {errors.amountPaid && (
              <p className="text-sm text-red-600 mt-1">
                {errors.amountPaid.message}
              </p>
            )}
          </div>

          {paymentMethod === "credit-card" && (
            <div>
              <Label>Transaction ID</Label>
              <Controller
                name="transactionId"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter transaction ID" />
                )}
              />
              {errors.transactionId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.transactionId.message}
                </p>
              )}
            </div>
          )}

          {paymentMethod === "cash" && (
            <>
              <div className="text-sm text-gray-500">
                Please collect the cash from the customer.
              </div>
              {changeAmount > 0 && (
                <div className="text-green-600 text-sm font-medium">
                  Change to return: ${changeAmount.toFixed(2)}
                </div>
              )}
            </>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm & Checkout</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
