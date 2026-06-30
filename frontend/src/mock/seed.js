// Single source of truth for the Glean Enterprise Intelligence prototype.
// All data is illustrative. HTML tags inside strings are rendered by the frontend.

export const SOURCES = {
  jira:  { key: 'jira',  label: 'Jira',       color: '#1868DB' },
  gh:    { key: 'gh',    label: 'GitHub',     color: '#1F2328' },
  slack: { key: 'slack', label: 'Slack',      color: '#4A154B' },
  zoom:  { key: 'zoom',  label: 'Zoom',       color: '#2D8CFF' },
  cal:   { key: 'cal',   label: 'Calendar',   color: '#1A73E8' },
  conf:  { key: 'conf',  label: 'Confluence', color: '#0B66C2' },
  crm:   { key: 'crm',   label: 'Salesforce', color: '#00A1E0' },
  gong:  { key: 'gong',  label: 'Gong',       color: '#7A4DEB' },
  zen:   { key: 'zen',   label: 'Zendesk',    color: '#03363D' },
  mail:  { key: 'mail',  label: 'Gmail',      color: '#EA4335' },
  prod:  { key: 'prod',  label: 'Usage',      color: '#1A9A6C' },
};

const deliveryInsights = [
  {
    id: 'atlas', persona: 'delivery', severity: 'red', sevLabel: 'LAUNCH RISK',
    title: 'Project Atlas is trending toward a Q3 launch slip',
    meta: 'Detected this weekend · value-at-risk: 3 design-partner GA commits',
    valueAtRisk: '3 design-partner GA commits',
    body: 'Three independent signals diverged at the same time. Composite <b>launch-slip probability is 78%</b> — up from 31% two weeks ago. The Q3 GA date you committed to <b>Northwind, Veridian, and Cobalt</b> is now the binding constraint.',
    sources: ['jira', 'gh', 'slack', 'zoom'],
    baseConfidence: 0.84, confColor: '#E5484D',
    narrative: 'Atlas velocity has fallen for <b>3 consecutive sprints</b> while scope held flat — a burn-down the team won\'t close by Sep 12 at the current rate. The proximate cause isn\'t headcount: <b>PR review latency more than doubled</b> (2.1d → 5.4d) after the Platform team reassigned two reviewers, and <b>13 Atlas PRs are now blocked on a flaky auth-service test suite</b>. Standup sentiment in #atlas turned negative on Thu, and Friday\'s retro flagged the same dependency without an owner. This is a <b>cross-team blocker, not a team-effort problem</b> — which is why no single dashboard surfaced it.',
    contributions: [
      { signal: 'velocity',   label: 'Jira velocity ↓ 3 sprints',         weight: 34, source: 'jira' },
      { signal: 'reviewLat',  label: 'PR review latency 2.1→5.4d',        weight: 29, source: 'gh' },
      { signal: 'ciFlake',    label: 'CI: 13 PRs blocked on flaky test',  weight: 22, source: 'gh' },
      { signal: 'sentiment',  label: '#atlas sentiment ↓ (Slack+Zoom)',   weight: 15, source: 'slack' },
    ],
    timeline: [
      { when: '2 weeks ago', text: 'Platform reassigns 2 reviewers off Atlas <a>(GitHub teams change)</a>', warn: false },
      { when: 'Jun 18', text: '<b>auth-service</b> test suite starts flaking — CI pass rate 94%→61% <a>(CI)</a>', warn: true },
      { when: 'Jun 22–26', text: 'Sprint 14 velocity comes in 38% under commit <a>(Jira)</a>', warn: true },
      { when: 'Jun 26', text: 'Friday retro: 4 engineers name the Platform dependency, no owner assigned <a>(Confluence)</a>', warn: true },
      { when: 'Jun 27', text: '#atlas message sentiment turns negative; "we\'re blocked" appears 9× <a>(Slack)</a>', warn: true },
    ],
    calibration: 'Calibrated against <b>142 prior delivery-risk predictions</b> in your org. At this score band, Glean was right <b>86% of the time</b> (lead time avg 19 days before slip became visible in status reports). <b>Top driver:</b> the cross-team review reassignment — removing it drops the score to 0.41.',
    precision: 86, sampleSize: 142, leadTimeDays: 19,
    actions: [
      { ic: '🤖', t: 'Draft a mitigation plan', s: 'Agent reads Atlas Jira + PRs + last 2 standups → 3 options', agentic: true, ab: 'Dispatch' },
      { ic: '📣', t: 'Notify Atlas + Platform leads', s: 'Share this brief with Sam & Priya, ask for a reviewer swap', ab: 'Send' },
      { ic: '📅', t: 'Brief execs at Mon staff', s: 'Add a 2-min flag to today\'s leadership sync', ab: 'Add' },
    ],
  },
  {
    id: 'bus', persona: 'delivery', severity: 'amber', sevLabel: 'KEY-PERSON RISK',
    title: 'One engineer owns 63% of the payments domain — and is out next sprint',
    meta: 'Single point of failure · J. Park on PTO Jul 6–17',
    valueAtRisk: 'payments reliability during PTO window',
    body: 'Across the last 6 months, <b>Jordan Park</b> authored or reviewed 63% of merged PRs touching <b>billing-service</b> and is the only listed CODEOWNER. Two payments items are scheduled into the sprint that starts the day Jordan\'s PTO begins.',
    sources: ['gh', 'jira', 'cal'],
    baseConfidence: 0.79, confColor: '#D9730D',
    narrative: 'This isn\'t a performance signal — Jordan is a strength. It\'s a <b>resilience gap</b>. If a payments incident lands during the PTO window, mean-time-to-resolve historically <b>triples</b> when Jordan isn\'t the responder. Two scheduled items (<b>BILL-2231</b> dunning retry, refund webhooks) both touch the riskiest module.',
    contributions: [
      { signal: 'codeowner', label: 'CODEOWNERS: sole owner',      weight: 40, source: 'gh' },
      { signal: 'prShare',   label: '63% of merged payments PRs',  weight: 33, source: 'gh' },
      { signal: 'ptoOverlap',label: 'PTO overlaps payments sprint',weight: 27, source: 'cal' },
    ],
    timeline: [
      { when: 'Last 6 mo', text: 'Jordan = 63% of <b>billing-service</b> merges, only CODEOWNER <a>(GitHub)</a>', warn: false },
      { when: 'Jun 24', text: 'PTO Jul 6–17 confirmed <a>(Calendar)</a>', warn: false },
      { when: 'Jun 26', text: 'Sprint 15 plan adds 2 payments items into the PTO window <a>(Jira)</a>', warn: true },
    ],
    calibration: 'Calibrated against <b>past on-call incidents</b>. When the sole domain owner is unavailable, payments incident MTTR rose from 41min to ~2h10 across the last 4 occurrences.',
    precision: 82, sampleSize: 38, leadTimeDays: 12,
    actions: [
      { ic: '🤖', t: 'Draft a knowledge-transfer plan', s: 'Agent finds the 2 best backup candidates by code proximity', agentic: true, ab: 'Dispatch' },
      { ic: '🔀', t: 'Re-sequence the 2 payments items', s: 'Move out of the PTO window in Jira', ab: 'Open' },
    ],
  },
  {
    id: 'theme', persona: 'delivery', severity: 'amber', sevLabel: 'EMERGING THEME',
    title: 'A flaky auth-service test is now blocking 3 teams, not just Atlas',
    meta: 'Cross-team pattern · first time it crosses team boundaries',
    valueAtRisk: 'platform-wide reliability',
    body: 'The same root cause behind the Atlas slowdown is independently surfacing in <b>Mobile</b> and <b>Growth</b>: 11 tickets and 4 PRs across three teams trace to <b>auth-service flaky tests</b>. No single team sees the whole pattern.',
    sources: ['jira', 'gh', 'slack'],
    baseConfidence: 0.71, confColor: '#D9730D',
    narrative: 'Glean clustered 11 tickets + 4 PR descriptions + 22 Slack messages by semantic similarity and found one shared root cause spanning <b>3 teams</b>. Individually each looks minor; together it\'s a <b>platform-level reliability issue</b> worth routing to the Platform PM with evidence attached.',
    contributions: [
      { signal: 'cluster',  label: '11 tickets cluster to 1 cause', weight: 46, source: 'jira' },
      { signal: 'blockedPr',label: '4 blocked PRs reference it',    weight: 30, source: 'gh' },
      { signal: 'mentions', label: '22 Slack mentions, 3 channels', weight: 24, source: 'slack' },
    ],
    timeline: [
      { when: 'Jun 18–28', text: 'auth-service flake referenced across <b>#atlas, #mobile, #growth-eng</b> <a>(Slack)</a>', warn: true },
      { when: 'Jun 28', text: 'Glean clusters them to one root cause <a>(semantic match)</a>', warn: false },
    ],
    calibration: 'Clustering precision on prior cross-team themes: <b>83%</b>. The merge is based on shared stack-trace fingerprints + semantic similarity, not just keyword overlap.',
    precision: 83, sampleSize: 64, leadTimeDays: 9,
    actions: [
      { ic: '📤', t: 'Route to Platform PM with evidence', s: 'Creates a Jira epic pre-filled with all 15 linked items', ab: 'Route' },
      { ic: '📌', t: 'Track as a watched theme', s: 'Alert me if it spreads to a 4th team', ab: 'Watch' },
    ],
  },
  {
    id: 'win', persona: 'delivery', severity: 'green', sevLabel: 'VALUE CREATED', win: true,
    title: 'The new onboarding runbook cut ramp time 22% — and it\'s replicable',
    meta: 'Where value is being created · worth scaling to 2 teams',
    valueAtRisk: 'opportunity: faster ramp on 2 more teams',
    body: 'Since the <b>Checkout</b> team shipped its onboarding runbook, new-hire time-to-first-merge dropped from 14d to 11d (<b>−22%</b>). Two other teams have the same ramp problem and no runbook.',
    sources: ['gh', 'conf', 'jira'],
    baseConfidence: 0.74, confColor: '#1A9A6C',
    narrative: 'Intelligence isn\'t only risk. Glean noticed a <b>positive</b> deviation: Checkout\'s new hires are merging faster than the org baseline, and the change correlates with a runbook published 5 weeks ago. <b>Mobile</b> and <b>Data Platform</b> show the slowest ramps and have no equivalent doc — a cheap, high-confidence win to replicate.',
    contributions: [
      { signal: 'ramp',     label: 'Time-to-first-merge 14d→11d',  weight: 50, source: 'gh' },
      { signal: 'runbook',  label: 'Correlates w/ runbook publish', weight: 28, source: 'conf' },
      { signal: 'gap',      label: '2 teams lack equivalent doc',   weight: 22, source: 'jira' },
    ],
    timeline: [
      { when: '5 weeks ago', text: 'Checkout publishes onboarding runbook <a>(Confluence)</a>', warn: false },
      { when: 'Since', text: 'New-hire time-to-first-merge ↓22% vs prior cohort <a>(GitHub)</a>', warn: false },
    ],
    calibration: 'Correlational, not proven causal — flagged honestly. Sample is 6 new hires; Glean labels this <b>"promising, low-cost to test"</b> rather than certain.',
    precision: 74, sampleSize: 6, leadTimeDays: 0,
    actions: [
      { ic: '📋', t: 'Clone the runbook for Mobile & Data Platform', s: 'Agent adapts the Checkout template per team', agentic: true, ab: 'Dispatch' },
      { ic: '👏', t: 'Recognize the Checkout team', s: 'Draft a shout-out for #eng-all', ab: 'Draft' },
    ],
  },
];

