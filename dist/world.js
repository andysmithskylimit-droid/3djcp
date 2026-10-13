import * as THREE from './vendor/three.module.js';

const host=document.querySelector('#world');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Renderer ─────────────────────────────────────────────────── */
let renderer;
try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
}catch(e){
  document.querySelector('#world-status').textContent='3D is unavailable in this browser. You can still explore services and contact JCP.';
  document.querySelectorAll('.play-panel button,.scene-toolbar button').forEach(b=>b.disabled=true);
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.04;
renderer.setClearColor(0x000000,0);
host.prepend(renderer.domElement);
host.classList.add('webgl-ready');
const canvas=renderer.domElement;
canvas.setAttribute('aria-label','A living 3D garden with a mower. Drag to rotate the scene. In the playground, click the grass or use direction controls to mow.');
canvas.setAttribute('role','img');

/* ─── Scene & Camera ────────────────────────────────────────────── */
const scene=new THREE.Scene();
// Subtle atmospheric fog to add depth — matches dark forest green palette
scene.fog=new THREE.FogExp2(0x0f3a2c,0.028);

const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,150);
const garden=new THREE.Group();scene.add(garden);

/* ─── Lighting ──────────────────────────────────────────────────── */
const hemi=new THREE.HemisphereLight(0xd8f0b8,0x1a3b24,1.9);scene.add(hemi);

const sun=new THREE.DirectionalLight(0xfff0b0,3.0);
sun.position.set(-5,9,5);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:32});
sun.shadow.normalBias=.035;
sun.shadow.bias=-.00015;
scene.add(sun);

const rim=new THREE.DirectionalLight(0xa8d4aa,2.2);rim.position.set(4,4,-5);scene.add(rim);
// Subtle fill light from below to lift shadow areas
const fill=new THREE.DirectionalLight(0x7ab890,0.35);fill.position.set(0,-3,2);scene.add(fill);

const ambientPoint=new THREE.PointLight(0xffcd7d,0,12);ambientPoint.position.set(-2.5,2,-2.4);scene.add(ambientPoint);

/* ─── Material helpers ──────────────────────────────────────────── */
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const soilMat=mat(0x514337),lowerSoil=mat(0x795c3d),edgeMat=mat(0xd9c7a5),
      lawnMat=mat(0x547d36),stoneMat=mat(0xc6c4a6),darkMat=mat(0x203732),
      rubberMat=mat(0x16201a),metalMat=mat(0x7e8978,.35,.7),
      yellowMat=mat(0xecc270,.35,.15),trunkMat=mat(0x766044),bedMat=mat(0x4e4031);

function mesh(geo,material,parent=garden,x=0,y=0,z=0){
  const m=new THREE.Mesh(geo,material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function block(w,d,h,r,material,parent=garden,x=0,y=0,z=0){
  const s=new THREE.Shape();
  s.moveTo(-w/2+r,-d/2);s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
  s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);
  s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);
  s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:3,bevelSize:.04,bevelThickness:.035,curveSegments:8});
  g.rotateX(-Math.PI/2);return mesh(g,material,parent,x,y,z);
}
function tube(points,r,material,parent=garden){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve,24,r,8,false),material,parent);
}
function branch(a,b,r1,r2,parent=garden){
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);
  const m=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),9),trunkMat,parent);
  m.position.copy(av.add(bv).multiplyScalar(.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
}

/* ─── Deterministic RNG ─────────────────────────────────────────── */
let seed=927;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};

/* ─── Ground layers ─────────────────────────────────────────────── */
block(7.1,5.65,.33,.48,lowerSoil,garden,0,-.54,0);
block(7.15,5.68,.19,.48,soilMat,garden,0,-.24,0);
block(7.25,5.78,.055,.48,edgeMat,garden,0,-.04,0);
block(7.04,5.57,.065,.42,lawnMat,garden,0,.02,0);
for(let i=0;i<3;i++)block(7.1,5.64,.007,.45,mat([0x8b7456,0x594835,0x927451][i]),garden,0,-.48+i*.1,0);

/* Subtle mowing stripe planes — slightly lighter / darker alternating bands */
const stripeMat=mat(0x658b42),stripeDark=mat(0x4a7230);
for(let i=0;i<8;i++){
  const m=mesh(new THREE.PlaneGeometry(.42,4.92),i%2?stripeDark:stripeMat,garden,-3+i*.83,.093,0);
  m.rotation.x=-Math.PI/2;
}

/* ─── Stone path ────────────────────────────────────────────────── */
for(let i=0;i<8;i++){
  const z=-2.3+i*.66,x=2.62+Math.sin(i*.5)*.12;
  const p=block(.69,.51,.065,.085,stoneMat,garden,x,.1,z);p.rotation.y=Math.sin(i)*.05;
}
block(2.15,1.12,.04,.4,bedMat,garden,-1.97,.12,-2.03);

