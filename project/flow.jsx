// flow.jsx — RFQ flow definition (the 16 steps + scripted AI replies)

// Each step has:
//   id, ai (string or array of message bubbles), kind, options?, summaryKey?, next, reply (fn user-pick → user-bubble text)
// kind: 'options' | 'options-with-input' | 'quantity' | 'location' | 'date' | 'attachments'
//        | 'rfq-summary' | 'rfq-created' | 'quotes' | 'compare' | 'negotiate-pick'
//        | 'negotiate-draft' | 'supplier-pick' | 'order-po' | 'order-contact'
//        | 'order-time' | 'order-access' | 'order-summary' | 'tracking' | 'delivered-check'
//        | 'closing'

const RFQ_FLOW = {
  // STEP 1
  welcome: {
    ai: [
      "Hi Mariam — I'm your sourcing assistant.",
      "I can help you put together an RFQ and send it to matching sellers. What material are you looking for today?",
    ],
    kind: 'options',
    options: [
      { id: 'cement', label: 'Cement', icon: 'package' },
      { id: 'steel', label: 'Steel', icon: 'wrench' },
      { id: 'aggregates', label: 'Aggregates', icon: 'boxes' },
      { id: 'concrete', label: 'Concrete', icon: 'truck' },
      { id: 'blocks', label: 'Blocks', icon: 'square-stack' },
      { id: 'tiles', label: 'Tiles', icon: 'grid-3x3' },
      { id: 'plumbing', label: 'Plumbing', icon: 'pipette' },
      { id: 'electrical', label: 'Electrical', icon: 'zap' },
      { id: 'paint', label: 'Paint', icon: 'paint-bucket' },
      { id: 'waterproofing', label: 'Waterproofing', icon: 'shield' },
      { id: 'other', label: 'Other', icon: 'more-horizontal' },
    ],
    summaryKey: 'category',
    next: (pick) => pick === 'cement' ? 'cementType' : 'lockedDemo',
  },

  lockedDemo: {
    ai: [
      "Got it. The full demo flow is wired for **Cement** — let me take you down that path so you can see it end to end.",
    ],
    kind: 'options',
    options: [{ id: 'cement', label: 'Continue with Cement instead' }],
    summaryKey: 'category',
    overrideValue: 'Cement',
    next: () => 'cementType',
  },

  // STEP 2
  cementType: {
    ai: "What type of cement do you need?",
    kind: 'options',
    options: [
      { id: 'opc', label: 'OPC Cement', sub: 'Ordinary Portland — most common' },
      { id: 'src', label: 'SRC Cement', sub: 'Sulphate-resistant' },
      { id: 'white', label: 'White Cement' },
      { id: 'masonry', label: 'Masonry Cement' },
      { id: 'lowheat', label: 'Low heat cement' },
      { id: 'unsure', label: 'Not sure', muted: true },
    ],
    summaryKey: 'product',
    next: () => 'packaging',
  },

  packaging: {
    ai: "What packaging do you need?",
    kind: 'options',
    options: [
      { id: 'bag50', label: '50kg bags' },
      { id: 'jumbo', label: 'Jumbo bags', sub: '~1.5T each' },
      { id: 'bulk', label: 'Bulk tanker' },
      { id: 'unsure', label: 'Not sure', muted: true },
    ],
    summaryKey: 'packaging',
    next: () => 'brand',
  },

  brand: {
    ai: "Do you have a preferred brand?",
    kind: 'options',
    options: [
      { id: 'none', label: 'No preference' },
      { id: 'equiv', label: 'Approved equivalents allowed' },
      { id: 'specific', label: 'Specific brand only' },
      { id: 'unsure', label: 'Not sure', muted: true },
    ],
    summaryKey: 'brand',
    next: (pick) => pick === 'specific' ? 'brandInput' : 'quantity',
  },

  brandInput: {
    ai: "Which brand?",
    kind: 'options-with-input',
    placeholder: 'e.g. Lafarge, Holcim, Al Jouf …',
    options: [
      { id: 'lafarge', label: 'Lafarge' },
      { id: 'holcim', label: 'Holcim' },
      { id: 'aljouf', label: 'Al Jouf Cement' },
      { id: 'arabian', label: 'Arabian Cement' },
    ],
    summaryKey: 'brand',
    next: () => 'quantity',
  },

  // STEP 3
  quantity: {
    ai: "What quantity do you need?",
    kind: 'quantity',
    units: [
      { id: 'bags', label: 'Bags' },
      { id: 'tons', label: 'Tons' },
      { id: 'pallets', label: 'Pallets' },
      { id: 'truckloads', label: 'Truckloads' },
    ],
    summaryKey: 'quantity',
    next: () => 'location',
  },

  // STEP 4
  location: {
    ai: "Where should the material be delivered?",
    kind: 'location',
    quickCities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Jeddah'],
    summaryKey: 'location',
    next: () => 'deliveryDate',
  },

  // STEP 5
  deliveryDate: {
    ai: "When do you need delivery?",
    kind: 'options',
    options: [
      { id: 'today', label: 'Today' },
      { id: 'tomorrow', label: 'Tomorrow' },
      { id: '3days', label: 'Within 3 days' },
      { id: '1week', label: 'Within 1 week' },
      { id: 'specific', label: 'Specific date' },
      { id: 'flexible', label: 'Flexible' },
    ],
    summaryKey: 'requiredBy',
    next: (pick) => pick === 'specific' ? 'specificDate' : 'urgency',
  },

  specificDate: {
    ai: "Pick a date.",
    kind: 'date',
    summaryKey: 'requiredBy',
    next: () => 'urgency',
  },

  // STEP 6
  urgency: {
    ai: "How urgent is this RFQ?",
    kind: 'options',
    options: [
      { id: 'urgent', label: 'Urgent', sub: 'Need quotes today', tone: 'danger' },
      { id: 'standard', label: 'Standard', sub: 'Quotes within 24 hours' },
      { id: 'flexible', label: 'Flexible', sub: 'Best price preferred' },
    ],
    summaryKey: 'urgency',
    next: () => 'payment',
  },

  // STEP 7
  payment: {
    ai: "What payment terms do you prefer?",
    kind: 'options',
    options: [
      { id: 'cod', label: 'Cash on delivery' },
      { id: 'advance', label: 'Advance payment' },
      { id: '30d', label: '30 days credit' },
      { id: '60d', label: '60 days credit' },
      { id: 'milestone', label: 'Milestone payment' },
      { id: 'unsure', label: 'Not sure', muted: true },
    ],
    summaryKey: 'payment',
    next: () => 'attachments',
  },

  // STEP 8
  attachments: {
    ai: "Want to upload BOQ, drawings, or specs? Sellers respond faster with attachments.",
    kind: 'attachments',
    options: [
      { id: 'boq', label: 'Upload BOQ', icon: 'file-spreadsheet' },
      { id: 'drawings', label: 'Upload drawings', icon: 'pencil-ruler' },
      { id: 'schedule', label: 'Material schedule', icon: 'calendar-check' },
      { id: 'none', label: 'No attachment', muted: true },
    ],
    summaryKey: 'attachments',
    next: () => 'rfqSummary',
  },

  // STEP 9
  rfqSummary: {
    ai: "Here's the RFQ I'll send out. Take a look — anything to change?",
    kind: 'rfq-summary',
    options: [
      { id: 'create', label: 'Create RFQ', primary: true },
      { id: 'edit', label: 'Edit details' },
      { id: 'cancel', label: 'Cancel', muted: true },
    ],
    next: () => 'rfqCreated',
  },

  // STEP 10
  rfqCreated: {
    ai: "RFQ created. Matching sellers now…",
    kind: 'rfq-created',
    next: () => 'quotesReceived',
  },

  // STEP 11
  quotesReceived: {
    ai: [
      "You received **3 quotes** for RFQ-10245.",
      "I compared them. **Gulf Build Materials** looks best overall — strong price, 3-day delivery, 30-day credit.",
    ],
    kind: 'quotes',
    options: [
      { id: 'compare', label: 'Compare quotes', primary: true },
      { id: 'negotiate', label: 'Negotiate' },
      { id: 'ask', label: 'Ask seller a question' },
      { id: 'select', label: 'Select supplier' },
    ],
    next: (pick) => pick === 'compare' ? 'compare'
                : pick === 'negotiate' ? 'negotiatePick'
                : pick === 'ask' ? 'askSeller'
                : 'supplierPick',
  },

  // STEP 12
  compare: {
    ai: "Side-by-side. Recommendation badges show what each seller wins on.",
    kind: 'compare',
    options: [
      { id: 'negotiate', label: 'Negotiate', primary: true },
      { id: 'select', label: 'Select supplier' },
    ],
    next: (pick) => pick === 'negotiate' ? 'negotiatePick' : 'supplierPick',
  },

  // STEP 13
  negotiatePick: {
    ai: "What would you like me to negotiate?",
    kind: 'negotiate-pick',
    options: [
      { id: 'price', label: 'Lower price' },
      { id: 'delivery', label: 'Faster delivery' },
      { id: 'payment', label: 'Better payment terms' },
      { id: 'unloading', label: 'Include unloading' },
      { id: 'validity', label: 'Extend quote validity' },
      { id: 'custom', label: 'Custom message' },
    ],
    next: () => 'negotiateDraft',
  },

  negotiateDraft: {
    ai: "Here's the message I'll send to **Gulf Build Materials**. Edit if you'd like.",
    kind: 'negotiate-draft',
    options: [
      { id: 'send', label: 'Send negotiation', primary: true },
      { id: 'edit', label: 'Edit message' },
      { id: 'cancel', label: 'Cancel', muted: true },
    ],
    next: (pick) => pick === 'send' ? 'negotiationSent' : 'supplierPick',
  },

  negotiationSent: {
    ai: [
      "Sent. I'll ping you the moment Gulf Build Materials replies.",
      "**Update — 4 minutes later:** Gulf Build came back with **AED 13.10/bag** and free unloading. New total: **AED 26,200**.",
    ],
    kind: 'options',
    options: [
      { id: 'accept', label: 'Accept revised quote', primary: true },
      { id: 'select', label: 'Select supplier manually' },
    ],
    next: () => 'supplierPick',
  },

  askSeller: {
    ai: "Which seller and what's your question? I'll relay it.",
    kind: 'options',
    options: [
      { id: 'back', label: 'Back to quotes', primary: true },
    ],
    next: () => 'quotesReceived',
  },

  // STEP 14
  supplierPick: {
    ai: "Which supplier are we going with?",
    kind: 'supplier-pick',
    next: () => 'orderPO',
  },

  // STEP 15 — order conversion
  orderPO: {
    ai: "Great. Just a few details to convert this to an order. Do you have a PO number?",
    kind: 'order-po',
    options: [
      { id: 'enter', label: 'Enter PO number' },
      { id: 'generate', label: 'Generate without PO' },
      { id: 'later', label: 'Add later', muted: true },
    ],
    summaryKey: 'po',
    next: () => 'orderContact',
  },

  orderContact: {
    ai: "Who's the site contact for delivery?",
    kind: 'order-contact',
    summaryKey: 'siteContact',
    next: () => 'orderTime',
  },

  orderTime: {
    ai: "Preferred delivery time?",
    kind: 'options',
    options: [
      { id: 'morning', label: 'Morning', sub: '6 – 11 AM' },
      { id: 'afternoon', label: 'Afternoon', sub: '12 – 4 PM' },
      { id: 'evening', label: 'Evening', sub: '4 – 8 PM' },
      { id: 'specific', label: 'Specific time' },
    ],
    summaryKey: 'deliveryTime',
    next: () => 'orderAccess',
  },

  orderAccess: {
    ai: "Any site access instructions for the driver?",
    kind: 'options',
    options: [
      { id: 'none', label: 'No special instructions' },
      { id: 'gatepass', label: 'Gate pass required' },
      { id: 'callfirst', label: 'Call before delivery' },
      { id: 'restrictions', label: 'Loading/unloading restrictions' },
      { id: 'custom', label: 'Custom instructions' },
    ],
    summaryKey: 'access',
    next: () => 'orderSummary',
  },

  orderSummary: {
    ai: "Order ready. Confirm to lock it in.",
    kind: 'order-summary',
    options: [
      { id: 'confirm', label: 'Confirm order', primary: true },
      { id: 'edit', label: 'Edit details' },
    ],
    next: () => 'tracking',
  },

  // STEP 16
  tracking: {
    ai: [
      "**Order PO-44218 confirmed.** I'll keep an eye on it.",
      "Here's the live timeline. I'll notify you on every status change.",
    ],
    kind: 'tracking',
    options: [
      { id: 'check', label: 'Mark as delivered' },
    ],
    next: () => 'deliveredCheck',
  },

  deliveredCheck: {
    ai: "Has the material been delivered as expected?",
    kind: 'options',
    options: [
      { id: 'ok', label: 'Yes, delivered correctly', primary: true, tone: 'success' },
      { id: 'missing', label: 'Missing quantity', tone: 'danger' },
      { id: 'wrong', label: 'Wrong specification', tone: 'danger' },
      { id: 'damaged', label: 'Damaged material', tone: 'danger' },
      { id: 'delayed', label: 'Delivery delayed', tone: 'warning' },
      { id: 'invoice', label: 'Invoice issue', tone: 'warning' },
    ],
    next: (pick) => pick === 'ok' ? 'closing' : 'closingIssue',
  },

  closing: {
    ai: [
      "Marked as completed. Invoice has been logged against PO-44218.",
      "Want me to set up a recurring RFQ for next month, or start a new one?",
    ],
    kind: 'options',
    options: [
      { id: 'recurring', label: 'Set up recurring RFQ' },
      { id: 'new', label: 'Start a new RFQ' },
      { id: 'done', label: "I'm done", muted: true },
    ],
    next: () => 'welcome',
    isTerminal: true,
  },

  closingIssue: {
    ai: "Got it — I've flagged this with Gulf Build Materials and opened a dispute. You'll hear back within 4 working hours.",
    kind: 'options',
    options: [
      { id: 'new', label: 'Start a new RFQ', primary: true },
    ],
    next: () => 'welcome',
    isTerminal: true,
  },
};