const revenueInsights = [
  {
    id: 'northwind', persona: 'revenue', severity: 'red', sevLabel: 'RENEWAL RISK',
    title: 'Northwind ($1.2M) is drifting toward churn — 84 days to renewal',
    meta: 'Detected this weekend · value-at-risk: $1.2M ARR + 2 reference logos',
    valueAtRisk: '$1.2M ARR + 2 reference logos',
    body: 'Four signals turned at once. Composite <b>churn-risk is 0.81</b> — up from 0.34 a month ago. Your renewal with <b>Northwind</b> closes in 84 days and is now your single largest at-risk account.',
    sources: ['crm', 'gong', 'zen', 'mail'],
    baseConfidence: 0.81, confColor: '#E5484D',
    narrative: 'The economic buyer who championed Glean at Northwind <b>left the company three weeks ago</b> (detected via title change + email bounce). Since then, <b>active usage fell 40%</b>, three <b>P1 support tickets</b> have sat unresolved for 9 days, and the last two <b>QBRs were rescheduled</b>. Call sentiment on the most recent Gong recording dropped sharply. Individually these look routine; together they match the <b>pattern of your last 6 churned enterprise accounts</b> at this point in the cycle.',
    contributions: [
      { signal: 'champion', label: 'Champion departed',           weight: 32, source: 'crm' },
      { signal: 'usage',    label: 'Active usage ↓ 40%',            weight: 28, source: 'prod' },
      { signal: 'tickets',  label: '3 P1 tickets unresolved 9d',    weight: 24, source: 'zen' },
      { signal: 'qbr',      label: 'QBR slipped 2× · sentiment ↓',  weight: 16, source: 'gong' },
    ],
    timeline: [
      { when: '3 weeks ago', text: 'Champion (VP Ops) departs Northwind <a>(title change + bounce)</a>', warn: true },
      { when: 'Since', text: 'Seat activity ↓40%, 2 power users go inactive <a>(Usage)</a>', warn: true },
      { when: 'Jun 19–28', text: '3 P1 tickets opened, none resolved <a>(Zendesk)</a>', warn: true },
      { when: 'Jun 24', text: 'Q3 QBR rescheduled a second time <a>(CRM)</a>', warn: true },
      { when: 'Jun 26', text: 'Renewal-call sentiment turns negative <a>(Gong)</a>', warn: true },
    ],
    calibration: 'Calibrated against your <b>last 6 enterprise churns</b>. At this score band the pattern preceded a non-renewal <b>83%</b> of the time, on average <b>67 days</b> before the AE flagged the account at risk.',
    precision: 83, sampleSize: 6, leadTimeDays: 67,
    actions: [
      { ic: '🤖', t: 'Draft a save play', s: 'Agent assembles account history → a 3-step recovery plan', agentic: true, ab: 'Dispatch' },
      { ic: '🤝', t: 'Loop in an exec sponsor', s: 'Draft a warm intro from your CRO to a new Northwind exec', ab: 'Draft' },
      { ic: '📋', t: 'Brief the account AE', s: 'Send this evidence pack to the owning rep', ab: 'Send' },
    ],
  },
  {
    id: 'pipeline', persona: 'revenue', severity: 'amber', sevLabel: 'PIPELINE RISK',
    title: 'Q3 new-business has a $2.4M gap that won\'t close at current velocity',
    meta: 'Forecast vs. commit · 41 days left in the quarter',
    valueAtRisk: '$2.4M Q3 commit',
    body: 'Stage-to-stage conversion slowed and <b>6 deals worth $2.4M show declining buyer engagement</b>. At the current pace, Q3 lands <b>~14% under commit</b> — visible now, not at the QBR.',
    sources: ['crm', 'mail', 'gong'],
    baseConfidence: 0.73, confColor: '#D9730D',
    narrative: 'Glean joined CRM stage history with <b>email + call engagement</b> and found 6 deals that look healthy in Salesforce but are <b>quietly stalling</b>: reply rates halved, no next meeting booked, single-threaded to one contact. These are the deals a pipeline review misses because the CRM stage has not moved — the <i>behavior</i> changed before the <i>field</i> did.',
    contributions: [
      { signal: 'conv',   label: 'Stage conversion ↓ vs trailing avg', weight: 38, source: 'crm' },
      { signal: 'email',  label: 'Email reply rate halved (6 deals)',  weight: 34, source: 'mail' },
      { signal: 'noMtg',  label: 'No next-meeting booked',             weight: 28, source: 'gong' },
    ],
    timeline: [
      { when: 'Last 3 wks', text: '6 deals: buyer email engagement halves <a>(Gmail)</a>', warn: true },
      { when: 'Ongoing', text: 'No forward meeting booked on any of the 6 <a>(Calendar)</a>', warn: true },
      { when: 'Jun 28', text: 'Forecast model projects a 14% miss <a>(CRM)</a>', warn: true },
    ],
    calibration: 'Engagement-decay has predicted slipped deals with <b>76%</b> precision in your org over the last 2 quarters — earlier than CRM stage movement by ~11 days on average.',
    precision: 76, sampleSize: 90, leadTimeDays: 11,
    actions: [
      { ic: '🤖', t: 'Draft a pipeline-gap plan', s: 'Agent ranks the 6 deals by recoverability + next best action', agentic: true, ab: 'Dispatch' },
      { ic: '🚩', t: 'Flag the 6 stalled deals', s: 'Notify owning reps with the engagement evidence', ab: 'Notify' },
    ],
  },
  {
    id: 'sso', persona: 'revenue', severity: 'amber', sevLabel: 'EMERGING THEME',
    title: '9 open deals are now blocked on the same SSO/SCIM gap',
    meta: 'Cross-deal pattern · worth a product escalation with $ attached',
    valueAtRisk: '$3.1M across 9 deals',
    body: 'A single capability gap — <b>SSO/SCIM provisioning</b> — appears as a blocker across <b>9 open opportunities worth $3.1M</b>. No individual rep sees the aggregate; the pattern only exists at the portfolio level.',
    sources: ['gong', 'crm', 'slack'],
    baseConfidence: 0.70, confColor: '#D9730D',
    narrative: 'Glean clustered objection notes from <b>Gong transcripts</b>, CRM <b>close-reasons</b>, and <b>#deal-desk</b> threads and found the same root blocker recurring across 9 deals and 5 reps. Bundled with dollar value attached, this becomes a <b>prioritization input for Product</b> rather than nine separate anecdotes.',
    contributions: [
      { signal: 'cite',  label: '9 deals cite the same blocker', weight: 46, source: 'gong' },
      { signal: 'dollar',label: '$3.1M tied to the gap',         weight: 30, source: 'crm' },
      { signal: 'desk',  label: 'Recurs in #deal-desk',          weight: 24, source: 'slack' },
    ],
    timeline: [
      { when: 'Last 30 days', text: 'SSO/SCIM raised as a blocker across 9 calls <a>(Gong)</a>', warn: true },
      { when: 'Jun 28', text: 'Glean clusters them; attaches $ from CRM <a>(semantic match)</a>', warn: false },
    ],
    calibration: 'Cross-deal theme clustering precision: <b>81%</b>. Dollar attribution is pulled directly from linked CRM opportunities, not estimated.',
    precision: 81, sampleSize: 52, leadTimeDays: 14,
    actions: [
      { ic: '📤', t: 'Route to Product with $ evidence', s: 'Creates a prioritization brief with all 9 deals linked', ab: 'Route' },
      { ic: '📌', t: 'Track as a watched theme', s: 'Alert me if it blocks a 10th deal', ab: 'Watch' },
    ],
  },
  {
    id: 'expand', persona: 'revenue', severity: 'green', sevLabel: 'VALUE CREATED', win: true,
    title: 'The exec-business-review play lifted expansion 2.1× — 4 accounts qualify now',
    meta: 'Where value is being created · a repeatable win',
    valueAtRisk: 'opportunity: expansion on 4 accounts',
    body: 'Accounts that ran a structured <b>exec business review</b> expanded at <b>2.1× the rate</b> of those that did not. <b>4 current accounts</b> match the qualifying profile and have not had one.',
    sources: ['crm', 'gong', 'prod'],
    baseConfidence: 0.72, confColor: '#1A9A6C',
    narrative: 'A positive deviation worth scaling: Glean correlated <b>expansion outcomes</b> with the presence of an exec business review in the prior quarter and found a strong, repeatable lift. Four accounts with healthy usage and a multi-stakeholder footprint fit the same profile — a low-cost, high-confidence expansion motion to run now.',
    contributions: [
      { signal: 'lift',     label: 'EBR accounts expand 2.1×',       weight: 48, source: 'crm' },
      { signal: 'healthy',  label: 'Healthy usage + multi-threaded', weight: 30, source: 'prod' },
      { signal: 'match',    label: '4 accounts match profile',       weight: 22, source: 'gong' },
    ],
    timeline: [
      { when: 'Last 2 Qs', text: 'EBR accounts show 2.1× expansion vs control <a>(CRM)</a>', warn: false },
      { when: 'Now', text: '4 accounts match the qualifying profile <a>(Usage)</a>', warn: false },
    ],
    calibration: 'Correlational, flagged honestly — sample is 18 accounts. Glean labels this <b>"strong signal, worth a controlled rollout"</b> rather than proven causal.',
    precision: 72, sampleSize: 18, leadTimeDays: 0,
    actions: [
      { ic: '🤖', t: 'Clone the play to 4 accounts', s: 'Agent drafts a tailored EBR agenda per account', agentic: true, ab: 'Dispatch' },
      { ic: '👏', t: 'Recognize the AE who ran it', s: 'Draft a shout-out for #revenue', ab: 'Draft' },
    ],
  },
];

