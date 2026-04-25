// ===================================================
// AI_CHAT.JS — AI Co-Investigator (Smart Local Fallback)
// Works WITHOUT backend — uses rich case data for responses
// ===================================================

let aiChatOpen = false;
let aiChatHistory = [];

const BACKEND_URL = 'https://fundflow-project.onrender.com';

const SYSTEM_PROMPT = `You are an expert financial crime investigator AI co-assistant for the FundFlow platform at a bank.
You have deep knowledge of money laundering patterns, AML regulations (PMLA 2002), and fraud detection.

CASE: FD-2026-00842
Primary Subject: Rajesh Mehta Enterprises (A/C A001)
Pattern: Circular round-trip fund transfer
Risk Score: 84/100

ACCOUNT DATA:
- A001: Rajesh Mehta Enterprises | Corporate | Risk: FRAUD | Score: 84 | Income: ₹6,00,000 | Inflow: ₹18,45,000 | Outflow: ₹17,80,000
- A002: Shell Corp A | Corporate | Risk: FRAUD | Score: 92 | Income: Not Declared | Inflow: ₹12,30,000
- A003: Dormant 7823 | Savings | Risk: SUSPICIOUS | Score: 71 | Inactive 18 months
- A004: Partner Entity B | Current | Risk: SUSPICIOUS | Score: 65
- A007: Kumar Trading | Corporate | Risk: SUSPICIOUS | Score: 58 | 32 txns in 2 hours
- A012: Shell Corp B | Corporate | Risk: FRAUD | Score: 88 | Income: Not Declared
- A016: Mule Account X1 | Savings | Risk: FRAUD | Score: 95 | Income: ₹1,80,000 | Inflow: ₹45,00,000

TRANSACTION SEQUENCE:
1. A001 → A002: ₹4,95,000 NEFT 09:15 (14 Mar)
2. A002 → A003: ₹4,90,000 RTGS 10:42
3. A003 → A004: ₹4,85,000 NEFT 14:08
4. A004 → A001: ₹4,80,000 UPI 17:55 [ROUND-TRIP COMPLETE]
5. A001: ₹49,900 ATM 08:30 (15 Mar) [STRUCTURING]
6. A001: ₹49,800 ATM 09:15 (15 Mar) [STRUCTURING]

KEY RED FLAGS:
- Round-trip completed in 8h 40m, ₹15,000 lost in transit
- A001 income mismatch: 3.07× ratio (₹6L declared vs ₹18.45L monthly flow)
- A002 Shell Corp registered 3 months ago, no business purpose
- A003 dormant 18 months then suddenly activated
- Two ATM withdrawals just below ₹50,000 reporting threshold
- A016: ₹45L through account with ₹1.8L declared income (25× ratio)

Respond as a forensic financial crime analyst. Be concise. Cite specific account IDs, amounts, timestamps.`;

