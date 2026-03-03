/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  INTRANET HOSPITALAR  v3.0                                   ║
 * ║  ─ Fully responsive: 320px → 4K                              ║
 * ║  ─ Static user session (swap CURRENT_USER for real AD data)  ║
 * ║  ─ Login screen removed — auth handled by backend + MSAL    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS
// ══════════════════════════════════════════════════════════════
const T = {
  blue:        "#1a56db",
  blueDark:    "#1241a8",
  blueLight:   "#eff4ff",
  blueMid:     "#3b82f6",
  canvas:      "#f3f4f6",
  white:       "#ffffff",
  dark:        "#111827",
  mid:         "#374151",
  muted:       "#6b7280",
  faint:       "#9ca3af",
  border:      "#e5e7eb",
  borderLight: "#f9fafb",
  danger:      "#ef4444",
  success:     "#10b981",
  warn:        "#f59e0b",
};

// ══════════════════════════════════════════════════════════════
// 2. BREAKPOINT HOOK  (JS-driven responsive — no CSS guessing)
// ══════════════════════════════════════════════════════════════
function useBreakpoint() {
  const getW = () => (typeof window !== "undefined" ? window.innerWidth : 1024);
  const [w, setW] = useState(getW);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return {
    w,
    isXs:  w < 480,           // phone portrait
    isSm:  w >= 480 && w < 640, // phone landscape
    isMd:  w >= 640 && w < 768, // small tablet
    isLg:  w >= 768 && w < 1024,// tablet landscape
    isXl:  w >= 1024,           // desktop+
    isMobile:  w < 768,
    isTablet:  w >= 768 && w < 1024,
    isDesktop: w >= 1024,
  };
}

// ══════════════════════════════════════════════════════════════
// 3. STATIC USER SESSION
//    In production: replace CURRENT_USER with the object returned
//    from GET /api/v1/me after real MSAL Azure AD authentication.
// ══════════════════════════════════════════════════════════════
const CURRENT_USER = {
  displayName: "Dr. Marcelo Silva",
  givenName:   "Marcelo",
  surname:     "Silva",
  jobTitle:    "Médico Clínico",
  department:  "Clínica Geral",
  mail:        "dr.silva@hospital.com",
  initials:    "CS",
  groups:      ["Medicos", "Intranet_Users"],
  avatarColor: "linear-gradient(135deg,#1a56db,#60a5fa)",
  isAdmin:     true,
};

