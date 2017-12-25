const Promise = require('bluebird')
const _ = require('lodash')
const videos = require('./videos')
const subscription = require('./subscription')

const TEXT_CATEGORIES = {
  WORK: [
    "Hic bir sey kolay degil. Egitim almak da calismak da zor. Umarim bu video size bir yol gosterir!",
    "Asla pes etmeyin!",
    "Kanada'da calisma ortami da ogrencilik hayati da bence cok zevkli"
  ],
  LIFE: [
    "Anavataninizi birakmak kolay bir sey degil. Hayatinizda alacaginiz en buyuk risklerden biridir.",
    "Kanada'nin vasifli, kalifiye elemana ihtiyaci var, " + event.user.first_name ,
    "Kanada'nin resmi gocmenlik sitesini de ziyaret edebilirsiniz! www.canada.ca/en/services/immigration-citizenship.html !"
  ],
  GYM: [
    "You will find yourself working 20% harder just by listening to this on the trendmill",
    "Happy to be your workout mate... Watch this!",
    "If you are not pumped up after this video, I really don't know what to tell you"
  ]
}

const pickCategory = {
  quick_replies: [
    {
      content_type: 'text',
      title: "🔥 Kanada'da Egitim 🔥",
      payload: 'GET_VIDEO_WORK'
    },
    {
      content_type: 'text',
      title: "😌 Kanada'da Gocmenlik 🔥",
      payload: 'GET_VIDEO_LIFE'
    },
    {
      content_type: 'text',
      title: "💪 Kanada'da Hayat 🔥",
      payload: 'GET_VIDEO_GYM'
    }
  ],
  typing: true
}

const WELCOME_SENTENCES = [
  "Merhaba. Ben Arda'nin urettigi bir yapay zekayim. Bugun sana sorularinda ben yardimci olacagim! 👏",
  "Su anlik sadece butonlar uzerinden anlasabilecegiz. Sana hangi konularda yardimci olabilecegimi bu sekilde anlayacagim. Bu ikimiz icin de en kolayi olacak. 🤖",
  "👉 Zorlanirsan messenger'in menulerini kullanabilirsin."
]

const WELCOME_TEXT_QUICK_REPLY = "Hemen bir kategori sec ve hemen sana bu konuyla ilgili bir video yollayayim!"

const DEFAULT_ANSWERS = event => [
  event.user.first_name + ", lutfen asagidaki menuden bir baslik sec. Henuz ne dedigini anlayamiyorum :)",
  "Eyvah! Kelimelerle aram pek iyi degil " + event.user.first_name,
  "Benim tek anlayabildigim sey, Arda'nin videolari",
  event.user.first_name + " seni sevdim. Anlamama ragmen bana bir seyler yaziyorsun :s",
  "Anladigim kadariyla Arda'nin bana yeni ozellikler katmasi sart " + event.user.first_name + ", daha insanlarin ne dedigini anlayamiyorum. Ama emin ol, Arda gercekten cok yogun."
]

const shareTemplate = {
  template_type: 'generic',
  elements: [{
    title: 'Clicking this button could literally change your life',
    item_url: 'https://m.me/boostfuel',
    image_url: 'https://s27.postimg.org/dl8i0udqb/motivation_on_demand.png',
    buttons: [{
      type: 'web_url',
      title: '👏 Make it happen',
      url: 'https://m.me/boostfuel'
    }, { type: 'element_share' }]
  }]
}

const SHARE_TEXT = "PLEASE! If you enjoy the service I am giving you, consider sharing the card below with some of your friends 👇!"

const OPEN_SOURCE_TEXT = "This bot is open-source and released under the AGPL-3 license. Contributions are welcomed.\n⚡ This bot is powered by the Botpress Platform."

module.exports = function(bp) {
  bp.middlewares.load()
  subscription(bp)

  bp.hear({
    type: 'postback',
    text: 'GET_STARTED' 
  }, (event, next) => {
    const { first_name, last_name } = event.user
    bp.logger.info('New user:', first_name, last_name)

    bp.subscription.subscribe(event.user.id, 'daily')

    return Promise.mapSeries(WELCOME_SENTENCES, txt => {
      return bp.messenger.sendText(event.user.id, txt, { typing: true, waitDelivery: true })
      .then(Promise.delay(250))
    })
    .then(() => bp.messenger.sendText(event.user.id, WELCOME_TEXT_QUICK_REPLY, pickCategory))
  })

  bp.hear(/TRIGGER_DAILY/i, (event, next) => {
    bp.sendDailyVideo(event.user.id)
  })

  bp.hear({
    type: 'postback',
    text: 'OPEN_SOURCE'
  }, (event, next) => {
    return bp.messenger.sendTemplate(event.user.id, {
      template_type: 'button',
      text: OPEN_SOURCE_TEXT,
      buttons: [{ 
        type: 'web_url',
        title: 'View on GitHub',
        url: 'https://github.com/botpress/Boost'
      }]
    })
  })

  const hearGetVideo = category => {
    bp.hear({ text: 'GET_VIDEO_' + category }, (event, next) => {
      const text = _.sample(TEXT_CATEGORIES[category])
      bp.messenger.sendText(event.user.id, text, { waitDelivery: true })
      .then(() => bp.sendRandomVideo(event.user.id, category))
    })
  }

  // Create a listener for each categories
  _.keys(TEXT_CATEGORIES).forEach(hearGetVideo)

  bp.botDefaultResponse = event => {
    const text = _.sample(DEFAULT_ANSWERS(event))
    return bp.messenger.sendText(event.user.id, text, pickCategory)
  }

  bp.sendRandomVideo = (userId, category) => {
    return videos.getRandomVideo(category)
    .then(meta => {
      return bp.messenger.sendTemplate(userId, {
        template_type: 'generic',
        elements: [{
          title: meta.title,
          item_url: meta.url,
          image_url: meta.thumbnail,
          subtitle: meta.description,
          buttons: [
            {
              type: 'web_url',
              title: '🔥 Watch 🔥',
              url: meta.url,
              webview_height_ratio: 'full'
            },
            {
              type: 'postback',
              title: '👉 Next video',
              payload: 'GET_VIDEO_' + category
            },
            { type: 'element_share' }
          ]
        }]
      })
    })
    .then(() => {
      // 10% chance of saying this
      const n = _.random(0, 10)
      if (n === 5) {
        return Promise.delay(15000)
        .then(() => bp.sendShare(userId))
      }
    })
  }

  bp.sendShare = userId => {
    return bp.messenger.sendText(userId, SHARE_TEXT)
    .then(Promise.delay(1000))
    .then(() => bp.messenger.sendTemplate(userId, shareTemplate))
  }

  bp.sendDailyVideo = userId => {
    const category = _.sample(_.keys(TEXT_CATEGORIES))
    const text = "Here's your daily motivational video, have an excellent day 😁!"

    bp.messenger.sendText(userId, text)
    .then(Promise.delay(1000))
    .then(() => bp.sendRandomVideo(userId, category))
  }
}
