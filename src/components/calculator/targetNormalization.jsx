export const TARGET_TYPE_ALIASES = {
  melanina_epidermica: "melanina_epidermica",
  "melanina_epidérmica": "melanina_epidermica",
  melanina_superficial: "melanina_epidermica",
  pigmento_superficial: "melanina_epidermica",
  vascular: "vasos_superficiais",
  vasos: "vasos_superficiais",
  vaso: "vasos_superficiais",
  vasos_superficiais: "vasos_superficiais",
  vasos_profundos: "vasos_profundos",
  hemoglobina: "hemoglobina_oxigenada",
  hemoglobina_oxigenada: "hemoglobina_oxigenada",
  hemoglobina_desoxigenada: "hemoglobina_desoxigenada",
  colageno_profundo: "colageno_profundo",
  colágeno_profundo: "colageno_profundo",
  colageno_superficial: "colageno_superficial",
  colágeno_superficial: "colageno_superficial",
  agua_epidermica: "agua_epidermica",
  "água_epidérmica": "agua_epidermica",
  agua_dermica: "agua_dermica",
  "água_dérmica": "agua_dermica",
  foliculo_piloso: "foliculo_piloso",
  "folículo_piloso": "foliculo_piloso",
  tecido_cicatricial: "tecido_cicatricial"
};

export function normalizeTargetType(input) {
  if (!input) return "";
  const normalized = String(input)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  return TARGET_TYPE_ALIASES[normalized] || normalized;
}