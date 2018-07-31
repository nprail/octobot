const axios = require('axios')
const apiUrl = process.env.OCTO_API_URL
module.exports = function (controller) {
  controller.hears(
    ['^progress'],
    'direct_message,direct_mention',
    async (bot, message) => {
      const progress = await axios.get(`${apiUrl}/job`, {
        headers: {
          'x-api-key': process.env.OCTO_API_KEY
        }
      })
      if (progress.state === 'Printing') {
        bot.reply(message, `Progress: ${progress.progress.completion}%`)
      } else {
        bot.reply(message, `State: ${progress.state}`)
      }
    }
  )
}
