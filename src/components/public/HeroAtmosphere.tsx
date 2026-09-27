import { Canvas } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import { a, useSpring } from '@react-spring/three'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

const FloatingCore = () => {
  const spring = useSpring({
    from: { scale: 0.92 },
    to: { scale: 1.05 },
    loop: { reverse: true },
    config: { tension: 35, friction: 16 },
  })

  return (
    <Float speed={0.7} rotationIntensity={0.2} floatIntensity={0.25}>
      <a.group scale={spring.scale.to((s) => [s, s, s]) as unknown as [number, number, number]}>
        <Sphere args={[1.25, 64, 64]}>
          <meshStandardMaterial color="#5f6a89" metalness={0.5} roughness={0.25} transparent opacity={0.28} />
        </Sphere>
      </a.group>
    </Float>
  )
}

const fallbackStyle = 'absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_65%_40%,rgba(123,136,188,0.2),rgba(6,8,16,0.85)_64%)]'

export const HeroAtmosphere = ({ enabled }: { enabled: boolean }) => {
  const isSmallScreen = window.matchMedia('(max-width: 960px)').matches

  if (!enabled || isSmallScreen) {
    return <div aria-hidden className={fallbackStyle} />
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl">
      <ShaderGradientCanvas>
        <ShaderGradient
          control="query"
          urlString="https://www.shadergradient.co/customize?animate=on&axis=on&brightness=0.9&cAzimuthAngle=180&cDistance=3.2&cPolarAngle=95&cameraZoom=1.2&color1=%230b1020&color2=%231d2236&color3=%231c2f3f&envPreset=city&fov=45&grain=off&lightType=3d&positionX=0&positionY=0&positionZ=0.4&rotationX=5&rotationY=0&rotationZ=-8&shader=defaults&type=sphere"
        />
      </ShaderGradientCanvas>
      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 3, 4]} intensity={4.5} color="#80a4ff" />
        <FloatingCore />
      </Canvas>
    </div>
  )
}
