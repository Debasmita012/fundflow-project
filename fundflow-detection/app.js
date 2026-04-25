// ===================================================
// FUND FLOW TRACKING — app.js
// PS3 · IDEA 2.0 Hackathon · Vidyavihar University
// Features: Theme Toggle · Fraud Flash · Heatmap
// ===================================================

// ===================================================
// UTILITY — Parse Indian Rupee strings to numbers
// e.g. '₹18,45,000' → 1845000
// ===================================================
function parseINR(str) {
  if (!str || str === 'Not Declared') return 0;
  return parseInt(str.replace(/[₹,]/g, ''), 10) || 0;
}

// ===================================================
// SYNTHETIC DATA
// ===================================================
const accounts = [
  { id:'A001', name:'Rajesh Mehta',       type:'Corporate', risk:'fraud',      riskScore:84, income:'₹6,00,000',   inflow:'₹18,45,000', outflow:'₹17,80,000', connections:5 },
  { id:'A002', name:'Shell Corp A',       type:'Corporate', risk:'fraud',      riskScore:92, income:'Not Declared', inflow:'₹12,30,000', outflow:'₹12,25,000', connections:3 },
  { id:'A003', name:'Dormant 7823',       type:'Savings',   risk:'suspicious', riskScore:71, income:'₹2,50,000',   inflow:'₹9,80,000',  outflow:'₹9,75,000',  connections:2 },
  { id:'A004', name:'Partner Entity B',   type:'Current',   risk:'suspicious', riskScore:65, income:'₹15,00,000',  inflow:'₹8,40,000',  outflow:'₹7,90,000',  connections:4 },
  { id:'A005', name:'Priya Sharma',       type:'Savings',   risk:'clean',      riskScore:12, income:'₹8,00,000',   inflow:'₹3,20,000',  outflow:'₹2,80,000',  connections:3 },
  { id:'A006', name:'Amit Patel',         type:'Savings',   risk:'clean',      riskScore:8,  income:'₹5,50,000',   inflow:'₹2,10,000',  outflow:'₹1,90,000',  connections:2 },
  { id:'A007', name:'Kumar Trading',      type:'Corporate', risk:'suspicious', riskScore:58, income:'₹20,00,000',  inflow:'₹14,50,000', outflow:'₹14,20,000', connections:6 },
  { id:'A008', name:'Dormant 4521',       type:'Savings',   risk:'dormant',    riskScore:5,  income:'₹3,00,000',   inflow:'₹45,000',    outflow:'₹0',         connections:1 },
  { id:'A009', name:'Sunita Devi',        type:'Savings',   risk:'clean',      riskScore:15, income:'₹4,00,000',   inflow:'₹1,80,000',  outflow:'₹1,60,000',  connections:2 },
  { id:'A010', name:'Fast Traders LLC',   type:'Corporate', risk:'suspicious', riskScore:62, income:'₹50,00,000',  inflow:'₹32,00,000', outflow:'₹31,50,000', connections:7 },
  { id:'A011', name:'Neha Gupta',         type:'Savings',   risk:'clean',      riskScore:10, income:'₹7,00,000',   inflow:'₹2,50,000',  outflow:'₹2,20,000',  connections:2 },
  { id:'A012', name:'Shell Corp B',       type:'Corporate', risk:'fraud',      riskScore:88, income:'Not Declared', inflow:'₹8,90,000',  outflow:'₹8,85,000',  connections:3 },
  { id:'A013', name:'Vikram Singh',       type:'Current',   risk:'clean',      riskScore:18, income:'₹12,00,000',  inflow:'₹5,60,000',  outflow:'₹4,90,000',  connections:4 },
  { id:'A014', name:'Dormant 9102',       type:'Savings',   risk:'dormant',    riskScore:3,  income:'₹2,00,000',   inflow:'₹0',         outflow:'₹0',         connections:0 },
  { id:'A015', name:'Ravi Textiles',      type:'Corporate', risk:'clean',      riskScore:22, income:'₹35,00,000',  inflow:'₹18,00,000', outflow:'₹17,00,000', connections:5 },
  { id:'A016', name:'Mule Account X1',    type:'Savings',   risk:'fraud',      riskScore:95, income:'₹1,80,000',   inflow:'₹45,00,000', outflow:'₹44,90,000', connections:8 },
  { id:'A017', name:'Deepak Exports',     type:'Corporate', risk:'suspicious', riskScore:55, income:'₹80,00,000',  inflow:'₹42,00,000', outflow:'₹41,00,000', connections:6 },
  { id:'A018', name:'Sanjay Kumar',       type:'Savings',   risk:'clean',      riskScore:14, income:'₹6,50,000',   inflow:'₹3,00,000',  outflow:'₹2,70,000',  connections:3 },
];

// Compute numeric volume for heatmap
accounts.forEach(a => {
  a.volumeRaw = parseINR(a.inflow) + parseINR(a.outflow);
});

const maxVolume = Math.max(...accounts.map(a => a.volumeRaw));
const minVolume = Math.min(...accounts.filter(a => a.volumeRaw > 0).map(a => a.volumeRaw));

const transactions = [
  { source:'A001', target:'A002', amount:495000,  channel:'NEFT', time:'09:15' },
  { source:'A002', target:'A003', amount:490000,  channel:'RTGS', time:'10:42' },
  { source:'A003', target:'A004', amount:485000,  channel:'NEFT', time:'14:08' },
  { source:'A004', target:'A001', amount:480000,  channel:'UPI',  time:'17:55' },
  { source:'A005', target:'A006', amount:75000,   channel:'UPI',  time:'11:20' },
  { source:'A007', target:'A010', amount:350000,  channel:'RTGS', time:'08:30' },
  { source:'A010', target:'A012', amount:340000,  channel:'NEFT', time:'09:45' },
  { source:'A012', target:'A016', amount:335000,  channel:'RTGS', time:'11:00' },
  { source:'A016', target:'A007', amount:330000,  channel:'UPI',  time:'13:30' },
  { source:'A001', target:'A007', amount:180000,  channel:'NEFT', time:'15:00' },
  { source:'A005', target:'A009', amount:55000,   channel:'UPI',  time:'12:15' },
  { source:'A009', target:'A011', amount:42000,   channel:'UPI',  time:'14:30' },
  { source:'A013', target:'A015', amount:280000,  channel:'RTGS', time:'10:00' },
  { source:'A015', target:'A017', amount:250000,  channel:'NEFT', time:'11:45' },
  { source:'A017', target:'A018', amount:95000,   channel:'UPI',  time:'16:20' },
  { source:'A006', target:'A013', amount:62000,   channel:'UPI',  time:'09:00' },
  { source:'A016', target:'A002', amount:890000,  channel:'RTGS', time:'07:30' },
  { source:'A012', target:'A001', amount:420000,  channel:'NEFT', time:'16:45' },
  { source:'A010', target:'A017', amount:180000,  channel:'NEFT', time:'13:00' },
  { source:'A003', target:'A008', amount:45000,   channel:'UPI',  time:'15:30' },
];

const alertData = [
  { name:'Rajesh Mehta Enterprises', desc:'Round-trip pattern detected · 4 accounts · 3 hops',        amount:'₹18,45,000', time:'2 min ago',  risk:'critical', type:'corporate', amountClass:'outflow' },
  { name:'Mule Account X1',          desc:'Volume anomaly · 45L through student account',              amount:'₹45,00,000', time:'5 min ago',  risk:'critical', type:'savings',   amountClass:'outflow' },
  { name:'Shell Corp A',             desc:'No business purpose declared · rapid layering',             amount:'₹12,30,000', time:'8 min ago',  risk:'critical', type:'corporate', amountClass:'outflow' },
  { name:'Shell Corp B',             desc:'Circular fund flow to mule network',                        amount:'₹8,90,000',  time:'12 min ago', risk:'critical', type:'corporate', amountClass:'outflow' },
  { name:'Kumar Trading Co.',        desc:'Unusually high velocity · 32 txns in 2 hours',             amount:'₹14,50,000', time:'15 min ago', risk:'high',     type:'corporate', amountClass:'outflow' },
  { name:'Dormant A/C 7823',         desc:'Dormant 18 months → sudden ₹9.8L inflow',                  amount:'₹9,80,000',  time:'22 min ago', risk:'high',     type:'savings',   amountClass:'inflow'  },
  { name:'Fast Traders LLC',         desc:'Structuring detected — 6 sub-₹50K withdrawals',            amount:'₹2,94,000',  time:'30 min ago', risk:'high',     type:'corporate', amountClass:'outflow' },
  { name:'Partner Entity B',         desc:'Profile mismatch · declared ₹15L, actual flow ₹8.4L/month',amount:'₹8,40,000',  time:'35 min ago', risk:'medium',   type:'current',   amountClass:'inflow'  },
  { name:'Deepak Exports',           desc:'Cross-border transfer spike — 3× baseline',                amount:'₹42,00,000', time:'45 min ago', risk:'medium',   type:'corporate', amountClass:'outflow' },
  { name:'Priya Sharma',             desc:'Watchlist — connected to flagged entity A002',              amount:'₹3,20,000',  time:'1 hr ago',   risk:'low',      type:'savings',   amountClass:'inflow'  },
  { name:'Vikram Singh',             desc:'Cleared — previous alert was false positive',               amount:'₹5,60,000',  time:'2 hr ago',   risk:'low',      type:'current',   amountClass:'inflow'  },
  { name:'Ravi Textiles',            desc:'Under review — unusual supplier payment pattern',           amount:'₹18,00,000', time:'3 hr ago',   risk:'medium',   type:'corporate', amountClass:'outflow' },
];