// ══════════════════════════════════════════════════════════════
// 4. GLOBAL STYLES
// ══════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    html { -webkit-text-size-adjust:100%; }
    body {
      font-family:'Inter',system-ui,sans-serif;
      background:${T.canvas};
      color:${T.dark};
      -webkit-font-smoothing:antialiased;
      overflow-x:hidden;
    }
    button { font-family:inherit; cursor:pointer; border:none; background:none; }
    input  { font-family:inherit; }
    /* remove blue tap flash on iOS */
    * { -webkit-tap-highlight-color:transparent; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes dotPulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .fade-up  { animation:fadeUp 0.26s ease both; }
    .fade-in  { animation:fadeIn 0.2s ease both; }
    .slide-dn { animation:slideDown 0.2s ease both; }
    .spin     { animation:spin 0.7s linear infinite; }
    .dot-pulse{ animation:dotPulse 1.8s ease-in-out infinite; }

    /* ── CARD HOVER (pointer devices only) ── */
    @media(hover:hover) {
      .dash-card:hover {
        border-color:${T.blue}33 !important;
        box-shadow:0 6px 24px rgba(26,86,219,0.12),0 2px 6px rgba(0,0,0,0.06) !important;
        transform:translateY(-2px) !important;
      }
      .dash-card:hover .acessar-lnk { color:${T.blueDark} !important; }
      .link-btn:hover { background:${T.blueLight} !important; color:${T.blue} !important; }
      .nav-btn:hover  { background:${T.blueLight} !important; color:${T.blue} !important; }
    }
    /* touch active state */
    .dash-card:active { transform:scale(0.975) !important; opacity:0.9; }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:3px; }

    /* ── SKELETON ── */
    .skeleton {
      background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
      background-size:200% 100%;
      animation:shimmer 1.4s ease-in-out infinite;
      border-radius:6px;
    }
  `}</style>
);

// ══════════════════════════════════════════════════════════════
// 5. SVG ICON SYSTEM
// ══════════════════════════════════════════════════════════════
const Ic = ({ d, size=18, sw=1.8, color="currentColor", fill="none", extra="" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink:0 }}>
    <path d={d+extra}/>
  </svg>
);

const ICONS = {
  Search:   ({s=16})=><Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={s}/>,
  Bell:     ({s=18})=><Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={s}/>,
  ChevD:    ({s=14})=><Ic d="M6 9l6 6 6-6" size={s}/>,
  Menu:     ({s=20})=><Ic d="M3 12h18M3 6h18M3 18h18" size={s}/>,
  Close:    ({s=20})=><Ic d="M18 6L6 18M6 6l12 12" size={s}/>,
  ArrowR:   ({s=14})=><Ic d="M5 12h14M12 5l7 7-7 7" size={s} sw={2}/>,
  ArrowL:   ({s=16})=><Ic d="M19 12H5M12 19l-7-7 7-7" size={s}/>,
  ChevR:    ({s=14})=><Ic d="M9 18l6-6-6-6" size={s} sw={2}/>,
  Eye:      ({s=16})=><Ic d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" size={s}/>,
  EyeOff:  ({s=16})=><Ic d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" size={s}/>,
  Settings: ({s=18})=><Ic d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" size={s}/>,
  Logout:   ({s=18})=><Ic d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={s}/>,
  Shield:   ({s=18})=><Ic d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={s}/>,
  AlertTri: ({s=15})=><Ic d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={s} color="#dc2626"/>,
  Info:     ({s=15})=><Ic d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4" size={s} color="#2563eb"/>,
  Calendar: ({s=20})=><Ic d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={s}/>,
  Users:    ({s=20})=><Ic d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={s}/>,
  Clip:     ({s=20})=><Ic d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" size={s}/>,
  Phone:    ({s=20})=><Ic d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" size={s}/>,
  Wrench:   ({s=20})=><Ic d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" size={s}/>,
  Book:     ({s=20})=><Ic d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" size={s}/>,
  User:     ({s=18})=><Ic d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={s}/>,
};

// ══════════════════════════════════════════════════════════════
// 6. LOGO
// ══════════════════════════════════════════════════════════════
const LOGO_SRC = "data:image/png;base64,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";
const LogoMark = ({ size=36 }) => (
  <img
    src={LOGO_SRC}
    alt="Logo Hospital"
    style={{
      height:size, width:"auto",
      maxWidth: size * 2.8,
      objectFit:"contain", flexShrink:0,
      display:"block",
    }}
  />
);

// ══════════════════════════════════════════════════════════════
// 7. HEADER
// ══════════════════════════════════════════════════════════════
function Header({ page, navigate }) {
  const user = CURRENT_USER;
  const isAdmin = CURRENT_USER.isAdmin;
  const { isMobile, isXs, w }     = useBreakpoint();
  const [open, setOpen]   = useState(false);
  const [uMenu, setUMenu] = useState(false);

  const go = (p) => { navigate(p); setOpen(false); setUMenu(false); };

  const navItems = [
    { label:"Início",                p:"home" },
    { label:"Qualidade e Segurança", p:"qualidade" },
    { label:"Recursos Humanos",      p:"rh" },
    { label:"Catálogo de Ramais",    p:"ramais" },
    { label:"Suporte T.I.",          p:"suporte", external:"http://ares/front/central.php" },
    ...(isAdmin ? [{ label:"Painel Admin", p:"admin" }] : []),
  ];

  const h = w < 640 ? 54 : 60;

  return (
    <header style={{
      position:"sticky", top:0, zIndex:100,
      background:T.white,
      borderBottom:`1px solid ${T.border}`,
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        maxWidth:1200, margin:"0 auto",
        padding: w < 640 ? "0 14px" : w < 1024 ? "0 24px" : "0 40px",
        height:h, display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:12,
      }}>

        {/* Logo */}
        <button onClick={() => go("home")} style={{
          display:"flex", alignItems:"center",
          gap:10, flexShrink:0, background:"none", border:"none",
          padding:"4px 0",
        }}>
          <LogoMark size={isXs ? 28 : 34}/>
          <div style={{ lineHeight:1.2 }}>
            <div style={{ fontSize: isXs ? 11 : 13, fontWeight:800, color:T.blue, letterSpacing:"0.08em" }}>
              INTRANET
            </div>
            {!isXs && (
              <div style={{ fontSize:9, fontWeight:500, color:T.muted, letterSpacing:"0.06em" }}>
                HOSPITALAR
              </div>
            )}
          </div>
        </button>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav style={{ display:"flex", gap:2, alignItems:"center" }}>
            {navItems.map(({ label, p, external }) => {
              const active = page === p;
              if (external) return (
                <a key={p} href={external} target="_blank" rel="noopener noreferrer"
                  className="nav-btn"
                  style={{
                    padding:"7px 13px", fontSize:13, fontWeight:500,
                    color:T.mid, background:"transparent",
                    borderRadius:7, cursor:"pointer",
                    transition:"all 0.15s", whiteSpace:"nowrap",
                    textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5,
                  }}>
                  {label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              );
              return (
                <button key={p} onClick={() => go(p)}
                  className={active ? "" : "nav-btn"}
                  style={{
                    padding:"7px 13px", fontSize:13, fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : T.mid,
                    background: active ? T.blue : "transparent",
                    borderRadius:7, border:"none", cursor:"pointer",
                    transition:"all 0.15s", whiteSpace:"nowrap",
                  }}>{label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right cluster */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>

          {/* Bell */}
          <button style={{
            width:36, height:36, minWidth:36, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:T.muted, border:`1px solid ${T.border}`,
            position:"relative", background:"none",
          }}>
            <ICONS.Bell s={17}/>
            <span style={{
              position:"absolute", top:8, right:9,
              width:7, height:7, borderRadius:"50%",
              background:T.danger, border:`1.5px solid ${T.white}`,
              animation:"dotPulse 2s ease-in-out infinite",
            }}/>
          </button>

          {/* User button */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setUMenu(p=>!p)} style={{
              display:"flex", alignItems:"center",
              gap:8, padding:"5px 9px 5px 6px", borderRadius:9,
              border:`1px solid ${uMenu ? T.blue : T.border}`,
              background: uMenu ? T.blueLight : T.white,
              transition:"all 0.15s",
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                background: user?.avatarColor || "linear-gradient(135deg,#1a56db,#60a5fa)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:11, fontWeight:700,
              }}>
                {user?.initials || "U"}
              </div>
              {!isXs && (
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:T.dark, lineHeight:1.3, whiteSpace:"nowrap" }}>
                    {user?.givenName} {user?.surname}
                  </div>
                  <div style={{ fontSize:10, color:T.muted, whiteSpace:"nowrap" }}>
                    {user?.department}
                  </div>
                </div>
              )}
              <ICONS.ChevD s={12}/>
            </button>

            {/* User dropdown */}
            {uMenu && (
              <div className="slide-dn" onClick={() => setUMenu(false)} style={{
                position:"absolute", top:"calc(100% + 8px)", right:0,
                background:T.white, borderRadius:12, minWidth:220,
                border:`1px solid ${T.border}`,
                boxShadow:"0 8px 24px rgba(0,0,0,0.1)",
                overflow:"hidden", zIndex:200,
              }}>
                {/* User info header */}
                <div style={{
                  padding:"14px 16px", borderBottom:`1px solid ${T.border}`,
                  background:T.blueLight,
                }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.dark }}>{user?.displayName}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{user?.mail}</div>
                  <div style={{
                    display:"inline-block", marginTop:6,
                    padding:"2px 8px", borderRadius:20,
                    background:T.blue+"22", color:T.blue,
                    fontSize:10, fontWeight:600,
                  }}>
                    {user?.jobTitle}
                  </div>
                </div>

                {[
                  { icon:<ICONS.User s={14}/>, label:"Meu Perfil" },
                  { icon:<ICONS.Settings s={14}/>, label:"Configurações" },
                  { icon:<ICONS.Shield s={14}/>, label:"Segurança do AD" },
                ].map(item => (
                  <button key={item.label} style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"11px 16px", textAlign:"left",
                    fontSize:13, color:T.mid, fontWeight:500,
                    background:"none", border:"none", cursor:"pointer",
                    transition:"background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background=T.borderLight}
                    onMouseLeave={e => e.currentTarget.style.background="none"}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}


              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button onClick={() => setOpen(p=>!p)} style={{
              width:36, height:36, minWidth:36, borderRadius:8,
              display:"flex", alignItems:"center", justifyContent:"center",
              border:`1px solid ${open ? T.blue : T.border}`,
              background: open ? T.blueLight : "none",
              color: open ? T.blue : T.mid,
              transition:"all 0.15s",
            }} aria-label="Menu" aria-expanded={open}>
              {open ? <ICONS.Close s={18}/> : <ICONS.Menu s={18}/>}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobile && open && (
        <div className="slide-dn" style={{
          background:T.white, borderTop:`1px solid ${T.border}`,
          padding:"8px 14px 14px",
        }}>
          {/* AD User info in mobile drawer */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"12px 14px", borderRadius:10, background:T.blueLight,
            marginBottom:8,
          }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background: user?.avatarColor || T.blue,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:13, fontWeight:700, flexShrink:0,
            }}>{user?.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{user?.displayName}</div>
              <div style={{ fontSize:11, color:T.muted }}>{user?.department}</div>
            </div>
          </div>

          {navItems.map(({ label, p, external }) => {
            const active = page === p;
            if (external) return (
              <a key={p} href={external} target="_blank" rel="noopener noreferrer" style={{
                display:"flex", alignItems:"center", gap:8, width:"100%",
                padding:"12px 14px", borderRadius:9, margin:"3px 0",
                background:"transparent", color:T.mid,
                fontWeight:500, fontSize:14, textDecoration:"none",
              }}>{label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.4}}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            );
            return (
              <button key={p} onClick={() => go(p)} style={{
                display:"flex", alignItems:"center", width:"100%",
                padding:"12px 14px", borderRadius:9, margin:"3px 0",
                background: active ? T.blueLight : "transparent",
                color: active ? T.blue : T.mid,
                fontWeight: active ? 600 : 500,
                fontSize:14, border:"none", cursor:"pointer",
                transition:"background 0.12s", textAlign:"left",
              }}>{label}</button>
            );
          })}


        </div>
      )}
    </header>
  );
}

// ══════════════════════════════════════════════════════════════
// 10. SEARCH BAR
// ══════════════════════════════════════════════════════════════
function SearchBar() {
  const { isXs, isSm } = useBreakpoint();
  const [focused, setFocused] = useState(false);
  const showShortcut = !isXs && !isSm;

  return (
    <div style={{ position:"relative", width:"100%", maxWidth: isXs ? "100%" : 640 }}>
      <span style={{
        position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
        color:T.faint, pointerEvents:"none", display:"flex",
      }}>
        <ICONS.Search s={15}/>
      </span>

      {showShortcut && (
        <span style={{
          position:"absolute", right:11, top:"50%", transform:"translateY(-50%)",
          background:T.borderLight, border:`1px solid ${T.border}`,
          borderRadius:5, padding:"2px 6px",
          fontSize:10, fontWeight:500, color:T.faint, whiteSpace:"nowrap",
          pointerEvents:"none",
        }}>Ctrl + K</span>
      )}

      <input
        type="text"
        placeholder={isXs ? "Buscar…" : "Buscar protocolos, ramais, colaboradores, exames..."}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%",
          padding:`11px ${showShortcut ? "72px" : "14px"} 11px 38px`,
          fontSize:14, borderRadius:9,
          border:`1.5px solid ${focused ? T.blue : T.border}`,
          background:T.white,
          boxShadow: focused ? `0 0 0 3px ${T.blue}18` : "0 1px 3px rgba(0,0,0,0.05)",
          outline:"none", color:T.dark,
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxSizing:"border-box",
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 12. DASHBOARD CARD
// ══════════════════════════════════════════════════════════════
function DashboardCard({ icon, iconBg, iconColor, title, desc, onClick }) {
  return (
    <div className="dash-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key==="Enter" && onClick?.()}
      style={{
        background:T.white, borderRadius:12, padding:"18px 16px",
        border:`1px solid ${T.border}`,
        boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
        cursor:"pointer", display:"flex", flexDirection:"column", gap:12,
        transition:"all 0.2s ease", WebkitTapHighlightColor:"transparent",
      }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{
          width:44, height:44, borderRadius:10, flexShrink:0,
          background: iconBg || T.blueLight,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: iconColor || T.blue,
        }}>
          {icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.dark, lineHeight:1.3, letterSpacing:"-0.01em" }}>
            {title}
          </div>
          <div style={{ fontSize:12, color:T.muted, marginTop:5, lineHeight:1.55 }}>
            {desc}
          </div>
        </div>
      </div>
      <button className="acessar-lnk" style={{
        display:"flex", alignItems:"center", gap:4,
        fontSize:12, fontWeight:600, color:T.blue,
        background:"none", border:"none", cursor:"pointer", padding:0,
        transition:"color 0.15s",
      }}>
        Acessar <ICONS.ArrowR s={13}/>
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 13. SIDEBAR  (Avisos + Links Úteis)
// ══════════════════════════════════════════════════════════════
function Sidebar() {
  const { w } = useBreakpoint();

  const box = {
    background:T.white, borderRadius:12, border:`1px solid ${T.border}`,
    boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden", marginBottom:16,
  };
  const sHead = {
    padding:"12px 14px 8px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  };
  const sLabel = {
    fontSize:10, fontWeight:700, letterSpacing:"0.12em",
    textTransform:"uppercase", color:T.muted,
  };

  const notices = [
    { type:"warn", icon:<ICONS.AlertTri s={14}/>, iconBg:"#fef2f2", title:"Manutenção Programada",
      desc:"Sistema de prontuários indisponível amanhã das 02h às 06h.", time:"Há 2 horas" },
    { type:"info", icon:<ICONS.Info s={14}/>, iconBg:"#eff6ff", title:"Atualização de Protocolo",
      desc:"Novo protocolo de sepse disponível na biblioteca.", time:"Ontem" },
  ];

  const links = [
    { label:"GLPI",         url:"http://ares/front/central.php" },
    { label:"Soul MV",      url:"http://2220prd.cloudmv.com.br/mvautenticador-cas/login?service=http%3A%2F%2F2220prd.cloudmv.com.br%3A80%2Fsoul-mv%2Fcas" },
    { label:"Cartão de Ponto",  url:"https://www.rhid.com.br/v2/" },
  ];

  return (
    <div>
      {/* Avisos */}
      <div style={box}>
        <div style={sHead}>
          <span style={sLabel}>Avisos</span>
          <span style={{
            width:7, height:7, borderRadius:"50%",
            background:T.danger, display:"inline-block",
            animation:"dotPulse 1.8s ease-in-out infinite",
          }}/>
        </div>
        <div style={{ padding:"0 10px 10px" }}>
          {notices.map((n,i) => (
            <div key={i} style={{
              display:"flex", gap:10, padding:"9px 6px",
              borderTop: i>0 ? `1px solid ${T.borderLight}` : "none",
            }}>
              <div style={{
                width:26, height:26, borderRadius:6, background:n.iconBg,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>
                {n.icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.dark, lineHeight:1.35 }}>{n.title}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:3, lineHeight:1.5 }}>{n.desc}</div>
                <div style={{ fontSize:10, color:T.faint, marginTop:5 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links Úteis */}
      <div style={box}>
        <div style={sHead}>
          <span style={sLabel}>Links Úteis</span>
        </div>
        <div style={{ padding:"0 10px 10px" }}>
          {links.map((l,i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
              className="link-btn"
              style={{
                display:"flex", alignItems:"center", gap:8, width:"100%",
                padding:"9px 8px", borderRadius:7, margin:"2px 0",
                fontSize:12, color:T.mid, fontWeight:500, textAlign:"left",
                background:"none", border:"none", cursor:"pointer",
                textDecoration:"none",
                transition:"background 0.12s, color 0.12s",
              }}>
              <ICONS.ChevR s={13}/> {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 14. CARDS DATA
// ══════════════════════════════════════════════════════════════
const CARDS = [

  { page:"rh",        icon:<ICONS.Users s={20}/>,    iconBg:"#f5f3ff", iconColor:"#7c3aed",
    title:"Recursos Humanos",     desc:"Benefícios, férias, folha de pagamento e documentos institucionais." },
  { page:"qualidade", icon:<ICONS.Clip s={20}/>,     iconBg:"#f0fdf4", iconColor:"#16a34a",
    title:"Qualidade e Segurança",desc:"Protocolos clínicos, indicadores de qualidade e relatórios de incidentes." },
  { page:"ramais",    icon:<ICONS.Phone s={20}/>,    iconBg:"#fff7ed", iconColor:"#ea580c",
    title:"Catálogo de Ramais",   desc:"Ramais internos, setores, bips e contatos de emergência." },
  { page:"suporte",   icon:<ICONS.Wrench s={20}/>,   iconBg:"#f8fafc", iconColor:"#475569",
    title:"Suporte T.I.",         desc:"Abertura de chamados técnicos, sistemas e infraestrutura." },
];

// ══════════════════════════════════════════════════════════════
// 15. HOME PAGE
// ══════════════════════════════════════════════════════════════
function Home({ navigate }) {
  const user = CURRENT_USER;
  const { isMobile, isDesktop, w } = useBreakpoint();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.givenName || "Dr. Silva";

  return (
    <main style={{
      maxWidth:1200, margin:"0 auto",
      padding: w < 480 ? "22px 14px 52px"
             : w < 640 ? "28px 20px 56px"
             : w < 1024 ? "36px 24px 60px"
             : "44px 40px 72px",
    }} className="fade-up">

      {/* ── HERO ROW ── */}
      <div style={{
        display:"flex",
        flexDirection:"column",
        gap:16, marginBottom:28,
      }}>
        <div style={{ flex:1, minWidth:0, maxWidth:640 }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <span style={{
              padding:"3px 9px", borderRadius:5, background:T.blueLight,
              fontSize:10, fontWeight:600, letterSpacing:"0.07em",
              textTransform:"uppercase", color:T.blue, whiteSpace:"nowrap",
            }}>Portal Interno</span>
            <span style={{ color:T.faint, fontSize:11 }}>›</span>
            <span style={{
              fontSize:10, fontWeight:600, letterSpacing:"0.07em",
              textTransform:"uppercase", color:T.muted, whiteSpace:"nowrap",
            }}>Hospital Central</span>
          </div>

          <h1 style={{
            fontSize: w < 480 ? 24 : w < 640 ? 28 : w < 1024 ? 32 : 36,
            fontWeight:800, color:T.dark, letterSpacing:"-0.03em",
            lineHeight:1.15, marginBottom:8,
          }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{
            fontSize: w < 480 ? 13 : 14,
            color:T.muted, marginBottom:22, lineHeight:1.65,
            maxWidth:480,
          }}>
            Bem-vindo ao portal intranet. Acesse rapidamente os sistemas e serviços do hospital.
          </p>

          <SearchBar/>
        </div>
      </div>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div style={{
        display:"flex",
        flexDirection: isDesktop ? "row" : "column",
        gap: isDesktop ? 28 : 20,
        alignItems:"flex-start",
      }}>

        {/* Cards column */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between", marginBottom:14,
          }}>
            <span style={{
              fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              textTransform:"uppercase", color:T.muted,
            }}>Acesso Rápido</span>
            <button style={{
              fontSize:12, fontWeight:600, color:T.blue,
              background:"none", border:"none", cursor:"pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >Personalizar</button>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns: w < 480 ? "1fr"
                                : w < 900 ? "repeat(2,1fr)"
                                : "repeat(2,1fr)",
            gap: w < 480 ? 12 : 16,
          }}>
            {CARDS.map(c => (
              <DashboardCard key={c.page} {...c} onClick={() => navigate(c.page)}/>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: isDesktop ? 268 : "100%",
          flexShrink: isDesktop ? 0 : undefined,
        }}>
          {/* On mobile/tablet, sidebar shows horizontal if space allows */}
          {!isDesktop && w >= 640 ? (
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16,
            }}>
              <Sidebar/>
            </div>
          ) : (
            <Sidebar/>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop:48, paddingTop:16,
        borderTop:`1px solid ${T.border}`,
        display:"flex", flexWrap:"wrap", gap:8,
        justifyContent:"space-between", alignItems:"center",
      }}>
        <span style={{ fontSize:11, color:T.faint }}>
          © 2025 Hospital Central · Intranet v3.0
        </span>
        <span style={{ fontSize:11, color:T.faint }}>
          Autenticado via AD · {user?.department}
        </span>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════
// 16. SHARED FILE UPLOAD ENGINE
// ══════════════════════════════════════════════════════════════

// File type configs per module
const UPLOAD_CONFIGS = {
  rh: {
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png",
    maxMb: 10,
    allowedTypes: ["application/pdf","application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg","image/png"],
    label: "PDF, Word, Excel ou Imagem",
  },
  suporte: {
    accept: ".pdf,.png,.jpg,.jpeg,.zip,.log,.txt",
    maxMb: 20,
    allowedTypes: ["application/pdf","image/png","image/jpeg",
      "application/zip","text/plain","application/x-zip-compressed"],
    label: "PDF, Imagem, ZIP ou Log (.txt)",
  },
  qualidade: {
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
    maxMb: 15,
    allowedTypes: ["application/pdf","application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    label: "PDF, Word, Excel ou PowerPoint",
  },
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}

function getFileIcon(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  const map = {
    pdf: { bg:"#fef2f2", color:"#dc2626", label:"PDF" },
    doc:  { bg:"#eff6ff", color:"#1a56db", label:"DOC" },
    docx: { bg:"#eff6ff", color:"#1a56db", label:"DOC" },
    xls:  { bg:"#f0fdf4", color:"#16a34a", label:"XLS" },
    xlsx: { bg:"#f0fdf4", color:"#16a34a", label:"XLS" },
    ppt:  { bg:"#fff7ed", color:"#ea580c", label:"PPT" },
    pptx: { bg:"#fff7ed", color:"#ea580c", label:"PPT" },
    png:  { bg:"#faf5ff", color:"#9333ea", label:"IMG" },
    jpg:  { bg:"#faf5ff", color:"#9333ea", label:"IMG" },
    jpeg: { bg:"#faf5ff", color:"#9333ea", label:"IMG" },
    zip:  { bg:"#fefce8", color:"#ca8a04", label:"ZIP" },
    txt:  { bg:"#f8fafc", color:"#475569", label:"TXT" },
    log:  { bg:"#f8fafc", color:"#475569", label:"LOG" },
  };
  return map[ext] ?? { bg:"#f3f4f6", color:"#6b7280", label:"FILE" };
}

// Reusable upload zone + file list component
function FileUploadZone({ moduleKey, uploadedFiles, setUploadedFiles }) {
  const cfg = UPLOAD_CONFIGS[moduleKey];
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors]     = useState([]);
  const inputRef = useRef();

  const validate = (file) => {
    if (!cfg.allowedTypes.includes(file.type) && file.type !== "") {
      return `"${file.name}": tipo não permitido.`;
    }
    if (file.size > cfg.maxMb * 1024 * 1024) {
      return `"${file.name}": excede ${cfg.maxMb}MB.`;
    }
    return null;
  };

  const addFiles = (fileList) => {
    const newErrors = [];
    const valid = [];
    Array.from(fileList).forEach(file => {
      const err = validate(file);
      if (err) { newErrors.push(err); return; }
      if (uploadedFiles.find(f => f.name === file.name && f.size === file.size)) return;
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading", // uploading | done | error
        progress: 0,
        file,
      });
    });
    setErrors(newErrors);
    if (!valid.length) return;

    setUploadedFiles(prev => [...prev, ...valid]);

    // Simulate upload progress per file
    valid.forEach(f => {
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 25 + 10;
        if (prog >= 100) {
          prog = 100;
          clearInterval(iv);
          setUploadedFiles(prev =>
            prev.map(pf => pf.id === f.id ? { ...pf, progress:100, status:"done" } : pf)
          );
        } else {
          setUploadedFiles(prev =>
            prev.map(pf => pf.id === f.id ? { ...pf, progress: Math.round(prog) } : pf)
          );
        }
      }, 180);
    });
  };

  const remove = (id) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const { w } = useBreakpoint();

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border:`2px dashed ${dragging ? T.blue : T.border}`,
          borderRadius:12,
          padding: w < 480 ? "28px 16px" : "36px 24px",
          textAlign:"center",
          background: dragging ? T.blueLight : T.borderLight,
          cursor:"pointer",
          transition:"all 0.2s",
          marginBottom:16,
        }}
      >
        {/* Upload cloud icon */}
        <div style={{
          width:52, height:52, borderRadius:"50%",
          background: dragging ? T.blue : T.blueLight,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 14px",
          color: dragging ? T.white : T.blue,
          transition:"all 0.2s",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </div>
        <div style={{ fontSize:14, fontWeight:600, color: dragging ? T.blue : T.dark, marginBottom:4 }}>
          {dragging ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
        </div>
        <div style={{ fontSize:12, color:T.muted }}>
          {cfg.label} · Máx. {cfg.maxMb}MB por arquivo
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={cfg.accept}
          style={{ display:"none" }}
          onChange={e => { addFiles(e.target.files); e.target.value=""; }}
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div style={{
          background:"#fef2f2", border:"1px solid #fecaca",
          borderRadius:8, padding:"10px 14px", marginBottom:12,
        }}>
          {errors.map((e,i) => (
            <div key={i} style={{ fontSize:12, color:"#dc2626", display:"flex", gap:6, alignItems:"flex-start", marginBottom: i<errors.length-1?4:0 }}>
              <span style={{ marginTop:1, flexShrink:0 }}>⚠</span> {e}
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {uploadedFiles.map(f => {
            const ic = getFileIcon(f.name);
            return (
              <div key={f.id} style={{
                background:T.white, borderRadius:10,
                border:`1px solid ${f.status==="error" ? "#fecaca" : T.border}`,
                padding:"11px 14px",
                display:"flex", alignItems:"center", gap:12,
                boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              }}>
                {/* File type badge */}
                <div style={{
                  width:38, height:38, borderRadius:8, flexShrink:0,
                  background:ic.bg, color:ic.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, fontWeight:700, letterSpacing:"0.04em",
                }}>
                  {ic.label}
                </div>

                {/* Name + progress */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontSize:13, fontWeight:600, color:T.dark,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>{f.name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    {f.status === "uploading" ? (
                      <>
                        <div style={{
                          flex:1, height:4, borderRadius:2,
                          background:T.border, overflow:"hidden",
                        }}>
                          <div style={{
                            height:"100%", borderRadius:2,
                            background:T.blue,
                            width:`${f.progress}%`,
                            transition:"width 0.2s",
                          }}/>
                        </div>
                        <span style={{ fontSize:11, color:T.muted, flexShrink:0 }}>{f.progress}%</span>
                      </>
                    ) : f.status === "done" ? (
                      <span style={{ fontSize:11, color:"#16a34a", fontWeight:600, display:"flex", gap:4, alignItems:"center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Enviado · {formatBytes(f.size)}
                      </span>
                    ) : (
                      <span style={{ fontSize:11, color:"#dc2626", fontWeight:600 }}>Erro no envio</span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button onClick={() => remove(f.id)} style={{
                  width:28, height:28, borderRadius:6, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"none", border:`1px solid ${T.border}`,
                  color:T.faint, cursor:"pointer", transition:"all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#dc2626"; e.currentTarget.style.borderColor="#fecaca"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=T.faint; e.currentTarget.style.borderColor=T.border; }}
                  title="Remover arquivo"
                >
                  <ICONS.Close s={12}/>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page shell shared by all three upload modules ─────────────
function UploadModulePage({ navigate, moduleKey, title, icon, accentColor, accentBg, categories }) {
  const { w } = useBreakpoint();
  const [activeTab, setActiveTab]       = useState(categories[0]?.key);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const doneCount = uploadedFiles.filter(f => f.status === "done").length;

  return (
    <div className="fade-up" style={{ minHeight:"calc(100vh - 60px)", background:T.canvas }}>
      <div style={{
        maxWidth:900, margin:"0 auto",
        padding: w < 480 ? "22px 14px 52px" : w < 768 ? "28px 20px 56px" : "40px 32px 64px",
      }}>

        {/* ── Page header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:28, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:48, height:48, borderRadius:13, background:accentBg,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:accentColor, flexShrink:0,
            }}>
              {icon}
            </div>
            <div>
              <h1 style={{ fontSize: w<480?18:22, fontWeight:800, color:T.dark, letterSpacing:"-0.02em", lineHeight:1.2 }}>
                {title}
              </h1>
              <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>
                Autenticado via AD · {CURRENT_USER.displayName}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("home")} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"8px 16px", borderRadius:9,
            background:T.white, border:`1px solid ${T.border}`,
            fontSize:13, fontWeight:600, color:T.mid, cursor:"pointer",
            transition:"all 0.15s", whiteSpace:"nowrap", flexShrink:0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.blue; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.mid; }}
          >
            <ICONS.ArrowL s={13}/> Início
          </button>
        </div>

        {/* ── AD Auth badge ── */}
        <div style={{
          display:"flex", alignItems:"center",
          padding:"10px 14px", borderRadius:9,
          background:"#f0fdf4", border:"1px solid #bbf7d0",
          marginBottom:24,
          flexWrap:"wrap", gap:8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize:12, color:"#15803d", fontWeight:600 }}>
            Sessão verificada via Azure AD
          </span>
          <span style={{ fontSize:12, color:"#16a34a" }}>·</span>
          <span style={{ fontSize:12, color:"#16a34a" }}>{CURRENT_USER.mail}</span>
          {doneCount > 0 && (
            <>
              <span style={{ fontSize:12, color:"#16a34a" }}>·</span>
              <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>
                {doneCount} arquivo{doneCount>1?"s":""} enviado{doneCount>1?"s":""}
              </span>
            </>
          )}
        </div>

        {/* ── Two-column layout on wider screens ── */}
        <div style={{
          display:"flex",
          flexDirection: w >= 768 ? "row" : "column",
          gap:20, alignItems:"flex-start",
        }}>

          {/* Left: Category tabs */}
          <div style={{
            width: w >= 768 ? 200 : "100%",
            flexShrink:0,
          }}>
            <div style={{
              background:T.white, borderRadius:12,
              border:`1px solid ${T.border}`,
              overflow:"hidden",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                padding:"10px 12px 6px",
                fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                textTransform:"uppercase", color:T.faint,
              }}>
                Categorias
              </div>
              {categories.map(cat => {
                const active = activeTab === cat.key;
                return (
                  <button key={cat.key} onClick={() => setActiveTab(cat.key)} style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"11px 14px",
                    background: active ? accentBg : "none",
                    border:"none", cursor:"pointer", textAlign:"left",
                    borderLeft:`3px solid ${active ? accentColor : "transparent"}`,
                    transition:"all 0.15s",
                  }}>
                    <span style={{ color: active ? accentColor : T.muted, display:"flex", flexShrink:0 }}>
                      {cat.icon}
                    </span>
                    <span style={{ fontSize:13, fontWeight: active ? 600 : 500, color: active ? accentColor : T.mid }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Upload panel */}
          <div style={{ flex:1, minWidth:0 }}>
            {categories.filter(c => c.key === activeTab).map(cat => (
              <div key={cat.key} style={{
                background:T.white, borderRadius:12,
                border:`1px solid ${T.border}`,
                padding: w < 480 ? "18px 16px" : "24px",
                boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ fontSize:16, fontWeight:700, color:T.dark, letterSpacing:"-0.01em" }}>
                    {cat.label}
                  </h2>
                  <p style={{ fontSize:13, color:T.muted, marginTop:4, lineHeight:1.5 }}>
                    {cat.desc}
                  </p>
                </div>

                <FileUploadZone
                  moduleKey={moduleKey}
                  uploadedFiles={uploadedFiles.filter(f => f.category === activeTab)}
                  setUploadedFiles={setUploadedFiles}
                />

                {/* Submit button — only visible when there are done files */}
                {uploadedFiles.filter(f => f.category===activeTab && f.status==="done").length > 0 && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
                    <button style={{
                      display:"inline-flex", alignItems:"center", gap:8,
                      padding:"11px 24px", borderRadius:9,
                      background:accentColor, color:"#fff",
                      fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                      transition:"opacity 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Confirmar Envio
                    </button>
                    <span style={{ fontSize:12, color:T.muted, marginLeft:12 }}>
                      Os arquivos serão registrados com sua identificação AD.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared icon helper (small inline) ────────────────────────
const Si = ({ d, s=15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
// 17. MODULE PAGES
// ══════════════════════════════════════════════════════════════

function RHPage({ navigate }) {
  return (
    <UploadModulePage
      navigate={navigate}
      moduleKey="rh"
      title="Recursos Humanos"
      icon={<ICONS.Users s={24}/>}
      accentColor="#7c3aed"
      accentBg="#f5f3ff"
      categories={[
        { key:"ferias",     label:"Férias",             icon:<Si d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>,
          desc:"Envie formulários de solicitação de férias e documentos de aprovação." },
        { key:"docs",       label:"Documentos Pessoais",icon:<Si d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/>,
          desc:"CPF, RG, comprovante de residência, certificados, diplomas." },
        { key:"folha",      label:"Folha de Pagamento", icon:<Si d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>,
          desc:"Holerites, comprovantes de pagamento e ajustes salariais." },
        { key:"beneficios", label:"Benefícios",         icon:<Si d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
          desc:"Plano de saúde, vale-transporte, vale-alimentação e outros benefícios." },
      ]}
    />
  );
}

function SuportePage({ navigate }) {
  return (
    <UploadModulePage
      navigate={navigate}
      moduleKey="suporte"
      title="Suporte T.I."
      icon={<ICONS.Wrench s={24}/>}
      accentColor="#475569"
      accentBg="#f8fafc"
      categories={[
        { key:"chamado",    label:"Abrir Chamado",      icon:<Si d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
          desc:"Anexe capturas de tela, logs ou arquivos que descrevam o problema." },
        { key:"sistema",    label:"Acesso a Sistemas",  icon:<Si d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
          desc:"Formulários de solicitação de acesso a sistemas internos." },
        { key:"equipamento",label:"Equipamentos",       icon:<Si d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18"/>,
          desc:"Nota fiscal, termo de responsabilidade e fotos de equipamentos." },
        { key:"seguranca",  label:"Segurança / Incidente",icon:<Si d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>,
          desc:"Reporte incidentes de segurança com evidências em arquivo." },
      ]}
    />
  );
}

function QualidadePage({ navigate }) {
  return (
    <UploadModulePage
      navigate={navigate}
      moduleKey="qualidade"
      title="Qualidade e Segurança"
      icon={<ICONS.Clip s={24}/>}
      accentColor="#16a34a"
      accentBg="#f0fdf4"
      categories={[
        { key:"protocolo",  label:"Protocolos",         icon:<Si d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>,
          desc:"Envie novos protocolos clínicos ou atualizações de protocolos vigentes." },
        { key:"indicador",  label:"Indicadores",        icon:<Si d="M18 20V10M12 20V4M6 20v-6"/>,
          desc:"Planilhas de indicadores de qualidade, metas e resultados." },
        { key:"incidente",  label:"Notificação de Evento",icon:<Si d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>,
          desc:"Formulários de notificação de eventos adversos e near misses." },
        { key:"auditoria",  label:"Auditorias",         icon:<Si d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>,
          desc:"Relatórios de auditoria interna, checklists e planos de ação." },
      ]}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// 18. ADMIN PANEL
// ══════════════════════════════════════════════════════════════

const ADMIN_MODULES = [
  {
    key: "qualidade-admin",
    label: "Qualidade e Segurança",
    icon: <ICONS.Clip s={20}/>,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Gestão de documentos da qualidade, protocolos e indicadores.",
    submenus: [
      { key:"rqs",       label:"RQS",                icon:<Si d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>,
        desc:"Registros de Qualidade e Segurança — envie e gerencie os RQS do hospital." },
      { key:"pops",      label:"POPs",               icon:<Si d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/>,
        desc:"Procedimentos Operacionais Padrão — upload de POPs atualizados e revisados." },
      { key:"indicadores",label:"Indicadores",       icon:<Si d="M18 20V10M12 20V4M6 20v-6"/>,
        desc:"Planilhas de indicadores de qualidade, metas e dashboards de resultado." },
      { key:"protocolos",label:"Protocolos Clínicos",icon:<Si d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
        desc:"Protocolos assistenciais — versões vigentes e em revisão." },
      { key:"incidentes",label:"Eventos & Incidentes",icon:<Si d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>,
        desc:"Notificações de eventos adversos, near misses e planos de ação." },
    ],
  },
  {
    key: "rh-admin",
    label: "Recursos Humanos",
    icon: <ICONS.Users s={20}/>,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    desc: "Gestão de documentos e processos de RH.",
    submenus: [
      { key:"contratos",  label:"Contratos",          icon:<Si d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/>,
        desc:"Contratos de trabalho, aditivos e documentos admissionais." },
      { key:"ferias-adm", label:"Férias & Escalas",   icon:<Si d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>,
        desc:"Planejamento de férias, planilhas de escala e aprovações." },
      { key:"treinamentos",label:"Treinamentos",      icon:<Si d="M22 10v6M2 10l10-5 10 5-10 5z"/>,
        desc:"Certificados, listas de presença e materiais de treinamento." },
      { key:"docs-rh",   label:"Documentos Gerais",   icon:<Si d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>,
        desc:"Circulares, comunicados internos e políticas da empresa." },
    ],
  },
];

function AdminPanel({ navigate }) {
  const { w } = useBreakpoint();
  const [activeModule, setActiveModule] = useState(ADMIN_MODULES[0].key);
  const [activeSubmenu, setActiveSubmenu] = useState(ADMIN_MODULES[0].submenus[0].key);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const currentModule = ADMIN_MODULES.find(m => m.key === activeModule);
  const currentSubmenu = currentModule?.submenus.find(s => s.key === activeSubmenu);

  const filesForSub = uploadedFiles[`${activeModule}__${activeSubmenu}`] || [];
  const setFilesForSub = (updater) => {
    setUploadedFiles(prev => {
      const key = `${activeModule}__${activeSubmenu}`;
      const current = prev[key] || [];
      const next = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [key]: next };
    });
  };

  const totalDone = Object.values(uploadedFiles).flat().filter(f => f.status === "done").length;

  // map module key to upload config key
  const uploadKey = activeModule === "qualidade-admin" ? "qualidade" : "rh";

  return (
    <div className="fade-up" style={{ minHeight:"calc(100vh - 60px)", background:T.canvas }}>
      <div style={{
        maxWidth:1100, margin:"0 auto",
        padding: w < 480 ? "20px 14px 52px" : w < 768 ? "28px 20px 56px" : "36px 32px 64px",
      }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:24, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:46, height:46, borderRadius:12,
              background:"linear-gradient(135deg,#1a56db,#7c3aed)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", flexShrink:0,
              boxShadow:"0 4px 12px rgba(26,86,219,0.3)",
            }}>
              <ICONS.Shield s={22}/>
            </div>
            <div>
              <h1 style={{ fontSize: w<480?18:22, fontWeight:800, color:T.dark, letterSpacing:"-0.02em" }}>
                Painel Administrativo
              </h1>
              <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>
                Gestão de documentos · {CURRENT_USER.displayName}
                {totalDone > 0 && <span style={{ color:"#16a34a", fontWeight:600, marginLeft:8 }}>· {totalDone} arquivo{totalDone>1?"s":""} enviado{totalDone>1?"s":""}</span>}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("home")} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"8px 16px", borderRadius:9,
            background:T.white, border:`1px solid ${T.border}`,
            fontSize:13, fontWeight:600, color:T.mid, cursor:"pointer",
            transition:"all 0.15s", flexShrink:0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.blue; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.mid; }}
          >
            <ICONS.ArrowL s={13}/> Início
          </button>
        </div>

        {/* ── AD badge ── */}
        <div style={{
          display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
          padding:"9px 14px", borderRadius:9,
          background:"#f0fdf4", border:"1px solid #bbf7d0", marginBottom:22,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize:12, color:"#15803d", fontWeight:600 }}>Acesso Admin verificado via Azure AD</span>
          <span style={{ fontSize:12, color:"#16a34a" }}>· {CURRENT_USER.mail}</span>
        </div>

        {/* ── Three-column layout: module selector | submenu | upload ── */}
        <div style={{
          display:"flex",
          flexDirection: w >= 900 ? "row" : "column",
          gap:16, alignItems:"flex-start",
        }}>

          {/* Column 1 — Module selector */}
          <div style={{ width: w >= 900 ? 180 : "100%", flexShrink:0 }}>
            <div style={{
              background:T.white, borderRadius:12, border:`1px solid ${T.border}`,
              overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ padding:"10px 12px 6px", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.faint }}>
                Módulos
              </div>
              {ADMIN_MODULES.map(mod => {
                const active = activeModule === mod.key;
                return (
                  <button key={mod.key} onClick={() => { setActiveModule(mod.key); setActiveSubmenu(mod.submenus[0].key); }} style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"11px 14px",
                    background: active ? mod.bg : "none",
                    border:"none", cursor:"pointer", textAlign:"left",
                    borderLeft:`3px solid ${active ? mod.color : "transparent"}`,
                    transition:"all 0.15s",
                  }}>
                    <span style={{ color: active ? mod.color : T.muted, display:"flex", flexShrink:0 }}>{mod.icon}</span>
                    <span style={{ fontSize:13, fontWeight: active ? 700 : 500, color: active ? mod.color : T.mid, lineHeight:1.3 }}>
                      {mod.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2 — Submenu list */}
          <div style={{ width: w >= 900 ? 200 : "100%", flexShrink:0 }}>
            <div style={{
              background:T.white, borderRadius:12, border:`1px solid ${T.border}`,
              overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ padding:"10px 12px 6px", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.faint }}>
                {currentModule?.label}
              </div>
              {currentModule?.submenus.map(sub => {
                const active = activeSubmenu === sub.key;
                return (
                  <button key={sub.key} onClick={() => setActiveSubmenu(sub.key)} style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"11px 14px",
                    background: active ? currentModule.bg : "none",
                    border:"none", cursor:"pointer", textAlign:"left",
                    borderLeft:`3px solid ${active ? currentModule.color : "transparent"}`,
                    transition:"all 0.15s",
                  }}>
                    <span style={{ color: active ? currentModule.color : T.muted, display:"flex", flexShrink:0 }}>
                      {sub.icon}
                    </span>
                    <span style={{ fontSize:13, fontWeight: active ? 600 : 500, color: active ? currentModule.color : T.mid }}>
                      {sub.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3 — Upload panel */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              background:T.white, borderRadius:12,
              border:`1px solid ${T.border}`,
              padding: w < 480 ? "18px 16px" : "24px",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {/* Submenu header */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{
                  width:34, height:34, borderRadius:8,
                  background:currentModule?.bg,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:currentModule?.color, flexShrink:0,
                }}>
                  {currentSubmenu?.icon}
                </div>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:T.dark, letterSpacing:"-0.01em" }}>
                    {currentSubmenu?.label}
                  </h2>
                  <p style={{ fontSize:12, color:T.muted, marginTop:2, lineHeight:1.5 }}>
                    {currentSubmenu?.desc}
                  </p>
                </div>
              </div>

              <div style={{ height:1, background:T.border, margin:"16px 0" }}/>

              <FileUploadZone
                moduleKey={uploadKey}
                uploadedFiles={filesForSub}
                setUploadedFiles={setFilesForSub}
              />

              {filesForSub.filter(f => f.status === "done").length > 0 && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <button style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"10px 22px", borderRadius:9,
                    background:currentModule?.color, color:"#fff",
                    fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                    transition:"opacity 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity="1"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirmar Publicação
                  </button>
                  <span style={{ fontSize:12, color:T.muted }}>
                    Documentos serão registrados com sua assinatura AD.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 19. GENERIC PLACEHOLDER (for pages without upload)
// ══════════════════════════════════════════════════════════════
const PAGE_META = {
  ramais: { title:"Catálogo de Ramais", icon:<ICONS.Phone s={32}/>, desc:"Diretório completo de ramais, setores e contatos de emergência." },
};

function GenericPlaceholder({ pageName, navigate }) {
  const meta = PAGE_META[pageName];
  const { w } = useBreakpoint();
  if (!meta) return null;
  return (
    <div className="fade-up" style={{
      minHeight:"calc(100vh - 60px)", background:T.canvas,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }}>
      <div style={{
        background:T.white, borderRadius:16,
        padding: w < 400 ? "32px 20px" : "48px 32px",
        textAlign:"center",
        boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
        border:`1px solid ${T.border}`,
        maxWidth:420, width:"100%",
      }}>
        {meta.restricted && (
          <div style={{
            display:"inline-block", padding:"3px 12px", borderRadius:20,
            background:"#fef3c7", color:"#92400e",
            fontSize:10, fontWeight:700, letterSpacing:"0.07em",
            textTransform:"uppercase", marginBottom:18,
          }}>🔒 Acesso Restrito — AD Groups</div>
        )}
        <div style={{
          width:64, height:64, borderRadius:"50%", background:T.blueLight,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 18px", color:T.blue,
        }}>
          {meta.icon}
        </div>
        <h1 style={{ fontSize:20, fontWeight:700, color:T.dark, letterSpacing:"-0.02em", marginBottom:9 }}>
          {meta.title}
        </h1>
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:24 }}>{meta.desc}</p>
        <div style={{ marginBottom:24 }}>
          {[68,48,58].map((ww,i) => (
            <div key={i} className="skeleton" style={{ height:8, width:`${ww}%`, margin:"6px auto" }}/>
          ))}
        </div>
        <button onClick={() => navigate("home")} style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"10px 22px", borderRadius:9,
          background:T.blue, color:"#fff",
          fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
          transition:"background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background=T.blueDark}
          onMouseLeave={e => e.currentTarget.style.background=T.blue}
        >
          <ICONS.ArrowL s={14}/> Voltar ao Início
        </button>
      </div>
    </div>
  );
}

function PageView({ pageName, navigate }) {
  if (pageName === "rh")        return <RHPage navigate={navigate}/>;
  if (pageName === "suporte")   return <SuportePage navigate={navigate}/>;
  if (pageName === "qualidade") return <QualidadePage navigate={navigate}/>;
  if (pageName === "admin")     return <AdminPanel navigate={navigate}/>;
  return <GenericPlaceholder pageName={pageName} navigate={navigate}/>;
}

// ══════════════════════════════════════════════════════════════
// 17. APP ROOT
// ══════════════════════════════════════════════════════════════
function MainApp() {
  const [page, setPage] = useState("home");
  const navigate = (p) => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };

  return (
    <div style={{ minHeight:"100vh", background:T.canvas }}>
      <Header page={page} navigate={navigate}/>
      {page === "home"
        ? <Home navigate={navigate}/>
        : <PageView pageName={page} navigate={navigate}/>
      }
    </div>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyles/>
      <MainApp/>
    </>
  );
}
