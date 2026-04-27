// app.jsx — Main RFQ assistant application

const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp, useMemo: useMemoApp } = React;

// ─── Toast notification ──────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffectApp(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(), toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute', top: 100, left: 12, right: 12, zIndex: 80,
      background: 'rgba(20,20,24,0.94)', color: '#fff',
      borderRadius: 14, padding: '12px 14px',
      display: 'flex', gap: 10, alignItems: 'center',
      boxShadow: '0 16px 40px rgba(20,20,24,0.4)',
      backdropFilter: 'blur(10px)',
      animation: 'toastIn 320ms cubic-bezier(.2,.7,.2,1) both',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: toast.tone === 'success' ? 'var(--success)' :
                   toast.tone === 'warning' ? 'var(--warning)' : 'var(--purple-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={toast.icon || 'bell'} size={16} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{toast.title}</div>
        {toast.body && <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 1 }}>{toast.body}</div>}
      </div>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.12)', border: 0, cursor: 'pointer',
        width: 24, height: 24, borderRadius: 6, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="x" size={12} color="#fff" />
      </button>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────
function Confetti({ trigger }) {
  if (!trigger) return null;
  const pieces = Array.from({ length: 60 });
  const colors = ['#521DCE', '#7A4CE6', '#FF8A1F', '#1FB26A', '#F4A300', '#E8383C'];
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 70,
    }}>
      {pieces.map((_, i) => {
        const c = colors[i % colors.length];
        const left = Math.random() * 100;
        const dx = (Math.random() - 0.5) * 200;
        const delay = Math.random() * 200;
        const dur = 1800 + Math.random() * 1000;
        const rot = Math.random() * 720;
        const w = 6 + Math.random() * 6;
        const h = 8 + Math.random() * 8;
        return (
          <span key={i} style={{
            position: 'absolute', top: -20, left: `${left}%`,
            width: w, height: h, background: c,
            borderRadius: i % 3 === 0 ? '50%' : 2,
            animation: `confetti ${dur}ms ${delay}ms cubic-bezier(.4,.05,.4,1) forwards`,
            transform: `translateX(${dx}px) rotate(${rot}deg)`,
            ['--dx']: `${dx}px`, ['--rot']: `${rot}deg`,
          }} />
        );
      })}
    </div>
  );
}

