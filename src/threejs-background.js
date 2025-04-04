import * as THREE from 'three';
import { settings } from './settings.js';

let scene, camera, renderer, activeImage, transitionImage, textureLoader;
let backgroundPlane;
let imageProgressArray = [];
let heroTextures = [];
let bgUniforms;
let activeBgCol, activeTextCol, activeHighlightCol, inBgCol, inTextCol, inHighlightCol, col;
let hasInit = false;

export function initThreeJsBackground(containerId) {

    const container = document.getElementById(containerId);
    scene = new THREE.Scene();

    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(settings.backgroundColor); // Set canvas background color from settings
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

	//Sides
	let leftSide = document.createElement("div");
	leftSide.className = "main-side main-side-left";
	document.body.appendChild(leftSide);
	let rightSide = document.createElement("div");
	rightSide.className = "main-side main-side-right";
	document.body.appendChild(rightSide);
    const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: updateProgress
    });
	function updateProgress(){
		const totalHeight = document.body.getBoundingClientRect().height - window.innerHeight;
		leftSide.style.backgroundPositionY = (st.progress * -totalHeight) + 'px';
		rightSide.style.backgroundPositionY = (st.progress * -totalHeight) + 'px';
	}
	setTintColor(settings.highlightColor);

    // Set up texture loader
    textureLoader = new THREE.TextureLoader();

    // Create a 16:9 plane with ShaderMaterial
    const planeGeometry = new THREE.PlaneGeometry(16, 9);
	bgUniforms = {
		mainTex: { value: null },
		inTex: { value: null },
		inT: { value: 0 },
	};
    const planeMaterial = new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
			uniform float inT;
			uniform sampler2D mainTex;
			uniform sampler2D inTex;
			varying vec2 vUv;

			const float PI = 3.1415;
			const float angle1 = PI *0.25;
			const float angle2 = -PI *0.75;

			float sineIn(float t) {
				return sin((t - 1.0) * PI * 0.5) + 1.0;
			}
			float sineOut(float t) {
				return sin(t * PI * 0.5);
			}
			float sineInOut(float t) {
				return -0.5 * (cos(PI * t) - 1.0);
			}
			float quarticIn(float t) {
				return pow(t, 4.0);
			}

			void main()	{
				float aspect = 16.0 / 9.0;

				float redOffset   =  -0.006;
				float greenOffset =   0.009;
				float blueOffset  =   0.006;

				vec2 uv1 = vUv - vec2(0.5);
				vec2 uv2 = uv1;
				vec2 mixUv = uv1;
				mixUv.x *= aspect;

				float t = inT;
				float invT = 1.0 - t;
				
				uv1 *= mix(1.0 - floor((abs(mixUv.x) + abs(mixUv.y)) * (15.0 + t * 10.0)) * 0.1, 1.0, smoothstep(0.0, 1.0, invT));
				vec2 chromaticDir = normalize(uv1) * 0.75 * t;
				vec4 mainTexCol = vec4(0);
				mainTexCol.r = texture2D(mainTex, uv1 + vec2(0.5) + chromaticDir * vec2(redOffset)).r;
				mainTexCol.g = texture2D(mainTex, uv1 + vec2(0.5) + chromaticDir * vec2(greenOffset)).g;
				mainTexCol.ba = texture2D(mainTex, uv1 + vec2(0.5) + chromaticDir * vec2(blueOffset)).ba;

				uv2 *= mix(1.0 + floor((abs(mixUv.x) + abs(mixUv.y)) * 20.0) * 0.5, 1.0, sineIn(t));
				chromaticDir = normalize(uv2) * 0.75 * invT;
				vec4 inTexCol = vec4(0);
				inTexCol.r = texture2D(inTex, uv2 + vec2(0.5) + chromaticDir * vec2(redOffset)).r;
				inTexCol.g = texture2D(inTex, uv2 + vec2(0.5) + chromaticDir * vec2(greenOffset)).g;
				inTexCol.ba = texture2D(inTex, uv2 + vec2(0.5) + chromaticDir * vec2(blueOffset)).ba;

				//mainTexCol = texture2D(mainTex, uv1 + vec2(0.5));
				//inTexCol = texture2D(inTex, uv2 + vec2(0.5));

				float mixT = step(fract((abs(mixUv.x) + abs(-mixUv.y)) * 1.0), quarticIn(t));
				vec4 f = mix(mainTexCol, inTexCol, mixT);

				gl_FragColor = f;
			}
        `,
        transparent: true
    });
    //planeMaterial.opacity = 0.2;
    backgroundPlane = new THREE.Mesh(planeGeometry, planeMaterial);

    scene.add(backgroundPlane);

    // Adjust plane size to fit the viewport
    resizePlaneToViewport();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

	activeBgCol = new THREE.Color(settings.backgroundColor);
	activeTextCol = new THREE.Color(settings.textColor);
	activeHighlightCol = new THREE.Color(settings.highlightColor);
	inBgCol = new THREE.Color(settings.backgroundColor);
	inTextCol = new THREE.Color(settings.textColor);
	inHighlightCol = new THREE.Color(settings.highlightColor);
	col = new THREE.Color();
	updateColors(0);

    animate();

	hasInit = true;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizePlaneToViewport();
}

function resizePlaneToViewport() {
    const viewportHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    const viewportWidth = viewportHeight * camera.aspect;

    const aspectRatio = 16 / 9;
    let planeWidth, planeHeight;

    if (viewportWidth / viewportHeight > aspectRatio) {
        // Wider than 16:9
        planeHeight = viewportWidth / aspectRatio;
        planeWidth = viewportWidth;
    } else {
        // Taller than 16:9
        planeWidth = viewportHeight * aspectRatio;
        planeHeight = viewportHeight;
    }

    backgroundPlane.scale.set(planeWidth / 16, planeHeight / 9, 1);
}

export function setInitialBG(tex){
	backgroundPlane.material.uniforms.inTex.value = tex;
	backgroundPlane.material.needsUpdate = true;
}

export function updateImageProgress(progressArray) {
    imageProgressArray = progressArray;

    let curActiveImage = null;
    let curTransitionImage = null;
    let image;
	let progressT = 0;
    for (let i = 0; i < imageProgressArray.length; i++) {
        image = imageProgressArray[i];
        if (image.progress == 1) {
            curActiveImage = image;
        } else if (image.progress > 0) {
            curTransitionImage = image;
			progressT = image.progress;
        }
    }

    if (curActiveImage != null && curActiveImage !== activeImage) {
        activeImage = curActiveImage;
		activeBgCol.set(activeImage.palette.backgroundColor);
		activeTextCol.set(activeImage.palette.textColor);
		activeHighlightCol.set(activeImage.palette.highlightColor);
		applyHeroTexture(activeImage);
    }

    if (curTransitionImage != null && curTransitionImage !== transitionImage) {
        transitionImage = curTransitionImage;
		inBgCol.set(transitionImage.palette.backgroundColor);
		inTextCol.set(transitionImage.palette.textColor);
		inHighlightCol.set(transitionImage.palette.highlightColor);
        applyTransitionTexture(transitionImage);
    }


	if (curActiveImage == null){
		backgroundPlane.material.uniforms.mainTex.value = null;
		activeBgCol.set(settings.backgroundColor);
		activeTextCol.set(settings.textColor);
		activeHighlightCol.set(settings.highlightColor);
	}

	if(curActiveImage == null && curTransitionImage == null){
		activeBgCol.set(settings.backgroundColor);
		activeTextCol.set(settings.textColor);
		activeHighlightCol.set(settings.highlightColor);
		inBgCol.set(settings.backgroundColor);
		inTextCol.set(settings.textColor);
		inHighlightCol.set(settings.highlightColor);
	}

	if (curTransitionImage == null){
		backgroundPlane.material.uniforms.inT.value = 0;
	} else {
		backgroundPlane.material.uniforms.inT.value = progressT;
	}

	updateColors(progressT);
	backgroundPlane.material.needsUpdate = true;

}

export function setHeroTextures(textures) {
    heroTextures = textures;
}

function applyHeroTexture(image) {
    const imageName = image.imageName;
    const textureData = heroTextures.find(tex => tex.imageName === imageName);
    if (textureData && textureData.texture) {
        backgroundPlane.material.uniforms.mainTex.value = textureData.texture;
        backgroundPlane.material.needsUpdate = true;
    }
}

function applyTransitionTexture(image){
    const imageName = image.imageName;
    const textureData = heroTextures.find(tex => tex.imageName === imageName);
    if (textureData && textureData.texture) {
        backgroundPlane.material.uniforms.inTex.value = textureData.texture;
        backgroundPlane.material.needsUpdate = true;
    }
}

export function updateColors(t) {
	if(!hasInit){
		return;
	}
	t = THREE.MathUtils.smoothstep(t, 0.4, 0.6);
	col.set(activeBgCol.getHex());
	col.lerp(inBgCol, t);
	document.documentElement.style.setProperty('--background-color', `#${col.getHexString()}`);
	col.set(activeTextCol.getHex());
	col.lerp(inTextCol, t);
    document.documentElement.style.setProperty('--text-color', `#${col.getHexString()}`);
	col.set(activeHighlightCol.getHex());
	col.lerp(inHighlightCol, t);
    document.documentElement.style.setProperty('--highlight-color', `#${col.getHexString()}`);
	setTintColor(`#${col.getHexString()}`);

}