// ===================================================
// SMART LOCAL RESPONSE ENGINE
// Generates context-aware answers without any backend
// ===================================================
function generateLocalAIResponse(question) {
  const q = question.toLowerCase();
  
  const localAccounts = (typeof accounts !== 'undefined') ? accounts : [];
  const localTxns = (typeof transactions !== 'undefined') ? transactions : [];

  // Helper: find account by mention in question
  function findMentionedAccount() {
    for (let a of localAccounts) {
      if (q.includes(a.id.toLowerCase()) || q.includes(a.name.toLowerCase().split(' ')[0])) {
        return a;
      }
    }
    return null;
  }

  const mentioned = findMentionedAccount();

  // ─── A001 / Rajesh specific ───────────────────────
  if (q.includes('a001') || q.includes('rajesh')) {
    return `**A001 — Rajesh Mehta Enterprises** — Risk Score: **84/100** 🔴 FRAUD\n\n` +
      `**Why it's suspicious:**\n` +
      `• **Income Mismatch 3.07×** — Declared annual income ₹6,00,000 vs actual monthly flow ₹18,45,000\n` +
      `• **Round-Trip Originator** — Initiated a 4-account circular pattern (A001 → A002 → A003 → A004 → A001)\n` +
      `• **Structuring Detected** — Two ATM withdrawals of ₹49,900 & ₹49,800 on 15 Mar (just below ₹50K reporting threshold)\n` +
      `• **Shell Entity Connection** — Directly linked to Shell Corp A (A002, Risk 92) with no declared business purpose\n` +
      `• **Cycle Completed in 8h 40m** — ₹18,45,000 laundered; only ₹15,000 lost in transit (0.08%)\n\n` +
      `**PMLA 2002 Action Required:**\n` +
      `• File STR with FIU-IND under Section 12\n` +
      `• Freeze account pending investigation\n` +
      `• Issue RFI to Shell Corp A's registered bank branch`;
  }

  // ─── A002 / Shell Corp A ─────────────────────────
  if (q.includes('a002') || q.includes('shell corp a')) {
    return `**A002 — Shell Corp A** — Risk Score: **92/100** 🔴 CRITICAL\n\n` +
      `**Key Indicators:**\n` +
      `• No declared business purpose or income — registered only 3 months ago\n` +
      `• Received ₹4,95,000 from A001 via NEFT at 09:15 and forwarded ₹4,90,000 to Dormant 7823 within 87 minutes (rapid layering)\n` +
      `• Total flow: ₹12,30,000 in / ₹12,25,000 out (₹5,000 retained — likely fee)\n` +
      `• Classic **intermediary shell** in round-trip layering\n` +
      `• Additional inflow: ₹8,90,000 from Mule Account X1 (A016)\n\n` +
      `**PMLA 2002 Action:** STR mandatory. Request corporate registration investigation with MCA.`;
  }

  // ─── A016 / Mule Account ────────────────────────
  if (q.includes('a016') || q.includes('mule')) {
    return `**A016 — Mule Account X1** — Risk Score: **95/100** 🔴 EXTREME RISK\n\n` +
      `**This is the highest-risk account in the network:**\n` +
      `• **Income Mismatch 25×** — Declared income ₹1,80,000/yr vs ₹45,00,000 inflow in 30 days\n` +
      `• 8 counterparty connections — widest network of any account\n` +
      `• Participates in RING-002 (Mule Network Beta) alongside A007, A010, A012\n` +
      `• Inflow → A002 (₹8,90,000 RTGS) — funds fed back into primary fraud ring\n\n` +
      `**Forensic Classification:** This account exhibits classic mule profile — low-income individual used as fund conduit.\n` +
      `**Immediate Action:** Freeze. File STR. Alert cybercrime cell for potential human trafficking/coercion investigation.`;
  }

  // ─── Round-trip / pattern ───────────────────────
  if (q.includes('round') || q.includes('circular') || q.includes('pattern') || q.includes('ring')) {
    return `**Round-Trip Circular Laundering Pattern — Case FD-2026-00842**\n\n` +
      `**The Pattern (4-account ring, RING-001):**\n` +
      `\`\`\`\nA001 → A002 → A003 → A004 → A001\n₹4.95L   ₹4.90L   ₹4.85L   ₹4.80L\n09:15    10:42    14:08    17:55\n\`\`\`\n` +
      `• Total laundered: **₹18,45,000**\n` +
      `• Leakage: ₹15,000 (0.08%) — paid as intermediary fees\n` +
      `• Completed in **8 hours 40 minutes**\n\n` +
      `**Why this is textbook layering:**\n` +
      `• Placement → Integration done in one cycle\n` +
      `• Dormant account reactivated to obscure trail (A003)\n` +
      `• Shell with no business purpose as conduit (A002)\n` +
      `• Profile-mismatched entity as exit node (A004, declared ₹15L vs actual ₹8.4L/month)\n\n` +
      `**Second Ring Detected (RING-002):** A007 → A010 → A012 → A016 — ₹32,00,000 over 6 hours`;
  }

  // ─── Structuring ────────────────────────────────
  if (q.includes('structur') || q.includes('smurfing') || q.includes('atm') || q.includes('49,900') || q.includes('49,800')) {
    return `**Structuring (Smurfing) Detected — A001**\n\n` +
      `On 15 March 2026, the day after the round-trip completed:\n` +
      `• **08:30** — ATM withdrawal ₹49,900\n` +
      `• **09:15** — ATM withdrawal ₹49,800\n` +
      `• **Combined:** ₹99,700 in cash (below ₹1L CTR threshold)\n\n` +
      `**Why this is structuring:**\n` +
      `• Both amounts deliberately kept just below ₹50,000 (mandatory bank reporting threshold per RBI guidelines)\n` +
      `• Two withdrawals within 45 minutes — clearly intentional splitting\n` +
      `• Pattern consistent with **PMLA 2002 Section 12** violation\n\n` +
      `**Recommended Action:** File Currency Transaction Report (CTR) and Suspicious Activity Report (SAR) to FIU-IND immediately.`;
  }

  // ─── Dormant account ────────────────────────────
  if (q.includes('dormant') || q.includes('a003') || q.includes('7823')) {
    return `**A003 — Dormant 7823** — Risk Score: **71/100** 🟠 SUSPICIOUS\n\n` +
      `**Red Flags:**\n` +
      `• Inactive for **18 months** before sudden activation\n` +
      `• Received ₹4,90,000 from Shell Corp A (A002) via RTGS at 10:42\n` +
      `• Forwarded ₹4,85,000 to Partner Entity B (A004) via NEFT at 14:08\n` +
      `• Net "received" in transit: ₹5,000 (fee)\n` +
      `• No legitimate economic explanation for reactivation\n\n` +
      `**Why dormant accounts are used in laundering:**\n` +
      `• Older accounts have established banking history — less likely to trigger new-account alerts\n` +
      `• KYC records may be outdated, making tracing harder\n` +
      `• Pattern consistent with **"hibernation" laundering technique**\n\n` +
      `**Action:** Contact account holder. If unresponsive in 48h, freeze and file STR.`;
  }

  // ─── Next steps ─────────────────────────────────
  if (q.includes('next step') || q.includes('recommendation') || q.includes('what should') || q.includes('action')) {
    return `**Recommended Investigation Actions — Case FD-2026-00842**\n\n` +
      `**Immediate (0–24 hours):**\n` +
      `• ✅ File STR with FIU-IND (goAML portal) citing PMLA 2002 Section 12\n` +
      `• ✅ Freeze accounts A001, A002, A016 — confirmed fraud\n` +
      `• ✅ Issue Account Restraint Orders on A003, A004, A012\n\n` +
      `**Short-term (24–72 hours):**\n` +
      `• 📋 Send RFI to receiving bank branches for A002 and A004\n` +
      `• 📋 Request MCA records for Shell Corp A (A002) incorporation details\n` +
      `• 📋 Initiate KYC re-verification for Dormant 7823 (A003)\n` +
      `• 📋 Investigate A016 for potential human trafficking/mule recruitment\n\n` +
      `**Medium-term (within 30 days):**\n` +
      `• 📊 Full forensic audit of all 18 monitored accounts\n` +
      `• 📊 GNN trajectory analysis — predict next probable hops if ring reconvenes\n` +
      `• 📊 File FEMA violation report if cross-border flows detected`;
  }

  // ─── GNN / AI model ─────────────────────────────
  if (q.includes('gnn') || q.includes('model') || q.includes('how does') || q.includes('algorithm')) {
    return `**FundFlow GNN Model — How It Works**\n\n` +
      `**Graph Neural Network (PyTorch Geometric v2.4):**\n` +
      `• Models all 18 accounts as graph **nodes** and 20 transactions as **edges**\n` +
      `• Learns patterns across 3 hops in the transaction graph\n` +
      `• Detects: round-trips, layering depth, velocity anomalies, structuring\n\n` +
      `**Current Model Output:**\n` +
      `• Confidence: **94%** — Round-Trip pattern confirmed\n` +
      `• Anomaly scores: Structural clustering coefficient = 0.87 (highly abnormal)\n` +
      `• Predicted next hop from A001 if not frozen: likely A007 or A017 (cross-ring extension)\n\n` +
      `**Explainability (SHAP-based):**\n` +
      `• Top feature: Income Mismatch Ratio (weight: 0.38)\n` +
      `• Second: Transaction Velocity (weight: 0.27)\n` +
      `• Third: Circular Pattern Depth (weight: 0.21)\n` +
      `• Fourth: Shell Entity Connection (weight: 0.14)`;
  }

  // ─── DNA fingerprint ────────────────────────────
  if (q.includes('dna') || q.includes('fingerprint') || q.includes('behavioral')) {
    return `**DNA-Style Behavioral Fingerprinting — A001 Analysis**\n\n` +
      `Each account has a unique 6-dimension behavioral "fingerprint":\n\n` +
      `| Dimension | A001 Score | Peer Avg | Deviation |\n` +
      `|-----------|-----------|----------|-----------|\n` +
      `| Transaction Velocity | 85 | 22 | **+286%** |\n` +
      `| Geographic Spread | 72 | 18 | **+300%** |\n` +
      `| Structuring Risk | 91 | 5 | **+1720%** |\n` +
      `| Shell Connections | 95 | 2 | **+4650%** |\n` +
      `| Income Mismatch | 88 | 15 | **+487%** |\n` +
      `| Layering Depth | 84 | 8 | **+950%** |\n\n` +
      `A001's fingerprint deviates from clean peer group on ALL 6 dimensions — statistically impossible under legitimate banking behavior. P-value < 0.0001.`;
  }

  // ─── Amount/volume queries ───────────────────────
  if (q.includes('total') || q.includes('amount') || q.includes('volume') || q.includes('how much')) {
    const totalTxnVol = localTxns.reduce((s,t) => s + (t.amount||0), 0);
    const fraudTxns = localTxns.filter(t => {
      const s = localAccounts.find(a => a.id === t.source);
      const tgt = localAccounts.find(a => a.id === t.target);
      return s?.risk === 'fraud' || tgt?.risk === 'fraud';
    });
    const fraudVol = fraudTxns.reduce((s,t) => s + t.amount, 0);
    return `**Transaction Volume Analysis**\n\n` +
      `• **Total network volume:** ₹${totalTxnVol.toLocaleString('en-IN')}\n` +
      `• **Fraud-connected volume:** ₹${fraudVol.toLocaleString('en-IN')} (${Math.round(fraudVol/totalTxnVol*100)}% of total)\n` +
      `• **Case FD-2026-00842 amount at risk:** ₹18,45,000\n` +
      `• **RING-002 (Mule Network):** ₹32,00,000\n` +
      `• **Combined ring exposure:** ₹50,45,000\n\n` +
      `**Highest risk transactions:**\n` +
      localTxns.sort((a,b)=>b.amount-a.amount).slice(0,4).map(t =>
        `• A${t.source.slice(1)} → A${t.target.slice(1)}: ₹${t.amount.toLocaleString('en-IN')} via ${t.channel}`
      ).join('\n');
  }

  // ─── Generic account query ───────────────────────
  if (mentioned) {
    const a = mentioned;
    const accTxns = localTxns.filter(t => t.source === a.id || t.target === a.id);
    const riskEmoji = {fraud:'🔴', suspicious:'🟠', dormant:'⚫', clean:'🟢'}[a.risk] || '⚪';
    return `**${a.name} (${a.id})** — ${riskEmoji} ${a.risk.toUpperCase()} — Score: **${a.riskScore}/100**\n\n` +
      `**Profile:**\n` +
      `• Account Type: ${a.type}\n` +
      `• Declared Income: ${a.income}\n` +
      `• Inflow (30d): ${a.inflow} | Outflow: ${a.outflow}\n` +
      `• Connections: ${a.connections} counterparties\n\n` +
      `**Transactions in network:** ${accTxns.length}\n` +
      accTxns.slice(0,3).map(t => {
        const isOut = t.source === a.id;
        return `• ${isOut ? '→ OUT' : '← IN'} ${isOut ? t.target : t.source}: ₹${t.amount.toLocaleString('en-IN')} ${t.channel} ${t.time}`;
      }).join('\n') +
      `\n\n**Risk Assessment:** ` +
      (a.risk === 'fraud' ? `HIGH PRIORITY — Immediate STR filing recommended.` :
       a.risk === 'suspicious' ? `Monitor closely. Pattern matches structuring/layering indicators.` :
       a.risk === 'dormant' ? `Dormant account — investigate any recent activation.` :
       `Low risk profile. No immediate action required.`);
  }

  // ─── Greeting ────────────────────────────────────
  if (q.includes('hello') || q.includes('hi') || q.includes('help') || q.length < 8) {
    return `**Hello! I'm your FundFlow AI Co-Investigator** 🔍\n\n` +
      `I have full context of Case FD-2026-00842. I can help you with:\n\n` +
      `• **"Why is A001 suspicious?"** — Get forensic analysis of any account\n` +
      `• **"Explain the round-trip pattern"** — Full circular flow breakdown\n` +
      `• **"What are the next steps?"** — Investigation recommendations\n` +
      `• **"Tell me about structuring"** — ATM withdrawal analysis\n` +
      `• **"How does the GNN model work?"** — AI/ML explanation\n` +
      `• **"DNA fingerprint of A016"** — Behavioral deviation analysis\n` +
      `• **"Total fraud volume"** — Amount analysis\n\n` +
      `*Try asking about any account ID (A001–A018) or fraud concept!*`;
  }

  // ─── Default intelligent fallback ────────────────
  const fraudAccounts = localAccounts.filter(a => a.risk === 'fraud');
  return `**FundFlow AI Analysis:**\n\n` +
    `Based on your query, here's what I found in the current case data:\n\n` +
    `**Active Fraud Accounts (${fraudAccounts.length}):**\n` +
    fraudAccounts.map(a => `• **${a.id}** — ${a.name} — Score ${a.riskScore}/100`).join('\n') +
    `\n\n**Case Summary:**\n` +
    `• 2 confirmed fraud rings detected\n` +
    `• Total risk exposure: ₹50,45,000\n` +
    `• Primary pattern: Round-Trip Circular Layering\n\n` +
    `Try asking: *"Why is A001 suspicious?"*, *"Explain the fraud pattern"*, or *"What are the next steps?"*`;
}