export const PERSONAS = {
  delivery: {
    key: 'delivery',
    who: { name: 'Maya Chen', role: 'VP Engineering', avatar: 'MC' },
    product: 'Delivery Intelligence',
    eyebrow: 'Proactive brief · generated for you',
    head: '3 things need your attention before standup',
    sub: 'Glean watched 6 connected systems over the weekend and synthesized the signals below. You didn\'t search for these — they came to you because something changed.',
    stats: [
      { k: 'Delivery risks',    v: '2',  small: 'active',       d: '▲ 1 new since Friday', dir: 'up' },
      { k: 'Q3 commit at risk', v: '1',  small: 'of 4 launches',d: 'Project Atlas · 3 design partners', dir: 'up' },
      { k: 'Insights actioned', v: '14', small: '/ 30d',        d: '86% rated useful by your team', dir: 'down' },
    ],
    insights: deliveryInsights,
  },
  revenue: {
    key: 'revenue',
    who: { name: 'Diego Rivera', role: 'VP Revenue', avatar: 'DR' },
    product: 'Revenue Intelligence',
    eyebrow: 'Proactive brief · generated for you',
    head: '3 revenue moves to make before your forecast call',
    sub: 'Glean watched your CRM, calls, support, and inboxes over the weekend and synthesized the signals below. No dashboard to check — the intelligence came to you.',
    stats: [
      { k: 'Accounts at risk',  v: '2',     small: 'active', d: '▲ Northwind now critical', dir: 'up' },
      { k: 'ARR at risk',       v: '$1.2M', small: '',       d: '+ $2.4M pipeline gap', dir: 'up' },
      { k: 'Insights actioned', v: '21',    small: '/ 30d',  d: '88% rated useful by your team', dir: 'down' },
    ],
    insights: revenueInsights,
  },
};

