// step-components.jsx — Rich step UIs: quote cards, compare table, tracking, summary, etc.

const { useState: useStateSC, useEffect: useEffectSC, useRef: useRefSC } = React;

// ─── RFQ summary card (the "send to sellers" preview) ─────────
function RFQSummaryCard({ summary, defaults }) {
  const items = [
    ['Category', summary.category || defaults.category.label],
    ['Product', summary.product || defaults.product.label],
    ['Packaging', summary.packaging || defaults.packaging.label],
    ['Quantity', summary.quantity || defaults.quantity.label],
    ['Delivery', summary.location || defaults.location.label],
    ['Required by', summary.requiredBy || defaults.requiredBy.label],
    ['Brand', summary.brand || defaults.brand.label],
    ['Payment', summary.payment || defaults.payment.label],
    ['Attachments', summary.attachments || 'None'],
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 16,
      border: '1px solid #ECEBEF',
      boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #E2DEEF',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-600)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            RFQ Draft
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginTop: 2 }}>
            Cement · Dubai
          </div>
        </div>
        <div style={{
          background: 'var(--purple-100)', color: 'var(--purple-700)',
          padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
        }}>READY</div>
      </div>
      {items.map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '7px 0', fontSize: 13,
        }}>
          <span style={{ color: 'var(--ink-600)', fontWeight: 500 }}>{k}</span>
          <span style={{ color: 'var(--ink-900)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Seller matching progress (Step 10) ──────────────────────
function SellerMatching({ onComplete }) {
  const steps = [
    { id: 1, label: 'Finding relevant sellers', count: '14 found' },
    { id: 2, label: 'Checking location coverage', count: '9 cover Dubai' },
    { id: 3, label: 'Checking stock capability', count: '6 have stock' },
    { id: 4, label: 'Sending RFQ', count: 'sent to 6' },
    { id: 5, label: 'Waiting for quotes', count: '3 quoted' },
  ];
  const [done, setDone] = useStateSC(0);
  useEffectSC(() => {
    if (done >= steps.length) { onComplete && onComplete(); return; }
    const t = setTimeout(() => setDone(d => d + 1), 700);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #ECEBEF',
      boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 10, marginBottom: 6, borderBottom: '1px dashed #E2DEEF',
      }}>
        <div style={{
          background: 'var(--success-bg)', color: 'var(--success)',
          padding: '3px 8px', borderRadius: 999,
          fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
        }}>RFQ-10245</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)' }}>
          ETA 2–6 hrs
        </div>
      </div>
      {steps.map((s, i) => {
        const isDone = i < done;
        const isActive = i === done;
        return (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: isDone ? 'var(--success)' : isActive ? 'var(--purple-100)' : '#F4F4F6',
              border: isActive ? '2px solid var(--purple-600)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 240ms',
            }}>
              {isDone && <Icon name="check" size={13} color="#fff" strokeWidth={3} />}
              {isActive && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--purple-600)',
                  animation: 'pulse 1.2s infinite ease-in-out',
                }} />
              )}
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600,
              color: isDone || isActive ? 'var(--ink-900)' : 'var(--ink-500)' }}>
              {s.label}
            </div>
            {isDone && (
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--success)' }}>
                {s.count}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Quote card ──────────────────────────────────────────────
function QuoteCard({ seller, isRecommended }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: isRecommended ? '2px solid var(--purple-600)' : '1px solid #ECEBEF',
      boxShadow: isRecommended ? '0 6px 20px rgba(82, 29, 206, 0.14)' : '0 2px 6px rgba(20,20,24,0.05)',
      position: 'relative',
    }}>
      {isRecommended && (
        <div style={{
          position: 'absolute', top: -10, left: 12,
          background: 'var(--purple-600)', color: '#fff',
          padding: '3px 8px', borderRadius: 999,
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>★ AI Pick</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: seller.tone === 'purple' ? 'var(--purple-100)' :
                     seller.tone === 'success' ? 'var(--success-bg)' :
                     'var(--warning-bg)',
          color: seller.tone === 'purple' ? 'var(--purple-700)' :
                 seller.tone === 'success' ? 'var(--success)' :
                 '#7A5200',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, flexShrink: 0,
        }}>{seller.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.2 }}>
            {seller.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>
            {seller.note}
          </div>
        </div>
        <div style={{
          background: '#FFF4DE', color: '#7A5200',
          padding: '3px 6px', borderRadius: 6,
          fontSize: 10.5, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0,
        }}>
          <Icon name="star" size={10} color="#F4A300" />
          {seller.rating}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        background: '#FAF8FE', borderRadius: 10, padding: 10, marginBottom: 8,
      }}>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Total
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.2 }}>
            AED {seller.total.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-600)', fontWeight: 500 }}>
            AED {seller.unit.toFixed(2)} / bag
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Delivery
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>
            {seller.delivery}
          </div>
          <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
            ✓ Included
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          background: '#F1EDFB', color: 'var(--purple-700)',
        }}>{seller.payment}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          background: seller.tone === 'success' ? 'var(--success-bg)' :
                     seller.tone === 'warning' ? 'var(--warning-bg)' : '#F1EDFB',
          color: seller.tone === 'success' ? 'var(--success)' :
                seller.tone === 'warning' ? '#7A5200' : 'var(--purple-700)',
        }}>{seller.badge}</span>
      </div>
    </div>
  );
}

