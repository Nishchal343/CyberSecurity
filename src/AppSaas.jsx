import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowUpRight, Check, CheckCircle2, ChevronRight, CircleX, Clipboard,
  Copy, Crosshair, Eye, EyeOff, Fingerprint, Gauge, KeyRound, Layers3, Lightbulb, LockKeyhole,
  Menu, RefreshCw, ScanLine, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, X, Zap,
} from 'lucide-react'
import { analyzePassword, getCrackTime } from './utils/passwordAnalyzer'
import { generatePassword } from './utils/passwordGenerator'

const navItems = [['analyzer', 'Analyzer'], ['generator', 'Generator'], ['tips', 'Security tips']]

function cn(...classes) { return classes.filter(Boolean).join(' ') }

function Brand() {
  return <a href="#analyzer" className="saas-brand" aria-label="SecurePass home"><span className="brand-symbol"><ShieldCheck size={19} /></span><span><strong>Secure<span>Pass</span></strong><small>security workspace</small></span></a>
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="saas-header"><div className="saas-header-inner"><Brand /><nav className="saas-nav">{navItems.map(([id, label], index) => <a key={id} className={cn('saas-nav-link', index === 0 && 'active')} href={`#${id}`}>{label}</a>)}</nav><div className="header-meta"><span className="online-pulse" /> <span>Local mode</span><span className="header-divider" /><span className="header-version">v1.0</span></div><button className="menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>{menuOpen && <nav className="mobile-saas-nav">{navItems.map(([id, label]) => <a onClick={() => setMenuOpen(false)} href={`#${id}`} key={id}>{label}<ChevronRight size={16} /></a>)}</nav>}</header>
}

function Eyebrow({ children, icon: Icon = Activity }) {
  return <div className="saas-eyebrow"><Icon size={13} /> {children}</div>
}

function PrivacyNote() {
  return <div className="privacy-note"><LockKeyhole size={15} /><span><strong>Private by default</strong><small>Your password never leaves this browser.</small></span><CheckCircle2 size={16} className="privacy-check" /></div>
}

function PasswordField({ value, setValue }) {
  const [visible, setVisible] = useState(false)
  return <div className="analyzer-input-wrap"><div className="field-label"><label htmlFor="password"><KeyRound size={14} /> Password</label><span className="character-count">{value.length} characters</span></div><div className={cn('saas-password-field', value && 'has-value')}><input id="password" type={visible ? 'text' : 'password'} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter a password to scan" autoComplete="off" spellCheck="false" /><button className="field-control" onClick={() => setVisible(!visible)} title={visible ? 'Hide password' : 'Show password'} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>{value && <button className="field-control" onClick={() => setValue('')} title="Clear password" aria-label="Clear password"><X size={17} /></button>}</div><div className="field-meta"><span><span className="live-indicator" /> Scans as you type</span><span>Nothing is saved</span></div></div>
}

function ScoreGauge({ score, label }) {
  const radius = 72
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  const color = score < 45 ? '#fb7185' : score < 65 ? '#fbbf24' : '#79e6c3'
  return <div className="gauge-wrap"><svg viewBox="0 0 180 180" className="gauge-svg" aria-label={`Security score ${score} out of 100`} role="img"><circle className="gauge-track" cx="90" cy="90" r={radius} /><circle className="gauge-value" cx="90" cy="90" r={radius} style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: offset }} /></svg><div className="gauge-center"><strong style={{ color }}>{score}</strong><span>/ 100</span></div><div className="gauge-label" style={{ color }}>{label}</div></div>
}

function ScanPanel({ analysis, hasPassword }) {
  const passed = hasPassword ? analysis.checklist.filter((item) => item.status === 'passed').length : 0
  return <aside className="scan-panel"><div className="scan-panel-top"><span className="scan-title"><span className="scan-dot" /> LIVE SCAN</span><ScanLine size={17} /></div><div className="scan-panel-content"><div className="scan-panel-heading"><div><p>{hasPassword ? 'Current score' : 'Ready to scan'}</p><small>{hasPassword ? 'Based on local analysis' : 'Enter a password to begin'}</small></div><span className={cn('scan-status', hasPassword && 'active')}>{hasPassword ? 'ACTIVE' : 'IDLE'}</span></div><ScoreGauge score={hasPassword ? analysis.score : 0} label={hasPassword ? analysis.label : 'Waiting'} /><div className="scan-stats"><div><span>Signals</span><strong>{hasPassword ? `${passed}/8` : '—'}</strong></div><div><span>Entropy</span><strong>{hasPassword ? `${analysis.entropy}b` : '—'}</strong></div><div><span>Mode</span><strong>Local</strong></div></div></div><div className="scan-panel-foot"><ShieldCheck size={14} /> No network request made</div></aside>
}

