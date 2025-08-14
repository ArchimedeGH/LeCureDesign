import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Proposal } from '../../lib/types'

export async function POST(req: NextRequest) {
  const { projectName, room, proposal } = await req.json() as {
    projectName: string
    room: { width_cm:number; depth_cm:number }
    proposal: Proposal
  }

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842]) // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const drawText = (t:string, x:number, y:number, s=10) =>
    page.drawText(t,{ x, y, size:s, font, color: rgb(0.1,0.1,0.1) })

  drawText('Scandinavian Kitchen Planner — Spec Pack', 40, 810, 14)
  drawText(`Project: ${projectName}`, 40, 792)

  const margin = 40
  const planW = 515
  const scale = planW / room.width_cm
  const planY = 700

  page.drawRectangle({ x: margin, y: planY - room.depth_cm*scale, width: room.width_cm*scale, height: room.depth_cm*scale, borderColor: rgb(0,0,0), borderWidth: 1 })

  for (const c of proposal.cabinets)
    page.drawRectangle({ x: margin + c.x_cm*scale, y: planY - (c.d_cm*scale), width: c.w_cm*scale, height: c.d_cm*scale, color: rgb(0.95,0.95,0.95), borderColor: rgb(0.2,0.2,0.2), borderWidth: 0.5 })

  for (const a of proposal.appliances)
    page.drawRectangle({ x: margin + a.x_cm*scale, y: planY - (a.d_cm*scale), width: a.w_cm*scale, height: a.d_cm*scale, borderColor: rgb(0.8,0.2,0.2), borderWidth: 0.8 })

  drawText('Legend: gray=cabinets, red=appliances (top view)', margin, planY - room.depth_cm*scale - 14)

  const groups: Record<string, number> = {}
  const add = (k:string)=> groups[k]=(groups[k]||0)+1
  proposal.cabinets.forEach(c=>add(`${c.kind} ${c.w_cm}cm`))
  proposal.appliances.forEach(a=>add(a.type))
  let y = 620
  drawText('Bill of Materials (Counts)', 40, y); y -= 14
  Object.entries(groups).forEach(([k,v])=>{ drawText(`• ${k}: ${v}`, 50, y); y -= 12 })

  const bytes = await pdf.save()
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="plan.pdf"'
    }
  })
}
