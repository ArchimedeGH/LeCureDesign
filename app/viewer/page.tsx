// SERVER component: holds route config
export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'

// Load the client-only R3F canvas on the browser only
const ViewerCanvas = dynamic(() => import('./ViewerCanvas'), { ssr: false })

export default function ViewerPage() {
  return <ViewerCanvas />
}
