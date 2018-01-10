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
    "Kanada'nin vasifli, kalifiye elemana ihtiyaci var!",
    "Kanada'nin resmi gocmenlik sitesini de ziyaret edebilirsiniz! www.canada.ca/en/services/immigration-citizenship.html !"
  ],
  GYM: [
    "Kanada'nin insanlari diyorum baska bir sey demiyorum :-)",
    "Bunu mutlaka izlemeni oneririm!",
    "Kanada mukemmel bir ulke degil. Her ulkede oldugu gibi Kanada'da da yasanan zorluklar var."
  ]
}

const pickCategory = {
  quick_replies: [
    {
      content_type: 'text',
      title: "🎓 Kanada'da Egitim 🎒",
      payload: 'GET_VIDEO_WORK'
    },
    {
      content_type: 'text',
      title: "❄ Kanada'da Gocmenlik 👳",
      payload: 'GET_VIDEO_LIFE'
    },
    {
      content_type: 'text',
      title: "⛄ Kanada'da Hayat 🏒",
      payload: 'GET_VIDEO_GYM'
    }
  ],
  typing: true
}

const WELCOME_SENTENCES = [
  "Merhaba. Ben Arda'nin urettigi bir yapay zekayim. Bugun sana sorularinda ben yardimci olacagim! 👏",
  //"Su anlik sadece butonlar uzerinden anlasabilecegiz. Sana hangi konularda yardimci olabilecegimi bu sekilde anlayacagim. Bu ikimiz icin de en kolayi olacak. 🤖",
  //"Simdilik sınırlı butonlara sahibim ancak Arda gelistirmek icin elinden geleni yapiyor.",
  "Simdilik kisitli ozelliklere sahibim. Ama daha iyi bir kullanici deneyimi yasabilmemiz icin cok ugrasiliyor.",
  //"Eger benim yardimci olamayacagim bir sorun olursa merak etme. Arda bu konusmalarimizi inceleyecek.",
  "Benim degil de Arda'nin cevaplamasi gereken bir sorun varsa mesajinin basina 'sen cevaplama' yazarak sorabilirsin."
  //"👉 Hazirsan lutfen asagida bulunan butonlardan hangi konuda bilgi almak istedigini sec."
]

const WELCOME_TEXT_QUICK_REPLY = "Hemen bir kategori sec ve hemen sana bu konuyla ilgili bir video yollayayim!"

const DEFAULT_ANSWERS = event => [
  event.user.first_name + ", lutfen asagidaki menuden bir baslik sec. Henuz ne dedigini anlayamiyorum :)",
  "Cok ozur diliyorum " + event.user.first_name + ". Ne demek istedigini anlayamadim. Asagidaki kategorilerden birini secersen cok daha iyi anlasabiliriz.",
  "Maalesef bu soruna henuz bir cevabim yok. Ama merak etme. Gunden gune gelisiyorum " + event.user.first_name + ". Simdilik asagidaki menuden secim yapar misin?",
  //"Eyvah! Kelimelerle aram pek iyi degil " + event.user.first_name + ". Asagidaki kategorilerden secim yapar misin?",
  //"Benim tek anlayabildigim sey, asagidaki butonlar :-)",
  //event.user.first_name + " cok iyi anlasiyoruz degil mi? Anlamama ragmen bana bir seyler yaziyorsun :s Asagidaki butonlari kullanirsan daha iyi anlasabilecegimizden hic suphem yok!",
  "Anladigim kadariyla Arda'nin bana yeni ozellikler katmasi sart " + event.user.first_name + ", daha insanlarin ne dedigini anlayamiyorum. Ama emin ol, Arda gercekten cok yogun. Lutfen asagidaki butonlari kullan"
]

const shareTemplate = {
  template_type: 'generic',
  elements: [{
    title: "Asagidaki butona tiklamak hayatinizi degistirebilir! Kanada'da neler oluyor?, Nasil gelebilirim? gibi sorularinizin cevabi icin kanalima abone olabilirsiniz!",
    item_url: 'https://goo.gl/iTc9cY',
    image_url: 'https://fokushaber.com/wp-content/uploads/2017/11/Kanada-sohbet.jpg',
    buttons: [{
      type: 'web_url',
      title: '👏 Abone Ol',
      url: 'https://goo.gl/iTc9cY'
    }, { type: 'element_share' }]
  }]
}

const SHARE_TEXT = "Senden hic bir karsilik beklemeden sana yardimci oluyorum. Senden rica etsem, Arda'nin kanalini buyutmesi icin yardimci olur musun? Asagidaki seceneklerden arkadaslarinla da paylasabilirsin.👇!"

const OPEN_SOURCE_TEXT = "Bu bot acik-kaynakli bir bottur ve AGPL-3 lisansi ile korunmaktadir.\n⚡ Bu bot Botpress Platform'u uzerinden Arda Erturk tarafindan gelistirilmistir."