// — Defaults / canned values for the cement demo —
const DEMO_DEFAULTS = {
  category: { id: 'cement', label: 'Cement' },
  product: { id: 'opc', label: 'OPC Cement' },
  packaging: { id: 'bag50', label: '50kg bags' },
  brand: { id: 'equiv', label: 'Approved equivalents' },
  quantity: { value: '2,000', unit: 'bags', label: '2,000 bags' },
  location: { city: 'Dubai', area: 'Dubai Industrial City', site: 'Warehouse Block C', label: 'Dubai Industrial City' },
  requiredBy: { id: '1week', label: 'Within 1 week' },
  urgency: { id: 'standard', label: 'Standard · 24h' },
  payment: { id: '30d', label: '30 days credit' },
  attachments: { id: 'none', label: 'None' },
};

const SELLERS = [
  {
    id: 'gulf', name: 'Gulf Build Materials',
    arabic: 'الخليج لمواد البناء',
    rating: 4.7, reviews: 312,
    unit: 13.50, qty: 2000, total: 27000,
    delivery: '3 days', deliveryDays: 3,
    payment: '30 days credit',
    deliveryIncluded: true,
    badge: 'Best overall',
    tone: 'purple',
    yearsActive: 12,
    fulfilled: '1,840 RFQs',
    note: 'Verified · KSA + UAE coverage',
  },
  {
    id: 'emirates', name: 'Emirates Cement Trading',
    arabic: 'الإمارات لتجارة الإسمنت',
    rating: 4.2, reviews: 184,
    unit: 13.25, qty: 2000, total: 26500,
    delivery: '7 days', deliveryDays: 7,
    payment: 'Advance payment',
    deliveryIncluded: true,
    badge: 'Cheapest',
    tone: 'success',
    yearsActive: 8,
    fulfilled: '920 RFQs',
    note: 'UAE only',
  },
  {
    id: 'alsafa', name: 'Al Safa Building Supplies',
    arabic: 'الصفا لمواد البناء',
    rating: 4.8, reviews: 521,
    unit: 14.00, qty: 2000, total: 28000,
    delivery: '2 days', deliveryDays: 2,
    payment: '30 days credit',
    deliveryIncluded: true,
    badge: 'Fastest delivery',
    tone: 'warning',
    yearsActive: 15,
    fulfilled: '2,310 RFQs',
    note: 'Verified · same-day capable',
  },
];

window.RFQ_FLOW = RFQ_FLOW;
window.DEMO_DEFAULTS = DEMO_DEFAULTS;
window.SELLERS = SELLERS;
