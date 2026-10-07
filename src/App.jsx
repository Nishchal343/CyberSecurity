import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronRight, Clipboard, Copy, Eye, EyeOff,
  Fingerprint, Gauge, KeyRound, Lightbulb, LockKeyhole, Menu, RefreshCw, ScanLine, ShieldCheck, ShieldEllipsis,
  Sparkles, Terminal, X, Zap,
} from 'lucide-react'
import { analyzePassword, getCrackTime } from './utils/passwordAnalyzer'
import { generatePassword } from './utils/passwordGenerator'

const navItems = [['analyzer', 'Analyzer'], ['generator', 'Generator'], ['tips', 'Security tips']]

function cn(...classes) { return classes.filter(Boolean).join(' ') }

function Logo() {
  return <a href="#analyzer" className="flex items-center gap-3" aria-label="SecurePass home">
    <span className="brand-mark"><ShieldCheck size={20} strokeWidth={2.4} /></span>
    <span><span className="block text-[15px] font-bold tracking-tight text-white">Secure<span className="text-mint">Pass</span></span><span className="hidden text-[9px] font-semibold uppercase tracking-[.18em] text-slate-500 sm:block">security analyzer</span></span>
  </a>
}

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="sticky top-0 z-30 border-b border-white/[.06] bg-ink/80 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map(([id, label], index) => <a key={id} href={`#${id}`} className={cn('nav-link', index === 0 && 'nav-link-active')}>{label}</a>)}
      </nav>
      <div className="hidden items-center gap-3 sm:flex"><span className="status-dot" /> <span className="text-xs font-medium text-slate-400">100% local analysis</span></div>
      <button className="icon-button md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <nav className="mobile-nav md:hidden">{navItems.map(([id, label]) => <a onClick={() => setOpen(false)} key={id} href={`#${id}`} className="mobile-nav-link">{label}<ChevronRight size={15} /></a>)}</nav>}
  </header>
}

function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
    <div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div>
    <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-white sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-[15px] leading-7 text-slate-400">{description}</p>}
  </div>
}

function PrivacyCard() {
  return <div className="privacy-card flex items-center gap-3"><div className="privacy-icon"><LockKeyhole size={18} /></div><div><p className="font-semibold text-white">Local-only analysis</p><p className="mt-1 text-xs text-slate-400">Nothing is uploaded or stored.</p></div><ShieldEllipsis className="ml-auto hidden shrink-0 text-mint/30 sm:block" size={22} /></div>
}

function PasswordInput({ value, setValue }) {
  const [visible, setVisible] = useState(false)
  return <div className="glass-card p-4 sm:p-5">
    <div className="mb-3 flex items-center justify-between"><label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-slate-200"><KeyRound size={16} className="text-mint" /> Password to analyze</label><span className="mono text-xs text-slate-500">{value.length} chars</span></div>
    <div className="password-field"><input id="password" type={visible ? 'text' : 'password'} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter password..." autoComplete="off" spellCheck="false" /><button onClick={() => setVisible(!visible)} className="field-action" aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button>{value && <button onClick={() => setValue('')} className="field-action" aria-label="Clear password" title="Clear password"><X size={18} /></button>}</div>
    <div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-500"><span className="live-dot" /> Live</div><span className="hidden text-xs text-slate-500 sm:block">Never saved</span></div>
  </div>
}

function ScoreRing({ score, label }) {
  const radius = 66
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score < 45 ? '#fb7185' : score < 65 ? '#fbbf24' : '#a8fbd4'
  return <div className="score-wrap"><svg viewBox="0 0 160 160" className="score-ring" role="img" aria-label={`Security score ${score} out of 100`}><circle cx="80" cy="80" r={radius} className="ring-track" /><circle cx="80" cy="80" r={radius} className="ring-progress" style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: offset }} /></svg><div className="score-center"><span className="score-number" style={{ color }}>{score}</span><span className="text-[10px] uppercase tracking-[.16em] text-slate-500">out of 100</span></div><span className="score-label" style={{ color }}>{label}</span></div>
}

