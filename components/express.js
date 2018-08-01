const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const hbs = require('express-hbs')
const path = require('path')

module.exports = controller => {
  const app = express()
  app.use((req, res, next) => {
    req.rawBody = ''

    req.on('data', chunk => {
      req.rawBody += chunk
    })

    next()
  })
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // set up handlebars ready for tabs
  app.engine(
    'hbs',
    hbs.express4({
      partialsDir: path.join(__dirname, '/../views/partials')
    })
  )
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, '/../views/'))

  app.use(express.static('public'))

  // import all the pre-defined routes that are present in /components/routes
  const normalizedPathRoutes = require('path').join(__dirname, 'routes')
  require('fs')
    .readdirSync(normalizedPathRoutes)
    .forEach(file => {
      require('./routes/' + file)(app, controller)
    })

  controller.webserver = app

  return app
}
