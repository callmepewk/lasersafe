import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Sparkles, Users, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "@/components/i18n/TranslationContext";
import PageBlockChecker from "../components/system/PageBlockChecker";

export default function AboutUs() {
  const { t } = useTranslation();
  const products = [
    {
      name: "Mapa da Estética",
      description: "Encontre os melhores profissionais e clínicas de estética perto de você. Mapa interativo completo com avaliações e especialidades.",
      url: "https://mapa-da-estetica.base44.app",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cc60a6e0333ee14c886a23/aff3c81b3_mapaimg.jpg"
    },
    {
      name: "Clube da Beleza",
      description: "Comunidade exclusiva para profissionais da estética. Networking, cursos, eventos e conteúdo especializado.",
      url: "https://clube-da-beleza.base44.app",
      icon: Award,
      color: "from-pink-500 to-pink-600",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cc60a6e0333ee14c886a23/0868c4f1b_clubeimg.jpeg"
    },
    {
      name: "DermaHelp",
      description: "O aplicativo completo para profissionais cuidadores da pele, com análise de pele por IA, gestão de pacientes, agendamentos e relatórios detalhados.",
      url: "https://dermahelp.base44.app",
      icon: Sparkles,
      color: "from-indigo-500 to-indigo-600",
      image: null
    },
    {
      name: "Celeiro Digital",
      description: "Transformando vidas através da educação digital e tecnológica em Porto Firme.",
      url: "https://celeirodigital.base44.app",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      image: null
    }
  ];

  const handleProductClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageBlockChecker pageName="AboutUs">
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
          <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t("aboutUs.title", "Sobre Nós")}</h1>
          <p className="text-slate-600 text-sm md:text-lg">{t("aboutUs.subtitle", "Conheça o Clube da Beleza e nossos produtos")}</p>
        </div>
      </div>

      {/* Sobre o Clube da Beleza */}
      <Card className="mb-8 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl text-slate-900">{t("aboutUs.clubName", "Clube da Beleza")}</CardTitle>
              <p className="text-slate-600 mt-1">{t("aboutUs.clubTagline", "Inovação e excelência em tecnologia estética")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed">
              O <strong>Clube da Beleza</strong> é uma plataforma pioneira que une tecnologia de ponta 
              com conhecimento especializado em estética e dermatologia. Nossa missão é empoderar 
              profissionais da área com ferramentas inteligentes que otimizam processos, melhoram 
              resultados e elevam o padrão de atendimento.
            </p>
            
            <p className="text-lg text-slate-700 leading-relaxed">
              Acreditamos que a combinação entre experiência humana e inteligência artificial é o 
              futuro da estética. Por isso, desenvolvemos soluções que auxiliam na tomada de decisões 
              clínicas, garantindo mais segurança, precisão e satisfação para profissionais e pacientes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t("aboutUs.advancedTech", "Tecnologia Avançada")}</h3>
              <p className="text-sm text-slate-600">
                {t("aboutUs.advancedTechDesc", "Inteligência artificial e machine learning aplicados à dermatologia estética")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t("aboutUs.trustSafety", "Confiança & Segurança")}</h3>
              <p className="text-sm text-slate-600">
                {t("aboutUs.trustSafetyDesc", "Protocolos validados e baseados em evidências científicas atualizadas")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t("aboutUs.provenResults", "Resultados Comprovados")}</h3>
              <p className="text-sm text-slate-600">
                {t("aboutUs.provenResultsDesc", "Otimização de tratamentos com aumento de eficiência e satisfação")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nossos Produtos */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("aboutUs.ourProducts", "Nossos Produtos")}</h2>
        <p className="text-slate-600">
          {t("aboutUs.ourProductsDesc", "Conheça nossas soluções desenvolvidas para transformar a estética")}
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {products.map((product, index) => (
          <Card 
            key={index} 
            className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
            onClick={() => handleProductClick(product.url)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Image/Icon Section */}
                {product.image ? (
                  <div className="relative md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-20`}></div>
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br ${product.color} p-8 md:p-12 flex items-center justify-center md:w-48 flex-shrink-0`}>
                    <product.icon className="w-20 h-20 md:w-24 md:h-24 text-white" />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  <Button 
                    className={`bg-gradient-to-r ${product.color} hover:opacity-90 transition-opacity shadow-lg group-hover:shadow-xl`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.url);
                    }}
                  >
                    {t("aboutUs.accessPlatform", "Acessar Plataforma")}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl">
        <CardContent className="p-8 md:p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">{t("aboutUs.joinRevolution", "Faça Parte da Revolução Estética")}</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            {t("aboutUs.joinRevolutionDesc", "Junte-se a milhares de profissionais que já utilizam nossas ferramentas para oferecer tratamentos mais seguros, precisos e eficientes.")}
          </p>
          <Button 
            className="bg-white text-pink-600 hover:bg-slate-100 font-semibold text-lg px-8 py-6"
            onClick={() => handleProductClick('https://clube-da-beleza.base44.app')}
          >
            {t("aboutUs.knowClub", "Conhecer o Clube da Beleza")}
            <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
    </PageBlockChecker>
  );
}