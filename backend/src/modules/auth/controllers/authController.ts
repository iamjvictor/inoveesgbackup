import type { Request, Response } from "express";
import { z } from "zod";

import { AuthService } from "../services/authService.js";
import { validateCPF, validateCNPJ } from "../../../utils/cpfCnpjValidator.js";
import { BUSINESS_CATEGORIES, BUSINESS_SEGMENTS } from "../../../config/businessCatalog.js";
import { AUTH_COOKIE_NAME, getAdminCookieOptions, getAuthClearCookieOptions } from "../../../lib/authSession.js";

const authService = new AuthService();

const strongPasswordSchema = z.string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial (!@#$%...)");

const businessCategoryCodeSchema = z.enum(BUSINESS_CATEGORIES.map((category) => category.code) as [string, ...string[]]);
const businessSegmentCodeSchema = z.enum(
  Object.values(BUSINESS_SEGMENTS).flat().map((segment) => segment.code) as [string, ...string[]]
);

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: strongPasswordSchema,
  fullName: z.string().trim().min(2, "Nome muito curto"),
  phone: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => v.length >= 10, "Telefone inválido"),
  companyName: z.string().trim().min(2, "Nome da empresa muito curto"),
  cnpj: z.string().transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 14, "CNPJ deve ter 14 dígitos")
    .refine((v) => validateCNPJ(v), "CNPJ inválido (dígitos verificadores incorretos)"),
  industrySegment: z.string().trim().optional(),
  businessCategoryCode: businessCategoryCodeSchema.optional(),
  businessSegmentCode: businessSegmentCodeSchema.optional(),
  size: z.string().trim().optional(),
  numberOfSuppliers: z.string().trim().optional(),
  annualRevenue: z.string().trim().optional(),
  ref: z.string().uuid().optional(),
  cpf: z.string().transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos")
    .refine((v) => validateCPF(v), "CPF inválido (dígitos verificadores incorretos)"),
  cargoFuncao: z.string().trim().min(2, "Cargo/Função é obrigatório"),
  grauParticipacao: z.string().trim().min(2, "Grau de participação é obrigatório"),
  tradeName: z.string().trim().min(2, "Nome fantasia é obrigatório"),
  addressLine1: z.string().trim().min(2, "Endereço é obrigatório"),
  addressNumber: z.string().trim().min(1, "Número é obrigatório"),
  addressComplement: z.string().trim().optional(),
  country: z.string().trim().min(2, "País é obrigatório"),
  state: z.string().trim().min(2, "Estado/UF é obrigatório"),
  city: z.string().trim().min(2, "Cidade é obrigatória"),
  site: z.string().trim().min(3, "Site inválido").optional().or(z.literal("")),
  redesSociais: z.string().trim().optional(),
  naturezaJuridica: z.string().trim().min(2, "Natureza jurídica é obrigatória"),
  porte: z.string().trim().min(2, "Porte da empresa é obrigatório"),
  tempoOperacao: z.string().trim().min(2, "Tempo de operação é obrigatório"),
  alcanceMercado: z.string().trim().min(2, "Alcance de mercado é obrigatório"),
  esgJaPossui: z.array(z.string()).optional(),
  esgInteresse: z.array(z.string()).optional(),
  specificActivity: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const recoverySchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

const completeRecoverySchema = z.object({
  accessToken: z.string().min(1, "Token de recuperação ausente"),
  password: strongPasswordSchema,
});

function isRecoveryRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("over_email_send_rate_limit")
    || message.includes("over_request_rate_limit")
    || message.includes("rate limit")
    || message.includes("too many requests")
    || message.includes("too many emails")
    || message.includes("only request this after");
}