// ─── Comparison table ────────────────────────────────────────
function CompareTable({ sellers }) {
  const rows = [
    { k: 'unit', label: 'Unit price', fmt: s => `AED ${s.unit.toFixed(2)}` },
    { k: 'total', label: 'Total', fmt: s => `AED ${s.total.toLocaleString()}`, bold: true },
    { k: 'delivery', label: 'Delivery', fmt: s => s.delivery },
    { k: 'payment', label: 'Payment', fmt: s => s.payment },
    { k: 'rating', label: 'Rating', fmt: s => `★ ${s.rating}` },
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 0,
      border: '1px solid #ECEBEF', overflow: 'hidden',
      boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr 1fr 1fr', background: '#F7F4FE' }}>
        <div></div>
        {sellers.map(s => (
          <div key={s.id} style={{
            padding: '10px 6px', textAlign: 'center',
            borderLeft: '1px solid #ECEBEF',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.2 }}>
              {s.name.split(' ')[0]}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: s.tone === 'purple' ? 'var(--purple-600)' :
                    s.tone === 'success' ? 'var(--success)' :
                    'var(--warning)',
              marginTop: 2, letterSpacing: 0.3,
            }}>{s.badge.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {rows.map(r => (
        <div key={r.k} style={{
          display: 'grid', gridTemplateColumns: '78px 1fr 1fr 1fr',
          borderTop: '1px solid #F4F4F6',
        }}>
          <div style={{
            padding: '10px 8px', fontSize: 11, fontWeight: 600,
            color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: 0.3,
          }}>{r.label}</div>
          {sellers.map(s => (
            <div key={s.id} style={{
              padding: '10px 6px', textAlign: 'center',
              fontSize: r.bold ? 13 : 12,
              fontWeight: r.bold ? 800 : 600,
              color: 'var(--ink-900)',
              borderLeft: '1px solid #ECEBEF',
            }}>{r.fmt(s)}</div>
          ))}
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr 1fr 1fr', borderTop: '1px solid #F4F4F6', background: 'var(--purple-100)' }}>
        <div style={{ padding: '8px', fontSize: 10, fontWeight: 700, color: 'var(--purple-700)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          AI rec
        </div>
        {sellers.map(s => (
          <div key={s.id} style={{
            padding: '8px 6px', textAlign: 'center', borderLeft: '1px solid rgba(82,29,206,0.10)',
          }}>
            {s.tone === 'purple' && (
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--purple-700)' }}>
                ✓ BEST OVERALL
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quantity / Location / Date / Negotiate input forms ────────
function QuantityInput({ onSubmit }) {
  const [val, setVal] = useStateSC('2,000');
  const [unit, setUnit] = useStateSC('bags');
  const units = [
    { id: 'bags', label: 'Bags' },
    { id: 'tons', label: 'Tons' },
    { id: 'pallets', label: 'Pallets' },
    { id: 'truckloads', label: 'Truckloads' },
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      border: '1px solid #ECEBEF', boxShadow: '0 2px 6px rgba(20,20,24,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{
            flex: 1, fontSize: 24, fontWeight: 800,
            color: 'var(--ink-900)', border: 0,
            background: '#F7F4FE', borderRadius: 10,
            padding: '10px 14px', fontFamily: 'inherit',
            outline: 'none', letterSpacing: -0.3,
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)' }}>
          {units.find(u => u.id === unit)?.label}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {units.map(u => (
          <button key={u.id} onClick={() => setUnit(u.id)} style={{
            padding: '6px 12px', borderRadius: 999,
            border: '1px solid', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            background: unit === u.id ? 'var(--purple-600)' : '#fff',
            color: unit === u.id ? '#fff' : 'var(--ink-700)',
            borderColor: unit === u.id ? 'var(--purple-600)' : '#E2DEEF',
          }}>{u.label}</button>
        ))}
      </div>
      <button onClick={() => onSubmit({ value: val, unit, label: `${val} ${unit}` })} style={{
        width: '100%', padding: '10px', borderRadius: 10,
        background: 'var(--purple-600)', color: '#fff',
        border: 0, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>Continue</button>
    </div>
  );
}

function LocationInput({ onSubmit, quickCities }) {
  const [city, setCity] = useStateSC('Dubai');
  const [area, setArea] = useStateSC('Dubai Industrial City');
  const [site, setSite] = useStateSC('Warehouse Block C');
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      border: '1px solid #ECEBEF', boxShadow: '0 2px 6px rgba(20,20,24,0.04)',
    }}>
      {/* Mini map */}
      <div style={{
        height: 110, background: 'linear-gradient(135deg, #EEE9FC 0%, #DED2F9 100%)',
        borderRadius: 10, marginBottom: 10, position: 'relative', overflow: 'hidden',
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(82,29,206,0.10)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M 0 60 Q 80 40, 160 70 T 320 50" fill="none" stroke="rgba(82,29,206,0.25)" strokeWidth="2"/>
          <path d="M 0 80 L 100 90 L 200 75 L 320 88" fill="none" stroke="rgba(82,29,206,0.18)" strokeWidth="1.5"/>
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -100%)',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              background: 'var(--purple-600)',
              boxShadow: '0 4px 12px rgba(82,29,206,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#fff',
                transform: 'rotate(45deg)',
              }} />
            </div>
            <div style={{
              position: 'absolute', top: 22, left: '50%',
              transform: 'translate(-50%, 0)',
              width: 12, height: 4, borderRadius: '50%',
              background: 'rgba(82,29,206,0.25)',
            }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {quickCities.map(c => (
          <button key={c} onClick={() => setCity(c)} style={{
            padding: '5px 10px', borderRadius: 999,
            border: '1px solid', fontSize: 11.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            background: city === c ? 'var(--purple-600)' : '#fff',
            color: city === c ? '#fff' : 'var(--ink-700)',
            borderColor: city === c ? 'var(--purple-600)' : '#E2DEEF',
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <input value={area} onChange={e => setArea(e.target.value)} placeholder="Area"
          style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #E2DEEF',
                   fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#FAF8FE' }}/>
        <input value={site} onChange={e => setSite(e.target.value)} placeholder="Site / project"
          style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #E2DEEF',
                   fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#FAF8FE' }}/>
      </div>
      <button onClick={() => onSubmit({ city, area, site, label: `${area}, ${city}` })} style={{
        width: '100%', padding: '10px', borderRadius: 10,
        background: 'var(--purple-600)', color: '#fff', border: 0,
        fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Continue</button>
    </div>
  );
}

function ContactInput({ onSubmit }) {
  const [name, setName] = useStateSC('Khalid Al Mansoori');
  const [phone, setPhone] = useStateSC('+971 50 234 5678');
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      border: '1px solid #ECEBEF',
    }}>
      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Site contact name"
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #E2DEEF',
                   fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#FAF8FE',
                   fontWeight: 500 }}/>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile number"
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #E2DEEF',
                   fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#FAF8FE',
                   fontWeight: 500 }}/>
      </div>
      <button onClick={() => onSubmit({ name, phone, label: `${name} · ${phone}` })} style={{
        width: '100%', padding: '10px', borderRadius: 10,
        background: 'var(--purple-600)', color: '#fff', border: 0,
        fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Continue</button>
    </div>
  );
}

function NegotiateDraft({ onSend, onCancel }) {
  const [text, setText] = useStateSC(
    "Buyer is interested in your quote but is comparing multiple offers. Can you improve the unit price while keeping delivery within 3 days and 30-day payment terms?"
  );
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      border: '1px solid #ECEBEF',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 8, marginBottom: 8, borderBottom: '1px dashed #E2DEEF',
      }}>
        <div style={{
          background: 'var(--purple-100)', color: 'var(--purple-700)',
          padding: '3px 8px', borderRadius: 6,
          fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
        }}>TO</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>
          Gulf Build Materials
        </div>
      </div>
      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={5}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: 10, borderRadius: 10, border: '1px solid #E2DEEF',
          fontSize: 13, lineHeight: 1.5, fontFamily: 'inherit',
          background: '#FAF8FE', resize: 'none', outline: 'none',
          color: 'var(--ink-800)',
        }}
      />
    </div>
  );
}

// ─── Order summary ────────────────────────────────────────────
function OrderSummary({ summary, defaults, sellerName }) {
  const items = [
    ['PO Number', summary.po || 'PO-44218 (auto)'],
    ['Site contact', summary.siteContact || 'Khalid Al Mansoori · +971 50 234 5678'],
    ['Delivery time', summary.deliveryTime || 'Morning · 6 – 11 AM'],
    ['Site access', summary.access || 'No special instructions'],
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #ECEBEF',
      boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--purple-600) 0%, var(--purple-800) 100%)',
        borderRadius: 12, padding: 12, marginBottom: 12, color: '#fff',
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.8, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Order total
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>
          AED 26,200
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.9, marginTop: 2 }}>
          {sellerName} · 2,000 bags · 3-day delivery
        </div>
      </div>
      {items.map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '7px 0', fontSize: 12.5,
          borderBottom: '1px solid #F4F4F6',
        }}>
          <span style={{ color: 'var(--ink-600)', fontWeight: 500 }}>{k}</span>
          <span style={{ color: 'var(--ink-900)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tracking timeline ───────────────────────────────────────
function DeliveryTimeline() {
  const steps = [
    { id: 1, label: 'Order confirmed', time: 'Today, 10:42 AM', state: 'done' },
    { id: 2, label: 'Seller preparing material', time: 'Today, 11:30 AM', state: 'done' },
    { id: 3, label: 'Out for delivery', time: 'Tomorrow, 7:15 AM', state: 'active', detail: 'Driver: Rajiv · ETA 2h 40m' },
    { id: 4, label: 'Delivered', time: '—', state: 'pending' },
    { id: 5, label: 'Invoice issued', time: '—', state: 'pending' },
    { id: 6, label: 'Completed', time: '—', state: 'pending' },
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #ECEBEF',
      boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          background: 'var(--success-bg)', color: 'var(--success)',
          padding: '3px 8px', borderRadius: 999,
          fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
        }}>PO-44218</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>
          Gulf Build Materials
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 2, flexShrink: 0,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: s.state === 'done' ? 'var(--success)' :
                         s.state === 'active' ? 'var(--purple-600)' : '#fff',
              border: s.state === 'pending' ? '2px solid #E2DEEF' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: s.state === 'active' ? '0 0 0 4px rgba(82,29,206,0.15)' : 'none',
            }}>
              {s.state === 'done' && <Icon name="check" size={11} color="#fff" strokeWidth={3} />}
              {s.state === 'active' && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#fff',
                  animation: 'pulse 1.5s infinite',
                }} />
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 2, flex: 1, minHeight: 24,
                background: s.state === 'done' ? 'var(--success)' : '#E2DEEF',
                marginTop: 2,
              }} />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: 12 }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: s.state === 'pending' ? 'var(--ink-500)' : 'var(--ink-900)',
            }}>{s.label}</div>
            <div style={{
              fontSize: 11.5, fontWeight: 500,
              color: s.state === 'active' ? 'var(--purple-600)' : 'var(--ink-500)',
              marginTop: 1,
            }}>{s.time}</div>
            {s.detail && (
              <div style={{
                marginTop: 6, padding: '6px 10px', borderRadius: 8,
                background: 'var(--purple-100)', color: 'var(--purple-700)',
                fontSize: 11.5, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="truck" size={12} color="#4719B3" />
                {s.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Supplier picker ─────────────────────────────────────────
function SupplierPicker({ sellers, onPick }) {
  const [hov, setHov] = useStateSC(null);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {sellers.map(s => (
        <button key={s.id}
          onMouseEnter={() => setHov(s.id)}
          onMouseLeave={() => setHov(null)}
          onClick={() => onPick(s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 10, borderRadius: 12, fontFamily: 'inherit',
            background: '#fff', cursor: 'pointer',
            border: hov === s.id ? '1px solid var(--purple-400)' : '1px solid #ECEBEF',
            boxShadow: hov === s.id ? '0 4px 12px rgba(82,29,206,0.10)' : '0 1px 2px rgba(20,20,24,0.03)',
            textAlign: 'left',
            transform: hov === s.id ? 'translateY(-1px)' : 'none',
            transition: 'all 140ms ease',
          }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: s.tone === 'purple' ? 'var(--purple-100)' :
                       s.tone === 'success' ? 'var(--success-bg)' :
                       'var(--warning-bg)',
            color: s.tone === 'purple' ? 'var(--purple-700)' :
                   s.tone === 'success' ? 'var(--success)' :
                   '#7A5200',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, flexShrink: 0,
          }}>{s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>
              {s.name}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-500)' }}>
              AED {s.total.toLocaleString()} · {s.delivery} · ★ {s.rating}
            </div>
          </div>
          <Icon name="chevron-right" size={16} color="#8A8A96" />
        </button>
      ))}
      <button onClick={() => onPick({ name: 'More quotes', id: 'more' })} style={{
        padding: 10, borderRadius: 12, background: '#F7F4FE',
        border: '1px dashed #BDA6F2', cursor: 'pointer',
        fontSize: 12.5, fontWeight: 600, color: 'var(--purple-700)',
        fontFamily: 'inherit', textAlign: 'center',
      }}>+ Ask for more quotes</button>
    </div>
  );
}

window.RFQSummaryCard = RFQSummaryCard;
window.SellerMatching = SellerMatching;
window.QuoteCard = QuoteCard;
window.CompareTable = CompareTable;
window.QuantityInput = QuantityInput;
window.LocationInput = LocationInput;
window.ContactInput = ContactInput;
window.NegotiateDraft = NegotiateDraft;
window.OrderSummary = OrderSummary;
window.DeliveryTimeline = DeliveryTimeline;
window.SupplierPicker = SupplierPicker;
