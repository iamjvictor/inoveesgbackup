import type { EmailEventType, EmailMessage, EmailPayload, EmailProvider, SendResult } from "./types.js";
import { renderEmailTemplate } from "./templates.js";

export type EmailServiceConfig = {
  enabled: boolean;
  from: string;
  appUrl: string;
  contactEmail: string;
};

/** Renders and dispatches a transactional email through an injected provider. */
export class EmailService {
  constructor(private readonly provider: EmailProvider, private readonly config: EmailServiceConfig) {
    if (config.enabled && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.from.trim())) {
      throw new Error("EMAIL_FROM deve conter um endereço de e-mail válido quando o envio estiver habilitado");
    }
  }

  buildMessage(eventType: EmailEventType, to: string, payload: EmailPayload): EmailMessage {
    if (!to.trim()) throw new Error("Destinatário do e-mail é obrigatório");
    if (!this.config.from.trim()) throw new Error("Remetente do e-mail não configurado");
    const template = renderEmailTemplate(eventType, payload, this.config.appUrl, this.config.contactEmail);
    return { to: to.trim(), from: this.config.from, ...template };
  }

  async sendEvent(eventType: EmailEventType, to: string, payload: EmailPayload): Promise<SendResult> {
    if (!this.config.enabled) throw new Error("Envio de e-mail está desabilitado");
    return this.provider.send(this.buildMessage(eventType, to, payload));
  }
}
