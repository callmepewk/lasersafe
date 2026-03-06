import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ===== Helpers =====
const aliasManufacturer = (name) => {
  const n = (name || '').trim();
  const map = {
    'Alma': 'Alma Lasers',
    'Quanta': 'Quanta System',
    'HTM': 'HTM Eletrônica',
    'Solta': 'Solta Medical',
    'Venus': 'Venus Concept',
    'Vydence': 'Vydence Medical',
  };
  return map[n] || n;
};

const desiredCountries = {
  'Candela': 'EUA',
  'Cynosure': 'EUA',
  'Lumenis': 'Israel',
  'Alma Lasers': 'Israel',
  'Fotona': 'Eslovênia',
  'Cutera': 'EUA',
  'Lutronic': 'Coreia do Sul',
  'Sciton': 'EUA',
  'Quanta System': 'Itália',
  'Asclepion Laser Technologies': 'Alemanha',
  'DEKA': 'Itália',
  'Solta Medical': 'EUA',
  'Aerolase': 'EUA',
  'InMode': 'Israel',
  'Venus Concept': 'Canadá',
  'Vydence Medical': 'Brasil',
  'Industra Technologies': 'Brasil',
  'MMOptics': 'Brasil',
  'Ibramed': 'Brasil',
  'HTM Eletrônica': 'Brasil'
};

const TYPE_ALIASES = [
  'Alexandrite 755nm', 'Nd:YAG 1064nm', 'Nd:YAG Q-Switched', 'Nd:YAG fracionado',
  'Pulsed Dye Laser (PDL)', 'IPL (Luz Intensa Pulsada)', 'BroadBand Light', 'CO2 Fracionado', 'CO2',
  'Er:YAG', 'Er:YAG fracionado', 'Er:Glass', 'Picolaser', 'KTP + Nd:YAG', 'RF', 'RF fracionado',
  'Multiplataforma', 'Laser fracionado', 'Laser híbrido', 'IPL + Laser', 'IPL + Nd:YAG',
  'CO2 + 1570nm', '1550 + 1927', 'Laser terapêutico', 'Laser estético', 'Ultrassom + energia'
];

