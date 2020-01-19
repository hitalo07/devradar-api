const axios = require('axios')
const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')
const { findConnections, sendMessage } = require('../websocket')

module.exports = {
  async index(response) {
    const devs = await Dev.find()

    return response.json(devs)
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body

    let dev = await Dev.findOne({ github_username })

    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)

      let { name = login, avatar_url, bio } = apiResponse.data

      const techesArray = parseArrayAsString(techs)

      const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      }

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techesArray,
        location
      })

      // Filtrar as conexoes
      const sendWebsocketMessageTo = findConnections(
        { latitude, longitude },
        techesArray
      )

      sendMessage(sendWebsocketMessageTo, 'new-dev', dev)

    }

    return response.json(dev)
  }
}