function ScoreCard({ analysis }) {
  return <div className="glass-card score-card"><div className="mb-4 flex items-center justify-between"><div><p className="card-kicker">Security score</p><p className="mt-1 text-xs text-slate-500">Transparent, rule-based analysis</p></div><div className="small-icon"><Gauge size={18} /></div></div><ScoreRing score={analysis.score} label={analysis.label} /><div className="mt-5 grid grid-cols-3 divide-x divide-white/[.07] border-t border-white/[.07] pt-4 text-center"><div><p className="stat-value">{analysis.length}</p><p className="stat-label">length</p></div><div><p className="stat-value">{analysis.characterTypes}/4</p><p className="stat-label">char sets</p></div><div><p className="stat-value">{analysis.entropy || 0}</p><p className="stat-label">bits est.</p></div></div></div>
}

function CrackTime({ analysis }) {
  const crack = getCrackTime(analysis.entropy)
  return <div className="glass-card min-h-[188px] p-5"><div className="flex items-center justify-between"><div><p className="card-kicker">Estimated resistance</p><p className="mt-1 text-xs text-slate-500">Offline brute-force model</p></div><div className={cn('small-icon', crack.tone === 'safe' && 'icon-safe', crack.tone === 'danger' && 'icon-danger')}><Zap size={18} /></div></div><p className={cn('mt-8 text-3xl font-semibold tracking-[-.04em]', crack.tone === 'safe' ? 'text-mint' : crack.tone === 'warning' ? 'text-amber-300' : crack.tone === 'danger' ? 'text-rose-300' : 'text-white')}>{crack.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{crack.subtext}</p><p className="mt-4 border-t border-white/[.07] pt-3 text-[11px] leading-5 text-slate-500">Educational estimate only — real results depend on hardware, hashing, and rate limits.</p></div>
}

function CheckRow({ item }) {
  const passed = item.status === 'passed'
  const warning = item.status === 'warning'
  return <div className="check-row"><div className={cn('check-icon', passed ? 'check-pass' : warning ? 'check-warn' : 'check-fail')}>{passed ? <Check size={14} strokeWidth={3} /> : warning ? <AlertTriangle size={14} /> : <X size={14} strokeWidth={3} />}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{item.label}</p><p className="mt-0.5 text-xs text-slate-500">{item.detail}</p></div><span className={cn('check-status', passed ? 'text-mint' : warning ? 'text-amber-300' : 'text-rose-300')}>{passed ? 'Passed' : warning ? 'Review' : 'Missing'}</span></div>
}

function Checklist({ analysis }) {
  return <div className="glass-card checklist-card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="card-kicker">Security checklist</p><p className="mt-1 text-xs text-slate-500">8 signals</p></div><Clipboard size={18} className="text-slate-500" /></div><div>{analysis.checklist.map((item) => <CheckRow item={item} key={item.id} />)}</div></div>
}

function Recommendations({ analysis }) {
  return <div className="glass-card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="card-kicker">Smart recommendations</p><p className="mt-1 text-xs text-slate-500">Prioritized from your results</p></div><Sparkles size={18} className="text-amber-300" /></div><div className="space-y-3">{analysis.recommendations.slice(0, 4).map((item, index) => <div className="recommendation" key={item.title}><span className="recommendation-index">0{index + 1}</span><div><p className="text-sm font-semibold text-slate-200">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.text}</p></div></div>)}</div></div>
}

function Weaknesses({ analysis }) {
  return <div className="glass-card p-5"><div className="mb-3 flex items-center justify-between"><p className="card-kicker">Potential weaknesses</p><Fingerprint size={18} className="text-slate-500" /></div>{analysis.weaknesses.length ? <div className="flex flex-wrap gap-2">{analysis.weaknesses.map((weakness) => <span className="weakness-chip" key={weakness}><span className="h-1.5 w-1.5 rounded-full bg-amber-300" />{weakness}</span>)}</div> : <div className="flex items-center gap-2 text-sm text-mint"><CheckCircle2 size={16} /> No obvious weaknesses detected</div>}</div>
}

function AnalysisDashboard({ analysis }) {
  return <section aria-label="Password analysis results" className="analysis-dashboard mt-8"><div className="mb-5 flex items-end justify-between"><div><div className="eyebrow"><span className="eyebrow-line" />live analysis</div><h2 className="mt-2 text-xl font-semibold text-white">Your security snapshot</h2></div><span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="live-dot" /> updates in real time</span></div><div className="grid gap-4 lg:grid-cols-[.95fr_1.25fr_1fr]"><ScoreCard analysis={analysis} /><CrackTime analysis={analysis} /><Checklist analysis={analysis} /></div><div className="mt-4 grid gap-4 lg:grid-cols-[.95fr_2.25fr]"><Weaknesses analysis={analysis} /><Recommendations analysis={analysis} /></div></section>
}

function Generator() {
  const [length, setLength] = useState(18)
  const [options, setOptions] = useState({ upper: true, lower: true, number: true, symbol: true })
  const [generated, setGenerated] = useState(() => generatePassword(18, { upper: true, lower: true, number: true, symbol: true }))
  const [copied, setCopied] = useState(false)
  const enabledCount = Object.values(options).filter(Boolean).length
  const generatedAnalysis = useMemo(() => analyzePassword(generated), [generated])
  const create = () => { if (enabledCount) { setGenerated(generatePassword(length, options)); setCopied(false) } }
  const copy = async () => { if (!generated) return; try { await navigator.clipboard.writeText(generated); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) } }
  const toggle = (key) => setOptions((current) => ({ ...current, [key]: !current[key] }))
  return <section id="generator" className="section-shell"><SectionHeading eyebrow="password generator" title="Create a stronger credential." description="Use browser-safe randomness to generate a password that matches your preferred character mix. The result exists only in this page's memory." /><div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="glass-card generator-main p-5 sm:p-7"><div className="generated-field"><span className="mono min-w-0 flex-1 truncate text-sm text-mint sm:text-base">{generated || 'Select at least one character set'}</span><button onClick={copy} disabled={!generated} className="copy-button">{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}</button></div><div className="mt-8"><div className="mb-3 flex items-center justify-between"><label htmlFor="length" className="text-sm font-semibold text-slate-200">Password length</label><span className="mono rounded-md bg-mint/10 px-2 py-1 text-sm text-mint">{length}</span></div><input id="length" type="range" min="8" max="32" value={length} onChange={(event) => setLength(Number(event.target.value))} style={{ '--range': `${((length - 8) / 24) * 100}%` }} className="range-input" /><div className="mt-2 flex justify-between text-[11px] text-slate-600"><span>8</span><span>32</span></div></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['upper', 'Uppercase', 'A–Z'], ['lower', 'Lowercase', 'a–z'], ['number', 'Numbers', '0–9'], ['symbol', 'Symbols', '! @ #']].map(([key, label, hint]) => <button key={key} onClick={() => toggle(key)} className={cn('toggle-card', options[key] && 'toggle-card-active')}><span className={cn('toggle-switch', options[key] && 'toggle-switch-on')}><span /></span><span className="text-left"><span className="block text-xs font-semibold text-slate-200">{label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{hint}</span></span></button>)}</div><div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={create} disabled={!enabledCount} className="primary-button"><RefreshCw size={16} /> Generate password</button><span className="text-xs text-slate-500">Generated with <span className="text-slate-300">crypto.getRandomValues()</span></span></div></div><div className="glass-card generator-side p-6"><div className="flex items-center gap-3"><div className="small-icon icon-safe"><ShieldCheck size={18} /></div><div><p className="card-kicker">Generated strength</p><p className="mt-1 text-xs text-slate-500">Based on the same local rules</p></div></div><div className="mt-8"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-400">Strength</span><span className="font-semibold text-mint">{generatedAnalysis.label}</span></div><div className="meter"><span style={{ width: `${generatedAnalysis.score}%` }} /></div><div className="mt-3 flex justify-between text-[11px] text-slate-500"><span>{generatedAnalysis.score}/100</span><span>{generatedAnalysis.entropy} bits estimated</span></div></div><div className="mt-8 border-t border-white/[.07] pt-5"><p className="text-xs leading-5 text-slate-500">Tip: a password manager can create and remember a unique credential for every account.</p></div></div></div></section>
}

