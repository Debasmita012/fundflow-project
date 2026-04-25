// api.js — connects frontend to backend
// Save in: fundflow-fraud-detection/api.js

const API = 'https://fundflow-project.onrender.com';

// Load real accounts from backend DB
async function loadAccountsFromBackend() {
  try {
    const res = await fetch(`${API}/api/accounts/`);
    const data = await res.json();
    if (data && data.length > 0) {
      console.log(`Backend: loaded ${data.length} accounts`);
      return data.map(a => ({
        id: a.id, name: a.name, type: a.type,
        risk: a.risk, riskScore: a.risk_score,
        income: a.declared_income,
        inflow: a.inflow_30d, outflow: a.outflow_30d,
        connections: a.connections
      }));
    }
  } catch(e) {
    console.log('Backend not reachable, using demo data');
  }
  return null;
}

// Load real alerts from backend DB
async function loadAlertsFromBackend() {
  try {
    const res = await fetch(`${API}/api/alerts/`);
    const data = await res.json();
    if (data && data.length > 0) {
      return data.map(a => ({
        name: a.name, desc: a.desc,
        amount: a.amount, time: 'just now',
        risk: a.risk_level,
        type: 'corporate',
        amountClass: a.amount_class
      }));
    }
  } catch(e) {}
  return null;
}

// Generate STR report via Anthropic API
async function generateReportFromBackend(caseId) {
  try {
    const res = await fetch(`${API}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId || 'FD-2026-00842',
        pattern: 'Round-Trip Fund Transfer',
        risk_score: 84, total_amount: 1845000,
        accounts: [], transactions: []
      })
    });
    const data = await res.json();
    return data.report;
  } catch(e) {
    console.log('Report generation failed:', e);
    return null;
  }
}

// Connect WebSocket for live transactions
function connectLiveStream() {
  const ws = new WebSocket('wss://fundflow-project.onrender.com/ws/stream');
  ws.onopen = () => console.log('Live stream connected');
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'transaction') {
      console.log('Live txn:', msg.data);
      // Show live dot pulse on dashboard
      const dot = document.querySelector('.live-dot');
      if (dot) { dot.style.background = '#FF4757'; setTimeout(() => dot.style.background = '', 300); }
    }
    if (msg.type === 'alert') {
      console.log('New alert:', msg.data);
    }
  };
  ws.onclose = () => setTimeout(connectLiveStream, 3000); // auto-reconnect
  return ws;
}

// Run on page load
async function initBackendConnection() {
  console.log('Connecting to backend...');

  // Try to load real accounts
  const backendAccounts = await loadAccountsFromBackend();
  if (backendAccounts && typeof accounts !== 'undefined') {
    // Merge backend data with frontend array
    backendAccounts.forEach(ba => {
      const idx = accounts.findIndex(a => a.id === ba.id);
      if (idx >= 0) accounts[idx] = { ...accounts[idx], ...ba };
    });
    console.log('Accounts updated from backend DB');
  }

  // Try to load real alerts
  const backendAlerts = await loadAlertsFromBackend();
  if (backendAlerts) {
    if (typeof alertData !== 'undefined') {
      alertData.length = 0;
      backendAlerts.forEach(a => alertData.push(a));
    }
    if (typeof renderAlerts === 'function') {
      renderAlerts('alertFeed', backendAlerts);
      renderAlerts('alertFeedFull', backendAlerts);
    }
    console.log('Alerts updated from backend DB');
  }

  // Start live WebSocket stream
  connectLiveStream();

  console.log('Backend connection complete.');
}

document.addEventListener('DOMContentLoaded', initBackendConnection);