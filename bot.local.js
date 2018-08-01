const http = require('http')
const bot = require('./bot')

const server = http.createServer(bot)

server.listen(process.env.PORT || 3000, null, () => {
  console.log(
    `OctoBot listening at http://localhost:${process.env.PORT || 3000}`
  )
})
