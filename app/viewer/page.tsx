// SERVER redirect page — no prerender, no client code at build-time
export const dynamic = 'force-dynamic'
export const prerender = false
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { redirect } from 'next/navigation'

export default function ViewerPage() {
  // At request-time, just send the browser to the static viewer
  redirect('/viewer.html')
}
