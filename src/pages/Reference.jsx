import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sun, Palette, Zap, Shield, Target, ArrowRight, AlertTriangle, Heart, ListChecks, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageBlockChecker from "../components/system/PageBlockChecker";

const phototypeData = [
  {
    type: "I",
    description: "Sempre queima, nunca bronzeia",
    characteristics: "Pele muito clara, olhos azuis/verdes, cabelos ruivos/loiros",
    examples: "Descendentes celtas, irlandeses",
    riskLevel: "Muito Alto",
    color: "bg-red-100 text-red-800 border-red-200",
    recommendations: [
      "Fluências baixas (10-15 J/cm²)",
      "Pulsos curtos (1-3 ms)",
      "Resfriamento intenso obrigatório",
      "Teste de spot essencial",
      "Intervalo maior entre sessões"
    ]
  },
  {
    type: "II",
    description: "Sempre queima, bronzeia minimamente",
    characteristics: "Pele clara, olhos azuis/verdes/avelã, cabelos loiros/castanhos",
    examples: "Descendentes nórdicos, europeus do norte",
    riskLevel: "Alto",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    recommendations: [
      "Fluências moderadas (12-18 J/cm²)",
      "Pulsos curtos a médios (2-5 ms)",
      "Resfriamento necessário",
      "Monitoramento cuidadoso",
      "Progressão gradual de parâmetros"
    ]
  },
  {
    type: "III",
    description: "Às vezes queima, bronzeia gradualmente",
    characteristics: "Pele média, olhos castanhos, cabelos castanhos",
    examples: "Descendentes europeus do sul, mediterrâneos",
    riskLevel: "Moderado",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    recommendations: [
      "Fluências médias (15-20 J/cm²)",
      "Pulsos médios (3-8 ms)",
      "Resfriamento padrão",
      "Boa tolerância geral",
      "Progressão normal"
    ]
  },
  {
    type: "IV",
    description: "Queima minimamente, bronzeia bem",
    characteristics: "Pele morena, olhos castanhos escuros, cabelos castanhos/pretos",
    examples: "Descendentes latinos, mediterrâneos, asiáticos",
    riskLevel: "Baixo-Moderado",
    color: "bg-green-100 text-green-800 border-green-200",
    recommendations: [
      "Fluências médias-altas (18-25 J/cm²)",
      "Pulsos médios a longos (5-12 ms)",
      "Resfriamento moderado",
      "Boa resposta ao tratamento",
      "Menor risco de complicações"
    ]
  },
  {
    type: "V",
    description: "Raramente queima, bronzeia profundamente",
    characteristics: "Pele escura, olhos pretos, cabelos pretos",
    examples: "Descendentes árabes, indianos, hispânicos",
    riskLevel: "Baixo",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    recommendations: [
      "Fluências altas (20-30 J/cm²)",
      "Pulsos longos (8-15 ms)",
      "Resfriamento leve",
      "Risco baixo de queimaduras",
      "Atenção à hipopigmentação"
    ]
  },
  {
    type: "VI",
    description: "Nunca queima, pigmentação escura",
    characteristics: "Pele muito escura, olhos pretos, cabelos pretos",
    examples: "Descendentes africanos",
    riskLevel: "Especial",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    recommendations: [
      "Lasers específicos (Nd:YAG 1064nm)",
      "Fluências adaptadas (25-35 J/cm²)",
      "Pulsos muito longos (10-20 ms)",
      "Cuidado com despigmentação",
      "Experiência específica necessária"
    ]
  }
];

