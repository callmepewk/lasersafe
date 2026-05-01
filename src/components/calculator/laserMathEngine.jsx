import { normalizeTargetType } from "./targetNormalization";

const OPTICAL_PROPERTIES = {
  melanina_epidermica: { mu_a: 1.2, mu_s: 18, g: 0.82, chromophore_selectivity: 0.9, target_diameter_mm: 0.08, rho: 1.02, c: 3.6, k: 0.42 },
  melanina_dermica: { mu_a: 0.9, mu_s: 16, g: 0.84, chromophore_selectivity: 0.82, target_diameter_mm: 0.12, rho: 1.03, c: 3.7, k: 0.45 },
  pigmento_tatuagem: { mu_a: 1.4, mu_s: 14, g: 0.8, chromophore_selectivity: 0.92, target_diameter_mm: 0.06, rho: 1.05, c: 3.4, k: 0.38 },
  hemoglobina_oxigenada: { mu_a: 1.1, mu_s: 12, g: 0.9, chromophore_selectivity: 0.88, target_diameter_mm: 0.1, rho: 1.05, c: 3.8, k: 0.5 },
  hemoglobina_desoxigenada: { mu_a: 0.95, mu_s: 12, g: 0.9, chromophore_selectivity: 0.85, target_diameter_mm: 0.12, rho: 1.05, c: 3.8, k: 0.5 },
  vasos_superficiais: { mu_a: 1, mu_s: 11, g: 0.9, chromophore_selectivity: 0.84, target_diameter_mm: 0.15, rho: 1.05, c: 3.8, k: 0.5 },
  vasos_profundos: { mu_a: 0.8, mu_s: 10, g: 0.91, chromophore_selectivity: 0.78, target_diameter_mm: 0.3, rho: 1.05, c: 3.8, k: 0.52 },
  colageno_profundo: { mu_a: 0.65, mu_s: 9, g: 0.92, chromophore_selectivity: 0.74, target_diameter_mm: 0.5, rho: 1.08, c: 3.9, k: 0.56 },
  agua_epidermica: { mu_a: 1.35, mu_s: 8, g: 0.93, chromophore_selectivity: 0.87, target_diameter_mm: 0.05, rho: 1, c: 4.1, k: 0.58 },
  agua_dermica: { mu_a: 1.1, mu_s: 8, g: 0.93, chromophore_selectivity: 0.83, target_diameter_mm: 0.15, rho: 1.02, c: 4, k: 0.58 },
  foliculo_piloso: { mu_a: 0.88, mu_s: 13, g: 0.87, chromophore_selectivity: 0.86, target_diameter_mm: 0.25, rho: 1.04, c: 3.7, k: 0.47 },
  tecido_cicatricial: { mu_a: 0.72, mu_s: 11, g: 0.88, chromophore_selectivity: 0.7, target_diameter_mm: 0.4, rho: 1.07, c: 3.8, k: 0.49 },
  default: { mu_a: 0.8, mu_s: 10, g: 0.88, chromophore_selectivity: 0.75, target_diameter_mm: 0.2, rho: 1.05, c: 3.8, k: 0.5 }
};

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

function getPhototypeMelaninFactor(phototype) {
  const map = { I: 0.1, II: 0.14, III: 0.2, IV: 0.26, V: 0.33, VI: 0.4 };
  return map[phototype] || 0.2;
}

function getAreaFactor(region) {
  const value = String(region || '').toLowerCase();
  if (value.includes('face') || value.includes('rosto')) return 0.94;
  if (value.includes('pesco') || value.includes('axila') || value.includes('íntim') || value.includes('intim')) return 0.92;
  if (value.includes('perna') || value.includes('coxa') || value.includes('abd')) return 1.04;
  return 1;
}

function getDeviceFactor(deviceInfo) {
  const text = `${deviceInfo?.type || ''} ${deviceInfo?.model || ''} ${deviceInfo?.description || ''}`.toLowerCase();
  if (/fraction|fracionad|scanner|microlens/.test(text)) return 0.93;
  if (/nd:yag|1064/.test(text)) return 1.02;
  if (/pico|q-switched/.test(text)) return 0.9;
  return 1;
}

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

