/* Builds the browser dictionary from the vendored Unitex-PT-BR source. */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const source = path.join(root, 'vendor', 'unitex-pt-br', 'data', 'mirror', 'DELAS.csv')
const destination = path.join(root, 'src', 'data', 'words.js')
const rows = fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)
const words = new Set()

for (let i = 1; i < rows.length; i += 1) {
  const word = rows[i].split(',')[0].trim().toLocaleLowerCase('pt-BR')
  // The game only accepts single, alphabetic words. Apostrophes, spaces and
  // dictionary meta forms do not make pleasant answers on a phone keyboard.
  if (/^[a-zà-öø-ÿ]+$/i.test(word) && word.length >= 3 && word.length <= 18) words.add(normalize(word))
}

const output = [
  '// Generated from datasets-br/unitex-pt-br (DELAS), LGPLLR.',
  '// Run npm run prepare-words after updating vendor/unitex-pt-br.',
  'export var WORDS = ' + JSON.stringify(Array.from(words).sort()) + '\n'
].join('\n')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, output, 'utf8')

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c')
}
