const EVIDENCE_UPLOAD_DAYS = 20;
const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

function getBusinessDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

export function getEvidenceUploadWindow(completedAt: Date | string | null | undefined, now = new Date()) {
  if (!completedAt) return { canUpload: false, deadline: null };

  const completedTime = new Date(completedAt).getTime();
  if (!Number.isFinite(completedTime)) return { canUpload: false, deadline: null };

  const { year, month, day } = getBusinessDate(new Date(completedTime));
  // O envio fica aberto até o fim do vigésimo dia, sem usar a hora da conclusão.
  const deadline = new Date(Date.UTC(year, month - 1, day + EVIDENCE_UPLOAD_DAYS + 1, 3));
  return { canUpload: now.getTime() >= completedTime && now.getTime() < deadline.getTime(), deadline };
}