/* ─── Foliage / shrubs / tree ───────────────────────────────────── */
const foliageMaterials=[0x3b6b36,0x537b39,0x73964b,0x416c34,0x86a451].map(c=>mat(c));
const foliageGeo=new THREE.IcosahedronGeometry(1,2);
function shrub(x,y,z,size,index=0,parent=garden){
  const m=mesh(foliageGeo,foliageMaterials[index%5],parent,x,y,z);
  m.scale.set(size,size*.84,size*.9);m.rotation.set(rnd(),rnd(),rnd());return m;
}
const tree=new THREE.Group();tree.position.set(-2.25,.1,-1.96);garden.add(tree);
branch([0,0,0],[.08,2.48,.04],.105,.035,tree);
branch([.02,.9,0],[-.68,2.03,-.14],.075,.02,tree);
branch([.05,1.45,.03],[.65,2.5,.11],.05,.013,tree);
branch([0,1.9,.03],[-.2,2.85,.26],.035,.012,tree);
for(let i=0;i<42;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.79;shrub(Math.cos(a)*r,2.2+rnd()*.7,Math.sin(a)*r,.26+rnd()*.25,i,tree);}

/* Leaf clusters */
const leafGeo=new THREE.SphereGeometry(1,6,4);const leafMat=mat(0x809f4b);
for(let i=0;i<90;i++){
  const a=rnd()*6.28,r=.65+rnd()*.35;
  const l=mesh(leafGeo,leafMat,tree,Math.cos(a)*r,2.2+rnd()*.8,Math.sin(a)*r);
  l.scale.set(.09,.045,.18);l.rotation.set(rnd()*2,rnd()*6,rnd());
}

/* Dense canopy — instanced leaf sprites */
const canopyLeaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,3),mat(0x5f853c),1700);
const leafDummy=new THREE.Object3D(),leafColor=new THREE.Color();
for(let i=0;i<1700;i++){
  const a=rnd()*6.28,v=rnd()*2-1,r=Math.cbrt(rnd()),circle=Math.sqrt(1-v*v);
  leafDummy.position.set(Math.cos(a)*circle*r*1.06,2.52+v*r*.66,Math.sin(a)*circle*r*.97);
  leafDummy.rotation.set(rnd()*3,rnd()*6,rnd()*3);
  leafDummy.scale.set(.048+rnd()*.035,.016,.10+rnd()*.06);
  leafDummy.updateMatrix();canopyLeaves.setMatrixAt(i,leafDummy.matrix);
  leafColor.setHSL(.25+rnd()*.07,.38+rnd()*.2,.21+rnd()*.15);canopyLeaves.setColorAt(i,leafColor);
}
canopyLeaves.castShadow=true;canopyLeaves.receiveShadow=true;tree.add(canopyLeaves);

for(let i=0;i<11;i++)shrub(-3.05+i*.45,.31,-2.43,.25+rnd()*.1,i);
for(let i=0;i<6;i++)shrub(-3.12,.26,.15+i*.38,.24,i);

/* Flowers */
const whiteMat=mat(0xf5e7c2),flowerGold=mat(0xd7ac60);
for(let i=0;i<30;i++){
  const x=-3.2+rnd()*.5,z=.1+rnd()*2.25,y=.32+rnd()*.18;
  mesh(new THREE.SphereGeometry(.045,6,4),whiteMat,garden,x,y,z);
  mesh(new THREE.SphereGeometry(.023,6,4),flowerGold,garden,x,y+.035,z);
}
/* Rocks */
for(let i=0;i<35;i++){
  const rock=mesh(new THREE.IcosahedronGeometry(.05+rnd()*.07,1),stoneMat,garden,-2.95+rnd()*1.92,.15,-2.4+rnd()*.65);
  rock.scale.y=.55;
}

/* ─── Grass — enhanced realistic blade geometry & shader ────────── */
/*
 * Blade geometry: 5-segment tapered strip, slightly curved at the tip.
 * Vertices are ordered base→tip so the shader power() curve gives a
 * natural droop from midpoint up and a sharp tip flicker.
 */
const bladeGeo=new THREE.BufferGeometry();
const bV=[
  // base pair
  -.028, 0,   0,    .028, 0,   0,
  // lower pair
  -.022,.18,  .006, .022,.18,  .006,
  // mid pair
  -.014,.32,  .022, .014,.32,  .022,
  // upper pair
  -.006,.44,  .052, .006,.44,  .052,
  // tip
   .000,.56,  .085,
];
bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(bV,3));
bladeGeo.setIndex([
  0,1,2, 1,3,2,
  2,3,4, 3,5,4,
  4,5,6, 5,7,6,
  6,7,8,
]);
bladeGeo.computeVertexNormals();

