import test from "node:test";
import assert from "node:assert/strict";
import { EmailService } from "./emailService.js";
import { SesEmailAdapter } from "./sesEmailAdapter.js";
import type { EmailMessage, EmailProvider } from "./types.js";
import type { SESv2Client } from "@aws-sdk/client-sesv2";

class CaptureProvider implements EmailProvider {
  messages: EmailMessage[] = [];
  async send(message: EmailMessage) {
    this.messages.push(message);
    return { providerMessageId: "accepted-1" };
  }
}

const config = { enabled: true, from: "no-reply@example.com", appUrl: "https://app.example.com", contactEmail: "help@example.com" };

test("welcome template includes Portuguese subject, HTML and text, with escaped name", () => {
  const service = new EmailService(new CaptureProvider(), config);
  const result = service.buildMessage("WELCOME", "new@example.com", { name: "João <script>alert(1)</script>" });
  assert.match(result.subject, /Boas-vindas/);
  assert.match(result.html, /&lt;script&gt;/);
  assert.doesNotMatch(result.html, /<script>/);
  assert.match(result.text, /João <script>/);
  assert.match(result.html, /https:\/\/app\.example\.com/);
  assert.match(result.text, /help@example.com/);
});

test("diagnostic email differentiates pre-diagnostic from strategic without claiming final report", () => {
  const service = new EmailService(new CaptureProvider(), config);
  const pre = service.buildMessage("DIAGNOSTIC_COMPLETED", "a@example.com", { name: "Ana", diagnosticKind: "PRE_DIAGNOSTIC" });
  const full = service.buildMessage("DIAGNOSTIC_COMPLETED", "a@example.com", { name: "Ana", diagnosticKind: "FULL_DIAGNOSTIC" });
  assert.match(pre.html, /resultado pode ser consultado/);
  assert.match(full.html, /enviar as evidências/);
  assert.doesNotMatch(full.text, /relatório verificado está pronto/i);
});

test("rejects unsafe URL protocols even when hostname is localhost", () => {
  const service = new EmailService(new CaptureProvider(), { ...config, appUrl: "ftp://localhost/app" });
  assert.throws(() => service.buildMessage("WELCOME", "a@example.com", { name: "Ana" }), /HTTPS/);
});

test("SES adapter sends both MIME alternatives and returns a provider acceptance ID", async () => {
  let captured: any;
  const client = { send: async (command: any) => { captured = command; return { MessageId: "ses-accepted" }; } } as unknown as SESv2Client;
  const adapter = new SesEmailAdapter({ region: "us-east-1" }, client);
  const result = await adapter.send({ to: "a@example.com", from: "b@example.com", subject: "Oi", html: "<p>Oi</p>", text: "Oi" });
  assert.equal(result.providerMessageId, "ses-accepted");
  assert.equal(captured.input.Content.Simple.Body.Html.Data, "<p>Oi</p>");
  assert.equal(captured.input.Content.Simple.Body.Text.Data, "Oi");
  assert.deepEqual(captured.input.Destination.ToAddresses, ["a@example.com"]);
});

test("SES adapter reports missing acceptance ID and rejects missing region", async () => {
  const noIdClient = { send: async () => ({}) } as unknown as SESv2Client;
  await assert.rejects(new SesEmailAdapter({ region: "us-east-1" }, noIdClient).send({ to: "a@b.com", from: "b@c.com", subject: "x", html: "x", text: "x" }), /identificador/);
  assert.throws(() => new SesEmailAdapter({ region: " " }), /AWS_REGION/);
});