const updateProfileSchema = z.object({
  user: z.object({
    fullName: z.string().trim().optional().nullable(),
    phone: z.string().transform((v) => v ? v.replace(/\D/g, "") : v).optional().nullable(),
    cpf: z.string().transform((v) => v ? v.replace(/\D/g, "") : v)
      .refine((v) => !v || (v.length === 11 && validateCPF(v)), "CPF inválido")
      .optional().nullable(),
    cargoFuncao: z.string().trim().optional().nullable(),
    grauParticipacao: z.string().trim().optional().nullable(),
  }).optional(),
  organization: z.object({
    legalName: z.string().trim().optional().nullable(),
    tradeName: z.string().trim().optional().nullable(),
    cnpj: z.string().transform((v) => v ? v.replace(/\D/g, "") : v)
      .refine((v) => !v || (v.length === 14 && validateCNPJ(v)), "CNPJ inválido")
      .optional().nullable(),
    primaryEmail: z.string().trim().toLowerCase().optional().nullable(),
    phone: z.string().transform((v) => v ? v.replace(/\D/g, "") : v).optional().nullable(),
    website: z.string().trim().optional().nullable(),
    industrySegment: z.string().trim().optional().nullable(),
    businessCategoryCode: businessCategoryCodeSchema.nullable().optional(),
    businessSegmentCode: businessSegmentCodeSchema.nullable().optional(),
    enderecoCompleto: z.string().trim().optional().nullable(),
    municipioEstado: z.string().trim().optional().nullable(),
    addressLine1: z.string().trim().optional().nullable(),
    addressNumber: z.string().trim().optional().nullable(),
    addressComplement: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    redesSociais: z.string().trim().optional().nullable(),
    naturezaJuridica: z.string().trim().optional().nullable(),
    porte: z.string().trim().optional().nullable(),
    tempoOperacao: z.string().trim().optional().nullable(),
    alcanceMercado: z.string().trim().optional().nullable(),
    specificActivity: z.string().trim().optional().nullable(),
    logoUrl: z.string().trim().optional().nullable(),
    logoStoragePath: z.string().trim().optional().nullable(),
  }).optional(),
});

const uploadLogoSchema = z.object({
  fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
  mimeType: z.string().min(1, "Tipo do arquivo é obrigatório"),
  base64Data: z.string().min(1, "Conteúdo da imagem é obrigatório"),
  sizeBytes: z.number().max(5 * 1024 * 1024, "A logo deve ter no máximo 5MB"),
});

