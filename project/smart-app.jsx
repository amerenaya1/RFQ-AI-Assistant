// smart-app.jsx — Smart RFQ assistant: parse → fill missing → globals → summary → quotes

const { useState: useSt, useEffect: useEf, useRef: useRf } = React;

const SAMPLE_PROMPTS = [
  "Cement OPC 50kg 2000 bags, rebar 16mm 50 tons",
  "Cement, steel, blocks",
  "OPC 50kg 2000 bags, rebar grade 60 16mm 50 tons, hollow blocks 20cm 500 pcs",
  "Sand 30 tons, gravel 20mm 25 m³, C25 concrete 80 m³",
];

function WelcomeIntro({ onPick, onPaste }) {
  const [text, setText] = useSt('');
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff 0%, #FAF8FE 100%)',
      borderRadius: 16, padding: 14,
      border: '1px solid #ECEBEF',
      boxShadow: '0 2px 8px rgba(36,13,89,0.06)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-600)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
        Smart Parse
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-700)', lineHeight: 1.4, marginBottom: 10 }}>
        Paste or type your full request. I'll parse the items and only ask for what's missing.
      </div>
      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={3}
        placeholder="e.g. Cement OPC 50kg 2000 bags, rebar 16mm 50 tons, blocks 20cm 500 pcs"
        style={{
          width: '100%', padding: 10, borderRadius: 10, border: '1px solid #E2DEEF',
          background: '#fff', fontSize: 13, lineHeight: 1.5, fontFamily: 'inherit',
          color: 'var(--ink-900)', resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
      <button onClick={() => text.trim() && onPaste(text.trim())} disabled={!text.trim()}
        style={{
          width: '100%', marginTop: 8, padding: '10px',
          borderRadius: 10, border: 0, fontFamily: 'inherit',
          background: text.trim() ? 'var(--purple-600)' : '#E2DEEF',
          color: '#fff', fontSize: 13.5, fontWeight: 700,
          cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
        <Icon name="sparkles" size={14} color="#fff"/> Parse my request
      </button>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 12, marginBottom: 6 }}>
        Try a sample
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {SAMPLE_PROMPTS.map(p => (
          <button key={p} onClick={() => onPick(p)} style={{
            padding: '8px 10px', borderRadius: 10, fontFamily: 'inherit',
            background: '#FAF8FE', border: '1px solid #ECEBEF',
            fontSize: 12, fontWeight: 500, color: 'var(--ink-800)',
            textAlign: 'left', cursor: 'pointer', lineHeight: 1.4,
          }}>“{p}”</button>
        ))}
      </div>
    </div>
  );
}

// ─── Toast ───
function Toast2({ toast, onClose }) {
  useEf(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute', top: 96, left: 12, right: 12, zIndex: 80,
      background: 'rgba(20,20,24,0.94)', color: '#fff',
      borderRadius: 14, padding: '12px 14px',
      display: 'flex', gap: 10, alignItems: 'center',
      boxShadow: '0 16px 40px rgba(20,20,24,0.4)',
      animation: 'toastIn 320ms cubic-bezier(.2,.7,.2,1) both',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: toast.tone === 'success' ? 'var(--success)' : 'var(--purple-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={toast.icon || 'bell'} size={15} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{toast.title}</div>
        {toast.body && <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 1 }}>{toast.body}</div>}
      </div>
    </div>
  );
}

// ─── Confetti2 ───
function Confetti2({ on }) {
  if (!on) return null;
  const pieces = Array.from({ length: 50 });
  const colors = ['#521DCE', '#7A4CE6', '#FF8A1F', '#1FB26A', '#F4A300'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 70 }}>
      {pieces.map((_, i) => {
        const c = colors[i % colors.length];
        const left = Math.random() * 100;
        const dx = (Math.random() - 0.5) * 200;
        const delay = Math.random() * 200;
        const dur = 1800 + Math.random() * 1000;
        const rot = Math.random() * 720;
        return (
          <span key={i} style={{
            position: 'absolute', top: -20, left: `${left}%`,
            width: 7, height: 10, background: c,
            borderRadius: i % 3 === 0 ? '50%' : 2,
            animation: `confetti ${dur}ms ${delay}ms cubic-bezier(.4,.05,.4,1) forwards`,
            ['--dx']: `${dx}px`, ['--rot']: `${rot}deg`,
          }} />
        );
      })}
    </div>
  );
}

