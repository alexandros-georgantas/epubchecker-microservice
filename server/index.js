const backend = require('./api')

module.exports = {
  server: () => app => backend(app),
}