function AnalyzerIntro() {
  return <div className="empty-analysis"><div className="empty-icon"><Crosshair size={20} /></div><div><strong>Analysis appears here</strong><p>Strength, patterns, entropy, and next steps update instantly.</p></div><ArrowUpRight size={17} className="empty-arrow" /></div>
}

function Analyzer({ password, setPassword, analysis }) {
  return <section id="analyzer" className="workspace-section analyzer-section"><div className="workspace-heading"><div><Eyebrow icon={ShieldCheck}>Password intelligence</Eyebrow><h1>How secure is your <em>password?</em></h1><p>Find weak patterns before attackers do.</p></div><div className="heading-mark"><span>LOCAL</span><ShieldCheck size={18} /></div></div><div className="analyzer-layout"><div className="analyzer-surface"><div className="surface-top"><div><span className="surface-kicker">Analyzer</span><h2>Test a password</h2></div><span className="surface-command"><span className="mono-key">⌘</span> Real-time</span></div><PasswordField value={password} setValue={setPassword} /><PrivacyNote />{password ? <div className="analysis-ready"><div className="ready-icon"><Sparkles size={16} /></div><div><strong>Scan complete</strong><span>Results are calculated in your browser only.</span></div><span className="ready-score">{analysis.score}<small>/100</small></span></div> : <AnalyzerIntro />}</div><ScanPanel analysis={analysis} hasPassword={Boolean(password)} /></div>{password && <AnalysisResults analysis={analysis} />}</section>
}

function StatusIcon({ status }) {
  if (status === 'passed') return <span className="status-icon passed"><Check size={14} strokeWidth={3} /></span>
  if (status === 'warning') return <span className="status-icon warning"><AlertTriangle size={13} /></span>
  return <span className="status-icon failed"><CircleX size={14} /></span>
}

function Checklist({ analysis }) {
  return <div className="result-surface checklist-surface"><div className="result-heading"><div><Eyebrow icon={Clipboard}>Signals</Eyebrow><h3>Security checklist</h3></div><span className="result-count">{analysis.checklist.filter((item) => item.status === 'passed').length}<small>/ 8 passed</small></span></div><div className="checklist-list">{analysis.checklist.map((item) => <div className="signal-row" key={item.id}><StatusIcon status={item.status} /><div className="signal-copy"><strong>{item.label}</strong><span>{item.detail}</span></div><span className={cn('signal-state', item.status)}>{item.status === 'passed' ? 'Pass' : item.status === 'warning' ? 'Review' : 'Missing'}</span></div>)}</div></div>
}

function Recommendations({ analysis }) {
  return <div className="result-surface recommendations-surface"><div className="result-heading"><div><Eyebrow icon={Sparkles}>Next steps</Eyebrow><h3>Make it stronger</h3></div><ArrowUpRight size={18} className="result-action" /></div><div className="recommendation-list">{analysis.recommendations.slice(0, 3).map((recommendation, index) => <div className="next-step" key={recommendation.title}><span className="step-number">0{index + 1}</span><div><strong>{recommendation.title}</strong><p>{recommendation.text}</p></div><ChevronRight size={15} /></div>)}</div></div>
}

function AnalysisResults({ analysis }) {
  const crack = getCrackTime(analysis.entropy)
  return <div className="results-area"><div className="metric-strip"><div className="metric-item"><span>Strength</span><strong className={cn(analysis.score >= 65 ? 'good' : analysis.score >= 45 ? 'mid' : 'bad')}>{analysis.label}</strong></div><div className="metric-item"><span>Estimated entropy</span><strong>{analysis.entropy} <small>bits</small></strong></div><div className="metric-item"><span>Crack resistance</span><strong className={crack.tone === 'safe' ? 'good' : crack.tone === 'warning' ? 'mid' : 'bad'}>{crack.value}</strong></div><div className="metric-item"><span>Unique characters</span><strong>{analysis.uniqueCharacters}</strong></div></div><div className="result-grid"><Checklist analysis={analysis} /><Recommendations analysis={analysis} /></div><div className="weakness-line"><div><Eyebrow icon={Fingerprint}>Pattern review</Eyebrow><strong>Potential weaknesses</strong></div><div className="weaknesses">{analysis.weaknesses.length ? analysis.weaknesses.map((weakness) => <span key={weakness}>{weakness}</span>) : <span className="all-clear"><Check size={13} /> No obvious patterns found</span>}</div></div></div>
}

