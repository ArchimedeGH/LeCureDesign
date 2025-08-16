// SERVER layout for /viewer — ensures no prerender
export const dynamic = 'force-dynamic'

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
