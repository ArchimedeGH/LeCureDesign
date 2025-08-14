import { NextRequest, NextResponse } from 'next/server'
import { Room, Proposal, Cabinet, Appliance, SolveRequest } from '../../lib/types'

function id() { return Math.random().toString(36).slice(2,9) }
const BASE_D = 60
const TALL_H = 210
const clamp = (v:number,min:number,max:number)=> Math.max(min, Math.min(max, v))

function fillRun(start:number, end:number, reserved: {x:number; w:number}[]) {
  const widths = [90, 80, 60, 40, 20]
  const blocks: { x:number; w:number }[] = []
  let x = start
  const res = [...reserved].sort((a,b)=>a.x-b.x)
  let ri = 0
  while (x < end - 20) {
    if (ri < res.length && x + 20 > res[ri].x) { x = res[ri].x + res[ri].w; ri++; continue }
    let placed = false
    for (const w of widths) {
      const fits = x + w <= end && !(ri < res.length && x + w > res[ri].x)
      if (fits) { blocks.push({ x, w }); x += w; placed = true; break }
    }
    if (!placed) break
  }
  return blocks
}

function scoreProposal(p: Proposal) {
  const sink = p.appliances.find(a=>a.type==='sink')!
  const hob = p.appliances.find(a=>a.type==='hob')!
  const fridge = p.appliances.find(a=>a.type==='fridge')!
  const triangle = Math.abs(hob.x_cm - sink.x_cm) + Math.abs(fridge.x_cm - sink.x_cm) + Math.abs(fridge.x_cm - hob.x_cm)
  const prep = Math.abs(hob.x_cm - sink.x_cm) - 60
  const continuity = Math.max(0, prep)
  const triangleTarget = 500 // cm
  const triScore = 1 - Math.abs(triangle - triangleTarget)/triangleTarget
  p.score = Math.max(0, triScore)*0.5 + Math.min(1, continuity/160)*0.5
  return p
}

function solve(room: Room, mode: 'flex'|'fixed'): Proposal {
  const runLen = room.width_cm
  const start = 0, end = runLen
  const windows = room.openings.filter(o=>o.type==='window')
  const doors   = room.openings.filter(o=>o.type==='door')
  const reserved = doors.map(d=>({ x: d.offset_cm, w: d.width_cm }))
  const win = windows.sort((a,b)=>b.width_cm - a.width_cm)[0]
  const sinkX = clamp(win ? win.offset_cm + win.width_cm/2 - 30 : runLen/2 - 30, start, end-60)
  const fridge: Appliance = { id: id(), type:'fridge', w_cm:60, d_cm:60, x_cm: 0, y_cm: 0 }

  let hobX = clamp(Math.max(sinkX + 160, 200), start+120, end-90)
  if (mode==='fixed') {
    const power = room.utilities.find(u=>u.type==='power')
    if (power) hobX = clamp(power.offset_cm - 40, start+60, end-90)
  }
  const hob: Appliance = { id: id(), type:'hob', w_cm:80, d_cm:60, x_cm: hobX, y_cm: 0 }
  const dwRight = sinkX + 60 <= end - 60
  const dw: Appliance = { id: id(), type:'dw', w_cm:60, d_cm:60, x_cm: dwRight ? sinkX + 60 : clamp(sinkX - 60, start, end-60), y_cm: 0 }
  const oven: Appliance = { id: id(), type:'oven', w_cm:60, d_cm:60, x_cm: hobX, y_cm: 0 }
  const hood: Appliance = { id: id(), type:'hood', w_cm:90, d_cm:40, x_cm: hobX, y_cm: 0 }
  const sink: Appliance = { id: id(), type:'sink', w_cm:60, d_cm:60, x_cm: sinkX, y_cm: 0 }

  const res = [...reserved, { x: sinkX, w: 60 }, { x: hobX, w: 80 }, { x: dw.x_cm, w: 60 }, { x: 0, w: 60 }]
  const bases = fillRun(start, end, res).map(b => ({ id:id(), kind:'base' as const, w_cm:b.w, d_cm:BASE_D, h_cm:75, x_cm:b.x, y_cm:0 }))
  const talls: Cabinet[] = [{ id:id(), kind:'tall', w_cm:60, d_cm:60, h_cm:TALL_H, x_cm:0, y_cm:0 }]

  const cabinets: Cabinet[] = [...bases, ...talls]
  const apps: Appliance[] = [fridge, sink, hob, oven, hood, dw]
  const prop: Proposal = { id:id(), mode, score:0, cabinets, appliances: apps, summary: { run:'single', uninterrupted_prep_cm: Math.max(0, Math.abs(hobX - sinkX) - 60) } }
  return scoreProposal(prop)
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SolveRequest
  const p1 = solve(body.room, body.mode)
  const mirrored: Proposal = JSON.parse(JSON.stringify(p1))
  mirrored.id = id()
  for (const a of mirrored.appliances) a.x_cm = body.room.width_cm - a.x_cm - a.w_cm
  for (const c of mirrored.cabinets)  c.x_cm = body.room.width_cm - c.x_cm - c.w_cm
  const proposals = [p1, scoreProposal(mirrored)]
  return NextResponse.json({ proposals })
}
