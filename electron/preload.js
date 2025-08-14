import { contextBridge } from 'electron'
contextBridge.exposeInMainWorld('desktop', { version: '0.1.0' })
