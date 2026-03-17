const fs = require('fs');
let src = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Change user name to Colaborador
src = src.replace('displayName: "Dr. Carlos Silva"', 'displayName: "Colaborador"');
src = src.replace('givenName:   "Carlos"',            'givenName:   "Colaborador"');
src = src.replace('surname:     "Silva"',             'surname:     ""');
src = src.replace('initials:    "CS"',                'initials:    "CO"');

// 2. Remove email line from dropdown header
src = src.replace(/\s*<div style=\{\{ fontSize:11, color:T\.muted, marginTop:2 \}\}>\{user\?\.mail\}<\/div>/, '');

// 3. Remove jobTitle badge from dropdown header
src = src.replace(/\s*<div style=\{\{\s*display:"inline-block", marginTop:6,\s*padding:"2px 8px", borderRadius:20,\s*background:T\.blue\+"22", color:T\.blue,\s*fontSize:10, fontWeight:600,\s*\}\}>\s*\{user\?\.jobTitle\}\s*<\/div>/, '');

// 4. Remove the three dropdown menu items (Meu Perfil, Configurações, Segurança do AD)
src = src.replace(/\s*\{\[\s*\{ icon:<ICONS\.User s=\{14\}\/>, label:"Meu Perfil" \},[\s\S]*?\.map\(item => \([\s\S]*?\)\)\}/, '');

fs.writeFileSync('src/App.jsx', src, 'utf8');
console.log('Done! Changes applied.');

// Verify
const result = fs.readFileSync('src/App.jsx', 'utf8');
console.log('Name check:', result.includes('Colaborador') ? 'OK' : 'FAILED');
console.log('Email removed:', !result.includes('user?.mail') ? 'OK' : 'FAILED');
console.log('Menu items removed:', !result.includes('Meu Perfil') ? 'OK' : 'FAILED');
