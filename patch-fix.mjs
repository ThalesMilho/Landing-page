import { readFileSync, writeFileSync } from 'fs';

const FILE = 'C:/Users/caiofaria/Documents/fubog/Landing-page/hospital-intranet/src/App.jsx';
let f = readFileSync(FILE, 'utf8');

let changed = 0;
let errors = [];

// ─── STEP 0: Diagnose blank page ─────────────────────────────────────────────
// Check for obvious JSX syntax issues introduced by previous patches
const navDropdownCount = (f.match(/function NavDropdown/g) || []).length;
if (navDropdownCount > 1) {
  console.log(`WARN: NavDropdown defined ${navDropdownCount} times — deduplicating...`);
  // Remove all but the first occurrence by splitting on the marker
  const marker = 'function NavDropdown(';
  const parts = f.split(marker);
  // Keep everything before first, then re-attach just one copy
  // We'll handle this via full replacement below
}

// ─── STEP 1: Fix user name ────────────────────────────────────────────────────
const nameFixes = [
  ['displayName: "Dr. Carlos Silva"', 'displayName: "Colaborador"'],
  ['givenName:   "Carlos"',           'givenName:   "Colaborador"'],
  ['surname:     "Silva"',            'surname:     ""'],
  ['initials:    "CS"',               'initials:    "CO"'],
];
for (const [old, neu] of nameFixes) {
  if (f.includes(old)) { f = f.replace(old, neu); changed++; }
}
console.log('Step 1 (name fix): done');

// ─── STEP 2: Fix navItems — replace the whole navItems block safely ───────────
// We look for the opening and closing of the navItems array inside Header
// Strategy: find `const navItems = [` up to the matching `];` that ends the array

const navItemsNew = `const navItems = [
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
];`;

// Find navItems block using index-based approach (safe, no regex on JSX)
const navStart = f.indexOf('const navItems = [');
if (navStart === -1) {
  errors.push('ERROR: Could not find "const navItems = [" in file');
} else {
  // Walk forward to find the closing ]; of this array
  let depth = 0;
  let inString = false;
  let strChar = '';
  let i = navStart + 'const navItems = '.length; // start at the [
  let navEnd = -1;

  for (; i < f.length; i++) {
    const ch = f[i];
    if (inString) {
      if (ch === strChar && f[i-1] !== '\\') inString = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; }
      else if (ch === '[' || ch === '{' || ch === '(') depth++;
      else if (ch === ']' || ch === '}' || ch === ')') {
        depth--;
        if (depth === 0) { navEnd = i + 1; break; }
      }
    }
  }

  if (navEnd === -1) {
    errors.push('ERROR: Could not find end of navItems array');
  } else {
    const oldNavItems = f.slice(navStart, navEnd);
    // Only replace if it doesn't already have children properly defined
    if (!f.slice(navStart, navEnd).includes('"Escalas dos Colaboradores"')) {
      f = f.slice(0, navStart) + navItemsNew + f.slice(navEnd);
      console.log('Step 2 (navItems): replaced');
      changed++;
    } else {
      console.log('Step 2 (navItems): already up to date, skipping');
    }
  }
}

