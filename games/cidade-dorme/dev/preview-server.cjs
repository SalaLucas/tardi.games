const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const replacements = [
  ['.cd-hand{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6vmin 5vmin;', '.cd-hand{height:100%;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;padding:6vmin 5vmin;'],
  ['.cd-hand h1{', '.cd-hand:before,.cd-hand:after{content:"";display:block;flex:1 0 0}.cd-hand>*{flex-shrink:0}.cd-hand h1{'],
  ['.cd-role-icon{font-size:20vmin;', '.cd-role-icon{font-size:12vmin;'],
  ['.cd-button{', '.cd-targets{width:100%;display:flex;flex-direction:column;align-items:center}.cd-button{'],
  ['.cd-hand{justify-content:flex-start;overflow-y:auto}.cd-role{', '.cd-role{'],
  ['.cd-role-icon{font-size:15vmin;', '.cd-role-icon{font-size:10vmin;']
]

http.createServer(function (request, response) {
  const url = request.url.split('?')[0]
  let file
  if (url === '/' || url === '/dev/index.html') file = path.join(root, 'dev', 'index.html')
  else if (url === '/dist/hand.js') file = path.join(root, 'hand.js')
  else if (url === '/dist/table.js') file = path.join(root, 'table.js')
  else file = path.join(root, url)

  if (!file.startsWith(root)) {
    response.writeHead(403)
    return response.end()
  }

  fs.readFile(file, function (error, data) {
    if (error) {
      response.writeHead(404)
      return response.end()
    }
    if (url.endsWith('.js')) response.setHeader('Content-Type', 'text/javascript')
    else if (url.endsWith('.html') || url === '/') response.setHeader('Content-Type', 'text/html')

    if (url === '/dist/hand.js') {
      data = replacements.reduce(function (source, pair) {
        return source.replace(pair[0], pair[1])
      }, data.toString())
    }
    response.end(data)
  })
}).listen(4173, '0.0.0.0', function () {
  console.log('Cidade Dorme preview: http://localhost:4173')
})
