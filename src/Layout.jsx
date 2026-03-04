import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { TranslationProvider, useTranslation } from "@/components/i18n/TranslationContext";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import {
  Calculator,
  Users,
  UserCheck,
  BookOpen,
  LayoutDashboard,
  Activity,
  FileClock,
  CreditCard,
  LifeBuoy,
  Settings,
  FlaskConical,
  GraduationCap,
  Shield,
  Heart,
  FileText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UpdatesModal, { UPDATE_VERSION } from '@/components/updates/UpdatesModal';
import { base44 } from '@/api/base44Client';
import AdBlocker from '@/components/shared/AdBlocker';
import UpdateListener from '@/components/system/UpdateListener';

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const sessionIdRef = React.useRef("");
  const pageTimerRef = React.useRef({ path: location.pathname, start: Date.now() });

  React.useEffect(() => {
    const existing = sessionStorage.getItem('session_id');
    const id = existing ? existing : ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()));
    if (!existing) sessionStorage.setItem('session_id', id);
    sessionIdRef.current = id;
  }, []);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const { t } = useTranslation();

  const navigationItems = [
    {
      title: t("nav.dashboard", "Dashboard"),
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
    },
    {
      title: t("nav.patients", "Pacientes"),
      url: createPageUrl("Patients"),
      icon: Users,
    },
    {
      title: t("nav.professionals", "Profissionais"),
      url: createPageUrl("Professionals"),
      icon: UserCheck,
    },
    {
      title: t("nav.calculator", "Calculadora"),
      url: createPageUrl("Calculator"),
      icon: Calculator,
    },
    {
      title: t("nav.prescriptions", "Receitas"),
      url: createPageUrl("Prescriptions"),
      icon: FileText,
    },
    {
      title: t("nav.history", "Histórico"),
      url: createPageUrl("History"),
      icon: FileClock,
    },
    {
      title: t("nav.formulas", "Fórmulas Magistrais"),
      url: createPageUrl("NeoFormulas"),
      icon: FlaskConical,
    },
    {
      title: t("nav.reference", "Guia de Referência"),
      url: createPageUrl("Reference"),
      icon: BookOpen,
    },
    {
      title: t("nav.plans", "Planos"),
      url: createPageUrl("Plans"),
      icon: CreditCard,
    },
    {
      title: t("nav.about", "Sobre Nós"),
      url: createPageUrl("AboutUs"),
      icon: Heart,
    },
    {
      title: t("nav.tutorial", "Tutorial"),
      url: createPageUrl("Tutorial"),
      icon: GraduationCap,
    },
    {
      title: t("nav.support", "Suporte"),
      url: createPageUrl("Support"),
      icon: LifeBuoy,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser({ full_name: 'Visitante' });
      }
    };
    fetchUser();
    
    const lastSeenVersion = localStorage.getItem('updatesModalSeen');
    if (lastSeenVersion !== UPDATE_VERSION) {
      setShowUpdatesModal(true);
    }
  }, []);

  // Rebrand: update document title and key meta tags to LaserSafe
  React.useEffect(() => {
    try {
      const APP_NAME = 'LaserSafe';
      document.title = APP_NAME;

      // og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', APP_NAME);

      // og:site_name
      let ogSiteName = document.querySelector('meta[property="og:site_name"]');
      if (!ogSiteName) {
        ogSiteName = document.createElement('meta');
        ogSiteName.setAttribute('property', 'og:site_name');
        document.head.appendChild(ogSiteName);
      }
      ogSiteName.setAttribute('content', APP_NAME);

      // application-name
      let appName = document.querySelector('meta[name="application-name"]');
      if (!appName) {
        appName = document.createElement('meta');
        appName.setAttribute('name', 'application-name');
        document.head.appendChild(appName);
      }
      appName.setAttribute('content', APP_NAME);

      // apple-mobile-web-app-title
      let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (!appleTitle) {
        appleTitle = document.createElement('meta');
        appleTitle.setAttribute('name', 'apple-mobile-web-app-title');
        document.head.appendChild(appleTitle);
      }
      appleTitle.setAttribute('content', APP_NAME);

      // twitter:title
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', APP_NAME);
    } catch (e) { /* noop */ }
  }, []);

  // SEO analytics: page timing and events
  React.useEffect(() => {
    const sendEvent = async (event_name, extra = {}) => {
      try {
        await base44.entities.AnalyticsEvent.create({
          event_name,
          page: location.pathname,
          duration_ms: extra.duration_ms || 0,
          session_id: sessionIdRef.current,
          user_email: currentUser?.email || null,
        });
      } catch (e) { /* ignore */ }
    };
    sendEvent('page_view');
    return () => {
      const duration = Date.now() - (pageTimerRef.current?.start || Date.now());
      base44.entities.AnalyticsEvent.create({
        event_name: 'page_leave',
        page: pageTimerRef.current?.path || location.pathname,
        duration_ms: duration,
        session_id: sessionIdRef.current,
        user_email: currentUser?.email || null,
      });
    };
  }, []);

  React.useEffect(() => {
    const now = Date.now();
    const prev = pageTimerRef.current;
    if (prev) {
      const duration = now - prev.start;
      base44.entities.AnalyticsEvent.create({
        event_name: 'page_stay',
        page: prev.path,
        duration_ms: duration,
        session_id: sessionIdRef.current,
        user_email: currentUser?.email || null,
      });
    }
    pageTimerRef.current = { path: location.pathname, start: now };
    base44.entities.AnalyticsEvent.create({
      event_name: 'page_view',
      page: location.pathname,
      duration_ms: 0,
      session_id: sessionIdRef.current,
      user_email: currentUser?.email || null,
    });
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const visibleNavigationItems = currentUser?.role === 'admin' 
    ? [
        ...navigationItems,
        {
          title: t("layout.adminControl", "Controle"),
          url: createPageUrl("AdminControl"),
          icon: Shield,
        }
      ]
    : navigationItems;

  return (
    <>
      <AdBlocker />
      <UpdateListener />
      
      <style dangerouslySetInnerHTML={{__html: `
        button[title*="edit" i],
        button[title*="Edit" i],
        button[aria-label*="edit" i],
        a[href*="base44"],
        [class*="base44"],
        button[style*="position: fixed"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}} />
      
      <SidebarProvider>
        <UpdatesModal open={showUpdatesModal} onOpenChange={setShowUpdatesModal} />
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
          <Sidebar className="border-r border-slate-200/60 md:w-64 md:shrink-0 print:hidden">
            <SidebarHeader className="border-b border-slate-200/60 p-4 sm:p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">LaserSafe</h2>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{t("layout.subtitle", "IA assistente de cálculos")}</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-3 bg-white/50 backdrop-blur-sm">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  {t("layout.navigation", "Navegação")}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {visibleNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl mb-1 font-medium ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${location.pathname === item.url ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm sm:text-base truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/60 p-3 sm:p-4 bg-white/80 backdrop-blur-sm">
              <Link to={createPageUrl("Profile")} className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 font-semibold text-xs sm:text-sm">
                    {currentUser ? getInitials(currentUser.full_name) : '...'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                    {currentUser ? currentUser.full_name : t("common.loading", "Carregando...")}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{t("layout.viewProfile", "Ver Perfil")}</p>
                </div>
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
              </Link>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col md:ml-0 w-full min-w-0">
            <div className="hidden md:block fixed top-4 right-4 z-50 print:hidden">
              <LanguageSelector variant="outline" />
            </div>
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 md:hidden print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                   <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                     <Activity className="w-4 h-4 text-white" />
                   </div>
                   <h1 className="text-lg font-bold text-slate-900 truncate">LaserSafe</h1>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector variant="ghost" />
                  <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 flex-shrink-0" />
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-4 md:py-6 md:px-8 w-full">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <TranslationProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </TranslationProvider>
  );
}