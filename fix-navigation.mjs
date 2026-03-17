import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const appPath = join('hospital-intranet', 'src', 'App.jsx');
let content = readFileSync(appPath, 'utf8');

// Replace the entire navItems.map section with the correct implementation
const oldNavRenderer = content.match(/navItems\.map\(\([^}]+\}\s*=>\s*\{[\s\S]*?label,[^}]*external[^}]*\}[^}]*\)[\s\S]*?[\s\S]*?\{[\s\S]*?[^}]*\}[\s\S]*?[^}]*\}[^}]*\}/g);

const newNavRenderer = `navItems.map((item, idx) => {
  if (item.external && !item.children) return (
    <a key={idx} href={item.external} target="_blank" rel="noopener noreferrer" className="nav-btn">
      <span>{item.label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
    </a>
  );
  if (item.children) return <NavDropdown key={idx} item={item} page={page} go={go} T={T} />;
  const active = page === item.p;
  return (
    <button key={idx} onClick={() => go(item.p)} className={active ? "" : "nav-btn"}>
      <span>{item.label}</span>
    </button>
  );
});`;

if (oldNavRenderer) {
  content = content.replace(oldNavRenderer, newNavRenderer);
  console.log('✅ Navigation renderer updated!');
  console.log('📋 Changes:');
  console.log('  - Fixed navItems.map destructuring');
  console.log('  - Proper NavDropdown usage');
  console.log('  - Correct button rendering');
  console.log('  - Fixed active state logic');
} else {
  console.log('❌ Could not find navigation renderer to update');
}

writeFileSync(appPath, content, 'utf8');
