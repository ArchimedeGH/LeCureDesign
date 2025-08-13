import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { spawn } from 'node:child_process'
import getPort from 'get-port'
import waitOn from 'wait-on'

let serverProc = null
let win = null

async function startNextServer() {
  const port = await getPort({ port: getPort.makeRange(3001, 3999) })
  const resources = process.resourcesPath || path.join(process.cwd())
  const standaloneDir = path.join(resources, 'next-standalone')
  const publicDir = path.join(resources, 'public')
  const staticDir = path.join(resources, 'next-static')
  const serverJs = path.join(standaloneDir, 'server.js')

  serverProc = spawn(process.execPath, [serverJs], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NEXT_PUBLIC_REGION: 'EU-IT',
      NEXT_PUBLIC_CURRENCY: 'EUR',
      NEXT_STATIC_DIR: staticDir,
      NEXT_PUBLIC_DIR: publicDir
    },
    cwd: standaloneDir,
    stdio: 'inherit'
  })
  await waitOn({ resources: [`http://127.0.0.1:${port}`], timeout: 300000 })
  return port
}

async function createWindow() {
  const port = await startNextServer()
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: 'Scandinavian Kitchen Planner',
    webPreferences: { preload: path.join(path.dirname(new URL(import.meta.url).pathname), 'preload.js') }
  })
  win.removeMenu()
  win.loadURL(`http://127.0.0.1:${port}`)
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', () => { if (serverProc) serverProc.kill('SIGINT') })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
