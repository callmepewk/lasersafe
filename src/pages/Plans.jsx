import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Check, Star, TrendingUp, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/i18n/TranslationContext';
import PageBlockChecker from '../components/system/PageBlockChecker';

const allPlans = [
  {
    name: 'Essencial',
    price: 'R$997',
    description: 'Ideal para profissionais autônomos iniciando com laser.',
    features: [
      'Até 20 cálculos/mês',
      'Cadastro de Pacientes',
      'Cadastro de Profissionais',
      'Histórico de Cálculos',
      'Suporte via Email'
    ],
    level: 1,
    buttonClass: "bg-slate-700 hover:bg-slate-800",
    link: "https://pay.hotmart.com/P102484576Y?off=kdc4kwyz&checkoutMode=10"
  },
  {
    name: 'Pro',
    price: 'R$1997',
    description: 'Para profissionais com volume médio de atendimentos.',
    features: [
      'Até 100 cálculos/mês',
      'Tudo do plano Essencial',
      'Exportação de relatórios (PDF)',
      'Dashboard analítico',
      'Suporte Prioritário'
    ],
    level: 2,
    badge: 'Mais Popular',
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    link: "https://pay.hotmart.com/P102484576Y?off=f76mab34&checkoutMode=10"
  },
  {
    name: 'Master',
    price: 'R$2297',
    description: 'Solução completa para profissionais de alta performance.',
    features: [
      'Cálculos ilimitados',
      'Tudo do plano Pro',
      'Integração com prontuário eletrônico',
      'Múltiplas filiais',
      'Suporte Prioritário'
    ],
    level: 3,
    badge: 'Avançado',
    buttonClass: "bg-purple-600 hover:bg-purple-700",
    link: "https://pay.hotmart.com/P102484576Y?off=rarpfphp&checkoutMode=10"
  }
];

export default function Plans() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userPlanName = currentUser?.current_plan || 'Essencial';
  const currentPlan = allPlans.find(p => p.name === userPlanName);
  const availableUpgrades = allPlans.filter(p => p.level > (currentPlan?.level || 1));
  const isMaxPlan = availableUpgrades.length === 0;

  return (
    <PageBlockChecker pageName="Plans">
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-4">
          <Layers className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">{t("plans.title", "Gerenciar Plano")}</h1>
        <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          {t("plans.subtitle", "Acompanhe seu plano atual e descubra como evoluir ainda mais.")}
        </p>
      </div>

      {/* Meu Plano Atual */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t("plans.myPlan", "Meu Plano")}</h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl">
            <CardHeader className="text-center pt-8 pb-4">
              <Badge className="mx-auto mb-3 bg-blue-600 text-white text-sm px-4 py-1">
                {t("plans.activePlan", "Plano Ativo")}
              </Badge>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900">{currentPlan?.name}</CardTitle>
              <p className="text-2xl md:text-3xl font-semibold text-blue-700 mt-3">{currentPlan?.price}</p>
              <p className="text-sm md:text-base text-slate-600 mt-2">{currentPlan?.description}</p>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-8">
              <div className="bg-white/70 rounded-xl p-6 shadow-inner">
                <h4 className="font-semibold text-slate-800 mb-4 text-lg">{t("plans.whatsIncluded", "O que está incluído")}:</h4>
                <ul className="space-y-3">
                  {currentPlan?.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-base text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upgrades Disponíveis */}
      {!isMaxPlan && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t("plans.upgradeYourPlan", "Faça Upgrade do Seu Plano")}</h2>
          </div>
          <p className="text-slate-600 mb-8 text-base md:text-lg">
            {t("plans.upgradeDescription", "Desbloqueie recursos avançados e aumente sua capacidade de atendimento.")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {availableUpgrades.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:scale-105 transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="text-center pt-6 md:pt-8 pb-4">
                    {plan.badge && (
                      <Badge className={`mx-auto mb-3 ${plan.name === 'Pro' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {plan.badge}
                      </Badge>
                    )}
                    <CardTitle className="text-2xl md:text-3xl font-bold">{plan.name}</CardTitle>
                    <p className="text-xl md:text-2xl font-semibold text-slate-800 mt-2">{plan.price}</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                          <span className="text-sm md:text-base text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 md:p-8 pt-0">
                    <Button 
                      className={`w-full text-base md:text-lg py-5 md:py-6 ${plan.buttonClass}`}
                      onClick={() => window.open(plan.link, '_blank')}
                    >
                      {t("plans.upgrade", "Fazer Upgrade")}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {isMaxPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <Star className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("plans.maxPlan", "Você está no plano máximo!")}</h3>
          <p className="text-slate-600 text-lg">
            {t("plans.maxPlanDescription", "Aproveite todos os recursos ilimitados do LaserCode Master.")}
          </p>
        </motion.div>
      )}
    </div>
    </PageBlockChecker>
  );
}