// ===================================================
// COLOR MAPS
// ===================================================
const riskColorMap = {
  clean:      '#00C48C',
  suspicious: '#F5A623',
  fraud:      '#FF4757',
  dormant:    '#555577',
};

// FEATURE 3 — Volume heatmap scale (created after d3 loads)
let volumeHeatScale = null;

// Graph color mode: 'risk' | 'volume'
let graphColorMode = 'risk';

function getNodeColor(d) {
  if (graphColorMode === 'volume' && volumeHeatScale) {
    return volumeHeatScale(d.volumeRaw || 0);
  }
  return riskColorMap[d.risk] || '#555577';
}

// ===================================================
// NAVIGATION
// ===================================================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + viewId);
  if (view) {
    view.classList.add('active');
    document.getElementById('mainContent').scrollTop = 0;
  }

  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');

  if (viewId === 'graph') {
    setTimeout(() => {
      initFullGraph();
      startDemoFlashSequence(); // Feature 2 — auto-demo
    }, 500);
  }
  if (viewId === 'workbench') {
    setTimeout(() => initEvidenceGraph(), 200);
  }
}

// ===================================================
// LIVE TIME
// ===================================================
function updateLiveTime() {
  const now     = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const full    = `${dateStr}  ${timeStr}`;
  const el1 = document.getElementById('liveTime');
  const el2 = document.getElementById('liveTime2');
  if (el1) el1.textContent = full;
  if (el2) el2.textContent = full;
}
setInterval(updateLiveTime, 1000);
updateLiveTime();

// ===================================================
// KPI COUNTER ANIMATION
// ===================================================
function animateCounters() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target   = parseInt(el.dataset.target);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const format   = el.dataset.format;
    const duration = 1200;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(target * eased);

      if (format === 'currency') {
        el.textContent = prefix + current.toLocaleString('en-IN');
      } else {
        el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
      }
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ===================================================
// ALERT FEED RENDERER
// ===================================================
function renderAlerts(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  data.forEach(alert => {
    const typeClass = alert.type === 'corporate' ? 'corporate'
                    : alert.type === 'current'   ? 'current'
                    : 'savings';
    const initials  = alert.name.split(' ').map(w => w[0]).join('').slice(0, 2);

    const el = document.createElement('div');
    el.className = `alert-item risk-${alert.risk}`;
    el.innerHTML = `
      <div class="alert-avatar ${typeClass}">${initials}</div>
      <div class="alert-info">
        <div class="alert-name">${alert.name}</div>
        <div class="alert-desc">${alert.desc}</div>
      </div>
      <div class="alert-meta">
        <span class="alert-amount ${alert.amountClass}">${alert.amount}</span>
        <span class="badge badge-${alert.risk}">${alert.risk}</span>
        <span class="alert-time">${alert.time}</span>
      </div>`;
    el.addEventListener('click', () => switchView('workbench'));
    container.appendChild(el);
  });
}

// ===================================================
// DASHBOARD MINI GRAPH (D3)
// ===================================================
function initDashboardGraph() {
  const container = document.getElementById('dashboardGraph');
  if (!container || container.querySelector('svg')) return;

  const width  = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container).append('svg')
    .attr('width', width).attr('height', height);

  const defs   = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glowDash');
  filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
  const merge  = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'coloredBlur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');
  const nodes = accounts.map(a => ({ ...a }));
  const links = transactions.map(t => ({ source: t.source, target: t.target, amount: t.amount }));

  const sim = d3.forceSimulation(nodes)
    .force('link',      d3.forceLink(links).id(d => d.id).distance(80))
    .force('charge',    d3.forceManyBody().strength(-200))
    .force('center',    d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(20));

  const link = svg.append('g').selectAll('line').data(links).enter().append('line')
    .attr('stroke', d => {
      const s = nodes.find(n => n.id === (d.source.id || d.source));
      const t = nodes.find(n => n.id === (d.target.id || d.target));
      return (s?.risk === 'fraud' || t?.risk === 'fraud') ? 'rgba(255,71,87,0.35)' : 'rgba(79,158,255,0.18)';
    })
    .attr('stroke-width', d => Math.max(1, Math.min(d.amount / 100000, 4)));

  const node = svg.append('g').selectAll('circle').data(nodes).enter().append('circle')
    .attr('r', d => d.risk === 'fraud' ? 10 : d.risk === 'suspicious' ? 8 : d.risk === 'dormant' ? 5 : 7)
    .attr('fill',         d => riskColorMap[d.risk])
    .attr('stroke',       d => riskColorMap[d.risk])
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.3)
    .attr('filter', d => d.risk === 'fraud' ? 'url(#glowDash)' : '')
    .attr('class',  d => d.risk === 'fraud' ? 'node-pulse' : '')
    .style('cursor', 'pointer');

  const label = svg.append('g').selectAll('text').data(nodes).enter().append('text')
    .text(d => d.name.split(' ')[0])
    .attr('font-family', 'DM Sans, sans-serif').attr('font-size', '9px')
    .attr('fill', '#888').attr('text-anchor', 'middle').attr('dy', 20);

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node
      .attr('cx', d => d.x = Math.max(15, Math.min(width  - 15, d.x)))
      .attr('cy', d => d.y = Math.max(15, Math.min(height - 15, d.y)));
    label.attr('x', d => d.x).attr('y', d => d.y);
  });
}

