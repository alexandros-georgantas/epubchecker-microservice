const fs = require('fs-extra')
const epubchecker = require('epubchecker')

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
      includeWarnings: true,
      // do not check font files
      exclude: /\.(ttf|opf|woff|woff2)$/,
    })

    const {
      checker: { nError },
      messages,
    } = report

    await fs.remove(filePath)
    return res.status(200).json({
      outcome: nError > 0 ? 'not valid' : 'ok',
      messages,
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = epubChecker
