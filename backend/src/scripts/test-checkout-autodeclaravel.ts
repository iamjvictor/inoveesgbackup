import { PrismaClient } from "@prisma/client";

import { AuthService } from "../modules/auth/services/authService.js";
import { CheckoutService } from "../modules/checkout/services/checkoutService.js";
import { MercadoPagoWebhookService } from "../modules/webhooks/services/mercadopagoWebhookService.js";
import { supabaseAdminClient } from "../lib/supabase.js";

const prisma = new PrismaClient();
const authService = new AuthService();
const checkoutService = new CheckoutService();
const webhookService = new MercadoPagoWebhookService();

const originalFetch = globalThis.fetch;
const simulatedPaymentId = `test-payment-${Date.now()}`;

let createdSupabaseUserId: string | null = null;
let createdLocalUserId: string | null = null;
let createdOrganizationId: string | null = null;
let simulatedOrderId: string | null = null;
let preferenceRequest: Record<string, unknown> | null = null;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
}

function uniqueNumeric(length: number) {
  return `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`.slice(-length).padStart(length, "0");
}

async function findNextTestUserNumber() {
  const localUsers = await prisma.user.findMany({
    where: { email: { startsWith: "test", mode: "insensitive" } },
    select: { email: true },
  });

  const usedNumbers = new Set<number>();
  for (const user of localUsers) {
    const match = user.email.match(/^test(\d+)@gmail\.com$/i);
    if (match) usedNumbers.add(Number(match[1]));
  }

  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    for (const user of data.users) {
      const match = user.email?.match(/^test(\d+)@gmail\.com$/i);
      if (match) usedNumbers.add(Number(match[1]));
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  const requestedNumber = Number(process.env.CHECKOUT_TEST_USER_NUMBER ?? "");
  if (Number.isInteger(requestedNumber) && requestedNumber > 10 && !usedNumbers.has(requestedNumber)) {
    return requestedNumber;
  }

  let nextNumber = 11;
  while (usedNumbers.has(nextNumber)) nextNumber += 1;
  return nextNumber;
}

function buildRegistrationInput(testUserNumber: number) {
  return {
    email: `test${testUserNumber}@gmail.com`,
    password: "250202joaoV#",
    fullName: "Usuário de Teste — Checkout Autodeclarável",
    phone: "11999999999",
    companyName: `Empresa Teste Checkout ${testUserNumber}`,
    cnpj: uniqueNumeric(14),
    industrySegment: "Infraestrutura",
    businessCategoryCode: "INFRAESTRUTURA",
    businessSegmentCode: "INFRAESTRUTURA",
    specificActivity: "TESTE_CHECKOUT_AUTODECLARAVEL",
    size: "Pequena",
    numberOfSuppliers: "0",
    annualRevenue: "Até R$ 360 mil",
    cpf: uniqueNumeric(11),
    cargoFuncao: "Responsável pelo teste",
    grauParticipacao: "Sócio",
    tradeName: `Empresa Teste Checkout ${testUserNumber}`,
    addressLine1: "Rua de Teste",
    addressNumber: "100",
    addressComplement: "Sala 1",
    country: "Brasil",
    state: "SP",
    city: "São Paulo",
    site: "https://example.com",
    redesSociais: "",
    naturezaJuridica: "Sociedade Empresária Limitada",
    porte: "Pequena Empresa",
    tempoOperacao: "1 a 5 anos",
    alcanceMercado: "Nacional",
    esgJaPossui: [],
    esgInteresse: ["Diagnóstico ESG"],
  };
}

function installMercadoPagoSimulator() {
  globalThis.fetch = async (input, init) => {
    const url = String(input);

    if (url === "https://api.mercadopago.com/checkout/preferences") {
      preferenceRequest = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      simulatedOrderId = typeof preferenceRequest.external_reference === "string"
        ? preferenceRequest.external_reference
        : null;

      return new Response(JSON.stringify({
        id: `test-preference-${Date.now()}`,
        init_point: "https://sandbox.mercadopago.com/test-checkout",
        sandbox_init_point: "https://sandbox.mercadopago.com/test-checkout",
      }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }

    if (url === `https://api.mercadopago.com/v1/payments/${simulatedPaymentId}`) {
      return new Response(JSON.stringify({
        id: simulatedPaymentId,
        status: "approved",
        status_detail: "accredited",
        external_reference: simulatedOrderId,
        transaction_amount: 250,
        currency_id: "BRL",
        payment_type_id: "pix",
        date_created: new Date().toISOString(),
        date_approved: new Date().toISOString(),
        metadata: {
          orderId: simulatedOrderId,
          productCode: "PRE_DIAGNOSTIC",
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return originalFetch(input, init);
  };
}

async function findCreatedUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      supabaseUserId: true,
      organizationUsers: {
        select: { organizationId: true },
      },
    },
  });

  if (!user?.organizationUsers[0]) {
    throw new Error("Usuário local ou organização de teste não foi encontrado após o cadastro");
  }

  return user;
}

async function cleanup(email: string) {
  if (createdOrganizationId) {
    await prisma.organization.delete({ where: { id: createdOrganizationId } }).catch(() => undefined);
  }

  if (createdLocalUserId) {
    await prisma.user.delete({ where: { id: createdLocalUserId } }).catch(() => undefined);
  } else {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
  }

  if (createdSupabaseUserId) {
    const { error } = await supabaseAdminClient.auth.admin.deleteUser(createdSupabaseUserId);
    if (error) {
      console.error("WARN: não foi possível remover o usuário de teste do Supabase", error.message);
    }
  }
}

async function main() {
  const testUserNumber = await findNextTestUserNumber();
  const registrationInput = buildRegistrationInput(testUserNumber);
  const shouldCleanup = process.env.CLEANUP_TEST_DATA === "true";
  installMercadoPagoSimulator();

  console.log("=== TESTE DE INTEGRAÇÃO — CADASTRO + CHECKOUT AUTODECLARÁVEL ===");
  console.log(`E-mail temporário: ${registrationInput.email}`);
  console.log(`Persistência dos dados: ${shouldCleanup ? "limpar ao final" : "manter para login/teste manual"}`);
  console.log("Mercado Pago: simulador local interceptando preference e payment approved");

  try {
    const registration = await authService.register(registrationInput);
    assert(registration.organization.status === "ACTIVE", "cadastro cria organização ativa");

    const createdUser = await findCreatedUser(registrationInput.email);
    createdLocalUserId = createdUser.id;
    createdSupabaseUserId = createdUser.supabaseUserId;
    createdOrganizationId = createdUser.organizationUsers[0].organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: createdOrganizationId },
      include: {
        businessCategory: true,
        businessSegment: true,
        roles: true,
      },
    });

    assert(organization?.businessCategory?.code === "INFRAESTRUTURA", "cadastro vincula categoria Infraestrutura");
    assert(organization?.businessSegment?.code === "INFRAESTRUTURA", "cadastro vincula segmento Infraestrutura");
    assert(organization?.roles.some((role) => role.role === "COMPANY"), "cadastro cria papel COMPANY");

    const preference = await checkoutService.createPreference(createdSupabaseUserId, "PRE_DIAGNOSTIC");
    assert(preference.productCode === "PRE_DIAGNOSTIC", "checkout cria preferência do autodeclarável");
    assert(Boolean(preference.checkoutUrl), "checkout retorna URL de pagamento");
    assert(Boolean(preference.orderId), "checkout retorna orderId");
    assert(Boolean(preference.diagnosticId), "checkout cria diagnóstico pendente");
    assert(simulatedOrderId === preference.orderId, "Mercado Pago recebe o orderId como external_reference");
    assert(preferenceRequest?.metadata && typeof preferenceRequest.metadata === "object", "Mercado Pago recebe metadata da compra");

    const pendingOrder = await prisma.order.findUnique({
      where: { id: preference.orderId },
      include: { items: true },
    });
    assert(pendingOrder?.status === "PENDING_PAYMENT", "pedido começa como PENDING_PAYMENT");
    assert(pendingOrder?.items.some((item) => item.metadata && typeof item.metadata === "object"), "pedido armazena metadata do diagnóstico");

    const webhookResult = await webhookService.handleWebhook(
      {
        type: "payment",
        data: { id: simulatedPaymentId },
      },
      {
        "x-request-id": "test-request",
        "x-signature": "test-signature",
        "user-agent": "test-checkout-autodeclaravel",
      },
    );

    assert(webhookResult.paymentStatus === "approved", "webhook identifica pagamento aprovado");
    assert(webhookResult.externalReference === preference.orderId, "webhook resolve external_reference para o pedido");

    const paidOrder = await prisma.order.findUnique({
      where: { id: preference.orderId },
      include: {
        payments: true,
        items: true,
      },
    });
    const diagnostic = preference.diagnosticId
      ? await prisma.diagnostic.findUnique({ where: { id: preference.diagnosticId } })
      : null;

    assert(paidOrder?.status === "PAID", "webhook confirma o pedido como PAID");
    assert(paidOrder?.payments.some((payment) => payment.status === "PAID"), "webhook registra pagamento PAID");
    assert(diagnostic?.status === "ACTIVE", "webhook ativa o pré-diagnóstico comprado");

    console.log("=== TESTE CONCLUÍDO: cadastro, checkout e webhook passaram ===");
  } finally {
    if (shouldCleanup) {
      await cleanup(registrationInput.email);
    } else {
      console.log(`Dados mantidos para acesso manual: ${registrationInput.email}`);
    }
    globalThis.fetch = originalFetch;
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("=== TESTE FALHOU ===");
  console.error(error);
  process.exitCode = 1;
});
