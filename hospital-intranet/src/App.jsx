/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  INTRANET HOSPITALAR  v3.0                                   ║
 * ║  ─ Fully responsive: 320px → 4K                              ║
 * ║  ─ Static user session (swap CURRENT_USER for real AD data)  ║
 * ║  ─ Login screen removed — auth handled by backend + MSAL    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import React, { useState, useEffect, useRef } from "react";

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
import { api } from './api.js';

function useBreakpoint() {
  const getW = () => (typeof window !== "undefined" ? window.innerWidth : 1024);
  const [w, setW] = React.useState(getW);
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
// 3. ROLE SYSTEM + USER SESSION
//
//  In production: CURRENT_USER comes from GET /api/v1/me (Azure AD).
//  Roles are assigned in Azure Portal → App Registration → App Roles
//  and attached to the JWT token automatically.
//
//  Role hierarchy:
//    "Intranet.User"            → all authenticated staff  (read-only)
//    "Intranet.RH.Manager"      → RH leader                (upload to RH)
//    "Intranet.Quality.Manager" → Quality leader            (upload to Quality)
//    "Intranet.IT"              → IT team                   (upload to IT/Suporte)
//    "Intranet.Admin"           → IT admins only            (admin panel + all above)
//
//  ▼ Change the roles array below to test different access levels ▼
// ══════════════════════════════════════════════════════════════
const CURRENT_USER = {
  displayName: "Colaborador",
  givenName:   "Colaborador",
  surname:     "",
  initials:    "CO",
  avatarColor: "linear-gradient(135deg,#1a56db,#60a5fa)",

  // ── Swap roles to test different users: ──────────────────────
  roles: ["Intranet.User"],
  // roles: ["Intranet.User", "Intranet.RH.Manager"],
  // roles: ["Intranet.User", "Intranet.Quality.Manager"],
  // roles: ["Intranet.User", "Intranet.IT"],
  // roles: ["Intranet.User", "Intranet.IT", "Intranet.Admin"],
};

// ── Permission helpers (single source of truth) ───────────────
const can = {
  editRH:      CURRENT_USER.roles.includes("Intranet.RH.Manager")      || CURRENT_USER.roles.includes("Intranet.Admin"),
  editQuality: CURRENT_USER.roles.includes("Intranet.Quality.Manager") || CURRENT_USER.roles.includes("Intranet.Admin"),
  editIT:      CURRENT_USER.roles.includes("Intranet.IT")               || CURRENT_USER.roles.includes("Intranet.Admin"),
  admin:       CURRENT_USER.roles.includes("Intranet.Admin"),
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
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
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
function NavDropdown({ item, page, go, T }) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);
  useEffect(() => {
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

function Header({ page, navigate }) {
  const user = CURRENT_USER;
  const { isMobile, isXs, w }     = useBreakpoint();
  const [open, setOpen]   = React.useState(false);
  const [uMenu, setUMenu] = React.useState(false);

  const go = (p) => { navigate(p); setOpen(false); setUMenu(false); };

  const navItems = [
  { label:"Início", p:"home" },
  { label:"Gente e Gestão", p:"rh" },
  { label:"Qualidade e Segurança", p:"qualidade", children:[
    { label:"Indicadores", p:"qualidade", tab:"indicadores" },
    { label:"Documentos da Qualidade", p:"qualidade", tab:"protocolos" },
    { label:"Notificações", p:"qualidade", tab:"notificacoes" },
  ]},
  { label:"Procedimentos e Ramais", p:"ramais", children:[
    { label:"Catálogo de Ramais", external:"/ramais.pdf" },
    { label:"Procedimentos (POPs)", p:"procedimentos" },
  ]},
  { label:"Canais FUBOG", children:[
    { label:"Canal de Gente e Gestão", external: "https://forms.gle/U1mSSJHbrsQFDtqr7" },
    { label:"Canal NPS", external: "c" },
    { label:"Canal de Compliance", external:"https://docs.google.com/forms/d/e/1FAIpQLSeCFr7s2mJzOa6VII2PqihBuImj1v2dSmBK8EskPYC8AgKuGg/viewform" },
  ]},
  { label:"Suporte T.I.", p:"suporte", external:"http://ares/index.php?redirect=%2Ffront%2Fcentral.php?error=3" },
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
        width:"100%", boxSizing:"border-box",
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
            {navItems.map((item, idx) => {
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
  const [focused, setFocused] = React.useState(false);
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
function DashboardCard({ icon, iconBg, iconColor, title, desc, onClick, canManage }) {
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
          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.dark, lineHeight:1.3, letterSpacing:"-0.01em" }}>
              {title}
            </span>
            {canManage && (
              <span style={{
                fontSize:9, fontWeight:700, letterSpacing:"0.07em",
                textTransform:"uppercase", padding:"2px 7px", borderRadius:20,
                background:"#fef3c7", color:"#92400e", whiteSpace:"nowrap",
              }}>Gestor</span>
            )}
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
        {canManage ? "Gerenciar" : "Visualizar"} <ICONS.ArrowR s={13}/>
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
    { label:"Suporte T.I.", url:"http://ares/index.php?redirect=%2Ffront%2Fcentral.php?error=3" },
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
  { page:"rh",        icon:<ICONS.Users s={20}/>,  iconBg:"#f5f3ff", iconColor:"#7c3aed",
    title:"Gente e Gestão",
    desc:"Escalas, treinamentos, contatos e ações do mês.",
    canManage: can.editRH },
  { page:"qualidade", icon:<ICONS.Clip s={20}/>,   iconBg:"#f0fdf4", iconColor:"#16a34a",
    title:"Qualidade e Segurança",
    desc:"Protocolos clínicos, indicadores e notificações de eventos.",
    canManage: can.editQuality },
  { page:"ramais",    icon:<ICONS.Phone s={20}/>,  iconBg:"#fff7ed", iconColor:"#ea580c",
    title:"Catálogo de Ramais",
    desc:"Ramais internos, setores, bips e contatos de emergência.",
    canManage: false },
  { page:"suporte",   icon:<ICONS.Wrench s={20}/>, iconBg:"#f8fafc", iconColor:"#475569",
    title:"Suporte T.I.",
    desc:"Abertura de chamados técnicos e suporte de infraestrutura.",
    canManage: can.editIT },
];

// ══════════════════════════════════════════════════════════════
// 15. HOME PAGE
// ══════════════════════════════════════════════════════════════
function Home({ navigate }) {
// --- ESTADO PARA O "LEIA MAIS" ---
  const [expandido, setExpandido] = React.useState({});
  const toggleExpandir = (index) => {
    setExpandido(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // --- DADOS COMPLETOS DA CIPA ---
  const candidatosCipa = [
    { 
      nome: "Alison Correia Silva", 
      cargo: "Coordenador de RH", 
      departamento: "Gente e Gestão",
      proposta: "Meu nome é Alison, sou formado em Pedagogia, com Pós graduação em Gestão Hospitalar, Especialista em Administração de Pessoal, Legislação Trabalhista e e-Social, e em Business Partner. Possuo mais de 10 anos de experiência na área de pessoas e quase 2 anos atuando na FUBOG, cuidando dos departamentos de RH, DP e SESMT.\n\nA área hospitalar possui muitos desafios e entre eles está o cuidar do ambiente em que estamos inseridos e ficamos mais tempo do nosso dia-a-dia. No ano passado (2025) fui convidado para dar continuidade a programação da CIPA (2025/2026), onde começamos a caminhar alguns projetos de melhorias internas.\n\nPara a CIPA (2026/2027) minha proposta é darmos continuidade aos projetos que visam a segurança de todos na instituição, como também, a promoção de melhorias preventivas e ações para assegurarmos o cuidado e segurança."
    },
    { 
      nome: "Andressa Macedo do Carmo Nascimento", 
      cargo: "Analista de Prestação de Contas", 
      departamento: "Prestação de Contas",
      proposta: "Meu nome é Andressa Macedo, sou formada em Administração, pós-graduada em Gestão de Pessoas e possuo mais de 10 anos de experiência na área, atuando com responsabilidade, organização e foco em resultados. Atualmente, integro o setor de Prestação de Contas, onde desenvolvo meu trabalho com atenção, compromisso e respeito às normas. Coloco meu nome à disposição para a CIPA com o propósito de atuar de forma ativa na prevenção de acidentes e na promoção da saúde e segurança de todos. Acredito que um ambiente seguro se constrói com diálogo, responsabilidade e atitude."
    },
    { 
      nome: "Jennifer R. C. Magalhães", 
      cargo: "Assistente Administrativo", 
      departamento: "Manutenção",
      proposta: "Sou uma pessoa responsável, dedicada e que gosta de ajudar o próximo. Procuro sempre manter um bom relacionamento com todos e contribuir para um ambiente de trabalho mais leve e organizado. Quero participar de forma ativa, ajudando com ideias, atitudes, ouvindo os colegas e contribuindo para um ambiente mais seguro, organizado, e melhor para todos."
    },
    { 
      nome: "Jakeline de Sá Ferreira", 
      cargo: "Aux. de Higienização Hospitalar", 
      departamento: "Facilities",
      proposta: "Sou uma pessoa responsável, comprometida e atenta às necessidades do ambiente de trabalho. Tenho facilidade em me comunicar, gosto de trabalhar em equipe e estou sempre disposta a aprender e contribuir de forma positiva. Prezo pela segurança, bem-estar e respeito entre todos, buscando sempre agir com empatia e consciência no dia a dia. Acredito que um ambiente seguro depende da colaboração de todos, e quero fazer parte disso, ajudando a prevenir riscos promovendo melhorias."
    },
    { 
      nome: "Lauro Pereira dos Santos", 
      cargo: "Jardineiro", 
      departamento: "Manutenção",
      proposta: "Como profissional, sou pontual, correspondo bem com a necessidade do cargo, sempre buscando crescimento. Como candidato à CIPA, pretendo melhorar a manutenção da área externa, jardim e outros espaços comuns para garantir a segurança e o bem-estar de todos que circulam pela fundação."
    },
    { 
      nome: "Vanessa José da Silva", 
      cargo: "Coordenadora de Atendimento", 
      departamento: "Atendimento",
      proposta: "Há 3 anos faço parte da família FUBOG, iniciei na Ouvidoria, onde aprendi a transformar a escuta em melhorias. Hoje, como Coordenadora de Atendimento, trabalho para garantir um atendimento humano, ágil e acolhedor. Sou casada, amo pets, café e viajar, e acredito que cuidar de pessoas começa unindo equipe e processos. Trabalhar no hospital é cuidar de pessoas pacientes e equipe. No meu trabalho, prezo pelos detalhes, pela organização e pelo cuidado com o próximo. É com esse olhar que quero contribuir na CIPA: prevenindo riscos, incentivando boas práticas e tornando nosso ambiente cada vez mais leve, seguro e humano."
    }
  ];
  // ---------------------------------
  const user = CURRENT_USER;
  const { isMobile, isDesktop, w } = useBreakpoint();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.givenName || "Dr. Silva";

  return (
    <main style={{
      width:"100%", boxSizing:"border-box",
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
{/* --- SEÇÃO TEMPORÁRIA CIPA INÍCIO --- */}
      <div style={{
        background: T.white, borderRadius: 12, border: `1px solid ${T.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 28
      }}>
        <div style={{ background: T.blue, color: T.white, padding: "16px 20px", textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>📢 Eleições CIPA FUBOG (2026/2027)</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, opacity: 0.9 }}>Conheça os candidatos e suas propostas para a nossa segurança!</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, padding: 20 }}>
          {candidatosCipa.map((candidato, index) => {
            const limite = 150;
            const textoLongo = candidato.proposta.length > limite;
            const mostrarTudo = expandido[index];
            const textoExibido = (textoLongo && !mostrarTudo) 
              ? candidato.proposta.substring(0, limite) + "..." 
              : candidato.proposta;

            return (
              <div key={index} style={{
                background: T.blueLight, padding: 16, borderRadius: 10,
                border: "1px solid #dbeafe", display: "flex", flexDirection: "column", gap: 10
              }}>
                <div style={{ borderBottom: `1px solid #d1e1f5`, paddingBottom: 8 }}>
                  <h3 style={{ margin: 0, color: T.blueDark, fontSize: 16, fontWeight: 700 }}>{candidato.nome}</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: 12, fontWeight: 600, color: T.dark }}>{candidato.cargo}</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.muted }}>Setor: {candidato.departamento}</p>
                </div>
                <div style={{
                  margin: "0", fontSize: 13, color: T.mid, lineHeight: 1.6,
                  background: T.white, padding: 12, borderRadius: 8, border: `1px solid ${T.border}`,
                  whiteSpace: "pre-wrap", flex: 1
                }}>
                  {textoExibido}
                  {textoLongo && (
                    <button 
                      onClick={() => toggleExpandir(index)}
                      style={{ 
                        color: T.blue, fontWeight: 700, fontSize: 12, marginLeft: 6,
                        border: 'none', background: 'none', cursor: 'pointer', padding: 0 
                      }}
                    >
                      {mostrarTudo ? "Ler menos" : "Leia mais"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* --- SEÇÃO TEMPORÁRIA CIPA FIM --- */}

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
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:11, color:T.faint }}>
            Autenticado via AD · {user?.department}
          </span>
          {/* Admin link — only rendered for Intranet.Admin group, invisible to others */}
          {can.admin && (
            <button onClick={() => navigate("admin")} style={{
              fontSize:11, color:T.faint, background:"none", border:"none",
              cursor:"pointer", display:"flex", alignItems:"center", gap:4,
              transition:"color 0.15s", padding:0,
            }}
              onMouseEnter={e => e.currentTarget.style.color=T.mid}
              onMouseLeave={e => e.currentTarget.style.color=T.faint}
              title="Painel Administrativo"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Administração
            </button>
          )}
        </div>
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
  const [dragging, setDragging] = React.useState(false);
  const [errors, setErrors]     = React.useState([]);
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
  const [activeTab, setActiveTab]       = React.useState(categories[0]?.key);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [allowDownload, setAllowDownload] = React.useState(false);
  const doneCount = uploadedFiles.filter(f => f.status === "done").length;

  return (
    <div className="fade-up" style={{ minHeight:"calc(100vh - 60px)", background:T.canvas }}>
      <div style={{
        maxWidth:1400, margin:"0 auto",
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
// 17. MODULE PAGES  (view-only for all / upload only for managers)
// ══════════════════════════════════════════════════════════════

// ── Simulated document library per module ────────────────────
const MOCK_DOCS = {
  rh: [],
  qualidade: [],
  suporte: [
    { id:1, name:"Manual VPN Hospital.pdf",                size:430000, cat:"Infraestrutura",      date:"10/12/2024", author:"T.I." },
    { id:2, name:"Guia de Acesso Sistemas.pdf",           size:280000, cat:"Acessos",           date:"15/12/2024", author:"T.I." },
    { id:3, name:"Política de Senhas.docx",                size:145000, cat:"Segurança",          date:"20/11/2024", author:"T.I." },
    { id:4, name:"Formulário Solicitação Equipamento.pdf", size:195000, cat:"Equipamentos",       date:"08/12/2024", author:"T.I." },
  ],
};

export function DocList({ docs, onDownload, onDelete, canEdit }) {
  const { w } = useBreakpoint();

  if (!docs || docs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: T.faint, fontSize: 13 }}>
        Nenhum documento disponível.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {docs.map(doc => (
        <DocListItem
          key={doc?.id || Math.random()}
          doc={doc}
          w={w}
          onDownload={onDownload}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}

// ── Individual Document Item ───────────────────────────────────
function DocListItem({ doc, w, onDownload, onDelete, canEdit }) {
  // Safe React states for hovers
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);
  const [isTextHovered, setIsTextHovered] = React.useState(false);
  const [pdfOpen, setPdfOpen] = React.useState(false);

  
  const ic = getFileIcon(doc?.name || "");
  const isLink = !!doc?.url;

  return (
  <>
    <div style={{
      background: T.white, borderRadius: 10,
      border: `1px solid ${T.border}`,
      padding: "11px 14px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      
      {/* 1. Icon Area (Conditional PDF styling) */}
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: isLink ? "#FFE5E5" : (ic?.bg || T.gray), // Fallback colors
        color: isLink ? "#D32F2F" : (ic?.color || T.dark),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
      }}>
        {isLink ? "PDF" : (ic?.label || "FILE")}
      </div>

      {/* 2. Text Info Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isLink ? (
          <a 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer"
            title={doc?.name}
            onMouseEnter={() => setIsTextHovered(true)}
            onMouseLeave={() => setIsTextHovered(false)}
            style={{ 
              fontSize: 13, fontWeight: 700, color: T.blue, 
              textDecoration: isTextHovered ? "underline" : "none", 
              display: "block", whiteSpace: "nowrap", 
              overflow: "hidden", textOverflow: "ellipsis",
              transition: "text-decoration 0.2s"
            }}
          >
            {doc?.name || "Link sem nome"} 🔗
          </a>
        ) : (
          <div 
            title={doc?.name} 
            style={{ 
              fontSize: 13, fontWeight: 600, color: T.dark,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
            }}
          >
            {doc?.name || "Documento sem nome"}
          </div>
        )}
        
        <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>
          {doc?.cat || "Geral"} · {doc?.size ? formatBytes(doc?.size) : "0 B"} · {doc?.date || "--"}
        </div>
      </div>

      {/* 3. Action Button / Link */}
      {isLink ? (
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label={`Abrir ${doc?.name || "link"}`}
          title="Abrir documento"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 7, flexShrink: 0,
            background: T.blueLight, color: T.blue, textDecoration: "none",
            border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            opacity: isButtonHovered ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* External Link SVG */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
          {w >= 480 && "Abrir"}
        </a>
     ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPdfOpen(true)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            title="Visualizar documento"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 7, flexShrink: 0,
              background: T.blueLight, color: T.blue,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              opacity: isButtonHovered ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {w >= 480 && "Visualizar"}
          </button>
          {canEdit && (
            <button
              onClick={() => onDownload && onDownload(doc)}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              aria-label={`Baixar ${doc?.name || "documento"}`}
              title="Baixar documento"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 7, flexShrink: 0,
                background: T.blueLight, color: T.blue,
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                opacity: isButtonHovered ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              {w >= 480 && "Baixar"}
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onDelete && onDelete(doc.id)}
              title="Excluir documento"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", fontSize: 16, padding: "4px",
                borderRadius: 6, display: "flex", alignItems: "center",
              }}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
    {pdfOpen && (
      <div onClick={() => setPdfOpen(false)} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
        zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width:"90vw", height:"90vh", background:"#fff", borderRadius:12, overflow:"hidden",
          display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom:"1px solid #e5e7eb", background:"#f9fafb" }}>
            <span style={{ fontWeight:600, fontSize:14, color:"#111" }}>{doc.name}</span>
            <button onClick={() => setPdfOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#6b7280", lineHeight:1 }}>✕</button>
          </div>
          <iframe
            src={`/api/v1/documents/${doc.id}/view#toolbar=0&navpanes=0&scrollbar=0`}
            style={{ flex:1, width:"100%", border:"none" }}
            title={doc.name}
          />
        </div>
      </div>
    )}
  </>
  );
}

// ── Shared module page shell ──────────────────────────────────
function ModulePage({ navigate, moduleKey, title, icon, accentColor, accentBg, tabs, canEdit }) {
  const { w, isDesktop } = useBreakpoint();
  const [activeTab, setActiveTab]         = React.useState(tabs[0]?.key);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [showUpload, setShowUpload]       = React.useState(false);
  const [allDocs, setAllDocs]             = React.useState([]);

const handleDelete = async (id) => {
  if (!confirm("Tem certeza que deseja excluir este documento?")) return;

  try {
    await fetch(`/api/v1/documents/${id}`, {
      method: "DELETE",
    });

    // 🔥 atualiza lista sem reload
    setAllDocs(prev => prev.filter(doc => doc.id !== id));

  } catch (err) {
    console.error(err);
    alert("Erro ao excluir documento");
  }
};

  React.useEffect(() => {
    fetch(`/api/v1/documents?module=${moduleKey}`)
      .then(r => r.json())
      .then(j => setAllDocs(j.data || []))
      .catch(() => setAllDocs([]));
  }, [moduleKey]);

  const currentTab   = tabs.find(t => t.key === activeTab);
  const tabDocs      = allDocs.filter(d => !currentTab?.docCat || d.category === currentTab.docCat);
  const pendingCount = uploadedFiles.filter(f => f.status === "done" && f.tab === activeTab).length;
  const handleDownload = (doc) => {
    window.open(`/api/v1/documents/${doc.id}/download`, '_blank');
  };

  return (
    <div className="fade-up" style={{ minHeight:"calc(100vh - 60px)", background:T.canvas }}>
      <div style={{
        maxWidth:1400, margin:"0 auto",
        padding: w < 480 ? "22px 14px 52px" : w < 768 ? "28px 20px 56px" : "40px 32px 64px",
      }}>

        {/* ── Page header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:24, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:46, height:46, borderRadius:12, background:accentBg, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center", color:accentColor,
            }}>{icon}</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <h1 style={{ fontSize: w<480?18:21, fontWeight:800, color:T.dark, letterSpacing:"-0.02em" }}>
                  {title}
                </h1>
                {canEdit && (
                  <span style={{
                    fontSize:9, fontWeight:700, letterSpacing:"0.08em",
                    textTransform:"uppercase", padding:"3px 8px", borderRadius:20,
                    background:"#fef3c7", color:"#92400e",
                  }}>Gestor</span>
                )}
              </div>
              <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                {canEdit ? "Acesso de gestão — visualize e publique documentos" : "Acesso de visualização — leitura e download"}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            {canEdit && (
              <button onClick={() => setShowUpload(v => !v)} style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"9px 16px", borderRadius:9,
                background: showUpload ? accentColor : accentBg,
                border:`1.5px solid ${accentColor}`,
                color: showUpload ? "#fff" : accentColor,
                fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.18s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {showUpload
                    ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    : <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>
                  }
                </svg>
                {showUpload ? "Cancelar" : "Publicar Documento"}
              </button>
            )}
            <button onClick={() => navigate("home")} style={{
              display:"inline-flex", alignItems:"center", gap:7,
              padding:"9px 16px", borderRadius:9,
              background:T.white, border:`1px solid ${T.border}`,
              fontSize:13, fontWeight:600, color:T.mid, cursor:"pointer",
              transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.blue; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.mid; }}
            >
              <ICONS.ArrowL s={13}/> Início
            </button>
          </div>
        </div>

        {/* ── Upload panel (managers only, toggleable) ── */}
        {canEdit && showUpload && (
          <div className="slide-dn" style={{
            background:T.white, borderRadius:12,
            border:`1.5px solid ${accentColor}33`,
            padding: w < 480 ? "18px 16px" : "22px 24px",
            marginBottom:20,
            boxShadow:`0 4px 16px ${accentColor}14`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{
                width:8, height:8, borderRadius:"50%",
                background:accentColor, flexShrink:0,
              }}/>
              <span style={{ fontSize:13, fontWeight:700, color:T.dark }}>
                Publicar em: <span style={{ color:accentColor }}>{currentTab?.label}</span>
              </span>
              <span style={{ fontSize:11, color:T.muted, marginLeft:4 }}>
                · Assinado como {CURRENT_USER.displayName}
              </span>
            </div>
            <FileUploadZone
              moduleKey={moduleKey}
              uploadedFiles={uploadedFiles.filter(f => f.tab === activeTab)}
              setUploadedFiles={(updater) => {
                setUploadedFiles(prev => {
                  const updated = typeof updater === "function" ? updater(prev) : updater;
                  // tag each new file with its tab
                  return updated.map(f => f.tab ? f : { ...f, tab: activeTab });
                });
              }}
            />
            {pendingCount > 0 && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <input
                    type="checkbox"
                    id="allowDownloadCheck"
                    checked={allowDownload}
                    onChange={e => setAllowDownload(e.target.checked)}
                    style={{ cursor:'pointer', width:18, height:18 }}
                  />
                  <label htmlFor="allowDownloadCheck" style={{ cursor:'pointer', fontSize:13, color:T.dark, userSelect:'none' }}>
                    Permitir download deste documento
                  </label>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <button style={{
                  display:"inline-flex", alignItems:"center", gap:7,
                  padding:"10px 22px", borderRadius:9,
                  background:accentColor, color:"#fff",
                  fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                  transition:"opacity 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity="0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity="1"}
                  onClick={() => setShowUpload(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Confirmar Publicação ({pendingCount})
                </button>
                <span style={{ fontSize:12, color:T.muted }}>
                  Registrado com assinatura AD.
                </span>
              </div>
	    </div>
            )}
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div style={{ display:"flex", flexDirection: isDesktop ? "row" : "column", gap:18, alignItems:"flex-start" }}>

          {/* Tabs sidebar */}
          <div style={{ width: isDesktop ? 200 : "100%", flexShrink:0 }}>
            <div style={{ background:T.white, borderRadius:12, border:`1px solid ${T.border}`, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding:"10px 12px 6px", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.faint }}>
                Categorias
              </div>
              {tabs.map(tab => {
                const active = activeTab === tab.key;
                const tabCount = allDocs.filter(d => !tab.docCat || d.category === tab.docCat).length;
                return (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowUpload(false); }} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    width:"100%", padding:"11px 14px",
                    background: active ? accentBg : "none",
                    border:"none", cursor:"pointer", textAlign:"left",
                    borderLeft:`3px solid ${active ? accentColor : "transparent"}`,
                    transition:"all 0.15s",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <span style={{ color: active ? accentColor : T.muted, display:"flex", flexShrink:0 }}>{tab.icon}</span>
                      <span style={{ fontSize:13, fontWeight: active ? 600 : 500, color: active ? accentColor : T.mid }}>
                        {tab.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10,
                      background: active ? accentColor+"22" : T.borderLight,
                      color: active ? accentColor : T.faint,
                    }}>{tabCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document list */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ background:T.white, borderRadius:12, border:`1px solid ${T.border}`, padding: w<480?"16px":"22px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <h2 style={{ fontSize:15, fontWeight:700, color:T.dark }}>{currentTab?.label}</h2>
                <span style={{ fontSize:11, color:T.faint }}>{tabDocs.length} documento{tabDocs.length!==1?"s":""}</span>
              </div>
              <DocList 
  		docs={tabDocs} 
 	        onDownload={handleDownload} 
	        onDelete={handleDelete}
		canEdit={canEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── The three module pages ────────────────────────────────────
function RHPage({ navigate }) {
  return <ModulePage navigate={navigate} moduleKey="rh" title="Gente e Gestão"
    icon={<ICONS.Users s={22}/>} accentColor="#7c3aed" accentBg="#f5f3ff"
    canEdit={can.editRH}
    tabs={[
      { key:"escalas",         label:"Escalas dos Colaboradores", docCat:"Escalas",         icon:<Si d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/> },
      { key:"acoes",           label:"Ações do Mês",              docCat:"Ações",            icon:<Si d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> },
      { key:"treinamentos",    label:"Lista de Treinamentos",     docCat:"Treinamentos",     icon:<Si d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/> },
      { key:"contatos",        label:"Contatos RH/DP/SESMT",      docCat:"Contatos",         icon:<Si d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/> },
      { key:"aniversariantes", label:"Aniversariantes do Mês",    docCat:"Aniversariantes",  icon:<Si d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
    ]}
  />;
}

function QualidadePage({ navigate }) {
  const [tab, setTab] = React.useState('indicadores');

  const [popText, setPopText] = React.useState('');
  const [indicators, setIndicators] = React.useState([]);

  React.useEffect(() => {
    api.getIndicators()
      .then(j => setIndicators(Array.isArray(j.data) ? j.data : []))
      .catch(() => setIndicators([]));
    api.getSetting('pop_texto')
      .then(j => setPopText(j.data || ''))
      .catch(() => setPopText(''));
    api.getDocs('qualidade')
      .then(j => setQualDocs(Array.isArray(j.data) ? j.data : []))
      .catch(() => setQualDocs([]));
  }, []);

  const [qualDocs, setQualDocs] = React.useState([]);
  React.useEffect(() => {
    fetch('/api/v1/documents?module=qualidade')
      .then(r => r.json())
      .then(j => setQualDocs(j.data || []))
      .catch(() => setQualDocs([]));
  }, []);


  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ background:'#DCFCE7', borderRadius:10, padding:10, display:'flex' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:T.dark }}>Qualidade e Segurança</h2>
          <p style={{ margin:0, fontSize:13, color:T.muted }}>Indicadores, documentos e formulários</p>
        </div>
        <button onClick={() => navigate('home')} style={{ marginLeft:'auto', padding:'8px 16px', fontSize:13, background:T.canvas, border:'1px solid '+T.border, borderRadius:8, cursor:'pointer', color:T.mid }}>← Início</button>
      </div>
      <div style={{ display:'flex', gap:4, borderBottom:'2px solid '+T.border, marginBottom:28 }}>
        {[{k:'indicadores',l:'Indicadores'},{k:'avisos',l:'Avisos'},{k:'documentos',l:'Documentos da Qualidade'}].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding:'10px 20px', fontSize:13, fontWeight:tab===t.k?600:400, color:tab===t.k?T.blue:T.muted, background:'transparent', border:'none', cursor:'pointer', borderBottom:tab===t.k?'2px solid '+T.blue:'2px solid transparent', marginBottom:-2 }}>{t.l}</button>
        ))}
      </div>
      {tab==='indicadores' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {indicators.map((ind,i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid '+T.border, borderRadius:12, padding:20 }}>
              <div style={{ fontSize:28, fontWeight:700, color:ind.color }}>{ind.value}</div>
              <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>{ind.label}</div>
            </div>
          ))}
        </div>
      )}
      {tab==='avisos' && (
        <div style={{ background:'#fff', border:'1px solid '+T.border, borderRadius:12, padding:24 }}>
          <div style={{ fontWeight:700, fontSize:15, color:T.dark, marginBottom:16 }}>POP — Procedimentos Operacionais Padrão</div>
          {popText ? (
            <div style={{ whiteSpace:'pre-line', lineHeight:1.7, color:T.mid }}>
              {popText.split('\n').map((line, i) => (
                <div key={i} style={{ marginBottom: i < popText.split('\n').length - 1 ? 8 : 0 }}>
                  {line.startsWith('•') || /^\d+\./.test(line) ? (
                    <div style={{ paddingLeft: 20 }}>
                      {line}
                    </div>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color:T.muted, fontSize:13, fontStyle:'italic' }}>
              Nenhum POP publicado ainda. A equipe de qualidade irá publicar os procedimentos em breve.
            </div>
          )}
        </div>
      )}
      {tab==='documentos' && (
        <div>
          <DocList docs={qualDocs} canEdit={false} onDownload={(doc) => {
            console.log('Download:', doc);
            alert(`Baixando: ${doc.name}`);
          }}/>
        </div>
      )}
    </div>
  );
}

function SuportePage({ navigate }) {
  return <ModulePage navigate={navigate} moduleKey="suporte" title="Suporte T.I."
    icon={<ICONS.Wrench s={22}/>} accentColor="#475569" accentBg="#f8fafc"
    canEdit={can.editIT}
    tabs={[
      { key:"infra",      label:"Infraestrutura",       docCat:"Infraestrutura", icon:<Si d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18"/> },
      { key:"acessos",    label:"Acessos",              docCat:"Acessos",        icon:<Si d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
      { key:"seguranca",  label:"Segurança",            docCat:"Segurança",      icon:<Si d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/> },
      { key:"equip",      label:"Equipamentos",         docCat:"Equipamentos",   icon:<Si d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m4 11H9a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2z"/> },
    ]}
  />;
}

// ══════════════════════════════════════════════════════════════
// 18. ADMIN PANEL  (IT admins only — not linked from nav or cards)
// ══════════════════════════════════════════════════════════════
function QualidadeAdminEditor() {
  const defaultInds = [
    {label:'Taxa de Infecção Hospitalar', value:'2.3%', color:'#16a34a'},
    {label:'Satisfação do Paciente',      value:'94%',  color:'#1a56db'},
    {label:'Tempo Médio de Atendimento',  value:'18 min',color:'#d97706'},
    {label:'Eventos Adversos',            value:'3',    color:'#dc2626'},
  ];

  return (
    <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Indicators editor */}
      <div style={{ background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:12, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:'#15803d', marginBottom:14 }}>
          📊 Editar Indicadores de Qualidade
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
          {inds.map((ind, i) => (
            <div key={i} style={{ background:'#fff', borderRadius:10, padding:14, border:'1px solid #BBF7D0' }}>
              <div style={{ fontSize:11, color:'#15803d', fontWeight:600, marginBottom:6 }}>{ind.label}</div>
              <input
                value={ind.value}
                onChange={e => {
                  const updated = [...inds];
                  updated[i] = {...updated[i], value: e.target.value};
                  setInds(updated);
                }}
                style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:'1px solid #D1FAE5',
                  fontSize:16, fontWeight:700, color:ind.color, boxSizing:'border-box' }}
              />
            </div>
          ))}
        </div>
        <button onClick={saveInds} style={{
          marginTop:14, padding:'9px 20px', borderRadius:8,
          background: indSaved ? '#15803d' : '#16a34a', color:'#fff',
          fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
        }}>
          {indSaved ? '✓ Salvo!' : 'Salvar Indicadores'}
        </button>
      </div>

      {/* POP editor */}
      <div style={{ background:'#EFF6FF', border:'1px solid #93C5FD', borderRadius:12, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:14, color:'#1d4ed8', marginBottom:6 }}>
          📄 Editor de POP — Documentos da Qualidade
        </div>
        <div style={{ fontSize:12, color:'#3b82f6', marginBottom:12 }}>
          O texto abaixo aparece na aba "Documentos da Qualidade" para todos os colaboradores.
        </div>
        <textarea
          value={pop}
          onChange={e => setPop(e.target.value)}
          rows={10}
          placeholder="Cole ou escreva o POP aqui. Use linhas separadas para cada passo."
          style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #BFDBFE',
            fontSize:13, lineHeight:1.7, boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }}
        />
        <button onClick={savePop} style={{
          marginTop:10, padding:'9px 20px', borderRadius:8,
          background: popSaved ? '#1d4ed8' : '#2563eb', color:'#fff',
          fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
        }}>
          {popSaved ? '✓ Publicado!' : 'Publicar POP'}
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ navigate }) {
  const { w } = useBreakpoint();
  // admin guard removed for MVP — access via ?page=admin

  // Handle download for regular documents (not links)
  const handleDownload = async (doc) => {
    try {
      const dummyContent = `Conteúdo do documento: ${doc.name}\n\nGerado via Intranet.`;
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar o documento:", error);
      alert("Não foi possível baixar o documento no momento.");
    }
  };

  const adminModules = [
    { key:"rh",    label:"Gente e Gestão", color:"#7c3aed", bg:"#f5f3ff", icon:<ICONS.Users s={18}/>,  uploadKey:"rh" },
    { key:"qual",  label:"Qualidade", color:"#16a34a", bg:"#f0fdf4", icon:<ICONS.Clip s={18}/>,   uploadKey:"qualidade" },
  ];
  const [activeMod, setActiveMod]     = React.useState("rh");
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileNames, setFileNames] = React.useState({}); // Store custom names for files
  const [fileCategories, setFileCategories] = React.useState({}); // Store categories for RH files
  const [allowDownloadAdmin, setAllowDownloadAdmin] = React.useState(false);
  const [adminDocs, setAdminDocs]   = React.useState([]);
  const [indicators, setIndicators] = React.useState([]);
  const [adminPop, setAdminPop]     = React.useState('');
  const [categories, setCategories] = React.useState([]);
  const [newCatName, setNewCatName] = React.useState('');
  const [editingCat, setEditingCat] = React.useState(null);

  const mod = adminModules.find(m => m.key === activeMod);

  React.useEffect(() => {
    api.getIndicators()
      .then(j => setIndicators(Array.isArray(j.data) ? j.data : []))
      .catch(e => { console.error('indicators:', e); setIndicators([]); });
    api.getSetting('pop_texto')
      .then(j => setAdminPop(j.data || ''))
      .catch(() => setAdminPop(''));
  }, []);

  React.useEffect(() => {
    if (!mod) return;
    api.getDocs(mod.uploadKey)
      .then(j => setAdminDocs(Array.isArray(j.data) ? j.data : []))
      .catch(() => setAdminDocs([]));
    api.getCategories(mod.uploadKey)
      .then(j => setCategories(Array.isArray(j.data) ? j.data : []))
      .catch(() => setCategories([]));
  }, [activeMod]);

  const doneCt = uploadedFiles.filter(f => f.status==="done" && f.mod===activeMod).length;

  return (
    <div className="fade-up" style={{ minHeight:"calc(100vh-60px)", background:T.canvas }}>
      <div style={{ maxWidth:1400, margin:"0 auto", padding: w<480?"20px 14px 48px":"36px 32px 64px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:11, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
              ⚙️
            </div>
            <div>
              <h1 style={{ fontSize:20, fontWeight:800, color:T.dark, letterSpacing:"-0.02em" }}>Painel Administrativo</h1>
              <div style={{ fontSize:12, color:T.muted }}>Acesso restrito · {CURRENT_USER.displayName} · Intranet.Admin</div>
            </div>
          </div>
          <button onClick={() => navigate("home")} style={{
            display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:9,
            background:T.white, border:`1px solid ${T.border}`, fontSize:13, fontWeight:600, color:T.mid, cursor:"pointer",
          }}>
            <ICONS.ArrowL s={13}/> Início
          </button>
        </div>

        {/* Module selector */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          {adminModules.map(m => (
            <button key={m.key} onClick={() => setActiveMod(m.key)} style={{
              display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:9,
              background: activeMod===m.key ? m.bg : T.white,
              border:`1.5px solid ${activeMod===m.key ? m.color : T.border}`,
              color: activeMod===m.key ? m.color : T.mid,
              fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Upload panel */}
        {mod && (
          <div style={{ background:T.white, borderRadius:12, border:`1px solid ${T.border}`, padding: w<480?"18px":"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:T.dark }}>Publicar Documentos — {mod.label}</h2>
              <p style={{ fontSize:13, color:T.muted, marginTop:4 }}>
                Documentos publicados ficam visíveis para todos os colaboradores com acesso ao módulo.
              </p>
            </div>
            
            {/* POP Editor for Quality Team */}
            {mod.key === "qual" && (
              <div style={{ marginBottom:24, padding:20, background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:12 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#15803d', marginBottom:12 }}>
                  📄 Editor de POP — Documentos da Qualidade
                </div>
                <div style={{ fontSize:12, color:'#16a34a', marginBottom:12 }}>
                  O texto abaixo aparecerá na aba "Documentos da Qualidade" para todos os colaboradores.
                </div>
                <textarea
                  key={mod.key} // Force re-render when switching modules
                  value={adminPop}
		  onChange={e => setAdminPop(e.target.value)}
                  rows={8}
                  placeholder="Digite o POP aqui. Use linhas separadas para cada passo."
                  style={{ 
                    width:'100%', 
                    maxWidth:'100%',
                    minWidth:'100%',
                    padding:'12px', 
                    borderRadius:8, 
                    border:'1px solid #BBF7D0',
                    fontSize:14, 
                    lineHeight:1.6, 
                    boxSizing:'border-box', 
                    resize:'vertical', 
                    fontFamily:'inherit',
                    background:'#fff',
                    outline:'none',
                    minHeight:'120px',
                    display:'block',	
                    color:'#374151'
                  }}
                />
                <button 
                  onClick={async () => {
		      try {
		       await api.putSetting('pop_texto', adminPop);
  	               alert('POP publicado com sucesso!');
		  } catch(e) {
		    alert('Erro: ' + e.message);
		  }
		}}
                  style={{
                    marginTop:12, 
                    padding:'10px 20px', 
                    borderRadius:8,
                    background:'#16a34a', 
                    color:'#fff',
                    fontSize:13, 
                    fontWeight:600, 
                    border:'none', 
                    cursor:'pointer',
                    transition:'all 0.2s',
                    boxShadow:'0 2px 4px rgba(22, 163, 74, 0.2)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#15803d';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#16a34a';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Publicar POP
                </button>
              </div>
            )}

{/* Categories Manager */}
            <div style={{ marginBottom:24, padding:20, background:'#FAF5FF', border:'1px solid #D8B4FE', borderRadius:12 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#7c3aed', marginBottom:12 }}>🗂️ Categorias — {mod.label}</div>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <input
                  type="text"
                  placeholder="Nova categoria..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{ flex:1, padding:'8px 12px', borderRadius:7, border:'1px solid #D8B4FE', fontSize:13 }}
                />
                <button onClick={async () => {
                  if (!newCatName.trim()) return;
                  try {
                    const r = await api.createCategory({ module_key: mod.uploadKey, name: newCatName.trim() });
                    setCategories(prev => [...prev, r.data]);
                    setNewCatName('');
                  } catch(e) { alert('Erro: ' + e.message); }
                }} style={{ padding:'8px 16px', borderRadius:7, background:'#7c3aed', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  + Adicionar
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {categories.length === 0 && <div style={{ fontSize:13, color:'#9ca3af' }}>Nenhuma categoria. Adicione acima.</div>}
                {categories.map(cat => (
                  <div key={cat.id} style={{ display:'flex', gap:8, alignItems:'center', background:'#fff', padding:'8px 12px', borderRadius:8, border:'1px solid #E9D5FF' }}>
                    {editingCat?.id === cat.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCat.name}
                          onChange={e => setEditingCat(prev => ({ ...prev, name: e.target.value }))}
                          style={{ flex:1, padding:'6px 10px', borderRadius:6, border:'1px solid #D8B4FE', fontSize:13 }}
                        />
                        <button onClick={async () => {
                          try {
                            const r = await api.updateCategory(cat.id, { name: editingCat.name });
                            setCategories(prev => prev.map(c => c.id === cat.id ? r.data : c));
                            setEditingCat(null);
                          } catch(e) { alert('Erro: ' + e.message); }
                        }} style={{ padding:'6px 12px', borderRadius:6, background:'#7c3aed', color:'#fff', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                          Salvar
                        </button>
                        <button onClick={() => setEditingCat(null)} style={{ padding:'6px 10px', borderRadius:6, background:'none', border:'1px solid #d1d5db', cursor:'pointer', fontSize:12 }}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex:1, fontSize:13, color:'#374151' }}>{cat.name}</span>
                        <button onClick={() => setEditingCat(cat)} style={{ padding:'5px 10px', borderRadius:6, background:'none', border:'1px solid #D8B4FE', color:'#7c3aed', cursor:'pointer', fontSize:12 }}>
                          ✏️ Editar
                        </button>
                        <button onClick={async () => {
                          if (!confirm(`Excluir categoria "${cat.name}"?`)) return;
                          try {
                            await api.deleteCategory(cat.id);
                            setCategories(prev => prev.filter(c => c.id !== cat.id));
                          } catch(e) { alert('Erro: ' + e.message); }
                        }} style={{ padding:'5px 10px', borderRadius:6, background:'none', border:'1px solid #fca5a5', color:'#ef4444', cursor:'pointer', fontSize:12 }}>
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Indicators Editor for Quality Team */}
            {mod.key === "qual" && (
  <div style={{ marginBottom:24, padding:20, background:'#EFF6FF', border:'1px solid #93C5FD', borderRadius:12 }}>

    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ fontWeight:700, fontSize:14, color:'#1d4ed8' }}>
        📊 Editor de Indicadores — Qualidade
      </div>

      <button onClick={async () => {
        try {
          const created = await api.createIndicator({
            label: 'Novo Indicador',
            value: '0',
            color: '#1a56db'
          });
          setIndicators(prev => [...prev, created.data]);
        } catch(e) {
          alert('Erro: ' + e.message);
        }
      }} style={{
        padding:'6px 14px',
        borderRadius:7,
        background:'#2563eb',
        color:'#fff',
        border:'none',
        cursor:'pointer',
        fontSize:12,
        fontWeight:600
      }}>
        + Adicionar
      </button>
    </div>

    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {(indicators || []).map((ind,i) => (
        <div key={ind.id || i} style={{
          background:'#fff',
          borderRadius:8,
          padding:12,
          border:'1px solid #DBEAFE',
          display:'flex',
          gap:8,
          alignItems:'center'
        }}>

          <input
            value={ind.label}
            placeholder="Label"
            onChange={e => {
              const u=[...indicators];
              u[i]={...u[i],label:e.target.value};
              setIndicators(u);
            }}
            style={{ flex:2, padding:'7px 10px', borderRadius:6, border:'1px solid #DBEAFE' }}
          />

          <input
            value={ind.value}
            placeholder="Valor"
            onChange={e => {
              const u=[...indicators];
              u[i]={...u[i],value:e.target.value};
              setIndicators(u);
            }}
            style={{ flex:1, padding:'7px 10px', borderRadius:6, border:'1px solid #DBEAFE' }}
          />

          <input
            type="color"
            value={ind.color || '#1a56db'}
            onChange={e => {
              const u=[...indicators];
              u[i]={...u[i],color:e.target.value};
              setIndicators(u);
            }}
            style={{ width:36, height:34 }}
          />

          <button onClick={async () => {
            if (!ind.id) return;
            try {
              await api.updateIndicator(ind.id, ind);
              alert('Salvo!');
            } catch(e) {
              alert('Erro: ' + e.message);
            }
          }}>
            💾
          </button>

          <button onClick={async () => {
            if (!ind.id) return;
            if (!confirm('Excluir?')) return;
            try {
              await api.deleteIndicator(ind.id);
              setIndicators(prev => prev.filter(x => x.id !== ind.id));
            } catch(e) {
              alert('Erro: ' + e.message);
            }
          }}>
            🗑️
          </button>

        </div>
      ))}
    </div>

  </div>
)}
            
            {/* File naming box for RH and Qualidade */}
            {(mod.key === "rh" || mod.key === "qual") && uploadedFiles.filter(f => f.mod === activeMod && f.status === "done").length > 0 && (
              <div style={{ marginBottom:20, padding:16, background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:12 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'#92400e', marginBottom:10 }}>
                  📝 Nomear Arquivos para Publicação
                </div>
                <div style={{ fontSize:12, color:'#b45309', marginBottom:12 }}>
                  Atribua nomes personalizados aos arquivos antes de publicar:
                </div>
                {uploadedFiles.filter(f => f.mod === activeMod && f.status === "done").map(file => (
                  <div key={file.id} style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12, padding:12, background:'#fff', borderRadius:8, border:'1px solid #E5E7EB' }}>
                    <div style={{ fontSize:12, color:'#374151', fontWeight:600 }}>
                      {file.file?.name || 'arquivo.pdf'}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <input
                        type="text"
                        placeholder="Nome personalizado (opcional)"
                        defaultValue={fileNames[file.id] || ''}
                        onChange={e => setFileNames(prev => ({ ...prev, [file.id]: e.target.value }))}
                        style={{
                          flex:1,
                          padding:'6px 10px',
                          borderRadius:6,
                          border:'1px solid #D1D5DB',
                          fontSize:12,
                          background:'#fff',
                          color:'#374151'
                        }}
                      />
                      {mod.key === "rh" && (
                        <select
                          defaultValue={fileCategories[file.id] || ''}
                          onChange={e => setFileCategories(prev => ({ ...prev, [file.id]: e.target.value }))}
                          style={{
                            padding:'6px 10px',
                            borderRadius:6,
                            border:'1px solid #D1D5DB',
                            fontSize:12,
                            background:'#fff',
                            color:'#374151',
                            minWidth:150
                          }}

			>
                          <option value="">Selecione categoria</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <FileUploadZone
              moduleKey={mod.uploadKey}
              uploadedFiles={uploadedFiles.filter(f => f.mod===activeMod)}
              setUploadedFiles={updater => setUploadedFiles(prev => {
                const next = typeof updater==="function" ? updater(prev) : updater;
                return next.map(f => f.mod ? f : { ...f, mod: activeMod });
              })}
            />
            {doneCt > 0 && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <input
                    type="checkbox"
                    id="allowDownloadAdminCheck"
                    checked={allowDownloadAdmin}
                    onChange={e => setAllowDownloadAdmin(e.target.checked)}
                    style={{ cursor:'pointer', width:18, height:18 }}
                  />
                  <label htmlFor="allowDownloadAdminCheck" style={{ cursor:'pointer', fontSize:13, color:T.dark, userSelect:'none' }}>
                    Permitir download destes documentos
                  </label>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <button 
                  onClick={async () => {
                    const filesToPublish = uploadedFiles.filter(
                      (f) => f.status === "done" && f.mod === activeMod
                    );

                    let successCount = 0;
                    for (const file of filesToPublish) {
                      try {
                        const formData = new FormData();

                        formData.append("file", file.file);
                        formData.append("moduleKey", mod.uploadKey);
                        formData.append(
                          "category",
                          fileCategories[file.id] || "Geral"
                        );
                        formData.append(
                          "name",
                          fileNames[file.id] ||
                            file.file?.name ||
                            "documento"
                        );
		        formData.append("allowDownload", String(allowDownloadAdmin));
                        const res = await fetch("/api/v1/documents", {
                          method: "POST",
                          body: formData,
                        });
                        if (res.ok) {
                          successCount++;
                        } else {
                          console.error(
                            "Erro:",
                            await res.json().catch(() => ({}))
                          );
                        }
                      } catch (e) {
                        console.error("Fetch falhou:", e);
                      }
                    }
                    alert(
                      `${successCount} arquivo(s) publicado(s) com sucesso em ${mod.label}!`
                    );
                    setUploadedFiles((prev) =>
                      prev.filter(
                        (f) =>
                          !(
                            f.status === "done" &&
                            f.mod === activeMod
                          )
                      )
                    );
                    setFileNames((prev) => {
                      const n = { ...prev };
                      filesToPublish.forEach((f) => {
                        delete n[f.id];
                      });
                      return n;
                    });
                    setFileCategories((prev) => {
                      const n = { ...prev };

                      filesToPublish.forEach((f) => {
                        delete n[f.id];
                      });

                      return n;
                    });
                  }}
                    
                  style={{
                    display:"inline-flex", alignItems:"center", gap:7,
                    padding:"10px 22px", borderRadius:9,
                    background:mod.color, color:"#fff",
                    fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                    transition:"opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity="0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity="1"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Publicar ({doneCt})
                </button>
                <span style={{ fontSize:12, color:T.muted }}>Registrado com assinatura AD e timestamp.</span>
              </div>
	    </div>
            )}

            {/* Existing docs in this module */}
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:12 }}>
                Documentos publicados em {mod.label}
              </div>
              <DocList docs={adminDocs} onDownload={handleDownload} onDelete={async (id) => {
                if (!confirm('Excluir este documento?')) return;
                try {
                  await api.deleteDoc ? api.deleteDoc(id) : fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
                  setAdminDocs(prev => prev.filter(d => d.id !== id));
                } catch(e) { alert('Erro ao excluir: ' + e.message); }
              }} canEdit={true}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 19. GENERIC PLACEHOLDER
// ══════════════════════════════════════════════════════════════
const PAGE_META = {
  ramais: { title:"Catálogo de Ramais", icon:<ICONS.Phone s={32}/>, desc:"Diretório completo de ramais, setores e contatos de emergência." },
  protocolos: { title:"Protocolos Clínicos", icon:<ICONS.Clip s={32}/>, desc:"Biblioteca completa de protocolos médicos e diretrizes." },
  biblioteca: { title:"Biblioteca Médica", icon:<ICONS.Book s={32}/>, desc:"Artigos científicos, guidelines e materiais de educação continuada." },
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
        textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
        border:`1px solid ${T.border}`, maxWidth:420, width:"100%",
      }}>
        <div style={{
          width:64, height:64, borderRadius:"50%", background:T.blueLight,
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 18px", color:T.blue,
        }}>{meta.icon}</div>
        <h1 style={{ fontSize:20, fontWeight:700, color:T.dark, letterSpacing:"-0.02em", marginBottom:9 }}>{meta.title}</h1>
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:24 }}>{meta.desc}</p>
        <div style={{ marginBottom:24 }}>
          {[68,48,58].map((ww,i) => (
            <div key={i} className="skeleton" style={{ height:8, width:`${ww}%`, margin:"6px auto" }}/>
          ))}
        </div>
        <button onClick={() => navigate("home")} style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:9,
          background:T.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
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

// ── Page router ───────────────────────────────────────────────
function PageView({ pageName, navigate }) {
  if (pageName === "rh")        return <RHPage       navigate={navigate}/>;
  if (pageName === "qualidade") return <QualidadePage navigate={navigate}/>;
  if (pageName === "suporte")   return <SuportePage  navigate={navigate}/>;
  if (pageName === "admin")     return <AdminPanel   navigate={navigate}/>;
  return <GenericPlaceholder pageName={pageName} navigate={navigate}/>;
}

// ══════════════════════════════════════════════════════════════
// 17. APP ROOT
// ══════════════════════════════════════════════════════════════
function MainApp() {
  const initialPage = new URLSearchParams(window.location.search).get("page") || "home";
  const [page, setPage] = React.useState(initialPage);
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
