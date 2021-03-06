import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import mouth from './mouth'
import { startRandomBlink } from './blink'
import { randomNeckTurn, randomSway } from './sway'
const TWEEN = require('@tweenjs/tween.js')

export default function init() {
	loadScene()
	//setUpAvatar();
}

var gltfLoader, model, controls, container, scene, camera, renderer, hemiLight, dirLight, focalPoint, lenMorphs
function loadScene() {
	container = document.getElementById("avatarCanvas");
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setClearColor( 0x00ffff, 0 )
	scene = new THREE.Scene();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	let newCanvas = renderer.domElement
	container.appendChild(newCanvas);
	window.addEventListener("resize", onWindowResize);
	camera = new THREE.PerspectiveCamera(
		35,
		container.clientWidth / container.clientHeight,
		0.01,
		100
	);
	scene.background = new THREE.Color('#bae1ff');

	hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
	dirLight.position.set(3, 10, 10);
	dirLight.castShadow = false;
	scene.add(dirLight);
	
	loadIndividualGLTF();
}


var head
var headBone
var spine
var neck
var leftEye
var rightEye
var rightArm
var leftArm
function loadIndividualGLTF() {

	gltfLoader = new GLTFLoader();
	gltfLoader.load("https://d1a370nemizbjq.cloudfront.net/625d97f4-3532-478b-934a-1e960ebfd84a.glb", function(gltf) {
		model = gltf.scene;
    window.model = model;
		scene.add( model );
		model.rotation.y = -0.6
		let direction = new THREE.Vector3();
		let headPos;
		model.traverse(function(object) {
			//console.log('name:', object.name)
			if (object.name === "Head") {
				headPos = object.getWorldPosition(direction)
				headBone = object;
			}
      else if (object.name =="Wolf3D_Head") {
        console.log('MorphTargetDictionary:', object.morphTargetDictionary)
        head = object
				lenMorphs = head.morphTargetInfluences.length;
      } else if (object.name === "Spine") {
				spine = object;
      } else if (object.name === "RightArm") {
				rightArm = object;
				rightArm.rotation.x += 0.4
      } else if (object.name === "LeftArm") {
				leftArm = object;
				leftArm.rotation.x += 0.4
      } else if (object.name === "Neck") {
				neck = object;
			} else if (object.name === "LeftEye") {
				leftEye = object;
			} else if (object.name === "RightEye") {
				rightEye = object;
			}
		})
		headBone.rotation.y = 0.3;
		camera.position.set(0, headPos.y, 1.7)
		camera.rotation.set(-0.1, 0.25, 0)
		//controls = new OrbitControls(camera, renderer.domElement);
		//controls.target.set(0, headPos.y+0, 0);
		//controls.update();
		focalPoint = camera.getWorldPosition(direction)
		animate()
		startRandomBlink();
		randomSway();
		randomNeckTurn();
	})
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
}


function animate() {
  TWEEN.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

export { lenMorphs, head, neck, spine, leftEye, rightEye, focalPoint }
