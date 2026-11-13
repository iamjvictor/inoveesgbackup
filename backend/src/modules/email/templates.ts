import type { EmailEventType, EmailPayload } from "./types.js";

export type RenderedEmail = { subject: string; html: string; text: string };

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

function safeAppUrl(value: string): string {
  const url = new URL(value);
  const isLocalHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("EMAIL_APP_URL deve usar HTTPS");
  }
  return url.toString().replace(/\/$/, "");
}

export function renderEmailTemplate(
  eventType: EmailEventType,
  payload: EmailPayload,
  appUrl: string,
  contactEmail: string,
): RenderedEmail {
  const name = payload.name.trim() || "pessoa empreendedora";
  const href = safeAppUrl(appUrl);
  const safeName = escapeHtml(name);
  const safeContact = escapeHtml(contactEmail);
  const cta = `<p style="margin:28px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#176b4b;color:#fff;text-decoration:none;padding:13px 22px;border-radius:5px;font-weight:bold">Acessar a plataforma InoveESG</a></p>`;
  const footer = `<p style="border-top:1px solid #dce8df;padding-top:22px;color:#52645a;font-size:13px">Em caso de dúvidas, entre em contato: <a href="mailto:${safeContact}" style="color:#176b4b">${safeContact}</a>.<br><br>Atenciosamente,<br><strong>Equipe InoveESG</strong></p>`;
  const layout = (body: string) => `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px 12px;background:#f2f6f3;font-family:Arial,sans-serif;color:#20372b;line-height:1.6"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fff;border-collapse:collapse"><tr><td style="padding:28px 32px;border-bottom:4px solid #176b4b"><img src="https://www.inove-esg.com.br/logo_inove.png" alt="InoveESG" width="160" style="display:block;max-width:100%;height:auto"></td></tr><tr><td style="padding:28px 32px">${body}</td></tr></table></body></html>`;

  if (eventType === "WELCOME") {
    return {
      subject: "Boas-vindas à InoveESG",
      html: layout(`<h1 style="font-size:22px">Boas-vindas à InoveESG</h1><p>Prezado(a) ${safeName},</p><p>Seu cadastro na plataforma InoveESG foi concluído com sucesso. Estamos à disposição para apoiar sua jornada de sustentabilidade.</p>${cta}${footer}`),
      text: `Olá, ${name}!\n\nSeu cadastro na InoveESG foi concluído. Estamos felizes em acompanhar sua jornada ESG.\n\nAcesse a plataforma: ${href}\n\nEm caso de dúvidas, fale com a gente: ${contactEmail}\nEquipe InoveESG`,
    };
  }

  if (eventType === "PURCHASE_CONFIRMED" || eventType === "PURCHASE_FAILED") {
    const services = (payload.serviceNames ?? []).map((item) => item.trim()).filter(Boolean);
    const list = services.length ? services : ["Serviço InoveESG"];
    const safeList = list.map(escapeHtml);
    const amount = typeof payload.amountCents === "number"
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payload.amountCents / 100)
      : "";
    const failed = eventType === "PURCHASE_FAILED";
    const outcome = payload.paymentStatus === "CANCELED" ? "cancelado" : "não foi aprovado";
    const details = failed ? `O pagamento da compra ${outcome}. ${list.join(", ")}.` : `Pagamento confirmado${amount ? ` no valor de ${amount}` : ""}. ${list.join(", ")}.`;
    return {
      subject: failed ? "Atualização do pagamento — InoveESG" : "Compra confirmada — InoveESG",
      html: layout(`<h1 style="font-size:22px">${failed ? "Atualização do pagamento" : "Compra confirmada"}</h1><p>Prezado(a) ${safeName},</p><p>${failed ? `O pagamento da sua compra ${outcome}.` : `Recebemos a confirmação do seu pagamento${amount ? ` no valor de ${escapeHtml(amount)}` : ""}.`}</p><p>Serviços da compra:</p><ul>${safeList.map((item) => `<li>${item}</li>`).join("")}</ul><p>${failed ? "Consulte a situação e, se desejar, tente novamente pela plataforma." : "Consulte os detalhes e próximos passos na plataforma."}</p>${cta}${footer}`),
      text: `Olá, ${name}!\n\n${details}\n\n${failed ? "Consulte a situação e, se desejar, tente novamente: " : "Consulte os detalhes e próximos passos: "}${href}\n\nEm caso de dúvidas: ${contactEmail}\nEquipe InoveESG`,
    };
  }

  const kind = payload.diagnosticKind?.trim().toUpperCase();
  const isSelfDeclared = kind === "PRE_DIAGNOSTIC";
  const resultMessage = isSelfDeclared
    ? "Seu pré-diagnóstico foi concluído. O resultado pode ser consultado na plataforma."
    : "Seu questionário foi concluído. Acesse a plataforma para acompanhar os próximos passos e, quando aplicável, enviar as evidências solicitadas.";
  return {
    subject: "Questionário ESG concluído",
    html: layout(`<h1 style="font-size:22px">Questionário ESG concluído</h1><p>Prezado(a) ${safeName},</p><p>${resultMessage}</p>${cta}${footer}`),
    text: `Olá, ${name}!\n\n${resultMessage}\n\nAcesse a plataforma: ${href}\n\nEm caso de dúvidas, fale com a gente: ${contactEmail}\nEquipe InoveESG`,
  };
}
