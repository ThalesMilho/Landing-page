import { readFileSync, writeFileSync } from 'fs';

const FILE = 'C:/Users/caiofaria/Documents/fubog/Landing-page/hospital-intranet/src/App.jsx';
let f = readFileSync(FILE, 'utf8');

// Normalize to LF so string matching works regardless of CRLF/LF
const wasCRLF = f.includes('\r\n');
f = f.replace(/\r\n/g, '\n');

// ── STEP 1: Name fix ──────────────────────────────────────────────────────────
[
  ['displayName: "Dr. Carlos Silva"', 'displayName: "Colaborador"'],
  ['givenName:   "Carlos"',           'givenName:   "Colaborador"'],
  ['surname:     "Silva"',            'surname:     ""'],
  ['initials:    "CS"',               'initials:    "CO"'],
].forEach(([o, n]) => { if (f.includes(o)) f = f.replace(o, n); });
console.log('Step 1 (name): done');

// ── STEP 2: navItems ──────────────────────────────────────────────────────────
const OLD_NAV_OPEN = 'const navItems = [';
const navStart = f.indexOf(OLD_NAV_OPEN);
let depth = 0, inStr = false, strCh = '', navEnd = -1;
for (let i = navStart + OLD_NAV_OPEN.length - 1; i < f.length; i++) {
  const c = f[i];
  if (inStr) { if (c === strCh && f[i-1] !== '\\') inStr = false; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
  if (c === '[' || c === '{') depth++;
  else if (c === ']' || c === '}') { depth--; if (depth === 0) { navEnd = i + 1; break; } }
}
if (navStart === -1 || navEnd === -1) { console.error('ERROR: navItems not found'); process.exit(1); }

const NEW_NAV = `const navItems = [
  { label:"Início", p:"home" },
  { label:"Gente e Gestão", p:"rh", children:[
    { label:"Escalas dos Colaboradores", p:"rh", tab:"escalas" },
    { label:"Ações do Mês", p:"rh", tab:"acoes" },
    { label:"Lista de Treinamentos", p:"rh", tab:"treinamentos" },
    { label:"Contatos RH/DP/SESMT", p:"rh", tab:"contatos" },
    { label:"Aniversariantes do Mês", p:"rh", tab:"aniversariantes" },
  ]},
  { label:"Qualidade e Segurança", p:"qualidade", children:[
    { label:"Indicadores", p:"qualidade", tab:"indicadores" },
    { label:"Documentos da Qualidade", p:"qualidade", tab:"protocolos" },
    { label:"Formulários", p:"qualidade", tab:"formularios" },
  ]},
  { label:"Procedimentos e Ramais", p:"ramais", children:[
    { label:"Catálogo de Ramais", external:"https://docs.google.com/spreadsheets/d/1DmqEfls0WleuTSe4UtiU5RTno5dQG6TIMINAxYApCzw/edit?gid=0#gid=0" },
    { label:"Procedimentos (POPs)", p:"procedimentos" },
  ]},
  { label:"Canais FUBOG", p:"canais", children:[
    { label:"Canal de Gente e Gestão", p:"canais" },
    { label:"Canal NPS", p:"canais" },
    { label:"Canal de Compliance", external:"https://docs.google.com/forms/d/e/1FAIpQLSeCFr7s2mJzOa6VII2PqihBuImj1v2dSmBK8EskPYC8AgKuGg/viewform" },
  ]},
  { label:"Suporte T.I.", p:"suporte", external:"http://ares/front/central.php" },
]`;

f = f.slice(0, navStart) + NEW_NAV + f.slice(navEnd);
console.log('Step 2 (navItems): done');

// ── STEP 3: NavDropdown component ─────────────────────────────────────────────
const HEADER_MARKER = 'function Header({ page, navigate }) {';
if (!f.includes('function NavDropdown(')) {
  const idx = f.indexOf(HEADER_MARKER);
  if (idx === -1) { console.error('ERROR: Header marker not found'); process.exit(1); }
  const DROPDOWN = `function NavDropdown({ item, page, go, T }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  const active = item.children ? item.children.some(c => c.p === page) : page === item.p;
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button onClick={() => setOpen(o => !o)}
        className={active ? "" : "nav-btn"}
        style={{
          padding:"7px 13px", fontSize:13, fontWeight: active ? 600 : 500,
          color: active ? "#fff" : T.mid,
          background: active ? T.blue : "transparent",
          borderRadius:7, border:"none", cursor:"pointer",
          transition:"all 0.15s", whiteSpace:"nowrap",
          display:"inline-flex", alignItems:"center", gap:4,
        }}>
        {item.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity:0.7, transition:"transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"100%", left:0, marginTop:4, minWidth:200,
          background:"#fff", borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
          border:"1px solid #e5e7eb", zIndex:1000, padding:"4px 0",
        }}>
          {item.children.map((child, ci) => child.external ? (
            <a key={ci} href={child.external} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"8px 16px", fontSize:13, color:T.mid,
                textDecoration:"none", whiteSpace:"nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              {child.label}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.4}}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
          ) : (
            <button key={ci} onClick={() => { go(child.p); setOpen(false); }}
              style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"8px 16px", fontSize:13, color:T.mid,
                background:"transparent", border:"none", cursor:"pointer", whiteSpace:"nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

`;
  f = f.slice(0, idx) + DROPDOWN + f.slice(idx);
  console.log('Step 3 (NavDropdown): inserted');
} else {
  console.log('Step 3 (NavDropdown): already exists, skipping');
}

// ── STEP 4: Replace old renderer using indexOf + slice (no string literal match) ──
// Find the exact start by anchor, find exact end by another anchor
const START_ANCHOR = '            {navItems.map(({ label, p, external }) => {';
const END_ANCHOR   = '            })}';
const AFTER_END    = '\n          </nav>';

const rStart = f.indexOf(START_ANCHOR);
if (rStart === -1) { console.error('ERROR: renderer start anchor not found'); process.exit(1); }

// Find the END_ANCHOR after rStart
const rEnd = f.indexOf(END_ANCHOR, rStart);
if (rEnd === -1) { console.error('ERROR: renderer end anchor not found'); process.exit(1); }

const rEndFull = rEnd + END_ANCHOR.length;

const NEW_RENDERER = `            {navItems.map((item, idx) => {
              if (item.external && !item.children) return (
                <a key={idx} href={item.external} target="_blank" rel="noopener noreferrer"
                  className="nav-btn"
                  style={{
                    padding:"7px 13px", fontSize:13, fontWeight:500,
                    color:T.mid, background:"transparent",
                    borderRadius:7, cursor:"pointer",
                    transition:"all 0.15s", whiteSpace:"nowrap",
                    textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5,
                  }}>
                  {item.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              );
              if (item.children) return <NavDropdown key={idx} item={item} page={page} go={go} T={T} />;
              const active = page === item.p;
              return (
                <button key={idx} onClick={() => go(item.p)}
                  className={active ? "" : "nav-btn"}
                  style={{
                    padding:"7px 13px", fontSize:13, fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : T.mid,
                    background: active ? T.blue : "transparent",
                    borderRadius:7, border:"none", cursor:"pointer",
                    transition:"all 0.15s", whiteSpace:"nowrap",
                  }}>{item.label}
                </button>
              );
            })}`;

f = f.slice(0, rStart) + NEW_RENDERER + f.slice(rEndFull);
console.log('Step 4 (renderer): done');

// ── Restore line endings if file was CRLF ─────────────────────────────────────
if (wasCRLF) f = f.replace(/\n/g, '\r\n');

writeFileSync(FILE, f, 'utf8');
console.log('\n✅ SUCCESS! Run: npm run dev');
