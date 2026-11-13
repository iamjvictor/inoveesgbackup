import { env } from "../../config/env.js";
import { SesEmailAdapter } from "./sesEmailAdapter.js";
import { EmailService } from "./emailService.js";
import type { EmailEventType, EmailPayload } from "./types.js";

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

let emailServiceInstance: EmailService | null = null;

function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    const provider = env.email.enabled && env.email.awsRegion
      ? new SesEmailAdapter({ region: env.email.awsRegion })
      : { send: async () => ({ providerMessageId: "mock-disabled-id" }) };

    emailServiceInstance = new EmailService(provider, {
      enabled: env.email.enabled,
      from: env.email.from,
      appUrl: env.frontendUrl,
      contactEmail: env.email.contactEmail,
    });
  }
  return emailServiceInstance;
}

/**
 * Função direta e reutilizável para disparo de e-mails via AWS SES.
 *
 * @param type Tipo do e-mail ("WELCOME" | "DIAGNOSTIC_COMPLETED" | "PURCHASE_CONFIRMED" | "PURCHASE_FAILED")
 * @param to E-mail do destinatário
 * @param payload Dados para preenchimento do template (ex: { name: "João" })
 */
export async function sendEmail(
  type: EmailEventType,
  to: string,
  payload: EmailPayload
): Promise<SendEmailResult> {
  const recipient = to?.trim();

  if (!recipient) {
    console.warn("[email] Destinatário vazio fornecido para sendEmail", { type });
    return { success: false, error: "Destinatário inválido" };
  }

  if (!env.email.enabled) {
    console.info(`[email] Envio de e-mail "${type}" para ${recipient} ignorado (EMAIL_ENABLED=false)`);
    return { success: false, error: "EMAIL_DISABLED" };
  }

  try {
    const service = getEmailService();
    const result = await service.sendEvent(type, recipient, payload);
    console.info(`[email] E-mail "${type}" enviado com sucesso para ${recipient}`, {
      messageId: result.providerMessageId,
    });
    return { success: true, messageId: result.providerMessageId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[email] Falha ao enviar e-mail "${type}" para ${recipient}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}