const laserTypes = [
  {
    category: "Lasers de Depilação",
    devices: [
      {
        name: "Alexandrite (755nm)",
        wavelength: "755nm",
        type: "Não Fracionado",
        targets: "Melanina, pelos escuros",
        bestFor: "Fototipos I-IV, depilação",
        characteristics: [
          "Alta absorção por melanina",
          "Excelente para pelos escuros",
          "Penetração média na pele",
          "Requer cuidado em peles escuras"
        ]
      },
      {
        name: "Diodo (810nm)",
        wavelength: "810nm",
        type: "Não Fracionado",
        targets: "Melanina, vascularização",
        bestFor: "Todos os fototipos, versátil",
        characteristics: [
          "Boa absorção por melanina",
          "Penetração profunda",
          "Versátil para vários fototipos",
          "Bom equilíbrio segurança/eficácia"
        ]
      },
      {
        name: "Nd:YAG (1064nm)",
        wavelength: "1064nm",
        type: "Não Fracionado",
        targets: "Cromóforos profundos",
        bestFor: "Fototipos V-VI, peles escuras",
        characteristics: [
          "Menor absorção por melanina",
          "Máxima penetração",
          "Mais seguro para peles escuras",
          "Ideal para pelos finos e claros"
        ]
      },
      {
        name: "Laser Triplo Waves (755-808-1064nm)",
        wavelength: "755nm, 808nm, 1064nm",
        type: "Não Fracionado",
        targets: "Melanina em múltiplas profundidades",
        bestFor: "Depilação em todos os fototipos, versátil",
        characteristics: [
          "Combina três comprimentos de onda",
          "Atua em diferentes profundidades do folículo",
          "Maior eficácia em diferentes tipos de pelo",
          "Bom perfil de segurança para peles claras e escuras"
        ]
      }
    ]
  },
  {
    category: "Lasers Ablativos",
    devices: [
      {
        name: "CO2 (10600nm)",
        wavelength: "10600nm",
        type: "Não Fracionado",
        targets: "Água tecidual",
        bestFor: "Ressurfacing, cicatrizes profundas",
        characteristics: [
          "Máxima ablação tecidual",
          "Efeito térmico intenso",
          "Resultados dramáticos",
          "Maior tempo de recuperação"
        ]
      },
      {
        name: "CO2 Fracionado",
        wavelength: "10600nm",
        type: "Fracionado",
        targets: "Água, remodelação colágeno",
        bestFor: "Rejuvenescimento, cicatrizes",
        characteristics: [
          "Ablação controlada",
          "Recuperação mais rápida",
          "Menor risco de complicações",
          "Estimulação de colágeno"
        ]
      },
      {
        name: "Erbium:YAG (2940nm)",
        wavelength: "2940nm",
        type: "Não Fracionado",
        targets: "Água superficial",
        bestFor: "Ressurfacing suave",
        characteristics: [
          "Ablação precisa",
          "Menor efeito térmico",
          "Recuperação mais rápida que CO2",
          "Menor risco de hiperpigmentação"
        ]
      },
      {
        name: "Erbium Fracionado",
        wavelength: "2940nm",
        type: "Fracionado",
        targets: "Água, textura da pele",
        bestFor: "Melasma, textura, poros",
        characteristics: [
          "Tratamento suave e controlado",
          "Mínimo downtime",
          "Seguro para peles mais escuras",
          "Melhora gradual da textura"
        ]
      }
    ]
  },
  {
    category: "Lasers Não Ablativos",
    devices: [
      {
        name: "Nd:YAG 1064nm (Não Ablativo)",
        wavelength: "1064nm",
        type: "Não Fracionado",
        targets: "Colágeno profundo",
        bestFor: "Firmeza, todos os fototipos",
        characteristics: [
          "Estimulação de colágeno",
          "Sem ablação superficial",
          "Seguro para todos os fototipos",
          "Múltiplas sessões necessárias"
        ]
      },
      {
        name: "Nd:YAG 1320nm",
        wavelength: "1320nm",
        type: "Não Fracionado",
        targets: "Água, glândulas sebáceas",
        bestFor: "Acne, oleosidade, poros",
        characteristics: [
          "Redução da oleosidade",
          "Melhora da acne",
          "Refinamento de poros",
          "Tratamento confortável"
        ]
      },
      {
        name: "Fraxel (1550nm)",
        wavelength: "1550nm",
        type: "Fracionado",
        targets: "Água, remodelação dérmica",
        bestFor: "Melasma, cicatrizes, textura",
        characteristics: [
          "Microzonas de tratamento",
          "Recuperação rápida",
          "Versatilidade de indicações",
          "Progressão gradual"
        ]
      },
      {
        name: "Thulium (1927nm)",
        wavelength: "1927nm",
        type: "Fracionado",
        targets: "Água superficial, pigmentos",
        bestFor: "Melasma, pigmentação",
        characteristics: [
          "Ideal para melasma",
          "Tratamento epidérmico",
          "Mínimo desconforto",
          "Excelente para pigmentações"
        ]
      }
    ]
  },
  {
    category: "Lasers Vasculares",
    devices: [
      {
        name: "Pulsed Dye Laser (585nm)",
        wavelength: "585nm",
        type: "Não Fracionado",
        targets: "Hemoglobina",
        bestFor: "Rosácea, telangectasias",
        characteristics: [
          "Altíssima afinidade por hemoglobina",
          "Ideal para vasos superficiais",
          "Risco de púrpura transitória",
          "Excelente para rosácea"
        ]
      },
      {
        name: "KTP (532nm)",
        wavelength: "532nm",
        type: "Não Fracionado",
        targets: "Hemoglobina, melanina superficial",
        bestFor: "Vasos faciais, manchas solares",
        characteristics: [
          "Boa absorção vascular",
          "Ideal para vasos finos",
          "Tratamento superficial",
          "Risco em peles escuras"
        ]
      },
      {
        name: "Nd:YAG 1064nm (Vascular)",
        wavelength: "1064nm",
        type: "Não Fracionado",
        targets: "Vasos profundos",
        bestFor: "Varizes faciais, angiomas",
        characteristics: [
          "Penetração profunda",
          "Vasos de grande calibre",
          "Seguro para peles escuras",
          "Menos púrpura pós-tratamento"
        ]
      }
    ]
  },
  {
    category: "IPL e Luz Pulsada",
    devices: [
      {
        name: "IPL (Intense Pulsed Light)",
        wavelength: "515-1200nm",
        type: "Banda Larga",
        targets: "Múltiplos cromóforos",
        bestFor: "Fotorrejuvenescimento, vasos, pigmentos",
        characteristics: [
          "Espectro de luz amplo",
          "Múltiplas indicações",
          "Filtros intercambiáveis",
          "Tratamento versátil"
        ]
      },
      {
        name: "BBL (BroadBand Light)",
        wavelength: "400-1400nm",
        type: "Banda Larga Avançada",
        targets: "Cromóforos múltiplos",
        bestFor: "Rejuvenescimento global",
        characteristics: [
          "Tecnologia aprimorada",
          "Maior uniformidade",
          "Controle preciso de energia",
          "Resultados consistentes"
        ]
      }
    ]
  },
  {
    category: "Ultrassom Estético",
    devices: [
      {
        name: "HIFU (Ultrassom Microfocalizado)",
        wavelength: "1.5MHz - 7MHz",
        type: "Focalizado",
        targets: "SMAS, derme profunda",
        bestFor: "Lifting não invasivo, firmeza",
        characteristics: [
          "Aquecimento pontual em profundidade",
          "Estimulação intensa de colágeno",
          "Resultados progressivos",
          "Sem dano superficial"
        ]
      },
      {
        name: "Ultrassom 3D",
        wavelength: "1.5MHz - 4MHz",
        type: "Tridimensional",
        targets: "Múltiplas camadas dérmicas",
        bestFor: "Rejuvenescimento global",
        characteristics: [
          "Visualização em tempo real",
          "Múltiplas profundidades",
          "Controle preciso de energia",
          "Segurança aumentada"
        ]
      },
      {
        name: "Ultrassom Corporal",
        wavelength: "1MHz - 3MHz",
        type: "Não Focalizado",
        targets: "Tecido adiposo, fibroso",
        bestFor: "Redução de medidas, celulite",
        characteristics: [
          "Cavitação ultrassônica",
          "Rompimento de adipócitos",
          "Melhora da circulação",
          "Drenagem linfática"
        ]
      },
      {
        name: "Ultrassom Íntimo",
        wavelength: "1.5MHz - 4MHz",
        type: "Especializado",
        targets: "Mucosa, colágeno vaginal",
        bestFor: "Rejuvenescimento íntimo",
        characteristics: [
          "Aquecimento controlado da mucosa",
          "Remodelação do colágeno",
          "Melhora da lubrificação",
          "Aumento da elasticidade"
        ]
      }
    ]
  },
  {
    category: "Radiofrequência",
    devices: [
      {
        name: "RF Monopolar",
        wavelength: "RF (6MHz)",
        type: "Monopolar",
        targets: "Derme profunda, hipoderme",
        bestFor: "Lifting corporal, grandes áreas",
        characteristics: [
          "Penetração profunda",
          "Aquecimento volumétrico",
          "Ideal para corpo",
          "Remodelação intensa"
        ]
      },
      {
        name: "RF Bipolar",
        wavelength: "RF (1-2MHz)",
        type: "Bipolar",
        targets: "Derme superficial e média",
        bestFor: "Rejuvenescimento facial",
        characteristics: [
          "Controle preciso da profundidade",
          "Ideal para áreas delicadas",
          "Aquecimento controlado",
          "Segurança aumentada"
        ]
      },
      {
        name: "RF Multipolar",
        wavelength: "RF (1MHz)",
        type: "Multipolar",
        targets: "Múltiplas profundidades",
        bestFor: "Tratamento versátil",
        characteristics: [
          "Vários eletrodos simultâneos",
          "Distribuição homogênea",
          "Conforto aumentado",
          "Resultados graduais"
        ]
      },
      {
        name: "RF Fracionada",
        wavelength: "RF + Microagulhas",
        type: "Fracionado",
        targets: "Derme com microlesões",
        bestFor: "Cicatrizes, flacidez severa",
        characteristics: [
          "Microagulhamento com RF",
          "Remodelação intensa",
          "Microzonas de tratamento",
          "Resultados mais evidentes"
        ]
      }
    ]
  },
  {
    category: "Lasers de Baixa Intensidade (LLLT)",
    devices: [
      {
        name: "Laser Vermelho (660nm)",
        wavelength: "660nm",
        type: "Baixa Intensidade",
        targets: "Mitocôndrias, ATP",
        bestFor: "Cicatrização, anti-inflamatório",
        characteristics: [
          "Estimulação celular",
          "Aumento do ATP",
          "Efeito anti-inflamatório",
          "Aceleração da cicatrização"
        ]
      },
      {
        name: "Laser Infravermelho (810nm)",
        wavelength: "810nm",
        type: "Baixa Intensidade",
        targets: "Tecidos profundos",
        bestFor: "Estimulação capilar, dor",
        characteristics: [
          "Penetração profunda",
          "Estimulação folicular",
          "Vasodilatação",
          "Analgesia"
        ]
      },
      {
        name: "LED Terapia (múltiplos)",
        wavelength: "630nm-850nm",
        type: "Diodo Emissor de Luz",
        targets: "Células superficiais",
        bestFor: "Acne, cicatrização, rejuvenescimento",
        characteristics: [
          "Múltiplos comprimentos de onda",
          "Área de tratamento ampla",
          "Sem aquecimento",
          "Bioestimulação celular"
        ]
      }
    ]
  },
  {
    category: "Lasers Especiais",
    devices: [
      {
        name: "Picossegundo (755nm/532nm/1064nm)",
        wavelength: "Múltiplos",
        type: "Ultra-rápido",
        targets: "Pigmentos, tatuagens",
        bestFor: "Remoção de tatuagens, melasma",
        characteristics: [
          "Pulsos ultra-curtos",
          "Quebra mecânica de pigmentos",
          "Menor efeito térmico",
          "Remoção eficaz de tatuagens"
        ]
      },
      {
        name: "Q-Switched Nd:YAG",
        wavelength: "1064nm/532nm",
        type: "Nano-pulsos",
        targets: "Pigmentos escuros/claros",
        bestFor: "Tatuagens, nevus de Ota",
        characteristics: [
          "Pulsos muito curtos",
          "Dois comprimentos de onda",
          "Seletividade por pigmentos",
          "Mínimo dano térmico"
        ]
      }
    ]
  }
];