export const PROJECTS = [
  { name: 'Project Atlas',      owner: 'Atlas team · GA Sep 12',  health: 38, severity: 'red',   tag: 'AT RISK',  delta: '▼ 33 pts in 2 weeks',    deltaDir: 'up',   insightId: 'atlas' },
  { name: 'Mobile-Pay v3',      owner: 'Mobile team · GA Aug 1',  health: 58, severity: 'amber', tag: 'WATCH',    delta: '▼ 9 pts — key-person risk', deltaDir: 'up', insightId: 'bus' },
  { name: 'Checkout Redesign',  owner: 'Checkout team · shipped', health: 88, severity: 'green', tag: 'HEALTHY',  delta: '▲ onboarding win',       deltaDir: 'down', insightId: null },
  { name: 'Search Quality',     owner: 'Core team · GA Jul 20',   health: 81, severity: 'green', tag: 'HEALTHY',  delta: 'on track',               deltaDir: '',     insightId: null },
  { name: 'Data Platform',      owner: 'DP team · ongoing',       health: 74, severity: 'green', tag: 'HEALTHY',  delta: 'slow new-hire ramp',     deltaDir: '',     insightId: null },
  { name: 'Growth Experiments', owner: 'Growth team · ongoing',   health: 69, severity: 'amber', tag: 'WATCH',    delta: 'auth-flake spillover',   deltaDir: 'up',   insightId: 'theme' },
];

