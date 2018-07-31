const path = require('path')
require('dotenv').config()

const usageTip = () => {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log(
    'clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js'
  )
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~')
}
if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usageTip()
  process.exit(1)
}

const Botkit = require('botkit')

const botOpts = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  // debug: true,
  scopes: ['bot']
}

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGODB_URI) {
  const mongoStorage = require('botkit-storage-mongo')({
    mongoUri: process.env.MONGODB_URI
  })
  botOpts.storage = mongoStorage
} else {
  botOpts.json_file_store = path.join(__dirname, '/.data/db/') // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
const controller = Botkit.slackbot(botOpts)

controller.startTicking()

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require(path.join(
  __dirname,
  '/components/express_webserver.js'
))(controller)

webserver.get('/', (req, res) => {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    layout: 'layouts/default'
  })
})
// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(path.join(__dirname, '/components/user_registration.js'))(controller)

// Send an onboarding message when a new team joins
require(path.join(__dirname, '/components/onboarding.js'))(controller)

const normalizedPath = require('path').join(__dirname, 'skills')
require('fs')
  .readdirSync(normalizedPath)
  .forEach(file => {
    require('./skills/' + file)(controller)
  })
