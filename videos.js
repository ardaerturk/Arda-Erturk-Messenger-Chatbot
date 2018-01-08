const axios = require('axios')
const _ = require('lodash')

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

const videos = {
  //egitim
  WORK: [
    "m1q8XpnM8Fg",
    "wWLjz2ig3Bk",
    "XbH4LlqovAM",
    "9oezi9k7pr8",
    "Z5lB_7OWf8Y",
    "djIxaGSitzg",
    "DSvQLjEAQ-k",
    "9kwo9LV0sYA",
    "sMa81sC8lQc",
    "aBwgLWVqX-c",
    "rDHk-xnERa0",
    "ZvMHXThVeF0",
    "wiaBasgJ9nQ",
    "BLrEcUEcsow",
    "DwnGaZUdyTs",
    "6JytquKGeGo",



    

  ],
  //gocmenlik
  LIFE: [
    "xf4iRYCgIRA",
    "DwnGaZUdyTs",
    "vz1t65mfhJU",
    "qDtJNJMJexI",
    "9iqmJqT-KKg",
    "4EnX9Gq3krQ",
    "9oezi9k7pr8",
    "djIxaGSitzg",
    "vZhVx1rj6Kc",
    "DSvQLjEAQ-k",
    "9kwo9LV0sYA",
    "Tez3PFpySy0",
    "BLrEcUEcsow",
    "DwnGaZUdyTs",
    "6JytquKGeGo",


  ],
  //hayat
  GYM: [
    "D-tW9lCZ4v8",
    "LXMh-tzkCWU",
    "ZslGnXpario",
    "m1q8XpnM8Fg",
    "qDtJNJMJexI",
    "6umgOLosCp8",
    "fd2GSZ9_tP4",
    "fciwVZMrqjs",
    "wWLjz2ig3Bk",
    "xpORSPLe_TI",
    "4lvVk8Lzc9E",
    "YPzqPtAM_so",
    "nsD6l_x8xTk",
    "8QQh4IVN7YI",
    "Bm4rrya517E",
    "ny0LiFA7r64",
    "cbb2aiESfZw",
    "gk3maEMt0EE",
    "qG68kab-Ed8",
    "lUNI6GrSs24",
    "sGxJ55NnPoc",
    "ryhcb2YRSd0",
    "97PxasVwhYE",
    "xjFhbTy4jw4",
    "nNigLN09BDg",
    "NlSg6tuQhVw",
    "UGjDS9fsAuY",
    "djIxaGSitzg",
    "vZhVx1rj6Kc",
    "DSvQLjEAQ-k",
    "BjmfTFqz7Qo",
    "DbdqYaAqtfY",
    "43zUpFKXqMU",
    "GAJ75cYMYU8",
    "eiNn4S2l9hk",
    "HZDkfVEQuxM",
    "LXMh-tzkCWU",
    "6XbaXvAEvCc",
    "imAvykcT1Hk",
    "ZslGnXpario",
    "mMvD_8nhLcA",
    "8EUCQi27ebA",
    "6JytquKGeGo",







  ]
}

const getYoutubeVideoMetadata = (videoId) => {
  const apiUrl = `https://content.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`

  return axios.get(apiUrl)
  .then(res => {
    const video = res.data.items[0].snippet
    return {
      description: video.description,
      thumbnail: (video.thumbnails.high || video.thumbnails.standard).url,
      title: video.title,
      url: 'https://www.youtube.com/embed/' + videoId + '?autoplay='
    }
  })
}

module.exports = {
  getRandomVideo: (category) => {
    if (!category) {
      category = _.sample(_.keys(videos))
    }
    
    const videoId = _.sample(videos[category])
    return getYoutubeVideoMetadata(videoId)
  }
}
