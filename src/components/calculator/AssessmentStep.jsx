import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import BodyRegionSelector from "./BodyRegionSelector";
import DeviceIdentifier from "./DeviceIdentifier";
import { targetTypes } from "./laserDatabase";
import { laserTechOptions } from "./laserTechOptions";
import { base44 } from "@/api/base44Client";

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  return age;
};

const procedureOptions = [
  "Depilação a laser", "Rejuvenescimento facial", "Tratamento de manchas",
  "Remoção de tatuagem", "Tratamento vascular", "Tratamento de cicatrizes",
  "Tratamento de acne", "Lifting não invasivo", "Redução de medidas",
  "Celulite", "Flacidez", "Melasma", "Rosácea", "Telangectasias",
  "Refinamento de poros", "Estrias", "Lesões pigmentadas", "Outro"
];



const handpiecesByLaser = {
  "Nd:YAG 1064nm": [
    { value: "Contato Resfriada 4-6mm", label: "Contato Resfriada (4-6mm)" },
    { value: "Fracionada 1-3mm", label: "Fracionada (1-3mm)" },
    { value: "Pixelada 0,5-2mm", label: "Pixelada (0,5-2mm)" },
    { value: "Genesis (não ablativa) 4-5mm", label: "Genesis - não ablativa (4-5mm)" },
  ],
  "Alexandrite 755nm": [
    { value: "Resfriada DCD 2-3mm", label: "Resfriada DCD (2-3mm)" },
    { value: "Varredura Dinâmica 2-3mm", label: "Varredura Dinâmica (2-3mm)" },
    { value: "Spot Fixo 2-3mm", label: "Spot Fixo (2-3mm)" },
  ],
  "Diodo 808nm": [
    { value: "Safira Resfriada 2-5mm", label: "Safira Resfriada (2-5mm)" },
    { value: "Contato 2-5mm", label: "Contato (2-5mm)" },
    { value: "In-Motion 2-5mm", label: "In-Motion (2-5mm)" },
  ],
  "Diodo 810nm": [
    { value: "Safira Resfriada 2-5mm", label: "Safira Resfriada (2-5mm)" },
    { value: "Contato 2-5mm", label: "Contato (2-5mm)" },
    { value: "In-Motion 2-5mm", label: "In-Motion (2-5mm)" },
  ],
  "CO2 10600nm": [
    { value: "Fracionada 0,1-0,5mm", label: "Fracionada (0,1-0,5mm)" },
    { value: "Cirúrgica Ablativa 0,5-1mm", label: "Cirúrgica Ablativa (0,5-1mm)" },
    { value: "Scanner CW 0,2-0,8mm", label: "Scanner CW (0,2-0,8mm)" },
    { value: "Ultra Pulse 0,1-0,3mm", label: "Ultra Pulse (0,1-0,3mm)" },
  ],
  "Er:YAG 2940nm": [
    { value: "Fracionada 0,05-0,3mm", label: "Fracionada (0,05-0,3mm)" },
    { value: "Pixel 0,1-0,4mm", label: "Pixel (0,1-0,4mm)" },
    { value: "Scanner 0,05-0,5mm", label: "Scanner (0,05-0,5mm)" },
  ],
  "Er:YSGG 2790nm": [
    { value: "Fracionada 0,05-0,3mm", label: "Fracionada (0,05-0,3mm)" },
    { value: "Cirúrgica 0,1-0,4mm", label: "Cirúrgica (0,1-0,4mm)" },
  ],
  "Thulium 1927nm": [
    { value: "Scanner Fracionado 0,2-0,8mm", label: "Scanner Fracionado (0,2-0,8mm)" },
    { value: "Clear + Brilliant 0,2-0,5mm", label: "Clear + Brilliant (0,2-0,5mm)" },
  ],
  "PDL 585nm": [
    { value: "Dinâmica DCD 0,5-1,5mm", label: "Dinâmica DCD (0,5-1,5mm)" },
    { value: "Scanner 0,5-1mm", label: "Scanner (0,5-1mm)" },
  ],
  "PDL 595nm": [
    { value: "Dinâmica DCD 0,5-1,5mm", label: "Dinâmica DCD (0,5-1,5mm)" },
    { value: "Scanner 0,5-1mm", label: "Scanner (0,5-1mm)" },
  ],
  "KTP 532nm": [
    { value: "Scanner 0,5-1mm", label: "Scanner (0,5-1mm)" },
    { value: "Contato 0,5-1mm", label: "Contato (0,5-1mm)" },
  ],
  "Rubi 694nm": [
    { value: "Fracionada 1-2mm", label: "Fracionada (1-2mm)" },
    { value: "Contato Q-switched 1-2mm", label: "Contato Q-switched (1-2mm)" },
  ],
  "Picosecond 755nm": [
    { value: "Fracionada 0,8-2mm", label: "Fracionada (0,8-2mm)" },
    { value: "Holográfica Focus 0,5-1,5mm", label: "Holográfica Focus (0,5-1,5mm)" },
    { value: "Microlens Array 0,5-1mm", label: "Microlens Array (0,5-1mm)" },
  ],
  "Picosecond 1064nm": [
    { value: "Fracionada 0,8-2mm", label: "Fracionada (0,8-2mm)" },
    { value: "Holográfica Focus 0,5-1,5mm", label: "Holográfica Focus (0,5-1,5mm)" },
    { value: "Microlens Array 0,5-1mm", label: "Microlens Array (0,5-1mm)" },
  ],
  "NIR 1440nm": [
    { value: "Contato 1-3mm", label: "Contato (1-3mm)" },
    { value: "Scanner 1-2mm", label: "Scanner (1-2mm)" },
  ],
  "NIR 1550nm": [
    { value: "Contato 1-3mm", label: "Contato (1-3mm)" },
    { value: "Scanner Fracionado 1-2mm", label: "Scanner Fracionado (1-2mm)" },
  ],
  "IPL 500-1200nm": [
    { value: "Filtro 515nm (vascular)", label: "Filtro 515nm - vascular" },
    { value: "Filtro 560nm (pigmentos)", label: "Filtro 560nm - pigmentos" },
    { value: "Filtro 590nm (depilação)", label: "Filtro 590nm - depilação" },
    { value: "Filtro 640nm (rejuv)", label: "Filtro 640nm - rejuvenescimento" },
    { value: "Filtro 695nm (depilação intensa)", label: "Filtro 695nm - depilação intensa" },
    { value: "Resfriada Safira", label: "Resfriada Safira" },
  ],
  "Triplo Waves (755-808-1064nm)": [
    { value: "Safira Resfriada 2-6mm", label: "Safira Resfriada (2-6mm)" },
    { value: "In-Motion 2-6mm", label: "In-Motion (2-6mm)" },
  ],
  "Radiofrequência": [
    { value: "Monopolar 3-20mm", label: "Monopolar (3-20mm)" },
    { value: "Bipolar 1-4mm", label: "Bipolar (1-4mm)" },
    { value: "Tripolar 2-10mm", label: "Tripolar (2-10mm)" },
    { value: "Microneedle RF 0,5-3,5mm", label: "Microneedle RF (0,5-3,5mm)" },
    { value: "Fracionada 0,5-3mm", label: "Fracionada (0,5-3mm)" },
  ],
  "HIFU": [
    { value: "1,5mm (derme superficial)", label: "1,5mm - derme superficial" },
    { value: "3,0mm (derme profunda)", label: "3,0mm - derme profunda" },
    { value: "4,5mm (SMAS)", label: "4,5mm - SMAS" },
    { value: "6,0mm (gordura)", label: "6,0mm - camada de gordura" },
    { value: "9,0mm (gordura profunda)", label: "9,0mm - gordura profunda" },
    { value: "13mm (corporal)", label: "13mm - corporal" },
  ],
  "Outro": [
    { value: "Personalizada", label: "Personalizada (especificar)" },
  ]
};

