module.exports = {

  /**
  * Postgres configuration
  */
  postgres: {
    enabled: process.env.DATABASE === 'postgres',
    host: process.env.PG_HOST || 'ec2-54-227-250-33.compute-1.amazonaws.com',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'imkvnhosgyeejf',
    password: process.env.PG_PASSWORD || '739086672c97f3db0e6e0c263c5b6cd77b1e2c0c509464557778cfb10a9a2e9e',
    database: process.env.PG_DB || 'dc5uv49ppiffj8'
  },

  /**
   * where the content is stored
   * you can access this property from `bp.dataLocation`
   */
  dataDir: process.env.BOTPRESS_DATA_DIR || "./data",
  port: process.env.PORT || 3000,
  modulesConfigDir: process.env.BOTPRESS_CONFIG_DIR || "./modules_config",
  disableFileLogs: false,
  notification: {
    file: 'notifications.json',
    maxLength: 50
  },
  log: {
    file: 'bot.log',
    maxSize: 1e6 // 1mb
  },

  /**
   * Access control of admin pabel
   */
  login: {
    enabled: process.env.NODE_ENV === 'production',
    tokenExpiry: "6 hours",
    password: process.env.BOTPRESS_PASSWORD || "password",
    maxAttempts: 3,
    resetAfter: 5 * 60 * 10000 // 5 minutes
  },

  config: {
    'botpress-messenger': {

       greetingMessage: "🔥 Merhaba. Ben Ardanin urettigi bir yapay zekayim. Bugun sorularinizda size ben yardimci olacagim. \n\n Hazirsaniz baslayalim! 💪\n",
       
       persistentMenu: true,
       
       persistentMenuItems: [ 
         { type: 'postback',
            title: "⛄ Kanada'da Hayat 🏒",
            value: 'GET_VIDEO_GYM' },
          { type: 'postback',
            title: "🎓 Kanada'da egitim 🎒",
            value: 'GET_VIDEO_WORK' },
          { type: 'postback',
            title: "❄ Kanada'da Gocmenlik 👳",
            value: 'GET_VIDEO_LIFE' },
          { type: 'postback',
            title: '👉 Gunluk Video Uyeligi Ayarlari',
            value: 'MANAGE_SUBSCRIPTIONS' },
          { type: 'postback',
            title: '⭐ Bu bot acik kaynakli bir bottur.',
            value: 'OPEN_SOURCE' } 
        ],

        trustedDomains: [ 'https://youtube.com' ],
      
        autoRespondGetStarted: false
    }
  }
}
