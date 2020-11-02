const epubCheckerEndpoint = require('./api')

module.exports = {
  server: () => app => epubCheckerEndpoint(app),
}
