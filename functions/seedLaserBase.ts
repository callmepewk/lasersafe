import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Helpers
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
  if (t.includes('alexandrite')) return 'Alexandrite 755nm';
  if (t.includes('q-sw')) return 'Nd:YAG Q-Switched';
  if (t.includes('nd:yag') && t.includes('fracion')) return 'Nd:YAG fracionado';
  if (t.includes('nd:yag')) return 'Nd:YAG 1064nm';
  if (t.includes('pdl') || t.includes('pulsed dye')) return 'Pulsed Dye Laser (PDL)';
  if (t.includes('bbl')) return 'BroadBand Light';
  if (t.includes('ipl') && t.includes('nd:yag')) return 'IPL + Nd:YAG';
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

// Dataset (manufacturer | country | model | technology string)
const DATASET = [
  // Candela (EUA)
  ['Candela','EUA','GentleMax Pro','Alexandrite + Nd:YAG'],
  ['Candela','EUA','GentleMax Pro Plus','Alexandrite + Nd:YAG'],
  ['Candela','EUA','GentleLase Pro','Alexandrite'],
  ['Candela','EUA','GentleYAG Pro','Nd:YAG'],
  ['Candela','EUA','VBeam Perfecta','Pulsed Dye Laser'],
  ['Candela','EUA','VBeam Prima','Pulsed Dye Laser'],
  ['Candela','EUA','Nordlys','IPL + Laser'],
  ['Candela','EUA','Mini GentleYAG','Nd:YAG'],
  // Cynosure (EUA)
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
  // Lumenis (Israel)
  ['Lumenis','Israel','M22','IPL + Nd:YAG'],
  ['Lumenis','Israel','Stellar M22','IPL + Nd:YAG'],
  ['Lumenis','Israel','LightSheer ET','Diodo'],
  ['Lumenis','Israel','LightSheer Duet','Diodo'],
  ['Lumenis','Israel','LightSheer Desire','Diodo'],
  ['Lumenis','Israel','Splendor X','Alexandrite + Nd:YAG'],
  ['Lumenis','Israel','UltraPulse','CO2'],
  ['Lumenis','Israel','AcuPulse','CO2'],
  ['Lumenis','Israel','ResurFX','Laser fracionado'],
  // Alma (Israel)
  ['Alma','Israel','Soprano ICE','Diodo'],
  ['Alma','Israel','Soprano ICE Platinum','Diodo'],
  ['Alma','Israel','Soprano Titanium','Diodo'],
  ['Alma','Israel','Harmony XL','Multiplataforma'],
  ['Alma','Israel','Harmony XL Pro','Multiplataforma'],
  ['Alma','Israel','ClearLift','Nd:YAG fracionado'],
  ['Alma','Israel','Pixel CO2','CO2 fracionado'],
  ['Alma','Israel','Alma Hybrid','CO2 + 1570nm'],
  // Fotona (Eslovênia)
  ['Fotona','Eslovênia','SP Dynamis','Nd:YAG + Er:YAG'],
  ['Fotona','Eslovênia','SP Spectro','Nd:YAG + Er:YAG'],
  ['Fotona','Eslovênia','StarWalker','Q-switched'],
  ['Fotona','Eslovênia','StarWalker MaQX','Pico'],
  ['Fotona','Eslovênia','TimeWalker Fotona4D','Er:YAG'],
  ['Fotona','Eslovênia','LightWalker','Er:YAG'],
  // Cutera (EUA)
  ['Cutera','EUA','Excel V','KTP + Nd:YAG'],
  ['Cutera','EUA','Excel HR','Laser depilação'],
  ['Cutera','EUA','Xeo','Multiplataforma'],
  ['Cutera','EUA','Enlighten','Pico'],
  ['Cutera','EUA','GenesisPlus','Nd:YAG'],
  // Lutronic (Coreia do Sul)
  ['Lutronic','Coreia do Sul','Clarity','Alexandrite + Nd:YAG'],
  ['Lutronic','Coreia do Sul','Clarity II','Alexandrite + Nd:YAG'],
  ['Lutronic','Coreia do Sul','Spectra XT','Q-switched'],
  ['Lutronic','Coreia do Sul','Spectra VRM IV','Q-switched'],
  ['Lutronic','Coreia do Sul','Spectra G2','Q-switched'],
  // Sciton (EUA)
  ['Sciton','EUA','Joule','Multiplataforma'],
  ['Sciton','EUA','BBL','BroadBand Light'],
  ['Sciton','EUA','BBL HERO','BroadBand Light'],
  ['Sciton','EUA','Halo','Laser híbrido'],
  ['Sciton','EUA','ProFractional','Er:YAG fracionado'],
  ['Sciton','EUA','Contour TRL','Er:YAG'],
  // Quanta System (Itália)
  ['Quanta','Itália','Discovery Pico','Pico'],
  ['Quanta','Itália','Discovery PICO Plus','Pico'],
  ['Quanta','Itália','Thunder MT','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Thunder MT Pro','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Duetto MT EVO','Alexandrite + Nd:YAG'],
  ['Quanta','Itália','Chrome','Nd:YAG + Alexandrite'],
  // Asclepion (Alemanha)
  ['Asclepion','Alemanha','MeDioStar NeXT','Diodo'],
  ['Asclepion','Alemanha','MeDioStar Monolith','Diodo'],
  ['Asclepion','Alemanha','Dermablate','Er:YAG'],
  ['Asclepion','Alemanha','QuadroStar PRO','Nd:YAG'],
  // DEKA (Itália)
  ['DEKA','Itália','SmartXide DOT','CO2 fracionado'],
  ['DEKA','Itália','SmartXide Punto','CO2'],
  ['DEKA','Itália','Motus AX','Alexandrite'],
  ['DEKA','Itália','Motus AY','Nd:YAG'],
  ['DEKA','Itália','Synchro REPLA:Y','Er:YAG'],
  // Solta (EUA)
  ['Solta','EUA','Fraxel Restore','Er:Glass'],
  ['Solta','EUA','Fraxel Dual','1550 + 1927'],
  ['Solta','EUA','Thermage CPT','RF'],
  ['Solta','EUA','Thermage FLX','RF'],
  ['Solta','EUA','Clear + Brilliant','Laser fracionado'],
  // Aerolase (EUA)
  ['Aerolase','EUA','Neo Elite','Nd:YAG'],
  ['Aerolase','EUA','Neo Elite Pro','Nd:YAG'],
  ['Aerolase','EUA','Era Elite','Er:YAG'],
  // InMode (Israel)
  ['InMode','Israel','Lumecca','IPL'],
  ['InMode','Israel','DiolazeXL','Diodo'],
  ['InMode','Israel','Optimas','Multiplataforma'],
  ['InMode','Israel','Morpheus8','RF fracionado'],
  // Venus Concept (Canadá)
  ['Venus','Canadá','Venus Versa','Multiplataforma'],
  ['Venus','Canadá','Venus Velocity','Diodo'],
  ['Venus','Canadá','Venus Viva','RF fracionado'],
  // Brasil - Vydence
  ['Vydence','Brasil','Etherea MX','Multiplataforma'],
  ['Vydence','Brasil','Etherea Smart','Multiplataforma'],
  ['Vydence','Brasil','Etherea Hybrid','Multiplataforma'],
  // Brasil - MMOptics
  ['MMOptics','Brasil','Recover','Laser terapêutico'],
  ['MMOptics','Brasil','SmartLaser','Laser terapêutico'],
  ['MMOptics','Brasil','Laser Duo','Laser terapêutico'],
  // Brasil - Ibramed
  ['Ibramed','Brasil','Polarys','Laser estético'],
  ['Ibramed','Brasil','Laserpulse','Laser terapêutico'],
  ['Ibramed','Brasil','Heccus Turbo','Ultrassom + energia'],
  // Brasil - HTM
  ['HTM','Brasil','LaserPulse','Laser terapêutico'],
  ['HTM','Brasil','HTM SmartLaser','Laser terapêutico'],
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    // If user exists and is not admin, block; if no user (e.g., internal run), allow service role
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Ensure Manufacturers
    let mans = await base44.asServiceRole.entities.Manufacturer.list();
    const manByName = new Map(mans.map(m => [m.name, m]));

    // Create missing manufacturers with country
    const ensureMan = async (rawName, countryHint) => {
      const name = aliasManufacturer(rawName);
      const country = desiredCountries[name] || countryHint || null;
      if (!manByName.has(name)) {
        const created = await base44.asServiceRole.entities.Manufacturer.create({ name, country: country || 'Internacional', verified_sbd: false, verified_anvisa: false });
        manByName.set(name, created);
        return created;
      }
      const m = manByName.get(name);
      if (country && m.country !== country) {
        const upd = await base44.asServiceRole.entities.Manufacturer.update(m.id, { country });
        manByName.set(name, upd);
        return upd;
      }
      return m;
    };

    // Ensure Laser Types
    let types = await base44.asServiceRole.entities.LaserType.list();
    const typeByName = new Map(types.map(t => [t.name, t]));

    for (const t of TYPE_ALIASES) {
      if (!typeByName.has(t)) {
        const created = await base44.asServiceRole.entities.LaserType.create({ name: t, wavelength: t.match(/\d+\s*nm/i)?.[0] || '' , applications: [] });
        typeByName.set(t, created);
      }
    }

    // Ensure Equipment + EquipmentType links
    let createdCount = 0, linkedCount = 0, updatedMan = 0;

    for (const row of DATASET) {
      const [rawMan, rawCountry, model, techStr] = row;
      const man = await ensureMan(rawMan, rawCountry);
      if (rawCountry && man.country !== rawCountry) updatedMan += 1;

      // Upsert equipment by manufacturer + model
      const existing = await base44.asServiceRole.entities.Equipment.filter({ manufacturer_id: man.id, model });
      let eq = Array.isArray(existing) && existing[0] ? existing[0] : null;
      if (!eq) {
        eq = await base44.asServiceRole.entities.Equipment.create({
          manufacturer_id: man.id,
          model,
          laser_type_id: '',
          registro_anvisa: '',
          status_regulatorio: 'verificar',
          risco_regulatorio: (techStr || '').toLowerCase().includes('ipl') ? 'medio' : 'baixo'
        });
        createdCount += 1;
      }

      // Split technologies
      const tokens = (techStr || '').split('+').map(s => s.trim());
      const wantedTypes = new Set();
      for (const tok of tokens) {
        // special cases
        const tkn = tok.toLowerCase();
        if (tkn === 'diodo') { wantedTypes.add('Diodo 800–810nm'); continue; }
        if (tkn === 'co2') { wantedTypes.add('CO2 Fracionado'); continue; }
        if (tkn === 'pico') { wantedTypes.add('Picolaser'); continue; }
        if (tkn === 'pico alexandrite') { wantedTypes.add('Picolaser'); wantedTypes.add('Alexandrite 755nm'); continue; }
        if (tkn === 'ipl') { wantedTypes.add('IPL (Luz Intensa Pulsada)'); continue; }
        if (tkn === 'q-switched') { wantedTypes.add('Nd:YAG Q-Switched'); continue; }

        const mapped = mapTokenToTypeName(tok);
        if (mapped) wantedTypes.add(mapped);
      }

      // Ensure all wanted laser types exist
      for (const tName of wantedTypes) {
        if (!typeByName.has(tName)) {
          const createdT = await base44.asServiceRole.entities.LaserType.create({ name: tName, wavelength: tName.match(/\d+\s*nm/i)?.[0] || '' , applications: [] });
          typeByName.set(tName, createdT);
        }
      }

      // Create EquipmentType links
      const existingLinks = await base44.asServiceRole.entities.EquipmentType.filter({ equipment_id: eq.id });
      const linkSet = new Set((Array.isArray(existingLinks) ? existingLinks : []).map(l => `${l.equipment_id}__${l.laser_type_id}`));
      for (const tName of wantedTypes) {
        const tObj = typeByName.get(tName);
        if (!tObj) continue;
        const key = `${eq.id}__${tObj.id}`;
        if (!linkSet.has(key)) {
          await base44.asServiceRole.entities.EquipmentType.create({ equipment_id: eq.id, laser_type_id: tObj.id });
          linkSet.add(key);
          linkedCount += 1;
        }
      }
    }

    return Response.json({ status: 'ok', created_equipments: createdCount, created_links: linkedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});