import { Cabinet, Appliance } from './types'

export function bomFrom(cabs: Cabinet[], apps: Appliance[]) {
  const counts: Record<string, number> = {}
  const add = (k: string, n = 1) => (counts[k] = (counts[k] || 0) + n)

  for (const c of cabs) add(`cab_${c.kind}_${c.w_cm}`, 1)
  for (const a of apps) add(`appl_${a.type}_${(a as any).w_cm ?? 'n'}`, 1)

  const topLm =
    cabs.filter((c) => c.kind === 'base').reduce((m, c) => m + c.w_cm, 0) / 100

  return { counts, countertop_lm: topLm }
}
