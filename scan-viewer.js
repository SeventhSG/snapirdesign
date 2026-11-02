/* Snapir Design BG: WebGL2 scenes.
   Hero: particles assemble into a stone-clad building, then a laser section
         plane turns the cloud into a ray-marched solid. Scroll drives
         the camera and the reconstruction.
   Room: laser rays cast from a fixed scanner into a simulated room, so the
         occlusion shadows behind furniture are real. Drawn on demand. */
'use strict';

(function () {

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const smooth = (a, b, v) => { const k = clamp01((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const mix = (a, b, k) => a + (b - a) * k;

  /* Quality tiers.
     high:   full scene.
     low:    cheaper shader, fewer points, 30 fps cap, no drawing while idle.
     static: no WebGL, a pre-rendered image. For software rendering, very low
             memory, Save-Data and reduced motion.
     The hero also steps down at runtime if frames stay slow. */
  const SMALL = Math.min(innerWidth, innerHeight) < 700;
  let TIER = pickTier();

  function pickTier() {
    const forced = new URLSearchParams(location.search).get('quality');
    if (['high', 'low', 'static'].includes(forced)) return forced;
    const net = navigator.connection || {};
    if (REDUCED || net.saveData || /(^|-)2g$/.test(net.effectiveType || '')) return 'static';
    const memory = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 4;
    if (memory <= 2 || cores <= 2) return 'static';

    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return 'static';
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    if (/SwiftShader|llvmpipe|Software|Basic Render|Mali-(4|T[0-9])|Adreno \(TM\) [1-4]\d\d|PowerVR SGX/i.test(gpu)) return 'static';
    if (SMALL || memory <= 4 || cores <= 4 || /Intel.*HD Graphics|Mali-G[0-5]|Adreno \(TM\) 5\d\d/i.test(gpu)) return 'low';
    return 'high';
  }

  /* Building geometry, in GLSL and JS. Keep the two versions identical.
     Three storeys of stone-clad shell with arched openings, balconies, a
     boundary wall with piers, and an aluminium gate and fence. */
  const PART_GLSL = `
  float sdBox(vec3 p, vec3 b, float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
  float arch(vec2 p,float w,float h){
    float x=abs(p.x);
    return min(max(x-w,max(-p.y,p.y-h)),length(vec2(x,p.y-h))-w);
  }
  float stone(vec3 p){
    float d=sdBox(p-vec3(0.,-.81,0.),vec3(1.45,.02,.85),.004);
    vec3 c=p-vec3(0.,.06,-.46);
    float outer=sdBox(c,vec3(1.05,.86,.4),.004);
    float shell=max(outer,-sdBox(p-vec3(0.,.04,-.46),vec3(.99,.78,.34),0.));
    float b=min(shell,max(abs(abs(p.y-.05)-.26)-.018,outer));
    b=min(b,max(abs(abs(p.x)-.42)-.018,outer));
    b=max(b,-sdBox(p-vec3(0.,.91,-.46),vec3(1.,.03,.35),0.));
    float cell=clamp(floor((p.x+.84)/.42),0.,3.),lx=p.x+.63-.42*cell;
    float k=clamp(floor((p.y+.74)/.52),0.,2.),ly=p.y+.62-.52*k;
    b=max(b,-arch(vec2(lx,ly),.1,.2));
    b=max(b,-max(arch(vec2(p.x,p.y+.78),.13,.24),-.3-p.z));
    d=min(d,b);
    float level=p.y>.05?.31:-.21;
    d=min(d,sdBox(vec3(abs(p.x)-.42,p.y-level,p.z),vec3(.3,.016,.09),.002));
    d=min(d,max(sdBox(p-vec3(0.,-.6,.66),vec3(1.38,.2,.06),.003),.25-abs(p.x)));
    d=min(d,sdBox(vec3(abs(p.x)-.31,p.y+.54,p.z-.66),vec3(.06,.26,.085),.003));
    d=min(d,sdBox(vec3(abs(p.x)-.31,p.y+.272,p.z-.66),vec3(.076,.012,.1),.002));
    d=min(d,sdBox(vec3(abs(p.x)-1.33,p.y+.62,p.z-.3),vec3(.05,.18,.36),.003));
    d=min(d,sdBox(p-vec3(0.,-.775,.16),vec3(.3,.018,.22),.002));
    d=min(d,sdBox(p-vec3(0.,-.745,.09),vec3(.24,.018,.15),.002));
    return d;
  }
  float metal(vec3 p){
    float bnd=min(sdBox(p-vec3(0.,-.5,.66),vec3(1.42,.34,.04),0.),sdBox(p-vec3(0.,.13,.085),vec3(.75,.36,.03),0.));
    if(bnd>.05)return bnd;
    float bar=sdBox(vec3(mod(p.x+.03,.06)-.03,p.y+.325,p.z-.66),vec3(.006,.075,.006),0.);
    float rail=sdBox(vec3(p.x,p.y+.255,p.z-.66),vec3(1.38,.006,.01),0.);
    float d=max(max(min(bar,rail),.37-abs(p.x)),abs(p.x)-1.38);
    float g=sdBox(vec3(mod(p.x+.02,.04)-.02,p.y+.56,p.z-.66),vec3(.006,.23,.006),0.);
    g=min(g,sdBox(vec3(p.x,abs(p.y+.56)-.2,p.z-.66),vec3(.25,.008,.01),0.));
    d=min(d,max(g,abs(p.x)-.25));
    float level=p.y>.05?.31:-.21,ry=p.y-level-.08;
    float r=sdBox(vec3(mod(p.x+.02,.04)-.02,ry,p.z-.085),vec3(.004,.08,.004),0.);
    r=max(r,abs(abs(p.x)-.42)-.3);
    r=min(r,sdBox(vec3(abs(p.x)-.42,ry-.08,p.z-.085),vec3(.3,.005,.007),0.));
    return min(d,r);
  }
  float part(vec3 p){return min(stone(p),metal(p));}`;

  /* Coursed ashlar: mortar mask, per-block random, edge distance. */
  const ASHLAR_GLSL = `
  float h11(float x){return fract(sin(x*127.1)*43758.5453);}
  float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  vec3 ashlar(vec3 p,vec3 n){
    vec2 uv=abs(n.x)>.7?p.zy:(abs(n.y)>.7?p.xz:p.xy);
    const float H=.044;
    float row=floor(uv.y/H),L=.095+.05*h11(row),x=uv.x/L+row*.37,col=floor(x);
    float fx=fract(x)*L,fy=fract(uv.y/H)*H;
    float m=min(min(fx,L-fx),min(fy,H-fy));
    return vec3(smoothstep(.0012,.0034,m),h21(vec2(col,row)),m);
  }`;

  /* Runs in a worker: stringified, so it must stay self-contained. */
  function sampleCloud(count, startSeed, emit) {
    const sdBox = (x, y, z, bx, by, bz, r) => {
      const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
    };
    const arch = (px, py, w, h) => {
      const x = Math.abs(px);
      return Math.min(Math.max(x - w, -py, py - h), Math.hypot(x, py - h) - w);
    };
    const gmod = (a, b) => a - b * Math.floor(a / b);
    const clampTo = (a, lo, hi) => Math.min(hi, Math.max(lo, a));
    const stone = (x, y, z) => {
      let d = sdBox(x, y + 0.81, z, 1.45, 0.02, 0.85, 0.004);
      const outer = sdBox(x, y - 0.06, z + 0.46, 1.05, 0.86, 0.4, 0.004);
      let shell = Math.max(outer, -sdBox(x, y - 0.04, z + 0.46, 0.99, 0.78, 0.34, 0));
      let b = Math.min(shell, Math.max(Math.abs(Math.abs(y - 0.05) - 0.26) - 0.018, outer));
      b = Math.min(b, Math.max(Math.abs(Math.abs(x) - 0.42) - 0.018, outer));
      b = Math.max(b, -sdBox(x, y - 0.91, z + 0.46, 1, 0.03, 0.35, 0));
      const cell = clampTo(Math.floor((x + 0.84) / 0.42), 0, 3), lx = x + 0.63 - 0.42 * cell;
      const k = clampTo(Math.floor((y + 0.74) / 0.52), 0, 2), ly = y + 0.62 - 0.52 * k;
      b = Math.max(b, -arch(lx, ly, 0.1, 0.2));
      b = Math.max(b, -Math.max(arch(x, y + 0.78, 0.13, 0.24), -0.3 - z));
      d = Math.min(d, b);
      const level = y > 0.05 ? 0.31 : -0.21, ax = Math.abs(x);
      d = Math.min(d, sdBox(ax - 0.42, y - level, z, 0.3, 0.016, 0.09, 0.002));
      d = Math.min(d, Math.max(sdBox(x, y + 0.6, z - 0.66, 1.38, 0.2, 0.06, 0.003), 0.25 - ax));
      d = Math.min(d, sdBox(ax - 0.31, y + 0.54, z - 0.66, 0.06, 0.26, 0.085, 0.003));
      d = Math.min(d, sdBox(ax - 0.31, y + 0.272, z - 0.66, 0.076, 0.012, 0.1, 0.002));
      d = Math.min(d, sdBox(ax - 1.33, y + 0.62, z - 0.3, 0.05, 0.18, 0.36, 0.003));
      d = Math.min(d, sdBox(x, y + 0.775, z - 0.16, 0.3, 0.018, 0.22, 0.002));
      d = Math.min(d, sdBox(x, y + 0.745, z - 0.09, 0.24, 0.018, 0.15, 0.002));
      return d;
    };
    const metal = (x, y, z) => {
      const ax = Math.abs(x);
      const bar = sdBox(gmod(x + 0.03, 0.06) - 0.03, y + 0.325, z - 0.66, 0.006, 0.075, 0.006, 0);
      const rail = sdBox(x, y + 0.255, z - 0.66, 1.38, 0.006, 0.01, 0);
      let d = Math.max(Math.min(bar, rail), 0.37 - ax, ax - 1.38);
      let g = sdBox(gmod(x + 0.02, 0.04) - 0.02, y + 0.56, z - 0.66, 0.006, 0.23, 0.006, 0);
      g = Math.min(g, sdBox(x, Math.abs(y + 0.56) - 0.2, z - 0.66, 0.25, 0.008, 0.01, 0));
      d = Math.min(d, Math.max(g, ax - 0.25));
      const level = y > 0.05 ? 0.31 : -0.21, ry = y - level - 0.08;
      let r = sdBox(gmod(x + 0.02, 0.04) - 0.02, ry, z - 0.085, 0.004, 0.08, 0.004, 0);
      r = Math.max(r, Math.abs(ax - 0.42) - 0.3);
      r = Math.min(r, sdBox(ax - 0.42, ry - 0.08, z - 0.085, 0.3, 0.005, 0.007, 0));
      return Math.min(d, r);
    };
    const sdf = (x, y, z) => Math.min(stone(x, y, z), metal(x, y, z));

    let seed = startSeed;
    const r = () => {
      seed = (seed + 0x6D2B79F5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const CHUNK = 4000, e = 0.002;
    let out = new Float32Array(CHUNK * 10), n = 0, guard = 0;
    const limit = count * 40;
    while (count > 0 && guard++ < limit) {
      let x = -1.5 + r() * 3, y = -0.85 + r() * 1.82, z = -0.92 + r() * 1.82;
      if (Math.abs(sdf(x, y, z)) > 0.07) continue;
      let nx = 0, ny = 0, nz = 0;
      for (let i = 0; i < 4; i++) {
        const d = sdf(x, y, z);
        nx = sdf(x + e, y, z) - sdf(x - e, y, z);
        ny = sdf(x, y + e, z) - sdf(x, y - e, z);
        nz = sdf(x, y, z + e) - sdf(x, y, z - e);
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l; ny /= l; nz /= l;
        x -= nx * d; y -= ny * d; z -= nz * d;
      }
      if (Math.abs(sdf(x, y, z)) > 0.003) continue;
      if (Math.abs(x) < 1 && Math.abs(y - 0.04) < 0.79 && Math.abs(z + 0.46) < 0.35 && r() < 0.8) continue;
      const jitter = (r() - 0.5) * 0.005;
      const a = r() * Math.PI * 2, rad = 2.6 + r() * r() * 7, h = (r() - 0.5) * 3.2;
      out.set([
        x + nx * jitter, y + ny * jitter, z + nz * jitter, nx, ny, nz,
        Math.cos(a) * rad, h, Math.sin(a) * rad, r()
      ], n * 10);
      n++;
      count--;
      if (n === CHUNK || count === 0) {
        emit(out.subarray(0, n * 10).slice());
        out = new Float32Array(CHUNK * 10);
        n = 0;
      }
    }
  }

  /* Parallel workers stream chunks, so particles fly within moments of load
     and the cloud keeps getting denser while the camera settles. */
  function buildCloud(total, onChunk) {
    const jobs = Math.max(1, Math.min(TIER === 'low' ? 2 : 4, (navigator.hardwareConcurrency || 2) - 1));
    const fallback = () => sampleCloud(Math.min(total, 24000), 7, onChunk);
    try {
      const src = `const f=${sampleCloud.toString()};onmessage=e=>{f(e.data.count,e.data.seed,c=>postMessage(c,[c.buffer]));postMessage(null)}`;
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      for (let i = 0; i < jobs; i++) {
        const worker = new Worker(url);
        worker.onmessage = e => { if (e.data) onChunk(e.data); else worker.terminate(); };
        worker.onerror = () => { worker.terminate(); if (i === 0) fallback(); };
        worker.postMessage({ count: Math.ceil(total / jobs), seed: 7 + i * 97 });
      }
    } catch {
      fallback();
    }
  }

  /* Shaders */
  const HERO_VS = `#version 300 es
  in vec2 a; out vec2 v; void main(){v=a;gl_Position=vec4(a,0.,1.);}`;

  const HERO_FS = `#version 300 es
  precision highp float;
  in vec2 v; out vec4 o;
  uniform vec3 uCam,uR,uU,uF;
  uniform vec2 uShift;
  uniform float uTan,uAspect,uCut,uGlow,uForm;
  uniform mat4 uVP;
  const vec3 BG=vec3(.043,.051,.059);
  const vec3 COPPER=vec3(.95,.55,.27);
  const vec3 SUN=normalize(vec3(.78,.42,.46));
  const float FLOOR=-.83;
  ${PART_GLSL}
  ${ASHLAR_GLSL}
  float scene(vec3 p){return max(part(p),p.x-uCut);}
  vec3 normal(vec3 p){vec2 e=vec2(.0011,0.);return normalize(vec3(
    scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));}
  float shadow(vec3 ro){
#ifdef LOW
    return 1.;
#else
    float res=1.,t=.02;
    for(int i=0;i<24;i++){
      float h=scene(ro+SUN*t);
      res=min(res,11.*h/t);
      t+=clamp(h,.012,.14);
      if(res<.01||t>3.)break;
    }
    return clamp(res,0.,1.);
#endif
  }
  vec3 env(vec3 d){
    float up=.5+.5*d.y;
    vec3 c=mix(vec3(.05,.05,.06),vec3(.42,.46,.54),up*up);
    return c+vec3(1.,.72,.45)*1.3*smoothstep(.86,.995,dot(d,SUN));
  }
  vec3 tone(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  void main(){
    vec2 q=v-uShift;
    vec3 rd=normalize(uF+uTan*(q.x*uAspect*uR+q.y*uU));
    vec3 col=BG*(1.25-.5*length(q*vec2(.7,1.)));
    float depth=1.;

    if(rd.y<0.){
      float tf=(FLOOR-uCam.y)/rd.y;
      vec3 f=uCam+rd*tf;
      float dist=length(f.xz);
      vec2 g1=abs(fract(f.xz*2.-.5)-.5)/fwidth(f.xz*2.);
      vec2 g2=abs(fract(f.xz*.5-.5)-.5)/fwidth(f.xz*.5);
      float fine=1.-min(min(g1.x,g1.y),1.),major=1.-min(min(g2.x,g2.y),1.);
      float fade=exp(-dist*dist*.04);
      vec3 fc=BG*.9+vec3(.34,.38,.42)*(fine*.1+major*.26)*fade;
      #ifdef LOW
      fc*=mix(1.,mix(.3,1.,smoothstep(-.02,.5,stone(vec3(f.x,-.6,f.z)))),uForm);
#else
      if(abs(f.x)<4.&&abs(f.z)<4.&&uCut>-1.45)fc*=mix(1.,mix(.28,1.,shadow(f+vec3(0.,.002,0.))),uForm);
#endif
      fc+=COPPER*uGlow*exp(-abs(f.x-uCut)*5.)*exp(-f.z*f.z*.5)*.34;
      col=mix(col,fc,smoothstep(17.,4.,dist));
    }

    vec3 bmin=vec3(-1.46,-.84,-.9),bmax=vec3(1.46,.95,.87);
    vec3 ta=(bmin-uCam)/rd,tb=(bmax-uCam)/rd;
    vec3 t1=min(ta,tb),t2=max(ta,tb);
    float t=max(max(t1.x,max(t1.y,t1.z)),0.),end=min(t2.x,min(t2.y,t2.z));
    float tHit=1e9;
    if(t<end&&uCut>-1.45){
      for(int i=0;i<STEPS;i++){
        float d=scene(uCam+rd*t);
        if(d<.0007*(1.+t*.1)){tHit=t;break;}
        t+=d*.9;
        if(t>end)break;
      }
    }
    if(tHit<1e8){
      vec3 p=uCam+rd*tHit,n=normal(p),gn=n,r;
      float ao=0.;
      for(int i=1;i<=AO_STEPS;i++){float h=.04*float(i);ao+=(h-scene(p+n*h))/h;}
      ao=clamp(1.-ao*.22*(4./float(AO_STEPS)),.15,1.);
      float sh=shadow(p+gn*.004);
      vec3 c;
      float isMetal=step(metal(p),stone(p));
      if(isMetal>.5){
        r=reflect(rd,n);
        c=vec3(.7,.74,.79)*(env(r)*.95+.08*ao)+vec3(1.,.8,.6)*max(dot(n,SUN),0.)*sh*.5;
      }else{
        vec3 ip=abs(p-vec3(0.,.04,-.46))-vec3(.99,.78,.34);
        if(max(ip.x,max(ip.y,ip.z))<.012&&p.y<.82){
          float h=fract((p.y+.74)/.52);
          vec3 warm=mix(vec3(.95,.46,.16),vec3(1.,.68,.34),smoothstep(.9,.3,h));
          c=warm*(.5+.55*ao)*(.72+.28*max(gn.z,0.))*1.05;
        }else{
          vec3 a=ashlar(p,gn);
          float flat_=step(.7,gn.y);
          float grain=sin(p.y*340.+p.x*120.)*sin(p.x*280.-p.z*210.)+.5*sin(p.z*520.+p.y*410.);
          vec3 jit=vec3(a.y-.5,fract(a.y*7.3)-.5,fract(a.y*13.1)-.5);
          n=normalize(gn+(jit*.1+.022*vec3(grain,-grain,grain*.6))*(1.-flat_*.8));
          vec3 alb=mix(vec3(.86,.81,.71),vec3(.74,.67,.56),a.y)*(.9+.18*fract(a.y*5.7));
          alb*=mix(.5,1.,a.x);
          if(flat_>.5)alb=vec3(.62,.58,.52)*(.92+.04*grain);
          float diff=max(dot(n,SUN),0.)*sh;
          vec3 sky=vec3(.2,.27,.38)*(.55+.45*n.y);
          vec3 bounce=vec3(.28,.2,.13)*(.5-.5*n.y);
          c=alb*(diff*vec3(1.75,1.32,.95)+(sky+bounce)*ao);
        }
      }
      float band=abs(p.x-uCut);
      c+=COPPER*exp(-band*26.)*.6*uGlow;
      col=tone(c*1.12);
      if(band<.0035&&part(p)<-.0015){
        float inner=smoothstep(-.03,-.002,part(p));
        col=mix(vec3(.16,.06,.022),vec3(.98,.52,.22),inner*inner);
      }
      vec4 cl=uVP*vec4(p,1.);
      depth=clamp(cl.z/cl.w*.5+.5,0.,1.);
    }

    if(abs(rd.x)>1e-4&&uCut>-1.45&&uCut<1.48){
      float tp=(uCut-uCam.x)/rd.x;
      if(tp>0.&&tp<tHit){
        vec3 s=uCam+rd*tp;
        float box=max(abs(s.y-.1)/1.02,abs(s.z)/1.04);
        if(box<1.){
          float rim=smoothstep(.95,.997,box);
          col+=COPPER*(.03+rim*.62)*uGlow;
        }
      }
    }
    o=vec4(col,1.);
    gl_FragDepth=depth;
  }`;

  const CLOUD_VS = `#version 300 es
  precision highp float;
  in vec3 pos; in vec3 nor; in vec3 scatter; in float rnd;
  uniform mat4 uVP; uniform vec3 uCam; uniform float uCut,uForm,uSize,uMirror,uTime;
  out float vFace; out float vHot; out float vTravel; out float vAlpha; out float vMortar;
  ${ASHLAR_GLSL}
  void main(){
    vMortar=mix(.2,1.,ashlar(pos,nor).x);
    float k=clamp(uForm*1.8-rnd*.8,0.,1.);
    k=k*k*(3.-2.*k);
    float ang=(1.-k)*(2.4+rnd*1.6);
    float c=cos(ang),s=sin(ang);
    vec3 sc=vec3(c*scatter.x-s*scatter.z,scatter.y,s*scatter.x+c*scatter.z);
    vec3 p=mix(sc,pos,k);
    float f=dot(nor,normalize(uCam-pos));
    bool settled=k>.995;
    if((settled&&f<.03)||pos.x<uCut){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
    float hot=exp(-abs(pos.x-uCut)*24.);
    p+=nor*hot*.02*sin(uTime*7.+rnd*40.);
    vTravel=1.-k; vHot=hot; vFace=settled?f:.7;
    vAlpha=1.;
    if(uMirror>.5){
      vAlpha=.1*exp(-(p.y+.83)*2.);
      p.y=-1.66-p.y;
    }
    gl_Position=uVP*vec4(p,1.);
    gl_PointSize=uSize*(7.5/gl_Position.w)*(1.+hot*1.1+vTravel*.8);
  }`;

  const CLOUD_FS = `#version 300 es
  precision mediump float;
  in float vFace; in float vHot; in float vTravel; in float vAlpha; in float vMortar; out vec4 o;
  void main(){
    float r=length(gl_PointCoord-.5)*2.;
    if(r>1.)discard;
    float a=smoothstep(1.,.15,r);
    vec3 deep=vec3(.62,.27,.09),copper=vec3(.98,.58,.28),hot=vec3(1.,.9,.78);
    vec3 c=mix(deep,copper,vFace);
    c=mix(c,hot,vHot*.9);
    float b=mix((.34+.95*vFace)*vMortar,.5,vTravel)+vHot*.8;
    o=vec4(c*a*b*vAlpha,0.);
  }`;

  const ROOM_VS = `#version 300 es
  in vec3 pos; in vec3 nor;
  uniform mat4 uVP; uniform vec3 uCam; uniform float uSize,uCount;
  out float vFace; out float vFresh; out float vDist;
  void main(){
    float f=dot(nor,normalize(uCam-pos));
    if(f<.04){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
    vFace=f;
    vDist=clamp(distance(pos,vec3(.9,1.35,.5))/4.6,0.,1.);
    vFresh=uCount>0.?smoothstep(uCount-7000.,uCount,float(gl_VertexID)):0.;
    gl_Position=uVP*vec4(pos,1.);
    gl_PointSize=uSize;
  }`;
  const ROOM_FS = `#version 300 es
  precision mediump float;
  in float vFace; in float vFresh; in float vDist; out vec4 o;
  void main(){
    vec2 q=gl_PointCoord-.5;
    if(dot(q,q)>.25)discard;
    vec3 c=mix(vec3(.98,.6,.3),vec3(.48,.54,.6),smoothstep(.1,.72,vDist));
    c=mix(c,vec3(1.,.82,.62),vFresh);
    float a=mix(.3,1.,vFace);
    o=vec4(c*a,a);
  }`;
  const LINE_VS = `#version 300 es
  in vec3 pos; uniform mat4 uVP; void main(){gl_Position=uVP*vec4(pos,1.);}`;
  const LINE_FS = `#version 300 es
  precision mediump float; out vec4 o; void main(){o=vec4(vec3(.98,.62,.33)*.75,.75);}`;

  function compile(gl, vs, fs) {
    const p = gl.createProgram(), shaders = [];
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(p, s);
      shaders.push(s);
    }
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    return { p, shaders };
  }

  function finish(gl, prog) {
    if (!gl.getProgramParameter(prog.p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog.p) || prog.shaders.map(s => gl.getShaderInfoLog(s)).join(' '));
    }
    const u = {}, count = gl.getProgramParameter(prog.p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(prog.p, i).name;
      u[name] = gl.getUniformLocation(prog.p, name);
    }
    prog.u = u;
    return prog;
  }

  const program = (gl, vs, fs) => finish(gl, compile(gl, vs, fs));

  function heroShader(tier) {
    const defs = tier === 'low' ? '#define LOW\n#define STEPS 64\n#define AO_STEPS 2\n' : '#define STEPS 110\n#define AO_STEPS 4\n';
    return HERO_FS.replace('precision highp float;', 'precision highp float;\n' + defs);
  }

  function camera(yaw, pitch, dist, target, aspect, fovDeg, shiftX = 0, shiftY = 0) {
    const cp = Math.cos(pitch), c = [
      target[0] + Math.sin(yaw) * cp * dist,
      target[1] + Math.sin(pitch) * dist,
      target[2] + Math.cos(yaw) * cp * dist
    ];
    const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const F = norm([target[0] - c[0], target[1] - c[1], target[2] - c[2]]);
    const R = norm(cross(F, [0, 1, 0]));
    const U = cross(R, F);
    const tan = Math.tan(fovDeg * Math.PI / 360), f = 1 / tan;
    const near = 0.1, far = 60, A = (far + near) / (near - far), B = 2 * far * near / (near - far);
    const fa = f / aspect;
    const r3 = [F[0], F[1], F[2], -dot(F, c)];
    const r0 = [fa * R[0], fa * R[1], fa * R[2], -fa * dot(R, c)].map((v, i) => v + shiftX * r3[i]);
    const r1 = [f * U[0], f * U[1], f * U[2], -f * dot(U, c)].map((v, i) => v + shiftY * r3[i]);
    const r2 = [-A * F[0], -A * F[1], -A * F[2], A * dot(F, c) + B];
    const vp = new Float32Array(16);
    for (let i = 0; i < 4; i++) { vp[i * 4] = r0[i]; vp[i * 4 + 1] = r1[i]; vp[i * 4 + 2] = r2[i]; vp[i * 4 + 3] = r3[i]; }
    return { c, R, U, F, tan, vp };
  }

  /* Hero */
  function createHero(root) {
    const pin = root.closest('.hero-pin');
    const goStatic = () => { TIER = 'static'; pin.classList.add('static'); };
    if (TIER === 'static') { goStatic(); return null; }

    const canvas = root.querySelector('canvas');
    const copy = root.querySelector('.hero-copy');
    const stages = [...root.querySelectorAll('.hero-stage')];
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: TIER === 'low' ? 'default' : 'high-performance' });
    if (!gl) { goStatic(); return null; }

    const maxScale = () => TIER === 'low' ? Math.min(1.25, devicePixelRatio || 1) : Math.max(1.5, Math.min(2, devicePixelRatio || 1));
    const s = {
      time: 0, px: 0, py: 0, tx: 0, ty: 0, scale: maxScale(), w: 0, h: 0, count: 0, startedAt: 0,
      last: 0, lastDraw: 0, slow: 0, crawl: 0, readyAt: 0, raf: 0, inView: true, override: null, ready: false, lastK: -1, dirty: true, dead: false
    };
    const total = TIER === 'low' ? 30000 : 150000;
    const loadStart = performance.now();
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, (total + 8000) * 40, gl.DYNAMIC_DRAW);

    let main = compile(gl, HERO_VS, heroShader('low'));
    let upgrade = null;
    if (TIER === 'high' && !parallel) main = compile(gl, HERO_VS, heroShader('high'));
    let cloud = compile(gl, CLOUD_VS, CLOUD_FS);
    let quadVao = null, cloudVao = null;

    const stop = () => {
      s.dead = true;
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      copy.removeAttribute('style');
      stages.forEach(el => el.removeAttribute('style'));
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      goStatic();
    };

    function compiled() {
      if (!parallel) return true;
      const done = p => gl.getProgramParameter(p.p, parallel.COMPLETION_STATUS_KHR);
      return done(main) && done(cloud);
    }

    function init() {
      try {
        finish(gl, main);
        if (!cloud.u) finish(gl, cloud);
      } catch (err) {
        console.warn('Hero scene disabled:', err.message);
        stop();
        return;
      }
      if (!quadVao) {
        quadVao = gl.createVertexArray();
        gl.bindVertexArray(quadVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        cloudVao = gl.createVertexArray();
        gl.bindVertexArray(cloudVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        for (const [name, size, offset] of [['pos', 3, 0], ['nor', 3, 12], ['scatter', 3, 24], ['rnd', 1, 36]]) {
          const loc = gl.getAttribLocation(cloud.p, name);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 40, offset);
        }
        gl.bindVertexArray(null);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.blendFunc(gl.ONE, gl.ONE);
      }
      s.ready = true;
      s.readyAt = performance.now();
      if (TIER === 'high' && parallel && !s.upgraded) { s.upgraded = true; upgrade = compile(gl, HERO_VS, heroShader('high')); }
      s.firstFrameMs = Math.round(performance.now() - loadStart);
    }

    function addChunk(chunk) {
      const added = chunk.length / 10;
      if (s.dead || s.count + added > total + 8000) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, s.count * 40, chunk);
      s.count += added;
      s.dirty = true;
      s.doneMs = Math.round(performance.now() - loadStart);
      kick();
    }

    function resize() {
      if (s.dead) return;
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      s.w = Math.round(box.width * s.scale);
      s.h = Math.round(box.height * s.scale);
      if (canvas.width !== s.w || canvas.height !== s.h) { canvas.width = s.w; canvas.height = s.h; }
      s.dirty = true;
    }

    function scrollProgress() {
      const box = pin.getBoundingClientRect();
      return clamp01(-box.top / Math.max(1, box.height - innerHeight));
    }

    function story(k) {
      const copyOut = 1 - smooth(0.08, 0.2, k);
      copy.style.opacity = copyOut;
      copy.style.transform = `translateY(${(1 - copyOut) * -24}px)`;
      copy.style.visibility = copyOut < 0.01 ? 'hidden' : 'visible';
      const windows = [[0.2, 0.28, 0.42, 0.5], [0.5, 0.58, 0.7, 0.76], [0.76, 0.84, 2, 3]];
      stages.forEach((el, i) => {
        const [a, b, c, d] = windows[i];
        const on = smooth(a, b, k) * (1 - smooth(c, d, k));
        el.style.opacity = on;
        el.style.transform = `translateY(${(1 - on) * 18}px)`;
      });
    }

    function render(now, k) {
      if (!s.startedAt && s.count) s.startedAt = now;
      const elapsed = s.startedAt ? now - s.startedAt : 0;
      const dt = Math.min(0.05, (now - (s.last || now)) / 1000);
      s.last = now;
      s.time += dt;

      const formK = clamp01(elapsed / 2600);
      const introT = 0.46 * (1 - Math.pow(1 - clamp01((elapsed - 2300) / 1700), 3));
      let form = s.count ? formK : 0;
      let t = mix(introT, 1, smooth(0.2, 0.86, k));
      if (s.override) { form = s.override.form; t = s.override.t; }
      const cut = -1.5 + t * 3;

      s.px += (s.tx - s.px) * Math.min(1, dt * 3);
      s.py += (s.ty - s.py) * Math.min(1, dt * 3);

      const aspect = s.w / s.h, portrait = aspect < 1, low = TIER === 'low';
      const sway = low ? 0 : Math.sin(s.time * 0.16) * 0.2;
      const orbit = smooth(0.05, 1, k);
      const yaw = 0.58 + sway * 0.5 - orbit * 1.02 + s.px * 0.14;
      const pitch = mix(0.2, 0.44, Math.sin(orbit * Math.PI)) + mix(0.04, 0, orbit) + s.py * 0.06;
      const dolly = mix(1, 0.88, Math.sin(orbit * Math.PI));
      const dist = (portrait ? 8.4 / Math.max(aspect, 0.5) * 0.78 : 9.2) * dolly;
      const shiftX = portrait ? 0 : (document.documentElement.dir === 'rtl' ? -0.43 : 0.43);
      const shiftY = portrait ? 0.4 : 0.02;
      const cam = camera(yaw, pitch, dist, [0, 0.02, 0], aspect, 26, shiftX, shiftY);

      gl.viewport(0, 0, s.w, s.h);
      gl.depthMask(true);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND);
      gl.useProgram(main.p);
      const u = main.u;
      gl.uniform3fv(u.uCam, cam.c); gl.uniform3fv(u.uR, cam.R); gl.uniform3fv(u.uU, cam.U); gl.uniform3fv(u.uF, cam.F);
      gl.uniform2f(u.uShift, shiftX, shiftY);
      gl.uniform1f(u.uTan, cam.tan); gl.uniform1f(u.uAspect, aspect); gl.uniform1f(u.uCut, cut);
      gl.uniform1f(u.uGlow, form >= 1 ? 1 - smooth(0.93, 1, t) : 0);
      gl.uniform1f(u.uForm, form);
      gl.uniformMatrix4fv(u.uVP, false, cam.vp);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (s.count) {
        const count = low ? Math.min(s.count, 30000) : s.count;
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.useProgram(cloud.p);
        const c = cloud.u;
        gl.uniformMatrix4fv(c.uVP, false, cam.vp);
        gl.uniform3fv(c.uCam, cam.c);
        gl.uniform1f(c.uCut, cut);
        gl.uniform1f(c.uForm, form);
        gl.uniform1f(c.uTime, s.time);
        gl.uniform1f(c.uSize, (low ? 2.2 : 1.5) * (s.h / 700));
        gl.bindVertexArray(cloudVao);
        gl.uniform1f(c.uMirror, 0);
        gl.drawArrays(gl.POINTS, 0, count);
        if (!low) {
          gl.uniform1f(c.uMirror, 1);
          gl.drawArrays(gl.POINTS, 0, count);
        }
      }
      story(k);
      s.intro = elapsed < 4300;
    }

    /* Lower resolution first, then a cheaper shader, then the static image. */
    function adapt(dtMs) {
      if (s.override || performance.now() - s.readyAt < 1500) return;
      if (dtMs > 150) s.crawl++; else s.crawl = 0;
      if (s.crawl >= 4) {
        s.crawl = 0;
        s.readyAt = performance.now();
        if (TIER === 'high') {
          TIER = 'low';
          upgrade = null;
          s.scale = Math.min(1, maxScale());
          resize();
          main = compile(gl, HERO_VS, heroShader('low'));
          s.ready = false;
        } else if (scrollProgress() < 0.02) {
          stop();
        }
        return;
      }
      if (dtMs > (TIER === 'low' ? 48 : 28)) s.slow++; else s.slow = Math.max(0, s.slow - 1);
      if (s.slow < 24) return;
      s.slow = 0;
      s.readyAt = performance.now();
      const floor = TIER === 'low' ? 0.5 : 0.75;
      if (s.scale > floor) {
        s.scale = Math.max(floor, s.scale * 0.8);
        resize();
      } else if (TIER === 'high') {
        TIER = 'low';
        upgrade = null;
        s.scale = Math.min(s.scale, maxScale());
        main = compile(gl, HERO_VS, heroShader('low'));
        s.ready = false;
      } else if (scrollProgress() < 0.02) {
        stop();
      }
    }

    function loop(now) {
      s.raf = 0;
      if (s.dead || !s.inView) return;
      if (!s.ready) {
        if (compiled()) init();
        if (s.dead) return;
        if (!s.ready) { s.raf = requestAnimationFrame(loop); return; }
      }
      if (upgrade && gl.getProgramParameter(upgrade.p, parallel.COMPLETION_STATUS_KHR)) {
        if (TIER === 'high') {
          try { main = finish(gl, upgrade); s.fullShaderMs = Math.round(performance.now() - loadStart); s.readyAt = now; } catch (err) { console.warn(err.message); }
        }
        upgrade = null;
      }
      const low = TIER === 'low';
      if (low && now - s.lastDraw < 31) { s.raf = requestAnimationFrame(loop); return; }
      const k = scrollProgress();
      const moving = Math.abs(k - s.lastK) > 0.0003;
      if (low && !moving && !s.dirty && !s.intro) {
        s.last = 0;
        s.raf = requestAnimationFrame(loop);
        return;
      }
      if (s.last) adapt(now - s.last);
      if (s.dead || !s.ready) { s.raf = requestAnimationFrame(loop); return; }
      s.lastK = k;
      s.dirty = false;
      s.lastDraw = now;
      s.frames = (s.frames || 0) + 1;
      render(now, k);
      s.raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!s.raf && s.inView && !s.dead) s.raf = requestAnimationFrame(loop); };

    new ResizeObserver(resize).observe(canvas);
    resize();

    new IntersectionObserver(([e]) => {
      s.inView = e.isIntersecting;
      s.last = 0;
      kick();
    }).observe(pin);
    document.addEventListener('visibilitychange', () => { s.last = 0; });

    if (matchMedia('(hover: hover)').matches && TIER === 'high') {
      window.addEventListener('pointermove', e => {
        s.tx = e.clientX / innerWidth * 2 - 1;
        s.ty = e.clientY / innerHeight * 2 - 1;
      }, { passive: true });
    }

    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); });

    buildCloud(total, addChunk);
    kick();

    return {
      /* Used to capture the static posters and social image. */
      freeze(t) { s.override = { form: 1, t }; s.tx = s.ty = 0; s.scale = 2; resize(); },
      metrics() { return { tier: TIER, scale: s.scale, width: s.w, points: s.count, frames: s.frames || 0, firstFrameMs: s.firstFrameMs, fullShaderMs: s.fullShaderMs, allParticlesMs: s.doneMs }; }
    };
  }

  /* Room */
  const ROOM = { x: 3, z: 2.2, h: 2.7 };
  const SCANNER = [0.9, 1.35, 0.5];
  const BOXES = [
    [-0.6, 0.45, -1.88, 1.8, 0.45, 0.32],
    [-0.6, 1.95, -2.02, 1.8, 0.35, 0.18],
    [-1.25, 0.45, -0.1, 0.85, 0.45, 0.42],
    [1.55, 0.22, 1.6, 0.9, 0.22, 0.42],
    [1.55, 0.42, 1.95, 0.9, 0.42, 0.14],
    [-1.75, 0.74, 1.45, 0.72, 0.03, 0.46],
    [2.7, 1.1, -1.55, 0.3, 1.1, 0.55]
  ];

  function castRay(dx, dy, dz) {
    const [ox, oy, oz] = SCANNER;
    let t = Infinity, nx = 0, ny = 0, nz = 0, kind = 'none';
    const wall = (o, d, plane, axis, sign) => {
      if (Math.abs(d) < 1e-6) return;
      const h = (plane - o) / d;
      if (h > 0 && h < t) {
        t = h; nx = axis === 0 ? sign : 0; ny = axis === 1 ? sign : 0; nz = axis === 2 ? sign : 0;
        kind = 'wall' + axis + (sign > 0 ? 'n' : 'p');
      }
    };
    wall(ox, dx, -ROOM.x, 0, 1); wall(ox, dx, ROOM.x, 0, -1);
    wall(oz, dz, -ROOM.z, 2, 1); wall(oz, dz, ROOM.z, 2, -1);
    wall(oy, dy, 0, 1, 1); wall(oy, dy, ROOM.h, 1, -1);

    for (const [cx, cy, cz, hx, hy, hz] of BOXES) {
      const t1x = (cx - hx - ox) / dx, t2x = (cx + hx - ox) / dx;
      const t1y = (cy - hy - oy) / dy, t2y = (cy + hy - oy) / dy;
      const t1z = (cz - hz - oz) / dz, t2z = (cz + hz - oz) / dz;
      const nearX = Math.min(t1x, t2x), nearY = Math.min(t1y, t2y), nearZ = Math.min(t1z, t2z);
      const tNear = Math.max(nearX, nearY, nearZ);
      const tFar = Math.min(Math.max(t1x, t2x), Math.max(t1y, t2y), Math.max(t1z, t2z));
      if (tNear > 0 && tNear < tFar && tNear < t) {
        t = tNear; kind = 'box';
        nx = tNear === nearX ? -Math.sign(dx) : 0;
        ny = tNear === nearY ? -Math.sign(dy) : 0;
        nz = tNear === nearZ ? -Math.sign(dz) : 0;
      }
    }

    const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
    if (kind === 'wall1p') return null;                                      // ceiling left open
    if (kind === 'wall2n' && x > -1.7 && x < -0.3 && y > 0.95 && y < 2.15) return null; // window
    if (kind === 'wall0p' && z > 0.1 && z < 1.0 && y < 2.1) return null;     // doorway
    return { x, y, z, nx, ny, nz };
  }

  function sampleRoom(azSteps, elSteps) {
    let seed = 11;
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const out = new Float32Array(azSteps * elSteps * 6);
    let n = 0;
    for (let i = 0; i < azSteps; i++) {
      const az = (i / azSteps) * Math.PI * 2;
      for (let j = 0; j < elSteps; j++) {
        const el = -1.3 + (j + r()) / elSteps * 2.1;
        const c = Math.cos(el), dx = Math.cos(az) * c, dy = Math.sin(el), dz = Math.sin(az) * c;
        const hit = castRay(dx, dy, dz);
        if (!hit) continue;
        const jitter = (r() - 0.5) * 0.012;
        out.set([hit.x + dx * jitter, hit.y + dy * jitter, hit.z + dz * jitter, hit.nx, hit.ny, hit.nz], n * 6);
        n++;
      }
    }
    return { data: out.subarray(0, n * 6), count: n };
  }

  function createRoom(root) {
    const canvas = root.querySelector('canvas'), slider = root.querySelector('input[type=range]');
    const poster = root.querySelector('.viewer-poster');
    if (TIER === 'static') { root.classList.add('no-gl'); return null; }
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
    if (!gl) { root.classList.add('no-gl'); return null; }

    const state = { yaw: 0.5, pitch: 0.78, t: 0, raf: 0, intro: 0, w: 0, h: 0 };
    let geo, pts, line, pointVao, lineVao, lineBuf;

    function setup() {
      geo = TIER === 'low' ? sampleRoom(420, 80) : sampleRoom(760, 130);
      pts = program(gl, ROOM_VS, ROOM_FS);
      line = program(gl, LINE_VS, LINE_FS);

      pointVao = gl.createVertexArray();
      gl.bindVertexArray(pointVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, geo.data, gl.STATIC_DRAW);
      const posLoc = gl.getAttribLocation(pts.p, 'pos'), norLoc = gl.getAttribLocation(pts.p, 'nor');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(norLoc);
      gl.vertexAttribPointer(norLoc, 3, gl.FLOAT, false, 24, 12);

      lineVao = gl.createVertexArray();
      gl.bindVertexArray(lineVao);
      lineBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      const a = gl.getAttribLocation(line.p, 'pos');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    function resize() {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const scale = TIER === 'low' ? Math.min(1.5, devicePixelRatio || 1) : Math.min(2, Math.max(1.5, devicePixelRatio || 1));
      const w = Math.min(1800, Math.round(box.width * scale)), h = Math.round(w * box.height / box.width);
      if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
      state.w = w; state.h = h;
      draw();
    }

    function draw() {
      state.raf = 0;
      if (!state.w || !geo) return;
      const aspect = state.w / state.h;
      const cam = camera(state.yaw, state.pitch, 13.2 * Math.max(1, 1.12 / aspect), [0, 0.75, 0], aspect, 28);
      gl.viewport(0, 0, state.w, state.h);
      gl.depthMask(true);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const count = Math.round(state.t * geo.count);
      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.useProgram(pts.p);
      gl.uniformMatrix4fv(pts.u.uVP, false, cam.vp);
      gl.uniform3fv(pts.u.uCam, cam.c);
      gl.uniform1f(pts.u.uSize, (TIER === 'low' ? 2.4 : 1.5) * (state.w / canvas.getBoundingClientRect().width));
      gl.uniform1f(pts.u.uCount, state.t < 1 ? count : 0);
      gl.bindVertexArray(pointVao);
      gl.drawArrays(gl.POINTS, 0, count);

      const [sx, sy, sz] = SCANNER, verts = [];
      for (const a of [0, 2.09, 4.19]) verts.push(sx, sy, sz, sx + Math.cos(a) * 0.32, 0, sz + Math.sin(a) * 0.32);
      if (count > 0 && count < geo.count) {
        for (let i = 0; i < 18; i++) {
          const k = Math.max(0, count - 1 - i * 7) * 6;
          verts.push(sx, sy, sz, geo.data[k], geo.data[k + 1], geo.data[k + 2]);
        }
      }
      gl.useProgram(line.p);
      gl.uniformMatrix4fv(line.u.uVP, false, cam.vp);
      gl.bindVertexArray(lineVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.LINES, 0, verts.length / 3);
      if (poster && !poster.hidden) poster.hidden = true;
    }

    const schedule = () => { if (!state.raf) state.raf = requestAnimationFrame(draw); };
    function setT(t, syncSlider) {
      state.t = t;
      if (syncSlider) slider.value = Math.round(t * 100);
      schedule();
    }
    function stopIntro() { if (state.intro) cancelAnimationFrame(state.intro); state.intro = 0; }
    function playIntro() {
      const t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / 5200);
        setT(k, true);
        state.intro = k < 1 ? requestAnimationFrame(step) : 0;
      };
      state.intro = requestAnimationFrame(step);
    }

    slider.addEventListener('input', () => { stopIntro(); setT(slider.value / 100, false); });

    let drag = null;
    canvas.addEventListener('pointerdown', e => {
      drag = { x: e.clientX, y: e.clientY, yaw: state.yaw, pitch: state.pitch };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      state.yaw = drag.yaw - (e.clientX - drag.x) * 0.008;
      if (e.pointerType === 'mouse') state.pitch = Math.max(0.15, Math.min(1.35, drag.pitch + (e.clientY - drag.y) * 0.006));
      schedule();
    });
    const endDrag = () => { drag = null; canvas.classList.remove('dragging'); };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    /* Rays are cast only when the section gets close. */
    let started = false;
    const near = new IntersectionObserver(entries => {
      if (started || !entries.some(e => e.isIntersecting)) return;
      started = true;
      near.disconnect();
      try {
        setup();
      } catch (err) {
        root.classList.add('no-gl');
        console.warn('Room scene disabled:', err.message);
        return;
      }
      new ResizeObserver(resize).observe(canvas);
      resize();
      const inView = new IntersectionObserver(items => {
        if (!items.some(e => e.isIntersecting)) return;
        inView.disconnect();
        playIntro();
      }, { threshold: 0.45 });
      inView.observe(canvas);
    }, { rootMargin: '300px 0px' });
    near.observe(root);

    return {
      capture() { stopIntro(); state.t = 1; slider.value = 100; if (!geo) return null; draw(); return canvas.toDataURL('image/webp', 0.86); }
    };
  }

  window.SNAPIR_SCENES = {};
  function boot() {
    const hero = document.querySelector('[data-scene="hero"]');
    const room = document.querySelector('[data-viewer="room"]');
    if (hero) window.SNAPIR_SCENES.hero = createHero(hero);
    window.SNAPIR_SCENES.tier = () => TIER;
    if (room) window.SNAPIR_SCENES.room = createRoom(room);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
