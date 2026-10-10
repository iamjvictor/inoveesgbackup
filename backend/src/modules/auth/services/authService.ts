import { Prisma, BusinessCategoryCode, BusinessSegmentCode } from "@prisma/client";

import { supabaseAdminClient, supabaseAuthClient } from "../../../lib/supabase.js";
import type { LoginInput, RegisterInput } from "../models/authModel.js";
import { AuthRepository } from "../repositories/authRepository.js";
import type { AuthAccessContext } from "../models/accessModel.js";
import { env } from "../../../config/env.js";

const authRepository = new AuthRepository();


function mapRegisterError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = (error.meta?.target as string[]) || [];
    if (target.includes("email")) {
      return new Error("Este e-mail já está cadastrado.");
    }
    if (target.includes("cnpj")) {
      return new Error("Este CNPJ já está cadastrado.");
    }
    if (target.includes("cpf")) {
      return new Error("Este CPF já está cadastrado.");
    }
    return new Error("Já existe cadastro com este e-mail, CPF ou CNPJ");
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Não foi possível concluir o cadastro");
}

export function sanitizeActivity(text?: string | null): string | null {
  if (!text) return null;
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[-\s]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");
}

export class AuthService {
  private async resolveSessionUser(supabaseUserId: string) {
    const [user, adminUser] = await Promise.all([
      authRepository.findBySupabaseUserId(supabaseUserId),
      authRepository.findAdminUserBySupabaseUserId(supabaseUserId),
    ]);

    if (!user) {
      return null;
    }

    if (!adminUser) {
      return user;
    }

    return {
      ...user,
      role: "ADMIN",
      adminRole: adminUser.adminRole,
    };
  }

  private async authenticateWithSupabase(input: LoginInput) {
    const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user || !data.session) {
      console.error("[auth.login] Supabase authentication failed", {
        email: input.email,
        error: error?.message,
      });
      throw new Error(error?.message ?? "Invalid credentials");
    }

