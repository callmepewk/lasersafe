import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Search, Pill } from 'lucide-react';
import PageBlockChecker from '../components/system/PageBlockChecker';

const formulasDatabase = [
  // DESPIGMENTANTES
  {
    category: "Despigmentantes",
    name: "Fórmula de Kligman Modificada",
    activeIngredients: ["Hidroquinona", "Tretinoína", "Fluocinolona"],
    concentrations: "Hidroquinona 4-6% + Tretinoína 0,025-0,05% + Fluocinolona 0,01%",
    indications: "Melasma, hiperpigmentação pós-inflamatória",
    observations: "Uso noturno. Fotoproteção rigorosa durante o dia."
  },
  {
    category: "Despigmentantes",
    name: "Trio Clareador",
    activeIngredients: ["Ácido Kójico", "Ácido Azelaico", "Arbutin"],
    concentrations: "Ácido Kójico 2-4% + Ácido Azelaico 10-20% + Arbutin 2-5%",
    indications: "Melasma leve a moderado, manchas solares",
    observations: "Alternativa para pacientes intolerantes à hidroquinona."
  },
  {
    category: "Despigmentantes",
    name: "Vitamina C Clareadora",
    activeIngredients: ["Ácido Ascórbico", "Ácido Ferúlico", "Vitamina E"],
    concentrations: "Vitamina C 10-20% + Ácido Ferúlico 0,5-1% + Vitamina E 1%",
    indications: "Clareamento, antioxidante, fotoenvelhecimento",
    observations: "Aplicar pela manhã antes do protetor solar."
  },
  {
    category: "Despigmentantes",
    name: "Tranexâmico Tópico",
    activeIngredients: ["Ácido Tranexâmico", "Niacinamida"],
    concentrations: "Ácido Tranexâmico 3-5% + Niacinamida 4%",
    indications: "Melasma refratário, hiperpigmentação",
    observations: "Efeito anti-inflamatório e inibidor da melanogênese."
  },
  {
    category: "Despigmentantes",
    name: "Coctail Despigmentante Intensivo",
    activeIngredients: ["Hidroquinona", "Tretinoína", "Ácido Kójico", "Ácido Azelaico"],
    concentrations: "Hidroquinona 4% + Tretinoína 0,05% + Kójico 2% + Azelaico 15%",
    indications: "Melasma severo e refratário",
    observations: "Uso supervisionado. Ciclos de 3-4 meses."
  },
  {
    category: "Despigmentantes",
    name: "Alpha Arbutin Avançado",
    activeIngredients: ["Alpha Arbutin", "Ácido Kójico", "Niacinamida"],
    concentrations: "Alpha Arbutin 3% + Ácido Kójico 2% + Niacinamida 4%",
    indications: "Hiperpigmentação, manchas, uniformização do tom",
    observations: "Mais estável que arbutin comum. Uso diário."
  },
  {
    category: "Despigmentantes",
    name: "Resveratrol Iluminador",
    activeIngredients: ["Resveratrol", "Ácido Ferúlico", "Niacinamida"],
    concentrations: "Resveratrol 1% + Ácido Ferúlico 0,5% + Niacinamida 4%",
    indications: "Fotoenvelhecimento, hiperpigmentação, antioxidante",
    observations: "Potente antioxidante. Fotoprotetor celular."
  },
  {
    category: "Despigmentantes",
    name: "Cisteamina Despigmentante",
    activeIngredients: ["Cisteamina", "Niacinamida"],
    concentrations: "Cisteamina 5% + Niacinamida 4%",
    indications: "Melasma resistente, hiperpigmentação",
    observations: "Alternativa promissora à hidroquinona."
  },

  // ANTIACNE
  {
    category: "Antiacne",
    name: "Gel Secativo Antiacne",
    activeIngredients: ["Peróxido de Benzoíla", "Ácido Salicílico", "Enxofre"],
    concentrations: "Peróxido de Benzoíla 5% + Ácido Salicílico 2% + Enxofre 5%",
    indications: "Acne inflamatória, comedões",
    observations: "Uso noturno. Pode causar ressecamento inicial."
  },
  {
    category: "Antiacne",
    name: "Tretinoína Antiacne",
    activeIngredients: ["Tretinoína", "Clindamicina"],
    concentrations: "Tretinoína 0,025-0,05% + Clindamicina 1%",
    indications: "Acne comedônica e inflamatória",
    observations: "Uso noturno. Proteção solar obrigatória."
  },
  {
    category: "Antiacne",
    name: "Ácido Azelaico Purificante",
    activeIngredients: ["Ácido Azelaico", "Niacinamida"],
    concentrations: "Ácido Azelaico 15-20% + Niacinamida 4%",
    indications: "Acne, rosácea, hiperpigmentação pós-inflamatória",
    observations: "Bem tolerado, pode ser usado 2x ao dia."
  },
  {
    category: "Antiacne",
    name: "Adapaleno com Peróxido",
    activeIngredients: ["Adapaleno", "Peróxido de Benzoíla"],
    concentrations: "Adapaleno 0,1-0,3% + Peróxido de Benzoíla 2,5%",
    indications: "Acne moderada a severa",
    observations: "Combinação potente. Introduzir gradualmente."
  },
  {
    category: "Antiacne",
    name: "Isotretinoína Tópica",
    activeIngredients: ["Isotretinoína", "Eritromicina"],
    concentrations: "Isotretinoína 0,05% + Eritromicina 2%",
    indications: "Acne nodular, acne resistente",
    observations: "Uso supervisionado. Muito potente."
  },
  {
    category: "Antiacne",
    name: "Ácido Salicílico LHA",
    activeIngredients: ["LHA (Lipo-Hydroxy Acid)", "Ácido Salicílico"],
    concentrations: "LHA 0,5% + Ácido Salicílico 2%",
    indications: "Acne, poros dilatados, renovação celular",
    observations: "Esfoliação suave. Ideal para peles sensíveis."
  },
  {
    category: "Antiacne",
    name: "Zinco com Niacinamida",
    activeIngredients: ["Zinco PCA", "Niacinamida", "Ácido Salicílico"],
    concentrations: "Zinco PCA 1% + Niacinamida 4% + Salicílico 0,5%",
    indications: "Acne leve, controle de oleosidade",
    observations: "Regulador sebáceo. Uso diário."
  },
  {
    category: "Antiacne",
    name: "Ácido Mandélico Antiacne",
    activeIngredients: ["Ácido Mandélico", "Ácido Salicílico"],
    concentrations: "Ácido Mandélico 5-10% + Ácido Salicílico 2%",
    indications: "Acne comedônica, hiperpigmentação",
    observations: "Ideal para peles sensíveis e escuras."
  },

  // ANTIENVELHECIMENTO
  {
    category: "Antienvelhecimento",
    name: "Sérum Antienvelhecimento Completo",
    activeIngredients: ["Retinol", "Ácido Hialurônico", "Peptídeos"],
    concentrations: "Retinol 0,3-1% + Ácido Hialurônico 1-2% + Peptídeos 5%",
    indications: "Rugas, flacidez, textura irregular",
    observations: "Uso noturno. Introduzir gradualmente."
  },
  {
    category: "Antienvelhecimento",
    name: "Vitamina A + E Regenerador",
    activeIngredients: ["Palmitato de Retinila", "Tocoferol", "DMAE"],
    concentrations: "Vitamina A 10.000 UI + Vitamina E 5% + DMAE 3%",
    indications: "Prevenção do envelhecimento, firmeza",
    observations: "Alternativa mais suave ao retinol."
  },
  {
    category: "Antienvelhecimento",
    name: "Ácido Glicólico Renovador",
    activeIngredients: ["Ácido Glicólico", "Vitamina C", "Ácido Ferúlico"],
    concentrations: "Ácido Glicólico 10-15% + Vitamina C 10% + Ácido Ferúlico 0,5%",
    indications: "Renovação celular, clareamento, textura",
    observations: "Uso noturno ou conforme orientação."
  },
  {
    category: "Antienvelhecimento",
    name: "Retinaldeído Avançado",
    activeIngredients: ["Retinaldeído", "Ácido Hialurônico", "Vitamina E"],
    concentrations: "Retinaldeído 0,05-0,1% + Ácido Hialurônico 1% + Vitamina E 1%",
    indications: "Envelhecimento avançado, rugas profundas",
    observations: "Mais potente que retinol, menos irritante que tretinoína."
  },
  {
    category: "Antienvelhecimento",
    name: "Bakuchiol Natural",
    activeIngredients: ["Bakuchiol", "Esqualano", "Peptídeos"],
    concentrations: "Bakuchiol 1-2% + Esqualano 3% + Peptídeos 3%",
    indications: "Alternativa natural ao retinol, antienvelhecimento",
    observations: "Ideal para gestantes e peles sensíveis."
  },
  {
    category: "Antienvelhecimento",
    name: "Matrixyl 3000 + Argireline",
    activeIngredients: ["Matrixyl 3000", "Argireline", "Ácido Hialurônico"],
    concentrations: "Matrixyl 3% + Argireline 10% + Ácido Hialurônico 1%",
    indications: "Rugas de expressão, linhas finas",
    observations: "'Botox-like' tópico. Relaxamento muscular superficial."
  },
  {
    category: "Antienvelhecimento",
    name: "Ácido Hialurônico Multi-Peso",
    activeIngredients: ["HA Baixo Peso", "HA Médio Peso", "HA Alto Peso"],
    concentrations: "HA 3 pesos moleculares 2% total",
    indications: "Hidratação profunda, preenchimento de rugas",
    observations: "Ação em múltiplas camadas da pele."
  },
  {
    category: "Antienvelhecimento",
    name: "Idebenona Antioxidante",
    activeIngredients: ["Idebenona", "Ácido Ferúlico", "Vitamina E"],
    concentrations: "Idebenona 1% + Ferúlico 0,5% + Vitamina E 1%",
    indications: "Fotoenvelhecimento, proteção antioxidante",
    observations: "Antioxidante mais potente que Vitamina C."
  },

  // HIDRATANTES
  {
    category: "Hidratantes",
    name: "Hidratação Intensiva",
    activeIngredients: ["Ácido Hialurônico", "Ureia", "Pantenol"],
    concentrations: "Ácido Hialurônico 2% + Ureia 10% + Pantenol 5%",
    indications: "Pele seca, desidratada, pós-procedimentos",
    observations: "Uso diário, manhã e noite."
  },
  {
    category: "Hidratantes",
    name: "Ceramidas Reparadoras",
    activeIngredients: ["Ceramidas", "Colesterol", "Ácidos Graxos"],
    concentrations: "Ceramidas 2% + Colesterol 1% + Ácidos Graxos 2%",
    indications: "Restauração da barreira cutânea, dermatite atópica",
    observations: "Ideal para peles sensíveis e reativas."
  },
  {
    category: "Hidratantes",
    name: "Glicerina com Niacinamida",
    activeIngredients: ["Glicerina", "Niacinamida", "Alantoína"],
    concentrations: "Glicerina 5% + Niacinamida 4% + Alantoína 1%",
    indications: "Hidratação diária, peles normais a secas",
    observations: "Fórmula leve. Uso manhã e noite."
  },
  {
    category: "Hidratantes",
    name: "Esqualano Nutritivo",
    activeIngredients: ["Esqualano", "Óleo de Rosa Mosqueta", "Vitamina E"],
    concentrations: "Esqualano 5% + Rosa Mosqueta 3% + Vitamina E 1%",
    indications: "Pele muito seca, nutrição profunda",
    observations: "Textura oleosa. Ideal para uso noturno."
  },
  {
    category: "Hidratantes",
    name: "Centella Asiática Calmante",
    activeIngredients: ["Centella Asiática", "Pantenol", "Madecassoside"],
    concentrations: "Centella 5% + Pantenol 3% + Madecassoside 1%",
    indications: "Peles sensíveis, irritadas, pós-procedimentos",
    observations: "Efeito cicatrizante e anti-inflamatório."
  },

  // CAPILARES
  {
    category: "Capilares",
    name: "Minoxidil Capilar",
    activeIngredients: ["Minoxidil", "Finasterida", "Tretinoína"],
    concentrations: "Minoxidil 5-15% + Finasterida 0,1% + Tretinoína 0,005%",
    indications: "Alopecia androgenética, queda capilar",
    observations: "Uso tópico no couro cabeludo. Finasterida apenas para homens."
  },
  {
    category: "Capilares",
    name: "Estimulante Capilar Avançado",
    activeIngredients: ["Minoxidil", "Biotina", "Cafeína", "Adenosina"],
    concentrations: "Minoxidil 5% + Biotina 0,1% + Cafeína 1% + Adenosina 0,75%",
    indications: "Queda capilar difusa, fortalecimento dos fios",
    observations: "Aplicar 1x ao dia no couro cabeludo seco."
  },
  {
    category: "Capilares",
    name: "Latanoprosta para Cílios/Sobrancelhas",
    activeIngredients: ["Latanoprosta", "Biotina"],
    concentrations: "Latanoprosta 0,03% + Biotina 0,1%",
    indications: "Crescimento de cílios e sobrancelhas",
    observations: "Aplicar à noite com aplicador fino."
  },
  {
    category: "Capilares",
    name: "Dutasterida Capilar",
    activeIngredients: ["Dutasterida", "Minoxidil"],
    concentrations: "Dutasterida 0,1% + Minoxidil 5%",
    indications: "Alopecia androgenética severa",
    observations: "Mais potente que finasterida. Uso masculino."
  },
  {
    category: "Capilares",
    name: "Redensyl Capilar",
    activeIngredients: ["Redensyl", "Procapil", "Biotina"],
    concentrations: "Redensyl 3% + Procapil 2% + Biotina 0,1%",
    indications: "Densidade capilar, crescimento",
    observations: "Alternativa natural ao minoxidil."
  },
  {
    category: "Capilares",
    name: "Finasterida Tópica",
    activeIngredients: ["Finasterida", "Minoxidil", "Biotina"],
    concentrations: "Finasterida 0,25% + Minoxidil 5% + Biotina 0,1%",
    indications: "Calvície masculina, queda androgenética",
    observations: "Aplicação tópica reduz efeitos sistêmicos."
  },

  // CICATRIZANTES
  {
    category: "Cicatrizantes",
    name: "Gel Cicatrizante Pós-Laser",
    activeIngredients: ["Alantoína", "Pantenol", "Ácido Hialurônico"],
    concentrations: "Alantoína 2% + Pantenol 5% + Ácido Hialurônico 1%",
    indications: "Pós-procedimentos, cicatrização, queimaduras leves",
    observations: "Uso frequente nas primeiras 48-72h."
  },
  {
    category: "Cicatrizantes",
    name: "Regenerador Intensivo",
    activeIngredients: ["Fatores de Crescimento", "Centella Asiática", "Silicone"],
    concentrations: "Fatores de Crescimento 5% + Centella 5% + Silicone 10%",
    indications: "Cicatrizes hipertróficas, queloides, regeneração",
    observations: "Aplicar 2-3x ao dia sobre a cicatriz."
  },
  {
    category: "Cicatrizantes",
    name: "Rosa Mosqueta Regenerador",
    activeIngredients: ["Óleo de Rosa Mosqueta", "Vitamina E", "Alantoína"],
    concentrations: "Rosa Mosqueta 30% + Vitamina E 3% + Alantoína 1%",
    indications: "Cicatrizes antigas, estrias, regeneração",
    observations: "Uso prolongado para resultados visíveis."
  },
  {
    category: "Cicatrizantes",
    name: "EGF Epidermal Growth Factor",
    activeIngredients: ["EGF", "Ácido Hialurônico", "Pantenol"],
    concentrations: "EGF 10ppm + Ácido Hialurônico 1% + Pantenol 3%",
    indications: "Cicatrização acelerada, regeneração celular",
    observations: "Tecnologia biomimética avançada."
  },

  // ROSÁCEA E SENSIBILIDADE
  {
    category: "Rosácea",
    name: "Calmante Anti-Rosácea",
    activeIngredients: ["Metronidazol", "Ácido Azelaico", "Niacinamida"],
    concentrations: "Metronidazol 0,75% + Ácido Azelaico 15% + Niacinamida 4%",
    indications: "Rosácea, eritema, telangiectasias",
    observations: "Uso 1-2x ao dia. Evitar gatilhos (sol, calor, álcool)."
  },
  {
    category: "Rosácea",
    name: "Gel Calmante Sensível",
    activeIngredients: ["Ivermectina", "Ácido Tranexâmico"],
    concentrations: "Ivermectina 1% + Ácido Tranexâmico 3%",
    indications: "Rosácea pápulo-pustulosa",
    observations: "Aplicar 1x ao dia."
  },
  {
    category: "Rosácea",
    name: "Azuleno Calmante",
    activeIngredients: ["Azuleno", "Bisabolol", "Alantoína"],
    concentrations: "Azuleno 1% + Bisabolol 2% + Alantoína 1%",
    indications: "Peles sensíveis, vermelhidão, irritação",
    observations: "Efeito calmante e anti-inflamatório."
  },
  {
    category: "Rosácea",
    name: "Brimonidina Gel",
    activeIngredients: ["Brimonidina", "Niacinamida"],
    concentrations: "Brimonidina 0,33% + Niacinamida 4%",
    indications: "Eritema facial persistente da rosácea",
    observations: "Reduz vermelhidão rapidamente. Uso sob supervisão."
  },

  // CONTROLE DE OLEOSIDADE
  {
    category: "Controle de Oleosidade",
    name: "Gel Matificante",
    activeIngredients: ["Ácido Salicílico", "Niacinamida", "Zinco PCA"],
    concentrations: "Ácido Salicílico 2% + Niacinamida 4% + Zinco PCA 1%",
    indications: "Pele oleosa, poros dilatados, acne",
    observations: "Uso diário. Controla a produção de sebo."
  },
  {
    category: "Controle de Oleosidade",
    name: "LHA Seborregulador",
    activeIngredients: ["LHA", "Niacinamida", "Zinco Gluconato"],
    concentrations: "LHA 0,5% + Niacinamida 4% + Zinco 1%",
    indications: "Oleosidade excessiva, poros dilatados",
    observations: "Textura ultra-leve. Efeito mate prolongado."
  },

  // PEELING QUÍMICO DOMICILIAR
  {
    category: "Peeling Domiciliar",
    name: "Peeling Suave Multiácidos",
    activeIngredients: ["Ácido Glicólico", "Ácido Lático", "Ácido Salicílico"],
    concentrations: "Glicólico 5% + Lático 5% + Salicílico 1%",
    indications: "Renovação celular, textura, luminosidade",
    observations: "Uso 2-3x por semana à noite."
  },
  {
    category: "Peeling Domiciliar",
    name: "Peeling de Mandelic",
    activeIngredients: ["Ácido Mandélico", "Ácido Lático"],
    concentrations: "Ácido Mandélico 10% + Ácido Lático 5%",
    indications: "Peles sensíveis, melasma, acne",
    observations: "Mais suave que glicólico. Ideal para iniciantes."
  },
  {
    category: "Peeling Domiciliar",
    name: "AHA + BHA Complex",
    activeIngredients: ["Ácido Glicólico", "Ácido Salicílico", "Ácido Lático"],
    concentrations: "Glicólico 10% + Salicílico 2% + Lático 5%",
    indications: "Renovação profunda, acne, poros",
    observations: "Uso semanal. Pode causar descamação."
  },
  {
    category: "Peeling Domiciliar",
    name: "PHA Gluconolactona",
    activeIngredients: ["Gluconolactona", "Lactobiônico"],
    concentrations: "Gluconolactona 10% + Lactobiônico 5%",
    indications: "Peles sensíveis, rosácea, renovação suave",
    observations: "PHA: polihidroxiácido. Menos irritante."
  },

  // OLHEIRAS
  {
    category: "Olheiras",
    name: "Gel Clareador para Olheiras",
    activeIngredients: ["Vitamina K", "Cafeína", "Ácido Kójico"],
    concentrations: "Vitamina K 2% + Cafeína 3% + Ácido Kójico 1%",
    indications: "Olheiras, bolsas, vasodilatação periorbital",
    observations: "Aplicar com leves toques ao redor dos olhos."
  },
  {
    category: "Olheiras",
    name: "Sérum Periorbital Avançado",
    activeIngredients: ["Cafeína", "Peptídeos", "Ácido Hialurônico"],
    concentrations: "Cafeína 5% + Peptídeos 3% + Ácido Hialurônico 1%",
    indications: "Olheiras, inchaço, linhas finas",
    observations: "Drenante e antienvelhecimento."
  },

  // ESTRIAS
  {
    category: "Estrias",
    name: "Creme Anti-Estrias",
    activeIngredients: ["Tretinoína", "Ácido Glicólico", "Vitamina E"],
    concentrations: "Tretinoína 0,05% + Ácido Glicólico 10% + Vitamina E 5%",
    indications: "Estrias recentes (vermelhas), prevenção",
    observations: "Uso noturno. Contraindicado na gravidez."
  },
  {
    category: "Estrias",
    name: "Centella para Estrias",
    activeIngredients: ["Centella Asiática", "Rosa Mosqueta", "Vitamina E"],
    concentrations: "Centella 10% + Rosa Mosqueta 20% + Vitamina E 3%",
    indications: "Estrias, cicatrizes, regeneração",
    observations: "Seguro na gravidez. Uso prolongado."
  },

  // CELULITE
  {
    category: "Celulite",
    name: "Gel Redutor de Celulite",
    activeIngredients: ["Cafeína", "Centella Asiática", "Retinol"],
    concentrations: "Cafeína 5% + Centella 3% + Retinol 0,3%",
    indications: "Celulite, gordura localizada, flacidez",
    observations: "Aplicar com massagem vigorosa 1-2x ao dia."
  },
  {
    category: "Celulite",
    name: "Liporedutor Avançado",
    activeIngredients: ["Cafeína", "Carnitina", "Nicotinamida"],
    concentrations: "Cafeína 5% + Carnitina 3% + Nicotinamida 5%",
    indications: "Celulite, gordura localizada",
    observations: "Efeito lipolítico. Uso com atividade física."
  },

  // FOTOPROTEÇÃO
  {
    category: "Fotoproteção",
    name: "Antioxidante Pré-Solar",
    activeIngredients: ["Vitamina C", "Vitamina E", "Ácido Ferúlico", "Resveratrol"],
    concentrations: "Vit C 15% + Vit E 1% + Ferúlico 0,5% + Resveratrol 1%",
    indications: "Proteção antioxidante, potencialização do FPS",
    observations: "Aplicar antes do protetor solar pela manhã."
  },
  {
    category: "Fotoproteção",
    name: "Pycnogenol Protetor",
    activeIngredients: ["Pycnogenol", "Ácido Ferúlico", "Vitamina E"],
    concentrations: "Pycnogenol 1% + Ferúlico 0,5% + Vitamina E 1%",
    indications: "Fotoproteção oral e tópica, antioxidante",
    observations: "Extrato de pinheiro marítimo francês."
  },

  // VITILIGO
  {
    category: "Vitiligo",
    name: "Estimulante de Repigmentação",
    activeIngredients: ["Tacrolimus", "Calcipotriol"],
    concentrations: "Tacrolimus 0,1% + Calcipotriol 0,005%",
    indications: "Vitiligo, estimulação de melanócitos",
    observations: "Uso sob orientação médica. Associar com fototerapia."
  },
  {
    category: "Vitiligo",
    name: "Psoraleno Tópico",
    activeIngredients: ["Metoxsaleno", "Bergapteno"],
    concentrations: "Metoxsaleno 0,1% + Bergapteno 0,05%",
    indications: "Vitiligo (uso com fototerapia UVA)",
    observations: "USO EXCLUSIVO COM SUPERVISÃO MÉDICA. Fotossensibilizante."
  },

  // QUELOIDES
  {
    category: "Queloides",
    name: "Gel de Silicone com Corticoide",
    activeIngredients: ["Silicone", "Triancinolona", "Vitamina E"],
    concentrations: "Silicone 10% + Triancinolona 0,1% + Vitamina E 5%",
    indications: "Queloides, cicatrizes hipertróficas",
    observations: "Aplicar 2x ao dia com massagem leve."
  },
  {
    category: "Queloides",
    name: "5-Fluorouracil Tópico",
    activeIngredients: ["5-Fluorouracil", "Triancinolona"],
    concentrations: "5-FU 5% + Triancinolona 0,1%",
    indications: "Queloides resistentes",
    observations: "Uso sob supervisão médica estrita."
  },

  // UNHAS
  {
    category: "Unhas",
    name: "Fortalecedor Ungueal",
    activeIngredients: ["Biotina", "Queratina Hidrolisada", "Pantenol"],
    concentrations: "Biotina 0,5% + Queratina 5% + Pantenol 3%",
    indications: "Unhas fracas, quebradiças, onicólise",
    observations: "Aplicar diariamente nas unhas e cutículas."
  },
  {
    category: "Unhas",
    name: "Antifúngico Ungueal",
    activeIngredients: ["Ciclopirox", "Ureia"],
    concentrations: "Ciclopirox 8% + Ureia 10%",
    indications: "Onicomicose, micose de unhas",
    observations: "Tratamento prolongado. 6-12 meses."
  },

  // PSORÍASE
  {
    category: "Psoríase",
    name: "Creme para Psoríase",
    activeIngredients: ["Calcipotriol", "Betametasona"],
    concentrations: "Calcipotriol 50mcg/g + Betametasona 0,5mg/g",
    indications: "Psoríase em placas",
    observations: "Aplicar 1x ao dia. Uso limitado no tempo."
  },
  {
    category: "Psoríase",
    name: "Coaltar Tópico",
    activeIngredients: ["Coaltar", "Ácido Salicílico"],
    concentrations: "Coaltar 5% + Ácido Salicílico 3%",
    indications: "Psoríase, dermatite seborreica",
    observations: "Odor característico. Uso noturno."
  },

  // DERMATITE ATÓPICA
  {
    category: "Dermatite",
    name: "Creme para Dermatite Atópica",
    activeIngredients: ["Tacrolimus", "Ceramidas", "Ácido Hialurônico"],
    concentrations: "Tacrolimus 0,1% + Ceramidas 2% + Ácido Hialurônico 1%",
    indications: "Dermatite atópica, eczema",
    observations: "Evitar exposição solar intensa durante uso."
  },
  {
    category: "Dermatite",
    name: "Pimecrolimus Creme",
    activeIngredients: ["Pimecrolimus", "Ceramidas"],
    concentrations: "Pimecrolimus 1% + Ceramidas 2%",
    indications: "Dermatite atópica leve a moderada",
    observations: "Imunomodulador tópico. Menos potente que tacrolimus."
  },

  // HERPES LABIAL
  {
    category: "Antiviral",
    name: "Creme Antiviral Herpes",
    activeIngredients: ["Aciclovir", "Alantoína"],
    concentrations: "Aciclovir 5% + Alantoína 1%",
    indications: "Herpes labial, herpes simples",
    observations: "Aplicar a cada 4h nos primeiros sintomas."
  },
  {
    category: "Antiviral",
    name: "Penciclovir Labial",
    activeIngredients: ["Penciclovir", "Vitamina E"],
    concentrations: "Penciclovir 1% + Vitamina E 1%",
    indications: "Herpes labial",
    observations: "Reduz duração e sintomas."
  },

  // VERRUGAS
  {
    category: "Queratolítico",
    name: "Ácido Salicílico Verruga",
    activeIngredients: ["Ácido Salicílico", "Ácido Lático"],
    concentrations: "Ácido Salicílico 17% + Ácido Lático 17%",
    indications: "Verrugas comuns, calos",
    observations: "Aplicação localizada. Uso prolongado."
  },
  {
    category: "Queratolítico",
    name: "Imiquimod",
    activeIngredients: ["Imiquimod"],
    concentrations: "Imiquimod 5%",
    indications: "Verrugas genitais, queratose actínica",
    observations: "Imunomodulador. Uso sob supervisão médica."
  },

  // MELASMA CORPORAL
  {
    category: "Despigmentantes",
    name: "Gel Clareador Axilas e Virilha",
    activeIngredients: ["Ácido Kójico", "Ácido Glicólico", "Arbutin"],
    concentrations: "Kójico 4% + Glicólico 10% + Arbutin 3%",
    indications: "Hiperpigmentação axilar, virilha, joelhos",
    observations: "Evitar após depilação. Aguardar 24h."
  },

  // ANGIOMAS
  {
    category: "Vascular",
    name: "Timolol Tópico",
    activeIngredients: ["Timolol", "Glicerina"],
    concentrations: "Timolol 0,5% + Glicerina 5%",
    indications: "Hemangiomas infantis superficiais",
    observations: "Uso pediátrico. Sob supervisão médica."
  },

  // PRURIDO
  {
    category: "Antipruriginoso",
    name: "Creme Antipruriginoso",
    activeIngredients: ["Mentol", "Cânfora", "Calamina"],
    concentrations: "Mentol 1% + Cânfora 1% + Calamina 8%",
    indications: "Coceira, urticária, picadas",
    observations: "Alívio imediato. Uso conforme necessário."
  },
  {
    category: "Antipruriginoso",
    name: "Polidocanol Creme",
    activeIngredients: ["Polidocanol", "Ureia"],
    concentrations: "Polidocanol 5% + Ureia 5%",
    indications: "Prurido crônico, pele seca",
    observations: "Anestésico local suave."
  },

  // ÁREA ÍNTIMA
  {
    category: "Área Íntima",
    name: "Clareador Íntimo",
    activeIngredients: ["Ácido Kójico", "Niacinamida", "Alfa Arbutin"],
    concentrations: "Kójico 2% + Niacinamida 4% + Alfa Arbutin 2%",
    indications: "Hiperpigmentação genital, axilar",
    observations: "Uso externo. Evitar mucosas."
  },
  {
    category: "Área Íntima",
    name: "Hidratante Vaginal",
    activeIngredients: ["Ácido Hialurônico", "Vitamina E", "Centella"],
    concentrations: "Ácido Hialurônico 1% + Vitamina E 1% + Centella 2%",
    indications: "Ressecamento vaginal, pós-menopausa",
    observations: "Uso intravaginal. Aplicador incluso."
  },

  // MANCHAS SENIS
  {
    category: "Despigmentantes",
    name: "Retinol Clareador Intensivo",
    activeIngredients: ["Retinol", "Ácido Kójico", "Niacinamida"],
    concentrations: "Retinol 0,5% + Kójico 2% + Niacinamida 4%",
    indications: "Manchas senis, lentigos solares",
    observations: "Uso noturno. Fotoproteção obrigatória."
  }
];

