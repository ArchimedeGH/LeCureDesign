// SERVER component: route config + explicit dynamic hint
export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'
import { headers } from 'next/headers' // ⬅ forces dynamic rendering (no SSG)

// Load the client-only R3F canvas on the browser only
const ViewerCanvas = dynamic(() => import('./ViewerCanvas'), { ssr: false })

export default function ViewerPage() {
  // This call marks the page as dynamic for the build pipeline
  headers()
  return <ViewerCanvas />
}