function Toggle({ active, label, hint, onClick }) {
  return <button className={cn('option-toggle', active && 'selected')} onClick={onClick}><span className="toggle-indicator"><span /></span><span><strong>{label}</strong><small>{hint}</small></span></button>
}

function Generator() {
  const [length, setLength] = useState(18)
  const [options, setOptions] = useState({ upper: true, lower: true, number: true, symbol: true })
  const [generated, setGenerated] = useState(() => generatePassword(18, { upper: true, lower: true, number: true, symbol: true }))
  const [copied, setCopied] = useState(false)
  const generatedAnalysis = useMemo(() => analyzePassword(generated), [generated])
  const enabledCount = Object.values(options).filter(Boolean).length
  const create = () => { if (enabledCount) { setGenerated(generatePassword(length, options)); setCopied(false) } }
  const copy = async () => { if (!generated) return; try { await navigator.clipboard.writeText(generated); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) } }
  const toggle = (key) => setOptions((current) => ({ ...current, [key]: !current[key] }))
  return <section id="generator" className="workspace-section generator-section"><div className="section-heading-row"><div><Eyebrow icon={KeyRound}>Credential generator</Eyebrow><h2>Generate a safer password.</h2><p>Cryptographically random. Built for one account at a time.</p></div><SlidersHorizontal size={20} className="heading-icon" /></div><div className="generator-layout"><div className="generator-controls"><div className="control-header"><span>Character mix</span><small>{enabledCount} of 4 enabled</small></div><div className="option-grid"><Toggle active={options.upper} label="Uppercase" hint="A–Z" onClick={() => toggle('upper')} /><Toggle active={options.lower} label="Lowercase" hint="a–z" onClick={() => toggle('lower')} /><Toggle active={options.number} label="Numbers" hint="0–9" onClick={() => toggle('number')} /><Toggle active={options.symbol} label="Symbols" hint="! @ #" onClick={() => toggle('symbol')} /></div><div className="length-control"><div><span>Password length</span><strong>{length}</strong></div><input aria-label="Password length" type="range" min="8" max="32" value={length} onChange={(event) => setLength(Number(event.target.value))} style={{ '--range': `${((length - 8) / 24) * 100}%` }} /><div className="range-labels"><span>8</span><span>32</span></div></div><button className="generate-button" onClick={create} disabled={!enabledCount}><RefreshCw size={16} /> Generate new password</button></div><div className="generated-preview"><div className="generated-header"><span><span className="online-pulse" /> Generated locally</span><span className="generated-strength">{generatedAnalysis.label}</span></div><div className="generated-password"><code>{generated || 'Select a character set'}</code><button onClick={copy} disabled={!generated} title="Copy password" aria-label="Copy password">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div><div className="generated-meter"><span style={{ width: `${generatedAnalysis.score}%` }} /></div><div className="generated-footer"><span>{generatedAnalysis.score}/100 strength</span><span>{generatedAnalysis.entropy} bits estimated</span></div><div className="generated-note"><ShieldCheck size={15} /> Nothing generated here is stored.</div></div></div></section>
}

function SecurityTips() {
  const tips = [['01', 'Go long', '12+ characters beats clever substitutions.'], ['02', 'Stay unique', 'One password per account limits fallout.'], ['03', 'Use a manager', 'Generate and store credentials safely.'], ['04', 'Turn on MFA', 'A second factor protects the login.'], ['05', 'Skip personal data', 'Names and dates are easy to guess.'], ['06', 'Act on breaches', 'Change compromised credentials fast.']]
  return <section id="tips" className="workspace-section tips-section"><div className="section-heading-row"><div><Eyebrow icon={Lightbulb}>Security habits</Eyebrow><h2>Simple habits, better security.</h2></div></div><div className="tips-list">{tips.map(([number, title, text]) => <div className="tip-row" key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p><ArrowUpRight size={15} /></div>)}</div></section>
}

function AppSaas() {
  const [password, setPassword] = useState('')
  const analysis = useMemo(() => analyzePassword(password), [password])
  return <div className="saas-app"><Header /><main className="saas-main"><Analyzer password={password} setPassword={setPassword} analysis={analysis} /><Generator /><SecurityTips /></main><footer className="saas-footer"><Brand /><span>Educational cybersecurity project</span><span className="footer-lock"><LockKeyhole size={13} /> Analyzed locally. Never stored.</span></footer></div>
}

export default AppSaas