/*
 * Custom grass material:
 * – Vertex shader: realistic Gerstner-style multi-frequency wind sway,
 *   positional phase offset so adjacent blades feel independent.
 *   Each blade sways more at the tip (pow(nY,2.0)) and barely at the base.
 * – Fragment shader: tip darkening (AO) + subtle colour gradient from
 *   rich base green to lighter tip — matches real grass light scattering.
 */
const grassMaterial=new THREE.MeshStandardMaterial({
  color:0xffffff,
  side:THREE.DoubleSide,
  roughness:.92,
  metalness:0,
});
const wind={value:0};

grassMaterial.onBeforeCompile=shader=>{
  shader.uniforms.uTime=wind;

  // Prepend uniform declaration
  shader.vertexShader='uniform float uTime;\n'+shader.vertexShader;

  // Replace begin_vertex to inject wind sway
  shader.vertexShader=shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
    // Normalised blade height 0→1
    float nY = clamp(position.y / 0.56, 0.0, 1.0);
    // Blade world X/Z from instance matrix columns 3
    float wx = instanceMatrix[3][0];
    float wz = instanceMatrix[3][2];
    // Gerstner multi-frequency wind — primary sway + secondary shimmer
    float phase  = wx * 2.4 + wz * 1.6;
    float sway   = sin(uTime * 1.25 + phase)         * pow(nY, 1.85) * 0.22
                 + sin(uTime * 2.80 + phase * 1.3)   * pow(nY, 2.40) * 0.06
                 + sin(uTime * 0.55 + phase * 0.7)   * pow(nY, 1.20) * 0.08;
    float swayZ  = cos(uTime * 0.90 + phase)         * pow(nY, 2.00) * 0.10
                 + cos(uTime * 3.20 + phase * 0.9)   * pow(nY, 2.60) * 0.03;
    transformed.x += sway;
    transformed.z += swayZ;
    `
  );

  // Fragment: colour gradient tip→base + tip ambient occlusion
  shader.fragmentShader=shader.fragmentShader.replace(
    'void main() {',
    `// Varying for AO passed from vertex
    varying float vBladeAO;
    void main() {`
  );
  // Inject vBladeAO calculation in vertex
  shader.vertexShader=shader.vertexShader.replace(
    'void main() {',
    `varying float vBladeAO;
    void main() {`
  );
  shader.vertexShader=shader.vertexShader.replace(
    '#include <begin_vertex>',
    `vBladeAO = clamp(position.y / 0.56, 0.0, 1.0);
    #include <begin_vertex>`
  );
  // Fragment: multiply diffuse by blade AO gradient
  shader.fragmentShader=shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `// Gradient: base is darker/richer, tips lighter & slightly yellow-green
    vec3 tipTint  = vec3(0.78, 0.92, 0.42);
    vec3 baseTint = vec3(0.55, 0.75, 0.28);
    vec3 bladeTint = mix(baseTint, tipTint, vBladeAO * vBladeAO);
    // Subtle base shadow (ambient occlusion at the soil)
    float ao = mix(0.42, 1.0, vBladeAO);
    gl_FragColor.rgb *= bladeTint * ao;
    #include <dithering_fragment>`
  );
};

const N=innerWidth<760?12000:20000;
const grass=new THREE.InstancedMesh(bladeGeo,grassMaterial,N);
grass.receiveShadow=true;
grass.castShadow=false;
garden.add(grass);

const bladeData=[],dummy=new THREE.Object3D(),color=new THREE.Color();
let mown=0,mowable=0;
for(let i=0;i<N;i++){
  let x,z;
  do{x=(rnd()-.5)*6.56;z=(rnd()-.5)*5.1;}
  while((x>2.22)||(x<-1&&z<-1.5)||(x<-2.8&&z>-.15));
  const angle=rnd()*6.28,height=.36+rnd()*.44;
  const eligible=x>-2.55&&x<1.95&&z>-1.45&&z<2.12;
  bladeData.push({x,z,angle,height,cut:false,eligible});
  if(eligible)mowable++;
  dummy.position.set(x,.115,z);
  dummy.rotation.set(0,angle,0);
  // Natural height variation with slight scale randomisation for X (blade width)
  dummy.scale.set(.60+rnd()*.50,height,1);
  dummy.updateMatrix();
  grass.setMatrixAt(i,dummy.matrix);
  // Per-blade colour: stripe bands + slight hue variation
  const stripe=(Math.floor((x+3.3)/.43)%2)*.04;
  color.setHSL(.255+rnd()*.04,.50+rnd()*.20,.155+rnd()*.14+stripe);
  grass.setColorAt(i,color);
}
grass.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
if(grass.instanceColor)grass.instanceColor.setUsage(THREE.DynamicDrawUsage);

