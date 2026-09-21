import { WORDS } from '../data/words.js'

var dictionary = null
var MAX_EASY_WORD_LENGTH = 7
var MIN_EASY_WORDS_PER_PAIR = 100

export function normalizeWord(value) {
  return String(value || '').toLocaleLowerCase('pt-BR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c').replace(/[^a-z]/g, '')
}

export function isValidWord(word) { return word.length >= 3 && wordSet().has(word) }

export function nextPair() {
  var pairs = pairCounts(), viable = [], i
  for (i = 0; i < pairs.length; i++) if (pairs[i].count >= MIN_EASY_WORDS_PER_PAIR) viable.push(pairs[i])
  return viable[Math.floor(Math.random() * viable.length)].pair
}

function wordSet() {
  if (!dictionary) dictionary = new Set(WORDS)
  return dictionary
}

function pairCounts() {
  if (pairCounts.cache) return pairCounts.cache
  var counts = {}, i, j, word, pair, entries = [], seen
  for (i = 0; i < WORDS.length; i++) {
    word = WORDS[i]
    // A pair is only fun if players have plenty of familiar-looking, short
    // answers. Counting the full specialist dictionary made rare sequences
    // such as "ee" look common because of long demonyms and technical terms.
    if (word.length > MAX_EASY_WORD_LENGTH) continue
    seen = {}
    for (j = 0; j < word.length - 1; j++) {
      pair = word.slice(j, j + 2)
      if (!seen[pair]) {
        counts[pair] = (counts[pair] || 0) + 1
        seen[pair] = true
      }
    }
  }
  for (pair in counts) entries.push({ pair: pair, count: counts[pair] })
  pairCounts.cache = entries
  return entries
}
