const commonWords = ['password', 'passw0rd', 'admin', 'welcome', 'letmein', 'qwerty', 'iloveyou', 'monkey', 'dragon', 'login', 'secret']
const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', 'qaz', 'wsx', '1q2w', 'qwe']

function hasSequence(value) {
  const lower = value.toLowerCase()
  if (/(.)\1{2,}/.test(value)) return true
  for (let index = 0; index < lower.length - 2; index += 1) {
    const a = lower.charCodeAt(index)
    const b = lower.charCodeAt(index + 1)
    const c = lower.charCodeAt(index + 2)
    if (b - a === 1 && c - b === 1) return true
    if (b - a === -1 && c - b === -1) return true
  }
  return /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|xyz)/i.test(value)
}

function hasRepeatedCharacters(value) {
  return /(.)\1{1,}/.test(value)
}

function getPoolSize(flags) {
  return (flags.lower ? 26 : 0) + (flags.upper ? 26 : 0) + (flags.number ? 10 : 0) + (flags.symbol ? 33 : 0)
}

function statusFor(condition, warning = false) {
  if (condition) return 'passed'
  return warning ? 'warning' : 'failed'
}

export function analyzePassword(password) {
  const value = password || ''
  const length = value.length
  const flags = {
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  }
  const characterTypes = Object.values(flags).filter(Boolean).length
  const uniqueCharacters = new Set(value).size
  const diversity = length ? Math.round((uniqueCharacters / length) * 100) : 0
  const sequential = hasSequence(value)
  const repeated = hasRepeatedCharacters(value)
  const lower = value.toLowerCase()
  const commonWord = commonWords.find((word) => lower.includes(word)) || ''
  const keyboard = keyboardPatterns.find((pattern) => lower.includes(pattern)) || ''
  const obviousPattern = Boolean(commonWord || keyboard)

  let score = 0
  score += Math.min(length / 16, 1) * 35
  score += characterTypes * 11
  score += Math.min(diversity / 100, 1) * 15
  if (length >= 20) score += 5
  if (sequential) score -= 16
  if (repeated) score -= 12
  if (obviousPattern) score -= commonWord ? 28 : 20
  if (length < 8) score -= 12
  score = Math.max(0, Math.min(100, Math.round(score)))

  const label = score < 25 ? 'Very Weak' : score < 45 ? 'Weak' : score < 65 ? 'Fair' : score < 85 ? 'Strong' : 'Very Strong'
  const poolSize = getPoolSize(flags)
  const entropy = poolSize && length ? Math.round(length * Math.log2(poolSize)) : 0
  const checklist = [
    { id: 'length', label: 'At least 12 characters', detail: `${length}/12 characters`, status: statusFor(length >= 12, length >= 8) },
    { id: 'upper', label: 'Uppercase letters', detail: 'A–Z included', status: statusFor(flags.upper) },
    { id: 'lower', label: 'Lowercase letters', detail: 'a–z included', status: statusFor(flags.lower) },
    { id: 'number', label: 'Numbers', detail: '0–9 included', status: statusFor(flags.number) },
    { id: 'symbol', label: 'Special characters', detail: '! @ # % included', status: statusFor(flags.symbol) },
    { id: 'diversity', label: 'Good character diversity', detail: `${uniqueCharacters} unique characters`, status: statusFor(characterTypes >= 3 && diversity >= 55, characterTypes >= 2) },
    { id: 'sequence', label: 'No obvious sequences', detail: sequential ? 'Predictable run detected' : 'No simple runs found', status: sequential ? 'warning' : 'passed' },
    { id: 'repeat', label: 'No excessive repetition', detail: repeated ? 'Repeated characters detected' : 'No repeated runs found', status: repeated ? 'warning' : 'passed' },
  ]

  const weaknesses = []
  if (length < 12) weaknesses.push('Short length')
  if (commonWord) weaknesses.push('Common word')
  if (keyboard) weaknesses.push('Keyboard pattern')
  if (sequential) weaknesses.push('Sequential characters')
  if (repeated) weaknesses.push('Repeated characters')
  if (characterTypes < 3) weaknesses.push('Limited character mix')

  const recommendations = []
  if (length < 12) recommendations.push({ title: 'Give it more length', text: 'Increase your password length to at least 12 characters. A longer passphrase is usually easier to remember and harder to guess.' })
  if (!flags.upper) recommendations.push({ title: 'Mix the case', text: 'Add uppercase letters to increase character diversity and expand the search space.' })
  if (!flags.lower) recommendations.push({ title: 'Add lowercase letters', text: 'Include lowercase letters for a broader character set and a more balanced credential.' })
  if (!flags.number) recommendations.push({ title: 'Use non-predictable numbers', text: "Include numbers that aren't dates, repeats, or predictable sequences." })
  if (!flags.symbol) recommendations.push({ title: 'Add a symbol', text: 'Add symbols such as !, @, #, or % away from an obvious ending.' })
  if (sequential) recommendations.push({ title: 'Break predictable sequences', text: 'Avoid runs such as 123, abc, or qwerty. They are among the first patterns attackers try.' })
  if (repeated) recommendations.push({ title: 'Reduce repetition', text: 'Repeated characters reduce unpredictability. Replace runs like aaa or 111 with varied characters.' })
  if (obviousPattern) recommendations.push({ title: 'Remove familiar words', text: `The pattern “${commonWord || keyboard}” is easy to recognize. Use unrelated words or a password manager instead.` })
  if (!recommendations.length) recommendations.push({ title: 'Keep the good habits', text: 'Your password has good character diversity and length. Use a unique password for every account and store it in a password manager.' })

  return {
    password: value,
    length,
    flags,
    characterTypes,
    uniqueCharacters,
    diversity,
    sequential,
    repeated,
    obviousPattern,
    entropy,
    score,
    label,
    checklist,
    weaknesses,
    recommendations,
  }
}

export function getCrackTime(entropy) {
  if (!entropy) return { value: '—', subtext: 'Enter a password to estimate', tone: 'muted' }
  const seconds = (2 ** Math.min(entropy, 120)) / 2 / 1e10
  if (seconds < 60) return { value: 'Seconds', subtext: 'at a very fast offline rate', tone: 'danger' }
  if (seconds < 3600) return { value: 'Minutes', subtext: 'at a very fast offline rate', tone: 'danger' }
  if (seconds < 86400) return { value: 'Hours', subtext: 'at a very fast offline rate', tone: 'warning' }
  if (seconds < 86400 * 365) return { value: 'Days', subtext: 'at a very fast offline rate', tone: 'warning' }
  if (seconds < 86400 * 365 * 100) return { value: 'Years', subtext: 'at a very fast offline rate', tone: 'safe' }
  return { value: 'Centuries', subtext: 'at a very fast offline rate', tone: 'safe' }
}
