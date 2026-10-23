const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type CompanyConsultingAppointment = {
  id: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  meetingUrl: string | null;
};

export async function getConsultingAppointments(): Promise<{ appointment: CompanyConsultingAppointment | null; appointments: CompanyConsultingAppointment[] }> {
  const response = await fetch(`${API_URL}/consulting/current`, {
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? "Erro ao carregar o agendamento");
  }

  return {
    appointment: data.appointment ?? null,
    appointments: Array.isArray(data.appointments) ? data.appointments : data.appointment ? [data.appointment] : [],
  };
}
