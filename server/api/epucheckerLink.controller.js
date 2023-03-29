const fs = require('fs-extra')
const { logger } = require('@coko/server')
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
  if (!url) {
    return undefined
  }

  const stage1 = url.split('?')
  const stage2 = stage1[0].split('/')
  const objectKey = stage2[stage2.length - 1]

  return objectKey
}
const epubChecker = async (req, res) => {
  const { body } = req
  const { EPUBPath } = body
  const objectKey = objectKeyExtractor(EPUBPath)
  if (!objectKey) {
    return res.status(404).json({ message: 'no EPUB URL provided' })
  }

  const epubDir = `${process.cwd()}/temp`
  await fs.ensureDir(epubDir)
  const epubPath = path.join(epubDir, `${objectKey}`)

  req.on('error', async err => {
    logger.error(err.message)
    return fs.remove(epubPath)
  })

  try {
    logger.info(
      `downloading EPUB from remote storage ${EPUBPath} to local folder ${epubPath}`,
    )
    await downloadEpub(EPUBPath, epubPath)

    logger.info(`running it through checker`)
    const report = await epubchecker(epubPath, {
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
    logger.info(`cleaning up temp path ${epubPath}`)
    fs.remove(epubPath)
  }
}

module.exports = epubChecker
