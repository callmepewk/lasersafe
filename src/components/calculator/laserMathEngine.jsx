import { normalizeTargetType } from "./targetNormalization";

const TARGET_BASE_MAP = {
  melanina_epidermica: { key_parameter: "Fluência", base_fluence: 20, base_pulse: 3 },
  melanina_dermica: { key_parameter: "Fluência", base_fluence: 16, base_pulse: 6 },
  pigmento_tatuagem: { key_parameter: "Fluência", base_fluence: 14, base_pulse: 2 },
  melanossomas: { key_parameter: "Fluência", base_fluence: 18, base_pulse: 4 },
  hemoglobina_oxigenada: { key_parameter: "Duração de Pulso", base_fluence: 15, base_pulse: 10 },
  hemoglobina_desoxigenada: { key_parameter: "Duração de Pulso", base_fluence: 16, base_pulse: 12 },
  vasos_superficiais: { key_parameter: "Duração de Pulso", base_fluence: 15, base_pulse: 8 },
  vasos_profundos: { key_parameter: "Duração de Pulso", base_fluence: 18, base_pulse: 14 },
  microvasculatura: { key_parameter: "Duração de Pulso", base_fluence: 14, base_pulse: 6 },
  colageno_superficial: { key_parameter: "Profundidade", base_fluence: 18, base_pulse: 8 },
  colageno_profundo: { key_parameter: "Profundidade", base_fluence: 25, base_pulse: 15 },
  agua_epidermica: { key_parameter: "Ablação", base_fluence: 12, base_pulse: 1 },
  agua_dermica: { key_parameter: "Ablação", base_fluence: 20, base_pulse: 4 },
  foliculo_piloso: { key_parameter: "Fluência", base_fluence: 22, base_pulse: 12 },
  glandula_sebacea: { key_parameter: "Profundidade", base_fluence: 14, base_pulse: 10 },
  tecido_cicatricial: { key_parameter: "Remodelação", base_fluence: 22, base_pulse: 12 },
  fibrose: { key_parameter: "Remodelação", base_fluence: 24, base_pulse: 14 },
  lesoes_acneicas: { key_parameter: "Profundidade", base_fluence: 13, base_pulse: 8 },
  smas: { key_parameter: "Profundidade", base_fluence: 28, base_pulse: 18 },
  default: { key_parameter: "Fluência", base_fluence: 18, base_pulse: 5 }
};

function getModelCorrectionFactor(data) {
  const normalizedTarget = normalizeTargetType(data.target_type);
  let factor = 1;

  if (["V", "VI"].includes(data.phototype)) factor *= 0.92;
  if (data.skin_sensitivity === "muito_sensível") factor *= 0.9;
  if (data.skin_sensitivity === "resistente") factor *= 1.05;
  if (data.aggressiveness_level === "conservador") factor *= 0.94;
  if (data.aggressiveness_level === "agressivo") factor *= 1.08;
  if (["vasos_profundos", "colageno_profundo", "smas", "fibrose"].includes(normalizedTarget)) factor *= 1.06;
  if (["agua_epidermica", "melanina_epidermica", "vasos_superficiais"].includes(normalizedTarget)) factor *= 0.97;

  return Number(factor.toFixed(3));
}

export function predictInjuryRisk(data, baseResults) {
  let score = 0;

  if (["I", "II"].includes(data.phototype)) score += 2;
  if (["V", "VI"].includes(data.phototype)) score += 1;
  if (data.skin_sensitivity === "muito_sensível") score += 2;
  if (data.aggressiveness_level === "agressivo") score += 2;
  if (Number(baseResults.cooling_intensity || 0) <= 2) score += 1;
  if (Number(baseResults.fluence || 0) >= 25) score += 1;
  if (Number(baseResults.pulse_duration || 0) <= 3) score += 1;

  if (score >= 6) return { level: "alto", score };
  if (score >= 3) return { level: "moderado", score };
  return { level: "baixo", score };
}

export function calculateLaserParametersWithModel(data) {
  const normalizedTargetType = normalizeTargetType(data.target_type);
  const targetProfile = TARGET_BASE_MAP[normalizedTargetType] || TARGET_BASE_MAP.default;

  const safetyFactors = {
    I: 0.6, II: 0.7, III: 0.8, IV: 0.9, V: 1.0, VI: 1.1
  };
  const safety_factor = safetyFactors[data.phototype] || 0.8;

  const intensityModulators = {
    conservador: 0.8,
    moderado: 1.0,
    agressivo: 1.2
  };
  const intensity_modulator = intensityModulators[data.aggressiveness_level] || 1.0;
  const model_correction_factor = getModelCorrectionFactor({ ...data, target_type: normalizedTargetType });

  const adjusted_fluence = targetProfile.base_fluence * model_correction_factor;
  const adjusted_pulse = targetProfile.base_pulse * model_correction_factor;

  const fluence_num = Math.round((adjusted_fluence * intensity_modulator) / safety_factor);
  const pulse_duration_num = Math.round((adjusted_pulse * intensity_modulator) / safety_factor);
  const spot_size_num = data.phototype === 'I' || data.phototype === 'II' ? 8 : 10;
  const frequency_num = data.skin_sensitivity === 'muito_sensível' ? 1 : 2;

  const result = {
    normalized_target_type: normalizedTargetType,
    safety_factor,
    intensity_modulator,
    model_correction_factor,
    key_parameter: targetProfile.key_parameter,
    fluence: String(fluence_num),
    pulse_duration: String(pulse_duration_num),
    spot_size: String(spot_size_num),
    frequency: String(frequency_num),
    cooling_intensity: data.cooling_intensity
  };

  return {
    ...result,
    injury_risk: predictInjuryRisk(data, result)
  };
}