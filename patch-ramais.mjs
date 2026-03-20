import { readFileSync, writeFileSync } from 'fs';
const file = 'C:/Users/caiofaria/Documents/fubog/Landing-page/hospital-intranet/src/App.jsx';
let f = readFileSync(file, 'utf8');

const oldLink = `"https://docs.google.com/spreadsheets/d/1DmqEfls0WleuTSe4UtiU5RTno5dQG6TIMINAxYApCzw/edit?gid=0#gid=0"`;
const newLink = `"/ramais.pdf"`;

if (f.includes(oldLink)) {
  f = f.replace(new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newLink);
  writeFileSync(file, f, 'utf8');
  console.log('✅ Done! Catálogo de Ramais now points to /ramais.pdf');
} else {
  console.error('ERROR: Google Sheets link not found.');
}
