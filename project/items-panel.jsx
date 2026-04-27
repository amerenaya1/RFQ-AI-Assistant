// items-panel.jsx — Multi-item status display & related components
const { useState: useStateIP, useEffect: useEffectIP, useRef: useRefIP } = React;

function statusIcon(status) {
  if (status === 'complete') return { icon: 'check-circle-2', color: '#1FB26A', bg: '#E6F7EE' };
  return { icon: 'alert-circle', color: '#F4A300', bg: '#FFF4DE' };
}

function ItemsPanel({ items, activeItemId, expanded, onToggle, onJump }) {
  const completeCount = items.filter(i => i.status === 'complete').length;
  const total = items.length;
  return (
    <div style={{
      background: '#fff', borderTop: '1px solid #ECEBEF', borderBottom: '1px solid #ECEBEF',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', border: 0, background: 'transparent', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--purple-100)', color: 'var(--purple-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="list-checks" size={15} color="#521DCE" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            RFQ Items
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>
            {total === 0 ? 'No items yet' : `${completeCount} of ${total} complete`}
          </div>
        </div>
        {total > 0 && (
          <div style={{ display: 'flex', gap: 3 }}>
            {items.map(i => (
              <span key={i.id} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i.status === 'complete' ? 'var(--success)' : '#F4A300',
                opacity: i.id === activeItemId ? 1 : 0.5,
              }} />
            ))}
          </div>
        )}
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#5A5A66" />
      </button>
      {expanded && total > 0 && (
        <div style={{ padding: '0 12px 10px', animation: 'panelIn 240ms cubic-bezier(.2,.7,.2,1) both' }}>
          {items.map((i, idx) => {
            const s = statusIcon(i.status);
            const isActive = i.id === activeItemId;
            return (
              <button key={i.id} onClick={() => onJump && onJump(i.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                marginBottom: 4, borderRadius: 10, fontFamily: 'inherit',
                background: isActive ? 'var(--purple-100)' : '#FAF8FE',
                border: isActive ? '1px solid var(--purple-400)' : '1px solid #ECEBEF',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: s.bg,
                  color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: 11, fontWeight: 700,
                }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemTitle(i) || '(parsing…)'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-500)' }}>
                    {i.quantity ? `${i.quantity.toLocaleString()} ${i.unit || ''}` : 'qty TBD'}
                    {i.status !== 'complete' && i.missing_fields.length > 0 &&
                      ` · missing ${i.missing_fields.join(', ')}`}
                  </div>
                </div>
                <Icon name={s.icon} size={15} color={s.color} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Items confirmation card shown right after parse
function ParsedItemsCard({ items }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      border: '1px solid #ECEBEF', boxShadow: '0 2px 8px rgba(36,13,89,0.06)',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--purple-600)',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
      }}>Parsed · {items.length} item{items.length === 1 ? '' : 's'}</div>
      {items.map((i, idx) => {
        const ok = i.status === 'complete';
        return (
          <div key={i.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 9,
            padding: '8px 0',
            borderBottom: idx < items.length - 1 ? '1px solid #F4F4F6' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: ok ? 'var(--success)' : 'var(--warning-bg)',
              color: ok ? '#fff' : 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {ok ? <Icon name="check" size={12} color="#fff" strokeWidth={3} />
                  : <span style={{ fontSize: 11, fontWeight: 800 }}>{idx + 1}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>
                {itemTitle(i) || (i.category[0].toUpperCase() + i.category.slice(1))}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--ink-600)' }}>
                {i.quantity ? `${i.quantity.toLocaleString()} ${i.unit || ''}` : 'quantity TBD'}
              </div>
              {!ok && (
                <div style={{
                  fontSize: 10.5, fontWeight: 600, color: 'var(--warning)',
                  marginTop: 2, display: 'inline-flex', gap: 4, alignItems: 'center',
                }}>
                  <Icon name="alert-circle" size={11} color="#F4A300" />
                  Missing: {i.missing_fields.join(', ')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple quantity prompt (inline)
function QuantityPrompt({ units, onSubmit }) {
  const [val, setVal] = useStateIP('');
  const [unit, setUnit] = useStateIP(units[0]);
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 10,
      border: '1px solid #ECEBEF',
    }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Quantity"
          style={{ flex: 1, fontSize: 18, fontWeight: 700, color: 'var(--ink-900)',
                   border: 0, background: '#F7F4FE', borderRadius: 8, padding: '8px 12px',
                   fontFamily: 'inherit', outline: 'none' }}/>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {units.map(u => (
          <button key={u} onClick={() => setUnit(u)} style={{
            padding: '5px 10px', borderRadius: 999, border: '1px solid',
            fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: unit === u ? 'var(--purple-600)' : '#fff',
            color: unit === u ? '#fff' : 'var(--ink-700)',
            borderColor: unit === u ? 'var(--purple-600)' : '#E2DEEF',
          }}>{u}</button>
        ))}
      </div>
      <button onClick={() => val && onSubmit({ quantity: parseInt(val.replace(/[,\s]/g,''), 10), unit, label: `${val} ${unit}` })}
        style={{ width: '100%', padding: '9px', borderRadius: 10,
                 background: 'var(--purple-600)', color: '#fff', border: 0,
                 fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Continue
      </button>
    </div>
  );
}

// Multi-item RFQ summary card
function MultiItemSummary({ items, global }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #ECEBEF', boxShadow: '0 4px 14px rgba(36,13,89,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #E2DEEF',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-600)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            RFQ Draft
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginTop: 2 }}>
            {items.length} item{items.length === 1 ? '' : 's'} · {global.location || 'Location TBD'}
          </div>
        </div>
        <div style={{
          background: 'var(--purple-100)', color: 'var(--purple-700)',
          padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
        }}>READY</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Items
        </div>
        {items.map((i, idx) => (
          <div key={i.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0',
            borderBottom: idx < items.length - 1 ? '1px solid #F4F4F6' : 'none',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, background: 'var(--purple-100)',
              color: 'var(--purple-700)', fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{idx + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)' }}>
                {itemTitle(i)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-600)' }}>
                {i.quantity?.toLocaleString()} {i.unit}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        background: '#FAF8FE', padding: 10, borderRadius: 10,
      }}>
        {[
          ['Location', global.location],
          ['Required by', global.date],
          ['Payment', global.payment],
          ['Brand', global.brand],
          ['Suppliers', global.supplier_strategy],
          ['Attachments', global.attachments || 'None'],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 9.5, color: 'var(--ink-500)', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-900)', fontWeight: 600 }}>{v || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ItemsPanel = ItemsPanel;
window.ParsedItemsCard = ParsedItemsCard;
window.QuantityPrompt = QuantityPrompt;
window.MultiItemSummary = MultiItemSummary;