const safetyRisks = [
  {
    category: "Riscos Térmicos",
    risks: [
      {
        title: "Queimaduras Epidérmicas",
        description: "Lesões na superfície da pele por excesso de energia ou resfriamento inadequado",
        prevention: "Teste de spot, resfriamento adequado, parâmetros conservadores",
        severity: "Alto"
      },
      {
        title: "Queimaduras Dérmicas",
        description: "Lesões profundas que podem resultar em cicatrizes",
        prevention: "Sobreposição mínima de pulsos, intervalos adequados, monitoramento",
        severity: "Muito Alto"
      }
    ]
  },
  {
    category: "Riscos Pigmentares",
    risks: [
      {
        title: "Hiperpigmentação Pós-Inflamatória",
        description: "Escurecimento da pele após o tratamento, especialmente em fototipos altos",
        prevention: "Parâmetros adequados para fototipo, proteção solar rigorosa",
        severity: "Médio"
      },
      {
        title: "Hipopigmentação",
        description: "Clareamento permanente da pele por dano aos melanócitos",
        prevention: "Evitar sobreposição, parâmetros conservadores em peles escuras",
        severity: "Alto"
      }
    ]
  },
  {
    category: "Riscos Oculares",
    risks: [
      {
        title: "Lesão Retiniana",
        description: "Dano permanente à retina por exposição laser direta",
        prevention: "Óculos de proteção específicos, campo visual livre",
        severity: "Muito Alto"
      },
      {
        title: "Lesão Corneal",
        description: "Queimaduras na córnea por reflexão ou exposição indireta",
        prevention: "Proteção ocular completa, cuidado com superfícies refletivas",
        severity: "Alto"
      }
    ]
  }
];

