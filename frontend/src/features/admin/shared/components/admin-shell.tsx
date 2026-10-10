"use client";

import type { ReactNode } from "react";

import { AdminSidebar } from "./admin-sidebar";
import type { AdminSessionUser } from "../server-auth";

export function AdminShell({ children, adminUser }: { children: ReactNode; adminUser: AdminSessionUser }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eef2e7_0%,_#f8fafc_24%,_#f8fafc_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar adminUser={adminUser} />

        <div className="flex min-h-screen flex-1 flex-col">


          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