/* ─── Mower ─────────────────────────────────────────────────────── */
const mower=new THREE.Group();garden.add(mower);
mower.position.set(.2,.17,.25);mower.rotation.y=-.4;
block(.76,1,.13,.2,yellowMat,mower,0,.16,0);
block(.46,.51,.22,.085,darkMat,mower,0,.29,-.04);
block(.39,.4,.04,.07,metalMat,mower,0,.515,-.04);
mesh(new THREE.CylinderGeometry(.165,.165,.035,32),darkMat,mower,0,.56,-.06);
for(let i=0;i<6;i++)mesh(new THREE.BoxGeometry(.27,.012,.012),metalMat,mower,0,.586,-.18+i*.046);
mesh(new THREE.CylinderGeometry(.045,.045,.025,16),yellowMat,mower,.14,.59,.09);

const wheels=[];
for(const x of[-.43,.43])for(const z of[-.34,.36]){
  const w=new THREE.Group();w.position.set(x,.19,z);mower.add(w);
  const tire=mesh(new THREE.CylinderGeometry(.185,.185,.12,24),rubberMat,w);
  tire.rotation.z=Math.PI/2;
  const hub=mesh(new THREE.CylinderGeometry(.102,.102,.125,24),metalMat,w);
  hub.rotation.z=Math.PI/2;
  const cap=mesh(new THREE.CylinderGeometry(.038,.038,.13,16),yellowMat,w);
  cap.rotation.z=Math.PI/2;
  for(let k=0;k<15;k++){
    const a=k/15*Math.PI*2;
    const tread=mesh(new THREE.BoxGeometry(.125,.027,.036),darkMat,w,0,Math.sin(a)*.181,Math.cos(a)*.181);
    tread.rotation.x=-a;
  }
  wheels.push(w);
}
tube([[-.28,.25,.39],[-.3,.78,.91],[-.32,1.22,1.23]],.022,metalMat,mower);
tube([[.28,.25,.39],[.3,.78,.91],[.32,1.22,1.23]],.022,metalMat,mower);
tube([[-.32,1.22,1.23],[0,1.24,1.25],[.32,1.22,1.23]],.045,rubberMat,mower);
tube([[-.3,1.16,1.19],[0,1.18,1.19],[.3,1.16,1.19]],.012,yellowMat,mower);
block(.51,.51,.3,.045,mat(0x43534a),mower,0,.21,.67);

/* JCP badge on the mower deck */
const logoCanvas=document.createElement('canvas');
logoCanvas.width=256;logoCanvas.height=128;
const logoCtx=logoCanvas.getContext('2d');
logoCtx.fillStyle='#edcc7f';logoCtx.fillRect(0,0,256,128);
logoCtx.fillStyle='#203e31';logoCtx.font='bold 80px sans-serif';
logoCtx.textAlign='center';logoCtx.fillText('JCP',128,91);
const logoTex=new THREE.CanvasTexture(logoCanvas);
logoTex.colorSpace=THREE.SRGBColorSpace;
const badge=mesh(
  new THREE.PlaneGeometry(.27,.135),
  new THREE.MeshStandardMaterial({map:logoTex,roughness:.5}),
  mower,0,.305,-.51
);
badge.rotation.y=Math.PI;

/* ─── Garden lamps ──────────────────────────────────────────────── */
const lamps=[];
const lampMaterial=new THREE.MeshStandardMaterial({color:0xf3deac,emissive:0xffc86c,emissiveIntensity:.1});
for(const z of[-1.9,.1,1.9]){
  mesh(new THREE.CylinderGeometry(.035,.045,.28,10),darkMat,garden,3.05,.24,z);
  mesh(new THREE.CylinderGeometry(.09,.08,.09,16),lampMaterial,garden,3.05,.42,z);
  mesh(new THREE.ConeGeometry(.12,.04,16),darkMat,garden,3.05,.495,z);
  const l=new THREE.PointLight(0xffcb75,0,2.7,2);
  l.position.set(3.05,.57,z);garden.add(l);lamps.push(l);
}

