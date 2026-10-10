"use client";
import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  X
} from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { companyNavItems } from "./navigation";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";
import { useCompany } from "@/features/company-area/context/company-context";
import { canAccessEvidenceRoute, canAccessSuppliersRoute } from "../../access/route-access";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuthController();
  const { user, company, isUnpaid, isSupplierOnly, hasOnlyPreDiagnostic, hasCompletedDiagnostic, hasEvidenceAccess, hasActivePlan, hasPreDiagnosticAccess, hasInviteAccess } = useCompany();

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "IA";
  };

  const userInitials = getInitials(user?.fullName || "");

  useEffect(() => {
    console.log("=== AppSidebar Access & Routing Analysis ===");
    console.log("Context values:", { isUnpaid, isSupplierOnly, hasOnlyPreDiagnostic, hasCompletedDiagnostic, hasEvidenceAccess, hasActivePlan, hasPreDiagnosticAccess, hasInviteAccess });
    companyNavItems.forEach((item) => {
      let isLocked = false;
      if (isUnpaid) {
        isLocked = (item.href !== "/app" && item.href !== "/app/meus-servicos");
      } else {
        if (item.href === "/app/diagnostico") {
          isLocked = !isSupplierOnly && !hasPreDiagnosticAccess;
        } else if (item.href === "/app/fornecedores") {
          isLocked = !canAccessSuppliersRoute({ hasInviteAccess });
        } else if (item.href === "/app/ranking") {
          isLocked = !hasInviteAccess;
        } else if (item.href === "/app/evidencias") {
          isLocked = !canAccessEvidenceRoute({ hasEvidenceAccess, hasPreDiagnosticAccess });
        } else if (item.href === "/app/resultados") {
          isLocked = !hasCompletedDiagnostic && !hasActivePlan;
        }
      }
      console.log(`Route: ${item.label} (${item.href}) | isLocked: ${isLocked}`);
    });
  }, [isUnpaid, isSupplierOnly, hasOnlyPreDiagnostic, hasCompletedDiagnostic, hasEvidenceAccess, hasActivePlan, hasPreDiagnosticAccess, hasInviteAccess]);

  // Lock body scroll on mobile when menu is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (window.innerWidth < 768) {
      setIsCollapsed(false);
    }
  };
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Top Header Bar for Mobile Devices */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-30 px-4 flex items-center justify-between md:hidden shadow-xs">
        <Link href="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
          <Image
            src="/logo_inove_transparent.png"
            alt="Inove ESG"
            width={1472}
            height={832}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="flex flex-col border-l border-slate-200 pl-2.5">
            <span className="font-semibold text-slate-800 text-xs">Área da Empresa</span>
            {company?.tradeName && (
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                {company.tradeName}
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Alternar menu de navegação"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Desktop layout spacer */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`} />

      {/* Sidebar Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 md:z-30 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
          md:translate-x-0
        `}
      >
        {/* Header with logo and collapse / close button */}
        <div className={`flex items-center border-b border-slate-200 bg-slate-50/60 ${isCollapsed ? 'flex-col space-y-2 p-3 justify-center' : 'justify-between p-4'}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/logo_inove_transparent.png"
                alt="Inove ESG"
                width={1472}
                height={832}
                className="h-8 w-auto object-contain"
                priority
              />
              <div className="flex flex-col border-l border-slate-200 pl-2.5">
                <span className="font-semibold text-slate-800 text-sm leading-tight">Área da Empresa</span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity" title="Inove ESG">
              <Image
                src="/logo_inove_transparent.png"
                alt="Inove ESG"
                width={1472}
                height={832}
                className="h-7 w-auto max-w-[44px] object-contain"
                priority
              />
            </Link>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`hidden md:flex p-1.5 rounded-md hover:bg-slate-100 transition-all duration-200 ${isCollapsed ? 'w-full justify-center' : ''}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Mobile close button inside drawer header */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>



        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {companyNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/app"
                ? (pathname === "/app" || (isUnpaid && !isSupplierOnly && pathname === "/app/upgrade"))
                : pathname.startsWith(item.href);
              
              const isEvidenceRoute = item.href === "/app/evidencias";
              const isChainRoute = item.href === "/app/fornecedores";
              let isLocked = false;
              if (isUnpaid) {
                isLocked = (item.href !== "/app" && item.href !== "/app/meus-servicos");
              } else {
                if (item.href === "/app/diagnostico") {
                  isLocked = !isSupplierOnly && !hasPreDiagnosticAccess;
                } else if (item.href === "/app/fornecedores") {
                  isLocked = !canAccessSuppliersRoute({ hasInviteAccess });
                } else if (item.href === "/app/ranking") {
                  isLocked = !hasInviteAccess;
                } else if (item.href === "/app/evidencias") {
                  isLocked = !canAccessEvidenceRoute({ hasEvidenceAccess, hasPreDiagnosticAccess });
                } else if (item.href === "/app/resultados") {
                  isLocked = !hasCompletedDiagnostic && !hasActivePlan;
                }
              }

              const href = item.href === "/app" && isUnpaid && !isSupplierOnly
                ? "/app/upgrade"
                : (isLocked 
                    ? (isUnpaid ? (isSupplierOnly ? "/app" : "/app/upgrade") : "/app/upgrade") 
                    : item.href
                  );

              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    onClick={handleItemClick}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group relative
                      ${isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                      ${isLocked 
                        ? isUnpaid 
                          ? "bg-slate-100 text-slate-500 cursor-not-allowed pointer-events-none grayscale-[0.3]" 
                          : "bg-slate-100/60 text-slate-700 cursor-pointer hover:bg-slate-200/60"
                        : ""
                      }
                    `}
                    title={isLocked ? `${item.label} (Assine um plano para acessar)` : (isCollapsed ? item.label : undefined)}
                  >
                    <div className="flex items-center justify-center min-w-[24px] relative">
                      <Icon
                        className={`
                          h-5 w-5 flex-shrink-0
                          ${isActive 
                            ? "text-emerald-600" 
                            : isLocked 
                              ? "text-slate-600" 
                              : "text-slate-500 group-hover:text-slate-700"
                          }
                        `}
                      />
                      {isCollapsed && isLocked && (
                        <div className="absolute -top-1 -right-1.5 bg-slate-200 text-slate-700 rounded-full p-0.5 shadow-sm border border-white">
                          <Lock className="h-2 w-2" />
                        </div>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"} ${isLocked ? "text-slate-700 font-medium" : ""}`}>{item.label}</span>
                        {isLocked && <Lock className="hidden sm:inline-block h-3.5 w-3.5 text-slate-600 flex-shrink-0 ml-1.5" />}
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label} {isLocked && "🔒"}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-slate-200">
          {/* Profile Section */}
          <div className={`border-b border-slate-200 bg-slate-50/30 ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <Link href="/app/perfil" className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                  <span className="font-medium text-xs">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName || "Usuário"}</p>
                  <p className="text-xs text-slate-500 truncate">{company?.tradeName || "Sem empresa"}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
              </Link>
            ) : (
              <Link href="/app/perfil" className="flex justify-center">
                <div className="relative">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                    <span className="font-medium text-sm">{userInitials}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </Link>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={() => logout()}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group
                text-red-600 hover:bg-red-50 hover:text-red-700
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Sair" : undefined}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              </div>
              
              {!isCollapsed && (
                <span className="text-sm">Sair</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Sair
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
