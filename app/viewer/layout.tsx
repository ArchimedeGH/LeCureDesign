// SERVER layout for /viewer — block prerender at the segment level too
export const dynamic = 'force-dynamic'
export const prerender = false

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
