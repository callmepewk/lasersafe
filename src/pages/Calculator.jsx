import React, { useState, useEffect } from "react";
import { Patient } from "@/entities/Patient";
import { LaserCalculation } from "@/entities/LaserCalculation";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator as CalculatorIcon, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import UsageCounter from "../components/shared/UsageCounter";
import PatientSelectionStep from "../components/calculator/PatientSelectionStep";
import ProfessionalSelectionStep from "../components/calculator/ProfessionalSelectionStep";
import AssessmentStep from "../components/calculator/AssessmentStep";
import CalculationResults from "../components/calculator/CalculationResults";
import { checkAndResetMonthlyUsage } from "../components/utils/usageReset";
import { useTranslation } from "@/components/i18n/TranslationContext";
import PageBlockChecker from "../components/system/PageBlockChecker";
import { calculateLaserParametersWithModel } from "../components/calculator/laserMathEngine";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function Calculator() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [calculationResults, setCalculationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    checkUsageLimit();
  }, []);

  const checkUsageLimit = async () => {
    try {
      let user = await base44.auth.me();
      
      // Verifica e reseta o contador se necessário (início de novo mês)
      user = await checkAndResetMonthlyUsage(user);
      
      setCurrentUser(user);
      
      const limits = {
        'Essencial': 20,
        'Pro': 100,
        'Master': Infinity
      };
      
      const userLimit = limits[user.current_plan] || 20;
      const currentUsage = user.calculations_this_month || 0;
      
      if (currentUsage >= userLimit && user.current_plan !== 'Master') {
        setIsBlocked(true);
      } else {
        setIsBlocked(false); // Ensure it's unblocked if conditions are met
      }
    } catch (error) {
      console.error("Erro ao verificar limite:", error);
      // Handle error case, e.g., if user data can't be fetched
      setIsBlocked(false); // Don't block if we can't verify status
    }
  };

  const steps = [
    { number: 1, title: t("calculator.selectPatient", "Selecionar Paciente"), completed: selectedPatient !== null },
    { number: 2, title: t("calculator.selectProfessional", "Selecionar Profissional"), completed: selectedProfessional !== null },
    { number: 3, title: t("calculator.clinicalAssessment", "Avaliação Clínica"), completed: assessment !== null },
    { number: 4, title: t("calculator.results", "Resultados"), completed: calculationResults !== null }
  ];

  const performInitialCalculation = async (assessmentData) => {
    setIsCalculating(true);
    setAssessment(assessmentData);
    try {
      // Calcular parâmetros básicos
      const basicResults = await calculateLaserParameters(assessmentData);
      
      // Calcular parâmetros avançados com IA
      const advancedResults = await calculateAdvancedParameters(assessmentData, basicResults);
      
      // Combinar resultados
      const combinedResults = {
        ...basicResults,
        advancedCalculation: advancedResults
      };
      
      setCalculationResults(combinedResults);
      setCurrentStep(4);
    } catch (error) {
      console.error('Erro no cálculo inicial:', error);
      alert('Erro ao calcular parâmetros. Tente novamente.');
    }
    setIsCalculating(false);
  };
  
  const saveFinalCalculation = async (finalParams, originalParams, reasoning) => {
      try {
        const payload = {
            patient_id: selectedPatient?.id || `temp_${Date.now()}`,
            professional_id: selectedProfessional.id,
            ...assessment,
            ...finalParams,
            is_adjusted: !!originalParams,
            original_parameters: originalParams ? JSON.stringify(originalParams) : null,
            adjustment_reasoning: reasoning || null,
            session_date: new Date().toISOString().split('T')[0]
        };
        // Garante que os campos "other" não sejam nulos
        if (!payload.other_procedure_type) payload.other_procedure_type = "";
        if (!payload.other_laser_type) payload.other_laser_type = "";

        await LaserCalculation.create(payload);

        // Atualizar dados do paciente com informações da avaliação clínica
        const patientUpdateData = {};
        if (assessment.skin_color) patientUpdateData.skin_tone = assessment.skin_color;
        if (assessment.skin_sensitivity) patientUpdateData.skin_sensitivity = assessment.skin_sensitivity;
        if (assessment.glogau_scale) patientUpdateData.glogau_scale = assessment.glogau_scale;
        if (assessment.acne_scar_classification) patientUpdateData.acne_scar_classification = assessment.acne_scar_classification;
        if (assessment.leeds_acne_scale) patientUpdateData.leeds_acne_scale = assessment.leeds_acne_scale;

        if (Object.keys(patientUpdateData).length > 0 && selectedPatient?.id && !selectedPatient.is_temp) {
          await Patient.update(selectedPatient.id, patientUpdateData);
        }

        // Incrementar AMBOS os contadores: mensal e total
        if (currentUser) {
          const updatedMonthlyCount = (currentUser.calculations_this_month || 0) + 1;
          const updatedTotalCount = (currentUser.total_calculations || 0) + 1;

          await base44.auth.updateMe({ 
            calculations_this_month: updatedMonthlyCount,
            total_calculations: updatedTotalCount
          });

          // Recarregar dados do usuário para atualizar o contador na tela
          const updatedUser = await base44.auth.me();
          setCurrentUser(updatedUser);
        }

      } catch (error) {
          console.error("Erro ao salvar cálculo final:", error);
      }
  };

  const calculateLaserParameters = async (data) => {
    return calculateLaserParametersWithModel(data);
  };

  const calculateAdvancedParameters = async (assessmentData, basicResults) => {
    try {
      const drBelezaPhotoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cc60a6e0333ee14c886a23/9dcacc945_drbeleza.png";
      
      const procedure = assessmentData.procedure_type === 'Outro' ? assessmentData.other_procedure_type : assessmentData.procedure_type;
      const laser = assessmentData.laser_type === 'Outro' ? assessmentData.other_laser_type : assessmentData.laser_type;
      
      const prompt = `Você é o Dr. Beleza, especialista renomado em lasers dermatológicos e parâmetros avançados de equipamentos.

DADOS CLÍNICOS DO CASO:

ESPECIFICAÇÕES DO EQUIPAMENTO (OBRIGATÓRIO CONSIDERAR):
${JSON.stringify({ brand: (assessmentData.device_info||{}).brand, model: (assessmentData.device_info||{}).model, type: (assessmentData.device_info||{}).type, wavelength: (assessmentData.device_info||{}).wavelength, description: (assessmentData.device_info||{}).description }, null, 2)}
- Laser/Tecnologia: ${laser}
- Ponteira: ${assessmentData.handpiece_type || 'Não especificada'}
- Procedimento: ${procedure}
- Região Tratada: ${assessmentData.region}
- Fototipo: ${assessmentData.phototype}
- Idade do Paciente: ${assessmentData.patient_age} anos
- Sensibilidade da Pele: ${assessmentData.skin_sensitivity || 'Normal'}
- Tipo de Alvo: ${assessmentData.target_type}
- Nível de Agressividade: ${assessmentData.aggressiveness_level}
- Intensidade do Resfriamento: ${assessmentData.cooling_intensity}/5
- Unidade de Medida Selecionada: ${assessmentData.fluence_unit}

PARÂMETROS FRACIONADOS CONFIGURADOS:
- Forma do Feixe: ${assessmentData.beam_shape || 'Não configurado'}
- Área de Varredura: ${assessmentData.scan_area || 'Não configurado'}
- Área Personalizada: ${assessmentData.scan_area_custom || 'N/A'}
- Densidade de Pontos: ${assessmentData.dot_density || 'N/A'} dots/cm²
- Padrão de Aplicação: ${assessmentData.application_pattern || 'Não configurado'}
- Modo de Varredura: ${assessmentData.scan_mode || 'Não configurado'}
- Nível de Profundidade Selecionado: ${assessmentData.depth_level}/5

PARÂMETROS BÁSICOS JÁ CALCULADOS:
- Fluência: ${basicResults.fluence} ${assessmentData.fluence_unit}
- Duração de Pulso: ${basicResults.pulse_duration} ms
- Spot Size: ${basicResults.spot_size} mm
- Frequência: ${basicResults.frequency} Hz
- Resfriamento: ${basicResults.cooling_intensity}/5
- Profundidade de Penetração: ${basicResults.optical_thermal_model?.penetration_depth_mm || 'N/A'} mm
- Energia Absorvida: ${basicResults.optical_thermal_model?.absorbed_energy_density || 'N/A'}
- ΔT estimado: ${basicResults.optical_thermal_model?.delta_temperature_c || 'N/A'} °C
- TRT: ${basicResults.optical_thermal_model?.thermal_relaxation_time_s || 'N/A'} s
- Razão pulso/TRT: ${basicResults.optical_thermal_model?.pulse_trt_ratio || 'N/A'}
- Dano Arrhenius: ${basicResults.optical_thermal_model?.arrhenius_damage || 'N/A'}
- Seletividade cromóforo: ${basicResults.optical_thermal_model?.chromophore_selectivity || 'N/A'}
- Energia total entregue: ${basicResults.optical_thermal_model?.total_energy_delivered_j || 'N/A'} J
- Overlap estimado: ${basicResults.optical_thermal_model?.overlap_ratio || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TAREFA - ANÁLISE COMPLETA E DETALHADA PARA O PROFISSIONAL:

Como Dr. Beleza, forneça uma análise EXTREMAMENTE TÉCNICA e COMPLETA que o profissional possa usar DIRETAMENTE no console do aparelho:

1. **ENERGIA TOTAL IDEAL (mJ)**:
   - Calcule a energia total em milijoules considerando a fluência (${basicResults.fluence} ${assessmentData.fluence_unit}) e a área do spot (${basicResults.spot_size}mm)
   - Forneça: energia_minima_mj, energia_maxima_mj, energia_ideal_mj
   - Contextualize na unidade de medida ${assessmentData.fluence_unit}

2. **TEMPO DE PULSO OTIMIZADO (ms)**:
   - Baseado no alvo (${assessmentData.target_type}) e tecnologia (${laser})
   - Forneça: tempo_pulso_minimo_ms, tempo_pulso_maximo_ms, tempo_pulso_ideal_ms
   - Explique a relação com o tempo de relaxamento térmico do alvo

3. **JUSTIFICATIVA TÉCNICA COMPLETA**:
   - Explique DETALHADAMENTE por que esses valores são ideais
   - Considere fototipo, alvo, tecnologia, ponteira e todos os parâmetros fracionados
   - Use linguagem técnica mas aplicável

4. **SUGESTÕES PRÁTICAS DE APLICAÇÃO NO CONSOLE**:
   - Como configurar o aparelho (número de passes, sobreposição, velocidade de varredura)
   - Técnica de aplicação manual vs automática
   - Sequência de aplicação na região
   - Configurações específicas do console do fabricante

5. **VARIAÇÕES BASEADAS EM PROFUNDIDADE**:
   - Se o profissional mudar o nível de profundidade atual (${assessmentData.depth_level}), quais OUTROS parâmetros devem ser ajustados?
   - Forneça combinações ESPECÍFICAS: "Se usar profundidade 4, então energia X, modo Y, densidade Z"
   - Mínimo 3 variações diferentes

6. **ALERTAS TÉCNICOS CRÍTICOS**:
   - Cuidados específicos para ESTE caso
   - Contraindicações absolutas ou relativas
   - Pontos de atenção durante o procedimento

7. **INTEGRAÇÃO COM UNIDADE DE MEDIDA (${assessmentData.fluence_unit})**:
   - Explique como converter/contextualizar os valores para a unidade selecionada
   - Certifique-se de que TODOS os cálculos estejam corretos para ${assessmentData.fluence_unit}

Seja EXTREMAMENTE técnico, preciso e forneça informações que um profissional de dermatologia possa aplicar DIRETAMENTE no console do aparelho, sem ambiguidades.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        file_urls: [drBelezaPhotoUrl],
        response_json_schema: {
          type: "object",
          properties: {
            energia_minima_mj: { type: "number" },
            energia_maxima_mj: { type: "number" },
            energia_ideal_mj: { type: "number" },
            tempo_pulso_minimo_ms: { type: "number" },
            tempo_pulso_maximo_ms: { type: "number" },
            tempo_pulso_ideal_ms: { type: "number" },
            justificativa_detalhada: { type: "string" },
            sugestoes_aplicacao: { type: "array", items: { type: "string" } },
            variacoes_profundidade: { type: "array", items: { type: "string" } },
            alertas_tecnicos: { type: "array", items: { type: "string" } },
            observacoes_unidade_medida: { type: "string" }
          },
          required: ["energia_ideal_mj", "tempo_pulso_ideal_ms", "justificativa_detalhada", "sugestoes_aplicacao", "variacoes_profundidade"]
        }
      });

      return response;
    } catch (error) {
      console.error('Erro ao calcular parâmetros avançados:', error);
      return null;
    }
  };

  const resetCalculation = () => {
    setCurrentStep(1);
    setSelectedPatient(null);
    setSelectedProfessional(null);
    setAssessment(null);
    setCalculationResults(null);
  };

  const StepIndicator = () => (
    <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex justify-between items-center overflow-x-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.completed ? 'bg-green-500 text-white' : 
                  step.number === currentStep ? 'bg-blue-500 text-white' : 
                  'bg-slate-200 text-slate-600'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-3 text-sm font-medium hidden sm:inline ${
                  step.completed || step.number === currentStep ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-grow h-0.5 mx-4 ${
                  step.completed ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isBlocked) {
    return (
      <PageBlockChecker pageName="Calculator">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 print:hidden">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <CalculatorIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t("calculator.title", "Calculadora Laser")}</h1>
            <p className="text-slate-600 text-sm md:text-lg">{t("calculator.subtitle", "Cálculo inteligente de parâmetros de laser dermatológico")}</p>
          </div>
        </div>

        <Alert className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 mb-6">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 font-semibold">{t("calculator.limitReached", "Limite de Cálculos Atingido")}</AlertTitle>
          <AlertDescription className="text-orange-800">
            {t("calculator.limitMessage", "Você utilizou todos os cálculos disponíveis no seu plano")} <strong>{currentUser?.current_plan}</strong> {t("calculator.thisMonth", "este mês")}.
            {t("calculator.upgradeMessage", "Faça upgrade para continuar calculando parâmetros com segurança e precisão.")}
          </AlertDescription>
        </Alert>

        {currentUser && (
          <div className="mb-6">
            <UsageCounter 
              currentUsage={currentUser.calculations_this_month || 0}
              plan={currentUser.current_plan || 'Essencial'}
              showUpgradeButton={false}
            />
          </div>
        )}

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalculatorIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {t("calculator.unlockMore", "Desbloqueie Mais Cálculos")}
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {t("calculator.expandCapacity", "Amplie sua capacidade de atendimento com um plano superior. Mais cálculos, mais recursos, mais resultados.")}
            </p>
            <Link to={createPageUrl('Plans')}>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6">
                {t("calculator.viewPlans", "Ver Planos Disponíveis")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </PageBlockChecker>
    );
  }

  return (
    <PageBlockChecker pageName="Calculator">
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 print:hidden">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <CalculatorIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Calculadora Laser</h1>
            <p className="text-slate-600 text-sm md:text-lg">Cálculo inteligente de parâmetros de laser dermatológico</p>
          </div>
        </div>

        {/* Contador na Calculadora */}
        {currentUser && (
          <div className="w-full sm:w-auto sm:min-w-[280px]">
            <UsageCounter 
              currentUsage={currentUser.calculations_this_month || 0}
              plan={currentUser.current_plan || 'Essencial'}
              size="small"
              showUpgradeButton={true}
            />
          </div>
        )}
      </div>

      <div className="print:hidden">
        <StepIndicator />
      </div>

      <Alert className="bg-blue-50 border-blue-200 text-blue-900 mb-6">
        <AlertTitle>Aviso de Conformidade (ANVISA)</AlertTitle>
        <AlertDescription>
          Este sistema utiliza suporte à decisão clínica (Clinical Decision Support – CDS). As sugestões de parâmetros são apenas auxiliares e não substituem a avaliação clínica do profissional responsável, conforme diretrizes regulatórias da ANVISA.
        </AlertDescription>
      </Alert>

      {currentStep === 1 && (
        <div className="print:hidden">
            <PatientSelectionStep 
              selectedPatient={selectedPatient}
              onPatientSelect={(patient) => {
                setSelectedPatient(patient);
                setCurrentStep(2);
              }}
            />
        </div>
      )}

      {currentStep === 2 && (
        <div className="print:hidden">
            <ProfessionalSelectionStep 
              selectedProfessional={selectedProfessional}
              onProfessionalSelect={(professional) => {
                setSelectedProfessional(professional);
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
        </div>
      )}

      {currentStep === 3 && (
        <div className="print:hidden">
            <AssessmentStep 
              patient={selectedPatient}
              onAssessmentComplete={performInitialCalculation}
              onBack={() => setCurrentStep(2)}
              isCalculating={isCalculating}
            />
        </div>
      )}

      {currentStep === 4 && (
        <CalculationResults 
          patient={selectedPatient}
          professional={selectedProfessional}
          assessment={assessment}
          results={calculationResults}
          onNewCalculation={resetCalculation}
          onSaveCalculation={saveFinalCalculation}
        />
      )}
      </div>
      </PageBlockChecker>
      );
      }