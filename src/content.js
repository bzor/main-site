import * as THREE from 'three';
import { updateImageProgress, setInitialBG, updateColors, setHeroTextures } from './threejs-background.js';

export function fetchContentData() {
    return fetch('./contentData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        });
}

export function preloadHeroImages(contentData, callback) {
    const imagePaths = contentData.map(block => block.heroImage);
    const textureLoader = new THREE.TextureLoader();
    const heroTextures = [];
    let loadedImages = 0;

	let loaderBar = document.querySelector(".loader-bar");

    imagePaths.forEach(path => {
        textureLoader.load(path, (texture) => {
            //texture.colorSpace = THREE.SRGBColorSpace;
			let imageName = path.split('/').pop();
			if(imageName == "syncopated.jpg"){
				setInitialBG(texture);
			}
            heroTextures.push({ imageName: imageName, texture });
            loadedImages++;
			gsap.to(loaderBar, {duration: 1, width: `${(loadedImages / imagePaths.length) * 100}%`, ease: "power1.inOut", overwrite: true} );
            if (loadedImages === imagePaths.length) {
				gsap.to(loaderBar, {top: -10, ease: "none", duration: 0.4, delay: 1, onComplete: callback} );
                setHeroTextures(heroTextures);
            }
        }, undefined, (err) => {
            console.error(`Failed to load image: ${path}`, err);
            loadedImages++;
            if (loadedImages === imagePaths.length) {
                setHeroTextures(heroTextures);
                callback();
            }
        });
    });
}

export function createContentBlocks(contentData) {
    const content = document.getElementById('smooth-content');

    contentData.forEach((block, index) => {

		block.textActive = 0;

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.id = `text-container-${index}`;

		const leftDetail = document.createElement('div');
        leftDetail.className = 'content-detail-left';

		const leftTopDetail = document.createElement('div');
        leftTopDetail.className = 'content-detail-left-top';

        const detail = document.createElement('div');
        detail.className = 'content-detail';

        const label = document.createElement('span');
        label.className = 'content-label';
        label.innerHTML = `<span class="content-label-detail">|</span>0${index + 1}`;

        const line = document.createElement('span');
        line.className = 'content-line';

        detail.appendChild(label);
        detail.appendChild(line);

        const text = document.createElement('div');
        text.className = 'content-text';

        const title = document.createElement('h2');
        title.className = 'content-title';
        title.textContent = block.title;

        const description = document.createElement('p');
        description.className = 'content-description';
        description.innerHTML = "";

		const contentTag = document.createElement('p');
        contentTag.className = 'content-tag';
        contentTag.innerHTML = block.tag;

        const platform = document.createElement('p');
        platform.className = 'content-platform';
        platform.innerHTML = `PLATFORM: ${block.platform}`;

		const status = document.createElement('p');
        status.className = 'content-status';
        status.innerHTML = `STATUS: ${block.status}`;

		const textDetail = document.createElement('div');
        textDetail.className = 'content-text-detail';
		const textDetailLeft = document.createElement('div');
        textDetailLeft.className = 'content-text-detail-left';
		const textDetailRight = document.createElement('div');
        textDetailRight.className = 'content-text-detail-right';

        text.appendChild(title);
        text.appendChild(platform);
        text.appendChild(status);
        text.appendChild(description);
        text.appendChild(contentTag);
        text.appendChild(textDetail);
        text.appendChild(textDetailLeft);
        text.appendChild(textDetailRight);

        textContainer.appendChild(leftDetail);
        textContainer.appendChild(leftTopDetail);
        textContainer.appendChild(detail);
        textContainer.appendChild(text);

        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'images-container';
        imagesContainer.id = `images-container-${index}`;

		const imageDiv = document.createElement('div');
		imageDiv.className = 'image-placeholder';
		imageDiv.dataset.imageName = block.heroImage.split('/').pop();
		imagesContainer.appendChild(imageDiv);

		const textShowDiv = document.createElement('div');
		textShowDiv.className = 'text-show';
        textShowDiv.id = `text-show-${index}`;

		const endSpacerDiv = document.createElement('div');
		endSpacerDiv.className = 'end-spacer';
        endSpacerDiv.id = `end-spacer-${index}`;

        content.appendChild(textContainer);
        content.appendChild(imagesContainer);
        content.appendChild(textShowDiv);
        content.appendChild(endSpacerDiv);
    });
}

export function createScrollTriggers(contentData) {
    ScrollTrigger.refresh();

    const imageProgressArray = [];

    contentData.forEach((block, index) => {
        const textContainer = document.getElementById(`text-container-${index}`);
        const label = textContainer.querySelector('.content-label');
        const line = textContainer.querySelector('.content-line');
        const title = textContainer.querySelector('.content-title');
        const detailLeft = textContainer.querySelector('.content-detail-left');
        const platform = textContainer.querySelector('.content-platform');
        const status = textContainer.querySelector('.content-status');
        const description = textContainer.querySelector('.content-description');
        const images = document.querySelectorAll(`#images-container-${index} .image-placeholder`);
        const textShow = document.querySelectorAll(`#text-show-${index}`);
        const textDetail = textContainer.querySelectorAll(`.content-text-detail`);
        const endSpacer = document.querySelectorAll(`#end-spacer-${index}`);

        // Reveal animation ScrollTrigger
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top bottom-=100px',
                end: 'bottom bottom',
                onEnter: () => {
                    gsap.to(label, { autoAlpha: 1, duration: 0.5 });
                    gsap.to(line, { scaleX: 1, duration: 0.5, transformOrigin: 'left', ease: "power4.out" });
                    gsap.to(title, { autoAlpha: 1, y: 0, duration: 1, ease: "power4.inOut"});
                    gsap.to(platform, { autoAlpha: 1, y: 0, duration: 1, ease: "power4.inOut" });
                    gsap.to(status, { autoAlpha: 1, y: 0, duration: 1, ease: "power4.inOut" });
                    gsap.to(description, { autoAlpha: 1, y: 0, duration: 1, ease: "power4.inOut"});
                },
                markers: false // Remove or comment this out in production
            }
        });

        // Pin Sections to top
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top 80px',
                end: `+=175%`,
                pin: true,
				pinSpacing: false,
                markers: false
            }
        });

        // Track section progress
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top bottom',
                end: 'top 100px',
                scrub: true,
				snap: {
					snapTo: 1,
					directional: false,
					delay: 1.0,
					duration: 3.0,
					ease: "sine.inOut"
				},
                onUpdate: (self) => {
                    const progress = self.progress;
                    images.forEach(image => {
                        const imageName = image.dataset.imageName;
                        const imageProgress = { imageName, palette: block.palette, progress };
                        const index = imageProgressArray.findIndex(img => img.imageName === imageName);
                        if (index > -1) {
                            imageProgressArray[index] = imageProgress;
                        } else {
                            imageProgressArray.push(imageProgress);
                        }
                    });
                    updateImageProgress(imageProgressArray);
                },
                markers: false
            }
        })

		gsap.timeline({
			scrollTrigger: {
				trigger: textShow,
                start: 'top 40%',
                end: 'top 80px',
				toggleActions: "play none none reverse"
			}
		}).to(block, {
			duration: 0.5,
			ease: "none",
			textActive: 1,
			onUpdate: () => {
				const rndChars = ["+", "-"];
				const t1 = THREE.MathUtils.smoothstep(block.textActive, 0.0, 0.8);
				const t2 = THREE.MathUtils.smoothstep(block.textActive, 0.4, 1.0);
				const l1 = Math.floor(t1 * block.description.length);
				const l2 = Math.floor(t2 * block.description.length);
				let str = "";
				str = block.description.substr(0, Math.floor(block.description.length * t2));
				for( let i = l2; i < l1; i++){
					str += (block.description.substr(i, 1) == " ") ? " " : rndChars[i % rndChars.length];
				}
				description.innerHTML = str;
			}
		}).to(description, {
			duration: 0.5,
			ease: "sine.inOut",
			paddingBottom: 10
		}, 0);

		gsap.timeline({
			scrollTrigger: {
				trigger: textShow,
                start: 'top bottom',
                end: 'top 40%',
				scrub: true
			}
		}).to(textDetail, {
			ease: "none",
			width: "100%",
		});

		if(index != contentData.length - 1){
			gsap.timeline({
				scrollTrigger: {
					trigger: textShow,
					start: 'top 35%',
					end: 'bottom top',
					scrub: true,
					onUpdate: (self) => {
						console.log(self.progress);
					}
				}
			}).to(textDetail, {
				ease: "none",
				left: "100%",
				width: "0%"
			});
		}
    });
}
