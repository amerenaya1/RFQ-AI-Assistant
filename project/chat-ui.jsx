// chat-ui.jsx — Message bubbles, option buttons, summary panel, quote cards, etc.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Lucide icon helper ───────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 2, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      ref.current.appendChild(i);
      window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': strokeWidth, stroke: color } });
    }
  }, [name, size, color, strokeWidth]);
  return <span ref={ref} style={{ display:'inline-flex', width: size, height: size, ...style }} />;
}

// ─── Avatars ──────────────────────────────────────────────────
function AIAvatar({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #7A4CE6 0%, #521DCE 60%, #351386 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: '0 2px 6px rgba(82, 29, 206, 0.25)',
      position: 'relative',
    }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L14.2 8.2 L20.5 9.3 L15.8 13.7 L17.2 20 L12 16.6 L6.8 20 L8.2 13.7 L3.5 9.3 L9.8 8.2 Z" fill="#fff"/>
      </svg>
    </div>
  );
}

function UserAvatar({ initials = 'MA', size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1F1F24', color: '#fff',
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Message bubble ───────────────────────────────────────────
function aiTextRender(text) {
  // Tiny **bold** support
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => p.startsWith('**')
    ? <strong key={i} style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{p.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{p}</React.Fragment>);
}

function AIBubble({ children, animateIn = true }) {
  return (
    <div className="msg ai-msg" style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      marginBottom: 4,
      animation: animateIn ? 'msgIn 360ms cubic-bezier(.2,.7,.2,1) both' : 'none',
    }}>
      <AIAvatar size={28} />
      <div style={{
        maxWidth: '78%',
        background: '#fff', color: 'var(--ink-800)',
        borderRadius: '4px 16px 16px 16px',
        padding: '10px 14px',
        fontSize: 14.5, lineHeight: 1.45, fontWeight: 400,
        boxShadow: '0 1px 2px rgba(20,20,24,0.04), 0 2px 8px rgba(36,13,89,0.04)',
        border: '1px solid #ECEBEF',
      }}>{children}</div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: 'flex-end',
      marginBottom: 4,
      animation: 'msgIn 360ms cubic-bezier(.2,.7,.2,1) both',
    }}>
      <div style={{
        maxWidth: '78%',
        background: 'var(--purple-600)', color: '#fff',
        borderRadius: '16px 4px 16px 16px',
        padding: '10px 14px',
        fontSize: 14.5, lineHeight: 1.45, fontWeight: 500,
        boxShadow: '0 2px 6px rgba(82, 29, 206, 0.20)',
      }}>{children}</div>
      <UserAvatar />
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────
function Typing() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 4 }}>
      <AIAvatar size={28} />
      <div style={{
        background: '#fff', borderRadius: '4px 16px 16px 16px',
        padding: '12px 14px', display: 'flex', gap: 4, alignItems: 'center',
        border: '1px solid #ECEBEF',
        boxShadow: '0 1px 2px rgba(20,20,24,0.04)',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--purple-400)',
            animation: `typingDot 1.2s ${i * 0.16}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Option button group ──────────────────────────────────────
function OptionButton({ option, onPick, density = 'comfortable' }) {
  const [hover, setHover] = useState(false);
  const tones = {
    danger: { bg: '#FDECEC', border: '#F4B0B2', color: '#A01F22' },
    warning: { bg: '#FFF4DE', border: '#F4D58A', color: '#7A5200' },
    success: { bg: '#E6F7EE', border: '#9FDCBE', color: '#0F6F40' },
  };
  const tone = option.tone && tones[option.tone];
  const isPrimary = option.primary;
  const muted = option.muted;

  const pad = density === 'compact' ? '8px 12px' : '10px 14px';

  let style = {
    display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
    padding: pad,
    borderRadius: 12,
    border: '1px solid',
    background: '#fff', color: 'var(--ink-900)',
    borderColor: '#E2DEEF',
    fontSize: 13.5, fontWeight: 600, lineHeight: 1.2,
    cursor: 'pointer', textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 140ms ease',
    transform: hover ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hover ? '0 4px 12px rgba(82, 29, 206, 0.10)' : '0 1px 2px rgba(20,20,24,0.03)',
  };
  if (isPrimary) {
    style = { ...style, background: 'var(--purple-600)', color: '#fff', borderColor: 'var(--purple-600)' };
    if (hover) style.background = 'var(--purple-700)';
  } else if (tone) {
    style = { ...style, background: tone.bg, color: tone.color, borderColor: tone.border };
  } else if (muted) {
    style = { ...style, background: '#F7F4FE', color: 'var(--ink-600)', borderColor: '#E2DEEF' };
  } else if (hover) {
    style.borderColor = 'var(--purple-400)';
    style.background = 'var(--purple-100)';
  }

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPick(option)}
      style={style}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {option.icon && <Icon name={option.icon} size={14} />}
        {option.label}
      </span>
      {option.sub && (
        <span style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.72, marginTop: 1 }}>
          {option.sub}
        </span>
      )}
    </button>
  );
}

function OptionRow({ options, onPick, density }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: '4px 0 6px 36px',
      animation: 'msgIn 380ms 80ms cubic-bezier(.2,.7,.2,1) both',
    }}>
      {options.map(opt => (
        <OptionButton key={opt.id} option={opt} onPick={onPick} density={density} />
      ))}
    </div>
  );
}

// ─── Summary panel (sticky/collapsible) ──────────────────────────
function SummaryPanel({ summary, expanded, onToggle, density }) {
  const items = [
    { k: 'category', label: 'Category', icon: 'package' },
    { k: 'product', label: 'Product', icon: 'box' },
    { k: 'packaging', label: 'Packaging', icon: 'archive' },
    { k: 'quantity', label: 'Quantity', icon: 'hash' },
    { k: 'location', label: 'Location', icon: 'map-pin' },
    { k: 'requiredBy', label: 'Required by', icon: 'calendar' },
    { k: 'brand', label: 'Brand', icon: 'tag' },
    { k: 'urgency', label: 'Urgency', icon: 'zap' },
    { k: 'payment', label: 'Payment', icon: 'credit-card' },
    { k: 'attachments', label: 'Attachments', icon: 'paperclip' },
  ];
  const filled = items.filter(i => summary[i.k]);
  const total = items.length;
  const pct = Math.round((filled.length / total) * 100);

  return (
    <div style={{
      background: '#fff',
      borderTop: '1px solid #ECEBEF',
      borderBottom: '1px solid #ECEBEF',
      transition: 'all 200ms ease',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', border: 0, background: 'transparent',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--purple-100)', color: 'var(--purple-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="clipboard-list" size={15} color="#521DCE" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            RFQ Draft
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>
            {filled.length === 0 ? 'Empty — let\'s start' : `${filled.length} of ${total} filled`}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#ECEBEF" strokeWidth="3"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--purple-600)" strokeWidth="3"
              strokeDasharray={`${(pct/100)*87.96} 87.96`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 360ms ease' }}/>
          </svg>
          <span style={{
            position: 'absolute', fontSize: 10, fontWeight: 700,
            color: 'var(--ink-900)',
          }}>{pct}%</span>
        </div>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#5A5A66" />
      </button>

      {expanded && (
        <div style={{
          padding: '4px 16px 14px',
          animation: 'panelIn 240ms cubic-bezier(.2,.7,.2,1) both',
        }}>
          {items.map(({ k, label, icon }) => {
            const v = summary[k];
            return (
              <div key={k} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '7px 0',
                borderBottom: '1px solid #F4F4F6',
              }}>
                <Icon name={icon} size={14} color={v ? '#521DCE' : '#B7B7C0'} />
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-600)', flexShrink: 0, minWidth: 86 }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 12.5, fontWeight: 600,
                  color: v ? 'var(--ink-900)' : '#B7B7C0',
                  textAlign: 'right', flex: 1, marginLeft: 8,
                  fontStyle: v ? 'normal' : 'italic',
                }}>{v || '—'}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.Icon = Icon;
window.AIAvatar = AIAvatar;
window.UserAvatar = UserAvatar;
window.AIBubble = AIBubble;
window.UserBubble = UserBubble;
window.Typing = Typing;
window.OptionButton = OptionButton;
window.OptionRow = OptionRow;
window.SummaryPanel = SummaryPanel;
window.aiTextRender = aiTextRender;
