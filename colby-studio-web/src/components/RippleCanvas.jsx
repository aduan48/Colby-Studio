import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MAX_PULSES = 6;

// --- Shaders Block ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidShader = `
  #define MAX_PULSES ${MAX_PULSES}

  uniform float iTime;
  uniform vec2 iResolution;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uFluidDecay;
  uniform float uTrailLength;

  // Each pulse: x, y (sim pixels), age (seconds), active (0 or 1)
  uniform vec4 uPulses[MAX_PULSES];
  uniform float uPulseSpeed;    // sim pixels per second
  uniform float uPulseWidth;    // ring thickness, sim pixels
  uniform float uPulseSpacing;  // gap between concentric rings, sim pixels
  uniform float uPulseLife;     // seconds until a pulse fully fades
  uniform float uPulseStrength;

  varying vec2 vUv;

  vec2 ur, U;

  vec4 t(vec2 v, int a, int b) {
      return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur));
  }

  vec4 t(vec2 v) {
      return texture2D(iPreviousFrame, fract(v/ur));
  }

  float area(vec2 a, vec2 b, vec2 c) {
      float A = length(b-c), B = length(c-a), C = length(a-b), s = 0.5*(A+B+C);
      return sqrt(s*(s-A)*(s-B)*(s-C));
  }

  void main() {
      U = vUv * iResolution;
      ur = iResolution.xy;

      if (iFrame < 1) {
          float w = 0.5+sin(0.2*U.x)*0.5;
          float q = length(U-0.5*ur);
          gl_FragColor = vec4(0.1*exp(-0.001*q*q),0,0,w);
          return;
      }

      vec2 v = U,
           A = v + vec2( 1, 1),
           B = v + vec2( 1,-1),
           C = v + vec2(-1, 1),
           D = v + vec2(-1,-1);

      for (int i = 0; i < 8; i++) {
          v -= t(v).xy;
          A -= t(A).xy;
          B -= t(B).xy;
          C -= t(C).xy;
          D -= t(D).xy;
      }

      vec4 me = t(v);
      vec4 n = t(v, 0, 1),
           e = t(v, 1, 0),
           s = t(v, 0, -1),
           w = t(v, -1, 0);
      vec4 ne = .25*(n+e+s+w);
      me = mix(t(v), ne, vec4(0.15,0.15,0.95,0.));
      me.z = me.z - 0.01*((area(A,B,C)+area(B,C,D))-4.);

      vec4 pr = vec4(e.z,w.z,n.z,s.z);
      me.xy = me.xy + 100.*vec2(pr.x-pr.y, pr.z-pr.w)/ur;

      me.xy *= uFluidDecay;
      me.z *= uTrailLength;

      // --- Sound-wave pulses: push fluid outward along expanding rings ---
      for (int i = 0; i < MAX_PULSES; i++) {
          vec4 p = uPulses[i];
          if (p.w < 0.5) continue;

          vec2 d = U - p.xy;
          float dist = length(d);
          if (dist < 0.001) continue;
          vec2 dir = d / dist;

          float age = p.z;
          float radius = age * uPulseSpeed;
          float life = clamp(age / uPulseLife, 0.0, 1.0);
          float fade = (1.0 - life) * (1.0 - life);   // eases out

          // three concentric rings, each a little weaker
          float ring = 0.0;
          for (int k = 0; k < 3; k++) {
              float r = radius - float(k) * uPulseSpacing;
              if (r <= 0.0) continue;
              float x = (dist - r) / uPulseWidth;
              ring += exp(-x * x) * (1.0 - float(k) * 0.3);
          }

          me.xy += uPulseStrength * fade * ring * dir;
      }

      gl_FragColor = clamp(me, -0.4, 0.4);
  }
