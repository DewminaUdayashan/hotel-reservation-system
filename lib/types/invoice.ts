import { PaymentMethod } from "./reservation";

export type InvoiceLineItem = {
  description: string;
  amount: number;
  serviceTypeId?: number | null;
};

export type InvoicePayload = {
  lineItems: InvoiceLineItem[];
  paymentMethod: PaymentMethod;
  amountPaid: number;
  transactionId?: string | null;
  dueDate?: string | null;
  userName?: string;
  email?: string;
};
