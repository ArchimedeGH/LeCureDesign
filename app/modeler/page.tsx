'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text as KText } from 'react-konva'
import { Room, Utility } from '../lib/types'
import type { ReactElement } from 'react'

function uid() { return Math.random().toString(36).slice(2, 9) }

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

  const size = { w: Math.round(width*pxPerCm), h: Math.round(depth*pxPerCm) }
  const stageRef = useRef<any>(null)

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

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    const step = 5*pxPerCm
    for (let x=0;x<=size.w;x+=step) lines.push(<Line key={'v'+x} points={[x,0,x,size.h]} stroke="#eee" />)
    for (let y=0;y<=size.h;y+=step) lines.push(<Line key={'h'+y} points={[0,y,size.w,y]} stroke="#eee" />)
    return lines
  }, [size, pxPerCm])

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
          <button onClick={()=>setTool('window')}>Add Window</button>
          <button onClick={()=>setTool('door')}>Add Door</button>
          <div>
            <select value={util} onChange={e=>setUtil(e.target.value as any)}>
              <option value="water">Water</option>
              <option value="drain">Drain</option>
              <option value="power">Power</option>
              <option value="vent">Vent</option>
              <option value="gas">Gas</option>
            </select>
            <button onClick={()=>setTool('utility')}>Add Utility</button>
          </div>
        </div>
        <hr/>
        <button onClick={saveLocal}>Save Room</button>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button onClick={()=>solve('flex')}>Solve (Creative)</button>
          <button onClick={()=>solve('fixed')}>Solve (Conservative)</button>
        </div>
        <p style={{ color:'#666' }}>Suggerimento: clicca vicino alla **parete superiore** per inserire oggetti.</p>
      </div>
      <div>
        <Stage
          ref={stageRef}
          width={size.w} height={size.h}
          onMouseDown={(e)=>{
            const pos = e.target.getStage()?.getPointerPosition(); if (!pos) return
            const x_cm = Math.round(pos.x/pxPerCm)
            if (pos.y < 20) {
              if (tool==='window') addOpening('window', x_cm-60, 120)
              else if (tool==='door') addOpening('door', x_cm-40, 80)
              else if (tool==='utility') addUtility(util, x_cm)
            }
          }}>
          <Layer listening={false}>{gridLines}</Layer>
          <Layer>
            <Rect x={0} y={0} width={size.w} height={size.h} stroke="#111" strokeWidth={2} />
            <Line points={[0,20,size.w,20]} stroke="#444" />
            <KText x={4} y={2} text={`0 cm`} fontSize={12} fill="#444" />
            <KText x={size.w-40} y={2} text={`${width} cm`} fontSize={12} fill="#444" />
            {room.openings.map(o=>{
              const x = o.offset_cm*pxPerCm
              const w = o.width_cm*pxPerCm
              return <Rect key={o.id} x={x} y={0} width={w} height={10} fill={o.type==='window'? '#06b6d4':'#0ea5e9'} />
            })}
            {room.utilities.map(u=>{
              const x = u.offset_cm*pxPerCm
              const color = u.type==='water'?'#3b82f6':u.type==='drain'?'#a855f7':u.type==='power'?'#f59e0b':u.type==='vent'?'#64748b':'#ef4444'
              return <Circle key={u.id} x={x} y={14} radius={6} fill={color} stroke="#1f2937" />
            })}
          </Layer>
        </Stage>
      </div>
    </main>
  )
}