export const CONNECTORS = [
  { key: 'jira',  name: 'Jira',             status: 'Sync 2 min ago · 4,210 issues',  color: '#1868DB', initial: 'J' },
  { key: 'gh',    name: 'GitHub',           status: 'Sync 1 min ago · 38 repos',      color: '#1F2328', initial: 'G' },
  { key: 'slack', name: 'Slack',            status: 'Streaming · 142 channels',       color: '#4A154B', initial: 'S' },
  { key: 'zoom',  name: 'Zoom',             status: 'Sync 14 min ago · transcripts',  color: '#2D8CFF', initial: 'Z' },
  { key: 'cal',   name: 'Google Calendar',  status: 'Sync 5 min ago',                 color: '#1A73E8', initial: 'C' },
  { key: 'conf',  name: 'Confluence',       status: 'Sync 8 min ago · 1,920 pages',   color: '#0B66C2', initial: 'F' },
];

// Signal catalog — id is stable; `enabled` lives in the mutable store.
export const SIGNAL_CATALOG = [
  { id: 'velocity',  name: 'Sprint velocity delta',      source: 'jira',  feeds: 'Slip risk',           weight: 34, precision: 88 },
  { id: 'reviewLat', name: 'PR review latency',          source: 'gh',    feeds: 'Slip risk',           weight: 29, precision: 84 },
  { id: 'ciFlake',   name: 'CI pass-rate / flaky tests', source: 'gh',    feeds: 'Slip risk · Themes',  weight: 22, precision: 81 },
  { id: 'sentiment', name: 'Channel sentiment',          source: 'slack', feeds: 'Slip risk',           weight: 15, precision: 72 },
  { id: 'codeowner', name: 'CODEOWNERS concentration',   source: 'gh',    feeds: 'Key-person risk',     weight: 40, precision: 90 },
  { id: 'ptoOverlap',name: 'PTO / calendar overlap',     source: 'cal',   feeds: 'Key-person risk',     weight: 27, precision: 86 },
  { id: 'cluster',   name: 'Semantic ticket clustering', source: 'jira',  feeds: 'Emerging themes',     weight: 46, precision: 83 },
  { id: 'ramp',      name: 'Time-to-first-merge',        source: 'gh',    feeds: 'Value created',       weight: 50, precision: 74 },
  { id: 'transcript',name: 'Meeting / retro transcripts',source: 'zoom',  feeds: 'Slip risk · Themes',  weight: 12, precision: 70 },
];