// ===================================================
// FULL GRAPH VIEW (D3) — with all 3 features wired
// ===================================================
function initFullGraph() {
  const container = document.getElementById('graphFullscreen');
  if (!container || container.querySelector('svg')) return;

    const width  = container.clientWidth  || window.innerWidth  - 60;
  const height = container.clientHeight || window.innerHeight - 200;

  const svg = d3.select(container).append('svg')
    .attr('width', width).attr('height', height);

  const g = svg.append('g');

  svg.call(d3.zoom().scaleExtent([0.3, 4])
    .on('zoom', e => g.attr('transform', e.transform)));

  const defs   = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glowFull');
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
  const merge  = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'coloredBlur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  ['#4F9EFF','#FF4757','#F5A623','#00C48C'].forEach(color => {
    defs.append('marker')
      .attr('id', 'arrow-' + color.replace('#',''))
      .attr('viewBox','0 0 10 10').attr('refX', 20).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient','auto')
      .append('path').attr('d','M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', color + '80');
  });

  const nodes = accounts.map(a => ({ ...a }));
  const links = transactions.map(t => ({
    source: t.source, target: t.target, amount: t.amount, channel: t.channel
  }));

  const sim = d3.forceSimulation(nodes)
    .force('link',      d3.forceLink(links).id(d => d.id).distance(120))
    .force('charge',    d3.forceManyBody().strength(-400))
    .force('center',    d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(30));

  const link = g.append('g').selectAll('line').data(links).enter().append('line')
    .attr('stroke', d => d.amount > 400000 ? 'rgba(255,71,87,0.35)'
                       : d.amount > 200000 ? 'rgba(245,166,35,0.3)'
                       : 'rgba(79,158,255,0.18)')
    .attr('stroke-width', d => Math.max(1.5, Math.min(d.amount / 80000, 5)))
    .attr('marker-end', d => d.amount > 400000 ? 'url(#arrow-FF4757)'
                           : d.amount > 200000 ? 'url(#arrow-F5A623)'
                           : 'url(#arrow-4F9EFF)')
    .style('cursor', 'pointer')
    .on('mouseover', function(e, d) { d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', parseFloat(d3.select(this).attr('stroke-width')) + 2); })
    .on('mouseout', function(e, d) { d3.select(this).attr('stroke-opacity', null).attr('stroke-width', Math.max(1.5, Math.min(d.amount / 80000, 5))); });

  // Add native tooltip to edges
  link.append('title')
    .text(d => `Amount: ₹${d.amount.toLocaleString('en-IN')}\nChannel: ${d.channel}`);

  const nodeGroup = g.append('g').selectAll('g').data(nodes).enter().append('g')
    .style('cursor', 'pointer');

  nodeGroup.append('circle')
    .attr('r', 12)
    .attr('fill', d => riskColorMap[d.risk])
    .attr('stroke', '#1A1A2E')
    .attr('stroke-width', 2)
    .style('transition', 'r 0.2s')
    .on('mouseover', function() { d3.select(this).attr('r', 16); })
    .on('mouseout', function() { d3.select(this).attr('r', 12); });

  // Add native tooltip to nodes
  nodeGroup.append('title')
    .text(d => `${d.name}\nType: ${d.type}\nRisk: ${d.riskScore}/100\nConnections: ${d.connections}`);

  // Add text labels underneath nodes
  nodeGroup.append('text')
    .text(d => d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name)
    .attr('font-family', 'DM Sans, sans-serif')
    .attr('font-size', '10px')
    .attr('fill', '#E0E0E0')
    .attr('text-anchor', 'middle')
    .attr('dy', 22)
    .style('pointer-events', 'none');

  // ✅ MODIFIED CLICK HANDLER
  nodeGroup.on('click', (e, d) => { 
    e.stopPropagation(); 
    openNodePanel(d);

    if (typeof showNodePredictions === 'function') showNodePredictions(d.id);
  });

  svg.on('click', () => closeNodePanel());

  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // ✅ ADDED GRAPH STATE REGISTRATION
  if (typeof registerGraphState === 'function') {
    registerGraphState(sim, nodes, links, nodeGroup, link);
  }
}
// ===================================================
// NODE SIDE PANEL
// ===================================================
function openNodePanel(d) {
  const panel = document.getElementById('nodeSidePanel');
  if (!panel) return;
  panel.classList.add('open');

  document.getElementById('nodeName').textContent        = d.name;
  document.getElementById('nodeId').textContent          = 'A/C ' + d.id;
  document.getElementById('nodeType').textContent        = d.type;
  document.getElementById('nodeIncome').textContent      = d.income;
  document.getElementById('nodeInflow').textContent      = d.inflow;
  document.getElementById('nodeOutflow').textContent     = d.outflow;
  document.getElementById('nodeConnections').textContent = d.connections;

  drawRiskGauge(d.riskScore);

  const txContainer = document.getElementById('nodeTransactions');
  const related     = transactions.filter(t => t.source === d.id || t.target === d.id).slice(0, 5);
  txContainer.innerHTML = related.map(tx => {
    const isOut = tx.source === d.id;
    const other = isOut ? accounts.find(a => a.id === tx.target)
                        : accounts.find(a => a.id === tx.source);
    const amt   = (tx.amount / 100).toLocaleString('en-IN');
    return `<div class="node-detail-row">
      <span class="node-detail-label">${isOut ? '→' : '←'} ${other?.name || tx.target}</span>
      <span class="node-detail-value" style="color:${isOut ? '#FF6B35' : '#00C48C'}">₹${amt}</span>
    </div>`;
  }).join('') || '<div style="color:#888;font-size:12px;padding:8px 0">No transactions</div>';
}

function closeNodePanel() {
  const p = document.getElementById('nodeSidePanel');
  if (p) p.classList.remove('open');
}

function drawRiskGauge(score) {
  const svg   = document.getElementById('riskGauge');
  if (!svg) return;
  const color = score > 80 ? '#FF4757' : score > 60 ? '#FF6B35' : score > 40 ? '#F5A623' : '#00C48C';
  const cx = 60, cy = 65, r = 45;
  const startRad = -Math.PI;
  const endRad   = startRad + (score / 100) * Math.PI;
  const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad),   y2 = cy + r * Math.sin(endRad);
  const largeArc = score > 50 ? 1 : 0;

  svg.innerHTML = `
    <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}"
          stroke="#2A2A2A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}"
          stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <text x="${cx}" y="${cy - 5}" text-anchor="middle"
          font-family="Space Mono" font-size="22" font-weight="700"
          fill="${color}">${score}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle"
          font-family="DM Sans" font-size="10" fill="#888">/ 100</text>`;
}

