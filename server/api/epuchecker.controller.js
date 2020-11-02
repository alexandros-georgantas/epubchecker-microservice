// const logger = require('@pubsweet/logger')
const { authenticate } = require('@coko/service-auth')
const epubchecker = require('epubchecker')

const { uploadHandler } = require('./helpers')

const epubChecker = async (req, res) => {
  try {
    // console.log(req.header('host'))
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

    let errorMsg
    if (nError > 0) {
      errorMsg = messages.map(msg => msg.message).join(' * ')
    }
    const result = {}
    Object.assign(result, errorMsg ? { error: errorMsg } : { validation: 'ok' })

    return res.status(200).json({
      data: result,
    })
  } catch (e) {
    throw new Error(e)
  }
}

const EPUBCheckerBackend = app => {
  app.post('/api/test', authenticate, uploadHandler, epubChecker)
}

module.exports = EPUBCheckerBackend
