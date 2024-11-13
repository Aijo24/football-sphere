'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const Background3D = () => {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mountRef.current) return

        const scene = new THREE.Scene()
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        mountRef.current.appendChild(renderer.domElement)

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
        directionalLight.position.set(5, 5, 5)
        scene.add(directionalLight)

        const loader = new GLTFLoader()
        let model: THREE.Group

        loader.load('/soccer_ball_gltf/scene.gltf', (gltf) => {
            model = gltf.scene
            model.scale.set(2.5, 2.5, 2.5)
            model.position.set(0, -1.5, 0)
            model.rotation.x = 0.5
            scene.add(model)

            const animate = () => {
                requestAnimationFrame(animate)
                model.rotation.y += 0.003
                renderer.render(scene, camera)
            }
            animate()
        })

        camera.position.z = 6

        const handleScroll = () => {
            if (model) {
                const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
                model.position.y = -1.5 + scrollPercent * 3
            }
        }

        window.addEventListener('scroll', handleScroll)

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            handleScroll()
        }
        
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleScroll)
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement)
            }
        }
    }, [])

    return <div ref={mountRef} style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.95,
        mixBlendMode: 'soft-light',
    }} />
}

export default Background3D