`;

const displayShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform float uDistortionAmount;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uColorIntensity;
  uniform float uSoftness;
  varying vec2 vUv;

  void main() {
    vec2 fragCoord = vUv * iResolution;
    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;

    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    uv += fluidVel * (0.5 * uDistortionAmount);

    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;

    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
    float mixer3 = sin(d + a) * 0.5 + 0.5;

    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);

    vec3 col = mix(uColor1, uColor2, mixer1);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);

    col *= uColorIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Base default settings
const defaultConfig = {
  distortionAmount: 2.5,
  fluidDecay: 0.98,
  trailLength: 0.8,

  // Pulses (sizes in screen pixels; converted to sim pixels below)
  pulseEveryMin: 1.5,   // seconds between pulses (random in this range)
  pulseEveryMax: 3.5,
  pulseLife: 4.0,       // seconds a pulse lasts
  pulseSpeed: 220,      // px per second the rings travel
  pulseWidth: 18,       // ring thickness in px
  pulseSpacing: 45,     // gap between rings in px
  pulseStrength: 0.04,  // how hard rings push the fluid

  color1: "#1a1a1a",
  color2: "#2a2a2a",
  color3: "#000000",
  color4: "#545454",
  colorIntensity: 1.0,
  softness: 1.0,
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const rand = (min, max) => min + Math.random() * (max - min);

export default function RippleCanvas({ colors = {} }) {
  const canvasContainerRef = useRef(null);
  const displayMaterialRef = useRef(null);

  const c1 = colors.color1 || defaultConfig.color1;
  const c2 = colors.color2 || defaultConfig.color2;
  const c3 = colors.color3 || defaultConfig.color3;
  const c4 = colors.color4 || defaultConfig.color4;

  const colorsRef = useRef({ c1, c2, c3, c4 });

  useEffect(() => {
    colorsRef.current = { c1, c2, c3, c4 };
    const m = displayMaterialRef.current;
    if (!m) return;
    m.uniforms.uColor1.value.set(...hexToRgb(c1));
    m.uniforms.uColor2.value.set(...hexToRgb(c2));
    m.uniforms.uColor3.value.set(...hexToRgb(c3));
    m.uniforms.uColor4.value.set(...hexToRgb(c4));
  }, [c1, c2, c3, c4]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const SIM_SCALE = 0.5;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let simWidth = Math.max(1, Math.round(width * SIM_SCALE));
    let simHeight = Math.max(1, Math.round(height * SIM_SCALE));

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const targetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    let fluidTarget1 = new THREE.WebGLRenderTarget(simWidth, simHeight, targetOptions);
    let fluidTarget2 = new THREE.WebGLRenderTarget(simWidth, simHeight, targetOptions);

    let currentFluidTarget = fluidTarget1;
    let previousFluidTarget = fluidTarget2;
    let frameCount = 0;

    // Pulse slots on the JS side; mirrored into the uPulses uniform each frame
    const pulses = Array.from({ length: MAX_PULSES }, () => ({
      x: 0, y: 0, start: 0, active: false,
    }));
    const pulseUniform = Array.from({ length: MAX_PULSES }, () => new THREE.Vector4());

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(simWidth, simHeight) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uFluidDecay: { value: defaultConfig.fluidDecay },
        uTrailLength: { value: defaultConfig.trailLength },
        uPulses: { value: pulseUniform },
        uPulseSpeed: { value: defaultConfig.pulseSpeed * SIM_SCALE },
        uPulseWidth: { value: defaultConfig.pulseWidth * SIM_SCALE },
        uPulseSpacing: { value: defaultConfig.pulseSpacing * SIM_SCALE },
        uPulseLife: { value: defaultConfig.pulseLife },
        uPulseStrength: { value: defaultConfig.pulseStrength },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iFluid: { value: null },
        uDistortionAmount: { value: defaultConfig.distortionAmount },
        uColor1: { value: new THREE.Vector3(...hexToRgb(colorsRef.current.c1)) },
        uColor2: { value: new THREE.Vector3(...hexToRgb(colorsRef.current.c2)) },
        uColor3: { value: new THREE.Vector3(...hexToRgb(colorsRef.current.c3)) },
        uColor4: { value: new THREE.Vector3(...hexToRgb(colorsRef.current.c4)) },
        uColorIntensity: { value: defaultConfig.colorIntensity },
        uSoftness: { value: defaultConfig.softness },
      },
      vertexShader,
      fragmentShader: displayShader,
    });

    displayMaterialRef.current = displayMaterial;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);

    // --- Pulse spawning ---
    const spawnPulse = (now) => {
      // reuse a free slot, or the oldest one if all are busy
      let slot = pulses.find((p) => !p.active);
      if (!slot) slot = pulses.reduce((a, b) => (a.start < b.start ? a : b));

      // keep spawns a little away from the edges
      slot.x = rand(0.1, 0.9) * simWidth;
      slot.y = rand(0.1, 0.9) * simHeight;
      slot.start = now;
      slot.active = true;
    };

    let nextPulseAt = 0.5; // first pulse half a second after load
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const time = performance.now() * 0.001;
      fluidMaterial.uniforms.iTime.value = time;
      displayMaterial.uniforms.iTime.value = time;
      fluidMaterial.uniforms.iFrame.value = frameCount;

      if (nextPulseAt <= 0.5 && frameCount === 0) nextPulseAt = time + 0.5;

      if (time >= nextPulseAt) {
        spawnPulse(time);
        nextPulseAt = time + rand(defaultConfig.pulseEveryMin, defaultConfig.pulseEveryMax);
      }

      // update pulse ages and retire finished ones
      pulses.forEach((p, i) => {
        const age = time - p.start;
        if (p.active && age > defaultConfig.pulseLife) p.active = false;
        pulseUniform[i].set(p.x, p.y, age, p.active ? 1 : 0);
      });

      fluidMaterial.uniforms.iPreviousFrame.value = previousFluidTarget.texture;
      renderer.setRenderTarget(currentFluidTarget);
      renderer.render(fluidPlane, camera);

      displayMaterial.uniforms.iFluid.value = currentFluidTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(displayPlane, camera);

      const temp = currentFluidTarget;
      currentFluidTarget = previousFluidTarget;
      previousFluidTarget = temp;

      frameCount++;
    }

    animate();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        simWidth = Math.max(1, Math.round(width * SIM_SCALE));
        simHeight = Math.max(1, Math.round(height * SIM_SCALE));

        renderer.setSize(width, height);
        fluidMaterial.uniforms.iResolution.value.set(simWidth, simHeight);
        displayMaterial.uniforms.iResolution.value.set(width, height);

        fluidTarget1.setSize(simWidth, simHeight);
        fluidTarget2.setSize(simWidth, simHeight);
        pulses.forEach((p) => (p.active = false)); // old positions no longer fit
        frameCount = 0;
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      displayMaterialRef.current = null;
      geometry.dispose();
      fluidMaterial.dispose();
      displayMaterial.dispose();
      fluidTarget1.dispose();
      fluidTarget2.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className='gradient-canvas' ref={canvasContainerRef}></div>;
}