import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { supabaseAuthClient } from "../../../lib/supabase.js";
import { AuthRepository } from "../repositories/authRepository.js";
import { AuthService } from "./authService.js";

const supabaseSession = {
  data: {
    user: { id: "supabase-user-id" },
    session: { access_token: "access-token", refresh_token: "refresh-token", expires_in: 3600 },
  },
  error: null,
};

test("adminLogin returns a session for a user linked to admin_users", async (t) => {
  mock.method(supabaseAuthClient.auth, "signInWithPassword", async () => supabaseSession);
  mock.method(AuthRepository.prototype, "findBySupabaseUserId", async () => ({
    id: "user-id",
    email: "admin@example.com",
    fullName: "Admin",
  } as never));
  mock.method(AuthRepository.prototype, "findAdminUserBySupabaseUserId", async () => ({ adminRole: "SUPER_ADMIN" } as never));

  const result = await new AuthService().adminLogin({ email: "admin@example.com", password: "Strong-123!" });

  assert.equal(result.accessToken, "access-token");
  assert.equal(result.user?.role, "ADMIN");
  t.mock.restoreAll();
});

test("adminLogin rejects a valid Supabase user that is not an admin", async (t) => {
  mock.method(supabaseAuthClient.auth, "signInWithPassword", async () => supabaseSession);
  mock.method(AuthRepository.prototype, "findBySupabaseUserId", async () => ({
    id: "user-id",
    email: "company@example.com",
    fullName: "Company",
  } as never));
  mock.method(AuthRepository.prototype, "findAdminUserBySupabaseUserId", async () => null);

  await assert.rejects(
    () => new AuthService().adminLogin({ email: "company@example.com", password: "Strong-123!" }),
    /Acesso restrito ao painel administrativo/,
  );
  t.mock.restoreAll();
});

