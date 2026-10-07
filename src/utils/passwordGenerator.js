const pools = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  number: '23456789',
  symbol: '!@#$%^&*_-+=?'
}

function secureIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max
  const values = new Uint32Array(1)
  let random
  do {
    crypto.getRandomValues(values)
    random = values[0]
  } while (random >= limit)
  return random % max
}

function pick(source) {
  return source[secureIndex(source.length)]
}

export function generatePassword(length, options) {
  const activePools = Object.entries(options).filter(([, enabled]) => enabled).map(([key]) => pools[key])
  if (!activePools.length) return ''
  const characters = activePools.map(pick)
  const combined = activePools.join('')
  while (characters.length < length) characters.push(pick(combined))
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureIndex(index + 1)
    ;[characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]]
  }
  return characters.join('')
}
