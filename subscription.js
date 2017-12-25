const axios = require('axios')
const moment = require('moment')

const manageSubscriptions = (bp, userId) => {
  return bp.subscription.isSubscribed('facebook:' + userId, 'daily')
  .then(subscribed => {
    if (subscribed) {
      bp.messenger.sendTemplate(userId, {
        template_type: 'button',
        text: "Her gun saat 20'de video tavsiyesi almak icin kayitlisiniz.",
        buttons: [ { type: 'postback', title: 'Kayittan çik', payload: 'UNSUBSCRIBE_DAILY'} ]
      })
    } else {
      bp.messenger.sendTemplate(userId, {
        template_type: 'button',
        text: "Her gun saat 20'de yeni bir video tavsiyesi almak icin kayit ol tusuna basabilirsin!",
        buttons: [ { type: 'postback', title: 'Kayit ol', payload: 'SUBSCRIBE_DAILY'} ]
      })
    }
  })
}

const scheduleBroadcast = bp => async () => {
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD')
  
  const token = await bp.security.login('admin', bp.botfile.login.password, '127.0.0.1')

  const api = axios.create({
    baseURL: 'http://localhost:' + bp.botfile.port + '/api/',
    headers: {'Authorization': token && token.token}
  })
  
  return api.put('botpress-broadcast/broadcasts', {
    date: tomorrow,
    time: '20:00',
    timezone: null, // users timezone
    type: 'javascript',
    content: "bp.sendDailyVideo(userId)",
    filters: ["bp.subscription.isSubscribed('facebook:' + userId, 'daily')"]
  })
  .catch(err => {
    bp.logger.error(err && err.message, err && err.stack)
    bp.notifications.send({
      level: 'error',
      message: 'Could not schedule broadcast. See logs.'
    })
  })
}

module.exports = bp => {
  bp.scheduleBroadcast = scheduleBroadcast(bp)
  bp.manageSubscriptions = manageSubscriptions
}
