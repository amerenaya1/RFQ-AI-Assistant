// smart-flow.jsx — Multi-item RFQ parser flow

// State shape:
// items: [{ id, category, product_type, specs:{}, quantity, unit, missing_fields:[], status:'complete'|'incomplete' }]
// global: { location, date, payment, brand, attachments, supplier_strategy }

const ITEM_FIELD_PROMPTS = {
  // category-specific missing-field handlers
  cement: {
    type: { q: "What type of cement?", opts: [
      { id: 'OPC', label: 'OPC Cement' }, { id: 'SRC', label: 'SRC Cement' },
      { id: 'White', label: 'White Cement' }, { id: 'Masonry', label: 'Masonry Cement' },
      { id: 'unsure', label: 'Not sure', muted: true }] },
    packaging: { q: "Cement packaging?", opts: [
      { id: '50kg bags', label: '50kg bags' }, { id: 'Jumbo bags', label: 'Jumbo bags' },
      { id: 'Bulk tanker', label: 'Bulk tanker' }] },
    quantity: { q: "How much cement?", kind: 'quantity', units: ['bags','tons','pallets','truckloads'] },
  },
  steel: {
    type: { q: "What type of steel?", opts: [
      { id: 'Rebar', label: 'Rebar' }, { id: 'Wire mesh', label: 'Wire mesh' },
      { id: 'Beams', label: 'Beams (I/H)' }, { id: 'Plates', label: 'Plates' },
      { id: 'Angles', label: 'Angles' }] },
    diameter: { q: "Rebar diameter?", opts: [
      { id: '8mm', label: '8mm' }, { id: '10mm', label: '10mm' },
      { id: '12mm', label: '12mm' }, { id: '16mm', label: '16mm' },
      { id: '20mm', label: '20mm' }, { id: '25mm', label: '25mm' }] },
    grade: { q: "What grade?", opts: [
      { id: 'Grade 40', label: 'Grade 40' }, { id: 'Grade 60', label: 'Grade 60' },
      { id: 'Grade 75', label: 'Grade 75' }, { id: 'unsure', label: 'Not sure', muted: true }] },
    quantity: { q: "How much steel?", kind: 'quantity', units: ['tons','kg','pieces','bundles'] },
  },
  blocks: {
    type: { q: "Block type?", opts: [
      { id: 'Solid', label: 'Solid' }, { id: 'Hollow', label: 'Hollow' },
      { id: 'Thermal', label: 'Thermal' }, { id: 'Lightweight', label: 'Lightweight (AAC)' }] },
    size: { q: "Block size?", opts: [
      { id: '10cm', label: '10cm' }, { id: '15cm', label: '15cm' },
      { id: '20cm', label: '20cm' }, { id: '25cm', label: '25cm' }] },
    quantity: { q: "How many blocks?", kind: 'quantity', units: ['pieces','pallets','m²'] },
  },
  aggregates: {
    type: { q: "Aggregate type?", opts: [
      { id: 'Sand', label: 'Sand' }, { id: 'Gravel', label: 'Gravel' },
      { id: 'Crushed stone', label: 'Crushed stone' }, { id: 'Base course', label: 'Base course' }] },
    size: { q: "Aggregate size?", opts: [
      { id: '0-5mm', label: '0–5 mm' }, { id: '5-10mm', label: '5–10 mm' },
      { id: '10-20mm', label: '10–20 mm' }, { id: '20-40mm', label: '20–40 mm' }] },
    quantity: { q: "How much?", kind: 'quantity', units: ['tons','m³','truckloads'] },
  },
  concrete: {
    grade: { q: "Concrete grade?", opts: [
      { id: 'C20', label: 'C20' }, { id: 'C25', label: 'C25' },
      { id: 'C30', label: 'C30' }, { id: 'C40', label: 'C40' }] },
    quantity: { q: "How much concrete?", kind: 'quantity', units: ['m³','truckloads'] },
  },
  tiles: {
    type: { q: "Tile type?", opts: [
      { id: 'Ceramic', label: 'Ceramic' }, { id: 'Porcelain', label: 'Porcelain' },
      { id: 'Marble', label: 'Marble' }, { id: 'Vinyl', label: 'Vinyl' }] },
    size: { q: "Tile size?", opts: [
      { id: '30x30', label: '30 × 30 cm' }, { id: '60x60', label: '60 × 60 cm' },
      { id: '60x120', label: '60 × 120 cm' }, { id: 'custom', label: 'Custom' }] },
    quantity: { q: "How much?", kind: 'quantity', units: ['m²','pieces','boxes'] },
  },
  // Generic fallback
  generic: {
    quantity: { q: "How much do you need?", kind: 'quantity', units: ['pieces','tons','kg','m','m²','m³','boxes'] },
    specifications: { q: "Any specifications? (size, grade, type)", kind: 'text', placeholder: 'e.g. 6m length, anti-rust' },
  },
};