const skinClassifications = [
  {
    title: "Classificação do Envelhecimento (Glogau)",
    grades: [
      { grade: "I", age: "20-30 anos", description: "Sem rugas, alterações pigmentares mínimas" },
      { grade: "II", age: "30-40 anos", description: "Rugas dinâmicas, lentigos solares precoces" },
      { grade: "III", age: "40-60 anos", description: "Rugas estáticas, elastose solar visível" },
      { grade: "IV", age: "60+ anos", description: "Rugas severas, fotoenvelhecimento intenso" }
    ]
  },
  {
    title: "Classificação de Cicatrizes de Acne",
    grades: [
      { grade: "Leve", description: "Cicatrizes superficiais, facilmente camufladas com maquiagem" },
      { grade: "Moderada", description: "Cicatrizes mais evidentes, visíveis à distância social" },
      { grade: "Severa", description: "Cicatrizes profundas e extensas, comprometimento estético significativo" }
    ]
  },
  {
    title: "Escala de Acne (Leeds)",
    grades: [
      { grade: "0", description: "Pele normal" },
      { grade: "1-2", description: "Acne leve: comedões e pápulas esparsas" },
      { grade: "3-4", description: "Acne moderada: múltiplas lesões inflamatórias" },
      { grade: "5-6", description: "Acne severa: nódulos e cistos" }
    ]
  }
];

