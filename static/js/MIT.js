import * as THREE from 'https://cdn.skypack.dev/three@v0.122.0';

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rgb(r, g, b) {
  return new THREE.Vector3(r, g, b);
}

document.addEventListener('DOMContentLoaded', function () {
  // === Renderer ===
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // 关键：让 CSS 接管可视尺寸（避免撑出 1px）
  // 把画布固定在视口，不参与文档流高度计算
  const canvas = renderer.domElement;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100dvh'; // 现代视口高度，避免 100vh 地址栏误差
  canvas.style.display = 'block';
  // 如需点击穿透（不挡页面交互），保留下一行；若需要交互可注释掉
  canvas.style.pointerEvents = 'none';

  document.body.appendChild(canvas);

  // 分辨率：更清晰，不影响 CSS 尺寸
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // === Scene / Camera ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  let vCheck = false;
  let sNoise = document.querySelector('#snoise-function').textContent;

  // === Geometry / Material / Mesh ===
  // 这里的平面本身不会影响页面高度（因为 canvas 已经 fixed）
  let geometry = new THREE.PlaneGeometry(window.innerWidth / 2, 400, 100, 100);
  let material = new THREE.ShaderMaterial({
    uniforms: {
      u_bg: { type: 'v3', value: rgb(100, 100, 100) },
      u_bgMain: { type: 'v3', value: rgb(100, 100, 100) },
      u_color1: { type: 'v3', value: rgb(100, 100, 100) },
      u_color2: { type: 'v3', value: rgb(100, 100, 100) },
      u_time: { type: 'f', value: 30 },
      u_randomisePosition: {
        type: 'v2',
        value: new THREE.Vector2(1, 2),
      },
    },
    fragmentShader:
      sNoise + document.querySelector('#fragment-shader').textContent,
    vertexShader:
      sNoise + document.querySelector('#vertex-shader').textContent,
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-20, 0, -280);
  mesh.scale.multiplyScalar(2);
  mesh.rotationX = -1.0;
  mesh.rotationY = 0.0;
  mesh.rotationZ = 0.1;
  scene.add(mesh);

  // === 尺寸同步（只改缓冲区，不改 DOM/CSS 尺寸） ===
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false); // 关键：第三个参数 false，不写入 canvas.style
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // === 动画 ===
  let t = 0;
  let j = 0;
  let x = randomInteger(0, 32);
  let y = randomInteger(0, 32);

  function animate() {
    requestAnimationFrame(animate);

    mesh.material.uniforms.u_randomisePosition.value = new THREE.Vector2(j, j);
    mesh.material.uniforms.u_color1.value = new THREE.Vector3(
      R(x, y, t / 2),
      G(x, y, t / 2),
      B(x, y, t / 2)
    );
    mesh.material.uniforms.u_time.value = t;

    if (t % 0.1 === 0) {
      if (vCheck === false) {
        x -= 1;
        if (x <= 0) vCheck = true;
      } else {
        x += 1;
        if (x >= 32) vCheck = false;
      }
    }

    j = j + 0.01;
    t = t + 0.05;

    renderer.render(scene, camera);
  }

  // 原来的 R/G/B 函数保持一致
  function R(x, y, t) {
    return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
  }
  function G(x, y, t) {
    return Math.floor(
      192 +
        64 *
          Math.sin(
            ((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300)
          )
    );
  }
  function B(x, y, t) {
    return Math.floor(
      192 +
        64 *
          Math.sin(
            5 * Math.sin(t / 9) +
              ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100
          )
    );
  }

  animate();
});