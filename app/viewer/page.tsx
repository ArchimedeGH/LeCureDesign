'use client'
import { Canvas } from '@react-three/fiber'
// importa dai sotto-moduli di drei per evitare Bvh
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei/core/AccumulativeShadows'
import { Environment } from '@react-three/drei/core/Environment'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import * as THREE from 'three'
import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { Proposal } from '../lib/types'

function CabinetBox({
  w, d, h, oak=false, pos:[x,y,z]
}:{
  w:number; d:number; h:number; oak?:boolean; pos:[number,number,number]
}){
  const geom = useMemo(()=> new THREE.BoxGeometry(w/100, h/100, d/100), [w,d,h])
  const matWhite = useMemo(()=> new THREE.MeshStandardMaterial({ color:'#f5f5f5', metalness:0, roughness:0.8 }), [])
  const matOak = useMemo(()=> new THREE.MeshStandardMaterial({ color:'#d9c3a1', metalness:0.1, roughness:0.6 }), [])
  return <mesh geometry={geom} position={[x, y, z]} material={oak? matOak : matWhite} castShadow receiveShadow />
}

function Scene({ proposal }: { proposal: Proposal }){
  const boxes: ReactElement[] = []
  for (const c of proposal.cabinets) {
    const h = c.kind==='tall'? 2.1 : 0.75
    const y = h/2
    boxes.push(<CabinetBox key={c.id} w={c.w_cm} d={c.d_cm} h={h*100} pos={[ (c.x_cm + c.w_cm/2)/100, y, 0.30 ]} />)
  }
  const totalW = proposal.cabinets.filter(c=>c.kind==='base').reduce((s,c)=>s+c.w_cm,0)
  boxes.push(<CabinetBox key="oak" w={totalW} d={63} h={4} oak pos={[ (totalW/2)/100, (0.75+0.02), 0.30 ]} />)
  return <group>{boxes}</group>
}

export default function Viewer(){
  const [proposal, setProposal] = useState<Proposal | null>(null)
  useEffect(()=>{ const arr = JSON.parse(localStorage.getItem('skp_proposals')||'[]') as Proposal[]; if (arr[0]) setProposal(arr[0]) },[])
  return (
    <main style={{ height:'100vh' }}>
      <Canvas
        shadows
        onCreated={({ gl }) => {
          // three r154+: physicallyCorrectLights rimosso (comportamento fisico di default)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}>
        <color attach="background" args={["#fafafa"]} />
        <ambientLight intensity={0.2} />
        <AccumulativeShadows frames={60} temporal position={[0,0,0]}>
          <RandomizedLight amount={8} radius={8} intensity={0.7} position={[5,5,5]} />
        </AccumulativeShadows>
        <Environment preset="apartment" />
        <OrbitControls makeDefault />
        {proposal && <Scene proposal={proposal} />}
      </Canvas>
    </main>
  )
}