function buildGraphContext() {
  const accCount = (typeof accounts !== 'undefined') ? accounts.length : 18;
  const txnCount = (typeof transactions !== 'undefined') ? transactions.length : 20;
  return 'Graph context: ' + accCount + ' accounts, ' + txnCount + ' transactions visible.';
}

// ===================================================
// TOGGLE PANEL OPEN / CLOSE
// ===================================================
function toggleAIChat() {
  aiChatOpen = !aiChatOpen;
  const panel   = document.getElementById('aiChatPanel');
  const overlay = document.getElementById('aiChatOverlay');
  if (panel)   panel.classList.toggle('open', aiChatOpen);
  if (overlay) overlay.classList.toggle('open', aiChatOpen);
  if (aiChatOpen) {
    setTimeout(function() {
      const input = document.getElementById('aiChatInput');
      if (input) input.focus();
    }, 300);
  }
}

// ===================================================
// SEND MESSAGE — tries backend, falls back to local AI
// ===================================================
async function sendAIMessage() {
  const input    = document.getElementById('aiChatInput');
  const messages = document.getElementById('aiChatMessages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendChatMessage(text, 'user');
  aiChatHistory.push({ role: 'user', content: text });

  const thinkingId = 'thinking-' + Date.now();
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'ai-msg ai';
  thinkingEl.id = thinkingId;
  thinkingEl.innerHTML = '<div class="ai-msg-bubble"><div class="ai-thinking"><span></span><span></span><span></span></div></div>';
  messages.appendChild(thinkingEl);
  messages.scrollTop = messages.scrollHeight;

  // Try backend first (with 3s timeout), then local AI
  let reply = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(BACKEND_URL + '/api/reports/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiChatHistory,
        case_context: {
          case_id: 'FD-2026-00842',
          pattern: 'Round-Trip',
          risk_score: 84,
          system_prompt: SYSTEM_PROMPT + '\n\n' + buildGraphContext(),
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      reply = data.reply || null;
    }
  } catch (err) {
    // Backend not available — use local AI (this is the normal path)
    reply = null;
  }

  // Use local smart engine if backend failed
  if (!reply) {
    reply = generateLocalAIResponse(text);
  }

  const thinking = document.getElementById(thinkingId);
  if (thinking) thinking.remove();

  aiChatHistory.push({ role: 'assistant', content: reply });
  appendChatMessage(reply, 'ai');
}

// ===================================================
// APPEND MESSAGE TO CHAT UI
// ===================================================
function appendChatMessage(text, role) {
  const messages = document.getElementById('aiChatMessages');
  if (!messages) return;

  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-family:monospace;font-size:12px;">$1</code>')
    .replace(/```[\s\S]*?```/g, m => {
      const code = m.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
      return `<pre style="background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:6px;font-family:monospace;font-size:11px;overflow-x:auto;margin:6px 0;">${code}</pre>`;
    })
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '&bull; ')
    .replace(/✅/g, '<span style="color:#00C48C">✅</span>')
    .replace(/🔴/g, '<span>🔴</span>')
    .replace(/🟠/g, '<span>🟠</span>')
    .replace(/🟢/g, '<span>🟢</span>')
    .replace(/\| (.*?) \|/g, (m) => `<span style="font-family:monospace">${m}</span>`);

  div.innerHTML = '<div class="ai-msg-bubble">' + formatted + '</div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Called from "Ask AI" buttons
function aiQuickAction(prompt) {
  const input = document.getElementById('aiChatInput');
  if (!aiChatOpen) toggleAIChat();
  setTimeout(function() {
    if (input) {
      input.value = prompt;
      sendAIMessage();
    }
  }, aiChatOpen ? 0 : 400);
}

// Called from graph node side panel
function askAIAboutNode() {
  const nameEl = document.getElementById('nodeName');
  const idEl   = document.getElementById('nodeId');
  if (!nameEl || nameEl.textContent === 'Account Name') return;
  aiQuickAction(
    'Why is ' + nameEl.textContent + ' (' + idEl.textContent + ') suspicious? ' +
    'Give forensic analysis with data citations and PMLA 2002 actions.'
  );
}