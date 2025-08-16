'use client'
import { useEffect, useState } from 'react'
import nextDynamic from 'next/dynamic'
import type { Room, Utility } from '../lib/types'

// ⬇️ Import dinamico del componente che usa react-konva, con SSR disattivato
const KonvaStage = nextDynamic(() => import('./KonvaStage'), { ssr: false })

function uid() { return Math.random().toString(36).slice(2, 9) }
export const dynamic = 'force-dynamic'

export default function Modeler() {
  const [width, setWidth] = useState(420)   // cm
  const [depth, setDepth] = useState(280)   // cm
  const [height, setHeight] = useState(270) // cm
  const [pxPerCm, setPxPerCm] = useState(2)
  const [tool, setTool] = useState<'window'|'door'|'utility'>('utility')
  const [util, setUtil] = useState<Utility['type']>('water')

  const [room, setRoom] = useState<Room>({
    id: 'r1', width_cm: width, depth_cm: depth, height_cm: height,
    openings: [], utilities: []
  })
  useEffect(() => setRoom(r => ({ ...r, width_cm: width, depth_cm: depth, height_cm: height })), [width, depth, height])

  function addOpening(type: 'door'|'window', x_cm: number, w_cm: number) {
    setRoom(r => ({ ...r, openings: [...r.openings, {
      id: uid(), wallId: 'north', type,
      offset_cm: Math.max(0, Math.min(x_cm, width - w_cm)),
      width_cm: w_cm, height_cm: type==='door'?210:120, sill_cm: type==='window'?90:0
    }] }))
  }
  function addUtility(t: Utility['type'], x_cm: number) {
    setRoom(r => ({ ...r, utilities: [...r.utilities, {
      id: uid(), type: t, wallId: 'north',
      offset_cm: Math.max(0, Math.min(x_cm, width)), movable: t!=='drain'
    }] }))
  }
  function saveLocal() {
    localStorage.setItem('skp_room', JSON.stringify(room))
    alert('Room salvata (LocalStorage: skp_room)')
  }
  async function solve(mode: 'flex'|'fixed') {
    const res = await fetch('/api/solve', {
      method: 'POST', headers: { 'content-type':'application/json' },
      body: JSON.stringify({ room, mode })
    })
    const data = await res.json()
    localStorage.setItem('skp_proposals', JSON.stringify(data.proposals))
    alert(`Generate ${data.proposals.length} proposte. Apri la 3D Viewer.`)
  }

  return (
    <main style={{ display:'grid', gridTemplateColumns:'300px 1fr', height:'100vh' }}>
      <div style={{ padding:16, borderRight:'1px solid #eee' }}>
        <h2>Room Modeler</h2>
        <label>Width (cm) <input type="number" value={width} onChange={e=>setWidth(Number(e.target.value)||0)} /></label><br/>
        <label>Depth (cm) <input type="number" value={depth} onChange={e=>setDepth(Number(e.target.value)||0)} /></label><br/>
        <label>Height (cm) <input type="number" value={height} onChange={e=>setHeight(Number(e.target.value)||0)} /></label><br/>
        <label>Pixels/cm <input type="number" value={pxPerCm} min={1} max={4} onChange={e=>setPxPerCm(Number(e.target.value)||2)} /></label>
        <hr/>
        <b>Tools</b>
        <div style={{ display:'grid', gap:8 }}>
          <button onClick={()=>setTool('window')}>Add Window (⌥+Click barra in alto)</button>
          <button onClick={()=>setTool('door')}>Add Door (⇧+Click barra in alto)</button>
          <div>
            <select value={util} onChange={e=>setUtil(e.target.value as any)}>
              <option value="water">Water</option>
              <option value="drain">Drain</option>
              <option value="power">Power</option>
              <option value="vent">Vent</option>
              <option value="gas">Gas</option>
            </select>
            <button onClick={()=>setTool('utility')}>Utility mode</button>
          </div>
        </div>
        <hr/>
        <button onClick={saveLocal}>Save Room</button>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button onClick={()=>solve('flex')}>Solve (Creative)</button>
          <button onClick={()=>solve('fixed')}>Solve (Conservative)</button>
        </div>
        <p style={{ color:'#666' }}>Suggerimento: inserisci oggetti cliccando vicino alla <b>barra superiore</b> (0–20px).</p>
      </div>

      <div>
        <KonvaStage
          room={room}
          width={width}
          depth={depth}
          pxPerCm={pxPerCm}
          onAddOpening={(t, x, w) => addOpening(t, x, w)}
          onAddUtility={(t, x) => {
            if (tool === 'utility') addUtility(t, x)
            else if (tool === 'window') addOpening('window', x - 60, 120)
            else if (tool === 'door') addOpening('door', x - 40, 80)
          }}
        />
      </div>
    </main>
  )
}
