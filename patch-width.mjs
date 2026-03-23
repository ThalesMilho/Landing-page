import { readFileSync, writeFileSync } from 'fs';
const file = 'C:/Users/caiofaria/Documents/fubog/Landing-page/hospital-intranet/src/App.jsx';
let f = readFileSync(file, 'utf8');

// Fix home page max width - likely 900px or similar, change to 1400px
f = f.replace(/maxWidth:\s*900,\s*margin:"0 auto"/g, 'maxWidth:1400, margin:"0 auto"');
f = f.replace(/maxWidth:\s*"900px"/g, 'maxWidth:"1400px"');
f = f.replace(/maxWidth:\s*1000,\s*margin:"0 auto"/g, 'maxWidth:1400, margin:"0 auto"');
f = f.replace(/maxWidth:\s*1100,\s*margin:"0 auto"/g, 'maxWidth:1400, margin:"0 auto"');

// Fix header max width too
f = f.replace(/maxWidth:\s*1280/g, 'maxWidth:1600');

console.log('✅ Done! Rebuild and redeploy.');
writeFileSync(file, f, 'utf8');
