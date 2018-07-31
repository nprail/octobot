const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const http = require('http')
const hbs = require('express-hbs')
const path = require('path')

module.exports = controller => {
  const webserver = express()
  webserver.use((req, res, next) => {
    req.rawBody = ''

    req.on('data', chunk => {
      req.rawBody += chunk
    })

    next()
  })
  webserver.use(cookieParser())
  webserver.use(bodyParser.json())
  webserver.use(bodyParser.urlencoded({ extended: true }))

  // set up handlebars ready for tabs
  webserver.engine(
    'hbs',
    hbs.express4({
      partialsDir: path.join(__dirname, '/../views/partials')
    })
  )
  webserver.set('view engine', 'hbs')
  webserver.set('views', path.join(__dirname, '/../views/'))

  webserver.use(express.static('public'))

  const server = http.createServer(webserver)

  server.listen(process.env.PORT || 3000, null, () => {
    console.log(
      'Express webserver configured and listening at http://localhost:' +
        process.env.PORT || 3000
    )
  })

  // import all the pre-defined routes that are present in /components/routes
  const normalizedPathRoutes = require('path').join(__dirname, 'routes')
  require('fs')
    .readdirSync(normalizedPathRoutes)
    .forEach(file => {
      require('./routes/' + file)(webserver, controller)
    })

  controller.webserver = webserver
  controller.httpserver = server

  return webserver
}
