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

export function getBusinessDayStart(value: Date | number) {
  const { year, month, day } = getBusinessDate(new Date(value));
  return Date.UTC(year, month - 1, day);
}

export function getEvidenceUploadDeadline(completedAt: Date | string | number) {
  const completedTime = new Date(completedAt).getTime();
  if (!Number.isFinite(completedTime)) return null;

  const businessDay = getBusinessDayStart(completedTime);
  const lastUploadDay = new Date(businessDay + EVIDENCE_UPLOAD_DAYS * 24 * 60 * 60 * 1000);

  return {
    label: new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", dateStyle: "short" }).format(lastUploadDay),
    lastUploadDay: lastUploadDay.getTime(),
    closesAt: new Date(businessDay + (EVIDENCE_UPLOAD_DAYS + 1) * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
  };
}
