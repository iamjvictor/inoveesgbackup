import { createHmac, timingSafeEqual } from "node:crypto";

export type MercadoPagoSignatureInput = {
  signature: string | null | undefined;
  requestId: string | null | undefined;
  dataId: string | number | null | undefined;
  secret: string;
};

export function isValidMercadoPagoSignature({ signature, requestId, dataId, secret }: MercadoPagoSignatureInput) {
  if (!signature || !requestId || dataId == null || !secret) return false;

  const parts = new Map<string, string>();
  for (const item of signature.split(",")) {
    const [key, ...valueParts] = item.split("=");
    if (key && valueParts.length) parts.set(key.trim(), valueParts.join("=").trim());
  }

  const timestamp = parts.get("ts");
  const receivedHash = parts.get("v1");
  if (!timestamp || !receivedHash || !/^[a-f\d]{64}$/i.test(receivedHash)) return false;

  const id = String(dataId).trim();
  const manifest = `id:${id};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest();
  const actualHash = Buffer.from(receivedHash, "hex");
  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash);
}
