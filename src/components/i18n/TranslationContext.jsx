import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TranslationContext = createContext();

const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹', priority: 1 },
  { code: 'en', name: 'English', flag: '🇺🇸', priority: 2 },
  { code: 'es', name: 'Español', flag: '🇪🇸', priority: 3 },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

// Traduções pré-definidas para idiomas prioritários
const PRESET_TRANSLATIONS = {
  'pt-PT': {
    // Navigation
    "nav.dashboard": "Painel de Controlo",
    "nav.patients": "Pacientes",
    "nav.professionals": "Profissionais",
    "nav.calculator": "Calculadora",
    "nav.prescriptions": "Receitas",
    "nav.history": "Histórico",
    "nav.formulas": "Fórmulas Neo",
    "nav.reference": "Guia de Referência",
    "nav.plans": "Planos",
    "nav.about": "Sobre Nós",
    "nav.tutorial": "Tutorial",
    "nav.support": "Suporte",
    "layout.subtitle": "IA assistente de cálculos",
    "layout.navigation": "Navegação",
    "layout.adminControl": "Controlo",
    "layout.viewProfile": "Ver Perfil",
    "common.loading": "A carregar...",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.view": "Ver",
    "common.back": "Voltar",
    "common.years": "anos",
    "common.phototype": "Fototipo",
    "common.patient": "Paciente",
    "common.professional": "Profissional",
    "common.areYouSure": "Tem a certeza?",
    // Dashboard
    "dashboard.welcome": "Bem-vindo!",
    "dashboard.welcomeName": "Bem-vindo",
    "dashboard.doctor": "Doutor(a)",
    "dashboard.subtitle": "O seu resumo diário no LaserCode",
    "dashboard.viewProfile": "Ver Perfil",
    "dashboard.registeredPatients": "Pacientes Registados",
    "dashboard.registeredProfessionals": "Profissionais Registados",
    "dashboard.totalProcedures": "Total de Procedimentos",
    "dashboard.lastCalculations": "Últimos Cálculos",
    "dashboard.viewAll": "Ver todos",
    "dashboard.loadingCalculations": "A carregar últimos cálculos...",
    "dashboard.noRecentCalculations": "Nenhum cálculo recente.",
    "dashboard.calculation": "Cálculo",
    "dashboard.procedure": "Procedimento",
    "dashboard.region": "Região",
    "dashboard.quickActions": "Ações Rápidas",
    "dashboard.newPatient": "Novo Paciente",
    "dashboard.newProfessional": "Novo Profissional",
    "dashboard.newCalculation": "Novo Cálculo",
    "dashboard.viewHistory": "Ver Histórico",
    "dashboard.aiChatbot": "Chatbot com IA",
    "dashboard.referenceGuide": "Guia de Referência",
    // Patients
    "patients.title": "Pacientes",
    "patients.subtitle": "Faça a gestão do seu cadastro de pacientes",
    "patients.newPatient": "Novo Paciente",
    "patients.searchPlaceholder": "Pesquisar por nome, telefone...",
    "patients.noPatients": "Nenhum paciente encontrado",
    "patients.tryDifferentSearch": "Tente uma pesquisa diferente.",
    "patients.addFirst": "Comece por adicionar um novo paciente.",
    // Professionals
    "professionals.title": "Profissionais",
    "professionals.subtitle": "Faça a gestão do cadastro de médicos e especialistas",
    "professionals.newProfessional": "Novo Profissional",
    "professionals.searchPlaceholder": "Pesquisar por nome, especialidade...",
    "professionals.noProfessionals": "Nenhum profissional encontrado",
    // Calculator
    "calculator.title": "Calculadora Laser",
    "calculator.subtitle": "Cálculo inteligente de parâmetros de laser dermatológico",
    "calculator.selectPatient": "Selecionar Paciente",
    "calculator.selectProfessional": "Selecionar Profissional",
    "calculator.clinicalAssessment": "Avaliação Clínica",
    "calculator.results": "Resultados",
    "calculator.limitReached": "Limite de Cálculos Atingido",
    "calculator.limitMessage": "Utilizou todos os cálculos disponíveis no seu plano",
    "calculator.thisMonth": "este mês",
    "calculator.upgradeMessage": "Faça upgrade para continuar a calcular parâmetros com segurança e precisão.",
    "calculator.unlockMore": "Desbloqueie Mais Cálculos",
    "calculator.expandCapacity": "Amplie a sua capacidade de atendimento com um plano superior.",
    "calculator.viewPlans": "Ver Planos Disponíveis",
    // History
    "history.title": "Histórico de Cálculos",
    "history.subtitle": "Consulte todos os procedimentos realizados",
    "history.searchPlaceholder": "Pesquisar por nome...",
    "history.clearHistory": "Limpar Histórico",
    "history.deleteWarning": "Esta ação não pode ser desfeita. Todos os seus registos de cálculo serão eliminados permanentemente.",
    "history.adminWarning": "Como administrador, irá eliminar O HISTÓRICO DE TODOS OS UTILIZADORES.",
    "history.yesDeleteAll": "Sim, Limpar Tudo",
    "history.noCalculationsFound": "Nenhum cálculo encontrado",
    "history.tryDifferentSearch": "Tente uma pesquisa diferente.",
    "history.goToCalculator": "Vá para a calculadora para começar.",
    // Prescriptions
    "prescriptions.title": "Receitas Médicas",
    "prescriptions.subtitle": "Prescrições e receituário digital",
    "prescriptions.newPrescription": "Nova Receita",
    "prescriptions.searchPlaceholder": "Pesquisar por paciente, profissional ou diagnóstico...",
    "prescriptions.loading": "A carregar receitas...",
    "prescriptions.noPrescriptionsFound": "Nenhuma receita encontrada",
    "prescriptions.noPrescriptionsYet": "Nenhuma receita criada ainda",
    "prescriptions.draft": "Rascunho",
    "prescriptions.finalized": "Finalizada",
    "prescriptions.sent": "Enviada",
    // Plans
    "plans.title": "Gerir Plano",
    "plans.subtitle": "Acompanhe o seu plano atual e descubra como evoluir ainda mais.",
    "plans.myPlan": "O Meu Plano",
    "plans.activePlan": "Plano Ativo",
    "plans.whatsIncluded": "O que está incluído",
    "plans.upgradeYourPlan": "Faça Upgrade do Seu Plano",
    "plans.upgradeDescription": "Desbloqueie recursos avançados e aumente a sua capacidade de atendimento.",
    "plans.upgrade": "Fazer Upgrade",
    "plans.maxPlan": "Está no plano máximo!",
    "plans.maxPlanDescription": "Aproveite todos os recursos ilimitados do LaserCode Master.",
    // About
    "aboutUs.title": "Sobre Nós",
    "aboutUs.subtitle": "Conheça o Clube da Beleza e os nossos produtos",
    "aboutUs.ourProducts": "Os Nossos Produtos",
    "aboutUs.accessPlatform": "Aceder à Plataforma",
    "aboutUs.joinRevolution": "Faça Parte da Revolução Estética",
    // Usage Counter
    "usageCounter.monthlyUsage": "Uso Mensal",
    "usageCounter.plan": "Plano",
    "usageCounter.of": "de",
    "usageCounter.unlimited": "Ilimitado",
    "usageCounter.calculations": "cálculos",
    "usageCounter.limitReached": "Atingiu o limite do seu plano!",
    "usageCounter.upgrade": "Fazer Upgrade",
    "usageCounter.nearLimit": "Está próximo do limite. Considere fazer upgrade!",
  },
  'en': {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.patients": "Patients",
    "nav.professionals": "Professionals",
    "nav.calculator": "Calculator",
    "nav.prescriptions": "Prescriptions",
    "nav.history": "History",
    "nav.formulas": "Neo Formulas",
    "nav.reference": "Reference Guide",
    "nav.plans": "Plans",
    "nav.about": "About Us",
    "nav.tutorial": "Tutorial",
    "nav.support": "Support",
    "layout.subtitle": "AI calculation assistant",
    "layout.navigation": "Navigation",
    "layout.adminControl": "Control",
    "layout.viewProfile": "View Profile",
    "common.loading": "Loading...",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.back": "Back",
    "common.years": "years",
    "common.phototype": "Phototype",
    "common.patient": "Patient",
    "common.professional": "Professional",
    "common.areYouSure": "Are you sure?",
    // Dashboard
    "dashboard.welcome": "Welcome!",
    "dashboard.welcomeName": "Welcome",
    "dashboard.doctor": "Doctor",
    "dashboard.subtitle": "Your daily summary on LaserCode",
    "dashboard.viewProfile": "View Profile",
    "dashboard.registeredPatients": "Registered Patients",
    "dashboard.registeredProfessionals": "Registered Professionals",
    "dashboard.totalProcedures": "Total Procedures",
    "dashboard.lastCalculations": "Latest Calculations",
    "dashboard.viewAll": "View all",
    "dashboard.loadingCalculations": "Loading latest calculations...",
    "dashboard.noRecentCalculations": "No recent calculations.",
    "dashboard.calculation": "Calculation",
    "dashboard.procedure": "Procedure",
    "dashboard.region": "Region",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.newPatient": "New Patient",
    "dashboard.newProfessional": "New Professional",
    "dashboard.newCalculation": "New Calculation",
    "dashboard.viewHistory": "View History",
    "dashboard.aiChatbot": "AI Chatbot",
    "dashboard.referenceGuide": "Reference Guide",
    // Patients
    "patients.title": "Patients",
    "patients.subtitle": "Manage your patient database",
    "patients.newPatient": "New Patient",
    "patients.searchPlaceholder": "Search by name, phone...",
    "patients.noPatients": "No patients found",
    "patients.tryDifferentSearch": "Try a different search.",
    "patients.addFirst": "Start by adding a new patient.",
    // Professionals
    "professionals.title": "Professionals",
    "professionals.subtitle": "Manage doctors and specialists",
    "professionals.newProfessional": "New Professional",
    "professionals.searchPlaceholder": "Search by name, specialty...",
    "professionals.noProfessionals": "No professionals found",
    // Calculator
    "calculator.title": "Laser Calculator",
    "calculator.subtitle": "Intelligent dermatological laser parameter calculation",
    "calculator.selectPatient": "Select Patient",
    "calculator.selectProfessional": "Select Professional",
    "calculator.clinicalAssessment": "Clinical Assessment",
    "calculator.results": "Results",
    "calculator.limitReached": "Calculation Limit Reached",
    "calculator.limitMessage": "You have used all available calculations in your plan",
    "calculator.thisMonth": "this month",
    "calculator.upgradeMessage": "Upgrade to continue calculating parameters safely and accurately.",
    "calculator.unlockMore": "Unlock More Calculations",
    "calculator.expandCapacity": "Expand your capacity with a superior plan.",
    "calculator.viewPlans": "View Available Plans",
    // History
    "history.title": "Calculation History",
    "history.subtitle": "View all procedures performed",
    "history.searchPlaceholder": "Search by name...",
    "history.clearHistory": "Clear History",
    "history.deleteWarning": "This action cannot be undone. All your calculation records will be permanently deleted.",
    "history.adminWarning": "As an administrator, you will delete ALL USERS' HISTORY.",
    "history.yesDeleteAll": "Yes, Clear All",
    "history.noCalculationsFound": "No calculations found",
    "history.tryDifferentSearch": "Try a different search.",
    "history.goToCalculator": "Go to the calculator to get started.",
    // Prescriptions
    "prescriptions.title": "Medical Prescriptions",
    "prescriptions.subtitle": "Digital prescriptions and recipes",
    "prescriptions.newPrescription": "New Prescription",
    "prescriptions.searchPlaceholder": "Search by patient, professional or diagnosis...",
    "prescriptions.loading": "Loading prescriptions...",
    "prescriptions.noPrescriptionsFound": "No prescriptions found",
    "prescriptions.noPrescriptionsYet": "No prescriptions created yet",
    "prescriptions.draft": "Draft",
    "prescriptions.finalized": "Finalized",
    "prescriptions.sent": "Sent",
    // Plans
    "plans.title": "Manage Plan",
    "plans.subtitle": "Track your current plan and discover how to evolve further.",
    "plans.myPlan": "My Plan",
    "plans.activePlan": "Active Plan",
    "plans.whatsIncluded": "What's included",
    "plans.upgradeYourPlan": "Upgrade Your Plan",
    "plans.upgradeDescription": "Unlock advanced features and increase your service capacity.",
    "plans.upgrade": "Upgrade",
    "plans.maxPlan": "You're on the maximum plan!",
    "plans.maxPlanDescription": "Enjoy all unlimited features of LaserCode Master.",
    // About
    "aboutUs.title": "About Us",
    "aboutUs.subtitle": "Learn about Clube da Beleza and our products",
    "aboutUs.ourProducts": "Our Products",
    "aboutUs.accessPlatform": "Access Platform",
    "aboutUs.joinRevolution": "Join the Aesthetic Revolution",
    // Usage Counter
    "usageCounter.monthlyUsage": "Monthly Usage",
    "usageCounter.plan": "Plan",
    "usageCounter.of": "of",
    "usageCounter.unlimited": "Unlimited",
    "usageCounter.calculations": "calculations",
    "usageCounter.limitReached": "You've reached your plan limit!",
    "usageCounter.upgrade": "Upgrade",
    "usageCounter.nearLimit": "You're near the limit. Consider upgrading!",
  },
  'es': {
    // Navigation
    "nav.dashboard": "Panel de Control",
    "nav.patients": "Pacientes",
    "nav.professionals": "Profesionales",
    "nav.calculator": "Calculadora",
    "nav.prescriptions": "Recetas",
    "nav.history": "Historial",
    "nav.formulas": "Fórmulas Neo",
    "nav.reference": "Guía de Referencia",
    "nav.plans": "Planes",
    "nav.about": "Sobre Nosotros",
    "nav.tutorial": "Tutorial",
    "nav.support": "Soporte",
    "layout.subtitle": "Asistente IA de cálculos",
    "layout.navigation": "Navegación",
    "layout.adminControl": "Control",
    "layout.viewProfile": "Ver Perfil",
    "common.loading": "Cargando...",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.view": "Ver",
    "common.back": "Volver",
    "common.years": "años",
    "common.phototype": "Fototipo",
    "common.patient": "Paciente",
    "common.professional": "Profesional",
    "common.areYouSure": "¿Estás seguro?",
    // Dashboard
    "dashboard.welcome": "¡Bienvenido!",
    "dashboard.welcomeName": "Bienvenido",
    "dashboard.doctor": "Doctor(a)",
    "dashboard.subtitle": "Tu resumen diario en LaserCode",
    "dashboard.viewProfile": "Ver Perfil",
    "dashboard.registeredPatients": "Pacientes Registrados",
    "dashboard.registeredProfessionals": "Profesionales Registrados",
    "dashboard.totalProcedures": "Total de Procedimientos",
    "dashboard.lastCalculations": "Últimos Cálculos",
    "dashboard.viewAll": "Ver todos",
    "dashboard.loadingCalculations": "Cargando últimos cálculos...",
    "dashboard.noRecentCalculations": "Ningún cálculo reciente.",
    "dashboard.calculation": "Cálculo",
    "dashboard.procedure": "Procedimiento",
    "dashboard.region": "Región",
    "dashboard.quickActions": "Acciones Rápidas",
    "dashboard.newPatient": "Nuevo Paciente",
    "dashboard.newProfessional": "Nuevo Profesional",
    "dashboard.newCalculation": "Nuevo Cálculo",
    "dashboard.viewHistory": "Ver Historial",
    "dashboard.aiChatbot": "Chatbot con IA",
    "dashboard.referenceGuide": "Guía de Referencia",
    // Patients
    "patients.title": "Pacientes",
    "patients.subtitle": "Gestiona tu registro de pacientes",
    "patients.newPatient": "Nuevo Paciente",
    "patients.searchPlaceholder": "Buscar por nombre, teléfono...",
    "patients.noPatients": "Ningún paciente encontrado",
    "patients.tryDifferentSearch": "Intenta una búsqueda diferente.",
    "patients.addFirst": "Comienza añadiendo un nuevo paciente.",
    // Professionals
    "professionals.title": "Profesionales",
    "professionals.subtitle": "Gestiona el registro de médicos y especialistas",
    "professionals.newProfessional": "Nuevo Profesional",
    "professionals.searchPlaceholder": "Buscar por nombre, especialidad...",
    "professionals.noProfessionals": "Ningún profesional encontrado",
    // Calculator
    "calculator.title": "Calculadora Láser",
    "calculator.subtitle": "Cálculo inteligente de parámetros de láser dermatológico",
    "calculator.selectPatient": "Seleccionar Paciente",
    "calculator.selectProfessional": "Seleccionar Profesional",
    "calculator.clinicalAssessment": "Evaluación Clínica",
    "calculator.results": "Resultados",
    "calculator.limitReached": "Límite de Cálculos Alcanzado",
    "calculator.limitMessage": "Has utilizado todos los cálculos disponibles en tu plan",
    "calculator.thisMonth": "este mes",
    "calculator.upgradeMessage": "Actualiza para seguir calculando parámetros con seguridad y precisión.",
    "calculator.unlockMore": "Desbloquea Más Cálculos",
    "calculator.expandCapacity": "Amplía tu capacidad de atención con un plan superior.",
    "calculator.viewPlans": "Ver Planes Disponibles",
    // History
    "history.title": "Historial de Cálculos",
    "history.subtitle": "Consulta todos los procedimientos realizados",
    "history.searchPlaceholder": "Buscar por nombre...",
    "history.clearHistory": "Limpiar Historial",
    "history.deleteWarning": "Esta acción no se puede deshacer. Todos tus registros de cálculo serán eliminados permanentemente.",
    "history.adminWarning": "Como administrador, eliminarás EL HISTORIAL DE TODOS LOS USUARIOS.",
    "history.yesDeleteAll": "Sí, Limpiar Todo",
    "history.noCalculationsFound": "Ningún cálculo encontrado",
    "history.tryDifferentSearch": "Intenta una búsqueda diferente.",
    "history.goToCalculator": "Ve a la calculadora para empezar.",
    // Prescriptions
    "prescriptions.title": "Recetas Médicas",
    "prescriptions.subtitle": "Prescripciones y recetario digital",
    "prescriptions.newPrescription": "Nueva Receta",
    "prescriptions.searchPlaceholder": "Buscar por paciente, profesional o diagnóstico...",
    "prescriptions.loading": "Cargando recetas...",
    "prescriptions.noPrescriptionsFound": "Ninguna receta encontrada",
    "prescriptions.noPrescriptionsYet": "Ninguna receta creada todavía",
    "prescriptions.draft": "Borrador",
    "prescriptions.finalized": "Finalizada",
    "prescriptions.sent": "Enviada",
    // Plans
    "plans.title": "Gestionar Plan",
    "plans.subtitle": "Acompaña tu plan actual y descubre cómo evolucionar aún más.",
    "plans.myPlan": "Mi Plan",
    "plans.activePlan": "Plan Activo",
    "plans.whatsIncluded": "Qué está incluido",
    "plans.upgradeYourPlan": "Actualiza Tu Plan",
    "plans.upgradeDescription": "Desbloquea recursos avanzados y aumenta tu capacidad de atención.",
    "plans.upgrade": "Actualizar",
    "plans.maxPlan": "¡Estás en el plan máximo!",
    "plans.maxPlanDescription": "Disfruta de todos los recursos ilimitados de LaserCode Master.",
    // About
    "aboutUs.title": "Sobre Nosotros",
    "aboutUs.subtitle": "Conoce el Clube da Beleza y nuestros productos",
    "aboutUs.ourProducts": "Nuestros Productos",
    "aboutUs.accessPlatform": "Acceder a la Plataforma",
    "aboutUs.joinRevolution": "Sé Parte de la Revolución Estética",
    // Usage Counter
    "usageCounter.monthlyUsage": "Uso Mensual",
    "usageCounter.plan": "Plan",
    "usageCounter.of": "de",
    "usageCounter.unlimited": "Ilimitado",
    "usageCounter.calculations": "cálculos",
    "usageCounter.limitReached": "¡Has alcanzado el límite de tu plan!",
    "usageCounter.upgrade": "Actualizar",
    "usageCounter.nearLimit": "Estás cerca del límite. ¡Considera actualizar!",
  }
};

