import { app, BrowserWindow, Tray, Menu, systemPreferences } from 'electron'
import openAboutWindow from 'about-window'
import eventEmitter from './utils/eventEmitter'
import { BLACK } from './config'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let tray = null

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 100,
    minWidth: 100,
    maxWidth: 400,
    height: 100,
    minHeight: 100,
    maxHeight: 400,
    acceptFirstMouse: true,
    alwaysOnTop: true,
    icon: `file://${__dirname}/images/icon/icon.png`,
    focusable: false,
    frame: false,
    resizable: true,
    show: false, // prevents flash of white
    title: 'SpotSpot',
    backgroundColor: BLACK,
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Menubar icon
  tray = new Tray(`${__dirname}/images/icon/tray_iconTemplate.png`)
  tray.setPressedImage(`${__dirname}/images/icon/tray_iconHighlight.png`)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'About',
      click: function() {
        openAboutWindow({
          icon_path: `${__dirname}/images/icon/icon.png`,
        })
      },
    },
    {
      label: 'Quit',
      click: function() {
        app.quit()
      },
    },
  ])
  tray.setToolTip('SpotSpot')
  tray.setContextMenu(contextMenu)

  // Open the DevTools.
  if (process.env.SPOTSPOT_ENV === 'DEV') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // Hide dock icon
  app.dock.hide()

  // Move window across desktops when switching
  mainWindow.setVisibleOnAllWorkspaces(true)

  // Maintain square window ratio
  mainWindow.setAspectRatio(1.0)

  // Only show window when it's ready; prevents flash of white
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null
  })

  eventEmitter.on('PlaybackStateChanged', playerState => {
    mainWindow.webContents.send('PlaybackStateChanged', playerState)
  })
}

// System events
systemPreferences.subscribeNotification(
  'com.spotify.client.PlaybackStateChanged',
  (_, { 'Player State': playerState }) => {
    eventEmitter.emit('PlaybackStateChanged', playerState.toLowerCase())
  }
)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow)
