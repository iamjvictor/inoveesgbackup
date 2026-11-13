import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { EmailMessage, EmailProvider, SendResult } from "./types.js";

export type SesEmailAdapterConfig = { region: string };

/** SESv2 adapter uses the AWS SDK's default credential provider chain. */
export class SesEmailAdapter implements EmailProvider {
  private readonly client: SESv2Client;

  constructor(config: SesEmailAdapterConfig, client?: SESv2Client) {
    if (!config.region.trim()) throw new Error("AWS_REGION deve ser configurada para o SES");
    this.client = client ?? new SESv2Client({ region: config.region });
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const response = await this.client.send(new SendEmailCommand({
      FromEmailAddress: message.from,
      Destination: { ToAddresses: [message.to] },
      Content: {
        Simple: {
          Subject: { Data: message.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: message.html, Charset: "UTF-8" },
            Text: { Data: message.text, Charset: "UTF-8" },
          },
        },
      },
    }));
    if (!response.MessageId) throw new Error("Amazon SES não retornou o identificador da mensagem");
    return { providerMessageId: response.MessageId };
  }
}