    const user = await this.resolveSessionUser(data.user.id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user,
    };
  }

  async register(input: RegisterInput) {
    console.info("[auth.register] Creating Supabase user", {
      email: input.email,
      cnpj: input.cnpj,
    });

    const { data, error } = await supabaseAdminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        phone: input.phone,
        company_name: input.companyName,
        cnpj: input.cnpj,
      },
    });

    if (error || !data.user) {
      console.error("[auth.register] Supabase user creation failed", {
        email: input.email,
        error: error?.message,
      });
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already registered")) {
        throw new Error("Este e-mail já está cadastrado.");
      }
      throw new Error(msg || "Failed to register user in Supabase");
    }

    let result: Awaited<ReturnType<AuthRepository["createUserWithOrganization"]>>;

    try {
      console.info("[auth.register] Creating local user and organization", {
        email: input.email,
        supabaseUserId: data.user.id,
      });

      result = await authRepository.createUserWithOrganization({
        supabaseUserId: data.user.id,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone,
        companyName: input.companyName,
        cnpj: input.cnpj,
        industrySegment: input.industrySegment,
        businessCategoryCode: input.businessCategoryCode as BusinessCategoryCode,
        businessSegmentCode: input.businessSegmentCode as BusinessSegmentCode,
        size: input.size,
        numberOfSuppliers: input.numberOfSuppliers,
        annualRevenue: input.annualRevenue,
        ref: input.ref,
        cpf: input.cpf,
        cargoFuncao: input.cargoFuncao,
        grauParticipacao: input.grauParticipacao,
        tradeName: input.tradeName,
        addressLine1: input.addressLine1,
        addressNumber: input.addressNumber,
        addressComplement: input.addressComplement,
        country: input.country,
        state: input.state,
        city: input.city,
        site: input.site,
        redesSociais: input.redesSociais,
        naturezaJuridica: input.naturezaJuridica,
        porte: input.porte,
        tempoOperacao: input.tempoOperacao,
        alcanceMercado: input.alcanceMercado,
        esgJaPossui: input.esgJaPossui,
        esgInteresse: input.esgInteresse,
        specificActivity: sanitizeActivity(input.specificActivity) || undefined,
      });
    } catch (databaseError) {
      console.error("[auth.register] Local persistence failed, deleting Supabase user", {
        email: input.email,
        supabaseUserId: data.user.id,
        error: databaseError instanceof Error ? databaseError.message : databaseError,
      });
      await supabaseAdminClient.auth.admin.deleteUser(data.user.id);
      throw mapRegisterError(databaseError);
    }

    console.info("[auth.register] Running automatic sign-in", {
      email: input.email,
    });

    const signInResult = await supabaseAuthClient.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (signInResult.error || !signInResult.data.session) {
      console.error("[auth.register] Automatic sign-in failed", {
        email: input.email,
        error: signInResult.error?.message,
      });
      throw new Error(signInResult.error?.message ?? "Cadastro concluido, mas o login automatico falhou");
    }

    console.info("[auth.register] Registration flow completed", {
      email: input.email,
      organizationId: result.organization.id,
    });

    return {
      accessToken: signInResult.data.session.access_token,
      refreshToken: signInResult.data.session.refresh_token,
      expiresIn: signInResult.data.session.expires_in,
      user: result.user,
      organization: result.organization,
    };
  }

  async login(input: LoginInput) {
    console.info("[auth.login] Authenticating with Supabase", {
      email: input.email,
    });

    console.info("[auth.login] Login flow completed", {
      email: input.email,
      hasLocalUser: true,
    });

    return this.authenticateWithSupabase(input);
  }

  async recoverPassword(email: string) {
    const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.frontendUrl.replace(/\/$/, "")}/redefinir-senha`,
    });

    if (error) {
      const authError = error as { code?: string; status?: number; message: string };
      throw new Error([authError.code, authError.status, authError.message].filter(Boolean).join(" "));
    }
  }

  async completePasswordRecovery(accessToken: string, password: string) {
    const { data, error } = await supabaseAuthClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new Error("Invalid recovery token");
    }

    const { error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(data.user.id, {
      password,
    });

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  async adminLogin(input: LoginInput) {
    console.info("[auth.adminLogin] Authenticating admin with Supabase", {
      email: input.email,
    });

    const session = await this.authenticateWithSupabase(input);

    if (session.user?.role !== "ADMIN") {
      throw new Error("Acesso restrito ao painel administrativo");
    }

    return {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      user: session.user,
    };
  }

  async getMe(supabaseUserId: string) {
    console.info("[auth.getMe] Fetching profile from database", {
      supabaseUserId,
    });

    const user = await this.resolveSessionUser(supabaseUserId);

    return user;
  }

  async getAccessContext(supabaseUserId: string): Promise<AuthAccessContext | null> {
    console.info("[auth.getAccessContext] Fetching access context", {
      supabaseUserId,
    });

    return authRepository.getAccessContextBySupabaseUserId(supabaseUserId);
  }

  async updateProfile(supabaseUserId: string, data: any) {
    console.info("[auth.updateProfile] Updating profile in database", {
      supabaseUserId,
    });

    if (data?.organization?.specificActivity) {
      data.organization.specificActivity = sanitizeActivity(data.organization.specificActivity);
    }

    return authRepository.updateProfile(supabaseUserId, data);
  }

  private async ensureCompanyLogosBucketExists(bucketName: string) {
    const { data: buckets, error: listError } = await supabaseAdminClient.storage.listBuckets();
    if (listError) {
      console.warn("[AuthService.ensureCompanyLogosBucketExists] listBuckets falhou", listError);
    }

    const exists = buckets?.some((bucket) => bucket.name === bucketName) ?? false;
    if (exists) {
      return;
    }

    console.info("[AuthService.ensureCompanyLogosBucketExists] Criando bucket publico company-logos", {
      bucketName,
    });

    const { error: createError } = await supabaseAdminClient.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    });

    if (createError) {
      throw new Error(`Não foi possível criar o bucket de logos da empresa: ${createError.message}`);
    }
  }

  async uploadCompanyLogo(
    supabaseUserId: string,
    file: { fileName: string; mimeType: string; base64Data: string; sizeBytes: number }
  ) {
    console.info("[AuthService.uploadCompanyLogo] Iniciando upload de logo da empresa", {
      supabaseUserId,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    });

    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);
    if (!organizationId) {
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const bucketName = "company-logos";
    await this.ensureCompanyLogosBucketExists(bucketName);

    const sanitizeFileName = (name: string) =>
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();

    const storagePath = `organizations/${organizationId}/logo/${Date.now()}-${sanitizeFileName(file.fileName)}`;
    const rawBase64 = file.base64Data.includes(",") ? file.base64Data.split(",").pop() ?? "" : file.base64Data;
    const fileBuffer = Buffer.from(rawBase64, "base64");

    const { error: uploadError } = await supabaseAdminClient.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: file.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[AuthService.uploadCompanyLogo] Erro no upload para o Supabase Storage", uploadError);
      throw new Error(`Falha ao enviar logo para o storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdminClient.storage.from(bucketName).getPublicUrl(storagePath);
    const logoUrl = publicUrlData.publicUrl;

    console.info("[AuthService.uploadCompanyLogo] Logo enviada com sucesso, atualizando perfil", {
      organizationId,
      storagePath,
      logoUrl,
    });

    await authRepository.updateProfile(supabaseUserId, {
      organization: {
        logoUrl,
        logoStoragePath: storagePath,
      },
    });

    return {
      success: true,
      logoUrl,
      logoStoragePath: storagePath,
    };
  }
}
