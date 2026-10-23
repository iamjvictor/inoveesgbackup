import { prisma } from "../../../lib/prisma.js";

const CONSULTING_SLOTS: Record<string, number> = {
  PRE_DIAGNOSTIC_PLUS: 1,
  CONSULTING_1H: 1,
  FULL_DIAGNOSTIC_PLUS: 2,
};

const CONSUMED_STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "NO_SHOW"] as const;

function normalizeMeetingUrl(value: string) {
  try {
    const url = new URL(value?.trim());
    if (url.protocol !== "https:" || url.hostname !== "meet.google.com" || url.pathname === "/" || url.username || url.password) {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error("Informe um link válido do Google Meet");
  }
}

export class ConsultingService {
  async schedule(organizationId: string, startsAt: string, meetingUrl: string, orderId?: string) {
    const startsAtDate = new Date(startsAt);
    if (!Number.isFinite(startsAtDate.getTime()) || startsAtDate <= new Date()) {
      throw new Error("O agendamento deve ser feito para uma data futura válida");
    }
    const normalizedMeetingUrl = normalizeMeetingUrl(meetingUrl);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId ?? undefined,
          organizationId,
          status: "PAID",
          items: { some: { product: { code: { in: Object.keys(CONSULTING_SLOTS) } } } },
        },
        orderBy: { paidAt: "desc" },
        include: { items: { include: { product: { include: { service: true } } } } },
      });
      if (!order) throw new Error("A empresa não possui uma compra paga de consultoria");

      // Serializa agendamentos da mesma compra para preservar o limite de sessões.
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id}::uuid FOR UPDATE`;

      const consultingItems = order.items.filter((item) => CONSULTING_SLOTS[item.product.code] !== undefined);
      const sessionLimit = consultingItems.reduce((total, item) => total + CONSULTING_SLOTS[item.product.code], 0);
      const consumed = await tx.consultingAppointment.count({
        where: { orderId: order.id, status: { in: [...CONSUMED_STATUSES] } },
      });
      if (consumed >= sessionLimit) {
        throw new Error(`Todas as ${sessionLimit} consultoria(s) desta compra já foram agendadas`);
      }

      const consultingItem = consultingItems[0];
      const durationMinutes = consultingItem.product.service?.durationMinutes ?? 60;
      return tx.consultingAppointment.create({
        data: {
          organizationId,
          orderId: order.id,
          serviceId: consultingItem.product.service?.id,
          meetingUrl: normalizedMeetingUrl,
          startsAt: startsAtDate,
          endsAt: new Date(startsAtDate.getTime() + durationMinutes * 60 * 1000),
          status: "CONFIRMED",
          confirmedAt: new Date(),
          timezone: "America/Sao_Paulo",
        },
      });
    });
  }

  private async findAppointment(organizationId: string, orderId?: string, appointmentId?: string) {
    const appointments = await prisma.consultingAppointment.findMany({
      where: { organizationId, orderId: orderId ?? undefined, id: appointmentId ?? undefined },
      orderBy: { createdAt: "desc" },
      take: appointmentId ? 1 : 2,
    });
    if (appointments.length === 0) throw new Error("Nenhum agendamento encontrado para esta compra/empresa");
    if (!appointmentId && appointments.length > 1) {
      throw new Error("Informe o identificador da consultoria que deseja alterar");
    }
    return appointments[0];
  }

  async updateMeetingLink(organizationId: string, meetingUrl: string, orderId?: string, appointmentId?: string) {
    const appointment = await this.findAppointment(organizationId, orderId, appointmentId);
    if (!["REQUESTED", "CONFIRMED"].includes(appointment.status)) {
      throw new Error("O link só pode ser alterado em consultorias pendentes ou confirmadas");
    }
    const result = await prisma.consultingAppointment.updateMany({
      where: { id: appointment.id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      data: { meetingUrl: normalizeMeetingUrl(meetingUrl) },
    });
    if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
    return prisma.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
  }

  async complete(organizationId: string, orderId?: string, appointmentId?: string) {
    const appointment = await this.findAppointment(organizationId, orderId, appointmentId);
    if (appointment.status !== "CONFIRMED") throw new Error("Somente consultorias confirmadas podem ser concluídas");
    const result = await prisma.consultingAppointment.updateMany({
      where: { id: appointment.id, status: "CONFIRMED" },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
    return prisma.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
  }

  async markNoShow(organizationId: string, orderId?: string, appointmentId?: string) {
    const appointment = await this.findAppointment(organizationId, orderId, appointmentId);
    if (appointment.status !== "CONFIRMED") {
      throw new Error("Somente consultorias confirmadas podem ser marcadas como não comparecimento");
    }
    if (!appointment.startsAt || appointment.startsAt > new Date()) {
      throw new Error("O não comparecimento só pode ser registrado após o horário agendado");
    }
    const result = await prisma.consultingAppointment.updateMany({
      where: { id: appointment.id, status: "CONFIRMED", startsAt: { lte: new Date() } },
      data: { status: "NO_SHOW" },
    });
    if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
    return prisma.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
  }

  async cancel(organizationId: string, reason?: string, orderId?: string, appointmentId?: string) {
    const appointment = await this.findAppointment(organizationId, orderId, appointmentId);
    if (!(["REQUESTED", "CONFIRMED"] as string[]).includes(appointment.status)) {
      throw new Error("Somente consultorias pendentes ou confirmadas podem ser canceladas");
    }
    const result = await prisma.consultingAppointment.updateMany({
      where: { id: appointment.id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      data: { status: "CANCELED", canceledAt: new Date(), cancellationReason: reason?.trim() || null },
    });
    if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
    return prisma.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
  }

  async reschedule(organizationId: string, startsAt: string, orderId?: string, appointmentId?: string) {
    const startsAtDate = new Date(startsAt);
    if (!Number.isFinite(startsAtDate.getTime()) || startsAtDate <= new Date()) {
      throw new Error("O novo horário deve ser uma data futura válida");
    }
    const appointment = await this.findAppointment(organizationId, orderId, appointmentId);
    if (!(["REQUESTED", "CONFIRMED", "CANCELED"] as string[]).includes(appointment.status)) {
      throw new Error("Esta consultoria não pode ser remarcada");
    }

    // Reativar uma sessão cancelada também consome uma vaga da compra.
    if (appointment.status === "CANCELED") {
      if (!appointment.orderId) throw new Error("Este agendamento não está vinculado a uma compra");
      return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM orders WHERE id = ${appointment.orderId}::uuid FOR UPDATE`;
        const order = await tx.order.findUnique({
          where: { id: appointment.orderId! },
          include: { items: { include: { product: true } } },
        });
        if (!order || order.status !== "PAID") throw new Error("A compra desta consultoria não está paga");
        const limit = order.items.reduce((total, item) => total + (CONSULTING_SLOTS[item.product.code] ?? 0), 0);
        const consumed = await tx.consultingAppointment.count({
          where: { orderId: order.id, status: { in: [...CONSUMED_STATUSES] } },
        });
        if (consumed >= limit) throw new Error("Todas as consultorias desta compra já foram agendadas");
        const result = await tx.consultingAppointment.updateMany({
          where: { id: appointment.id, status: "CANCELED" },
          data: this.rescheduledData(startsAtDate, appointment.endsAt, appointment.startsAt),
        });
        if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
        return tx.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
      });
    }

    const result = await prisma.consultingAppointment.updateMany({
      where: { id: appointment.id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      data: this.rescheduledData(startsAtDate, appointment.endsAt, appointment.startsAt),
    });
    if (result.count === 0) throw new Error("O status desta consultoria mudou. Atualize a página.");
    return prisma.consultingAppointment.findUniqueOrThrow({ where: { id: appointment.id } });
  }

  private rescheduledData(startsAt: Date, previousEnd: Date | null, previousStart: Date | null) {
    const durationMs = previousStart && previousEnd ? previousEnd.getTime() - previousStart.getTime() : 60 * 60 * 1000;
    return {
      status: "CONFIRMED" as const,
      startsAt,
      endsAt: new Date(startsAt.getTime() + durationMs),
      confirmedAt: new Date(),
      completedAt: null,
      canceledAt: null,
      cancellationReason: null,
    };
  }
}
