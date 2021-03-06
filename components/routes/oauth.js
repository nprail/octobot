const debug = require('debug')('botkit:oauth')

module.exports = (app, controller) => {
  const handler = {
    login: (req, res) => {
      res.redirect(controller.getAuthorizeURL())
    },
    oauth: (req, res) => {
      const code = req.query.code
      const state = req.query.state
      debug(state)

      // we need to use the Slack API, so spawn a generic bot with no token
      const slackapi = controller.spawn({})

      const opts = {
        client_id: controller.config.clientId,
        client_secret: controller.config.clientSecret,
        code
      }

      slackapi.api.oauth.access(opts, (err, auth) => {
        if (err) {
          debug('Error confirming oauth', err)
          return res.redirect('/error')
        }

        // what scopes did we get approved for?
        const scopes = auth.scope.split(/,/)
        debug(scopes)
        // use the token we got from the oauth
        // to call auth.test to make sure the token is valid
        // but also so that we reliably have the team_id field!
        slackapi.api.auth.test(
          { token: auth.access_token },
          (err, identity) => {
            if (err) {
              debug('Error fetching user identity', err)
              return res.redirect('/error')
            }

            // Now we've got all we need to connect to this user's team
            // spin up a bot instance, and start being useful!
            // We just need to make sure this information is stored somewhere
            // and handled with care!

            // In order to do this in the most flexible way, we fire
            // a botkit event here with the payload so it can be handled
            // by the developer without meddling with the actual oauth route.

            auth.identity = identity
            controller.trigger('oauth:success', [auth])

            const url = `slack://user?team=${auth.team_id}&id=${
              auth.bot.bot_user_id
            }`
            res.render('success', {
              url,
              layout: 'layouts/default'
            })
          }
        )
      })
    }
  }

  // Create a /login link
  // This link will send user's off to Slack to authorize the app
  // See: https://github.com/howdyai/botkit/blob/master/readme-slack.md#custom-auth-flows
  debug('Configured /login url')
  app.get('/login', handler.login)

  // Create a /oauth link
  // This is the link that receives the postback from Slack's oauth system
  // So in Slack's config, under oauth redirect urls,
  // your value should be https://<my custom domain or IP>/oauth
  debug('Configured /oauth url')
  app.get('/oauth', handler.oauth)

  return handler
}
