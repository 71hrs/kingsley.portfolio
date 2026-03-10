import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rgb(r, g, b) {
    return new THREE.Vector3(r / 255, g / 255, b / 255);
}

document.addEventListener("DOMContentLoaded", function () {
    const snoiseEl = document.querySelector('#snoise-function');
    const fragmentEl = document.querySelector('#fragment-shader');
    const vertexEl = document.querySelector('#vertex-shader');

    if (!snoiseEl || !fragmentEl || !vertexEl) {
        console.error('Shader script tags not found.');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    let vCheck = false;
    camera.position.z = 5;

    const randomisePosition = new THREE.Vector2(1, 2);

    const R = function (x, y, t) {
        return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
    };

    const G = function (x, y, t) {
        return Math.floor(
            192 + 64 * Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300)
        );
    };

    const B = function (x, y, t) {
        return Math.floor(
            192 + 64 * Math.sin(5 * Math.sin(t / 9) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100)
        );
    };

    const sNoise = snoiseEl.textContent;

    const geometry = new THREE.PlaneGeometry(window.innerWidth / 2, 400, 100, 100);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_bg: { value: rgb(100, 100, 100) },
            u_bgMain: { value: rgb(100, 100, 100) },
            u_color1: { value: rgb(100, 100, 100) },
            u_color2: { value: rgb(100, 100, 100) },
            u_time: { value: 30 },
            u_randomisePosition: { value: randomisePosition }
        },
        fragmentShader: sNoise + fragmentEl.textContent,
        vertexShader: sNoise + vertexEl.textContent
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-20, 0, -280);
    mesh.scale.multiplyScalar(2);
    mesh.rotation.x = -1.0;
    mesh.rotation.y = 0.0;
    mesh.rotation.z = 0.1;
    scene.add(mesh);

    let t = 0;
    let j = 0;
    let x = randomInteger(0, 32);
    let y = randomInteger(0, 32);

    function animate() {
        requestAnimationFrame(animate);

        material.uniforms.u_randomisePosition.value.set(j, j);
        material.uniforms.u_color1.value.set(
            R(x, y, t / 2) / 255,
            G(x, y, t / 2) / 255,
            B(x, y, t / 2) / 255
        );
        material.uniforms.u_time.value = t;

        if (vCheck === false) {
            x -= 1;
            if (x <= 0) vCheck = true;
        } else {
            x += 1;
            if (x >= 32) vCheck = false;
        }

        j += 0.01;
        t += 0.05;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});