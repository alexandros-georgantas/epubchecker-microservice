// const logger = require('@pubsweet/logger')
const fs = require('fs-extra')
const { authenticate } = require('@coko/service-auth')
const epubchecker = require('epubchecker')

const { uploadHandler } = require('./helpers')

const epubChecker = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ msg: req.fileValidationError })
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'EPUB file is not included' })
    }
    const { path: filePath } = req.file
    const report = await epubchecker(filePath, {
      includeWarnings: false,
      // do not check CSS and font files
      exclude: /\.(css|ttf|opf|woff|woff2)$/,
    })

    const {
      checker: { nError },
      messages,
    } = report

    let errors

    if (nError > 0) {
      errors = messages.map(msg => msg.message)
    }
    await fs.remove(filePath)
    return res.status(200).json({
      outcome: errors ? 'not valid' : 'ok',
      errors,
    })
  } catch (e) {
    throw new Error(e)
  }
}

const EPUBCheckerBackend = app => {
  app.post('/api/epubchecker', authenticate, uploadHandler, epubChecker)
}

module.exports = EPUBCheckerBackend
