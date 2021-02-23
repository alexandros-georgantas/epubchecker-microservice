const { authenticate } = require('@coko/service-auth')
const epubChecker = require('./epuchecker.controller')
const epubCheckerLink = require('./epucheckerLink.controller')
const { uploadHandler } = require('./helpers')

const backend = app => {
  app.post('/api/epubchecker', authenticate, uploadHandler, epubChecker)
  app.post('/api/epubchecker/link', authenticate, epubCheckerLink)
}
module.exports = backend
