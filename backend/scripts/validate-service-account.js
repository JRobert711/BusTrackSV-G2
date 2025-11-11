const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const credsPath = path.join(backendRoot, 'src', 'config', 'firebase-adminsdk.json');
const envPath = path.join(backendRoot, '.env');

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('ERROR: Failed to read/parse JSON file:', file, e.message);
    process.exit(2);
  }
}

function readEnv(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (m) acc[m[1]] = m[2];
      return acc;
    }, {});
  } catch (e) {
    return {};
  }
}

console.log('Validating service account JSON and .env...');

const creds = readJson(credsPath);
const env = readEnv(envPath);

const results = [];

// Required fields
const required = ['type','project_id','private_key','client_email','token_uri'];
for (const k of required) {
  if (!creds[k]) {
    results.push({level:'error', text:`Missing required key in JSON: ${k}`});
  } else {
    results.push({level:'ok', text:`Found key ${k}`});
  }
}

// Check project_id consistency with .env FIREBASE_PROJECT_ID
if (env.FIREBASE_PROJECT_ID) {
  if (env.FIREBASE_PROJECT_ID === creds.project_id) {
    results.push({level:'ok', text:`.env FIREBASE_PROJECT_ID matches JSON project_id (${creds.project_id})`});
  } else {
    results.push({level:'warn', text:`.env FIREBASE_PROJECT_ID='${env.FIREBASE_PROJECT_ID}' differs from JSON project_id='${creds.project_id}'`});
  }
} else {
  results.push({level:'info', text:`.env has no FIREBASE_PROJECT_ID defined`});
}

// Check GOOGLE_APPLICATION_CREDENTIALS path in .env
if (env.GOOGLE_APPLICATION_CREDENTIALS) {
  const resolved = path.resolve(backendRoot, env.GOOGLE_APPLICATION_CREDENTIALS);
  const exists = fs.existsSync(resolved);
  results.push({level: exists ? 'ok' : 'error', text:`GOOGLE_APPLICATION_CREDENTIALS -> ${env.GOOGLE_APPLICATION_CREDENTIALS} (resolved: ${resolved}) exists=${exists}`});
} else {
  results.push({level:'info', text:`.env has no GOOGLE_APPLICATION_CREDENTIALS defined`});
}

// Private key checks
if (creds.private_key) {
  const pk = creds.private_key;
  const begins = pk.indexOf('-----BEGIN PRIVATE KEY-----') !== -1;
  const ends = pk.indexOf('-----END PRIVATE KEY-----') !== -1;
  const hasEscapedNewlines = pk.includes('\\n');
  results.push({level: begins && ends ? 'ok' : 'error', text:`private_key contains BEGIN/END markers: begins=${begins} ends=${ends}`});
  results.push({level: hasEscapedNewlines ? 'info' : 'ok', text:`private_key includes literal "\\n" sequences: ${hasEscapedNewlines}`});

  // Check for common placeholder text
  const placeholders = ['your-project-id','Your-Private-Key-Here','xxxxx','<PRIVATE_KEY>','REPLACE_ME'];
  const hasPlaceholder = placeholders.some(p => pk.includes(p));
  results.push({level: hasPlaceholder ? 'error' : 'ok', text:`private_key contains placeholder text: ${hasPlaceholder}`});

  // Rough validity: length
  if (pk.length < 200) {
    results.push({level:'warn', text:`private_key length looks short (${pk.length} chars)`});
  } else {
    results.push({level:'ok', text:`private_key length: ${pk.length} chars`});
  }
}

// token_uri check
if (creds.token_uri && creds.token_uri.includes('oauth2')) {
  results.push({level:'ok', text:`token_uri looks correct: ${creds.token_uri}`});
} else {
  results.push({level:'warn', text:`token_uri may be missing or unusual: ${creds.token_uri}`});
}

// client_email format
if (creds.client_email && creds.client_email.includes('@')) {
  results.push({level:'ok', text:`client_email appears valid: ${creds.client_email}`});
} else {
  results.push({level:'error', text:`client_email missing or invalid: ${creds.client_email}`});
}

// project_id string
if (creds.project_id && typeof creds.project_id === 'string') {
  results.push({level:'ok', text:`project_id: ${creds.project_id}`});
} else {
  results.push({level:'error', text:`project_id missing or not a string`});
}

// Summarize
let exitCode = 0;
console.log('--- Validation results ---');
for (const r of results) {
  const marker = r.level === 'ok' ? '[OK]' : r.level === 'info' ? '[INFO]' : r.level === 'warn' ? '[WARN]' : '[ERROR]';
  console.log(`${marker} ${r.text}`);
  if (r.level === 'error') exitCode = 2;
  if (r.level === 'warn' && exitCode === 0) exitCode = 1;
}

process.exit(exitCode);