/* ─── Pollen / dust particles — more varied sizes ───────────────── */
const pollenN=90;
const pollenGeo=new THREE.BufferGeometry();
const pollenPos=new Float32Array(pollenN*3);
const pollenSizes=new Float32Array(pollenN);
for(let i=0;i<pollenN;i++){
  pollenPos[i*3]=(rnd()-.5)*13;
  pollenPos[i*3+1]=rnd()*5.5;
  pollenPos[i*3+2]=(rnd()-.5)*9;
  pollenSizes[i]=.015+rnd()*.035;
}
pollenGeo.setAttribute('position',new THREE.BufferAttribute(pollenPos,3));
pollenGeo.setAttribute('size',new THREE.BufferAttribute(pollenSizes,1));
const pollen=new THREE.Points(pollenGeo,new THREE.PointsMaterial({
  color:0xe5cf83,size:.024,transparent:true,opacity:.50,depthWrite:false,
  sizeAttenuation:true,
}));
scene.add(pollen);

/* ─── Grass clippings ───────────────────────────────────────────── */
const clippings=new THREE.InstancedMesh(new THREE.BoxGeometry(.025,.055,.013),mat(0x9bb451),65);
clippings.visible=false;garden.add(clippings);
const clipParticles=Array.from({length:65},()=>({life:0,x:0,y:0,z:0,vx:0,vz:0,vy:0}));

/* ─── Intro animation ───────────────────────────────────────────── */
if(window.gsap&&!reduced){
  gsap.from(garden.scale,{x:.86,y:.86,z:.86,duration:2,ease:'power3.out'});
  gsap.from(garden.rotation,{y:-.25,duration:2.5,ease:'power3.out'});
}

/* ─── Cursor ring (mow mode) ────────────────────────────────────── */
const cursorRing=mesh(
  new THREE.RingGeometry(.28,.3,48),
  new THREE.MeshBasicMaterial({color:0xf7e3a1,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}),
  garden,0,.13,0
);
cursorRing.rotation.x=-Math.PI/2;cursorRing.visible=false;

/* ─── Shadow catcher ────────────────────────────────────────────── */
const shadow=mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({opacity:.16}),scene,0,-1.3,0);
shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;

/* ─── State ─────────────────────────────────────────────────────── */
let chapter=0,mode='mow',isDusk=false,paused=reduced,autoMow=false,
    dragging=false,dragX=0,userOrbit=0,mouseX=0,mouseY=0,
    scrollCurrent=scrollY,scrollTarget=scrollY,serviceBias=0;
const steer={up:false,down:false,left:false,right:false};
let target=null,autoIndex=0,lastProgress=-1,cutTime=0;

/* Auto-mow route */
const route=[];
for(let r=0;r<7;r++){
  const z=-1.25+r*.52;
  route.push(new THREE.Vector3(r%2?1.65:-2.25,0,z),new THREE.Vector3(r%2?-2.25:1.65,0,z));
}

/* ─── Mow helpers ───────────────────────────────────────────────── */
function updatePercent(){
  const percent=Math.min(100,Math.round(mown/mowable*100));
  if(percent!==lastProgress){
    document.querySelector('#mow-percent').textContent=percent+'%';
    document.querySelector('#mow-progress').style.width=percent+'%';
    lastProgress=percent;
    if(percent>=95)document.querySelector('#play-status').textContent='Freshly cut. Beautifully done. Grow it back to play again.';
  }
}
function cutGrass(x,z){
  let changed=false;
  for(let i=0;i<N;i++){
    const b=bladeData[i];
    if(b.cut||!b.eligible)continue;
    if((b.x-x)**2+(b.z-z)**2<.27){
      b.cut=true;mown++;
      dummy.position.set(b.x,.115,b.z);
      dummy.rotation.set(0,b.angle,0);
      dummy.scale.set(.8,.18,1);
      dummy.updateMatrix();
      grass.setMatrixAt(i,dummy.matrix);
      changed=true;
    }
  }
  if(changed){
    grass.instanceMatrix.needsUpdate=true;
    updatePercent();
    for(let i=0;i<5;i++){
      const p=clipParticles.find(p=>p.life<=0);
      if(p){
        p.life=1;p.x=x;p.y=.35;p.z=z;
        p.vx=(rnd()-.5)*2.2;p.vz=(rnd()-.5)*2.2;p.vy=rnd()*.8+.4;
      }
    }
  }
}

