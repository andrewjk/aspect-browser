// NOTE: Copied from https://github.com/sindresorhus/electron-dl/blob/master/index.js to support multiple file downloads with progress

import path from 'path'
import electron from 'electron'
import unusedFilename from 'unused-filename'
import extName from 'ext-name'

const { app, shell } = electron

function getFilenameFromMime (name, mime) {
  const exts = extName.mime(mime)

  if (exts.length !== 1) {
    return name
  }

  return `${name}.${exts[0].ext}`
}

function registerListener (session, options, cb = () => {}) {
  const downloadItems = new Set()
  let receivedBytes = 0
  let completedBytes = 0
  let totalBytes = 0
  const activeDownloadItems = () => downloadItems.size
  const progressDownloadItems = () => receivedBytes / totalBytes

  options = Object.assign({
    showBadge: true
  }, options)

  const listener = (e, item, webContents) => {
    downloadItems.add(item)
    totalBytes += item.getTotalBytes()

    let hostWebContents = webContents
    if (webContents.getType() === 'webview') {
      ({ hostWebContents } = webContents)
    }
    const win = electron.BrowserWindow.fromWebContents(hostWebContents)

    const dir = options.directory || app.getPath('downloads')
    let filePath
    if (options.filename) {
      filePath = path.join(dir, options.filename)
    } else {
      const filename = item.getFilename()
      const name = path.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType())

      filePath = unusedFilename.sync(path.join(dir, name))
    }

    const errorMessage = options.errorMessage || 'The download of {filename} was interrupted'
    const errorTitle = options.errorTitle || 'Download Error'

    if (!options.saveAs) {
      item.setSavePath(filePath)
    }

    if (typeof options.onStarted === 'function') {
      options.onStarted(item)
    }

    item.on('updated', () => {
      receivedBytes = [...downloadItems].reduce((receivedBytes, item) => {
        receivedBytes += item.getReceivedBytes()
        return receivedBytes
      }, completedBytes)

      if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
        app.setBadgeCount(activeDownloadItems())
      }

      if (!win.isDestroyed()) {
        win.setProgressBar(progressDownloadItems())
      }

      if (typeof options.onProgress === 'function') {
        options.onProgress({ localFile: item.getSavePath(), progress: item.getReceivedBytes() })
      }
    })

    item.on('done', (e, state) => {
      completedBytes += item.getTotalBytes()
      downloadItems.delete(item)

      if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
        app.setBadgeCount(activeDownloadItems())
      }

      if (!win.isDestroyed() && !activeDownloadItems()) {
        win.setProgressBar(-1)
        receivedBytes = 0
        completedBytes = 0
        totalBytes = 0
      }

      if (options.unregisterWhenDone) {
        session.removeListener('will-download', listener)
      }

      if (state === 'cancelled') {
        if (typeof options.onCancel === 'function') {
          options.onCancel(item)
        }
      } else if (state === 'interrupted') {
        const message = errorMessage.replace('{filename}', item.getFilename())
        electron.dialog.showErrorBox(errorTitle, message)
        cb(new Error(message))
      } else if (state === 'completed') {
        if (process.platform === 'darwin') {
          app.dock.downloadFinished(filePath)
        }

        if (options.openFolderWhenDone) {
          shell.showItemInFolder(path.join(dir, item.getFilename()))
        }

        cb(null, item)

        if (typeof options.onCompleted === 'function') {
          options.onCompleted({ localFile: item.getSavePath() })
        }
      }
    })
  }

  session.on('will-download', listener)
}

export default (options = {}) => {
  app.on('session-created', session => {
    registerListener(session, options)
  })
}

/*
module.exports.download = (win, url, options) => new Promise((resolve, reject) => {
  options = Object.assign({}, options, { unregisterWhenDone: true })

  registerListener(win.webContents.session, options, (err, item) => {
    if (err) {
      reject(err)
    } else {
      resolve(item)
    }
  })

  win.webContents.downloadURL(url)
})
*/
