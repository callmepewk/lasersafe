import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageBlockedScreen from "./PageBlockedScreen";

export default function PageBlockChecker({ pageName, children }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPageAccess();
  }, [pageName]);

  const checkPageAccess = async () => {
    setLoading(true);
    try {
      // Verificar se o usuário é admin
      const user = await base44.auth.me();
      const userIsAdmin = user?.role === "admin";
      setIsAdmin(userIsAdmin);

      // Se for admin, não precisa verificar bloqueio
      if (userIsAdmin) {
        setIsBlocked(false);
        setLoading(false);
        return;
      }

      // Verificar se a página está bloqueada
      const configs = await base44.entities.AppConfig.filter({ key: "blocked_pages" });
      if (configs.length > 0) {
        const blockedPages = JSON.parse(configs[0].value || "{}");
        setIsBlocked(!!blockedPages[pageName]?.blocked);
      } else {
        setIsBlocked(false);
      }
    } catch (error) {
      console.error("Erro ao verificar acesso à página:", error);
      setIsBlocked(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isBlocked && !isAdmin) {
    return <PageBlockedScreen pageName={pageName} />;
  }

  return <>{children}</>;
}