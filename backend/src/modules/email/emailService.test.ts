import test from "node:test";
import assert from "node:assert/strict";
import { EmailService } from "./emailService.js";
import type { EmailMessage, EmailProvider } from "./types.js";

class RecordingProvider implements EmailProvider {
  messages: EmailMessage[] = [];
  async send(message: EmailMessage) {
    this.messages.push(message);
    return { providerMessageId: "fake-id" };
  }
}

const config = { enabled: true, from: "no-reply@example.com", appUrl: "https://app.example.com", contactEmail: "help@example.com" };

test("EmailService renders and dispatches a welcome event using the injected provider", async () => {
  const provider = new RecordingProvider();
  const service = new EmailService(provider, config);
  const result = await service.sendEvent("WELCOME", " user@example.com ", { name: "Ana" });
  assert.deepEqual(result, { providerMessageId: "fake-id" });
  assert.equal(provider.messages[0].to, "user@example.com");
  assert.match(provider.messages[0].html, /Prezado\(a\) Ana,/);
  assert.match(provider.messages[0].text, /https:\/\/app\.example\.com/);
});

test("diagnostic completion message distinguishes self-declared and strategic diagnostics", () => {
  const service = new EmailService(new RecordingProvider(), config);
  assert.match(service.buildMessage("DIAGNOSTIC_COMPLETED", "a@example.com", { name: "Ana", diagnosticKind: "PRE_DIAGNOSTIC" }).text, /resultado pode ser consultado/);
  assert.match(service.buildMessage("DIAGNOSTIC_COMPLETED", "a@example.com", { name: "Ana", diagnosticKind: "FULL_DIAGNOSTIC" }).text, /acompanhar os próximos passos/);
});

test("template escapes user supplied HTML and rejects insecure external app URLs", () => {
  const service = new EmailService(new RecordingProvider(), config);
  const message = service.buildMessage("WELCOME", "a@example.com", { name: "<img src=x onerror=alert(1)>" });
  assert.doesNotMatch(message.html, /<img src=x onerror/);
  assert.match(message.html, /&lt;img/);
  assert.throws(() => new EmailService(new RecordingProvider(), { ...config, appUrl: "http://example.com" }).buildMessage("WELCOME", "a@example.com", { name: "Ana" }), /HTTPS/);
});

test("enabled EmailService validates sender configuration on construction", () => {
  assert.throws(() => new EmailService(new RecordingProvider(), { ...config, from: "invalid-sender" }), /EMAIL_FROM/);
});

test("EmailService never dispatches when disabled and validates recipient", async () => {
  const provider = new RecordingProvider();
  const service = new EmailService(provider, { ...config, enabled: false });
  await assert.rejects(service.sendEvent("WELCOME", "a@example.com", { name: "Ana" }), /desabilitado/);
  assert.equal(provider.messages.length, 0);
  assert.throws(() => service.buildMessage("WELCOME", " ", { name: "Ana" }), /Destinatário/);
});

import { SesEmailAdapter } from "./sesEmailAdapter.js";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

test("SES adapter maps a rendered email to SESv2 and returns the provider ID", async () => {
  let sentCommand: unknown;
  const fakeClient = {
    send: async (command: unknown) => {
      sentCommand = command;
      return { MessageId: "ses-message-123" };
    },
  } as unknown as SESv2Client;
  const adapter = new SesEmailAdapter({ region: "us-east-1" }, fakeClient);
  const result = await adapter.send({ to: "a@example.com", from: "b@example.com", subject: "Teste", html: "<p>Oi</p>", text: "Oi" });
  assert.equal(result.providerMessageId, "ses-message-123");
  assert.ok(sentCommand instanceof SendEmailCommand);
  assert.deepEqual((sentCommand as SendEmailCommand).input.Destination?.ToAddresses, ["a@example.com"]);
  assert.equal((sentCommand as SendEmailCommand).input.FromEmailAddress, "b@example.com");
});
