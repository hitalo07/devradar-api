const axios = require('axios')
const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')

module.exports = {
  async index(request, response) {
    const devs = await Dev.find()

    response.json(devs)
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body

    const dev = await Dev.findOne({ github_username })

    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)

      let { name = login, avatar_url, bio } = apiResponse.data

      const techesArray = parseArrayAsString(techs)

      const location = {
        type: 'Point',
        coordinates: [latitude, longitude]
      }

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techesArray,
        location
      })
    }

    return response.json(dev)
  }
}