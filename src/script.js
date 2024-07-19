import { normalize } from 'three/src/math/MathUtils.js';
import { initThreeJsBackground } from './threejs-background.js';
import { settings } from './settings.js';
import * as THREE from 'three';
import { fetchContentData, createContentBlocks, createScrollTriggers } from './content.js';
import { initNavTracker } from './navTracker.js';

// Initialize the Three.js background
initThreeJsBackground('threejs-container');

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Apply global settings to the page
function applyGlobalSettings() {
    const root = document.documentElement;

    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--text-color', settings.textColor);
    root.style.setProperty('--scrollbar-thumb-color', settings.scrollbarThumbColor);
    root.style.setProperty('--scrollbar-thumb-hover-color', settings.scrollbarThumbHoverColor);
}

// Apply settings on load
applyGlobalSettings();

// Fetch content data and create content blocks
fetchContentData()
    .then(data => {
        createContentBlocks(data);
        createScrollTriggers(data);
        // Initialize the navigation tracker after content blocks are created
        initNavTracker();
    })
    .catch(error => console.error('Error fetching content data:', error));

// Initialize ScrollSmoother only on desktop
const mm = gsap.matchMedia();

ScrollSmoother.create({
    smooth: 3,
    effects: true,
    normalizeScroll: true,
    smoothTouch: true,
    ignoreMobileResize: true
});
