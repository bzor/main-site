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
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.id = `text-container-${index}`;

		const leftDetail = document.createElement('div');
        leftDetail.className = 'content-detail-left';

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
        description.innerHTML = block.description;

        const platform = document.createElement('p');
        platform.className = 'content-platform';
        platform.innerHTML = `PLATFORM: ${block.platform}`;

		const status = document.createElement('p');
        status.className = 'content-status';
        status.innerHTML = `STATUS: ${block.status}`;

        text.appendChild(title);
        text.appendChild(platform);
        text.appendChild(status);
        text.appendChild(description);

        textContainer.appendChild(leftDetail);
        textContainer.appendChild(detail);
        textContainer.appendChild(text);

        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'images-container';
        imagesContainer.id = `images-container-${index}`;

        // Create empty divs for each image
        if (block.heroImage) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'image-placeholder';
            imageDiv.dataset.imageName = block.heroImage.split('/').pop(); // Store image name in dataset
            imagesContainer.appendChild(imageDiv);
        }

        content.appendChild(textContainer);
        content.appendChild(imagesContainer);
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

        // Pinning animation ScrollTrigger
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top 80px',
                end: `+=100%`,
                pin: true,
				pinSpacing: false,
                markers: false // Remove or comment this out in production
            }
        });

        // Image progress tracking ScrollTrigger
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top bottom',
                end: 'top 80px',
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
                markers: false // Remove or comment this out in production
            }
        })

    });
}