function hexToRgb(hex) {
	let r = 0, g = 0, b = 0;
	if (hex.length === 4) {
		r = parseInt(hex[1] + hex[1], 16);
		g = parseInt(hex[2] + hex[2], 16);
		b = parseInt(hex[3] + hex[3], 16);
	} else if (hex.length === 7) {
		r = parseInt(hex[1] + hex[2], 16);
		g = parseInt(hex[3] + hex[4], 16);
		b = parseInt(hex[5] + hex[6], 16);
	}
	return { r, g, b };
}

function setTintColor(hex) {
	const tintMatrix = document.querySelector('feFlood');
	tintMatrix.setAttribute('flood-color', hex);
}





/*
        fragmentShader: `
			uniform float inT;
			uniform sampler2D mainTex;
			uniform sampler2D inTex;
			varying vec2 vUv;

			mat2 rotate(float a) {
				float s = sin(a);
				float c = cos(a);
				return mat2(c, -s, s, c);
			}

			mat2 scale(vec2 _scale){
				return mat2(_scale.x, 0.0, 0.0, _scale.y);
			}

			const float PI = 3.1415;
			const float angle1 = PI *0.25;
			const float angle2 = -PI *0.75;

			void main()	{

				float aspect = 16.0 / 9.0;

				vec2 uv1 = vUv - vec2(0.5);
				vec2 uv2 = uv1;

				float t = inT;
				float invT = 1.0 - t;

				vec2 mixUv = uv1;
				mixUv.x *= aspect;

				vec2 dUv1 = uv1;
				dUv1 *= mix(1.0 - 0.25 * step(fract((abs(mixUv.x) + abs(mixUv.y)) * 10.0 * invT), 0.5 * invT), 1.0, invT);
				vec4 mainTexCol = texture2D(mainTex, dUv1 + vec2(0.5));

				vec2 dUv2 = uv2;
				dUv2 *= mix(3.0 + step(fract((abs(mixUv.x) + abs(mixUv.y)) * 40.0 * invT), 0.5 * t), 1.0, t);
				vec4 inTexCol = texture2D(inTex, dUv2 + vec2(0.5));

				float mixT = step((abs(uv1.x) + abs(uv1.y) * invT), 0.5 * t);
				vec4 f = mix( mainTexCol, inTexCol, mixT);
				gl_FragColor = f;


			}
        `,
*/