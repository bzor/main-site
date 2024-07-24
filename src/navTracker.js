
const navTracker = document.getElementById('nav-tracker');
const scrollIndicator = document.querySelector('.scroll-indicator');
let scrollIndicatorHidden = false;

export function initNavTracker() {
    const sections = document.querySelectorAll('#logo-block, #bio, .text-container');
    const progressIndicator = document.querySelector('.nav-progress');

    const totalHeight = document.body.getBoundingClientRect().height - window.innerHeight;
    let sectionWidths = [];

	gsap.set(navTracker, { top: -10 } );

    // Calculate widths for each section
	let prevTop = 0;
	let section, sectionTop;
	for(let i = 0; i < sections.length; i++){
		if(i < sections.length - 1){
			section = sections[i+1];
			sectionTop = section.getBoundingClientRect().y;
		} else {
			sectionTop = totalHeight;
		}
        const sectionWidth = ((sectionTop - prevTop) / totalHeight) * 100;
		prevTop = sectionTop;
		sectionWidths.push(sectionWidth);
	}

    // Create section indicators with calculated widths
	let secLeft = 0;
    sections.forEach((section, index) => {
        const sectionIndicator = document.createElement('div');
        sectionIndicator.classList.add('nav-section');
        sectionIndicator.style.width = `${sectionWidths[index]}%`;
        sectionIndicator.style.left = `${secLeft}%`;
        const sectionIndicatorInner = document.createElement('div');
        sectionIndicatorInner.classList.add('nav-section-inner');
		secLeft += sectionWidths[index];
        navTracker.appendChild(sectionIndicator);
        sectionIndicator.appendChild(sectionIndicatorInner);
    });

    // Update the position of the progress indicator
    function updateProgress() {
		progressIndicator.style.left = `calc(${st.progress * 100}% - 1px)`;

		if(st.progress < 0.003 && scrollIndicatorHidden){
			scrollIndicatorHidden = false;
			gsap.to(scrollIndicator, {duration: 0.4, autoAlpha: 1, ease: "power3.inOut"});
		}
		if(st.progress >= 0.003 && !scrollIndicatorHidden){
			scrollIndicatorHidden = true;
			gsap.to(scrollIndicator, {duration: 0.4, autoAlpha: 0, ease: "power3.inOut"});
		}	
    }

    // ScrollTrigger to update the progress indicator
    const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: updateProgress
    });
}

export function showNavTracker() {
	gsap.to(navTracker, {duration: 0.2, autoAlpha: 1, ease: "power1.out"});
	gsap.to(navTracker, {duration: 0.6, top: 0, ease: "power3.inOut"});
}