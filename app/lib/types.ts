export type Opening = {
  id: string
  wallId: 'north' | 'south' | 'east' | 'west'
  offset_cm: number
  width_cm: number
  height_cm: number
  sill_cm: number
  type: 'door' | 'window'
}

export type Utility = {
  id: string
  type: 'water' | 'drain' | 'power' | 'vent' | 'gas'
  wallId: 'north' | 'south' | 'east' | 'west'
  offset_cm: number
  movable: boolean
}

export type Room = {
  id: string
  width_cm: number
  depth_cm: number
  height_cm?: number
  openings: Opening[]
  utilities: Utility[]
}

export type Cabinet = {
  id: string
  kind: 'base' | 'wall' | 'tall' | 'corner'
  w_cm: number
  d_cm: number
  h_cm: number
  x_cm: number
  y_cm: number
}

export type Appliance = {
  id: string
  type: 'sink' | 'hob' | 'oven' | 'fridge' | 'dw' | 'hood'
  w_cm: number
  d_cm: number
  x_cm: number
  y_cm: number
}

export type Proposal = {
  id: string
  mode: 'flex' | 'fixed'
  score: number
  cabinets: Cabinet[]
  appliances: Appliance[]
  summary: Record<string, any>
}

export type SolveRequest = { room: Room; mode: 'flex' | 'fixed' }