/* ─── UI event bindings ─────────────────────────────────────────── */
document.querySelector('#reset-lawn').addEventListener('click',()=>{
  bladeData.forEach((b,i)=>{
    b.cut=false;
    dummy.position.set(b.x,.115,b.z);
    dummy.rotation.set(0,b.angle,0);
    dummy.scale.set(.8,b.height,1);
    dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);
  });
  grass.instanceMatrix.needsUpdate=true;
  mown=0;updatePercent();target=null;autoMow=false;
  document.querySelector('#tour-toggle').textContent='▶ Auto mow';
  document.querySelector('#tour-toggle').setAttribute('aria-pressed','false');
  document.querySelector('#play-status').textContent='A fresh start. Choose your own path.';
});
document.querySelector('#tour-toggle').addEventListener('click',()=>{
  autoMow=!autoMow;autoIndex=0;target=null;
  const b=document.querySelector('#tour-toggle');
  b.textContent=autoMow?'Ⅱ Stop mower':'▶ Auto mow';
  b.setAttribute('aria-pressed',String(autoMow));
  document.querySelector('#play-status').textContent=autoMow
    ?'A little demonstration. Watch the fresh-cut lines appear.'
    :'Your turn. Click the grass or use the controls.';
});
function setMode(next){
  mode=next;
  ['mow','orbit'].forEach(k=>{
    document.querySelector('#mode-'+k).classList.toggle('active',k===next);
    document.querySelector('#mode-'+k).setAttribute('aria-pressed',String(k===next));
  });
  document.querySelector('#play-instructions').textContent=next==='mow'
    ?'Click a spot on the grass to drive there. Use the arrow keys or controls below to steer.'
    :'Drag left or right across the garden to rotate it. Switch back to mowing whenever you like.';
  cursorRing.visible=false;
}
document.querySelector('#mode-mow').addEventListener('click',()=>setMode('mow'));
document.querySelector('#mode-orbit').addEventListener('click',()=>setMode('orbit'));

document.querySelectorAll('[data-drive]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{steer[b.dataset.drive]=true;target=null;autoMow=false;b.setPointerCapture(e.pointerId);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>b.addEventListener(type,()=>steer[b.dataset.drive]=false));
  b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){steer[b.dataset.drive]=true;e.preventDefault();}});
  b.addEventListener('keyup',()=>steer[b.dataset.drive]=false);
  b.addEventListener('blur',()=>steer[b.dataset.drive]=false);
});
document.querySelectorAll('[data-drive]').forEach(b=>b.addEventListener('click',()=>{
  const d=b.dataset.drive;
  target=new THREE.Vector3(
    THREE.MathUtils.clamp(mower.position.x+(d==='left'?-.7:d==='right'?.7:0),-2.4,1.8),0,
    THREE.MathUtils.clamp(mower.position.z+(d==='up'?-.7:d==='down'?.7:0),-1.35,2)
  );
  autoMow=false;
  document.querySelector('#tour-toggle').textContent='▶ Auto mow';
  document.querySelector('#tour-toggle').setAttribute('aria-pressed','false');
}));

const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
addEventListener('keydown',e=>{
  if(chapter!==2||document.querySelector('dialog[open]')||e.target.matches('input,select,textarea'))return;
  if(keyMap[e.key]){e.preventDefault();steer[keyMap[e.key]]=true;target=null;autoMow=false;}
});
addEventListener('keyup',e=>{if(keyMap[e.key])steer[keyMap[e.key]]=false;});
addEventListener('blur',()=>Object.keys(steer).forEach(k=>steer[k]=false));

/* ─── Raycasting for click-to-mow ──────────────────────────────── */
const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();
const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.15),hit=new THREE.Vector3();
function lawnPoint(e){
  pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);
  raycaster.setFromCamera(pointer,camera);
  if(raycaster.ray.intersectPlane(plane,hit))
    return new THREE.Vector3(THREE.MathUtils.clamp(hit.x,-2.4,1.8),.15,THREE.MathUtils.clamp(hit.z,-1.35,2));
  return null;
}

canvas.addEventListener('pointerdown',e=>{
  if(chapter===2&&mode==='mow'){
    target=lawnPoint(e);autoMow=false;
    document.querySelector('#tour-toggle').textContent='▶ Auto mow';
    document.querySelector('#tour-toggle').setAttribute('aria-pressed','false');
    document.querySelector('#play-status').textContent='Nice. Follow your own line.';
  }else{dragging=true;dragX=e.clientX;canvas.setPointerCapture(e.pointerId);}
});
canvas.addEventListener('pointermove',e=>{
  mouseX=(e.clientX/innerWidth-.5)*2;
  mouseY=(e.clientY/innerHeight-.5)*2;
  if(dragging){userOrbit+=(e.clientX-dragX)*.006;dragX=e.clientX;}
  if(chapter===2&&mode==='mow'){
    const point=lawnPoint(e);
    if(point){cursorRing.position.copy(point);cursorRing.visible=true;}
  }
});
['pointerup','pointercancel'].forEach(t=>canvas.addEventListener(t,()=>dragging=false));
canvas.addEventListener('pointerleave',()=>cursorRing.visible=false);