const postCareRecommendations = [
  {
    category: "Gerais (Imediatos)",
    items: [
      "Aplicar compressas frias/gelo (protegido) para reduzir inchaço e vermelhidão.",
      "Evitar maquiagem por 24 horas, ou conforme orientação específica.",
      "Manter a pele limpa e hidratada com produtos suaves e recomendados."
    ]
  },
  {
    category: "Proteção Solar",
    items: [
      "Uso obrigatório de protetor solar (FPS 30+ ou superior) diariamente.",
      "Reaplicar a cada 2-3 horas, especialmente após transpiração ou contato com água.",
      "Evitar exposição solar direta por, no mínimo, 15-30 dias após o procedimento."
    ]
  },
  {
    category: "Cuidados Específicos",
    items: [
      "Não coçar, esfregar ou puxar a pele tratada.",
      "Evitar banhos muito quentes, saunas, piscinas e atividades físicas intensas por 48 horas.",
      "Utilizar sabonetes e hidratantes neutros, sem fragrância ou álcool.",
      "Em caso de bolhas, crostas ou alterações inesperadas, contatar o profissional imediatamente."
    ]
  },
  {
    category: "Hidratação e Reparação",
    items: [
      "Usar cremes reparadores pós-procedimento recomendados para acelerar a recuperação da barreira cutânea.",
      "Beber bastante água para manter a hidratação geral do corpo e da pele."
    ]
  },
  {
    category: "O que Evitar",
    items: [
      "Produtos irritantes ou esfoliantes (ácidos, retinoides) por pelo menos uma semana.",
      "Exposição a fontes de calor excessivo (fogão, lareira) se a área tratada for sensível.",
      "Remover crostas ou peles que estejam descamando naturalmente."
    ]
  }
];

const manchesterProtocol = {
  title: "Protocolo de Manchester (Sistema de Triagem de Risco)",
  description: "O Protocolo de Manchester é um sistema de classificação de risco amplamente utilizado em serviços de emergência para priorizar o atendimento. No contexto dermatológico e de procedimentos a laser, adaptamos seus princípios para classificar a urgência e o risco de complicações.",
  categories: [
    {
      level: "Vermelho - Emergência",
      priority: "Imediato",
      description: "Reações graves que exigem intervenção imediata",
      examples: [
        "Anafilaxia ou reação alérgica grave",
        "Queimadura profunda (grau 3) extensa",
        "Comprometimento de vias aéreas (edema de glote)",
        "Sintomas sistêmicos graves (hipotensão, taquicardia)"
      ],
      action: "Interromper procedimento imediatamente. Acionar serviço de emergência (SAMU 192). Suporte básico de vida."
    },
    {
      level: "Laranja - Muito Urgente",
      priority: "Até 10 minutos",
      description: "Complicações sérias que necessitam avaliação e intervenção rápida",
      examples: [
        "Queimadura de segundo grau extensa (>10% da área corporal)",
        "Dor intensa não controlada",
        "Edema facial severo",
        "Sangramento não controlado"
      ],
      action: "Avaliar imediatamente. Considerar transferência hospitalar. Iniciar tratamento de suporte."
    },
    {
      level: "Amarelo - Urgente",
      priority: "Até 60 minutos",
      description: "Complicações que necessitam avaliação médica em curto prazo",
      examples: [
        "Bolhas extensas",
        "Eritema persistente após 24h",
        "Hiperpigmentação pós-inflamatória severa",
        "Infecção local (celulite inicial)"
      ],
      action: "Avaliação médica necessária. Prescrever tratamento adequado. Acompanhamento próximo."
    },
    {
      level: "Verde - Pouco Urgente",
      priority: "Até 2 horas",
      description: "Reações esperadas ou complicações menores",
      examples: [
        "Eritema leve a moderado",
        "Edema discreto",
        "Desconforto leve",
        "Ressecamento cutâneo"
      ],
      action: "Orientações de cuidados pós-procedimento. Reavaliação em 48-72h se necessário."
    },
    {
      level: "Azul - Não Urgente",
      priority: "Até 4 horas",
      description: "Condições estáveis, reações esperadas e autolimitadas",
      examples: [
        "Hiperemia transitória normal",
        "Leve sensação de calor",
        "Prurido leve",
        "Descamação pós-tratamento"
      ],
      action: "Acompanhamento de rotina. Orientações gerais. Retorno programado."
    }
  ]
};

