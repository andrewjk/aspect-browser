'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import registerDownloads from './electron-dl'
import registerContextMenu from 'electron-context-menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Set the userData folder manually to 'Aspect Browser'
app.setPath('userData', app.getPath('userData').replace('aspect-browser', 'Aspect Browser'))

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    frame: false,
    height: 800,
    useContentSize: true,
    width: 1200
  })

  mainWindow.setMenu(null)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Setup downloads management via electron-dl, using IPC to communicate to Vue components
const downloads = []
registerDownloads({
  onStarted: (item) => {
    // Properties from https://electronjs.org/docs/api/download-item
    const data = {
      filename: item.getSavePath().split('\\').pop().split('/').pop(),
      serverFile: item.getURL(),
      localFile: item.getSavePath(),
      size: item.getTotalBytes(),
      canResume: item.canResume()
    }
    mainWindow.send('download-started', data)
    downloads.push({ localFile: item.getSavePath(), item })
  },
  onProgress: (item) => {
    mainWindow.send('download-progress', item)
  },
  onCompleted: (item) => {
    mainWindow.send('download-completed', item)
  }
})

ipcMain.on('pause-download', (event, data) => {
  const download = downloads.find((item) => {
    return item.localFile === data.localFile
  })
  download.item.pause()
  mainWindow.send('download-paused', data)
})
ipcMain.on('resume-download', (event, data) => {
  const download = downloads.find((item) => {
    return item.localFile === data.localFile
  })
  download.item.resume()
  mainWindow.send('download-resumed', data)
})
ipcMain.on('cancel-download', (event, data) => {
  const download = downloads.find((item) => {
    return item.localFile === data.localFile
  })
  download.item.cancel()
  mainWindow.send('download-cancelled', data)
})

// Set up the default context menu using electron-context-menu
registerContextMenu({})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
