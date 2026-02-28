import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, User, UserCheck, Zap, Shield, Target, Settings, AlertTriangle, RotateCcw, FileText, Printer, Download, Brain, Edit, Save, Loader, RefreshCw, X
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PostCareRecommendations from "./PostCareRecommendations";
import InteractiveExplanation from "./InteractiveExplanation";

const ParameterInput = ({ label, name, value, unit, onChange, originalValue }) => (
    <div>
        <Label htmlFor={name} className="text-sm text-slate-600 font-medium">{label}</Label>
        <div className="flex items-center gap-2">
            <Input
                id={name}
                value={value}
                onChange={onChange}
                className="text-lg font-bold"
                type="text"
            />
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        {originalValue && <p className="text-xs text-slate-500 mt-1">Original: {originalValue}</p>}
    </div>
);

export default function CalculationResults({ patient, professional, assessment, results, onNewCalculation, onSaveCalculation }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [adjustedParams, setAdjustedParams] = useState(results);
  const [originalParams, setOriginalParams] = useState(results);
  const [adjustmentReasoning, setAdjustmentReasoning] = useState(null);
  
  // Extrair advancedCalculation dos results
  const advancedCalculation = results?.advancedCalculation || null;

  const handleAdjust = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setAdjustedParams(originalParams);
    setIsEditing(false);
    setAdjustmentReasoning(null);
  };

  const handleSave = async () => {
      const isAdjusted = JSON.stringify(originalParams) !== JSON.stringify(adjustedParams);
      await onSaveCalculation(
          adjustedParams,
          isAdjusted ? originalParams : null,
          isAdjusted ? adjustmentReasoning : null
      );
      toast({
          title: "Cálculo Salvo!",
          description: "O procedimento foi salvo com sucesso no histórico.",
          className: "bg-green-100 text-green-900 border-green-200"
      });
      onNewCalculation();
  };

  const handleRecalculate = async () => {
      setIsRecalculating(true);
      setAdjustmentReasoning(null);
      
      const changedParam = Object.keys(adjustedParams).find(key => originalParams[key] !== adjustedParams[key]);
      const procedure = assessment.procedure_type === 'Outro (especificar)' ? assessment.other_procedure_type : assessment.procedure_type;
      const laser = assessment.laser_type === 'Outro (especificar)' ? assessment.other_laser_type : assessment.laser_type;

      const prompt = `
          Você é um especialista em biofísica de lasers dermatológicos e um assistente clínico para o app LaserCode.

          Contexto Clínico:
          - Procedimento: ${procedure} com laser/tecnologia ${laser}.
          - Paciente: Fototipo ${assessment.phototype}, ${assessment.patient_age} anos.
          - Parâmetros Iniciais Sugeridos (Base): ${JSON.stringify(originalParams)}
          - Ajuste Manual do Profissional: O profissional alterou o parâmetro "${changedParam}" para o valor "${adjustedParams[changedParam]}".

          Sua Tarefa:
          1.  Com base no parâmetro fixado pelo profissional, recalcule os outros parâmetros (Fluência, Duração de Pulso, Spot Size, Frequência) para otimizar a segurança e a eficácia, mantendo a coerência biofísica.
          2.  Forneça uma breve justificativa técnica para as suas novas sugestões, explicando por que os parâmetros foram ajustados em resposta à alteração do profissional.

          Formato da Resposta (JSON obrigatório):
          {
              "new_parameters": {
                  "fluence": "string",
                  "pulse_duration": "string",
                  "spot_size": "string",
                  "frequency": "string"
              },
              "reasoning": "string"
          }
      `;

      try {
          const response = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: 'object', properties: { new_parameters: { type: 'object' }, reasoning: { type: 'string' } } } });
          setAdjustedParams(prev => ({
              ...prev,
              ...response.new_parameters,
              [changedParam]: adjustedParams[changedParam] 
          }));
          setAdjustmentReasoning(response.reasoning);
          toast({ title: "Parâmetros Recalculados!", description: "A IA ajustou os parâmetros com base na sua alteração." });
      } catch (error) {
          console.error("Erro ao recalcular:", error);
          toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível recalcular os parâmetros. Tente novamente." });
      }
      setIsRecalculating(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="printable-area"
    >
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 print:shadow-none print:border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-green-900">Cálculo Concluído</h2>
              <p className="text-green-700">Parâmetros calculados e prontos para uso.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 print:shadow-none print:border-none">
          <CardHeader className="bg-blue-50 border-b print:bg-transparent print:border-b-slate-200">
            <CardTitle className="flex items-center gap-3 text-lg">
              <User className="w-5 h-5 text-blue-600 print:text-blue-800" />
              Dados do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Nome:</span>
              <span className="font-semibold">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Idade:</span>
              <span className="font-semibold">{assessment.patient_age} anos</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Fototipo:</span>
              <Badge>
                Tipo {assessment.phototype}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Sensibilidade:</span>
              <span className="font-semibold capitalize">{assessment.skin_sensitivity?.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0 print:shadow-none print:border-none">
          <CardHeader className="bg-green-50 border-b print:bg-transparent print:border-b-slate-200">
            <CardTitle className="flex items-center gap-3 text-lg">
              <UserCheck className="w-5 h-5 text-green-600 print:text-green-800" />
              Dados do Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Nome:</span>
              <span className="font-semibold">{professional.name}</span>
            </div>
            {professional.specialty && (
              <div className="flex justify-between">
                <span className="text-slate-600">Especialidade:</span>
                <span className="font-semibold">{professional.specialty}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Data:</span>
              <span className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Alvo:</span>
              <span className="font-semibold capitalize">{assessment.target_type?.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {adjustmentReasoning && (
          <Card className="bg-indigo-50 border-indigo-200 print:shadow-none print:border-none print:bg-indigo-50/50 print:border-indigo-100">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800 text-lg"><Brain className="w-5 h-5"/> Justificativa da IA</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-indigo-700">{adjustmentReasoning}</p>
              </CardContent>
          </Card>
      )}

      {/* Explicação Interativa */}
      <InteractiveExplanation assessment={assessment} params={adjustedParams} />

      {/* Manchester Protocol Safety Alert */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 text-lg">
            <Shield className="w-5 h-5" />
            Classificação de Risco (Protocolo Manchester)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-green-900">Nível VERDE - Pouco Urgente</p>
                <p className="text-sm text-green-800 mt-1">
                  Procedimento de rotina. Espera-se eritema leve a moderado, edema discreto e desconforto temporário. 
                  Estas são reações normais e esperadas.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Atenção:</strong> Se houver bolhas extensas, dor intensa, eritema persistente após 24h ou sinais de infecção, 
                a classificação sobe para <strong>AMARELO (Urgente)</strong> ou superior, necessitando avaliação médica imediata.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 print:shadow-none print:border-none">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b flex flex-row items-center justify-between print:hidden">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Settings className="w-6 h-6 text-blue-600" />
            Parâmetros Sugeridos
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleAdjust}><Edit className="w-4 h-4 mr-2"/>Ajustar</Button>
          )}
          {isEditing && (
             <Button variant="ghost" size="sm" onClick={handleCancelEdit}><X className="w-4 h-4 mr-2"/>Cancelar</Button>
          )}
        </CardHeader>
        <CardHeader className="print:block hidden bg-blue-50/50 border-b print:border-b-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Settings className="w-6 h-6 text-blue-800" />
              Parâmetros Sugeridos
            </CardTitle>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
            {!isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200"><p className="text-sm text-slate-600 font-medium">Fluência</p><p className="text-3xl font-bold text-slate-900 mt-1">{adjustedParams.fluence}</p><p className="text-xs text-slate-500">{assessment.fluence_unit}</p></div>
                  <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200"><p className="text-sm text-slate-600 font-medium">Duração de Pulso</p><p className="text-3xl font-bold text-slate-900 mt-1">{adjustedParams.pulse_duration}</p><p className="text-xs text-slate-500">ms</p></div>
                  <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200"><p className="text-sm text-slate-600 font-medium">Spot Size</p><p className="text-3xl font-bold text-slate-900 mt-1">{adjustedParams.spot_size}</p><p className="text-xs text-slate-500">mm</p></div>
                  <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border print:border-slate-200"><p className="text-sm text-slate-600 font-medium">Frequência</p><p className="text-3xl font-bold text-slate-900 mt-1">{adjustedParams.frequency}</p><p className="text-xs text-slate-500">Hz</p></div>
                  <div className="p-4 bg-slate-50 rounded-lg col-span-2 sm:col-span-1 print:bg-white print:border print:border-slate-200"><p className="text-sm text-slate-600 font-medium">Resfriamento</p><p className="text-3xl font-bold text-slate-900 mt-1">{adjustedParams.cooling_intensity}</p><p className="text-xs text-slate-500">Nível 1-5</p></div>
              </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
                        <ParameterInput label="Fluência" name="fluence" value={adjustedParams.fluence} unit={assessment.fluence_unit} onChange={(e) => setAdjustedParams(p => ({ ...p, fluence: e.target.value }))} originalValue={originalParams.fluence} />
                        <ParameterInput label="Duração de Pulso" name="pulse_duration" value={adjustedParams.pulse_duration} unit="ms" onChange={(e) => setAdjustedParams(p => ({ ...p, pulse_duration: e.target.value }))} originalValue={originalParams.pulse_duration} />
                        <ParameterInput label="Spot Size" name="spot_size" value={adjustedParams.spot_size} unit="mm" onChange={(e) => setAdjustedParams(p => ({ ...p, spot_size: e.target.value }))} originalValue={originalParams.spot_size} />
                        <ParameterInput label="Frequência" name="frequency" value={adjustedParams.frequency} unit="Hz" onChange={(e) => setAdjustedParams(p => ({ ...p, frequency: e.target.value }))} originalValue={originalParams.frequency} />
                        <div>
                           <Label htmlFor="cooling_intensity" className="text-sm text-slate-600 font-medium">Resfriamento</Label>
                           <Select value={String(adjustedParams.cooling_intensity)} onValueChange={(v) => setAdjustedParams(p => ({ ...p, cooling_intensity: v }))}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 (Mínimo)</SelectItem>
                                <SelectItem value="2">2 (Leve)</SelectItem>
                                <SelectItem value="3">3 (Moderado)</SelectItem>
                                <SelectItem value="4">4 (Intenso)</SelectItem>
                                <SelectItem value="5">5 (Máximo)</SelectItem>
                              </SelectContent>
                           </Select>
                           <p className="text-xs text-slate-500 mt-1">Original: {originalParams.cooling_intensity}</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                       <Button onClick={handleRecalculate} disabled={isRecalculating} className="bg-indigo-600 hover:bg-indigo-700">
                          {isRecalculating ? <Loader className="w-4 h-4 mr-2 animate-spin"/> : <RefreshCw className="w-4 h-4 mr-2"/>}
                          Recalcular com IA
                       </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      {/* CÁLCULOS AVANÇADOS - DR. BELEZA */}
      {advancedCalculation && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-xl print:shadow-none print:border-none">
          <CardHeader className="border-b bg-gradient-to-r from-purple-100 to-indigo-100">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cc60a6e0333ee14c886a23/9dcacc945_drbeleza.png" 
                alt="Dr. Beleza" 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
              <div>
                <CardTitle className="text-2xl text-purple-900 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Análise Detalhada do Dr. Beleza
                </CardTitle>
                <p className="text-sm text-purple-700 mt-1">Parâmetros avançados calculados automaticamente</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Parâmetros Avançados Calculados */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white border-purple-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Energia Total Ideal</p>
                      <p className="text-4xl font-bold text-purple-900">{advancedCalculation.energia_ideal_mj} mJ</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-800">
                      <strong>Faixa Recomendada:</strong> {advancedCalculation.energia_minima_mj} - {advancedCalculation.energia_maxima_mj} mJ
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-indigo-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Tempo de Pulso Ideal</p>
                      <p className="text-4xl font-bold text-indigo-900">{advancedCalculation.tempo_pulso_ideal_ms} ms</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-800">
                      <strong>Faixa Recomendada:</strong> {advancedCalculation.tempo_pulso_minimo_ms} - {advancedCalculation.tempo_pulso_maximo_ms} ms
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Justificativa Detalhada */}
            <Card className="bg-white border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Justificativa Técnica Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{advancedCalculation.justificativa_detalhada}</p>
              </CardContent>
            </Card>

            {/* Observações sobre Unidade de Medida */}
            {advancedCalculation.observacoes_unidade_medida && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900">
                    <strong>📊 Unidade de Medida ({assessment.fluence_unit}):</strong> {advancedCalculation.observacoes_unidade_medida}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sugestões de Aplicação */}
            {advancedCalculation.sugestoes_aplicacao && advancedCalculation.sugestoes_aplicacao.length > 0 && (
              <Card className="bg-white border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    🎯 Sugestões Práticas de Aplicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3">
                    {advancedCalculation.sugestoes_aplicacao.map((sugestao, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold text-lg mt-0.5">•</span>
                        <span className="text-slate-700">{sugestao}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Variações Baseadas em Profundidade */}
            {advancedCalculation.variacoes_profundidade && advancedCalculation.variacoes_profundidade.length > 0 && (
              <Card className="bg-white border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    🔄 Variações Baseadas no Nível de Profundidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3">
                    {advancedCalculation.variacoes_profundidade.map((variacao, index) => (
                      <li key={index} className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg">
                        <span className="text-orange-600 font-bold text-lg mt-0.5">→</span>
                        <span className="text-slate-700">{variacao}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Alertas Técnicos */}
            {advancedCalculation.alertas_tecnicos && advancedCalculation.alertas_tecnicos.length > 0 && (
              <Card className="bg-red-50 border-red-300">
                <CardHeader className="bg-red-100">
                  <CardTitle className="text-base flex items-center gap-2 text-red-900">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ Alertas Técnicos Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {advancedCalculation.alertas_tecnicos.map((alerta, index) => (
                      <li key={index} className="flex items-start gap-2 text-red-800">
                        <span className="text-red-600 font-bold mt-0.5">⚠</span>
                        <span>{alerta}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-amber-50 border-amber-200 print:shadow-none print:border-none print:bg-amber-50/50 print:border-amber-100">
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-amber-900 text-lg"><AlertTriangle className="w-5 h-5"/> Aviso de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-amber-800 text-sm">Os parâmetros sugeridos são um ponto de partida baseado em um algoritmo avançado e devem ser considerados uma recomendação. A avaliação clínica e o julgamento do profissional são soberanos e indispensáveis para garantir a segurança e eficácia do tratamento. Sempre realize um teste de spot antes do procedimento completo.</p>
          </CardContent>
      </Card>

      <PostCareRecommendations 
        assessment={assessment}
        patient={patient}
        professional={professional}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2"/> Imprimir
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2"/> Salvar em PDF
            </Button>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onNewCalculation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Nova Calculação
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-green-600">
              <Save className="w-5 h-5 mr-2" />
              Salvar Procedimento
            </Button>
        </div>
      </div>
    </motion.div>
  );
}