import assert from "node:assert/strict";
import test from "node:test";

import { parseAdminUsers } from "./admin-users.js";

test("admin provisioning requires exactly three unique accounts", () => {
  const users = parseAdminUsers(
    JSON.stringify([
      { email: "one@example.com", fullName: "One", password: "strong-password-1" },
      { email: "two@example.com", fullName: "Two", password: "strong-password-2" },
      { email: "three@example.com", fullName: "Three", password: "strong-password-3" },
    ]),
  );

  assert.equal(users.length, 3);
  assert.equal(users[0]?.email, "one@example.com");
});

test("admin provisioning rejects duplicate or weak credentials", () => {
  assert.throws(
    () =>
      parseAdminUsers(
        JSON.stringify([
          { email: "same@example.com", fullName: "One", password: "strong-password-1" },
          { email: "same@example.com", fullName: "Two", password: "strong-password-2" },
          { email: "three@example.com", fullName: "Three", password: "123" },
        ]),
      ),
    /unique|caracteres/i,
  );
});