function mapTokenToTypeName(raw) {
  const t = (raw || '').toLowerCase().trim();
  if (!t) return null;
  if (t === 'diodo') return 'Diodo 800–810nm';
  if (t === 'co2') return 'CO2 Fracionado';
  if (t === 'pico') return 'Picolaser';
  if (t === 'ipl') return 'IPL (Luz Intensa Pulsada)';
  if (t === 'q-switched') return 'Nd:YAG Q-Switched';
  if (t.includes('pico alexandrite')) return 'Picolaser';
  if (t.includes('alexandrite')) return 'Alexandrite 755nm';
  if (t.includes('q-sw')) return 'Nd:YAG Q-Switched';
  if (t.includes('nd:yag') && t.includes('fracion')) return 'Nd:YAG fracionado';
  if (t.includes('nd:yag') && t.includes('ipl')) return 'IPL + Nd:YAG';
  if (t.includes('nd:yag')) return 'Nd:YAG 1064nm';
  if (t.includes('pdl') || t.includes('pulsed dye')) return 'Pulsed Dye Laser (PDL)';
  if (t.includes('bbl')) return 'BroadBand Light';
  if (t.includes('ipl') && t.includes('laser')) return 'IPL + Laser';
  if (t.includes('ipl')) return 'IPL (Luz Intensa Pulsada)';
  if (t.includes('co2') && t.includes('1570')) return 'CO2 + 1570nm';
  if (t.includes('co2')) return 'CO2 Fracionado';
  if (t.includes('er:yag') && t.includes('fracion')) return 'Er:YAG fracionado';
  if (t.includes('er:yag')) return 'Er:YAG';
  if (t.includes('er:glass')) return 'Er:Glass';
  if (t.includes('pico')) return 'Picolaser';
  if (t.includes('ktp')) return 'KTP + Nd:YAG';
  if (t.includes('rf') && t.includes('fracion')) return 'RF fracionado';
  if (t.includes('rf')) return 'RF';
  if (t.includes('híbrido') || t.includes('hibrid')) return 'Laser híbrido';
  if (t.includes('multiplata')) return 'Multiplataforma';
  if (t.includes('terap')) return 'Laser terapêutico';
  if (t.includes('estét')) return 'Laser estético';
  if (t.includes('ultrassom')) return 'Ultrassom + energia';
  if (t.includes('fracion')) return 'Laser fracionado';
  return null;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Dataset: [manufacturer, country, model, technology]
const DATASET = [
  ['Candela','EUA','GentleMax Pro','Alexandrite + Nd:YAG'],
  ['Candela','EUA','GentleMax Pro Plus','Alexandrite + Nd:YAG'],
  ['Candela','EUA','GentleLase Pro','Alexandrite'],
  ['Candela','EUA','GentleYAG Pro','Nd:YAG'],
  ['Candela','EUA','VBeam Perfecta','Pulsed Dye Laser'],
  ['Candela','EUA','VBeam Prima','Pulsed Dye Laser'],
  ['Candela','EUA','Nordlys','IPL + Laser'],
  ['Candela','EUA','Mini GentleYAG','Nd:YAG'],
  ['Cynosure','EUA','Elite+','Alexandrite + Nd:YAG'],
  ['Cynosure','EUA','Elite IQ','Alexandrite + Nd:YAG'],
  ['Cynosure','EUA','Apogee Elite','Alexandrite'],
  ['Cynosure','EUA','Apogee Elite Plus','Alexandrite'],
  ['Cynosure','EUA','PicoSure','Pico Alexandrite'],
  ['Cynosure','EUA','PicoSure Pro','Pico Alexandrite'],
  ['Cynosure','EUA','RevLite SI','Q-switched Nd:YAG'],
  ['Cynosure','EUA','MedLite C6','Q-switched Nd:YAG'],
  ['Cynosure','EUA','Icon','IPL + Laser'],
  ['Cynosure','EUA','Accolade','Alexandrite'],
  ['Lumenis','Israel','M22','IPL + Nd:YAG'],
  ['Lumenis','Israel','Stellar M22','IPL + Nd:YAG'],
  ['Lumenis','Israel','LightSheer ET','Diodo'],
  ['Lumenis','Israel','LightSheer Duet','Diodo'],
  ['Lumenis','Israel','LightSheer Desire','Diodo'],
  ['Lumenis','Israel','Splendor X','Alexandrite + Nd:YAG'],
  ['Lumenis','Israel','UltraPulse','CO2'],
  ['Lumenis','Israel','AcuPulse','CO2'],
  ['Lumenis','Israel','ResurFX','Laser fracionado'],
  ['Alma','Israel','Soprano ICE','Diodo'],
  ['Alma','Israel','Soprano ICE Platinum','Diodo'],
  ['Alma','Israel','Soprano Titanium','Diodo'],
  ['Alma','Israel','Harmony XL','Multiplataforma'],
  ['Alma','Israel','Harmony XL Pro','Multiplataforma'],
  ['Alma','Israel','ClearLift','Nd:YAG fracionado'],
  ['Alma','Israel','Pixel CO2','CO2 fracionado'],
  ['Alma','Israel','Alma Hybrid','CO2 + 1570nm'],
  ['Fotona','Eslovênia','SP Dynamis','Nd:YAG + Er:YAG'],
  ['Fotona','Eslovênia','SP Spectro','Nd:YAG + Er:YAG'],
  ['Fotona','Eslovênia','StarWalker','Q-switched'],
  ['Fotona','Eslovênia','StarWalker MaQX','Pico'],
  ['Fotona','Eslovênia','TimeWalker Fotona4D','Er:YAG'],
  ['Fotona','Eslovênia','LightWalker','Er:YAG'],
  ['Cutera','EUA','Excel V','KTP + Nd:YAG'],
  ['Cutera','EUA','Excel HR','Laser depilação'],
  ['Cutera','EUA','Xeo','Multiplataforma'],
  ['Cutera','EUA','Enlighten','Pico'],
  ['Cutera','EUA','GenesisPlus','Nd:YAG'],
  ['Lutronic','Coreia do Sul','Clarity','Alexandrite + Nd:YAG'],
  ['Lutronic','Coreia do Sul','Clarity II','Alexandrite + Nd:YAG'],
  ['Lutronic','Coreia do Sul','Spectra XT','Q-switched'],
  ['Lutronic','Coreia do Sul','Spectra VRM IV','Q-switched'],
  ['Lutronic','Coreia do Sul','Spectra G2','Q-switched'],
  ['Sciton','EUA','Joule','Multiplataforma'],
  ['Sciton','EUA','BBL','BroadBand Light'],
  ['Sciton','EUA','BBL HERO','BroadBand Light'],
  ['Sciton','EUA','Halo','Laser híbrido'],
  ['Sciton','EUA','ProFractional','Er:YAG fracionado'],
  ['Sciton','EUA','Contour TRL','Er:YAG'],
  ['Quanta','Itália','Discovery Pico','Pico'],
  ['Quanta','Itália','Discovery PICO Plus','Pico'],
  ['Quanta','Itália','Thunder MT','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Thunder MT Pro','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Duetto MT EVO','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Chrome','Nd:YAG + Alexandrite'],
  ['Asclepion','Alemanha','MeDioStar NeXT','Diodo'],
  ['Asclepion','Alemanha','MeDioStar Monolith','Diodo'],
  ['Asclepion','Alemanha','Dermablate','Er:YAG'],
  ['Asclepion','Alemanha','QuadroStar PRO','Nd:YAG'],
  ['DEKA','Itália','SmartXide DOT','CO2 fracionado'],
  ['DEKA','Itália','SmartXide Punto','CO2'],
  ['DEKA','Itália','Motus AX','Alexandrite'],
  ['DEKA','Itália','Motus AY','Nd:YAG'],
  ['DEKA','Itália','Synchro REPLA:Y','Er:YAG'],
  ['Solta','EUA','Fraxel Restore','Er:Glass'],
  ['Solta','EUA','Fraxel Dual','1550 + 1927'],
  ['Solta','EUA','Thermage CPT','RF'],
  ['Solta','EUA','Thermage FLX','RF'],
  ['Solta','EUA','Clear + Brilliant','Laser fracionado'],
  ['Aerolase','EUA','Neo Elite','Nd:YAG'],
  ['Aerolase','EUA','Neo Elite Pro','Nd:YAG'],
  ['Aerolase','EUA','Era Elite','Er:YAG'],
  ['InMode','Israel','Lumecca','IPL'],
  ['InMode','Israel','DiolazeXL','Diodo'],
  ['InMode','Israel','Optimas','Multiplataforma'],
  ['InMode','Israel','Morpheus8','RF fracionado'],
  ['Venus','Canadá','Venus Versa','Multiplataforma'],
  ['Venus','Canadá','Venus Velocity','Diodo'],
  ['Venus','Canadá','Venus Viva','RF fracionado'],
  ['Vydence','Brasil','Etherea MX','Multiplataforma'],
  ['Vydence','Brasil','Etherea Smart','Multiplataforma'],
  ['Vydence','Brasil','Etherea Hybrid','Multiplataforma'],
  ['MMOptics','Brasil','Recover','Laser terapêutico'],
  ['MMOptics','Brasil','SmartLaser','Laser terapêutico'],
  ['MMOptics','Brasil','Laser Duo','Laser terapêutico'],
  ['Ibramed','Brasil','Polarys','Laser estético'],
  ['Ibramed','Brasil','Laserpulse','Laser terapêutico'],
  ['Ibramed','Brasil','Heccus Turbo','Ultrassom + energia'],
  ['HTM','Brasil','LaserPulse','Laser terapêutico'],
  ['HTM','Brasil','HTM SmartLaser','Laser terapêutico'],
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let payload = {};
    try { payload = await req.json(); } catch (_) {}
    const setup = !!payload.setup;
    const start = Number.isInteger(payload.start) ? payload.start : 0;
    const end = Number.isInteger(payload.end) ? payload.end : DATASET.length;
    const slice = DATASET.slice(Math.max(0, start), Math.min(end, DATASET.length));

    // ===== Ensure Manufacturers =====
    let mans = await base44.asServiceRole.entities.Manufacturer.list();
    const manByName = new Map(mans.map(m => [m.name, m]));

    const desiredManRows = slice.map(([rawMan, rawCountry]) => [aliasManufacturer(rawMan), rawCountry]);
    // when setup mode, include all
    const allDesiredRows = setup ? DATASET.map(([rm, rc]) => [aliasManufacturer(rm), rc]) : desiredManRows;

    const uniqueMans = Array.from(new Map(allDesiredRows.map(([n,c]) => [n, c || desiredCountries[n] || null])).entries());

    const mansToCreate = uniqueMans
      .filter(([name]) => !manByName.has(name))
      .map(([name, country]) => ({ name, country: country || desiredCountries[name] || 'Internacional', verified_sbd: false, verified_anvisa: false }));

    for (const part of chunk(mansToCreate, 40)) { if (part.length) await base44.asServiceRole.entities.Manufacturer.bulkCreate(part); }
    mans = await base44.asServiceRole.entities.Manufacturer.list();

    const currentByName = new Map(mans.map(m => [m.name, m]));
    const updates = [];
    for (const [name, country] of uniqueMans) {
      const desired = country || desiredCountries[name] || null;
      const cur = currentByName.get(name);
      if (cur && desired && cur.country !== desired) updates.push({ id: cur.id, data: { country: desired } });
    }
    for (const part of chunk(updates, 40)) { await Promise.all(part.map(u => base44.asServiceRole.entities.Manufacturer.update(u.id, u.data))); }

    // ===== Ensure Laser Types =====
    let types = await base44.asServiceRole.entities.LaserType.list();
    const typeByName = new Map(types.map(t => [t.name, t]));

    const neededFromData = new Set();
    (setup ? DATASET : slice).forEach(([, , , techStr]) => {
      const tokens = (techStr || '').split('+').map(s => s.trim());
      tokens.forEach(tok => {
        const mapped = mapTokenToTypeName(tok) || tok;
        if (mapped) neededFromData.add(mapped);
      });
    });
    TYPE_ALIASES.forEach(t => neededFromData.add(t));

    const typesToCreate = Array.from(neededFromData)
      .filter(n => !typeByName.has(n))
      .map(n => ({ name: n, wavelength: n.match(/\d+\s*nm/i)?.[0] || '', applications: [] }));

    for (const part of chunk(typesToCreate, 80)) { if (part.length) await base44.asServiceRole.entities.LaserType.bulkCreate(part); }
    types = await base44.asServiceRole.entities.LaserType.list();
    const typeNameToId = new Map(types.map(t => [t.name, t.id]));

    if (setup) {
      return Response.json({ status: 'ok', message: 'Setup concluído (fabricantes e tipos assegurados)', manufacturers_created: mansToCreate.length, types_created: typesToCreate.length, totalDataset: DATASET.length });
    }

    // ===== Equipments upsert for slice =====
    const manNameToId = new Map((await base44.asServiceRole.entities.Manufacturer.list()).map(m => [m.name, m.id]));

    const allEquip = await base44.asServiceRole.entities.Equipment.list();
    const eqKey = (manufacturer_id, model) => `${manufacturer_id}__${(model || '').toLowerCase()}`;
    const existingEqKeys = new Set((allEquip || []).map(e => eqKey(e.manufacturer_id, e.model)));

    const eqToCreate = [];
    for (const [rawMan, rawCountry, model, techStr] of slice) {
      const manName = aliasManufacturer(rawMan);
      const manId = manNameToId.get(manName);
      if (!manId || !model) continue;
      const key = eqKey(manId, model);
      if (!existingEqKeys.has(key)) {
        eqToCreate.push({
          manufacturer_id: manId,
          model,
          laser_type_id: '',
          registro_anvisa: '',
          status_regulatorio: 'verificar',
          risco_regulatorio: (techStr || '').toLowerCase().includes('ipl') ? 'medio' : 'baixo'
        });
        existingEqKeys.add(key);
      }
    }
    for (const part of chunk(eqToCreate, 80)) { if (part.length) await base44.asServiceRole.entities.Equipment.bulkCreate(part); }

    // Refresh equipments map
    const equipments = await base44.asServiceRole.entities.Equipment.list();
    const eqByKey = new Map(equipments.map(e => [eqKey(e.manufacturer_id, e.model), e]));

    // ===== EquipmentType links for slice =====
    const existingLinks = await base44.asServiceRole.entities.EquipmentType.list();
    const existingLinkSet = new Set((existingLinks || []).map(l => `${l.equipment_id}__${l.laser_type_id}`));

    const linksToCreate = [];
    for (const [rawMan, , model, techStr] of slice) {
      const manName = aliasManufacturer(rawMan);
      const manId = manNameToId.get(manName);
      const eq = eqByKey.get(eqKey(manId, model));
      if (!eq) continue;
      const tokens = (techStr || '').split('+').map(s => s.trim());
      const mappedNames = new Set();
      for (const tok of tokens) {
        const mapped = mapTokenToTypeName(tok) || tok;
        if (mapped) mappedNames.add(mapped);
      }
      for (const name of mappedNames) {
        const typeId = typeNameToId.get(name);
        if (!typeId) continue;
        const lk = `${eq.id}__${typeId}`;
        if (!existingLinkSet.has(lk)) {
          linksToCreate.push({ equipment_id: eq.id, laser_type_id: typeId });
          existingLinkSet.add(lk);
        }
      }
    }

    for (const part of chunk(linksToCreate, 100)) { if (part.length) await base44.asServiceRole.entities.EquipmentType.bulkCreate(part); }

    return Response.json({ status: 'ok', created_equipments: eqToCreate.length, created_links: linksToCreate.length, slice: { start, end } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});