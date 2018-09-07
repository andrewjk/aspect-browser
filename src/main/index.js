'use strict'

import { app, BrowserWindow } from 'electron'
import registerDownloads from './electron-dl'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

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

    // const item = data
    // item.on('updated', (event, state) => {
    //   if (state === 'interrupted') {
    //     console.log('Download is interrupted but can be resumed')
    //   } else if (state === 'progressing') {
    //     if (item.isPaused()) {
    //       console.log('Download is paused')
    //     } else {
    //       console.log(`Received bytes: ${item.getReceivedBytes()}`)
    //     }
    //   }
    // })
    // item.once('done', (event, state) => {
    //   if (state === 'completed') {
    //     console.log('Download successfully')
    //   } else {
    //     console.log(`Download failed: ${state}`)
    //   }
    // })
  },
  onProgress: (item) => {
    mainWindow.send('download-progress', item)
  },
  onCompleted: (item) => {
    mainWindow.send('download-completed', item)
  }
})

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
