module.exports = function (controller) {
  controller.hears(
    ['^progress'],
    'direct_message,direct_mention',
    (bot, message) => {
      bot.reply(message, 'I will repeat whatever you say.')
    }
  )
}
