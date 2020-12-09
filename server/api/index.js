const { authenticate } = require('@coko/service-auth')
const epubChecker = require('./epuchecker.controller')
const { uploadHandler } = require('./helpers')

const backend = app => {
  app.post('/api/epubchecker', authenticate, uploadHandler, epubChecker)
}
module.exports = backend
