'use client'
import { useMemo, useRef, type ReactElement } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text as KText } from 'react-konva'
import type { Room, Utility } from '../lib/types'

type Props = {
  room: Room
  width: number
  depth: number
  pxPerCm: number
  onAddOpening: (type: 'door' | 'window', x_cm: number, w_cm: number) => void
  onAddUtility: (t: Utility['type'], x_cm: number) => void
}

export default function KonvaStage({
  room, width, depth, pxPerCm, onAddOpening, onAddUtility
}: Props) {
  const size = { w: Math.round(width * pxPerCm), h: Math.round(depth * pxPerCm) }
  const stageRef = useRef<any>(null)

  const gridLines = useMemo(() => {
    const lines: ReactElement[] = []
    const step = 5 * pxPerCm
    for (let x = 0; x <= size.w; x += step) lines.push(<Line key={'v' + x} points={[x, 0, x, size.h]} stroke="#eee" />)
    for (let y = 0; y <= size.h; y += step) lines.push(<Line key={'h' + y} points={[0, y, size.w, y]} stroke="#eee" />)
    return lines
  }, [size, pxPerCm])

  return (
    <Stage
      ref={stageRef}
      width={size.w}
      height={size.h}
      onMouseDown={(e: any) => {
        const pos = e.target.getStage()?.getPointerPosition(); if (!pos) return
        const x_cm = Math.round(pos.x / pxPerCm)
        if (pos.y < 20) {
          if (e.evt.shiftKey) {
            onAddOpening('door', x_cm - 40, 80)
          } else if (e.evt.altKey) {
            onAddOpening('window', x_cm - 60, 120)
          } else {
            onAddUtility('water', x_cm) // default utility if no modifier
          }
        }
      }}
    >
      <Layer listening={false}>{gridLines}</Layer>
      <Layer>
        <Rect x={0} y={0} width={size.w} height={size.h} stroke="#111" strokeWidth={2} />
        <Line points={[0, 20, size.w, 20]} stroke="#444" />
        <KText x={4} y={2} text={`0 cm`} fontSize={12} fill="#444" />
        <KText x={size.w - 40} y={2} text={`${width} cm`} fontSize={12} fill="#444" />
        {room.openings.map(o => {
          const x = o.offset_cm * pxPerCm
          const w = o.width_cm * pxPerCm
          return <Rect key={o.id} x={x} y={0} width={w} height={10} fill={o.type === 'window' ? '#06b6d4' : '#0ea5e9'} />
        })}
        {room.utilities.map(u => {
          const x = u.offset_cm * pxPerCm
          const color = u.type === 'water' ? '#3b82f6' : u.type === 'drain' ? '#a855f7' : u.type === 'power' ? '#f59e0b' : u.type === 'vent' ? '#64748b' : '#ef4444'
          return <Circle key={u.id} x={x} y={14} radius={6} fill={color} stroke="#1f2937" />
        })}
      </Layer>
    </Stage>
  )
}
