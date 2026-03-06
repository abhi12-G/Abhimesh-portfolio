import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

export function initThreeHeroScene(selector = "#heroThreeScene") {
    const container = document.querySelector(selector);
    if (!container) return null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        46,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 0.2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x9abfff, 0.5));

    const keyLight = new THREE.PointLight(0x59b6ff, 1.5, 30);
    keyLight.position.set(4, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x2d5cff, 1.2, 24);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const globeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x7dbfff,
        roughness: 0.1,
        metalness: 0.26,
        transmission: 0.62,
        thickness: 1.3,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9
    });

    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 48), globeMaterial);
    heroGroup.add(globe);

    const globeWire = new THREE.Mesh(
        new THREE.SphereGeometry(1.17, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0x69c4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        })
    );
    heroGroup.add(globeWire);

    const orbGeometry = new THREE.IcosahedronGeometry(0.13, 0);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0x7fd1ff,
        metalness: 0.7,
        roughness: 0.2
    });

    const floatingObjects = [];
    for (let i = 0; i < 16; i += 1) {
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        const angle = (i / 16) * Math.PI * 2;
        const radius = 1.8 + (i % 3) * 0.28;
        orb.position.set(
            Math.cos(angle) * radius,
            (i % 4) * 0.22 - 0.32,
            Math.sin(angle) * radius
        );
        heroGroup.add(orb);
        floatingObjects.push({ mesh: orb, baseY: orb.position.y, speed: 0.7 + (i % 5) * 0.12 });
    }

    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
        const i3 = i * 3;
        starPositions[i3] = (Math.random() - 0.5) * 30;
        starPositions[i3 + 1] = (Math.random() - 0.5) * 20;
        starPositions[i3 + 2] = (Math.random() - 0.5) * 30;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0xb8dcff,
            size: 0.06,
            transparent: true,
            opacity: 0.82
        })
    );
    scene.add(stars);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
        const t = clock.getElapsedTime();

        heroGroup.rotation.y += 0.0026;
        globe.rotation.y = t * 0.2;
        globe.rotation.x = Math.sin(t * 0.5) * 0.08;
        globeWire.rotation.y = -t * 0.25;

        floatingObjects.forEach((item, idx) => {
            item.mesh.position.y = item.baseY + Math.sin(t * item.speed + idx) * 0.08;
            item.mesh.rotation.x += 0.01;
            item.mesh.rotation.y += 0.01;
        });

        stars.rotation.y = t * 0.015;

        const targetCamX = pointer.x * 0.7;
        const targetCamY = -pointer.y * 0.45 + 0.2;
        camera.position.x += (targetCamX - camera.position.x) * 0.04;
        camera.position.y += (targetCamY - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(animate);
    };

    animate();

    const cleanup = () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        container.removeEventListener("pointermove", onPointerMove);
        renderer.dispose();
        globe.geometry.dispose();
        globeWire.geometry.dispose();
        orbGeometry.dispose();
        starGeometry.dispose();
        globeMaterial.dispose();
        orbMaterial.dispose();
    };

    window.addEventListener("beforeunload", cleanup, { once: true });
    return cleanup;
}