// ─── STEP 3: Remove duplicate NavDropdown if present ─────────────────────────
// Remove ALL NavDropdown definitions, then add one clean one
const ndMarker = 'function NavDropdown(';
const ndCount = (f.match(/function NavDropdown\(/g) || []).length;
if (ndCount > 1) {
  // Remove all occurrences by finding and removing each one after the first
  // Strategy: find each one, walk to its closing brace, remove
  let cleaned = '';
  let remaining = f;
  let firstFound = false;
  while (true) {
    const idx = remaining.indexOf(ndMarker);
    if (idx === -1) { cleaned += remaining; break; }
    if (!firstFound) {
      // Keep this one, skip past it
      const nextIdx = remaining.indexOf(ndMarker, idx + ndMarker.length);
      if (nextIdx === -1) { cleaned += remaining; break; }
      cleaned += remaining.slice(0, nextIdx);
      remaining = remaining.slice(nextIdx);
      firstFound = true;
    } else {
      // Remove this duplicate: find its closing }
      let depth2 = 0;
      let started = false;
      let endIdx = -1;
      for (let j = idx; j < remaining.length; j++) {
        if (remaining[j] === '{') { depth2++; started = true; }
        else if (remaining[j] === '}') {
          depth2--;
          if (started && depth2 === 0) { endIdx = j + 1; break; }
        }
      }
      if (endIdx === -1) { cleaned += remaining; break; }
      cleaned += remaining.slice(0, idx);
      remaining = remaining.slice(endIdx);
    }
  }
  if (cleaned.length > 0) {
    f = cleaned;
    console.log(`Step 3 (deduplicate NavDropdown): removed ${ndCount - 1} duplicate(s)`);
    changed++;
  }
} else {
  console.log('Step 3 (deduplicate): no duplicates found');
}

// ─── STEP 4: Ensure NavDropdown component exists ──────────────────────────────
const navDropdownCode = `
function NavDropdown({ item, page, go, T }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const active = item.children
    ? item.children.some(c => c.p === page)
    : page === item.p;
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
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
          {item.children.map((child, idx) => child.external ? (
            <a key={idx} href={child.external} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"8px 16px", fontSize:13, color: T.mid,
                textDecoration:"none", whiteSpace:"nowrap",
                transition:"background 0.1s",
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
            <button key={idx}
              onClick={() => { go(child.p); setOpen(false); }}
              style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"8px 16px", fontSize:13, color: T.mid,
                background:"transparent", border:"none", cursor:"pointer",
                whiteSpace:"nowrap", transition:"background 0.1s",
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

if (!f.includes('function NavDropdown(')) {
  const insertBefore = 'function Header({ page, navigate }) {';
  const insertIdx = f.indexOf(insertBefore);
  if (insertIdx === -1) {
    errors.push('ERROR: Could not find "function Header({ page, navigate }) {" for NavDropdown insertion');
  } else {
    f = f.slice(0, insertIdx) + navDropdownCode + f.slice(insertIdx);
    console.log('Step 4 (NavDropdown): inserted');
    changed++;
  }
} else {
  console.log('Step 4 (NavDropdown): already exists');
}

// ─── STEP 5: Update nav renderer ─────────────────────────────────────────────
// Find the old renderer using a unique string anchor
const oldRendererAnchor = '{navItems.map(({ label, p, external }) => {';
const newRenderer = `{navItems.map((item, idx) => {
              if (item.external && !item.children) {
                return (
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
              }
              if (item.children) {
                return <NavDropdown key={idx} item={item} page={page} go={go} T={T} />;
              }
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

if (f.includes(oldRendererAnchor)) {
  // Find the full old renderer block: from anchor to closing })}
  const startIdx = f.indexOf(oldRendererAnchor);
  // Walk to find the })} that closes the navItems.map
  let depth3 = 0;
  let endIdx3 = -1;
  let inStr3 = false;
  let strCh3 = '';
  for (let i = startIdx; i < f.length; i++) {
    const ch = f[i];
    if (inStr3) {
      if (ch === strCh3 && f[i-1] !== '\\') inStr3 = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inStr3 = true; strCh3 = ch; }
      else if (ch === '{' || ch === '(' || ch === '[') depth3++;
      else if (ch === '}' || ch === ')' || ch === ']') {
        depth3--;
        if (depth3 < 0) { endIdx3 = i + 1; break; }
      }
    }
  }
  if (endIdx3 === -1) {
    errors.push('ERROR: Could not find end of old nav renderer block');
  } else {
    f = f.slice(0, startIdx) + newRenderer + f.slice(endIdx3);
    console.log('Step 5 (nav renderer): updated');
    changed++;
  }
} else if (f.includes('NavDropdown') && f.includes('item.children')) {
  console.log('Step 5 (nav renderer): already updated, skipping');
} else {
  errors.push('ERROR: Old nav renderer not found and new one not detected either');
}

// ─── Done ─────────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.log('\n--- ERRORS ---');
  errors.forEach(e => console.log(e));
  console.log('\nDiagnostics:');
  console.log('  File length:', f.length, 'chars');
  console.log('  NavDropdown count:', (f.match(/function NavDropdown\(/g)||[]).length);
  console.log('  navItems found:', f.includes('const navItems = ['));
  console.log('  Header found:', f.includes('function Header({ page, navigate }) {'));
  console.log('  Old renderer found:', f.includes(oldRendererAnchor));
  process.exit(1);
}

writeFileSync(FILE, f, 'utf8');
console.log(`\n✅ SUCCESS! ${changed} change(s) applied.`);
console.log('Run: npm run dev');