export default function Reference() {
  const [selectedPhototype, setSelectedPhototype] = useState(null);

  return (
    <PageBlockChecker pageName="Reference">
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Guia de Referência</h1>
          <p className="text-slate-600 text-sm md:text-lg">Conhecimento essencial para laser dermatológico</p>
        </div>
      </div>

      {/* AdBlock Warning Section */}
      <Card className="mb-6 md:mb-8 bg-red-50 border-l-4 border-red-500 text-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg md:text-xl text-red-800">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
            Atenção: AdBlock Ativado?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm md:text-base text-red-700">
            Identificamos que você pode estar usando um bloqueador de anúncios. Para garantir o acesso
            completo a todos os recursos e links externos (como a <strong>Laser Academy</strong>),
            recomendamos desativá-lo temporariamente para esta página.
          </p>
        </CardContent>
      </Card>

      {/* LaserAcademy Section - Novo Design */}
      <Card className="mb-6 md:mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 overflow-hidden relative text-white">
        <CardContent className="p-6 sm:p-8 md:p-12">
          {/* Badge Primeira Turma */}
          <div className="mb-6">
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 text-xs font-medium">
              ● Primeira Turma
            </Badge>
          </div>

          {/* Título Principal */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Laser Academy
              </span>
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              transforme sua tecnologia<br />em resultados previsíveis
            </h3>
          </div>

          {/* Descrição */}
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl">
            Suas tecnologias a favor dos seus pacientes e do faturamento do consultório. 
            Chega de protocolos superficiais e equipamentos parados — aqui você aprende{' '}
            <span className="text-yellow-400 font-semibold">ciência aplicada</span>{' '}
            para extrair performance clínica e rentabilidade real.
          </p>

          {/* Botão Principal (Ajustado) */}
          <div className="mb-8">
            <Button
              onClick={() => window.open('https://laser-academy.peledigital.com/?src=LAC25SET_areamembrosPD&utm_source=areademembroslasercodePD&utm_campaign=LAC25SET', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold text-base py-6 px-8 shadow-lg w-full sm:w-auto"
            >
              QUERO DOMINAR MINHA TECNOLOGIA
            </Button>
            {/* O segundo botão "Ver programa" foi removido conforme a solicitação de ajuste */}
          </div>

          {/* Lista de Benefícios */}
          <div className="space-y-3">
            {[
              'Protocolos validados',
              'Framework de dose e indicação',
              'Máquinas ociosas virando ativo'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manchester Protocol Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Shield className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
            {manchesterProtocol.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-6 text-base">{manchesterProtocol.description}</p>
          
          <div className="space-y-4">
            {manchesterProtocol.categories.map((category, index) => (
              <Card key={index} className={`border-l-4 ${
                category.level.includes('Vermelho') ? 'border-l-red-600' :
                category.level.includes('Laranja') ? 'border-l-orange-500' :
                category.level.includes('Amarelo') ? 'border-l-yellow-500' :
                category.level.includes('Verde') ? 'border-l-green-500' :
                'border-l-blue-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.level}</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      Prioridade: {category.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Exemplos:</h4>
                      <ul className="space-y-1">
                        {category.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm"><strong>Ação:</strong> {category.action}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fototipos Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Sun className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            Fototipos de Fitzpatrick
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-4 md:mb-6 text-base">
            A classificação de fototipos é fundamental para determinar parâmetros seguros e eficazes nos tratamentos a laser.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            {phototypeData.map((phototype) => (
              <Card
                key={phototype.type}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPhototype === phototype.type ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedPhototype(selectedPhototype === phototype.type ? null : phototype.type)}
              >
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-base px-2 py-0.5 md:text-lg md:px-3 md:py-1 ${phototype.color} border`}>
                      Tipo {phototype.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Risco {phototype.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-semibold text-slate-900 mb-1 md:mb-2 text-sm">{phototype.description}</p>
                  <p className="text-xs text-slate-600 mb-2 md:mb-3">{phototype.characteristics}</p>
                  <p className="text-xs text-slate-500 italic">{phototype.examples}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPhototype && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="py-3 md:py-4">
                <CardTitle className="text-base md:text-lg text-blue-900">
                  Recomendações para Fototipo {selectedPhototype}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 md:py-4">
                <ul className="space-y-1 md:space-y-2 text-sm">
                  {phototypeData.find(p => p.type === selectedPhototype)?.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2 text-blue-800">
                      <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Laser Types Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
            Guia Completo de Lasers e Tecnologias
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-4 md:mb-6 text-base">
            Referência completa de todos os tipos de laser utilizados em dermatologia, organizados por categoria e aplicação.
          </p>

          {laserTypes.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 pb-1 md:pb-2 border-b border-slate-200">
                {category.category}
              </h3>
              <div className="grid gap-3 md:gap-4">
                {category.devices.map((device, deviceIndex) => (
                  <Card key={deviceIndex} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-base md:text-lg">{device.name}</CardTitle>
                        <div className="flex gap-1 md:gap-2 flex-wrap">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">{device.wavelength}</Badge>
                          <Badge variant="outline" className={`text-xs ${device.type === 'Fracionado' || device.type.includes('Focalizado') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                            {device.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{device.bestFor}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 md:pt-1">
                      <p className="text-slate-600 mb-2 md:mb-3 text-sm"><strong>Alvos principais:</strong> {device.targets}</p>
                      <div className="grid md:grid-cols-2 gap-1 md:gap-2">
                        {device.characteristics.map((char, charIndex) => (
                          <div key={charIndex} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                            <ArrowRight className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                            {char}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety Risks Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
            Riscos de Segurança e Prevenção
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-4 md:mb-6 text-base">
            Compreenda os principais riscos associados aos tratamentos laser e como preveni-los.
          </p>

          {safetyRisks.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 pb-1 md:pb-2 border-b border-red-200">
                {category.category}
              </h3>
              <div className="grid gap-3 md:gap-4">
                {category.risks.map((risk, riskIndex) => (
                  <Card key={riskIndex} className={`border-l-4 ${risk.severity === 'Muito Alto' ? 'border-l-red-600' : risk.severity === 'Alto' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-1 md:mb-2">
                        <h4 className="font-semibold text-slate-900 text-base">{risk.title}</h4>
                        <Badge className={`text-xs ${risk.severity === 'Muito Alto' ? 'bg-red-100 text-red-800' : risk.severity === 'Alto' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2 md:mb-3 text-sm">{risk.description}</p>
                      <div className="bg-green-50 p-2 md:p-3 rounded-lg">
                        <p className="text-green-800 text-xs md:text-sm"><strong>Prevenção:</strong> {risk.prevention}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skin Classifications Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <ListChecks className="w-6 h-6 md:w-7 md:h-7 text-teal-600" />
            Classificações Dermatológicas Essenciais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-4 md:mb-6 text-base">
            Escalas e classificações essenciais para uma avaliação dermatológica pré-procedimento precisa.
          </p>

          {skinClassifications.map((classification, classIndex) => (
            <div key={classIndex} className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 pb-1 md:pb-2 border-b border-teal-200">
                {classification.title}
              </h3>
              <div className="grid gap-2 md:gap-3">
                {classification.grades.map((grade, gradeIndex) => (
                  <div key={gradeIndex} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-teal-50 rounded-lg">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                      {grade.grade}
                    </div>
                    <div className="flex-1">
                      {grade.age && <p className="text-teal-600 text-xs md:text-sm font-medium">{grade.age}</p>}
                      <p className="text-slate-700 text-sm md:text-base">{grade.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Post-Care Recommendations Section */}
      <Card className="mb-6 md:mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-red-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Heart className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
            Cuidados Pós-Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-600 mb-4 md:mb-6 text-base">
            Orientações cruciais para a recuperação da pele e otimização dos resultados após tratamentos a laser.
          </p>

          {postCareRecommendations.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 pb-1 md:pb-2 border-b border-pink-200">
                {category.category}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-slate-700 text-sm md:text-base">
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-pink-500 mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety and Algorithm Section */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Shield className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
            Algoritmo de Segurança LaserCode
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            <AccordionItem value="safety-factor" className="border border-slate-200 rounded-lg px-4 md:px-6">
              <AccordionTrigger className="text-base md:text-lg font-semibold">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  Fator de Segurança (FS)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 md:pt-4">
                <p className="text-slate-700 mb-3 md:mb-4 text-sm">
                  O Fator de Segurança é calculado com base no fototipo e fatores de risco do paciente.
                  Atua como um redutor da energia inicial para prevenir complicações.
                </p>
                <div className="bg-slate-50 p-3 md:p-4 rounded-lg">
                  <p className="font-mono text-xs md:text-sm">FS = f(Fototipo, Fatores de Risco)</p>
                  <ul className="mt-2 md:mt-3 space-y-1 text-xs md:text-sm text-slate-600">
                    <li>• Fototipo I-II: FS = 0.6-0.7 (redução de 30-40%)</li>
                    <li>• Fototipo III-IV: FS = 0.8-0.9 (redução de 10-20%)</li>
                    <li>• Fototipo V-VI: FS = 1.0-1.1 (parâmetros padrão ou aumentados)</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="key-parameter" className="border border-slate-200 rounded-lg px-4 md:px-6">
              <AccordionTrigger className="text-base md:text-lg font-semibold">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  Parâmetro Chave (PC)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 md:pt-4">
                <p className="text-slate-700 mb-3 md:mb-4 text-sm">
                  O algoritmo identifica qual parâmetro é mais crítico baseado no tipo de alvo do tratamento.
                </p>
                <div className="grid gap-3 md:gap-4">
                  <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1 md:mb-2 text-base">Melanina Epidérmica</h4>
                    <p className="text-blue-800 text-xs md:text-sm">PC = Fluência (J/cm²) - Parâmetro crítico para absorção seletiva</p>
                  </div>
                  <div className="bg-red-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-1 md:mb-2 text-base">Alvos Vasculares</h4>
                    <p className="text-red-800 text-xs md:text-sm">PC = Duração de Pulso (ms) - Controla coagulação vascular</p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-1 md:mb-2 text-base">Colágeno Profundo</h4>
                    <p className="text-green-800 text-xs md:text-sm">PC = Profundidade/Temperatura - Estimulação controlada</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="intensity-modulator" className="border border-slate-200 rounded-lg px-4 md:px-6">
              <AccordionTrigger className="text-base md:text-lg font-semibold">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Modulador de Intensidade (MI)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 md:pt-4">
                <p className="text-slate-700 mb-3 md:mb-4 text-sm">
                  Baseado no Nível de Agressividade Desejado (NAD), determina a intensidade do tratamento.
                </p>
                <div className="bg-slate-50 p-3 md:p-4 rounded-lg">
                  <p className="font-mono text-xs md:text-sm mb-2 md:mb-3">MI = f(Nível de Agressividade)</p>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-600">
                    <li><strong>Conservador:</strong> MI = 0.8 (redução de 20%)</li>
                    <li><strong>Moderado:</strong> MI = 1.0 (parâmetros padrão)</li>
                    <li><strong>Agressivo:</strong> MI = 1.2 (aumento de 20%)</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="final-calculation" className="border border-slate-200 rounded-lg px-4 md:px-6">
              <AccordionTrigger className="text-base md:text-lg font-semibold">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Cálculo Final
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 md:pt-4">
                <div className="bg-indigo-50 p-4 md:p-6 rounded-lg">
                  <h4 className="font-bold text-indigo-900 mb-3 md:mb-4 text-base md:text-lg">Fórmula Integrada LaserCode</h4>
                  <div className="text-center mb-3 md:mb-4">
                    <p className="font-mono text-lg md:text-xl text-indigo-800 bg-white p-3 md:p-4 rounded-lg shadow-sm">
                      D<sub>inicial</sub> = (Parâmetro Base × MI) / FS
                    </p>
                  </div>
                  <p className="text-indigo-700 text-sm">
                    Esta fórmula integra todos os fatores de segurança, personalização e eficácia para gerar
                    um ponto de partida muito mais seguro e personalizado do que protocolos de fábrica genéricos.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
    </PageBlockChecker>
  );
}