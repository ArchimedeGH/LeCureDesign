// SERVER file for /viewer — no prerender
export const dynamic = 'force-dynamic'
export const prerender = false
export const revalidate = 0
export const fetchCache = 'force-no-store'

import dynamic from 'next/dynamic'

// Load the client-only R3F canvas on the browser only
const ViewerCanvas = dynamic(() => import('./ViewerCanvas'), { ssr: false })

export default function ViewerPage() {
  return <ViewerCanvas />
}