function calculateOpticalThermalModel(data, targetProfile, fluence, pulseDuration, spotSize, frequency) {
  const properties = OPTICAL_PROPERTIES[targetProfile] || OPTICAL_PROPERTIES.default;
  const mu_s_prime = properties.mu_s * (1 - properties.g);
  const mu_eff = Math.sqrt(3 * properties.mu_a * (properties.mu_a + mu_s_prime));
  const penetration_depth_cm = 1 / mu_eff;
  const penetration_depth_mm = penetration_depth_cm * 10;
  const target_depth_mm = Math.max(0.2, Math.min(penetration_depth_mm, Number(data.depth_level || 3) * 0.4));
  const target_depth_cm = target_depth_mm / 10;
  const absorbed_energy_density = fluence * Math.exp(-mu_eff * target_depth_cm);
  const delta_temperature = absorbed_energy_density / (properties.rho * properties.c);
  const thermal_diffusivity = properties.k / (properties.rho * properties.c);
  const target_diameter_cm = properties.target_diameter_mm / 10;
  const thermal_relaxation_time = (target_diameter_cm ** 2) / (16 * thermal_diffusivity);
  const pulse_duration_s = Math.max(Number(pulseDuration || 1) / 1000, 0.000001);
  const pulse_trt_ratio = pulse_duration_s / thermal_relaxation_time;
  const pulse_selectivity = pulse_duration_s < thermal_relaxation_time ? 'seletivo' : 'difusivo';
  const pulse_interval_s = frequency > 0 ? 1 / frequency : 1;
  const number_of_pulses = Math.max(1, Math.round(frequency * Math.max(pulse_duration_s, 1)));
  const thermal_accumulation = Array.from({ length: number_of_pulses }).reduce((sum, _, index) => {
    const decay = Math.exp(-(index * pulse_interval_s) / thermal_relaxation_time);
    return sum + (delta_temperature * decay);
  }, 0);
  const spot_radius_cm = (spotSize / 10) / 2;
  const spot_area_cm2 = Math.PI * (spot_radius_cm ** 2);
  const gaussian_beam_peak_intensity = fluence / Math.max(spot_area_cm2, 0.0001);
  const overlap = data.scan_area && data.scan_area !== 'custom'
    ? Math.max(0, Math.min(0.95, 1 - ((spotSize / 10) / Math.max((spotSize / 10) * 0.9, 0.01))))
    : 0.1;
  const total_energy_delivered = fluence * spot_area_cm2 * number_of_pulses;
  const arrheniusA = 3.1e98;
  const arrheniusEa = 6.3e5;
  const gasConstant = 8.314;
  const absoluteTempK = 310.15 + delta_temperature;
  const arrhenius_damage = arrheniusA * pulse_duration_s * Math.exp(-arrheniusEa / (gasConstant * absoluteTempK));
  const chromophore_selectivity = properties.chromophore_selectivity;
  const probability_input = thermal_accumulation + arrhenius_damage + pulse_trt_ratio + (1 - chromophore_selectivity);

  return {
    optical_properties: {
      mu_a: properties.mu_a,
      mu_s: properties.mu_s,
      g: properties.g,
      mu_s_prime: Number(mu_s_prime.toFixed(4)),
      mu_eff: Number(mu_eff.toFixed(4))
    },
    penetration_depth_mm: Number(penetration_depth_mm.toFixed(2)),
    absorbed_energy_density: Number(absorbed_energy_density.toFixed(3)),
    delta_temperature_c: Number(delta_temperature.toFixed(2)),
    thermal_diffusivity: Number(thermal_diffusivity.toFixed(5)),
    thermal_relaxation_time_s: Number(thermal_relaxation_time.toFixed(4)),
    pulse_trt_ratio: Number(pulse_trt_ratio.toFixed(4)),
    pulse_selectivity,
    thermal_accumulation_c: Number(thermal_accumulation.toFixed(2)),
    arrhenius_damage: Number(arrhenius_damage.toExponential(3)),
    chromophore_selectivity: Number(chromophore_selectivity.toFixed(3)),
    total_energy_delivered_j: Number(total_energy_delivered.toFixed(3)),
    overlap_ratio: Number(overlap.toFixed(3)),
    gaussian_beam_peak_intensity: Number(gaussian_beam_peak_intensity.toFixed(3)),
    probability_input: Number(probability_input.toFixed(4))
  };
}

export function predictInjuryRisk(data, baseResults, opticalModel = null) {
  const optical = opticalModel || {};
  const w1 = 0.35;
  const w2 = 0.25;
  const w3 = 0.2;
  const w4 = 0.2;
  const omega = Math.min(Number(optical.arrhenius_damage || 0), 5);
  const totalTemp = Math.min(Number(optical.thermal_accumulation_c || 0) / 100, 5);
  const pulseRatio = Math.min(Number(optical.pulse_trt_ratio || 0), 5);
  const inverseSelectivity = 1 - Number(optical.chromophore_selectivity || 0.75);
  const rawRisk = (w1 * omega) + (w2 * totalTemp) + (w3 * pulseRatio) + (w4 * inverseSelectivity);
  const normalizedScore = Math.max(0, Math.min(100, (rawRisk / 5) * 100));
  const logisticProbability = 1 / (1 + Math.exp(-0.12 * (normalizedScore - 45)));

  let level = 'baixo';
  if (normalizedScore >= 65) level = 'alto';
  else if (normalizedScore >= 35) level = 'moderado';

  let tissueResponse = 'sem efeito';
  if (omega >= 1) tissueResponse = 'dano térmico';
  else if (omega >= 0.1) tissueResponse = 'terapêutico';

  return {
    level,
    score: Number(normalizedScore.toFixed(1)),
    probability: Number((logisticProbability * 100).toFixed(1)),
    tissue_response: tissueResponse,
    components: {
      omega: Number(omega.toFixed(4)),
      thermal_load: Number(totalTemp.toFixed(4)),
      pulse_ratio: Number(pulseRatio.toFixed(4)),
      inverse_selectivity: Number(inverseSelectivity.toFixed(4))
    }
  };
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