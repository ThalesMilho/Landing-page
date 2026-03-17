const fs = require('fs');
let src = fs.readFileSync('src/App.jsx', 'utf8');

// Normalize line endings to \n for matching, restore \r\n at end
const hasCRLF = src.includes('\r\n');
if (hasCRLF) src = src.replace(/\r\n/g, '\n');

// ── 1. Escalas mock docs ──────────────────────────────────────
if (!src.includes('"escalas"')) {
  src = src.replace(
    `  suporte: [`,
    `  escalas: [\n    { id:1, name:"Escala Médica — Abril 2025.pdf",       size:120000, cat:"Escalas", date:"01/04/2025", author:"RH" },\n    { id:2, name:"Escalas Médicas — Março 2025.pdf",     size:118000, cat:"Escalas", date:"01/03/2025", author:"RH" },\n    { id:3, name:"Escalas Recepção — Abril 2025.pdf",    size:95000,  cat:"Escalas", date:"01/04/2025", author:"RH" },\n    { id:4, name:"Escalas Enfermeiros — Abril 2025.pdf", size:110000, cat:"Escalas", date:"01/04/2025", author:"RH" },\n  ],\n  suporte: [`
  );
  console.log('Escalas docs: OK');
} else {
  console.log('Escalas docs: already present');
}

// ── 2. RHPage — add Escalas tab + birthday button ─────────────
src = src.replace(
  /\/\/ ── The three module pages ─+\nfunction RHPage\(\{ navigate \}\) \{\n  return <ModulePage navigate=\{navigate\} moduleKey="rh" title="Recursos Humanos"\n    icon=\{<ICONS\.Users s=\{22\}\/>\} accentColor="#7c3aed" accentBg="#f5f3ff"\n    canEdit=\{can\.editRH\}\n    tabs=\{\[([\s\S]*?)\]\}\n  \/>;\n\}/,
  (match, tabsContent) => {
    return `// ── Birthday modal ───────────────────────────────────────────
const ANIVERSARIANTES = [
  { name:"Ana Paula Souza",     dept:"Enfermagem",    day:3  },
  { name:"Carlos Eduardo Lima", dept:"Recepção",      day:7  },
  { name:"Fernanda Oliveira",   dept:"Clínica Geral", day:11 },
  { name:"Ricardo Santos",      dept:"Farmácia",      day:15 },
  { name:"Juliana Costa",       dept:"T.I.",          day:22 },
  { name:"Marcos Pereira",      dept:"Laboratório",   day:28 },
];
function BirthdayModal({ onClose }) {
  const month = new Date().toLocaleString('pt-BR', { month:'long' });
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(0,0,0,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={onClose}>
      <div style={{
        background:T.white, borderRadius:16, padding:"24px",
        maxWidth:420, width:"100%",
        boxShadow:"0 16px 48px rgba(0,0,0,0.18)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:26 }}>🎂</span>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:T.dark }}>Aniversariantes</div>
              <div style={{ fontSize:12, color:T.muted, textTransform:"capitalize" }}>{month}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:8, border:\`1px solid \${T.border}\`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"none", cursor:"pointer", color:T.muted,
          }}><ICONS.Close s={14}/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {ANIVERSARIANTES.map((p,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 12px", borderRadius:10,
              background:T.blueLight, border:\`1px solid \${T.blue}22\`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:"50%", flexShrink:0,
                background:\`linear-gradient(135deg,\${T.blue},\${T.blueMid})\`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:13, fontWeight:700,
              }}>{p.name.charAt(0)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{p.name}</div>
                <div style={{ fontSize:11, color:T.muted }}>{p.dept}</div>
              </div>
              <div style={{
                fontSize:12, fontWeight:700, color:T.blue,
                background:T.white, borderRadius:8,
                padding:"4px 10px", border:\`1px solid \${T.blue}33\`,
              }}>Dia {p.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── The three module pages ────────────────────────────────────
function RHPage({ navigate }) {
  const [showBirthday, setShowBirthday] = useState(false);
  return (
    <>
      {showBirthday && <BirthdayModal onClose={() => setShowBirthday(false)}/>}
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", top:16, right:32, zIndex:10 }}>
          <button onClick={() => setShowBirthday(true)} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"9px 16px", borderRadius:9,
            background:"#fff7ed", border:"1.5px solid #fb923c",
            color:"#ea580c", fontSize:13, fontWeight:600, cursor:"pointer",
            transition:"all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#ffedd5"}
            onMouseLeave={e => e.currentTarget.style.background="#fff7ed"}
          >🎂 Aniversariantes do Mês</button>
        </div>
        <ModulePage navigate={navigate} moduleKey="rh" title="Recursos Humanos"
    icon={<ICONS.Users s={22}/>} accentColor="#7c3aed" accentBg="#f5f3ff"
    canEdit={can.editRH}
    tabs={[${tabsContent}
      { key:"escalas", label:"Escalas", docCat:"Escalas", icon:<Si d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/> },
    ]}
  />
      </div>
    </>
  );
}`;
  }
);
console.log('RHPage:', src.includes('ANIVERSARIANTES') ? 'OK' : 'FAILED');

// ── 3. QualidadePage — add Drive button ───────────────────────
src = src.replace(
  /function QualidadePage\(\{ navigate \}\) \{\n  return <ModulePage navigate=\{navigate\} moduleKey="qualidade"/,
  `function QualidadePage({ navigate }) {
  return (
    <>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"20px 32px 0" }}>
        <a href="https://drive.google.com/placeholder" target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:10,
          padding:"12px 20px", borderRadius:10,
          background:"#f0fdf4", border:"1.5px solid #16a34a",
          color:"#15803d", fontSize:13, fontWeight:600,
          textDecoration:"none", transition:"all 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="#dcfce7"}
          onMouseLeave={e => e.currentTarget.style.background="#f0fdf4"}
        >
          📁 Acessar Pasta no Google Drive
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.6}}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
      <ModulePage navigate={navigate} moduleKey="qualidade"`
);

// Close the QualidadePage fragment — find its closing />; and add </>
src = src.replace(
  /(<ModulePage navigate=\{navigate\} moduleKey="qualidade"[\s\S]*?\/>;\n\})\n\nfunction SuportePage/,
  (match, modulePageBlock) => {
    const fixed = modulePageBlock.replace('/>;', '/>').replace(/\n\}$/, '\n    </>\n  );\n}');
    return fixed + '\n\nfunction SuportePage';
  }
);
console.log('QualidadePage:', src.includes('Google Drive') ? 'OK' : 'FAILED');

// ── 4. Call Center button ─────────────────────────────────────
src = src.replace(
  />Personalizar<\/button>\n          <\/div>/,
  `>Personalizar</button>
            <a href="https://callcenter.placeholder.com" target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex", alignItems:"center", gap:7,
              padding:"8px 16px", borderRadius:9,
              background:"#eff4ff", border:"1.5px solid #1a56db",
              color:"#1a56db", fontSize:12, fontWeight:600,
              textDecoration:"none", transition:"all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#dbeafe"}
              onMouseLeave={e => e.currentTarget.style.background="#eff4ff"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 12 19.79 19.79 0 0 1 1.1 3.38 2 2 0 0 1 3.08 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              Call Center
            </a>
          </div>`
);
console.log('Call Center:', src.includes('Call Center') ? 'OK' : 'FAILED');

// Restore CRLF if original had it
if (hasCRLF) src = src.replace(/\n/g, '\r\n');

fs.writeFileSync('src/App.jsx', src, 'utf8');
console.log('File saved.');
