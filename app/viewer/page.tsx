'use client'
import nextDynamic from 'next/dynamic'

// prevent SSR/SSG on this page (R3F must run client-side)
export const dynamic = 'force-dynamic'

// load the heavy 3D canvas only on the client
const ViewerCanvas = nextDynamic(() => import('./ViewerCanvas'), { ssr: false })

export default function ViewerPage() {
  return <ViewerCanvas />
}