const GLOBAL_QUESTIONS = {
  location: {
    q: "Delivery location?",
    kind: 'location',
    quickCities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Jeddah'],
  },
  date: {
    q: "When do you need delivery?",
    opts: [
      { id: 'Today', label: 'Today' }, { id: 'Tomorrow', label: 'Tomorrow' },
      { id: 'Within 3 days', label: 'Within 3 days' }, { id: 'Within 1 week', label: 'Within 1 week' },
      { id: 'Specific date', label: 'Specific date' }, { id: 'Flexible', label: 'Flexible' },
    ],
  },
  payment: {
    q: "Payment terms?",
    opts: [
      { id: 'Cash on delivery', label: 'Cash on delivery' },
      { id: 'Advance payment', label: 'Advance payment' },
      { id: '30 days credit', label: '30 days credit' },
      { id: '60 days credit', label: '60 days credit' },
      { id: 'Milestone', label: 'Milestone' },
    ],
  },
  brand: {
    q: "Brand preference (applies to all items unless you set individually)?",
    opts: [
      { id: 'No preference', label: 'No preference' },
      { id: 'Approved equivalents', label: 'Approved equivalents' },
      { id: 'Specific brand', label: 'Specific brand' },
    ],
  },
  attachments: {
    q: "Want to attach BOQ, drawings, or specs?",
    opts: [
      { id: 'BOQ', label: 'Upload BOQ', icon: 'file-spreadsheet' },
      { id: 'Drawings', label: 'Upload drawings', icon: 'pencil-ruler' },
      { id: 'Schedule', label: 'Material schedule', icon: 'calendar-check' },
      { id: 'None', label: 'No attachment', muted: true },
    ],
  },
  supplier_strategy: {
    q: "How should I handle suppliers across these items?",
    opts: [
      { id: 'AI recommend', label: 'Let AI recommend', primary: true, sub: 'Recommended' },
      { id: 'One supplier', label: 'One supplier for all' },
      { id: 'Best per item', label: 'Best supplier per item' },
      { id: 'Max 3', label: 'Limit to max 3 suppliers' },
    ],
  },
};