export default function NeoFormulas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const categories = ["Todas", ...new Set(formulasDatabase.map(f => f.category))];

  const filteredFormulas = formulasDatabase.filter(formula => {
    const matchesSearch = 
      formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.activeIngredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
      formula.indications.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "Todas" || formula.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <PageBlockChecker pageName="NeoFormulas">
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
          <FlaskConical className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Fórmulas Neo</h1>
          <p className="text-slate-600 text-sm md:text-lg">Compêndio de fórmulas magistrais dermatológicas</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Pesquisar por fórmula, princípio ativo ou indicação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base sm:text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === category 
                      ? 'bg-teal-500 hover:bg-teal-600' 
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          {filteredFormulas.length} {filteredFormulas.length === 1 ? 'fórmula encontrada' : 'fórmulas encontradas'}
        </p>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredFormulas.length > 0 ? (
          filteredFormulas.map((formula, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl text-slate-900 mb-2">{formula.name}</CardTitle>
                    <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                      {formula.category}
                    </Badge>
                  </div>
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <Pill className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Princípios Ativos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {formula.activeIngredients.map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Concentrações:</h4>
                  <p className="text-sm text-slate-600">{formula.concentrations}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Indicações:</h4>
                  <p className="text-sm text-slate-600">{formula.indications}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">
                    <strong>⚠️ Obs:</strong> {formula.observations}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full text-center py-12">
            <CardContent>
              <FlaskConical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma fórmula encontrada</h3>
              <p className="text-sm text-gray-500 mt-2">
                Tente ajustar os filtros ou termos de pesquisa.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disclaimer */}
      <Card className="mt-8 bg-amber-50 border-amber-200">
        <CardContent className="p-4 sm:p-6">
          <p className="text-sm text-amber-900">
            <strong>⚠️ Aviso Importante:</strong> Todas as fórmulas apresentadas são sugestões baseadas em literatura científica e prática clínica. 
            A prescrição magistral deve sempre ser individualizada e realizada por profissional habilitado, 
            considerando as necessidades específicas de cada paciente, contraindicações e interações medicamentosas.
          </p>
        </CardContent>
      </Card>
    </div>
    </PageBlockChecker>
  );
}