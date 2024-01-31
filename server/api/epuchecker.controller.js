const fs = require('fs-extra')
const epubchecker = require('epubchecker')
const { logger } = require('@coko/server')

const epubChecker = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'EPUB file is not included' })
  }
  if (req.fileValidationError) {
    return res.status(400).json({ msg: req.fileValidationError })
  }
  const { path: filePath } = req.file
  req.on('error', async err => {
    logger.error(err.message)
    return fs.remove(filePath)
  })

  try {
    logger.info(`running EPUB through checker`)
    const report = await epubchecker(filePath, {
      includeWarnings: true,
      // do not check font files
      exclude: /\.(ttf|opf|woff|woff2)$/,
    })

    const {
      checker: { nError },
      messages,
    } = report
    logger.info(`sending back the report`)

    return res.status(200).json({
      outcome: nError > 0 ? 'not valid' : 'ok',
      messages,
    })
  } catch (e) {
    throw new Error(e)
  } finally {
    logger.info(`cleaning up temp path ${filePath}`)
    fs.remove(filePath)
  }
}

module.exports = epubChecker
