const axios = require('axios')
const _ = require('lodash')

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

const videos = {
  WORK: [
    "m1q8XpnM8Fg",
    "fciwVZMrqjs",
    "wWLjz2ig3Bk"
  ],
  LIFE: [
    "xf4iRYCgIRA",
    "DwnGaZUdyTs"
  ],
  GYM: [
    "D-tW9lCZ4v8",
    "LXMh-tzkCWU",
    "ZslGnXpario"
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
