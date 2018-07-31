const axios = require('axios')
const apiUrl = process.env.OCTO_API_URL
module.exports = function (controller) {
  controller.hears(
    ['^progress', 'progress'],
    'direct_message,direct_mention,mention',
    async (bot, message) => {
      const progress = await axios.get(`${apiUrl}/job`, {
        headers: {
          'x-api-key': process.env.OCTO_API_KEY
        }
      })
      if (progress.data.state === 'Printing') {
        bot.reply(
          message,
          `Progress: ${parseFloat(progress.data.progress.completion).toFixed(
            2
          )}%`
        )
      } else {
        bot.reply(message, `State: ${progress.data.state}`)
      }
    }
  )
}
