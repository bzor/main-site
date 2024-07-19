export function fetchContentData() {
    return fetch('/contentData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        });
}

export function createContentBlocks(contentData) {
    const content = document.getElementById('smooth-content');

    contentData.forEach((block, index) => {
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.id = `text-container-${index}`;

        const detail = document.createElement('div');
        detail.className = 'content-detail';

        const label = document.createElement('span');
        label.className = 'content-label';
        label.textContent = `${block.label}`;

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
        description.textContent = block.description;

        const platform = document.createElement('p');
        platform.className = 'content-platform';
        platform.textContent = `Platform: ${block.platform}`;

        text.appendChild(title);
        text.appendChild(platform);
        text.appendChild(description);

        textContainer.appendChild(detail);
        textContainer.appendChild(text);

        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'images-container';
        imagesContainer.id = `images-container-${index}`;

        // Create empty divs for each image
        if (block.images && block.images.length > 0) {
            block.images.forEach(imagePath => {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'image-placeholder';
                imageDiv.style.height = '600px';
                imagesContainer.appendChild(imageDiv);
            });
        }

        content.appendChild(textContainer);
        content.appendChild(imagesContainer);
    });
}

export function createScrollTriggers(contentData) {
    ScrollTrigger.refresh();

    contentData.forEach((block, index) => {
        const textContainer = document.getElementById(`text-container-${index}`);
        const label = textContainer.querySelector('.content-label');
        const line = textContainer.querySelector('.content-line');
        const title = textContainer.querySelector('.content-title');
        const platform = textContainer.querySelector('.content-platform');
        const description = textContainer.querySelector('.content-description');

        // Reveal animation ScrollTrigger
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top bottom-=100px',
                end: 'bottom bottom',
                onEnter: () => {
                    gsap.to(label, { autoAlpha: 1, duration: 0.5 });
                    gsap.to(line, { scaleX: 1, duration: 0.5, transformOrigin: 'left' });
                    gsap.to(title, { autoAlpha: 1, y: 0, duration: 0.5 });
                    gsap.to(platform, { autoAlpha: 1, y: 0, duration: 0.5 });
                    gsap.to(description, { autoAlpha: 1, y: 0, duration: 0.5 });
                },
                markers: true // Remove or comment this out in production
            }
        });

        // Pinning animation ScrollTrigger
        gsap.timeline({
            scrollTrigger: {
                trigger: textContainer,
                start: 'top 80px',
                end: '+=600',
                pin: true,
                markers: true // Remove or comment this out in production
            }
        });
    });
}