// Agent run scripts — steps stream over SSE; output is the final draft (HTML).
export const AGENT_SCRIPTS = {
  atlas: {
    steps: ['Reading Atlas board + 47 open Jira items', 'Diffing last 2 sprint velocities', 'Pulling 13 blocked PRs + CI logs', 'Reviewing 2 standup transcripts', 'Drafting 3 mitigation options'],
    title: 'Mitigation draft ready — posted to #atlas-leads as a draft for your approval',
    options: [
      { label: 'Option A · Unblock (fastest)', text: 'Borrow 1 Platform reviewer for 1 week + quarantine the flaky auth test. Recovers ~70% of lost velocity. Slip risk 78%→39%.' },
      { label: 'Option B · Rescope', text: 'Cut 2 P2 features from GA, ship core to design partners on time. Protects the commit; defers ~3 wks of scope.' },
      { label: 'Option C · Move the date', text: 'Slip GA 12 days with proactive partner comms. Highest quality, hardest conversation.' },
    ],
  },
  bus: {
    steps: ['Scanning billing-service commit graph', 'Ranking engineers by code proximity', 'Checking calendars for transfer windows', 'Drafting a 3-day knowledge-transfer plan'],
    title: 'Knowledge-transfer plan drafted',
    options: [
      { label: 'Best backup', text: 'A. Rivera — 19% of payments PRs, adjacent to billing module.' },
      { label: 'Plan', text: '3× 60-min pairing this week + Jordan records a refund-flow walkthrough + re-sequence BILL items out of PTO window.' },
    ],
  },
  win: {
    steps: ['Reading Checkout runbook structure', 'Mapping Mobile & Data Platform gaps', 'Adapting template per team', 'Drafting 2 ready-to-edit runbooks'],
    title: '2 runbooks drafted from the Checkout template',
    options: [
      { label: 'Mobile', text: 'Adapted for React Native env setup + device lab access.' },
      { label: 'Data Platform', text: 'Adapted for warehouse creds + dbt onboarding. Both ready to edit.' },
    ],
  },
  northwind: {
    steps: ['Pulling Northwind 18-month account history', 'Reading 3 open P1 tickets + status', 'Analyzing the last 4 Gong calls', 'Mapping the new buying committee', 'Drafting a 3-step save play'],
    title: 'Save play drafted — shared with the AE as a draft for your approval',
    options: [
      { label: 'Step 1 · Re-anchor', text: 'Warm exec intro from your CRO to Northwind\'s new VP Ops within 5 days — re-establish a champion.' },
      { label: 'Step 2 · Clear blockers', text: 'Escalate the 3 P1 tickets to a named owner with a 48h SLA; share a fix ETA.' },
      { label: 'Step 3 · Re-prove value', text: 'Run a focused value review tied to their original use case; target usage recovery before renewal.' },
    ],
  },
  pipeline: {
    steps: ['Scoring 6 stalled deals by recoverability', 'Pulling engagement history per deal', 'Identifying the next best action', 'Drafting rep-ready plays'],
    title: 'Pipeline-gap plan drafted',
    options: [
      { label: 'Highest recoverability', text: '2 deals ($900K) — multi-thread + book an exec sync this week.' },
      { label: 'At risk', text: '3 deals ($1.2M) — re-engage with a tailored business case.' },
      { label: 'Likely slip', text: '1 deal ($300K) — move to Q4 and set a realistic expectation now.' },
    ],
  },
  expand: {
    steps: ['Profiling the 4 qualifying accounts', 'Pulling each use case + stakeholders', 'Adapting the EBR agenda per account', 'Drafting 4 ready-to-send agendas'],
    title: '4 tailored EBR agendas drafted',
    options: [
      { label: 'Each agenda', text: 'Maps the account\'s original goals → realized value → a proposed expansion tied to active usage.' },
      { label: 'Ready', text: 'Edit and hand to each AE.' },
    ],
  },
};