export default function AssessmentStep({ patient, onAssessmentComplete, onBack, isCalculating }) {
  const [assessment, setAssessment] = useState({
    procedure_type: "",
    other_procedure_type: "",
    region: "",
    phototype: patient.phototype || "",
    patient_age: calculateAge(patient.birth_date) || "",
    skin_color: patient.skin_tone || "",
    skin_sensitivity: patient.skin_sensitivity || "",
    sun_exposure: "",
    tanning_habits: "",
    target_type: "",
    laser_type: "",
    other_laser_type: "",
    handpiece_type: "",
    fluence_unit: "J/cm²",
    aggressiveness_level: "moderado",
    cooling_intensity: "3",
    treatment_notes: "",
    glogau_scale: patient.glogau_scale || "",
    acne_scar_classification: patient.acne_scar_classification || "",
    leeds_acne_scale: patient.leeds_acne_scale || "",
    body_region: "",
    region_photo: null,
    device_info: {},
    beam_shape: "",
    scan_area: "",
    scan_area_custom: "",
    dot_density: "500",
    application_pattern: "",
    depth_level: "3",
    energy_mj: "50",
    pulse_width_ms: "",
    scan_mode: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setCurrentUser(u); } catch(e){} })(); }, []);

  const suggestWithAI = async () => {
    setAiLoading(true);
    try {
      const prompt = `Você é um especialista em lasers dermatológicos. Gere parâmetros iniciais seguros e eficazes com base nos dados abaixo.
  Dados do caso:
  ${JSON.stringify({
  procedure_type: assessment.procedure_type,
  region: assessment.region,
  phototype: assessment.phototype,
  skin_color: assessment.skin_color,
  skin_sensitivity: assessment.skin_sensitivity,
  target_type: assessment.target_type,
  laser_type: assessment.laser_type === 'Outro' ? assessment.other_laser_type : assessment.laser_type,
  aggressiveness_level: assessment.aggressiveness_level,
  depth_level: assessment.depth_level,
  fluence_unit: assessment.fluence_unit
  })}
  Responda em JSON.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            fluence: { type: 'string' },
            pulse_duration: { type: 'string' },
            spot_size: { type: 'string' },
            frequency: { type: 'string' },
            cooling_intensity: { type: 'string' },
            rationale: { type: 'string' }
          }
        }
      });
      setAiSuggestions(res);
    } finally { setAiLoading(false); }
  };

   const handleInputChange = (field, value) => {
    setAssessment(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'laser_type') {
        updated.handpiece_type = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Passar o assessment para o cálculo (a lógica de cálculo avançado será feita no Calculator.js)
    onAssessmentComplete(assessment);
  };

  const selectedLaser = laserTechOptions.find(l => l.value === assessment.laser_type);
  const availableHandpieces = assessment.laser_type ? (handpiecesByLaser[assessment.laser_type] || []) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Brain className="w-6 h-6 text-purple-600" />
            Avaliação Clínica Completa
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <ScrollArea className="pr-4">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="procedure_type">Tipo de Procedimento *</Label>
                  <Select value={assessment.procedure_type} onValueChange={(value) => handleInputChange("procedure_type", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione o procedimento" /></SelectTrigger>
                    <SelectContent>
                      {procedureOptions.map(proc => (
                        <SelectItem key={proc} value={proc}>{proc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assessment.procedure_type === "Outro" && (
                  <div>
                    <Label htmlFor="other_procedure_type">Especifique o Procedimento</Label>
                    <Input id="other_procedure_type" value={assessment.other_procedure_type} onChange={(e) => handleInputChange("other_procedure_type", e.target.value)} placeholder="Digite o procedimento" />
                  </div>
                )}

                <div>
                  <Label htmlFor="region">Região Tratada *</Label>
                  <Input id="region" value={assessment.region} onChange={(e) => handleInputChange("region", e.target.value)} placeholder="Ex: Face, Axilas, Pernas..." required />
                </div>

                <div>
                  <Label htmlFor="phototype">Fototipo *</Label>
                  <Select value={assessment.phototype} onValueChange={(value) => handleInputChange("phototype", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione o fototipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I - Sempre queima</SelectItem>
                      <SelectItem value="II">II - Queima facilmente</SelectItem>
                      <SelectItem value="III">III - Às vezes queima</SelectItem>
                      <SelectItem value="IV">IV - Queima minimamente</SelectItem>
                      <SelectItem value="V">V - Raramente queima</SelectItem>
                      <SelectItem value="VI">VI - Nunca queima</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="patient_age">Idade do Paciente</Label>
                  <Input id="patient_age" type="number" value={assessment.patient_age} onChange={(e) => handleInputChange("patient_age", parseInt(e.target.value))} placeholder="Anos" />
                </div>

                <div>
                  <Label htmlFor="skin_color">Cor da Pele Observada</Label>
                  <Select value={assessment.skin_color} onValueChange={(value) => handleInputChange("skin_color", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muito_clara">Muito Clara</SelectItem>
                      <SelectItem value="clara">Clara</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="morena">Morena</SelectItem>
                      <SelectItem value="escura">Escura</SelectItem>
                      <SelectItem value="muito_escura">Muito Escura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="skin_sensitivity">Sensibilidade da Pele</Label>
                  <Select value={assessment.skin_sensitivity} onValueChange={(value) => handleInputChange("skin_sensitivity", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muito_sensível">Muito Sensível</SelectItem>
                      <SelectItem value="sensível">Sensível</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="resistente">Resistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sun_exposure">Exposição Solar</Label>
                  <Select value={assessment.sun_exposure} onValueChange={(value) => handleInputChange("sun_exposure", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhuma">Nenhuma</SelectItem>
                      <SelectItem value="minima">Mínima</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="intensa">Intensa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tanning_habits">Hábitos de Bronzeamento</Label>
                  <Select value={assessment.tanning_habits} onValueChange={(value) => handleInputChange("tanning_habits", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nunca">Nunca</SelectItem>
                      <SelectItem value="raramente">Raramente</SelectItem>
                      <SelectItem value="ocasionalmente">Ocasionalmente</SelectItem>
                      <SelectItem value="frequentemente">Frequentemente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="target_type">Tipo de Alvo (Cromóforo/Estrutura) *</Label>
                  <Select value={assessment.target_type} onValueChange={(value) => handleInputChange("target_type", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo de alvo" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b">Alvos Pigmentares</div>
                      {targetTypes.filter(t => t.value.includes('melanina') || t.value.includes('pigmento') || t.value.includes('nevus')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Alvos Vasculares</div>
                      {targetTypes.filter(t => t.value.includes('hemoglobina') || t.value.includes('vasos') || t.value.includes('micro')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Alvos Estruturais</div>
                      {targetTypes.filter(t => t.value.includes('colageno') || t.value.includes('agua') || t.value.includes('elastina') || t.value.includes('matriz')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Alvos Celulares</div>
                      {targetTypes.filter(t => t.value.includes('foliculo') || t.value.includes('glandula') || t.value.includes('adipocitos') || t.value.includes('fibroblastos') || t.value.includes('queratino')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Cicatrizes e Acne</div>
                      {targetTypes.filter(t => t.value.includes('cicatricial') || t.value.includes('fibrose') || t.value.includes('acneicas')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Lifting/Firmeza</div>
                      {targetTypes.filter(t => t.value.includes('smas') || t.value.includes('fascia') || t.value.includes('derme_reticular')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Outros</div>
                      {targetTypes.filter(t => t.value.includes('poros') || t.value.includes('estrias') || t.value.includes('celulite')).map(target => (
                        <SelectItem key={target.value} value={target.value}>{target.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="laser_type">Laser/Tecnologia *</Label>
                  <Select value={assessment.laser_type} onValueChange={(value) => handleInputChange("laser_type", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {laserTechOptions.map(laser => (
                        <SelectItem key={laser.value} value={laser.value}>
                          {laser.label} - Prof: {laser.depth}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assessment.laser_type === "Outro" && (
                  <div>
                    <Label htmlFor="other_laser_type">Especifique a Tecnologia</Label>
                    <Input id="other_laser_type" value={assessment.other_laser_type} onChange={(e) => handleInputChange("other_laser_type", e.target.value)} placeholder="Digite a tecnologia" />
                  </div>
                )}

                {assessment.laser_type && assessment.laser_type !== "Outro" && availableHandpieces.length > 0 && (
                  <div className="md:col-span-2">
                    <Label htmlFor="handpiece_type">Tipo de Ponteira</Label>
                    <Select value={assessment.handpiece_type} onValueChange={(value) => handleInputChange("handpiece_type", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione a ponteira" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableHandpieces.map(handpiece => (
                          <SelectItem key={handpiece.value} value={handpiece.value}>{handpiece.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLaser && (
                      <p className="text-xs text-slate-500 mt-1">Profundidade do laser selecionado: {selectedLaser.depth}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="aggressiveness_level">Nível de Agressividade</Label>
                  <Select value={assessment.aggressiveness_level} onValueChange={(value) => handleInputChange("aggressiveness_level", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservador">Conservador</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="agressivo">Agressivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cooling_intensity">Intensidade do Resfriamento (1-5)</Label>
                  <Select value={assessment.cooling_intensity} onValueChange={(value) => handleInputChange("cooling_intensity", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Mínimo</SelectItem>
                      <SelectItem value="2">2 - Baixo</SelectItem>
                      <SelectItem value="3">3 - Médio</SelectItem>
                      <SelectItem value="4">4 - Alto</SelectItem>
                      <SelectItem value="5">5 - Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fluence_unit">Unidade de Medida</Label>
                  <Select value={assessment.fluence_unit} onValueChange={(value) => handleInputChange("fluence_unit", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b">Fluência/Densidade de Energia</div>
                      <SelectItem value="J/cm²">J/cm² (Joules por cm²)</SelectItem>
                      <SelectItem value="mJ/cm²">mJ/cm² (Milijoules por cm²)</SelectItem>
                      <SelectItem value="W/cm²">W/cm² (Watts por cm²)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Energia Total</div>
                      <SelectItem value="J">J (Joules)</SelectItem>
                      <SelectItem value="mJ">mJ (Milijoules)</SelectItem>
                      <SelectItem value="μJ">μJ (Microjoules)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Potência</div>
                      <SelectItem value="W">W (Watts)</SelectItem>
                      <SelectItem value="kW">kW (Kilowatts)</SelectItem>
                      <SelectItem value="mW">mW (Miliwatts)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Tempo</div>
                      <SelectItem value="ms">ms (Milissegundos)</SelectItem>
                      <SelectItem value="μs">μs (Microssegundos)</SelectItem>
                      <SelectItem value="ns">ns (Nanossegundos)</SelectItem>
                      <SelectItem value="ps">ps (Picossegundos)</SelectItem>
                      <SelectItem value="s">s (Segundos)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Frequência</div>
                      <SelectItem value="Hz">Hz (Hertz)</SelectItem>
                      <SelectItem value="kHz">kHz (Kilohertz)</SelectItem>
                      <SelectItem value="MHz">MHz (Megahertz)</SelectItem>
                      <SelectItem value="pps">pps (Pulsos por segundo)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Dimensões</div>
                      <SelectItem value="mm">mm (Milímetros)</SelectItem>
                      <SelectItem value="cm">cm (Centímetros)</SelectItem>
                      <SelectItem value="cm²">cm² (Centímetros quadrados)</SelectItem>
                      <SelectItem value="mm²">mm² (Milímetros quadrados)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Cobertura Fracionada</div>
                      <SelectItem value="%">% (Porcentagem de cobertura)</SelectItem>
                      <SelectItem value="MTZ/cm²">MTZ/cm² (Zonas Microtermais)</SelectItem>
                      <SelectItem value="dots/cm²">dots/cm² (Pontos por cm²)</SelectItem>
                      
                      <div className="p-2 font-semibold text-xs text-slate-500 border-b mt-2">Aplicação</div>
                      <SelectItem value="passes">Passes (Número de passadas)</SelectItem>
                      <SelectItem value="stacks">Stacks (Empilhamentos)</SelectItem>
                      <SelectItem value="pulses">Pulses (Número de pulsos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* PARÂMETROS AVANÇADOS DE LASER FRACIONADO */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Parâmetros Avançados (Laser Fracionado/Scanner)
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="beam_shape">Forma do Feixe (Shape)</Label>
                    <Select value={assessment.beam_shape} onValueChange={(value) => handleInputChange("beam_shape", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quadrado">⬛ Quadrado</SelectItem>
                        <SelectItem value="triangulo">🔺 Triângulo</SelectItem>
                        <SelectItem value="circulo">⚫ Círculo</SelectItem>
                        <SelectItem value="retangulo">⬜ Retângulo</SelectItem>
                        <SelectItem value="hexagono">⬢ Hexágono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scan_area">Área de Varredura (Scan Area)</Label>
                    <Select value={assessment.scan_area} onValueChange={(value) => handleInputChange("scan_area", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5x5mm">5×5 mm</SelectItem>
                        <SelectItem value="7x7mm">7×7 mm</SelectItem>
                        <SelectItem value="10x10mm">10×10 mm</SelectItem>
                        <SelectItem value="12x12mm">12×12 mm</SelectItem>
                        <SelectItem value="15x15mm">15×15 mm</SelectItem>
                        <SelectItem value="20x20mm">20×20 mm</SelectItem>
                        <SelectItem value="custom">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {assessment.scan_area === "custom" && (
                    <div>
                      <Label htmlFor="scan_area_custom">Área Personalizada (mm)</Label>
                      <Input id="scan_area_custom" value={assessment.scan_area_custom} onChange={(e) => handleInputChange("scan_area_custom", e.target.value)} placeholder="Ex: 18x18" />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="application_pattern">Padrão de Aplicação (Pattern)</Label>
                    <Select value={assessment.application_pattern} onValueChange={(value) => handleInputChange("application_pattern", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="array">Array (organizado)</SelectItem>
                        <SelectItem value="grid">Grid (grade uniforme)</SelectItem>
                        <SelectItem value="random">Random (aleatório)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scan_mode">Modo de Varredura</Label>
                    <Select value={assessment.scan_mode} onValueChange={(value) => handleInputChange("scan_mode", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear (linha reta)</SelectItem>
                        <SelectItem value="espiral">Espiral (circular)</SelectItem>
                        <SelectItem value="cruzado">Cruzado (cross-hatch)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="dot_density">Densidade de Pontos (Dots/cm²): {assessment.dot_density}</Label>
                    <Slider
                      id="dot_density"
                      min={100}
                      max={3000}
                      step={100}
                      value={[parseInt(assessment.dot_density)]}
                      onValueChange={(value) => handleInputChange("dot_density", value[0].toString())}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>100 (baixa)</span>
                      <span>1500 (média)</span>
                      <span>3000 (alta)</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="depth_level">Nível de Profundidade: {assessment.depth_level}</Label>
                    <Slider
                      id="depth_level"
                      min={1}
                      max={5}
                      step={1}
                      value={[parseInt(assessment.depth_level)]}
                      onValueChange={(value) => handleInputChange("depth_level", value[0].toString())}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>1 (superficial)</span>
                      <span>3 (médio)</span>
                      <span>5 (profundo)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-800 mb-3">Classificações Dermatológicas (opcional)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="glogau_scale">Escala de Glogau</Label>
                    <Select value={assessment.glogau_scale} onValueChange={(value) => handleInputChange("glogau_scale", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">I - 20-30 anos</SelectItem>
                        <SelectItem value="II">II - 30-40 anos</SelectItem>
                        <SelectItem value="III">III - 40-60 anos</SelectItem>
                        <SelectItem value="IV">IV - 60+ anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="acne_scar_classification">Cicatrizes de Acne</Label>
                    <Select value={assessment.acne_scar_classification} onValueChange={(value) => handleInputChange("acne_scar_classification", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderada">Moderada</SelectItem>
                        <SelectItem value="severa">Severa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leeds_acne_scale">Escala de Acne (Leeds)</Label>
                    <Select value={assessment.leeds_acne_scale} onValueChange={(value) => handleInputChange("leeds_acne_scale", value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - Normal</SelectItem>
                        <SelectItem value="1-2">1-2 - Leve</SelectItem>
                        <SelectItem value="3-4">3-4 - Moderada</SelectItem>
                        <SelectItem value="5-6">5-6 - Severa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="treatment_notes">Observações</Label>
                <Textarea id="treatment_notes" value={assessment.treatment_notes} onChange={(e) => handleInputChange("treatment_notes", e.target.value)} placeholder="Observações sobre o tratamento..." className="h-20" />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sugestão de IA (Plano Master) */}
      {currentUser?.current_plan === 'Master' && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Brain className="w-5 h-5" /> Sugestão de Parâmetros por IA (Master)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Button type="button" onClick={suggestWithAI} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {aiLoading ? 'Gerando...' : 'Sugerir com IA'}
              </Button>
              <p className="text-sm text-indigo-800">As sugestões são auxiliares. A decisão final é do profissional.</p>
            </div>
            {aiSuggestions && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="p-3 bg-white rounded border"><p className="text-xs text-slate-500">Fluência</p><p className="font-bold">{aiSuggestions.fluence}</p></div>
                <div className="p-3 bg-white rounded border"><p className="text-xs text-slate-500">Pulso</p><p className="font-bold">{aiSuggestions.pulse_duration}</p></div>
                <div className="p-3 bg-white rounded border"><p className="text-xs text-slate-500">Spot</p><p className="font-bold">{aiSuggestions.spot_size}</p></div>
                <div className="p-3 bg-white rounded border"><p className="text-xs text-slate-500">Frequência</p><p className="font-bold">{aiSuggestions.frequency}</p></div>
                <div className="p-3 bg-white rounded border"><p className="text-xs text-slate-500">Resfriamento</p><p className="font-bold">{aiSuggestions.cooling_intensity}</p></div>
              </div>
            )}
            {aiSuggestions?.rationale && (
              <div className="text-sm text-indigo-900 bg-indigo-100/70 p-3 rounded">
                <strong>Por que:</strong> {aiSuggestions.rationale}
              </div>
            )}
          </CardContent>
        </Card>
      )}

       <BodyRegionSelector
        selectedRegion={assessment.body_region}
        onRegionChange={(region) => handleInputChange("body_region", region)}
        regionPhoto={assessment.region_photo}
        onPhotoChange={(photo) => handleInputChange("region_photo", photo)}
      />

      <DeviceIdentifier
        deviceInfo={assessment.device_info}
        onDeviceInfoChange={(info) => handleInputChange("device_info", info)}
      />

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>Calculando...</>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Calcular Parâmetros
            </>
          )}
        </Button>
      </div>
    </form>
  );
}