// ─── App header (chat header) ────────────────────────────────
function ChatHeader({ onReset }) {
  return (
    <div style={{
      padding: '14px 16px 10px',
      background: 'linear-gradient(180deg, rgba(247,244,254,1) 0%, rgba(247,244,254,0.92) 100%)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid #ECEBEF',
      display: 'flex', alignItems: 'center', gap: 10,
      position: 'relative', zIndex: 5,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #7A4CE6 0%, #521DCE 60%, #351386 100%)',
        width: 36, height: 36, borderRadius: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 4px 12px rgba(82,29,206,0.25)',
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
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>
            Sourcing Assistant
          </div>
          <span style={{
            background: 'var(--success)', width: 7, height: 7, borderRadius: '50%',
            boxShadow: '0 0 0 3px rgba(31,178,106,0.18)',
          }}/>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 500, marginTop: 1 }}>
          Al Noor Contracting · Dubai Industrial City Warehouse
        </div>
      </div>
      <button onClick={onReset} title="Reset" style={{
        width: 32, height: 32, borderRadius: 10,
        background: '#fff', border: '1px solid #ECEBEF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <Icon name="rotate-ccw" size={14} color="#5A5A66" />
      </button>
    </div>
  );
}

// ─── Composer (text input) ───────────────────────────────────
function Composer({ onSend, disabled, hint }) {
  const [text, setText] = useStateApp('');
  const [focus, setFocus] = useStateApp(false);
  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <div style={{
      padding: '8px 12px 12px',
      borderTop: '1px solid #ECEBEF',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: '#fff', borderRadius: 22,
        border: focus ? '1.5px solid var(--purple-400)' : '1px solid #E2DEEF',
        padding: '6px 6px 6px 16px',
        boxShadow: focus ? '0 4px 16px rgba(82,29,206,0.12)' : '0 1px 2px rgba(20,20,24,0.03)',
        transition: 'all 140ms ease',
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={hint || 'Or type your answer…'}
          rows={1}
          disabled={disabled}
          style={{
            flex: 1, border: 0, outline: 'none', resize: 'none',
            fontSize: 14, lineHeight: 1.4, fontFamily: 'inherit',
            background: 'transparent', color: 'var(--ink-900)',
            padding: '8px 0', maxHeight: 80,
          }}
        />
        <button onClick={submit} disabled={!text.trim() || disabled} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: text.trim() ? 'var(--purple-600)' : '#E2DEEF',
          color: '#fff', border: 0, cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 140ms',
        }}>
          <Icon name="arrow-up" size={16} color="#fff" strokeWidth={2.5} />
        </button>
      </div>
      <div style={{
        textAlign: 'center', fontSize: 10.5, color: 'var(--ink-500)',
        marginTop: 6, fontWeight: 500,
      }}>
        Powered by Disty AI · responses reviewed before sending to sellers
      </div>
    </div>
  );
}

// ─── The main app component ──────────────────────────────────
function App({ tweaksProp }) {
  const tweaks = tweaksProp || { tone: 'business', density: 'comfortable' };

  // Conversation log: [{ kind: 'ai' | 'user' | 'rich', node, ... }]
  const [messages, setMessages] = useStateApp([]);
  const [stepId, setStepId] = useStateApp('welcome');
  const [summary, setSummary] = useStateApp({});
  const [orderState, setOrderState] = useStateApp({});
  const [typing, setTyping] = useStateApp(false);
  const [pendingStep, setPendingStep] = useStateApp(null); // step revealed AFTER typing
  const [toast, setToast] = useStateApp(null);
  const [confetti, setConfetti] = useStateApp(false);
  const [selectedSeller, setSelectedSeller] = useStateApp(null);
  const [summaryOpen, setSummaryOpen] = useStateApp(false);

  const scrollRef = useRefApp(null);
  const stepIdRef = useRefApp(stepId);
  useEffectApp(() => { stepIdRef.current = stepId; }, [stepId]);

  // ─── Auto-scroll to bottom when messages or typing change ───
  useEffectApp(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, pendingStep]);

  // ─── Boot: kick off welcome step ───
  useEffectApp(() => { revealStep('welcome'); }, []);

  // ─── Tone wrapper ────────────────────────────────────────
  function applyTone(text) {
    if (tweaks.tone === 'friendly') {
      return text
        .replace(/I'm your sourcing assistant\./, "I'm Disty 👋 here to make sourcing painless.")
        .replace(/Got it\./, 'Awesome, got it.')
        .replace(/Just a few details/, 'Just a couple quick things');
    }
    if (tweaks.tone === 'expert') {
      return text
        .replace(/^Hi Mariam.*$/m, "Mariam — quick context: based on your last 6 RFQs, I've prepped likely defaults. Confirm or override.")
        .replace(/I compared them\./, "I scored them on price, lead-time, payment risk, and historical fulfillment.");
    }
    return text;
  }

  // ─── Step revealer (with typing delay) ───
  function revealStep(id, opts = {}) {
    const step = RFQ_FLOW[id];
    if (!step) return;
    setStepId(id);
    setTyping(true);
    setPendingStep(null);

    const baseDelay = opts.fast ? 200 : 600;
    setTimeout(() => {
      setTyping(false);
      const aiText = Array.isArray(step.ai) ? step.ai : [step.ai];
      const newMsgs = aiText.map(t => ({ kind: 'ai', text: applyTone(t), id: Math.random() }));
      setMessages(m => [...m, ...newMsgs]);
      setPendingStep(id);
    }, baseDelay);
  }

  // ─── Handle option pick ───
  function handlePick(option) {
    const step = RFQ_FLOW[stepIdRef.current];
    if (!step) return;
    // Push user message
    setMessages(m => [...m, { kind: 'user', text: option.label, id: Math.random() }]);
    setPendingStep(null);

    // Update summary
    const valLabel = step.overrideValue || option.label;
    if (step.summaryKey) {
      setSummary(s => ({ ...s, [step.summaryKey]: valLabel }));
    }
    if (option.id === 'cancel') {
      setTimeout(() => revealStep('welcome'), 400);
      return;
    }
    if (option.id === 'edit') {
      setTimeout(() => {
        setMessages(m => [...m, { kind: 'ai', text: "Sure — what would you like to change? Tap the RFQ Draft above to jump to a field, or tell me.", id: Math.random() }]);
        setPendingStep(stepIdRef.current);
      }, 500);
      return;
    }

    const nextId = step.next(option.id);
    setTimeout(() => {
      // Side effects per step
      if (stepIdRef.current === 'rfqSummary' && option.id === 'create') {
        setToast({ title: 'RFQ-10245 created', body: 'Sent to 6 matching sellers', tone: 'success', icon: 'check-circle' });
      }
      if (stepIdRef.current === 'orderSummary' && option.id === 'confirm') {
        setConfetti(true);
        setToast({ title: 'Order PO-44218 confirmed', body: 'Gulf Build Materials notified', tone: 'success', icon: 'party-popper' });
        setTimeout(() => setConfetti(false), 2400);
      }
      revealStep(nextId);
    }, 500);
  }

  // ─── Specialised submitters ───
  function submitForm(value, label) {
    const step = RFQ_FLOW[stepIdRef.current];
    setMessages(m => [...m, { kind: 'user', text: label, id: Math.random() }]);
    setPendingStep(null);
    if (step.summaryKey) setSummary(s => ({ ...s, [step.summaryKey]: label }));
    if (step.kind === 'order-contact' || step.kind === 'order-po') {
      setOrderState(o => ({ ...o, [step.kind]: value }));
    }
    setTimeout(() => revealStep(step.next()), 500);
  }

  function handleSupplierPick(seller) {
    setSelectedSeller(seller);
    setMessages(m => [...m, { kind: 'user', text: seller.name, id: Math.random() }]);
    setPendingStep(null);
    setTimeout(() => {
      setMessages(m => [...m, { kind: 'ai', text: `Great — going with **${seller.name}**. I'll move this to order confirmation.`, id: Math.random() }]);
      setTimeout(() => revealStep('orderPO'), 600);
    }, 400);
  }

  // ─── Freeform user input ───
  async function handleFreeform(text) {
    setMessages(m => [...m, { kind: 'user', text, id: Math.random() }]);
    setPendingStep(null);
    setTyping(true);
    try {
      const step = RFQ_FLOW[stepIdRef.current];
      const ctx = `You are a procurement-aware AI assistant inside a B2B construction marketplace called Disty Build. The user is currently being asked: "${Array.isArray(step.ai) ? step.ai.join(' ') : step.ai}". Respond in 1-2 short, professional sentences. Never invent prices or seller names. If the user's answer fits the question, acknowledge briefly and tell them you've recorded it. If it's off-topic, gently redirect. If unclear, ask one clarifying question.`;
      const reply = await window.claude.complete({
        messages: [
          { role: 'user', content: `${ctx}\n\nUser said: "${text}"` },
        ],
      });
      setTyping(false);
      setMessages(m => [...m, { kind: 'ai', text: reply.trim(), id: Math.random() }]);
      // Record under summaryKey
      if (step.summaryKey && !['rfq-summary','rfq-created','quotes','compare','negotiate-pick','negotiate-draft','supplier-pick','order-summary','tracking'].includes(step.kind)) {
        setSummary(s => ({ ...s, [step.summaryKey]: text }));
      }
      // Re-show options after a beat so they can keep going
      setTimeout(() => setPendingStep(stepIdRef.current), 300);
    } catch (e) {
      setTyping(false);
      setMessages(m => [...m, { kind: 'ai', text: "Got it — I've noted that. You can pick an option above or keep typing.", id: Math.random() }]);
      setPendingStep(stepIdRef.current);
    }
  }

  // ─── Reset ───
  function reset() {
    setMessages([]); setSummary({}); setOrderState({}); setSelectedSeller(null);
    setStepId('welcome'); setPendingStep(null); setTyping(false);
    setTimeout(() => revealStep('welcome'), 100);
  }

  // ─── Render the rich step UI for the active step ───
  const step = RFQ_FLOW[stepId];
  const showRich = pendingStep === stepId && !typing;

  function richNode() {
    if (!step || !showRich) return null;
    const opts = step.options || [];

    // Special kinds
    if (step.kind === 'options' || step.kind === 'attachments') {
      return <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />;
    }
    if (step.kind === 'options-with-input') {
      return (
        <div style={{ paddingLeft: 36 }}>
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
          <div style={{
            marginTop: 4, background: '#fff', border: '1px solid #ECEBEF',
            borderRadius: 12, padding: '4px 4px 4px 12px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <input placeholder={step.placeholder} style={{
              flex: 1, border: 0, outline: 'none', fontFamily: 'inherit',
              fontSize: 13, padding: '8px 0',
            }} onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handlePick({ id: 'custom', label: e.target.value.trim() });
              }
            }} id="brand-custom"/>
            <button onClick={() => {
              const v = document.getElementById('brand-custom').value.trim();
              if (v) handlePick({ id: 'custom', label: v });
            }} style={{
              width: 30, height: 30, borderRadius: 8, border: 0,
              background: 'var(--purple-600)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="arrow-right" size={14} color="#fff" />
            </button>
          </div>
        </div>
      );
    }
    if (step.kind === 'quantity') {
      return <div style={{ paddingLeft: 36 }}><QuantityInput onSubmit={v => submitForm(v, v.label)} /></div>;
    }
    if (step.kind === 'location') {
      return <div style={{ paddingLeft: 36 }}><LocationInput quickCities={step.quickCities} onSubmit={v => submitForm(v, v.label)} /></div>;
    }
    if (step.kind === 'date') {
      return (
        <div style={{ paddingLeft: 36 }}>
          <input type="date" defaultValue="2026-05-04" onChange={e => submitForm({ date: e.target.value }, e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #E2DEEF',
                     fontFamily: 'inherit', fontSize: 14, background: '#fff' }}/>
        </div>
      );
    }
    if (step.kind === 'rfq-summary') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <RFQSummaryCard summary={summary} defaults={DEMO_DEFAULTS} />
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'rfq-created') {
      return (
        <div style={{ paddingLeft: 36 }}>
          <SellerMatching onComplete={() => {
            setTimeout(() => {
              setToast({ title: '3 quotes received', body: 'Click to compare', tone: 'success', icon: 'inbox' });
              revealStep('quotesReceived', { fast: true });
            }, 600);
          }} />
        </div>
      );
    }
    if (step.kind === 'quotes') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          {SELLERS.map(s => <QuoteCard key={s.id} seller={s} isRecommended={s.tone === 'purple'} />)}
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'compare') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <CompareTable sellers={SELLERS} />
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'negotiate-pick') {
      return <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />;
    }
    if (step.kind === 'negotiate-draft') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <NegotiateDraft />
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'supplier-pick') {
      return <div style={{ paddingLeft: 36 }}><SupplierPicker sellers={SELLERS} onPick={handleSupplierPick} /></div>;
    }
    if (step.kind === 'order-po') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'order-contact') {
      return <div style={{ paddingLeft: 36 }}><ContactInput onSubmit={v => submitForm(v, v.label)} /></div>;
    }
    if (step.kind === 'order-summary') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <OrderSummary summary={summary} defaults={DEMO_DEFAULTS} sellerName={selectedSeller?.name || 'Gulf Build Materials'} />
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    if (step.kind === 'tracking') {
      return (
        <div style={{ paddingLeft: 36, display: 'grid', gap: 10 }}>
          <DeliveryTimeline />
          <OptionRow options={opts} onPick={handlePick} density={tweaks.density} />
        </div>
      );
    }
    return null;
  }

  // Layout sizing
  const phoneW = 390, phoneH = 820;

  return (
    <div data-screen-label="Disty Build · RFQ Assistant" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: '#EDEAE3',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        width: phoneW, height: phoneH,
        borderRadius: 50, overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg-app)',
        boxShadow: '0 0 0 9px #141418, 0 0 0 10px #2A2A33, 0 40px 80px rgba(0,0,0,0.20)',
      }}>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 122, height: 35, borderRadius: 22, background: '#000', zIndex: 50,
        }} />

        {/* Status bar */}
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

        {/* Top safe area + chat header */}
        <div style={{ paddingTop: 50, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ChatHeader onReset={reset} />

          {/* Summary panel (collapsible) */}
          <SummaryPanel summary={summary} expanded={summaryOpen} onToggle={() => setSummaryOpen(o => !o)} density={tweaks.density} />

          {/* Scrollable chat */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '14px 12px 8px',
            display: 'flex', flexDirection: 'column', gap: 6,
            background: 'var(--bg-app)',
            scrollBehavior: 'smooth',
          }} className="chat-scroll">
            {messages.map(m => (
              m.kind === 'ai'
                ? <AIBubble key={m.id}>{aiTextRender(m.text)}</AIBubble>
                : <UserBubble key={m.id}>{m.text}</UserBubble>
            ))}
            {typing && <Typing />}
            {showRich && (
              <div style={{ animation: 'msgIn 380ms 100ms cubic-bezier(.2,.7,.2,1) both' }}>
                {richNode()}
              </div>
            )}
          </div>

          {/* Composer */}
          <Composer onSend={handleFreeform} disabled={typing} hint="Or type your answer…" />
        </div>

        {/* Toasts */}
        <Toast toast={toast} onClose={() => setToast(null)} />
        {/* Confetti */}
        <Confetti trigger={confetti} />
      </div>
    </div>
  );
}

window.App = App;
