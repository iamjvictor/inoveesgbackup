export type EmailEventType = "WELCOME" | "DIAGNOSTIC_COMPLETED" | "PURCHASE_CONFIRMED" | "PURCHASE_FAILED";

export type EmailPayload = {
  name: string;
  diagnosticKind?: string;
  serviceNames?: string[];
  amountCents?: number;
  paymentStatus?: "PAID" | "FAILED" | "CANCELED";
};

export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult = {
  providerMessageId: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<SendResult>;
}
