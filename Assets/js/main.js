/* Shared site behaviour. The original shader is served from local files only. */
(() => {
  const snoise = `vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;} vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);} float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}`;
  const vertexShader = `${snoise}uniform float u_time;uniform vec2 u_randomisePosition;varying float vDistortion;varying float xDistortion;varying vec2 vUv;void main(){vUv=uv;vDistortion=snoise(vUv.xx*3.-u_randomisePosition*.15);xDistortion=snoise(vUv.yy*1.-u_randomisePosition*.05);vec3 pos=position;pos.z+=(vDistortion*35.);pos.x+=(xDistortion*25.);gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);}`;
  const fragmentShader = `${snoise}vec3 rgb(float r,float g,float b){return vec3(r/255.,g/255.,b/255.);}uniform vec3 u_bg;uniform vec3 u_bgMain;uniform vec3 u_color1;uniform vec3 u_color2;uniform float u_time;varying vec2 vUv;varying float vDistortion;void main(){vec3 bg=rgb(u_bg.r,u_bg.g,u_bg.b);vec3 c1=rgb(u_color1.r,u_color1.g,u_color1.b);vec3 c2=rgb(u_color2.r,u_color2.g,u_color2.b);vec3 bgMain=rgb(u_bgMain.r,u_bgMain.g,u_bgMain.b);float noise1=snoise(vUv+u_time*.08);float noise2=snoise(vUv*2.+u_time*.1);vec3 color=mix(bg,c1,noise1*.6);color=mix(color,c2,noise2*.4);color=mix(color,mix(c1,c2,vUv.x),vDistortion);float border=smoothstep(.1,.6,vUv.x);color=mix(color,bgMain,1.-border);gl_FragColor=vec4(color,1.);}`;

  const initialiseNavigation = () => {
    const button = document.querySelector("[data-menu-button]");
    const menu = document.querySelector("[data-menu]");
    if (!button || !menu) return;
    const close = () => {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation");
      menu.classList.remove("is-open");
    };
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      button.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      menu.classList.toggle("is-open", !isOpen);
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("click", (event) => { if (!menu.contains(event.target) && !button.contains(event.target)) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  };

  const initialisePageLinks = () => {
    if (!document.querySelector(".site-transition")) {
      const layer = document.createElement("div");
      layer.className = "site-transition";
      layer.setAttribute("aria-hidden", "true");
      document.body.append(layer);
    }
    document.querySelectorAll("a.site-page-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = new URL(link.href, window.location.href);
        if (target.href === window.location.href) return;
        event.preventDefault();
        document.body.classList.add("site-is-leaving");
        window.setTimeout(() => { window.location.href = target.href; }, 420);
      });
    });
    window.addEventListener("pageshow", () => document.body.classList.remove("site-is-leaving"));
  };

  const initialiseBackground = async () => {
    if (document.body.classList.contains("project-page")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const THREE = await import("./vendor/three.module.js");
    if (document.querySelector(".site-background")) return;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.domElement.className = "site-background";
    renderer.domElement.setAttribute("aria-hidden", "true");
    document.body.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 5;
    let vCheck = false;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_bg: { value: new THREE.Vector3(100, 100, 100) }, u_bgMain: { value: new THREE.Vector3(100, 100, 100) },
        u_color1: { value: new THREE.Vector3(100, 100, 100) }, u_color2: { value: new THREE.Vector3(100, 100, 100) },
        u_time: { value: 30 }, u_randomisePosition: { value: new THREE.Vector2(1, 2) }
      }, fragmentShader, vertexShader
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(innerWidth / 2, 400, 100, 100), material);
    mesh.position.set(-20, 0, -280); mesh.scale.multiplyScalar(2); mesh.rotationX = -1; mesh.rotationZ = .1; scene.add(mesh);
    const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
    resize(); addEventListener("resize", resize, { passive: true });
    const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const R = (x, y, time) => Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + time));
    const G = (x, y, time) => Math.floor(192 + 64 * Math.sin((x * x * Math.cos(time / 4) + y * y * Math.sin(time / 3)) / 300));
    const B = (x, y, time) => Math.floor(192 + 64 * Math.sin(5 * Math.sin(time / 9) + ((x - 100) ** 2 + (y - 100) ** 2) / 1100));
    let time = 0, j = 0, x = randomInteger(0, 32); const y = randomInteger(0, 32);
    const animate = () => {
      requestAnimationFrame(animate); renderer.render(scene, camera);
      material.uniforms.u_randomisePosition.value = new THREE.Vector2(j, j);
      material.uniforms.u_color1.value = new THREE.Vector3(R(x, y, time / 2), G(x, y, time / 2), B(x, y, time / 2));
      material.uniforms.u_time.value = time;
      if (time % .1 === 0) { if (!vCheck) { x -= 1; if (x <= 0) vCheck = true; } else { x += 1; if (x >= 32) vCheck = false; } }
      j += .01; time += .05;
    };
    animate();
  };

  const boot = () => { initialiseNavigation(); initialisePageLinks(); initialiseBackground().catch(() => {}); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot();
})();
