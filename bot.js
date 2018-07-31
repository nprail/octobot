var env = require('node-env-file')
env(__dirname + '/.env')

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usage_tip()
  // process.exit(1);
}

var Botkit = require('botkit')
var debug = require('debug')('botkit:main')

var bot_options = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  // debug: true,
  scopes: ['bot']
}

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGODB_URI) {
  var mongoStorage = require('botkit-storage-mongo')({
    mongoUri: process.env.MONGODB_URI
  })
  bot_options.storage = mongoStorage
} else {
  bot_options.json_file_store = __dirname + '/.data/db/' // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options)

controller.startTicking()

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(
  controller
)

webserver.get('/', function (req, res) {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    layout: 'layouts/default'
  })
})
// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller)

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller)

// enable advanced botkit studio metrics
require('botkit-studio-metrics')(controller)

var normalizedPath = require('path').join(__dirname, 'skills')
require('fs')
  .readdirSync(normalizedPath)
  .forEach(function (file) {
    require('./skills/' + file)(controller)
  })

function usage_tip () {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log(
    'clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js'
  )
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~')
}
