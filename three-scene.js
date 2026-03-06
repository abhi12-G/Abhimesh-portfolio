import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("heroThreeScene");

if (container) {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
        48,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.6;
    controls.maxDistance = 8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.62;

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x69b8ff, 1.9, 22);
    keyLight.position.set(3.4, 2.8, 3.4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x3f87ff, 0.85, 18);
    rimLight.position.set(-4, -2.4, -1.4);
    scene.add(rimLight);

    const knotGeometry = new THREE.TorusKnotGeometry(1.35, 0.38, 280, 36);

    const knotMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x76baff,
        roughness: 0.08,
        metalness: 0.22,
        transmission: 0.78,
        thickness: 1.7,
        ior: 1.22,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.92
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(knot);

    const wireframe = new THREE.Mesh(
        knotGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x65bcff,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        })
    );
    wireframe.scale.setScalar(1.002);
    scene.add(wireframe);

    const clock = new THREE.Clock();
    const pointer = { x: 0, y: 0 };
    let rafId = 0;

    const animate = () => {
        const t = clock.getElapsedTime();
        const targetX = pointer.y * 0.22;
        const targetZ = pointer.x * 0.2;

        knot.rotation.y += 0.0032;
        knot.rotation.x = THREE.MathUtils.lerp(knot.rotation.x, targetX, 0.06);
        knot.rotation.z = THREE.MathUtils.lerp(knot.rotation.z, targetZ, 0.06);

        wireframe.rotation.copy(knot.rotation);

        controls.update();
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(animate);
    };

    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    const onPointerMove = (event) => {
        const rect = container.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = (event.clientY - rect.top) / rect.height;

        pointer.x = nx * 2 - 1;
        pointer.y = ny * 2 - 1;

        keyLight.position.x = (nx - 0.5) * 7;
        keyLight.position.y = (0.5 - ny) * 4.8;
    };

    window.addEventListener("resize", onResize);
    container.addEventListener("pointermove", onPointerMove);

    animate();

    window.addEventListener("beforeunload", () => {
        window.cancelAnimationFrame(rafId);
        container.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        controls.dispose();
        knotGeometry.dispose();
        knotMaterial.dispose();
        renderer.dispose();
    });
}
