const fs = require('fs-extra')
const epubchecker = require('epubchecker')
const axios = require('axios')
const path = require('path')

const downloadEpub = (url, epubPath) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(epubPath))
          .on('finish', () => resolve())
          .on('error', e => reject(e))
      }),
  )
const objectKeyExtractor = url => {
  const stage1 = url.split('?')
  const stage2 = stage1[0].split('/')
  const objectKey = stage2[stage2.length - 1]

  return objectKey
}
const epubChecker = async (req, res) => {
  try {
    const { body } = req
    const { EPUBPath } = body
    const objectKey = objectKeyExtractor(EPUBPath)
    const epubDir = `${process.cwd()}/temp`
    await fs.ensureDir(epubDir)
    const epubPath = path.join(epubDir, `${objectKey}`)
    await downloadEpub(EPUBPath, epubPath)
    const report = await epubchecker(epubPath, {
      includeWarnings: true,
      // do not check font files
      exclude: /\.(ttf|opf|woff|woff2)$/,
    })

    const {
      checker: { nError },
      messages,
    } = report

    await fs.remove(epubPath)
    return res.status(200).json({
      outcome: nError > 0 ? 'not valid' : 'ok',
      messages,
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = epubChecker