function ChatHeader2({ onReset }) {
  return (
    <div style={{
      padding: '14px 16px 10px',
      background: 'rgba(247,244,254,0.95)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid #ECEBEF',
      display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 5,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #7A4CE6 0%, #521DCE 60%, #351386 100%)',
        width: 36, height: 36, borderRadius: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(82,29,206,0.25)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L14.2 8.2 L20.5 9.3 L15.8 13.7 L17.2 20 L12 16.6 L6.8 20 L8.2 13.7 L3.5 9.3 L9.8 8.2 Z" fill="#fff"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-600)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Disty <span style={{ opacity: 0.6 }}>·</span> Build
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>Sourcing Assistant</div>
          <span style={{ background: 'var(--success)', width: 7, height: 7, borderRadius: '50%',
            boxShadow: '0 0 0 3px rgba(31,178,106,0.18)' }}/>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 500, marginTop: 1 }}>
          Al Noor Contracting · Dubai Industrial City
        </div>
      </div>
      <button onClick={onReset} title="Reset" style={{
        width: 32, height: 32, borderRadius: 10, background: '#fff',
        border: '1px solid #ECEBEF', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="rotate-ccw" size={14} color="#5A5A66" />
      </button>
    </div>
  );
}

const SUGGESTION_CHIPS = [
  'Cement OPC 50kg 2000 bags, rebar 16mm 50 tons',
  'Cement, steel, blocks',
  'Sand 30 tons, concrete C25 80 m³',
];

function Composer2({ onSend, disabled, hint, showHelper, showChips }) {
  const [text, setText] = useSt('');
  const [focus, setFocus] = useSt(false);
  const taRef = useRf(null);
  const submit = () => { if (text.trim()) { onSend(text.trim()); setText(''); } };
  const useChip = (chip) => {
    setText(chip);
    setTimeout(() => { taRef.current && taRef.current.focus(); }, 0);
  };
  return (
    <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #ECEBEF', background: 'rgba(255,255,255,0.92)' }}>
      {showHelper && (
        <div style={{
          fontSize: 11.5, fontWeight: 500, color: 'var(--ink-600)',
          textAlign: 'center', padding: '0 6px 6px', lineHeight: 1.35,
        }}>
          Type your full material request — I’ll parse it and only ask what’s missing.
        </div>
      )}
      {showChips && (
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 2px 8px',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }} className="chat-scroll">
          {SUGGESTION_CHIPS.map(chip => (
            <button key={chip} onClick={() => useChip(chip)} style={{
              flexShrink: 0, padding: '7px 12px', borderRadius: 999,
              background: '#fff', border: '1px solid #E2DEEF',
              fontSize: 11.5, fontWeight: 600, color: 'var(--purple-700)',
              fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(20,20,24,0.03)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <Icon name="sparkles" size={11} color="#521DCE"/>
              “{chip}”
            </button>
          ))}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: '#fff', borderRadius: 22,
        border: focus ? '1.5px solid var(--purple-400)' : '1px solid #E2DEEF',
        padding: '6px 6px 6px 16px',
        boxShadow: focus ? '0 4px 16px rgba(82,29,206,0.12)' : '0 1px 2px rgba(20,20,24,0.03)',
        transition: 'all 140ms ease',
      }}>
        <textarea ref={taRef} value={text} onChange={e => setText(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={hint || 'Type your request or answer…'} rows={1} disabled={disabled}
          style={{ flex: 1, border: 0, outline: 'none', resize: 'none',
            fontSize: 14, lineHeight: 1.4, fontFamily: 'inherit',
            background: 'transparent', color: 'var(--ink-900)', padding: '8px 0', maxHeight: 80 }}/>
        <button onClick={submit} disabled={!text.trim() || disabled} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: text.trim() ? 'var(--purple-600)' : '#E2DEEF',
          color: '#fff', border: 0, cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="arrow-up" size={16} color="#fff" strokeWidth={2.5} />
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--ink-500)', marginTop: 6, fontWeight: 500 }}>
        Smart parse · Multi-item · Disty AI
      </div>
    </div>
  );
}

// ─── Main App ───
function SmartApp({ tweaksProp }) {
  const tweaks = tweaksProp || { tone: 'business', density: 'comfortable' };

  const [messages, setMessages] = useSt([]);
  const [items, setItems] = useSt([]);
  const [global, setGlobal] = useSt({});
  const [phase, setPhase] = useSt('welcome'); // welcome | filling | globals | summary | created | quotes | order | tracking
  const [activeItemId, setActiveItemId] = useSt(null);
  const [activeField, setActiveField] = useSt(null);
  const [globalQ, setGlobalQ] = useSt(null); // current global question key
  const [typing, setTyping] = useSt(false);
  const [toast, setToast] = useSt(null);
  const [confetti, setConfetti] = useSt(false);
  const [itemsPanelOpen, setItemsPanelOpen] = useSt(true);
  const [richKey, setRichKey] = useSt(null);  // identifies the current rich UI to show
  const [selectedSeller, setSelectedSeller] = useSt(null);

  const scrollRef = useRf(null);
  const itemsRef = useRf(items);
  const globalRef = useRf(global);
  useEf(() => { itemsRef.current = items; }, [items]);
  useEf(() => { globalRef.current = global; }, [global]);

  useEf(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, richKey]);

  // ─── Boot ───
  useEf(() => {
    setMessages([{ kind: 'ai', text: "Hi — I'm your sourcing assistant. Tell me what you need and I'll structure the RFQ for you.", id: rid() }]);
  }, []);

  function rid() { return Math.random().toString(36).slice(2); }

  function pushAI(text, delay = 600) {
    return new Promise(resolve => {
      setRichKey(null);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages(m => [...m, { kind: 'ai', text, id: rid() }]);
        resolve();
      }, delay);
    });
  }
  function pushUser(text) {
    setMessages(m => [...m, { kind: 'user', text, id: rid() }]);
    setRichKey(null);
  }

  // ─── AI parse via claude.complete (with local fallback) ───
  async function parseRequest(input) {
    pushUser(input);
    setTyping(true);
    setRichKey(null);
    let parsed = null;
    try {
      const prompt = `You are an RFQ item parser for a B2B construction marketplace. Parse the user's request into structured items.

Return ONLY valid JSON (no markdown), an array. Each item: {category, product_type, specs:{...}, quantity, unit, missing_fields}.

Categories: cement, steel, blocks, aggregates, concrete, tiles, paint, plumbing, electrical, waterproofing, other.
For cement, missing_fields candidates: type, packaging, quantity. Common types: OPC, SRC, White, Masonry.
For steel, candidates: type, diameter, grade, quantity. Types: Rebar, Wire mesh, Beams, Plates, Angles.
For blocks: type (Solid/Hollow/Thermal), size, quantity.
For aggregates: type (Sand/Gravel/Crushed stone), size, quantity.
For concrete: grade (C20/C25/C30/C40), quantity.
For tiles: type, size, quantity.
Generic: quantity, specifications.

Set missing_fields to fields you genuinely cannot infer. Infer aggressively from common phrasing.

User request: "${input}"

Return JSON only.`;
      const reply = await window.claude.complete(prompt);
      const cleaned = reply.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr) && arr.length > 0) {
        parsed = arr.map(it => ({
          id: rid(),
          category: (it.category || 'other').toLowerCase(),
          product_type: it.product_type || null,
          specs: it.specs || {},
          quantity: it.quantity || null,
          unit: it.unit || null,
          missing_fields: Array.isArray(it.missing_fields) ? it.missing_fields : [],
          status: (it.missing_fields || []).length === 0 ? 'complete' : 'incomplete',
        }));
      }
    } catch (e) {
      // fall through to local parse
    }
    if (!parsed) parsed = localParse(input);
    setItems(parsed);
    setTyping(false);
    const completeCount = parsed.filter(i => i.status === 'complete').length;
    const summaryLine = parsed.map((i, idx) => `${idx + 1}. ${itemSummary(i)}`).join('\n');
    setMessages(m => [...m, {
      kind: 'ai',
      text: `Got it — captured **${parsed.length} item${parsed.length === 1 ? '' : 's'}** from your request.${completeCount > 0 ? ` ${completeCount} already complete.` : ''}`,
      id: rid(),
    }]);
    setItemsPanelOpen(true);
    // Show parsed items rich card, then start filling
    setRichKey('parsed-items');
    setTimeout(() => continueFilling(parsed), 1400);
  }

  // ─── Pick the next missing field across all items ───
  function continueFilling(currentItems = itemsRef.current) {
    const incomplete = currentItems.find(i => i.status === 'incomplete');
    if (!incomplete) {
      // All items complete — go to globals
      setActiveItemId(null);
      setActiveField(null);
      setPhase('globals');
      askNextGlobal({});
      return;
    }
    setActiveItemId(incomplete.id);
    const field = incomplete.missing_fields[0];
    setActiveField(field);
    setPhase('filling');

    const prompts = ITEM_FIELD_PROMPTS[incomplete.category] || ITEM_FIELD_PROMPTS.generic;
    const prompt = prompts[field] || ITEM_FIELD_PROMPTS.generic[field] || ITEM_FIELD_PROMPTS.generic.specifications;
    const itemLabel = itemTitle(incomplete) || incomplete.category;
    pushAI(`For **${itemLabel}** — ${prompt.q}`, 500).then(() => {
      setRichKey('field:' + incomplete.id + ':' + field);
    });
  }

  function applyFieldValue(itemId, field, value, label) {
    pushUser(label);
    setItems(prev => {
      const next = prev.map(i => {
        if (i.id !== itemId) return i;
        const u = { ...i, specs: { ...i.specs }, missing_fields: i.missing_fields.filter(f => f !== field) };
        if (field === 'quantity') { u.quantity = value.quantity; u.unit = value.unit; }
        else if (field === 'type') {
          u.product_type = value;
          // Conditional missing fields by type
          if (i.category === 'steel' && value !== 'Rebar') {
            u.missing_fields = u.missing_fields.filter(f => f !== 'diameter' && f !== 'grade');
          }
        }
        else if (field === 'packaging') u.specs.packaging = value;
        else if (field === 'diameter') u.specs.diameter = value;
        else if (field === 'grade') u.specs.grade = value;
        else if (field === 'size') u.specs.size = value;
        else if (field === 'specifications') u.specs.notes = value;
        u.status = u.missing_fields.length === 0 ? 'complete' : 'incomplete';
        return u;
      });
      // If item just completed, show toast
      const updated = next.find(i => i.id === itemId);
      if (updated && updated.status === 'complete') {
        setTimeout(() => {
          setToast({ title: `${itemTitle(updated)} complete`, tone: 'success', icon: 'check-circle' });
        }, 300);
      }
      setTimeout(() => continueFilling(next), 600);
      return next;
    });
  }

  // ─── Globals ───
  const GLOBAL_ORDER = ['location', 'date', 'payment', 'brand', 'attachments', 'supplier_strategy'];
  function askNextGlobal(answered) {
    const remaining = GLOBAL_ORDER.find(k => !globalRef.current[k] && !answered[k]);
    if (!remaining) {
      finalizeRFQ();
      return;
    }
    setGlobalQ(remaining);
    const q = GLOBAL_QUESTIONS[remaining];
    pushAI(q.q, 500).then(() => setRichKey('global:' + remaining));
  }
  function applyGlobal(key, value, label) {
    pushUser(label);
    setGlobal(g => {
      const next = { ...g, [key]: label };
      setTimeout(() => askNextGlobal(next), 600);
      return next;
    });
  }

  // ─── Finalize / Created / Quotes ───
  function finalizeRFQ() {
    setPhase('summary');
    pushAI("Here's the complete RFQ. Review and create.", 500).then(() => setRichKey('summary'));
  }
  function createRFQ() {
    pushUser("Create RFQ");
    setToast({ title: 'RFQ-10245 created', body: 'Sent to matching sellers', tone: 'success', icon: 'check-circle' });
    pushAI("RFQ created. Matching sellers now…", 500).then(() => {
      setPhase('created');
      setRichKey('matching');
    });
  }
  function onMatchingDone() {
    setTimeout(() => {
      setToast({ title: '3 quotes received', body: 'Tap to compare', tone: 'success', icon: 'inbox' });
      pushAI("**3 quotes received.** I scored them — **Gulf Build Materials** is best overall.", 500).then(() => {
        setPhase('quotes');
        setRichKey('quotes');
      });
    }, 600);
  }
  function quotesAction(action) {
    pushUser({ compare: 'Compare quotes', negotiate: 'Negotiate', select: 'Select supplier' }[action]);
    if (action === 'compare') { pushAI("Side-by-side. AI rec is highlighted.", 500).then(() => setRichKey('compare')); }
    else if (action === 'negotiate') { pushAI("What should I negotiate with **Gulf Build Materials**?", 500).then(() => setRichKey('negotiate-pick')); }
    else { pushAI("Pick the supplier you want to proceed with.", 500).then(() => setRichKey('supplier-pick')); }
  }
  function negotiatePick(label) {
    pushUser(label);
    pushAI("Here's the message I'll send. Edit if you'd like.", 500).then(() => setRichKey('negotiate-draft'));
  }
  function negotiateSend() {
    pushUser("Send negotiation");
    pushAI("Sent.", 400);
    setTimeout(() => {
      setToast({ title: 'Counter-offer in', body: 'Gulf Build Materials replied', tone: 'success', icon: 'message-square' });
      pushAI("**Update:** Gulf Build came back with **AED 13.10/bag** + free unloading. New total: **AED 26,200**.", 700)
        .then(() => setRichKey('post-negotiate'));
    }, 1800);
  }
  function pickSupplier(seller) {
    setSelectedSeller(seller);
    pushUser(seller.name);
    pushAI(`Going with **${seller.name}**. Let me grab the order details.`, 500).then(() => {
      setPhase('order');
      setRichKey('order:po');
    });
  }
  function orderField(key, value, label) {
    pushUser(label);
    setGlobal(g => ({ ...g, ['order_' + key]: label }));
    setTimeout(() => {
      const next = { po: 'order:contact', contact: 'order:time', time: 'order:access', access: 'order:summary' }[key];
      if (next) {
        const qs = {
          'order:contact': "Who's the site contact?",
          'order:time': "Preferred delivery time?",
          'order:access': "Any site access instructions?",
          'order:summary': "Order ready. Confirm to lock it in.",
        };
        pushAI(qs[next], 500).then(() => setRichKey(next));
      }
    }, 500);
  }
  function confirmOrder() {
    pushUser("Confirm order");
    setConfetti(true);
    setToast({ title: 'Order PO-44218 confirmed', body: 'Gulf Build Materials notified', tone: 'success', icon: 'party-popper' });
    setTimeout(() => setConfetti(false), 2400);
    pushAI("**PO-44218 confirmed.** I'll watch the delivery.", 500).then(() => {
      setPhase('tracking');
      setRichKey('tracking');
    });
  }
  function deliveredCheck(label, ok) {
    pushUser(label);
    if (ok) {
      pushAI("Marked complete. Invoice logged. Want me to set up a recurring RFQ?", 500).then(() => setRichKey('done-ok'));
    } else {
      pushAI("Flagged with the seller. You'll hear back within 4 hours.", 500).then(() => setRichKey('done-issue'));
    }
  }

  function reset() {
    setItems([]); setGlobal({}); setMessages([]);
    setActiveItemId(null); setActiveField(null);
    setPhase('welcome'); setRichKey(null);
    setSelectedSeller(null);
    setTimeout(() => {
      setMessages([{ kind: 'ai', text: "Hi — I'm your sourcing assistant. Tell me what you need and I'll structure the RFQ for you.", id: rid() }]);
    }, 100);
  }

  // ─── Freeform handler ───
  async function handleFreeform(text) {
    if (phase === 'welcome') {
      // First message is parsed
      parseRequest(text);
      return;
    }
    if (phase === 'filling' && activeItemId && activeField) {
      // Try to use the user's text as an answer to the active field
      const item = items.find(i => i.id === activeItemId);
      if (activeField === 'quantity') {
        const m = text.match(/(\d+)\s*([a-zA-Z²³]+)?/);
        if (m) {
          const qty = parseInt(m[1], 10);
          const unit = (m[2] || (item.unit || 'pieces')).toLowerCase();
          applyFieldValue(activeItemId, 'quantity', { quantity: qty, unit }, `${qty} ${unit}`);
          return;
        }
      }
      applyFieldValue(activeItemId, activeField, text, text);
      return;
    }
    // Generic AI reply
    pushUser(text);
    setTyping(true);
    try {
      const reply = await window.claude.complete(`You are a procurement-aware AI assistant. The user said: "${text}". Respond in 1 short, professional sentence.`);
      setTyping(false);
      setMessages(m => [...m, { kind: 'ai', text: reply.trim(), id: rid() }]);
    } catch (e) {
      setTyping(false);
      setMessages(m => [...m, { kind: 'ai', text: "Got it — noted.", id: rid() }]);
    }
  }

  // ─── Render rich UI based on richKey ───
  function renderRich() {
    if (!richKey) return null;

    if (richKey === 'parsed-items') {
      return <div style={{ paddingLeft: 36 }}><ParsedItemsCard items={items} /></div>;
    }
    if (richKey.startsWith('field:')) {
      const [, itemId, field] = richKey.split(':');
      const item = items.find(i => i.id === itemId);
      if (!item) return null;
      const prompts = ITEM_FIELD_PROMPTS[item.category] || ITEM_FIELD_PROMPTS.generic;
      const prompt = prompts[field] || ITEM_FIELD_PROMPTS.generic[field] || ITEM_FIELD_PROMPTS.generic.specifications;
      if (prompt.kind === 'quantity') {
        return <div style={{ paddingLeft: 36 }}>
          <QuantityPrompt units={prompt.units}
            onSubmit={v => applyFieldValue(itemId, field, v, v.label)} />
        </div>;
      }
      if (prompt.kind === 'text') {
        return (
          <div style={{ paddingLeft: 36 }}>
            <input placeholder={prompt.placeholder}
              onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) {
                applyFieldValue(itemId, field, e.target.value.trim(), e.target.value.trim());
              }}}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12,
                border: '1px solid #E2DEEF', fontFamily: 'inherit', fontSize: 13,
                background: '#fff', boxSizing: 'border-box' }}/>
          </div>
        );
      }
      // options
      return <OptionRow options={prompt.opts}
        onPick={o => applyFieldValue(itemId, field, o.id, o.label)} density={tweaks.density} />;
    }
    if (richKey.startsWith('global:')) {
      const key = richKey.split(':')[1];
      const q = GLOBAL_QUESTIONS[key];
      if (q.kind === 'location') {
        return <div style={{ paddingLeft: 36 }}>
          <LocationInput quickCities={q.quickCities}
            onSubmit={v => applyGlobal(key, v, v.label)} />
        </div>;
      }
      return <OptionRow options={q.opts} onPick={o => applyGlobal(key, o.id, o.label)} density={tweaks.density} />;
    }
    if (richKey === 'summary') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <MultiItemSummary items={items} global={global} />
          <OptionRow options={[
            { id: 'create', label: 'Create RFQ', primary: true },
            { id: 'edit', label: 'Edit details' },
          ]} onPick={o => o.id === 'create' ? createRFQ() :
              pushAI("Tap any item in the RFQ Items panel to edit it, or tell me what to change.", 400)
            } density={tweaks.density} />
        </div>
      );
    }
    if (richKey === 'matching') {
      return <div style={{ paddingLeft: 36 }}><SellerMatching onComplete={onMatchingDone} /></div>;
    }
    if (richKey === 'quotes') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          {SELLERS.map(s => <QuoteCard key={s.id} seller={s} isRecommended={s.tone === 'purple'} />)}
          <OptionRow options={[
            { id: 'compare', label: 'Compare quotes', primary: true },
            { id: 'negotiate', label: 'Negotiate' },
            { id: 'select', label: 'Select supplier' },
          ]} onPick={o => quotesAction(o.id)} density={tweaks.density}/>
        </div>
      );
    }
    if (richKey === 'compare') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <CompareTable sellers={SELLERS} />
          <OptionRow options={[
            { id: 'negotiate', label: 'Negotiate', primary: true },
            { id: 'select', label: 'Select supplier' },
          ]} onPick={o => quotesAction(o.id)} density={tweaks.density}/>
        </div>
      );
    }
    if (richKey === 'negotiate-pick') {
      return <OptionRow options={[
        { id: 'price', label: 'Lower price' },
        { id: 'delivery', label: 'Faster delivery' },
        { id: 'payment', label: 'Better payment terms' },
        { id: 'unloading', label: 'Include unloading' },
        { id: 'validity', label: 'Extend validity' },
      ]} onPick={o => negotiatePick(o.label)} density={tweaks.density}/>;
    }
    if (richKey === 'negotiate-draft') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <NegotiateDraft />
          <OptionRow options={[
            { id: 'send', label: 'Send negotiation', primary: true },
            { id: 'cancel', label: 'Cancel', muted: true },
          ]} onPick={o => o.id === 'send' ? negotiateSend() : pushAI("Cancelled.", 300)} density={tweaks.density}/>
        </div>
      );
    }
    if (richKey === 'post-negotiate') {
      return <OptionRow options={[
        { id: 'accept', label: 'Accept revised quote', primary: true, tone: 'success' },
        { id: 'select', label: 'Pick supplier manually' },
      ]} onPick={o => { pushUser(o.label); setTimeout(() => {
        setRichKey('supplier-pick');
        pushAI("Pick the supplier you want to proceed with.", 400);
      }, 200); }} density={tweaks.density}/>;
    }
    if (richKey === 'supplier-pick') {
      return <div style={{ paddingLeft: 36 }}><SupplierPicker sellers={SELLERS} onPick={pickSupplier} /></div>;
    }
    if (richKey === 'order:po') {
      return <OptionRow options={[
        { id: 'enter', label: 'Enter PO number' },
        { id: 'gen', label: 'Generate without PO', primary: true },
        { id: 'later', label: 'Add later', muted: true },
      ]} onPick={o => orderField('po', o.id, o.label)} density={tweaks.density}/>;
    }
    if (richKey === 'order:contact') {
      return <div style={{ paddingLeft: 36 }}><ContactInput onSubmit={v => orderField('contact', v, v.label)} /></div>;
    }
    if (richKey === 'order:time') {
      return <OptionRow options={[
        { id: 'morning', label: 'Morning', sub: '6 – 11 AM' },
        { id: 'afternoon', label: 'Afternoon', sub: '12 – 4 PM' },
        { id: 'evening', label: 'Evening', sub: '4 – 8 PM' },
      ]} onPick={o => orderField('time', o.id, o.label)} density={tweaks.density}/>;
    }
    if (richKey === 'order:access') {
      return <OptionRow options={[
        { id: 'none', label: 'No special instructions' },
        { id: 'gate', label: 'Gate pass required' },
        { id: 'call', label: 'Call before delivery' },
        { id: 'restrict', label: 'Loading restrictions' },
      ]} onPick={o => orderField('access', o.id, o.label)} density={tweaks.density}/>;
    }
    if (richKey === 'order:summary') {
      const sellerName = selectedSeller?.name || 'Gulf Build Materials';
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <OrderSummary
            summary={{
              po: global.order_po,
              siteContact: global.order_contact,
              deliveryTime: global.order_time,
              access: global.order_access,
            }}
            defaults={{ category: { label: 'Cement' } }}
            sellerName={sellerName}
          />
          <OptionRow options={[
            { id: 'confirm', label: 'Confirm order', primary: true },
          ]} onPick={() => confirmOrder()} density={tweaks.density}/>
        </div>
      );
    }
    if (richKey === 'tracking') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <DeliveryTimeline />
          <OptionRow options={[
            { id: 'check', label: 'Mark as delivered', primary: true },
          ]} onPick={() => {
            pushUser("Mark as delivered");
            pushAI("Has the material been delivered as expected?", 400)
              .then(() => setRichKey('delivered-check'));
          }} density={tweaks.density}/>
        </div>
      );
    }
    if (richKey === 'delivered-check') {
      return <OptionRow options={[
        { id: 'ok', label: 'Yes, delivered correctly', primary: true, tone: 'success' },
        { id: 'missing', label: 'Missing quantity', tone: 'danger' },
        { id: 'wrong', label: 'Wrong specification', tone: 'danger' },
        { id: 'damaged', label: 'Damaged', tone: 'danger' },
        { id: 'delayed', label: 'Delayed', tone: 'warning' },
        { id: 'invoice', label: 'Invoice issue', tone: 'warning' },
      ]} onPick={o => deliveredCheck(o.label, o.id === 'ok')} density={tweaks.density}/>;
    }
    if (richKey === 'done-ok' || richKey === 'done-issue') {
      return <OptionRow options={[
        { id: 'new', label: 'Start a new RFQ', primary: true },
      ]} onPick={() => reset()} density={tweaks.density}/>;
    }
    return null;
  }

  return (
    <div data-screen-label="Disty Build · RFQ Assistant" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: '#EDEAE3', fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        width: 390, height: 820, borderRadius: 50, overflow: 'hidden',
        position: 'relative', background: 'var(--bg-app)',
        boxShadow: '0 0 0 9px #141418, 0 0 0 10px #2A2A33, 0 40px 80px rgba(0,0,0,0.20)',
      }}>
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 122, height: 35, borderRadius: 22, background: '#000', zIndex: 50,
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40,
          padding: '14px 28px 0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          color: '#000', pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: '-apple-system, system-ui', fontSize: 15, fontWeight: 700 }}>9:41</span>
          <span style={{ display: 'flex', gap: 5 }}>
            <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="5" rx="0.6" fill="#000"/><rect x="4.5" y="4" width="3" height="7" rx="0.6" fill="#000"/><rect x="9" y="2" width="3" height="9" rx="0.6" fill="#000"/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill="#000"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="#000" strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill="#000"/></svg>
          </span>
        </div>

        <div style={{ paddingTop: 50, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ChatHeader2 onReset={reset} />
          <ItemsPanel items={items} activeItemId={activeItemId}
            expanded={itemsPanelOpen} onToggle={() => setItemsPanelOpen(o => !o)} />

          <div ref={scrollRef} className="chat-scroll" style={{
            flex: 1, overflowY: 'auto', padding: '14px 12px 8px',
            display: 'flex', flexDirection: 'column', gap: 6,
            background: 'var(--bg-app)', scrollBehavior: 'smooth',
          }}>
            {messages.map(m => (
              m.kind === 'ai'
                ? <AIBubble key={m.id}>{aiTextRender(m.text)}</AIBubble>
                : <UserBubble key={m.id}>{m.text}</UserBubble>
            ))}
            {typing && <Typing />}
            {richKey && !typing && (
              <div style={{ animation: 'msgIn 380ms 100ms cubic-bezier(.2,.7,.2,1) both' }}>
                {renderRich()}
              </div>
            )}
          </div>

          <Composer2 onSend={handleFreeform} disabled={typing}
            hint={phase === 'welcome' ? 'Type your full material request…' : 'Type to answer or ask…'}
            showHelper={phase === 'welcome'}
            showChips={phase === 'welcome'} />
        </div>

        <Toast2 toast={toast} onClose={() => setToast(null)} />
        <Confetti2 on={confetti} />
      </div>
    </div>
  );
}

window.SmartApp = SmartApp;
