import React, { useState, useEffect } from "react";
import { Patient } from "@/entities/Patient";
import { Professional } from "@/entities/Professional";
import { LaserCalculation } from "@/entities/LaserCalculation";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TermsModal from "../components/auth/TermsModal";
import { base44 } from "@/api/base44Client";
import UsageCounter from "../components/shared/UsageCounter";
import { checkAndResetMonthlyUsage } from "../components/utils/usageReset";
import PageBlockChecker from "../components/system/PageBlockChecker";
import {
  Users,
  UserCheck,
  Calculator,
  TrendingUp,
  Activity,
  Plus,
  BookOpen,
  UserCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BannerDisplay from "../components/dashboard/BannerDisplay";
import BannerPopup from "../components/dashboard/BannerPopup";
import LaserViabilityCalculator from "../components/dashboard/LaserViabilityCalculator";
import { useTranslation } from "@/components/i18n/TranslationContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    patients: 0,
    professionals: 0,
    calculations: 0,
    recentCalculations: []
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let user = await User.me();
      
      // Verifica e reseta o contador se necessário (início de novo mês)
      user = await checkAndResetMonthlyUsage(user);
      
      // Atualizar último login e registrar tempo de uso
      await base44.auth.updateMe({ 
        last_login: new Date().toISOString()
      });
      
      setCurrentUser(user);

      if (user && !user.terms_accepted) {
        setShowTermsModal(true);
      }

      let patientsPromise, professionalsPromise, calculationsPromise;

      if (user.role === 'admin') {
        patientsPromise = Patient.list();
        professionalsPromise = Professional.list();
        calculationsPromise = LaserCalculation.list('-created_date');
      } else {
        const filter = { created_by: user.email };
        patientsPromise = Patient.filter(filter);
        professionalsPromise = Professional.filter(filter);
        calculationsPromise = LaserCalculation.filter(filter, '-created_date');
      }

      const [patients, professionals, allCalculations] = await Promise.all([
        patientsPromise,
        professionalsPromise,
        calculationsPromise
      ]);

      setStats({
        patients: patients.length,
        professionals: professionals.length,
        calculations: allCalculations.length,
        recentCalculations: allCalculations.slice(0, 5)
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
    setLoading(false);
  };

  const handleAcceptTerms = async () => {
    setIsAcceptingTerms(true);
    try {
      await base44.auth.updateMe({ terms_accepted: true });
      setCurrentUser(prevUser => ({ ...prevUser, terms_accepted: true }));
      setShowTermsModal(false);
    } catch (error) {
      console.error("Erro ao aceitar os termos:", error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
    }
    setIsAcceptingTerms(false);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return t("dashboard.doctor", "Doutor(a)");
    return fullName.split(' ')[0];
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold text-slate-900">{loading ? '...' : value}</div>
        <Link to={link}>
          <p className="text-xs text-slate-500 hover:text-blue-600 transition-colors mt-1">Ver todos &rarr;</p>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <PageBlockChecker pageName="Dashboard">
    <div className="w-full max-w-7xl mx-auto">
      {/* Banner Popup */}
      <BannerPopup />
      <TermsModal 
        open={showTermsModal}
        loading={isAcceptingTerms}
        onAccept={handleAcceptTerms}
      />


      {/* Promo Card - Calculadora Inteligente */}
      <div className="sticky top-0 z-30 mb-4">
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl ring-1 ring-black/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Calculadora Inteligente de Parâmetros de Laser</h2>
              <p className="text-xs sm:text-sm text-white/90">
                Ajuste parâmetros com base em tecnologia, fototipo, região tratada e alvo terapêutico.
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <Link to={createPageUrl('Calculator')}>
            <Button className="bg-white text-indigo-700 hover:bg-white/90 font-semibold">
              Abrir Calculadora
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Ferramenta desenvolvida para auxiliar profissionais na definição de parâmetros técnicos de lasers dermatológicos com base em variáveis clínicas.
        </p>


      </div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? t("dashboard.welcome", "Bem-vindo!") : `${t("dashboard.welcomeName", "Bem-vindo")}, ${getFirstName(currentUser?.full_name)}!`}
            </h1>
            <p className="text-slate-600 text-sm md:text-lg">{t("dashboard.subtitle", "Seu resumo diário no LaserSafe")}</p>
          </div>
          {!loading && (
            <Link to={createPageUrl("Profile")}>
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors">
                <UserCircle className="w-4 h-4 mr-2" />
                {t("dashboard.viewProfile", "Ver Perfil")}
              </Button>
            </Link>
          )}
        </div>
        
        {currentUser && !loading && (
          <div className="w-full lg:w-auto lg:min-w-[280px]">
            <UsageCounter 
              currentUsage={currentUser.calculations_this_month || 0}
              plan={currentUser.current_plan || 'Essencial'}
              size="small"
              showUpgradeButton={true}
            />
          </div>
        )}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              <Activity className="inline-block w-5 h-5 mr-2 text-blue-500" />
              {t("dashboard.lastCalculations", "Últimas Calculações")}
            </CardTitle>
            <Link to={createPageUrl("History")}>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">{t("dashboard.viewAll", "Ver todas")}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500">{t("dashboard.loadingCalculations", "Carregando últimas calculações...")}</p>
            ) : stats.recentCalculations.length === 0 ? (
              <p className="text-center text-slate-500">{t("dashboard.noRecentCalculations", "Nenhuma calculação recente.")}</p>
            ) : (
              <ul className="space-y-4">
                {stats.recentCalculations.map((calc) => (
                  <li key={calc.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-800">
                        {t("dashboard.calculation", "Calculação")} #{calc.id.slice(-6)}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold">{calc.procedure_type || t("dashboard.procedure", "Procedimento")}</span> - {calc.region || t("dashboard.region", "Região")}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 text-right">
                      {format(new Date(calc.created_date), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              <Plus className="inline-block w-5 h-5 mr-2 text-green-500" />
              {t("dashboard.quickActions", "Ações Rápidas")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to={createPageUrl("Patients")}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-md">
                <Users className="w-4 h-4 mr-2" /> {t("dashboard.newPatient", "Novo Paciente")}
              </Button>
            </Link>
            <Link to={createPageUrl("Professionals")}>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white shadow-md">
                <UserCheck className="w-4 h-4 mr-2" /> {t("dashboard.newProfessional", "Novo Profissional")}
              </Button>
            </Link>
            <Link to={createPageUrl("Calculator")}>
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-md">
                <Calculator className="w-4 h-4 mr-2" /> {t("dashboard.newCalculation", "Nova Calculação")}
              </Button>
            </Link>
            <Link to={createPageUrl("History")}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                <TrendingUp className="w-4 h-4 mr-2" /> {t("dashboard.viewHistory", "Ver Histórico")}
              </Button>
            </Link>
            <Link to={createPageUrl("Tutorial")}>
              <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md">
                <GraduationCap className="w-4 h-4 mr-2" /> {t("dashboard.tutorial", "Tutorial")}
              </Button>
            </Link>
            <Link to={createPageUrl("Reference")}>
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white shadow-md">
                <BookOpen className="w-4 h-4 mr-2" /> {t("dashboard.referenceGuide", "Guia de Referência")}
              </Button>
            </Link>

            <a href="https://mapa-da-estetica.base44.app" target="_blank" rel="noopener noreferrer" className="sm:col-span-2">
              <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:bg-emerald-100 transition-colors">
                <div className="text-emerald-700 font-semibold">Seja referência na sua região</div>
                <div className="text-sm text-emerald-800 flex-1">Patrocínio: Mapa da Estética — crie seu perfil verificado, ganhe visibilidade regional e atraia pacientes qualificados.</div>
                <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-200">Conhecer</Button>
              </div>
            </a>
          </CardContent>


        </Card>
      </div>

      {/* Estatísticas (reposicionado para baixo no mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8" id="dashboard-metrics">
        <StatCard
          title={t("dashboard.registeredPatients", "Pacientes Cadastrados")}
          value={stats.patients}
          icon={Users}
          color="text-blue-500"
          link={createPageUrl("Patients")}
        />
        <StatCard
          title={t("dashboard.registeredProfessionals", "Profissionais Cadastrados")}
          value={stats.professionals}
          icon={UserCheck}
          color="text-green-500"
          link={createPageUrl("Professionals")}
        />
        <StatCard
          title={t("dashboard.totalProcedures", "Total de Procedimentos")}
          value={stats.calculations}
          icon={Calculator}
          color="text-purple-500"
          link={createPageUrl("History")}
        />
      </div>

      {/* Banner Display */}
      <div className="mb-6">
        <BannerDisplay />
      </div>


    </div>
    </PageBlockChecker>
  );
}