const Chance = require('chance')

const random = new Chance('github-context-seed')

exports.context = {
  repo: {
    owner: random.word(),
    repo: random.word()
  },
  ref: random.hash()
}