export class AuthController {
  async register(request: Request, response: Response) {
    console.info("[auth.register] Request received", {
      email: request.body?.email,
      companyName: request.body?.companyName,
    });

    try {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);
      response.cookie(AUTH_COOKIE_NAME, result.accessToken, getAdminCookieOptions());

      console.info("[auth.register] Request completed", {
        email: input.email,
        organizationId: result.organization.id,
        userId: result.user.id,
      });

      return response.status(201).json({ user: result.user, organization: result.organization, expiresIn: result.expiresIn });
    } catch (error) {
      console.error("[auth.register] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: "Preencha todos os campos obrigatórios corretamente.",
        });
      }

      const msg = error instanceof Error ? error.message : "";
      if (
        msg.includes("já está cadastrado") ||
        msg.includes("already registered") ||
        msg.includes("already exists")
      ) {
        return response.status(400).json({ message: msg });
      }

      if (
        msg.toLowerCase().includes("prisma") ||
        msg.toLowerCase().includes("invocation") ||
        msg.toLowerCase().includes("column") ||
        msg.toLowerCase().includes("table") ||
        msg.toLowerCase().includes("database")
      ) {
        return response.status(500).json({
          message: "Erro interno ao processar seu cadastro. Tente novamente em alguns instantes.",
        });
      }

      return response.status(400).json({
        message: msg || "Erro no cadastro",
      });
    }
  }

  async login(request: Request, response: Response) {
    console.info("[auth.login] Request received", {
      email: request.body?.email,
    });

    try {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);
      response.cookie(AUTH_COOKIE_NAME, result.accessToken, getAdminCookieOptions());

      console.info("[auth.login] Request completed", {
        email: input.email,
        hasUser: Boolean(result.user),
      });

      return response.status(200).json({ user: result.user, expiresIn: result.expiresIn });
    } catch (error) {
      console.error("[auth.login] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: "E-mail ou senha inválidos",
        });
      }

      const msg = error instanceof Error ? error.message : "";

      if (
        msg.includes("Invalid login credentials") ||
        msg.includes("Invalid credentials") ||
        msg === "Unauthorized" ||
        msg.toLowerCase().includes("invalid password") ||
        msg.toLowerCase().includes("user not found") ||
        msg === "Usuário não encontrado"
      ) {
        return response.status(401).json({
          message: "E-mail ou senha incorretos",
        });
      }

      return response.status(500).json({
        message: "Ocorreu um erro interno. Tente novamente mais tarde.",
      });
    }
  }

  async adminLogin(request: Request, response: Response) {
    console.info("[auth.adminLogin] Request received", {
      email: request.body?.email,
    });

    try {
      const input = loginSchema.parse(request.body);
      const result = await authService.adminLogin(input);
      response.cookie(AUTH_COOKIE_NAME, result.accessToken, getAdminCookieOptions());

      console.info("[auth.adminLogin] Request completed", {
        email: input.email,
        hasUser: Boolean(result.user),
      });

      return response.status(200).json({ expiresIn: result.expiresIn, user: result.user });
    } catch (error) {
      console.error("[auth.adminLogin] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: "E-mail ou senha inválidos",
        });
      }

      const msg = error instanceof Error ? error.message : "";

      if (msg === "Acesso restrito ao painel administrativo") {
        return response.status(403).json({
          message: msg,
        });
      }

      if (
        msg.includes("Invalid login credentials") ||
        msg.includes("Invalid credentials") ||
        msg === "Unauthorized" ||
        msg.toLowerCase().includes("invalid password") ||
        msg.toLowerCase().includes("user not found") ||
        msg === "Usuário não encontrado"
      ) {
        return response.status(401).json({
          message: "E-mail ou senha incorretos",
        });
      }

      return response.status(500).json({
        message: "Ocorreu um erro interno. Tente novamente mais tarde.",
      });
    }
  }

  async adminLogout(_request: Request, response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, getAuthClearCookieOptions());
    return response.status(204).send();
  }

  async recoverPassword(request: Request, response: Response) {
    // Deliberadamente retorna a mesma resposta para e-mails cadastrados e não cadastrados.
    // Isso evita revelar quais endereços possuem conta na plataforma.
    let input: z.infer<typeof recoverySchema>;

    try {
      input = recoverySchema.parse(request.body);
    } catch (error) {
      console.error("[auth.recover] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      return response.status(400).json({ message: "Informe um e-mail válido." });
    }

    try {
      await authService.recoverPassword(input.email);
    } catch (error) {
      console.error("[auth.recover] Provider failed", {
        email: input.email,
        error: error instanceof Error ? error.message : error,
      });

      if (isRecoveryRateLimitError(error)) {
        return response.status(429).json({
          message: "Limite de envio atingido. Tente novamente em alguns minutos.",
        });
      }

      return response.status(502).json({
        message: "O serviço de e-mail está temporariamente indisponível. Tente novamente mais tarde.",
      });
    }

    return response.status(200).json({
      message: "Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha.",
    });
  }

  async completePasswordRecovery(request: Request, response: Response) {
    const parsed = completeRecoverySchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    try {
      await authService.completePasswordRecovery(parsed.data.accessToken, parsed.data.password);
      return response.status(200).json({ message: "Senha atualizada com sucesso." });
    } catch (error) {
      console.error("[auth.recover.complete] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      return response.status(401).json({
        message: "Este link de recuperação é inválido ou expirou.",
      });
    }
  }

  async getMe(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const user = await authService.getMe(supabaseUserId, request.query.fresh === "true");

      if (!user) {
        return response.status(404).json({ message: "User not found" });
      }

      return response.status(200).json(user);
    } catch (error) {
      console.error("[auth.getMe] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getAccessContext(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const accessContext = await authService.getAccessContext(supabaseUserId, request.query.fresh === "true");

      console.info("=== USER ACCESS CONTEXT LOG ===");
      console.info(JSON.stringify(accessContext, null, 2));

      if (!accessContext) {
        return response.status(404).json({ message: "Organization not found" });
      }

      return response.status(200).json(accessContext);
    } catch (error) {
      console.error("[auth.getAccessContext] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async updateProfile(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const input = updateProfileSchema.parse(request.body);
      
      const cleanUser: any = {};
      if (input.user) {
        for (const [key, val] of Object.entries(input.user)) {
          if (val !== undefined && val !== null && val !== "") {
            cleanUser[key] = val;
          }
        }
      }

      const cleanOrg: any = {};
      if (input.organization) {
        for (const [key, val] of Object.entries(input.organization)) {
          if (val !== undefined && val !== null && val !== "") {
            cleanOrg[key] = val;
          }
        }
      }

      const result = await authService.updateProfile(supabaseUserId, {
        user: Object.keys(cleanUser).length > 0 ? cleanUser : undefined,
        organization: Object.keys(cleanOrg).length > 0 ? cleanOrg : undefined,
      });

      return response.status(200).json(result);
    } catch (error) {
      console.error("[auth.updateProfile] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async uploadCompanyLogo(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const input = uploadLogoSchema.parse(request.body);
      const result = await authService.uploadCompanyLogo(supabaseUserId, input);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[auth.uploadCompanyLogo] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: error.errors[0]?.message || "Dados do arquivo inválidos",
        });
      }

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao enviar a logo",
      });
    }
  }
}
