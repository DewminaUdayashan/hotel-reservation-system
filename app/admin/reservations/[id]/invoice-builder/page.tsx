"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  Eye,
  Printer,
  LogOut,
} from "lucide-react";
import {
  format,
  differenceInCalendarDays,
  isAfter,
  setHours,
  setMinutes,
} from "date-fns";
import { useReservationById } from "@/hooks/reservations/reservations";
import { useCheckoutAndBilling } from "@/hooks/reservations/reservations.admin";
import { useUserById } from "@/hooks/users/users";

import { CheckoutConfirmationDialog } from "@/components/admin/reservations/check-out-confirmation-dialog";
import { PaymentMethod } from "@/lib/types/reservation";
import { toast } from "@/hooks/use-toast";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceDetails = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  customerName: string;
  customerAddress: string;
};

export default function InvoiceBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = parseInt(params?.id as string);
  const checkOutParam = searchParams?.get("checkOut");
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { data: reservation, refetch } = useReservationById(reservationId);
  const { data: customer } = useUserById(reservation?.customerId);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    undefined
  );
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string | undefined>(
    undefined
  );

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    notes:
      "Thank you for choosing LuxeStay Hotels. We look forward to welcoming you again.",
    companyName: "LuxeStay Hotels",
    companyAddress: "123 Luxury Lane, Resort City, RC 10001",
    companyPhone: "+1 (555) 123-4567",
    companyEmail: "billing@luxestay.com",
    customerName: customer?.firstName + " " + customer?.lastName,
    customerAddress: "Guest Address",
  });

  const checkOutAndBilling = useCheckoutAndBilling(reservationId);

  useEffect(() => {
    if (reservation) {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const today = checkOutParam
        ? new Date(decodeURIComponent(checkOutParam))
        : new Date();

      let nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn)); // prevent negative

      // 11 AM by default for checkout
      const defaultCheckout = setHours(setMinutes(checkOut, 0), 11);
      const isLateCheckout = isAfter(today, defaultCheckout);

      const rate = reservation.totalAmount / nights;

      const initialItems = [
        {
          description: `Room Stay (${reservation.roomType})`,
          quantity: nights,
          rate: Number.parseFloat(rate.toFixed(2)),
          amount: Number.parseFloat((rate * nights).toFixed(2)),
        },
      ];

      // Add any additional charges from the reservation
      if (
        reservation.additionalCharges &&
        reservation.additionalCharges.length > 0
      ) {
        reservation.additionalCharges.forEach((charge) => {
          initialItems.push({
            description: charge.description,
            quantity: 1,
            rate: charge.amount,
            amount: charge.amount,
          });
        });
      }

      if (isLateCheckout) {
        const additionalNights = differenceInCalendarDays(
          today,
          defaultCheckout
        );
        if (additionalNights > 0) {
          initialItems.push({
            description: `Late Checkout Fee (${additionalNights} night${
              additionalNights > 1 ? "s" : ""
            })`,
            quantity: additionalNights,
            rate: rate,
            amount: Number.parseFloat((rate * additionalNights).toFixed(2)),
          });
        } else {
          initialItems.push({
            description: "Late Checkout Fee",
            quantity: 1,
            rate: rate,
            amount: Number.parseFloat(rate.toFixed(2)),
          });
        }
      }

      setLineItems(initialItems);

      // Set customer name from reservation
      setInvoiceDetails((prev) => ({
        ...prev,
        customerName:
          reservation?.firstName || `Guest #${reservation.customerId}`,
      }));
    }
  }, [reservation]);

  // Generate PDF whenever data changes
  useEffect(() => {
    generatePdfPreview();
  }, [lineItems, invoiceDetails]);

  const handleItemChange = (
    index: number,
    key: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];

    if (key === "quantity" || key === "rate") {
      const numValue =
        typeof value === "string" ? Number.parseFloat(value) || 0 : value;
      updated[index][key] = numValue;

      // Recalculate amount
      const quantity = key === "quantity" ? numValue : updated[index].quantity;
      const rate = key === "rate" ? numValue : updated[index].rate;
      updated[index].amount = Number.parseFloat((quantity * rate).toFixed(2));
    } else if (key === "amount") {
      const numValue =
        typeof value === "string" ? Number.parseFloat(value) || 0 : value;
      updated[index][key] = numValue;
    } else {
      updated[index][key] = value as string;
    }

    setLineItems(updated);
  };

  const addItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length === 1) {
      toast({
        title: "Cannot remove all items",
        description: "At least one line item is required",
        variant: "destructive",
      });
      return;
    }

    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  const handleInvoiceDetailChange = (
    key: keyof InvoiceDetails,
    value: string
  ) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const totalAmount = useMemo(
    () => lineItems.reduce((acc, item) => acc + item.amount, 0),
    [lineItems]
  );

  const generatePdf = () => {
    // Create a new PDF document
    const doc = new jsPDF();

    // Add logo and company info
    doc.setFillColor(41, 37, 36); // Dark gray header
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceDetails.companyName, 14, 20);

    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 50);

    // Invoice details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoiceDetails.invoiceNumber}`, 14, 60);
    doc.text(
      `Date: ${format(new Date(invoiceDetails.invoiceDate), "PPP")}`,
      14,
      65
    );
    doc.text(
      `Due Date: ${format(new Date(invoiceDetails.dueDate), "PPP")}`,
      14,
      70
    );

    // Company details
    doc.setFontSize(10);
    doc.text("From:", 140, 60);
    doc.text(invoiceDetails.companyName, 140, 65);
    doc.text(invoiceDetails.companyAddress, 140, 70);
    doc.text(`Phone: ${invoiceDetails.companyPhone}`, 140, 75);
    doc.text(`Email: ${invoiceDetails.companyEmail}`, 140, 80);

    // Customer details
    doc.setFontSize(10);
    doc.text("Bill To:", 14, 85);
    doc.text(invoiceDetails.customerName, 14, 90);
    doc.text(invoiceDetails.customerAddress, 14, 95);

    // Reservation details
    if (reservation) {
      doc.text("Reservation Details:", 14, 105);
      doc.text(`Reservation ID: ${reservation.id}`, 14, 110);
      doc.text(
        `Check-in: ${format(new Date(reservation.checkIn), "PPP")}`,
        14,
        115
      );
      doc.text(
        `Check-out: ${format(new Date(reservation.checkOut), "PPP")}`,
        14,
        120
      );
      doc.text(
        `Room: ${reservation.roomType} (${reservation?.roomId || "N/A"})`,
        14,
        125
      );
    }

    // Line items table
    autoTable(doc, {
      startY: 135,
      head: [["Description", "Quantity", "Rate ($)", "Amount ($)"]],
      body: lineItems.map((item) => [
        item.description,
        item.quantity.toString(),
        item.rate.toFixed(2),
        item.amount.toFixed(2),
      ]),
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
    });

    // Total
    const finalY = doc.lastAutoTable?.finalY || 150;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: $${totalAmount.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Tax (0%): $0.00`, 140, finalY + 15);
    doc.setFontSize(14);
    doc.text(`Total Due: $${totalAmount.toFixed(2)}`, 140, finalY + 25);

    // Notes
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 14, finalY + 40);
    doc.text(invoiceDetails.notes, 14, finalY + 45);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This is a computer-generated document. No signature is required.",
      14,
      doc.internal.pageSize.height - 10
    );

    return doc;
  };

  const generatePdfPreview = () => {
    const doc = generatePdf();
    const pdfData = doc.output("datauristring");
    setPdfUrl(pdfData);
  };

  const handleDownload = () => {
    const doc = generatePdf();
    doc.save(`invoice-${reservationId}.pdf`);

    toast({
      title: "Invoice downloaded",
      description: "Your invoice has been downloaded successfully",
    });
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    }
  };

  if (!reservation) {
    return (
      <div className="container max-w-4xl py-10">
        <h1 className="text-2xl font-semibold mb-4">Invoice Builder</h1>
        <p>Reservation not found</p>
      </div>
    );
  }

  const handleCheckOut = () => setShowPaymentDialog(true);

  const handlePayment = () => {
    checkOutAndBilling.mutate(
      {
        lineItems,
        paymentMethod: paymentMethod || "cash",
        amountPaid: amountPaid || totalAmount,
        transactionId: transactionId || undefined,
        dueDate: invoiceDetails.dueDate || undefined,
        email: customer?.email || undefined,
        userName: customer?.firstName,
      },
      {
        onSuccess: () => {
          toast({
            title: "Payment Successful",
            description: `Reservation #${reservation.id} has been checked out and billed successfully.`,
          });
          refetch();
          router.back();
        },
        onError: (error) => {
          toast({
            title: "Payment Failed",
            description:
              error.message ??
              "An error occurred while processing the payment.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Invoice Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Invoice Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceDetails.invoiceNumber}
                    onChange={(e) =>
                      handleInvoiceDetailChange("invoiceNumber", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDetails.invoiceDate}
                    onChange={(e) =>
                      handleInvoiceDetailChange("invoiceDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceDetails.dueDate}
                    onChange={(e) =>
                      handleInvoiceDetailChange("dueDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={invoiceDetails.customerName}
                    onChange={(e) =>
                      handleInvoiceDetailChange("customerName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceDetails.notes}
                  onChange={(e) =>
                    handleInvoiceDetailChange("notes", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Rate ($)</div>
                <div className="col-span-2 text-center">Amount ($)</div>
                <div className="col-span-1"></div>
              </div>

              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="col-span-5"
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(index, "amount", e.target.value)
                    }
                    className="col-span-2"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCheckOut}
              disabled={
                (checkOutAndBilling.isPending,
                reservation?.status !== "checked-in")
              }
            >
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {checkOutAndBilling.isPending ? "Checking out.." : "Check Out"}
              </>
            </Button>
          </div>
        </div>

        {/* Right side - PDF Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-4 w-4 mr-2" /> Invoice Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={pdfContainerRef}
                className="border rounded-md overflow-hidden"
                style={{ height: "800px" }}
              >
                {pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Invoice Preview"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <CheckoutConfirmationDialog
        onClose={() => setShowPaymentDialog(false)}
        open={showPaymentDialog}
        totalAmount={totalAmount}
        onConfirm={(data) => {
          setPaymentMethod(data.paymentMethod);
          setAmountPaid(data.amountPaid);
          setTransactionId(data.transactionId);
          handlePayment();
          setShowPaymentDialog(false);
        }}
      />
    </div>
  );
}