function SecurityTips() {
  const tips = [['01', 'Use long passphrases', 'Aim for 12–16+ characters. Length is one of the most powerful ways to increase the search space.'], ['02', 'Never reuse passwords', 'A unique password limits the damage if another service experiences a breach.'], ['03', 'Use a password manager', 'Let a trusted manager generate and store long, unique credentials for you.'], ['04', 'Enable MFA', 'Multi-factor authentication adds a second layer even if a password is exposed.'], ['05', 'Avoid personal information', 'Names, birthdays, teams, and places are easy to discover and guess.'], ['06', 'Act on compromise quickly', 'Change credentials immediately if a service reports a breach or suspicious activity.']]
  return <section id="tips" className="section-shell pt-16"><SectionHeading eyebrow="security fundamentals" title="Small habits. Big protection." description="SecurePass is a learning tool, but these habits belong in your everyday security routine." /><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tips.map(([number, title, text]) => <article className="tip-card" key={number}><span className="mono text-xs text-mint/60">{number}</span><Lightbulb size={17} className="ml-auto text-amber-300/70" /><h3 className="mt-8 text-sm font-semibold text-slate-100">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></article>)}</div></section>
}

function ProductPreview({ analysis, hasPassword }) {
  const passed = hasPassword ? analysis.checklist.filter((item) => item.status === 'passed').length : 0
  const score = hasPassword ? analysis.score : 0
  const ringStyle = { background: `conic-gradient(#a8fbd4 ${score * 3.6}deg, rgba(168,251,212,.08) ${score * 3.6}deg)` }
  return <div className="product-preview motion-in-delay"><div className="preview-topbar"><div className="flex items-center gap-2"><span className="preview-pulse" /><span className="mono text-[10px] uppercase tracking-[.18em] text-slate-400">SecurePass / live scan</span></div><ScanLine size={16} className="text-mint/60" /></div><div className="preview-body"><div className="preview-heading"><div><p className="text-xs font-semibold text-white">Security intelligence</p><p className="mt-1 text-[11px] text-slate-500">{hasPassword ? 'Your password has been evaluated.' : 'Ready for a private evaluation.'}</p></div><span className={cn('preview-badge', hasPassword ? 'preview-badge-live' : '')}>{hasPassword ? 'LIVE' : 'READY'}</span></div><div className="preview-score-row"><div className="preview-score-ring" style={ringStyle}><div className="preview-score-ring-inner"><span className="text-2xl font-semibold tracking-[-.06em] text-white">{score}</span><span className="text-[9px] uppercase tracking-[.14em] text-slate-500">score</span></div></div><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">Current assessment</p><p className={cn('mt-1 text-2xl font-semibold tracking-[-.05em]', hasPassword ? 'text-mint' : 'text-slate-200')}>{hasPassword ? analysis.label : 'Awaiting input'}</p><div className="preview-meter mt-4"><span style={{ width: `${score}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>{hasPassword ? `${passed}/8 checks passed` : '0/8 checks passed'}</span><span>{hasPassword ? `${analysis.entropy} bits` : '— bits'}</span></div></div></div><div className="preview-grid"><div><span className="preview-stat-icon"><Gauge size={13} /></span><p className="mt-2 text-[10px] uppercase tracking-[.12em] text-slate-500">Entropy</p><p className="mt-1 text-sm font-semibold text-slate-200">{hasPassword ? `${analysis.entropy} bits` : 'Not measured'}</p></div><div><span className="preview-stat-icon"><ShieldCheck size={13} /></span><p className="mt-2 text-[10px] uppercase tracking-[.12em] text-slate-500">Privacy</p><p className="mt-1 text-sm font-semibold text-mint">Browser only</p></div><div><span className="preview-stat-icon"><Zap size={13} /></span><p className="mt-2 text-[10px] uppercase tracking-[.12em] text-slate-500">Feedback</p><p className="mt-1 text-sm font-semibold text-slate-200">Instant</p></div></div></div><div className="preview-footer"><span className="flex items-center gap-2"><LockKeyhole size={13} className="text-mint" /> Zero data leaves this device</span><ChevronRight size={14} className="text-slate-600" /></div></div>
}