export const SEARCH_DOCS = [
  { source: 'jira',  title: 'ATLAS-1187 · Auth-service tests intermittently failing in CI', snippet: 'Pass rate dropped to 61%. Blocking 13 PRs across the Atlas board…', meta: 'Jira · updated 2h ago · Atlas team' },
  { source: 'slack', title: '#atlas · "we\'re blocked on review again"', snippet: 'Thread with 9 messages about Platform reviewers being reassigned…', meta: 'Slack · Jun 27 · 14 participants' },
  { source: 'gh',    title: 'PR #4821 · fix(auth): stabilize token refresh test', snippet: 'Open 5 days · awaiting review · CI red on flaky suite…', meta: 'GitHub · Atlas · review latency 5.4d' },
  { source: 'conf',  title: 'Atlas Sprint 14 Retro', snippet: '4 engineers raised the Platform dependency. No owner assigned for the reviewer swap…', meta: 'Confluence · Jun 26' },
  { source: 'jira',  title: 'Q3 Launch Commitments — Atlas GA', snippet: 'Design partners: Northwind, Veridian, Cobalt. Target GA Sep 12…', meta: 'Jira · Roadmap' },
  { source: 'crm',   title: 'Northwind Corp · Renewal · $1.2M ARR', snippet: 'Renews in 84 days. Champion departed. Health 38 (was 71)…', meta: 'Salesforce · Enterprise' },
  { source: 'gong',  title: 'Northwind renewal call · Jun 26', snippet: 'Sentiment negative. New stakeholder unfamiliar with original use case…', meta: 'Gong · 38 min' },
];

// Assistant canned replies (used when no ANTHROPIC_API_KEY is configured).
export const ASSISTANT_REPLIES = {
  default: 'Based on the Atlas signals, the highest-leverage move is to <b>borrow one Platform reviewer for a week and quarantine the flaky auth test</b> — that single change drops the slip probability from 0.78 to ~0.41. Want me to draft the ask to the Platform lead?',
  reassign: 'By code proximity, <b>A. Rivera</b> and <b>T. Okafor</b> are your best reviewer adds for Atlas — both have recent context in the auth and checkout modules and the lightest current review load.',
  who: '<b>Jordan Park</b> is your key-person risk: sole CODEOWNER on billing-service and out Jul 6–17. <b>A. Rivera</b> is the strongest backup. Want a knowledge-transfer plan?',
};
