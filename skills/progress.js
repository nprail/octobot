const axios = require('axios')
const api = axios.create({
  baseURL: process.env.OCTO_API_URL,
  headers: {
    'x-api-key': process.env.OCTO_API_KEY
  }
})

module.exports = controller => {
  const progressFunc = async (bot, message) => {
    const progress = await api.get('/job')

    if (progress.data.state === 'Printing') {
      bot.reply(
        message,
        `Progress: ${parseFloat(progress.data.progress.completion).toFixed(2)}%`
      )
    } else {
      bot.reply(message, `State: ${progress.data.state}`)
    }
  }

  controller.hears(
    ['^progress', 'progress'],
    'direct_message,direct_mention,mention',
    progressFunc
  )
}
