import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { id: rawId } = req.query;
  const id = parseInt(rawId as string, 10);

  const { lineItems, paymentMethod, dueDate, amountPaid, transactionId } =
    req.body;

  if (
    isNaN(id) ||
    !Array.isArray(lineItems) ||
    !["cash", "credit_card"].includes(paymentMethod)
  ) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  if (
    lineItems.length === 0 ||
    paymentMethod === undefined ||
    amountPaid === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await executeQuery(
      "EXEC CreateInvoiceAndCheckout @ReservationId, @LineItems, @PaymentMethod, @DueDate, @AmountPaid, @TransactionId",
      [
        { name: "ReservationId", value: id },
        { name: "LineItems", value: JSON.stringify(lineItems) },
        { name: "PaymentMethod", value: paymentMethod },
        { name: "DueDate", value: dueDate || null },
        { name: "AmountPaid", value: amountPaid },
        { name: "TransactionId", value: transactionId || null },
      ]
    );

    const invoice = result?.[0] || null;

    res.status(200).json({
      message: "Invoice created and reservation checked out successfully",
      invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to process checkout",
    });
  }
}