document.querySelector('#reset-camera').addEventListener('click',()=>{
  if(window.gsap&&!reduced){const p={value:userOrbit};gsap.to(p,{value:0,duration:1.1,onUpdate:()=>userOrbit=p.value});}
  else userOrbit=0;
});

/* ─── Dusk toggle ───────────────────────────────────────────────── */
document.querySelector('#light-toggle').addEventListener('click',()=>{
  isDusk=!isDusk;
  document.querySelector('#light-toggle').setAttribute('aria-pressed',String(isDusk));
  document.querySelector('#light-label').textContent=isDusk?'Golden dusk':'Daylight';
  document.querySelector('.sun-icon').textContent=isDusk?'☾':'☀';
  host.style.background=isDusk
    ?'radial-gradient(ellipse at 65% 20%,#716954 0%,#30493b 38%,#102c29 80%)'
    :'';
});

/* ─── Pause toggle ──────────────────────────────────────────────── */
const pauseButton=document.querySelector('#motion-toggle');
function syncPause(){
  pauseButton.textContent=paused?'▶':'Ⅱ';
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.setAttribute('aria-label',paused?'Resume ambient animation':'Pause ambient animation');
}
syncPause();
pauseButton.addEventListener('click',()=>{paused=!paused;syncPause();});

/* ─── Cross-module events ───────────────────────────────────────── */
window.addEventListener('jcp-chapter',e=>{
  chapter=e.detail;
  if(chapter!==2){
    target=null;autoMow=false;cursorRing.visible=false;
    Object.keys(steer).forEach(k=>steer[k]=false);
    document.querySelector('#tour-toggle').textContent='▶ Auto mow';
    document.querySelector('#tour-toggle').setAttribute('aria-pressed','false');
  }
});
window.addEventListener('jcp-service',e=>{
  const values={mow:0,edge:.85,clean:-.65,routine:1.55};
  if(window.gsap&&!reduced){
    const v={value:serviceBias};
    gsap.to(v,{value:values[e.detail],duration:1.6,ease:'power3.inOut',onUpdate:()=>serviceBias=v.value});
  }else serviceBias=values[e.detail];
});
addEventListener('scroll',()=>scrollTarget=scrollY,{passive:true});

/* ─── Camera poses ──────────────────────────────────────────────── */
const desktopPoses=[
  {theta:.78,phi:.78,dist:15.6,x:-.19,y:-.035},
  {theta:-.64,phi:.8,dist:10.8,x:.23,y:.01},
  {theta:.13,phi:1.04,dist:15.2,x:.025,y:-.035},
  {theta:2.95,phi:.74,dist:12.5,x:-.2,y:0},
];
const mobilePoses=[
  {theta:.68,phi:.84,dist:27,x:0,y:-.23},
  {theta:-.6,phi:.97,dist:28,x:0,y:-.24},
  {theta:.12,phi:1.13,dist:30.6,x:0,y:.065},
  {theta:2.7,phi:.8,dist:27,x:0,y:-.22},
];

let anchors=[];
function resize(){
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  anchors=[0,...['care','play','promise'].map(id=>document.getElementById(id).offsetTop)];
}
resize();addEventListener('resize',resize);

