import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import vertexShader from './Shaders/Fireworks/vertex.vert'
import fragmentShader from './Shaders/Fireworks/fragment.frag'

const gui = new GUI();
const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

const textures =[
  textureLoader.load('/static/particles/1.png'),
  textureLoader.load('/static/particles/2.png'),
  textureLoader.load('/static/particles/3.png'),
  textureLoader.load('/static/particles/4.png'),
  textureLoader.load('/static/particles/5.png'),
  textureLoader.load('/static/particles/6.png'),
  textureLoader.load('/static/particles/7.png'),
  textureLoader.load('/static/particles/8.png'),
]

//fireworks
const createFireworks = (count,position,size,texture,radius,color)=>{
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);
  const colorsArray = new Float32Array(count * 3);
  
  for(let i = 0; i<count; i++){
    const i3 =  i * 3;

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() *Math.PI,
      Math.random() *Math.PI * 2
    )
    const position = new THREE.Vector3()
    position.setFromSpherical(spherical);

    positionsArray[i3    ] = position.x
    positionsArray[i3 + 1] = position.y
    positionsArray[i3 + 2] = position.z

    sizesArray[i] = Math.random()
    timeMultipliersArray[i] = 1.0 + Math.random()

    const insideColor = new THREE.Color('#fdc630');
    const outsideColor = new THREE.Color('#678ce9');
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, Math.random());
    colorsArray[i3    ] = mixedColor.r
    colorsArray[i3 + 1] = mixedColor.g 
    colorsArray[i3 + 2] = mixedColor.b
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positionsArray,3));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizesArray,1));
  geometry.setAttribute('aTimeMultiplier',new THREE.BufferAttribute(timeMultipliersArray,1));
  geometry.setAttribute('aColor',new THREE.BufferAttribute(colorsArray,3));
  texture.flipY = false
  const material = new THREE.ShaderMaterial({
    vertexShader:vertexShader,
    fragmentShader:fragmentShader,
    uniforms:{
      uSize : new THREE.Uniform(size),
      uResolution : new THREE.Uniform(sizes.resolution),
      uTexture:new THREE.Uniform(texture),
      uColor : new THREE.Uniform(color),
      uProgress : new THREE.Uniform(0),
    },
    transparent:true,
    depthWrite:false,
    blending:THREE.AdditiveBlending,
    
  })
  
  const fireworks = new THREE.Points(geometry, material);
  fireworks.position.copy(position)
  scene.add(fireworks);
  const destroy = ()=>{
    scene.remove(fireworks);
    geometry.dispose();
    material.dispose();
  }
  gsap.to(material.uniforms.uProgress,{
    value : 1,
    duration:3,
    ease:'linear',
    onComplete:destroy
  })
}
const createRandomFireworks = ()=>{
  const count = Math.round(400 + Math.random() * 100);
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 3
  )
  const size = 0.1 + Math.random() * 0.2;
  const texture = textures[Math.floor(Math.random() * textures.length)];
  const radius = 0.5 + Math.random() * 1.2;
  const color = new THREE.Color();
  color.setHSL(Math.random(),1,0.7);
  createFireworks(count, position, size, texture, radius, color);
}


const sizes ={
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio : Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

window.addEventListener('resize',()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias:true
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

  
window.addEventListener('click',createRandomFireworks);

//sky
// Add Sky
				const sky = new Sky();
				sky.scale.setScalar( 450000 );
				scene.add( sky );

				const sun = new THREE.Vector3();

				/// GUI

				const skyParameters = {
					turbidity: 10,
					rayleigh: 3,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.95,
					elevation: -2.2,
					azimuth: 180,
					exposure: renderer.toneMappingExposure
				};

				function updateSky() {

					const uniforms = sky.material.uniforms;
					uniforms[ 'turbidity' ].value = skyParameters.turbidity;
					uniforms[ 'rayleigh' ].value = skyParameters.rayleigh;
					uniforms[ 'mieCoefficient' ].value = skyParameters.mieCoefficient;
					uniforms[ 'mieDirectionalG' ].value = skyParameters.mieDirectionalG;

					const phi = THREE.MathUtils.degToRad( 90 - skyParameters.elevation );
					const theta = THREE.MathUtils.degToRad( skyParameters.azimuth );

					sun.setFromSphericalCoords( 1, phi, theta );

					uniforms[ 'sunPosition' ].value.copy( sun );

					renderer.toneMappingExposure = skyParameters.exposure;
					renderer.render( scene, camera );

				}
				gui.add( skyParameters, 'turbidity', 0.0, 20.0, 0.1 ).onChange( updateSky );
				gui.add( skyParameters, 'rayleigh', 0.0, 4, 0.001 ).onChange( updateSky );
				gui.add( skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( updateSky );
				gui.add( skyParameters, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( updateSky );
				gui.add( skyParameters, 'elevation', -3, 10, 0.01 ).onChange( updateSky );
				gui.add( skyParameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSky );
				gui.add( skyParameters, 'exposure', 0, 1, 0.0001 ).onChange( updateSky );

				updateSky();


const clock = new THREE.Clock();

function tick(){
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();