import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeCureDesign — Scandinavian Kitchen Planner',
  description: 'Modeler • Solver • 3D • PDF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        {children}
      </body>
    </html>
  )
}