// Heuristic local parser — fast path. Used as a fallback if AI parse fails.
function localParse(input) {
  const text = input.toLowerCase();
  const items = [];
  // Split on commas / "and" / semicolons
  const chunks = input.split(/[,;]| and /i).map(s => s.trim()).filter(Boolean);
  for (const chunk of chunks) {
    const lc = chunk.toLowerCase();
    let item = { id: 'i' + Math.random().toString(36).slice(2, 8), specs: {}, missing_fields: [] };
    // Category detection
    if (/cement/.test(lc)) item.category = 'cement';
    else if (/rebar|steel|metal|bar/.test(lc)) item.category = 'steel';
    else if (/block|brick/.test(lc)) item.category = 'blocks';
    else if (/sand|gravel|aggregate|crushed/.test(lc)) item.category = 'aggregates';
    else if (/concrete|ready[- ]?mix/.test(lc)) item.category = 'concrete';
    else if (/tile/.test(lc)) item.category = 'tiles';
    else if (/paint/.test(lc)) item.category = 'paint';
    else if (/plumb|pipe|fitting/.test(lc)) item.category = 'plumbing';
    else if (/electric|cable|wire/.test(lc)) item.category = 'electrical';
    else item.category = 'other';

    // Product type
    if (/opc/i.test(chunk)) item.product_type = 'OPC Cement';
    else if (/src/i.test(chunk)) item.product_type = 'SRC Cement';
    else if (/white/i.test(chunk) && item.category === 'cement') item.product_type = 'White Cement';
    else if (/masonry/i.test(chunk)) item.product_type = 'Masonry Cement';
    else if (/rebar/i.test(chunk)) item.product_type = 'Rebar';
    else if (/wire mesh/i.test(chunk)) item.product_type = 'Wire mesh';
    else if (/hollow/i.test(chunk) && item.category === 'blocks') item.product_type = 'Hollow blocks';
    else if (/solid/i.test(chunk) && item.category === 'blocks') item.product_type = 'Solid blocks';

    // Specs — diameter (mm), packaging (kg), grade
    const mmMatch = chunk.match(/(\d+(?:\.\d+)?)\s*mm/i);
    if (mmMatch) item.specs.diameter = mmMatch[1] + 'mm';
    const cmMatch = chunk.match(/(\d+(?:\.\d+)?)\s*cm/i);
    if (cmMatch) item.specs.size = cmMatch[1] + 'cm';
    const kgMatch = chunk.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kgMatch && item.category === 'cement') item.specs.packaging = kgMatch[1] + 'kg bags';
    const gradeMatch = chunk.match(/grade\s+(\d+)/i);
    if (gradeMatch) item.specs.grade = 'Grade ' + gradeMatch[1];

    // Quantity + unit
    const qm = chunk.match(/(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*(bags?|tons?|tonnes?|pieces?|pcs?|pallets?|truckloads?|m2|m²|m3|m³|kg|boxes?|bundles?|rolls?)/i);
    if (qm) {
      let unit = qm[2].toLowerCase().replace(/s$/, '').replace('tonne','ton').replace('m2','m²').replace('m3','m³').replace('pc','piece');
      const unitMap = { bag:'bags', ton:'tons', piece:'pieces', pallet:'pallets', truckload:'truckloads', kg:'kg', box:'boxes', bundle:'bundles', roll:'rolls' };
      item.quantity = parseInt(qm[1].replace(/[,\s]/g, ''), 10);
      item.unit = unitMap[unit] || qm[2].toLowerCase();
    }

    // Determine missing fields
    if (item.category === 'cement') {
      if (!item.product_type) item.missing_fields.push('type');
      if (!item.specs.packaging) item.missing_fields.push('packaging');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else if (item.category === 'steel') {
      if (!item.product_type) item.missing_fields.push('type');
      if (item.product_type === 'Rebar' && !item.specs.diameter) item.missing_fields.push('diameter');
      if (item.product_type === 'Rebar' && !item.specs.grade) item.missing_fields.push('grade');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else if (item.category === 'blocks') {
      if (!item.product_type) item.missing_fields.push('type');
      if (!item.specs.size) item.missing_fields.push('size');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else if (item.category === 'aggregates') {
      if (!item.product_type) item.missing_fields.push('type');
      if (!item.specs.size) item.missing_fields.push('size');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else if (item.category === 'concrete') {
      if (!item.specs.grade) item.missing_fields.push('grade');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else if (item.category === 'tiles') {
      if (!item.product_type) item.missing_fields.push('type');
      if (!item.specs.size) item.missing_fields.push('size');
      if (!item.quantity) item.missing_fields.push('quantity');
    } else {
      if (!item.quantity) item.missing_fields.push('quantity');
      if (Object.keys(item.specs).length === 0) item.missing_fields.push('specifications');
    }

    item.status = item.missing_fields.length === 0 ? 'complete' : 'incomplete';
    items.push(item);
  }
  return items;
}

function itemTitle(item) {
  const parts = [];
  if (item.product_type) parts.push(item.product_type);
  else if (item.category) parts.push(item.category[0].toUpperCase() + item.category.slice(1));
  if (item.specs.diameter) parts.push(item.specs.diameter);
  if (item.specs.size) parts.push(item.specs.size);
  if (item.specs.grade) parts.push(item.specs.grade);
  if (item.specs.packaging) parts.push(item.specs.packaging);
  return parts.join(' · ');
}

function itemSummary(item) {
  const t = itemTitle(item);
  const q = item.quantity ? `${item.quantity.toLocaleString()} ${item.unit || ''}`.trim() : '';
  return q ? `${t} — ${q}` : t;
}

window.localParse = localParse;
window.ITEM_FIELD_PROMPTS = ITEM_FIELD_PROMPTS;
window.GLOBAL_QUESTIONS = GLOBAL_QUESTIONS;
window.itemTitle = itemTitle;
window.itemSummary = itemSummary;
