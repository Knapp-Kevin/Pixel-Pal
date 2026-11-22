import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';

const raw = execFileSync('git', ['ls-files','-z'], {encoding:'utf8'});
const paths = raw.split('\0').filter(Boolean);
const files=[];
const skipped=[];
const potentialSecrets=[];
const contactReferences=[];
const signatures = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['github-token', /(?:ghp_|gho_|ghu_|ghs_|github_pat_)[A-Za-z0-9_]{20,}/g],
  ['cloud-token', /(?:AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|sk_live_[0-9a-zA-Z]{20,}|rk_live_[0-9a-zA-Z]{20,})/g],
  ['assigned-secret', /^\s*(?:export\s+)?[A-Z_]*(?:TOKEN|PASSWORD|SECRET|API_KEY|PRIVATE_KEY)\s*[:=]\s*['"]?[A-Za-z0-9+/_=-]{24,}/gm]
];
for(const path of paths){
  const bytes = await readFile(path);
  if(bytes.length > 3_000_000 || bytes.includes(0)){
    skipped.push(path);
    continue;
  }
  const content=bytes.toString('utf8');
  if(content.includes('\uFFFD') && !/^\w*\.svg$/i.test(path)){
    skipped.push(path);
    continue;
  }
  files.push(path);
  for(const [kind, pattern] of signatures){
    pattern.lastIndex=0;
    for(const match of content.matchAll(pattern)){
      const line=content.slice(0,match.index).split('\n').length;
      potentialSecrets.push({path,line,kind});
    }
  }
  for(const match of content.matchAll(/[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)){
    if(/example|noreply|test\.invalid|localhost/i.test(match[0]))continue;
    contactReferences.push({path,line:content.slice(0,match.index).split('\n').length});
  }
}
const report={evidenceClass:'tracked-working-tree-source-check',filesScanned:files.length,filesSkipped:skipped.length,skippedPaths:skipped,potentialSecrets,contactReferences};
await mkdir(resolve('artifacts'),{recursive:true});
await writeFile(resolve('artifacts/public-source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log('Checked '+files.length+' tracked text files; '+potentialSecrets.length+' high-confidence secret patterns; '+contactReferences.length+' contact-like references. Binary files and history require separate review.');
if(potentialSecrets.length)throw new Error('Potential source secrets found: inspect artifacts/public-source-audit.json without printing the secret values.');