function App() {
  const [password, setPassword] = useState('')
  const analysis = useMemo(() => analyzePassword(password), [password])
  return <div className="min-h-screen overflow-hidden bg-ink text-slate-200"><Header /><main><section id="analyzer" className="hero-shell"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 lg:px-8 lg:pb-14 lg:pt-24"><div className="hero-grid"><div className="hero-copy motion-in"><div className="eyebrow"><span className="eyebrow-line" />privacy-first password intelligence</div><h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-.065em] text-white sm:text-6xl lg:text-7xl">How secure is your <span className="hero-gradient">password?</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Analyze password strength, identify weaknesses, and learn how to create stronger credentials — entirely in your browser.</p><div className="hero-trust-row"><span><CheckCircle2 size={14} /> No account required</span><span><LockKeyhole size={14} /> Private by design</span><span><Zap size={14} /> Instant feedback</span></div><div className="mt-8"><PasswordInput value={password} setValue={setPassword} /><PrivacyCard /></div></div><ProductPreview analysis={analysis} hasPassword={Boolean(password)} /></div>{password && <AnalysisDashboard analysis={analysis} />}</div></section><Generator /><SecurityTips /></main><footer className="mx-auto mt-20 flex max-w-7xl flex-col gap-3 border-t border-white/[.06] px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p><span className="font-semibold text-slate-300">SecurePass</span> — Educational Cybersecurity Project</p><p className="flex items-center gap-2"><LockKeyhole size={13} className="text-mint" /> Passwords are analyzed locally and are never stored.</p></footer></div>
}

