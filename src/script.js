import { normalize } from 'three/src/math/MathUtils.js';
import { initThreeJsBackground } from './threejs-background.js';
import { settings } from './settings.js';
import * as THREE from 'three';
import { fetchContentData, createContentBlocks, createScrollTriggers, preloadHeroImages } from './content.js';
import { initNavTracker, showNavTracker } from './navTracker.js';

// Initialize the Three.js background
initThreeJsBackground('threejs-container');
 
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Apply global settings to the page
function applyGlobalSettings() {
    const root = document.documentElement;

    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--text-color', settings.textColor);
    root.style.setProperty('--highlight-color', settings.highlightColor);
}

// Apply settings on load
applyGlobalSettings();

function start(){
	ScrollTrigger.refresh();
	// Initialize the navigation tracker after content blocks are created
}

// Fetch content data and create content blocks
fetchContentData()
    .then(data => {
        // Preload hero images before displaying content
        preloadHeroImages(data, () => {
            document.getElementById('smooth-content').style.display = 'block'; // Show content
            createContentBlocks(data);
            createScrollTriggers(data);
			initNavTracker();
			showNavTracker();
			gsap.to(".bio-line", {duration: 0.8, scaleX: 1, delay: 0.5, ease: "power4.inOut"});
			gsap.to(".bio-title", {duration: 1.2, autoAlpha: 1, delay: 1.3, ease: "power4.out"});
			gsap.to(".bio-text-content", {duration: 1.2, autoAlpha: 1, delay: 1.4, ease: "power4.out"});
			gsap.to(".bio-bottom-detail", {duration: 1.2, scaleX: 1, delay: 1.5, ease: "power4.out", onComplete: start});
			gsap.to(".bio-loading", {duration: 0.2, autoAlpha: 0, delay: 0.8, ease: "power1.in"});
			gsap.to(".bio-greeting", {duration: 0.2, autoAlpha: 1, delay: 1, ease: "power1.out"});			
        });
    })
    .catch(error => console.error('Error fetching content data:', error));

// Initialize ScrollSmoother only on desktop
const mm = gsap.matchMedia();

ScrollSmoother.create({
    smooth: 1,
    effects: true,
    normalizeScroll: true,
    smoothTouch: true,
    ignoreMobileResize: true
});