// ===================================================
// EVIDENCE GRAPH (WORKBENCH — light bg)
// ===================================================
function initEvidenceGraph() {
  const container = document.getElementById('evidenceGraph');
  if (!container || container.querySelector('svg')) return;

  const width = container.clientWidth, height = container.clientHeight;
  const svg   = d3.select(container).append('svg').attr('width', width).attr('height', height);
  const defs  = svg.append('defs');

  defs.append('marker').attr('id','arrow-evidence')
    .attr('viewBox','0 0 10 10').attr('refX', 25).attr('refY', 5)
    .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient','auto')
    .append('path').attr('d','M 0 0 L 10 5 L 0 10 Z').attr('fill','rgba(232,102,10,0.5)');

  const ids   = ['A001','A002','A003','A004'];
  const nodes = accounts.filter(a => ids.includes(a.id)).map(a => ({ ...a }));
  const links = transactions.filter(t => ids.includes(t.source) && ids.includes(t.target))
                            .map(t => ({ source: t.source, target: t.target, amount: t.amount }));

  const sim = d3.forceSimulation(nodes)
    .force('link',   d3.forceLink(links).id(d => d.id).distance(130))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g').selectAll('line').data(links).enter().append('line')
    .attr('stroke','rgba(232,102,10,0.3)').attr('stroke-width', 3)
    .attr('class','edge-flow').attr('marker-end','url(#arrow-evidence)');

  const ng = svg.append('g').selectAll('g').data(nodes).enter().append('g');
  ng.append('circle').attr('r', 16)
    .attr('fill',          d => riskColorMap[d.risk])
    .attr('stroke',        d => riskColorMap[d.risk])
    .attr('stroke-width',  3).attr('stroke-opacity', 0.3);
  ng.append('text').text(d => d.name.length > 14 ? d.name.slice(0,14)+'…' : d.name)
    .attr('font-family','DM Sans, sans-serif').attr('font-size','12px')
    .attr('fill','#1A1A2E').attr('text-anchor','middle').attr('dy', 32);
  ng.append('text').text(d => 'A/C ' + d.id.replace('A0',''))
    .attr('font-family','DM Mono, monospace').attr('font-size','9px')
    .attr('fill','#888').attr('text-anchor','middle').attr('dy', 44);

  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    ng.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

// ===================================================
// AREA CHART
// ===================================================
function initAreaChart() {
  const container = document.getElementById('areaChart');
  if (!container || container.querySelector('svg')) return;

  const width  = container.clientWidth, height = container.clientHeight;
  const m      = { top:20, right:20, bottom:30, left:50 };
  const w = width - m.left - m.right, h = height - m.top - m.bottom;
  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
  const g   = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const data = Array.from({ length:30 }, (_, i) => ({
    day: i + 1,
    value: 150 + Math.floor(Math.random() * 120) + (i > 20 ? 80 : 0)
  }));

  const x = d3.scaleLinear().domain([1, 30]).range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([h, 0]);

  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id','areaGrad')
    .attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
  grad.append('stop').attr('offset','0%')  .attr('stop-color','#E8660A').attr('stop-opacity', 0.4);
  grad.append('stop').attr('offset','100%').attr('stop-color','#E8660A').attr('stop-opacity', 0.02);

  g.append('path').datum(data)
    .attr('fill','url(#areaGrad)')
    .attr('d', d3.area().x(d => x(d.day)).y0(h).y1(d => y(d.value)).curve(d3.curveMonotoneX));

  g.append('path').datum(data)
    .attr('fill','none').attr('stroke','#E8660A').attr('stroke-width', 2)
    .attr('d', d3.line().x(d => x(d.day)).y(d => y(d.value)).curve(d3.curveMonotoneX));

  g.append('g').attr('transform',`translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `Day ${d}`))
    .selectAll('text').attr('fill','#666').attr('font-family','DM Mono').attr('font-size','10px');
  g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => d + ' txn'))
    .selectAll('text').attr('fill','#666').attr('font-family','DM Mono').attr('font-size','10px');
  g.selectAll('.domain').attr('stroke','#2A2A2A');
  g.selectAll('.tick line').attr('stroke','#1A1A2E');
}

// ===================================================
// DONUT CHART
// ===================================================
function initDonutChart() {
  const container = document.getElementById('donutChart');
  if (!container || container.querySelector('svg')) return;

  const width  = container.clientWidth, height = container.clientHeight;
  const radius = Math.min(width, height) / 2 - 20;
  const svg    = d3.select(container).append('svg').attr('width', width).attr('height', height)
    .append('g').attr('transform', `translate(${width/2},${height/2})`);

  const data = [
    { label:'NEFT', value:38, color:'#E8660A' },
    { label:'UPI',  value:28, color:'#4F9EFF' },
    { label:'RTGS', value:22, color:'#7B5EA7' },
    { label:'ATM',  value:12, color:'#00C48C' },
  ];

  const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.03);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

  svg.selectAll('path').data(pie(data)).enter().append('path')
    .attr('d', arc).attr('fill', d => d.data.color)
    .attr('stroke','#0D0D0D').attr('stroke-width', 2).style('opacity', 0.85)
    .style('cursor','pointer')
    .on('mouseenter', function() { d3.select(this).style('opacity', 1).attr('transform','scale(1.05)'); })
    .on('mouseleave', function() { d3.select(this).style('opacity', 0.85).attr('transform','scale(1)'); });

  svg.append('text').attr('text-anchor','middle').attr('dy','-8')
    .attr('font-family','Space Mono, monospace').attr('font-size','22px').attr('font-weight','700')
    .attr('fill','#F0F0F0').text('1,247');
  svg.append('text').attr('text-anchor','middle').attr('dy','14')
    .attr('font-family','DM Sans, sans-serif').attr('font-size','11px')
    .attr('fill','#888').text('Total Txns');

  const legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = data.map(d =>
      `<div class="chart-legend-item">
         <div class="chart-legend-dot" style="background:${d.data ? d.data.color : d.color}"></div>
         ${d.label || d.data?.label} (${d.value || d.data?.value}%)
       </div>`
    ).join('');
  }
}

// ===================================================
// FIU REPORT TYPEWRITER
// ===================================================
const reportContent = `SUSPICIOUS TRANSACTION REPORT (STR)
FIU-IND Reference Format | Auto-Generated

Case Reference: FD-2026-00842
Date Generated: 15 March 2026
Classification: SUSPICIOUS — Round-Trip Fund Transfer

1. EXECUTIVE SUMMARY

This report documents a suspected round-trip money laundering pattern identified through the FundFlow automated graph analytics engine. The system detected a circular fund transfer pattern involving four accounts over a period of approximately 8 hours on 14 March 2026, with a total amount of ₹18,45,000 circulated through the network.

2. SUBJECT DETAILS

Primary Subject: Rajesh Mehta Enterprises (A/C ending 4829)
Account Type: Current Account — Corporate
KYC Status: Verified (Last updated: Jan 2025)
Declared Annual Income: ₹6,00,000
Actual Transaction Volume (30 days): ₹18,45,000
Income Mismatch Factor: 3.07× declared annual income transacted in a single month

3. SUSPICIOUS PATTERN DESCRIPTION

The automated detection engine identified a classic round-trip layering pattern:

Step 1: ₹4,95,000 transferred Rajesh Mehta → Shell Corp A via NEFT at 09:15
Step 2: ₹4,90,000 moved Shell Corp A → Dormant A/C 7823 via RTGS at 10:42
Step 3: ₹4,85,000 sent Dormant A/C 7823 → Partner Entity B via NEFT at 14:08
Step 4: ₹4,80,000 returned Partner Entity B → Rajesh Mehta via UPI at 17:55

Total amount lost in transit: ₹15,000 (likely fees/commissions to intermediaries)
Pattern completion time: 8 hours 40 minutes

4. ADDITIONAL RED FLAGS

• Shell Corp A has no declared business purpose — registered 3 months ago
• Dormant A/C 7823 was inactive for 18 months before sudden activation
• Two ATM withdrawals of ₹49,900 and ₹49,800 (below ₹50,000 structuring threshold) on next day
• Graph Neural Network model assigned a risk score of 84 / 100

5. RECOMMENDATION

Immediate filing of STR with FIU-IND recommended. Escalate for further investigation of Shell Corp A and Partner Entity B. Request for information (RFI) to receiving bank branches advised.

— Report auto-generated by FundFlow AI Engine v1.0 —`;

let reportStreamActive = false;

function startReportStream() {
  if (reportStreamActive) return;
  if (typeof generateReportFromBackend === 'function') {
    generateReportFromBackend('FD-2026-00842').then(report => {
      if (report) {
        document.getElementById('reportText').textContent = report;
        document.getElementById('reportStatus').textContent = 'AI Generated ✓';
        ['downloadBtn','submitBtn'].forEach(id => {
          const b = document.getElementById(id);
          if(b){ b.style.opacity='1'; b.style.pointerEvents='auto'; }
        });
        return;
      }
    });
  }
  reportStreamActive = true;

  const textEl   = document.getElementById('reportText');
  const statusEl = document.getElementById('reportStatus');
  const genBtn   = document.getElementById('generateBtn');

  textEl.innerHTML = '';
  if (statusEl) statusEl.textContent  = 'Generating...';
  if (genBtn)   { genBtn.style.opacity = '0.5'; genBtn.style.pointerEvents = 'none'; }

  const words  = reportContent.split(/(?<=\s)/);
  let i        = 0;
  const cursor = document.createElement('span');
  cursor.className = 'report-cursor';

  function typeWord() {
    if (i < words.length) {
      const word = words[i];
      if (word.includes('\n')) {
        word.split('\n').forEach((part, idx, arr) => {
          if (part) textEl.insertBefore(document.createTextNode(part), cursor);
          if (idx < arr.length - 1) textEl.insertBefore(document.createElement('br'), cursor);
        });
      } else {
        textEl.insertBefore(document.createTextNode(word), cursor);
      }
      textEl.appendChild(cursor);
      i++;
      const delay = (word.includes('.') || word.includes(':')) ? 60 : 25;
      setTimeout(typeWord, delay);
      textEl.scrollTop = textEl.scrollHeight;
    } else {
      cursor.remove();
      if (statusEl) statusEl.textContent = 'Complete ✓';
      ['downloadBtn','submitBtn','aiDownloadBtn'].forEach(id => {
        const b = document.getElementById(id);
        if (b) { b.style.opacity='1'; b.style.pointerEvents='auto'; }
      });
      reportStreamActive = false;
    }
  }

  textEl.appendChild(cursor);
  setTimeout(typeWord, 500);
}

// ===================================================
// FEATURE 2 — FRAUD NODE FLASH
// ===================================================

/**
 * triggerFraudFlash(accountIds)
 * Flashes all nodes whose id is in accountIds white,
 * then returns them to normal pulsing.
 * Also flashes connected edges white.
 */
function triggerFraudFlash(accountIds) {
  const container = document.getElementById('graphFullscreen');
  if (!container) return;

  const svg = d3.select(container).select('svg');

  // Flash node circles
  const circles = svg.selectAll('circle')
    .filter(d => d && accountIds.includes(d.id));

  circles
    .classed('fraud-burst', true)
    .classed('node-pulse',  false);

  // Return to normal pulse after burst
  setTimeout(() => {
    circles
      .classed('fraud-burst', false)
      .classed('node-pulse',  true);
  }, 900);

  // Flash connected edges white briefly
  const edges = svg.selectAll('line')
    .filter(d => d && (
      accountIds.includes(d.source.id || d.source) ||
      accountIds.includes(d.target.id || d.target)
    ));

  edges.style('stroke','#FFFFFF').style('stroke-width','6');
  setTimeout(() => edges.style('stroke', null).style('stroke-width', null), 300);
}

/**
 * startDemoFlashSequence()
 * Auto-triggers two fraud flash events after delays.
 * Call this when switching to Graph View.
 */
function startDemoFlashSequence() {
  // Flash circular pattern 1 (round-trip) after 3s
  setTimeout(() => {
    triggerFraudFlash(['A001','A002','A003','A004']);
  }, 3000);

  // Flash circular pattern 2 (mule network) after 8s
  setTimeout(() => {
    triggerFraudFlash(['A007','A010','A012','A016']);
  }, 8000);
}

// ===================================================
// FEATURE 3 — GRAPH HEATMAP TOGGLE
// ===================================================

/**
 * toggleHeatmap()
 * Switches graph color mode between 'risk' and 'volume'.
 * Smoothly re-colors all node circles using D3 transition.
 */
function toggleHeatmap() {
  const btn    = document.getElementById('heatmapToggleBtn');
  const legend = document.getElementById('heatmapLegend');

  graphColorMode = (graphColorMode === 'risk') ? 'volume' : 'risk';
  const isHeat   = graphColorMode === 'volume';

  if (btn) {
    btn.textContent = isHeat ? 'Heat Map: ON' : 'Heat Map: OFF';
    btn.classList.toggle('heatmap-active', isHeat);
  }
  if (legend) legend.classList.toggle('visible', isHeat);

  // Re-color all data-bound node circles with smooth transition
  const container = document.getElementById('graphFullscreen');
  if (!container) return;

  d3.select(container).select('svg').selectAll('circle')
    .filter(d => d && d.risk)
    .transition()
    .duration(600)
    .ease(d3.easeCubicInOut)
    .attr('fill',   d => getNodeColor(d))
    .attr('stroke', d => getNodeColor(d));
}

// ===================================================
// FEATURE 1 — DARK / LIGHT THEME TOGGLE
// ===================================================

const MOON_SVG = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

const SUN_SVG = `
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1"  x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1"  y1="12" x2="3"  y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>`;

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  const icon    = document.getElementById('themeIcon');
  if (icon) icon.innerHTML = isLight ? SUN_SVG : MOON_SVG;
  localStorage.setItem('fundflow-theme', isLight ? 'light' : 'dark');
}

function restoreSavedTheme() {
  if (localStorage.getItem('fundflow-theme') === 'light') {
    document.body.classList.add('light-theme');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.innerHTML = SUN_SVG;
  }
}

// ===================================================
// GRAPH CONTROL BUTTON ACTIVE STATE
// ===================================================
document.addEventListener('click', e => {
  if (e.target.classList.contains('graph-ctrl-btn') && !e.target.id) {
    const parent = e.target.closest('.graph-controls, .graph-top-strip');
    if (parent) {
      parent.querySelectorAll('.graph-ctrl-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    }
  }
});

// ===================================================
// INIT — runs when DOM is ready
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  // Feature 1 — restore saved theme
  restoreSavedTheme();

  // Feature 3 — build D3 heatmap scale after d3 is available
  volumeHeatScale = d3.scaleLinear()
    .domain([0, maxVolume * 0.25, maxVolume * 0.6, maxVolume])
    .range(['#1A3A6B', '#4F9EFF', '#F5A623', '#FF4757'])
    .clamp(true);

  // Core init
  animateCounters();
  renderAlerts('alertFeed',     alertData);
  renderAlerts('alertFeedFull', alertData);
  initDashboardGraph();

  setTimeout(() => {
    initAreaChart();
    initDonutChart();
  }, 300);
});

// ===================================================
// FEATURE 4 — MONEY FLOW ANIMATION
// ===================================================

const flowSequence = [
  { from:'A001', to:'A002', label:'Rajesh Mehta → Shell Corp A', amount:'₹4,95,000', time:'09:15', channel:'NEFT', color:'#FF4757' },
  { from:'A002', to:'A003', label:'Shell Corp A → Dormant 7823', amount:'₹4,90,000', time:'10:42', channel:'RTGS', color:'#FF6B35' },
  { from:'A003', to:'A004', label:'Dormant 7823 → Partner B',    amount:'₹4,85,000', time:'14:08', channel:'NEFT', color:'#F5A623' },
  { from:'A004', to:'A001', label:'Partner B → Rajesh Mehta',    amount:'₹4,80,000', time:'17:55', channel:'UPI',  color:'#FF4757' },
];

let flowAnimating = false;
let flowSvgRef   = null;
let flowNodesRef = null;

function initMoneyFlowView() {
  const container = document.getElementById('flowCanvas');
  if (!container || container.querySelector('svg')) return;

  const W = container.clientWidth || 700;
  const H = container.clientHeight || 320;

  const svg = d3.select(container).append('svg').attr('width', W).attr('height', H);
  flowSvgRef = svg;

  // Glow filter
  const defs = svg.append('defs');
  const f    = defs.append('filter').attr('id','flowGlow');
  f.append('feGaussianBlur').attr('stdDeviation','4').attr('result','cb');
  const m = f.append('feMerge');
  m.append('feMergeNode').attr('in','cb');
  m.append('feMergeNode').attr('in','SourceGraphic');

  // Arrow marker
  defs.append('marker').attr('id','flowArrow')
    .attr('viewBox','0 0 10 10').attr('refX',22).attr('refY',5)
    .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
    .append('path').attr('d','M 0 0 L 10 5 L 0 10 Z').attr('fill','#E8660A80');

  // Position 4 nodes in a circle
  const ids = ['A001','A002','A003','A004'];
  const cx = W/2, cy = H/2, r = Math.min(W,H)*0.33;
  const angleOffset = -Math.PI/2;

  const nodePositions = {};
  ids.forEach((id, i) => {
    const angle = angleOffset + (i / ids.length) * 2 * Math.PI;
    nodePositions[id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Draw static dim edges first
  flowSequence.forEach(step => {
    const s = nodePositions[step.from], t = nodePositions[step.to];
    svg.append('line')
      .attr('class', `flow-edge flow-edge-${step.from}-${step.to}`)
      .attr('x1', s.x).attr('y1', s.y).attr('x2', t.x).attr('y2', t.y)
      .attr('stroke','#2A2A2A').attr('stroke-width', 2)
      .attr('marker-end','url(#flowArrow)');
  });

  // Draw nodes
  ids.forEach(id => {
    const acct = accounts.find(a => a.id === id);
    const pos  = nodePositions[id];
    const col  = riskColorMap[acct?.risk] || '#888';

    const g = svg.append('g').attr('class', `flow-node-${id}`);

    g.append('circle').attr('cx', pos.x).attr('cy', pos.y).attr('r', 28)
      .attr('fill', col).attr('stroke', col).attr('stroke-width', 3)
      .attr('stroke-opacity', 0.3).attr('filter','url(#flowGlow)');

    g.append('text').attr('x', pos.x).attr('y', pos.y - 2)
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('font-family','DM Mono, monospace').attr('font-size','9px')
      .attr('fill','white').attr('font-weight','700')
      .text(id.replace('A0','A'));

    g.append('text').attr('x', pos.x).attr('y', pos.y + 11)
      .attr('text-anchor','middle').attr('font-family','DM Sans, sans-serif')
      .attr('font-size','9px').attr('fill','rgba(255,255,255,0.6)')
      .text(acct?.name.split(' ')[0] || id);

    // Label outside circle
    const labelOffset = 44;
    const angle = Math.atan2(pos.y - cy, pos.x - cx);
    g.append('text')
      .attr('x', pos.x + labelOffset * Math.cos(angle))
      .attr('y', pos.y + labelOffset * Math.sin(angle))
      .attr('text-anchor', pos.x < cx ? 'end' : pos.x > cx ? 'start' : 'middle')
      .attr('font-family','DM Sans, sans-serif').attr('font-size','10px')
      .attr('fill','#888')
      .text(acct?.name.length > 14 ? acct.name.slice(0,14)+'…' : acct?.name);
  });

  flowNodesRef = nodePositions;
}

function playMoneyFlow() {
  if (flowAnimating) return;
  flowAnimating = true;

  // Reset
  document.getElementById('flowDetectionBanner').classList.remove('show');
  document.querySelectorAll('.flow-step-item').forEach(el => {
    el.classList.remove('visible','active-step');
  });
  flowSequence.forEach(step => {
    const edge = document.querySelector(`.flow-edge-${step.from}-${step.to}`);
    if (edge) d3.select(edge).attr('stroke','#2A2A2A').attr('stroke-width',2).attr('stroke-opacity',1);
  });

  let stepIndex = 0;

  function animateStep() {
    if (stepIndex >= flowSequence.length) {
      // All steps done — show detection banner
      setTimeout(() => {
        document.getElementById('flowDetectionBanner').classList.add('show');
        flowAnimating = false;
      }, 400);
      return;
    }

    const step    = flowSequence[stepIndex];
    const logItem = document.getElementById(`flow-step-${stepIndex}`);
    if (logItem) {
      logItem.classList.add('visible');
      setTimeout(() => logItem.classList.add('active-step'), 50);
    }

    // Animate the edge
    const edge = d3.select(`.flow-edge-${step.from}-${step.to}`);
    const s    = flowNodesRef[step.from];
    const t    = flowNodesRef[step.to];

    // Light up edge
    edge.transition().duration(300)
      .attr('stroke', step.color)
      .attr('stroke-width', 4)
      .attr('stroke-opacity', 0.9);

    // Money particle travelling along the edge
    const svg = flowSvgRef;
    if (svg && s && t) {
      const particle = svg.append('text')
        .attr('x', s.x).attr('y', s.y)
        .attr('font-family','DM Mono, monospace').attr('font-size','10px')
        .attr('fill','#F5A623').attr('font-weight','700')
        .attr('text-anchor','middle')
        .attr('filter','url(#flowGlow)')
        .text(step.amount);

      particle.transition().duration(900).ease(d3.easeQuadInOut)
        .attr('x', t.x).attr('y', t.y)
        .on('end', () => particle.remove());
    }

    // Dim previous edge after 1.2s
    setTimeout(() => {
      edge.transition().duration(400)
        .attr('stroke', '#3A3A4A')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6);
    }, 1200);

    // Remove active-step from log
    if (logItem) {
      setTimeout(() => logItem.classList.remove('active-step'), 1200);
    }

    stepIndex++;
    setTimeout(animateStep, 1400);
  }

  animateStep();
}

function resetMoneyFlow() {
  flowAnimating = false;
  document.getElementById('flowDetectionBanner').classList.remove('show');
  document.querySelectorAll('.flow-step-item').forEach(el => {
    el.classList.remove('visible','active-step');
  });
  if (flowSvgRef) {
    flowSequence.forEach(step => {
      d3.select(`.flow-edge-${step.from}-${step.to}`)
        .attr('stroke','#2A2A2A').attr('stroke-width',2).attr('stroke-opacity',1);
    });
  }
}

// ===================================================
// FEATURE 5 — RISK HEAT MAP (BRANCH)
// ===================================================
const branchData = [
  { name:'Mumbai Central',  risk:'high',   score:82, alerts:24, amount:'₹2.3Cr', color:'#FF4757' },
  { name:'Delhi NCR',       risk:'high',   score:74, alerts:18, amount:'₹1.8Cr', color:'#FF6B35' },
  { name:'Kolkata North',   risk:'medium', score:55, alerts:11, amount:'₹87L',   color:'#F5A623' },
  { name:'Pune West',       risk:'medium', score:48, alerts:8,  amount:'₹63L',   color:'#F5A623' },
  { name:'Chennai',         risk:'medium', score:41, alerts:6,  amount:'₹52L',   color:'#F5A623' },
  { name:'Hyderabad',       risk:'low',    score:28, alerts:3,  amount:'₹31L',   color:'#00C48C' },
  { name:'Bengaluru',       risk:'low',    score:22, alerts:2,  amount:'₹24L',   color:'#00C48C' },
  { name:'Ahmedabad',       risk:'low',    score:15, alerts:1,  amount:'₹12L',   color:'#00C48C' },
];

function renderBranchHeatmap() {
  const container = document.getElementById('branchHeatmapGrid');
  if (!container) return;

  container.innerHTML = branchData.map((b,i) => `
    <div class="branch-card risk-${b.risk}" onclick="selectBranch(${i})">
      <div class="branch-risk-dot" style="background:${b.color}"></div>
      <div class="branch-info">
        <div class="branch-name">${b.name}</div>
        <div class="branch-meta">${b.alerts} alerts · ${b.amount} at risk</div>
      </div>
      <div class="branch-score" style="color:${b.color}">${b.score}</div>
    </div>
  `).join('');

  initBranchChart();
}

function initBranchChart() {
  const container = document.getElementById('branchChartArea');
  if (!container || container.querySelector('svg')) return;

  const W = container.clientWidth || 500;
  const H = container.clientHeight || 250;
  const m = { top:20, right:20, bottom:60, left:40 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;

  const svg = d3.select(container).append('svg').attr('width',W).attr('height',H);
  const g   = svg.append('g').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleBand().domain(branchData.map(b => b.name)).range([0,w]).padding(0.25);
  const y = d3.scaleLinear().domain([0,100]).range([h,0]);

  // Grid lines
  g.selectAll('.grid-line').data(y.ticks(4)).enter().append('line')
    .attr('x1',0).attr('x2',w).attr('y1',d=>y(d)).attr('y2',d=>y(d))
    .attr('stroke','#2A2A2A').attr('stroke-dasharray','3,3');

  // Bars
  g.selectAll('rect').data(branchData).enter().append('rect')
    .attr('x',    d => x(d.name))
    .attr('y',    d => y(d.score))
    .attr('width', x.bandwidth())
    .attr('height',d => h - y(d.score))
    .attr('fill', d => d.color)
    .attr('rx', 4)
    .attr('opacity', 0.85)
    .on('mouseover', function(e, d) {
      d3.select(this).attr('opacity',1);
    })
    .on('mouseout', function() { d3.select(this).attr('opacity',0.85); });

  // Score labels on bars
  g.selectAll('.bar-label').data(branchData).enter().append('text')
    .attr('x', d => x(d.name) + x.bandwidth()/2)
    .attr('y', d => y(d.score) - 6)
    .attr('text-anchor','middle')
    .attr('font-family','Space Mono, monospace').attr('font-size','10px').attr('font-weight','700')
    .attr('fill', d => d.color).text(d => d.score);

  // X axis
  g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x))
    .selectAll('text')
    .attr('fill','#666').attr('font-family','DM Sans').attr('font-size','9px')
    .attr('transform','rotate(-30)').attr('text-anchor','end');
  g.selectAll('.domain').attr('stroke','#2A2A2A');
  g.selectAll('.tick line').attr('stroke','#2A2A2A');
}

function selectBranch(i) {
  const b  = branchData[i];
  const el = document.getElementById('branchDetailText');
  if (el) {
    el.innerHTML = `<strong style="color:${b.color}">${b.name}</strong> — Risk Score: <strong style="font-family:var(--font-number)">${b.score}/100</strong><br>
    ${b.alerts} active alerts &nbsp;|&nbsp; ${b.amount} at risk &nbsp;|&nbsp; Level: <strong>${b.risk.toUpperCase()}</strong>`;
  }
}

// ===================================================
// FEATURE 6 — TIMELINE REPLAY
// ===================================================
const replaySteps = [
  { time:'09:15', from:'Rajesh Mehta', to:'Shell Corp A', amount:'₹4,95,000', channel:'NEFT', color:'#FF4757', fromId:'A001', toId:'A002' },
  { time:'10:42', from:'Shell Corp A', to:'Dormant 7823', amount:'₹4,90,000', channel:'RTGS', color:'#FF6B35', fromId:'A002', toId:'A003' },
  { time:'14:08', from:'Dormant 7823', to:'Partner B',    amount:'₹4,85,000', channel:'NEFT', color:'#F5A623', fromId:'A003', toId:'A004' },
  { time:'17:55', from:'Partner B',    to:'Rajesh Mehta', amount:'₹4,80,000', channel:'UPI',  color:'#FF4757', fromId:'A004', toId:'A001' },
  { time:'08:30', from:'Rajesh Mehta', to:'ATM',          amount:'₹49,900',   channel:'ATM',  color:'#F5A623', fromId:'A001', toId:null   },
  { time:'09:15', from:'Rajesh Mehta', to:'ATM',          amount:'₹49,800',   channel:'ATM',  color:'#F5A623', fromId:'A001', toId:null   },
];

let replayCurrentStep = -1;
let replayTimer       = null;
let replayPlaying     = false;
let replaySvg         = null;
let replayNodePos     = null;

function initReplayGraph() {
  const container = document.getElementById('replayGraphArea');
  if (!container || container.querySelector('svg')) return;

  const W = container.clientWidth || 700;
  const H = 300;

  const svg = d3.select(container).append('svg').attr('width',W).attr('height',H);
  replaySvg = svg;

  const defs = svg.append('defs');
  const f    = defs.append('filter').attr('id','replayGlow');
  f.append('feGaussianBlur').attr('stdDeviation','3').attr('result','cb');
  const me = f.append('feMerge');
  me.append('feMergeNode').attr('in','cb');
  me.append('feMergeNode').attr('in','SourceGraphic');

  defs.append('marker').attr('id','replayArrow')
    .attr('viewBox','0 0 10 10').attr('refX',20).attr('refY',5)
    .attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
    .append('path').attr('d','M 0 0 L 10 5 L 0 10 Z').attr('fill','rgba(232,102,10,0.5)');

  const ids = ['A001','A002','A003','A004'];
  const cx  = W/2, cy = H/2, r = Math.min(W,H)*0.32;
  replayNodePos = {};

  ids.forEach((id,i) => {
    const angle = -Math.PI/2 + (i/ids.length)*2*Math.PI;
    replayNodePos[id] = { x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle) };
  });

  // Static edges
  const edgePairs = [['A001','A002'],['A002','A003'],['A003','A004'],['A004','A001']];
  edgePairs.forEach(([a,b]) => {
    svg.append('line')
      .attr('class', `replay-edge replay-edge-${a}-${b}`)
      .attr('x1', replayNodePos[a].x).attr('y1', replayNodePos[a].y)
      .attr('x2', replayNodePos[b].x).attr('y2', replayNodePos[b].y)
      .attr('stroke','#2A2A2A').attr('stroke-width',2)
      .attr('marker-end','url(#replayArrow)');
  });

  // Nodes
  ids.forEach(id => {
    const acct = accounts.find(a => a.id === id);
    const pos  = replayNodePos[id];
    const col  = riskColorMap[acct?.risk] || '#888';
    const g    = svg.append('g').attr('class', `replay-node-g-${id}`);

    g.append('circle').attr('class',`replay-node-${id}`)
      .attr('cx',pos.x).attr('cy',pos.y).attr('r',22)
      .attr('fill',col).attr('stroke',col)
      .attr('stroke-width',2).attr('stroke-opacity',0.35);

    g.append('text').attr('x',pos.x).attr('y',pos.y)
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('font-family','DM Mono, monospace').attr('font-size','9px')
      .attr('fill','white').attr('font-weight','700').text(id.replace('A0','A'));

    const angle = Math.atan2(pos.y-cy, pos.x-cx);
    const lx = pos.x + 38*Math.cos(angle);
    const ly = pos.y + 38*Math.sin(angle);
    g.append('text').attr('x',lx).attr('y',ly)
      .attr('text-anchor', pos.x < cx-20 ? 'end' : pos.x > cx+20 ? 'start' : 'middle')
      .attr('font-family','DM Sans, sans-serif').attr('font-size','10px')
      .attr('fill','#777').text(acct?.name.split(' ')[0] || id);
  });
}

function replayStepForward() {
  if (replayCurrentStep >= replaySteps.length - 1) return;
  replayCurrentStep++;
  applyReplayStep(replayCurrentStep);
}

function replayStepBack() {
  if (replayCurrentStep <= 0) {
    resetReplay();
    return;
  }
  replayCurrentStep--;
  resetReplayVisuals();
  for (let i = 0; i <= replayCurrentStep; i++) applyReplayStep(i, false);
}

function applyReplayStep(idx, animate=true) {
  const step = replaySteps[idx];
  if (!step) return;

  // Highlight event row
  document.querySelectorAll('.replay-event-row').forEach((el,i) => {
    el.classList.toggle('highlighted', i === idx);
  });

  // Update indicator
  const numEl = document.getElementById('replayStepNum');
  const lblEl = document.getElementById('replayStepLabel');
  if (numEl) numEl.textContent = (idx+1) + '/' + replaySteps.length;
  if (lblEl) lblEl.textContent = step.time + ' · ' + step.channel;

  // Update progress bar
  const fill = document.getElementById('replayBarFill');
  if (fill) fill.style.width = ((idx+1)/replaySteps.length*100) + '%';

  // Animate edge if both nodes exist in graph
  if (replaySvg && step.fromId && step.toId) {
    const edge = d3.select(`.replay-edge-${step.fromId}-${step.toId}`);
    if (!edge.empty()) {
      edge.transition().duration(animate ? 500 : 0)
        .attr('stroke', step.color).attr('stroke-width', 4).attr('stroke-opacity',0.9);
    }

    // Highlight source node
    d3.select(`.replay-node-${step.fromId}`)
      .transition().duration(animate ? 300 : 0)
      .attr('r', 28).attr('filter','url(#replayGlow)');

    // Particle animation
    if (animate && replaySvg && replayNodePos[step.fromId] && replayNodePos[step.toId]) {
      const s = replayNodePos[step.fromId], t = replayNodePos[step.toId];
      const p = replaySvg.append('text')
        .attr('x', s.x).attr('y', s.y)
        .attr('text-anchor','middle').attr('font-family','DM Mono, monospace')
        .attr('font-size','10px').attr('fill','#F5A623').attr('font-weight','700')
        .text(step.amount);

      p.transition().duration(800).ease(d3.easeQuadInOut)
        .attr('x', t.x).attr('y', t.y).on('end', ()=>p.remove());
    }
  }
}

function resetReplayVisuals() {
  if (!replaySvg) return;
  const pairs = [['A001','A002'],['A002','A003'],['A003','A004'],['A004','A001']];
  pairs.forEach(([a,b]) => {
    d3.select(`.replay-edge-${a}-${b}`)
      .attr('stroke','#2A2A2A').attr('stroke-width',2).attr('stroke-opacity',1);
  });
  ['A001','A002','A003','A004'].forEach(id => {
    d3.select(`.replay-node-${id}`).attr('r',22).attr('filter',null);
  });
  document.querySelectorAll('.replay-event-row').forEach(el => el.classList.remove('highlighted'));
  const fill = document.getElementById('replayBarFill');
  if (fill) fill.style.width = '0%';
}

function resetReplay() {
  clearInterval(replayTimer);
  replayPlaying     = false;
  replayCurrentStep = -1;
  resetReplayVisuals();
  const numEl = document.getElementById('replayStepNum');
  const lblEl = document.getElementById('replayStepLabel');
  if (numEl) numEl.textContent = '0/' + replaySteps.length;
  if (lblEl) lblEl.textContent = 'Press Play';
  const fill = document.getElementById('replayBarFill');
  if (fill) fill.style.width = '0%';
}

function toggleReplayPlay() {
  const btn = document.getElementById('replayPlayBtn');
  if (replayPlaying) {
    clearInterval(replayTimer);
    replayPlaying = false;
    if (btn) btn.textContent = '▶ Play';
  } else {
    replayPlaying = true;
    if (btn) btn.textContent = '⏸ Pause';
    if (replayCurrentStep >= replaySteps.length - 1) resetReplay();
    replayTimer = setInterval(() => {
      if (replayCurrentStep >= replaySteps.length - 1) {
        clearInterval(replayTimer);
        replayPlaying = false;
        if (btn) btn.textContent = '▶ Play';
      } else {
        replayStepForward();
      }
    }, 1600);
  }
}

// ===================================================
// FEATURE 7 — FRAUD RING DETECTION
// ===================================================
const fraudRings = [
  {
    id: 'RING-001',
    name: 'Round-Trip Ring Alpha',
    accounts: ['A001','A002','A003','A004'],
    totalAmount: '₹18,45,000',
    riskScore: 92,
    timespan: '8h 40m',
    detectedAt: '14 Mar 2026, 17:58',
  },
  {
    id: 'RING-002',
    name: 'Mule Network Beta',
    accounts: ['A007','A010','A012','A016'],
    totalAmount: '₹32,00,000',
    riskScore: 88,
    timespan: '6h 00m',
    detectedAt: '14 Mar 2026, 13:35',
  },
];

let activeFraudRing = 0;

function renderFraudRingAccounts(ringIdx) {
  const ring      = fraudRings[ringIdx];
  const container = document.getElementById('fraudRingAccountList');
  if (!container) return;

  const colors = ['#FF4757','#FF6B35','#F5A623','#FF4757'];
  container.innerHTML = ring.accounts.map((id, i) => {
    const acct = accounts.find(a => a.id === id);
    return `
      <div class="ring-account-item">
        <div class="ring-account-avatar" style="background:${colors[i]}">
          ${acct?.name.split(' ').map(w=>w[0]).join('').slice(0,2) || id}
        </div>
        <div>
          <div class="ring-account-name">${acct?.name || id}</div>
          <div class="ring-account-id">${id} · ${acct?.type || 'Unknown'}</div>
        </div>
        <div class="ring-account-score" style="color:${colors[i]}">${acct?.riskScore || '—'}</div>
      </div>`;
  }).join('');

  // Update header meta
  const metaEl = document.getElementById('fraudRingMeta');
  if (metaEl) {
    metaEl.textContent = `${ring.accounts.length} accounts · ${ring.totalAmount} · Detected ${ring.detectedAt}`;
  }
  const titleEl = document.getElementById('fraudRingTitle');
  if (titleEl) titleEl.textContent = ring.name + ' — ' + ring.id;
}

function initFraudRingGraph(ringIdx) {
  const container = document.getElementById('fraudRingGraph');
  if (!container) return;
  container.innerHTML = ''; // clear for re-render

  const ring = fraudRings[ringIdx];
  const W    = container.clientWidth || 400;
  const H    = 320;

  const svg  = d3.select(container).append('svg').attr('width',W).attr('height',H);
  const defs = svg.append('defs');

  const f = defs.append('filter').attr('id','ringGlow');
  f.append('feGaussianBlur').attr('stdDeviation','5').attr('result','cb');
  const m = f.append('feMerge');
  m.append('feMergeNode').attr('in','cb');
  m.append('feMergeNode').attr('in','SourceGraphic');

  defs.append('marker').attr('id','ringArrow')
    .attr('viewBox','0 0 10 10').attr('refX',20).attr('refY',5)
    .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
    .append('path').attr('d','M 0 0 L 10 5 L 0 10 Z').attr('fill','rgba(255,71,87,0.6)');

  const ids = ring.accounts;
  const cx  = W/2, cy = H/2, r = Math.min(W,H)*0.33;
  const pos = {};

  ids.forEach((id,i) => {
    const angle = -Math.PI/2 + (i/ids.length)*2*Math.PI;
    pos[id] = { x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle) };
  });

  // Circular edges
  ids.forEach((id,i) => {
    const nextId = ids[(i+1) % ids.length];
    svg.append('line')
      .attr('x1', pos[id].x).attr('y1', pos[id].y)
      .attr('x2', pos[nextId].x).attr('y2', pos[nextId].y)
      .attr('stroke','rgba(255,71,87,0.6)').attr('stroke-width',3)
      .attr('class','fraud-edge').attr('marker-end','url(#ringArrow)');
  });

  // Red shaded ring area (filled polygon)
  const points = ids.map(id => `${pos[id].x},${pos[id].y}`).join(' ');
  svg.append('polygon').attr('points', points)
    .attr('fill','rgba(255,71,87,0.06)')
    .attr('stroke','rgba(255,71,87,0.2)').attr('stroke-width',1);

  // Nodes
  ids.forEach((id,i) => {
    const acct = accounts.find(a => a.id === id);
    const g    = svg.append('g');

    // Outer pulse ring
    g.append('circle').attr('cx', pos[id].x).attr('cy', pos[id].y)
      .attr('r',28).attr('fill','none')
      .attr('stroke','#FF4757').attr('stroke-width',1.5)
      .attr('class','glow-ring-pulse');

    // Main node
    g.append('circle').attr('cx', pos[id].x).attr('cy', pos[id].y)
      .attr('r',18).attr('fill','#FF4757').attr('stroke','#FF4757')
      .attr('stroke-width',2).attr('stroke-opacity',0.3)
      .attr('filter','url(#ringGlow)').attr('class','node-pulse');

    g.append('text').attr('x', pos[id].x).attr('y', pos[id].y)
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('font-family','DM Mono, monospace').attr('font-size','9px')
      .attr('fill','white').attr('font-weight','700').text(id.replace('A0','A'));

    const angle = Math.atan2(pos[id].y-cy, pos[id].x-cx);
    const lx = pos[id].x + 44*Math.cos(angle);
    const ly = pos[id].y + 44*Math.sin(angle);
    g.append('text').attr('x', lx).attr('y', ly)
      .attr('text-anchor', pos[id].x < cx ? 'end' : 'start')
      .attr('font-family','DM Sans, sans-serif').attr('font-size','10px').attr('fill','#AAA')
      .text(acct?.name.split(' ')[0] || id);
  });

  // Center label
  svg.append('text').attr('x',cx).attr('y',cy-8)
    .attr('text-anchor','middle').attr('font-family','DM Mono, monospace')
    .attr('font-size','10px').attr('fill','rgba(255,71,87,0.8)').attr('font-weight','700')
    .text('FRAUD RING');
  svg.append('text').attr('x',cx).attr('y',cy+8)
    .attr('text-anchor','middle').attr('font-family','Space Mono, monospace')
    .attr('font-size','14px').attr('fill','#FF4757').attr('font-weight','700')
    .text(ring.id);
}

function selectFraudRing(idx) {
  activeFraudRing = idx;
  renderFraudRingAccounts(idx);
  initFraudRingGraph(idx);
  document.querySelectorAll('.ring-tab-btn').forEach((b,i) => {
    b.classList.toggle('active', i === idx);
  });
}

// ===================================================
// FEATURE 8 — ENHANCED AI REPORT with better text
// ===================================================
function generateAIReport(ringIdx) {
  const ring      = fraudRings[ringIdx || 0];
  const acctNames = ring.accounts.map(id => accounts.find(a=>a.id===id)?.name || id);
  const btn       = document.getElementById('aiReportBtn');
  const area      = document.getElementById('aiReportArea');
  const status    = document.getElementById('aiReportStatus');

  if (!area) return;
  if (btn) { btn.style.opacity='0.5'; btn.style.pointerEvents='none'; }
  if (status) status.textContent = 'Generating…';

  area.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'ai-typing-cursor';

  const reportText = `SUSPICIOUS TRANSACTION REPORT (STR)
FIU-IND Reference Format | Auto-Generated by FundFlow AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASE ID       : FD-2026-00842
DATE          : 15 March 2026, 18:04 IST
RISK SCORE    : ${ring.riskScore} / 100
CLASSIFICATION: SUSPICIOUS — ${ring.name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY

A suspicious circular fund flow was detected between accounts ${acctNames.join(', ')}. The accounts exchanged funds within a ${ring.timespan} window, indicating possible round-tripping behaviour. Total amount involved: ${ring.totalAmount}.

PATTERN ANALYSIS

The FundFlow Graph Neural Network detected a ${ring.accounts.length}-node circular transaction pattern. Each account transferred funds to the next in sequence before the final account returned funds to the originator — a classic layering technique used in money laundering to obscure the source of funds.

Step 1 — ${acctNames[0]} initiated transfer to ${acctNames[1]}
Step 2 — ${acctNames[1]} forwarded funds to ${acctNames[2]}
Step 3 — ${acctNames[2]} relayed to ${acctNames[3] || acctNames[0]}
Step 4 — Final account returned funds to originator

RISK INDICATORS

• Circular fund flow completed within ${ring.timespan}
• Declared income of primary account: ₹6,00,000/yr
• Actual monthly flow: ${ring.totalAmount} — 3.07× annual income
• Shell entity with no declared business purpose involved
• Dormant account activated specifically for this sequence
• Structuring detected: two ATM withdrawals just below ₹50,000 threshold

RECOMMENDATION

Immediate filing of STR with FIU-IND is recommended under PMLA 2002 Section 12. Freeze order on accounts ${ring.accounts.join(', ')} should be considered pending further investigation. Request for Information (RFI) to receiving bank branches advised within 48 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-generated by FundFlow AI Engine v1.0
Analyst review required before submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const words = reportText.split(/(?<=\s)/);
  let i = 0;
  area.appendChild(cursor);

  function typeNext() {
    if (i >= words.length) {
      cursor.remove();
      if (status) status.textContent = 'Complete ✓';
      if (btn)    { btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
      // Enable download
      const dlBtn = document.getElementById('aiDownloadBtn');
      if (dlBtn)  { dlBtn.style.opacity='1'; dlBtn.style.pointerEvents='auto'; }
      return;
    }
    const word = words[i];
    if (word.includes('\n')) {
      word.split('\n').forEach((part, idx, arr) => {
        if (part) area.insertBefore(document.createTextNode(part), cursor);
        if (idx < arr.length-1) area.insertBefore(document.createElement('br'), cursor);
      });
    } else {
      area.insertBefore(document.createTextNode(word), cursor);
    }
    i++;
    const delay = word.includes('━') ? 5 : word.includes('.') || word.includes(':') ? 55 : 22;
    setTimeout(typeNext, delay);
    area.scrollTop = area.scrollHeight;
  }
  setTimeout(typeNext, 300);
}

// ===================================================
// EXTEND switchView TO INIT NEW VIEWS
// ===================================================
const _origSwitchView = switchView;
switchView = function(viewId) {
  _origSwitchView(viewId);
  if (viewId === 'flow') {
    setTimeout(() => initMoneyFlowView(), 200);
  }
  if (viewId === 'heatmap') {
    setTimeout(() => {
      renderBranchHeatmap();
    }, 200);
  }
  if (viewId === 'replay') {
    setTimeout(() => {
      initReplayGraph();
      renderReplayEvents();
    }, 200);
  }
  if (viewId === 'rings') {
    setTimeout(() => {
      renderFraudRingAccounts(0);
      initFraudRingGraph(0);
    }, 200);
  }
};

function renderReplayEvents() {
  const container = document.getElementById('replayEventList');
  if (!container) return;
  container.innerHTML = replaySteps.map((s,i) => `
    <div class="replay-event-row" id="replay-row-${i}">
      <span class="replay-event-time">${s.time}</span>
      <span class="replay-event-arrow">${s.from} → ${s.to}</span>
      <span class="replay-event-badge badge badge-${s.color === '#FF4757' ? 'critical' : s.color === '#F5A623' ? 'medium' : 'high'}">${s.channel}</span>
      <span class="replay-event-amount">${s.amount}</span>
    </div>`).join('');
}