function AppV2() {
  const [password, setPassword] = useState('')
  const analysis = useMemo(() => analyzePassword(password), [password])

  return <div className="min-h-screen overflow-hidden bg-ink text-slate-200">
    <Header />
    <main>
      <section id="analyzer" className="hero-shell">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 lg:px-8 lg:pb-14 lg:pt-24">
          <div className="hero-grid">
            <div className="hero-copy motion-in">
              <div className="eyebrow"><span className="eyebrow-line" />local password check</div>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-.065em] text-white sm:text-6xl lg:text-7xl">How secure is your <span className="hero-gradient">password?</span></h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">Instant, private analysis for stronger logins.</p>
              <div className="hero-trust-row"><span><CheckCircle2 size={14} /> Local only</span><span><LockKeyhole size={14} /> Never saved</span><span><Zap size={14} /> Instant</span></div>
              <div className="mt-8"><PasswordInput value={password} setValue={setPassword} /><PrivacyCard /></div>
            </div>
            <ProductPreview analysis={analysis} hasPassword={Boolean(password)} />
          </div>
          {password && <AnalysisDashboard analysis={analysis} />}
        </div>
      </section>
      <Generator />
      <SecurityTips />
    </main>
    <footer className="mx-auto mt-20 flex max-w-7xl flex-col gap-3 border-t border-white/[.06] px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p><span className="font-semibold text-slate-300">SecurePass</span> — Educational Cybersecurity Project</p><p className="flex items-center gap-2"><LockKeyhole size={13} className="text-mint" /> Passwords are analyzed locally.</p></footer>
  </div>
}

export default AppV2