/* ─── Render loop ───────────────────────────────────────────────── */
let last=0,time=0,duskMix=0,frame;
function tick(now){
  frame=requestAnimationFrame(tick);
  if(document.hidden)return;
  const dt=Math.min(.045,(now-last)/1000||.016);
  last=now;
  if(!paused)time+=dt;

  /* Smooth scroll interpolation */
  scrollCurrent+=(scrollTarget-scrollCurrent)*(reduced?1:.075);
  const poses=innerWidth<760?mobilePoses:desktopPoses;
  let i=0;while(i<2&&scrollCurrent>anchors[i+1])i++;
  const next=Math.min(i+1,3);
  const raw=THREE.MathUtils.clamp((scrollCurrent-(anchors[next]-innerHeight*.8))/(innerHeight*.8),0,1);
  const t=raw*raw*(3-2*raw);
  const pose={};
  for(const k of Object.keys(poses[0]))pose[k]=THREE.MathUtils.lerp(poses[i][k],poses[next][k],t);

  const careWeight=Math.max(0,1-Math.abs(scrollCurrent-anchors[1])/innerHeight);
  const theta=pose.theta+userOrbit+serviceBias*careWeight+(paused?0:mouseX*.035);
  camera.position.set(
    Math.sin(theta)*Math.cos(pose.phi)*pose.dist,
    Math.sin(pose.phi)*pose.dist,
    Math.cos(theta)*Math.cos(pose.phi)*pose.dist
  );
  camera.lookAt(0,.45,0);
  camera.setViewOffset(innerWidth,innerHeight,pose.x*innerWidth,pose.y*innerHeight,innerWidth,innerHeight);
  camera.updateProjectionMatrix();

  /* ─── Dusk atmosphere ─────────────────────────── */
  duskMix+=(Number(isDusk)-duskMix)*.035;
  sun.intensity=3.0-duskMix*2.1;
  hemi.intensity=1.9-duskMix*1.2;
  rim.intensity=2.2-duskMix*.7;
  fill.intensity=0.35-duskMix*.2;
  sun.color.setRGB(1,.87-duskMix*.30,.62-duskMix*.35);
  ambientPoint.intensity=duskMix*5.5;
  lampMaterial.emissiveIntensity=.1+duskMix*3.2;
  lamps.forEach(l=>l.intensity=duskMix*3.0);
  // Fog also transitions from day to dusk hue
  scene.fog.color.setRGB(
    THREE.MathUtils.lerp(.059,.17,duskMix),
    THREE.MathUtils.lerp(.227,.21,duskMix),
    THREE.MathUtils.lerp(.172,.14,duskMix)
  );

  /* ─── Ambient animation ───────────────────────── */
  if(!paused){
    wind.value=time;
    // Natural tree sway with gentle secondary wobble
    tree.rotation.z=Math.sin(time*.7)*.009+Math.sin(time*1.9)*.003;
    tree.rotation.x=Math.cos(time*.5)*.004;
    // Pollen drift — gentle upward current + individual Y offset
    pollen.rotation.y=time*.018;
    pollen.position.y=Math.sin(time*.25)*.18;
    // Flowers gentle sway
    if(time%1<dt){}// placeholder for future per-flower update
  }

  /* ─── Mower physics ───────────────────────────── */
  let dx=0,dz=0,moving=false;
  if(chapter===2&&!document.querySelector('dialog[open]')){
    if(autoMow){
      target=route[autoIndex];
      if(mower.position.distanceTo(new THREE.Vector3(target.x,mower.position.y,target.z))<.1){
        autoIndex=(autoIndex+1)%route.length;target=route[autoIndex];
      }
    }
    dx=Number(steer.right)-Number(steer.left);
    dz=Number(steer.down)-Number(steer.up);
    if(target&&!dx&&!dz){
      dx=target.x-mower.position.x;dz=target.z-mower.position.z;
      if(Math.hypot(dx,dz)<.05){target=null;dx=0;dz=0;}
    }
    const length=Math.hypot(dx,dz);
    if(length>.01){
      dx/=length;dz/=length;
      const speed=dt*1.05;
      mower.position.x=THREE.MathUtils.clamp(mower.position.x+dx*speed,-2.4,1.8);
      mower.position.z=THREE.MathUtils.clamp(mower.position.z+dz*speed,-1.35,2);
      const desired=Math.atan2(-dx,-dz);
      let diff=desired-mower.rotation.y;
      diff=Math.atan2(Math.sin(diff),Math.cos(diff));
      mower.rotation.y+=diff*.12;
      wheels.forEach(w=>w.rotation.x-=dt*5.6);
      // Subtle engine vibration bob
      mower.position.y=.17+Math.sin(time*28)*.0028;
      moving=true;cutTime+=dt;
      if(cutTime>.065){cutGrass(mower.position.x,mower.position.z);cutTime=0;}
    }
  }

  /* ─── Grass clipping particles ────────────────── */
  clippings.visible=moving||clipParticles.some(p=>p.life>0);
  clipParticles.forEach((p,i)=>{
    if(p.life>0){
      p.life-=dt*1.6;
      p.x+=p.vx*dt;
      p.z+=p.vz*dt;
      p.y+=p.vy*dt;
      p.vy-=dt*2.8; // gravity
    }
    dummy.position.set(p.x,p.y,p.z);
    dummy.rotation.set(time*5+i,time*3,0);
    dummy.scale.setScalar(Math.max(0,p.life));
    dummy.updateMatrix();clippings.setMatrixAt(i,dummy.matrix);
  });
  if(clippings.visible)clippings.instanceMatrix.needsUpdate=true;

  /* ─── Render ──────────────────────────────────── */
  if(chapter<4)renderer.render(scene,camera);
}
frame=requestAnimationFrame(tick);

document.addEventListener('visibilitychange',()=>{if(!document.hidden)last=performance.now();});
canvas.addEventListener('webglcontextlost',e=>{
  e.preventDefault();cancelAnimationFrame(frame);
  host.classList.remove('webgl-ready');canvas.style.display='none';
  document.querySelector('#world-status').textContent=
    'The 3D view paused. Refresh to reload, or continue to services and contact below.';
});