// Cache para traduções
const translationCache = {};
const pendingTranslations = {};
let translationTimeout = null;

export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Detectar idioma do navegador na primeira carga
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language || navigator.userLanguage;
      const matchedLang = SUPPORTED_LANGUAGES.find(l => 
        browserLang.startsWith(l.code.split('-')[0])
      );
      if (matchedLang) {
        setCurrentLanguage(matchedLang.code);
      }
    }
  }, []);

  // Carregar traduções quando o idioma mudar
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (langCode) => {
    // Se já temos em cache, usar
    if (translationCache[langCode]) {
      setTranslations(translationCache[langCode]);
      return;
    }

    // Para pt-BR, usar as traduções base (vazio, pois o código já está em PT)
    if (langCode === 'pt-BR') {
      const baseTranslations = {};
      translationCache[langCode] = baseTranslations;
      setTranslations(baseTranslations);
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se há traduções pré-definidas para este idioma
      const presetTranslations = PRESET_TRANSLATIONS[langCode] || {};

      // Carregar do localStorage
      const cached = localStorage.getItem(`translations_${langCode}`);
      let localTranslations = {};
      if (cached) {
        localTranslations = JSON.parse(cached);
      }

      // Mesclar: preset tem prioridade, depois localStorage
      const mergedTranslations = { ...localTranslations, ...presetTranslations };
      translationCache[langCode] = mergedTranslations;
      localStorage.setItem(`translations_${langCode}`, JSON.stringify(mergedTranslations));
      setTranslations(mergedTranslations);
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
    }
    setIsLoading(false);
  };

  const changeLanguage = async (langCode) => {
    // Processar traduções pendentes imediatamente antes de trocar
    if (translationTimeout) {
      clearTimeout(translationTimeout);
      translationTimeout = null;
    }
    
    if (pendingTranslations[langCode] && Object.keys(pendingTranslations[langCode]).length > 0) {
      await processPendingTranslations(langCode);
    }
    
    setCurrentLanguage(langCode);
    localStorage.setItem('userLanguage', langCode);
    
    // Atualizar direção do texto para árabe
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    
    // Forçar re-render
    const cached = translationCache[langCode];
    if (cached) {
      setTranslations({ ...cached });
    }
  };

  // Função de tradução principal
  const t = (key, defaultText = key) => {
    if (currentLanguage === 'pt-BR') {
      return defaultText;
    }

    // Verificar no cache
    if (translations[key]) {
      return translations[key];
    }

    // Adicionar à fila de traduções pendentes (batch)
    if (defaultText && defaultText !== key && !pendingTranslations[currentLanguage]?.[key]) {
      if (!pendingTranslations[currentLanguage]) {
        pendingTranslations[currentLanguage] = {};
      }
      pendingTranslations[currentLanguage][key] = defaultText;
      
      // Agendar tradução em lote após 2 segundos
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
      translationTimeout = setTimeout(() => {
        processPendingTranslations(currentLanguage);
      }, 800);
    }

    // Retornar texto padrão enquanto não tem tradução
    return defaultText;
  };

  // Processar traduções em lote
  const processPendingTranslations = async (targetLang) => {
    const pending = pendingTranslations[targetLang];
    if (!pending || Object.keys(pending).length === 0) return;

    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
    if (!langInfo) return;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Traduza cada texto do Português para ${langInfo.name}. Mantenha a estrutura JSON.

${JSON.stringify(pending, null, 2)}`,
        response_json_schema: {
          type: "object",
          properties: {
            translations: {
              type: "object",
              additionalProperties: { type: "string" }
            }
          }
        }
      });

      if (response.translations) {
        const newTranslations = { ...translationCache[targetLang] || {}, ...response.translations };
        translationCache[targetLang] = newTranslations;
        localStorage.setItem(`translations_${targetLang}`, JSON.stringify(newTranslations));
        
        if (targetLang === currentLanguage) {
          setTranslations({ ...newTranslations });
        }
        
        pendingTranslations[targetLang] = {};
      }
    } catch (error) {
      console.error('Erro ao processar traduções:', error);
      pendingTranslations[targetLang] = {};
    }
  };

  // Tradução automática via IA (para uso no painel admin)
  const translateTexts = async (textsObject, targetLang) => {
    try {
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
      if (!langInfo) return;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Traduza cada valor do JSON do Português para ${langInfo.name}. Preserve formatação e emojis.

${JSON.stringify(textsObject, null, 2)}`,
        response_json_schema: {
          type: "object",
          properties: {
            translations: {
              type: "object",
              additionalProperties: { type: "string" }
            }
          }
        }
      });

      if (response.translations) {
        translationCache[targetLang] = { ...translationCache[targetLang] || {}, ...response.translations };
        localStorage.setItem(`translations_${targetLang}`, JSON.stringify(translationCache[targetLang]));
        
        if (targetLang === currentLanguage) {
          setTranslations(translationCache[targetLang]);
        }
        
        return response.translations;
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translateTexts,
    SUPPORTED_LANGUAGES
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation deve ser usado dentro de TranslationProvider');
  }
  return context;
}