module.exports = function(bp) {
  bp.middlewares.load()
  subscription(bp)

  bp.hear({
    type: 'message',
    text: /^merhaba/
  }, (event, next) => {
    const id = event.user.id
    const first_name = event.user.first_name

    const text = 'Merhaba ' + event.user.first_name + ". Bugun hangi konuda fikir edinmek istersin?"
    bp.messenger.sendText(id, text, { typing: true, waitDelivery: true })
  })


  // if the user wants the admin to answer their question, then let them know.
  // precondition; user needs to begin the message with "Sen cevaplama"
  bp.hear({
	type: 'message',
	text: /^sen cevaplama/i
  }, (event, next) => {
	const id = event.user.id
	const first_name = event.user.first_name

	const text = 'Peki ' + event.user.first_name + ". Bu mesajini Arda en kisa surede inceleyecek. Yogunluktan dolayi kesin cevap verip veremeyecegini maalesef kestiremiyorum. Eger videolarinda cevabini bulamadiysan buyuk ihtimalle cevap verir. Yine de beni kaybetmedin. Sana bilgi vermeye devam edecegim."
	bp.messenger.sendText(id, text, { typing: true, waitDelivery: true })
  })
  


  //TODO :
  // ask user about the topic that they want to talk

  //MAIN HEARING FUNCTION
      bp.hear({
      type: 'message',
      text: /\D/
    }, (event, next) => {
      //const konu = event.text
      event.konu = event.text
      const id = event.user.id
      const first_name = event.user.first_name
      event.konu = event.konu.toLowerCase()

      //Convert Characters
      event.konu = event.konu.replace(/ö/g, 'o');
      event.konu = event.konu.replace(/ç/g, 'c');
      event.konu = event.konu.replace(/ş/g, 's');
      event.konu = event.konu.replace(/ı/g, 'i');
      event.konu = event.konu.replace(/ğ/g, 'g');
      event.konu = event.konu.replace(/ü/g, 'u');  

      if (event.konu.includes("iltica") || event.konu.includes("multeci") || event.konu.includes("siginma")) {
        bp.messenger.sendText(id, "Maalesef bu konularda yardimci olamiyorum!", { typing: true, waitDelivery: true })
    } else if (event.konu.includes("illegal")) {
        bp.messenger.sendText(id, 'Sana tek onerim bu islere girmemen. Hayatini riske sokacak hic bir sey yapma!', { typing: true, waitDelivery: true })
    } else if (event.konu.includes("birebir") || event.konu.includes("danismanlik")) {
        bp.messenger.sendText(id, "Maalesef artik Arda birebir danismanlik ve gorusme icin vakit bulamiyor. Ben elimden geleni yapiyorum. Emin olabilirsin. Yine de icin rahatlasin diye soyluyorum, Arda bu konusmalarimizi inceleyecek. Onun cevaplamasi gereken bir sey olursa mutlaka gorur.", { typing: true, waitDelivery: true })
    } else if (event.konu.includes("basarilar") || event.konu.includes("tebrikler") || event.konu.includes("tesekkur") || event.konu.includes("tesekkurler")) {
        bp.messenger.sendText(id, "Guzel dileklerin icin cok tesekkur ederim. Sana da basarilar diliyorum.", { typing: true, waitDelivery: true })
    } else if (event.konu.includes("nasilsin") || event.konu.includes("naber")) {
        bp.messenger.sendText(id, "Iyiyim, tesekkurler " + event.user.first_name + ". Sen nasilsin?", { typing: true, waitDelivery: true })
    } else if (event.konu == "." || event.konu.includes("iyi")) {
        bp.messenger.sendText(id, "👍", { typing: true, waitDelivery: true })
    } else if ((event.konu.includes("merhaba") || event.konu.includes("salam") || event.konu.includes("meraba") || event.konu.includes("selamun")  || event.konu.includes("selam") || event.konu.includes("maraba")) &&  (event.konu.length < 13)) {
       bp.messenger.sendText(id, 'Merhaba ' + event.user.first_name + ". Bugun hangi konuda fikir edinmek istersin?", { typing: true, waitDelivery: true })
    } else {
        const text = _.sample(DEFAULT_ANSWERS(event))
          return bp.messenger.sendText(event.user.id, text, pickCategory)
    	//bp.messenger.sendText(id, 'Lutfen asagidaki butonlardan secimini yaparak istedigin konuda bilgi edin! Izledikten sonra hala sorun olursa merak etme. Arda bu konusmalarimizi inceleyecek.', pickCategory)
    }
})


//rate the bot. Asked by human. Rate answer is answered by bot.


bp.hear({
      type: 'message',
      text: /^[-+]?\d+/
    }, (event, next) => {
      //const konu = event.text
      event.konu = event.text
      const id = event.user.id
      const first_name = event.user.first_name


      bp.messenger.sendText(id, "Puanin icin tesekkurler! Bu puanlar gelismem icin cok onemli.", { typing: true, waitDelivery: true })
})
      


// for english messenger
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

// for turkish messenger
  bp.hear({
    type: 'postback',
    text: 'BASLA' 
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
        url: 'https://github.com/ardaerturk'
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
              title: '🔥 Hemen izle 🔥',
              url: meta.url,
              webview_height_ratio: 'full'
            },
            {
              type: 'postback',
              title: '👉 Siradaki video',
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
    const text = "Merhaba. Gunluk videonu izlemeyi unutma. Iyi gunler dilerim 😁!"

    bp.messenger.sendText(userId, text)
    .then(Promise.delay(1000))
    .then(() => bp.sendRandomVideo(userId, category))
  }
}
