export function initNavTracker() {
    const sections = document.querySelectorAll('#logo-block, #bio, .text-container');
    const navTracker = document.getElementById('nav-tracker');
    const progressIndicator = document.querySelector('.nav-progress');

    const totalHeight = document.body.getBoundingClientRect().height - window.innerHeight;
    let sectionWidths = [];



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

		/*
        let cumulativeWidth = 0;
        for (let i = 0; i < sectionWidths.length; i++) {
            cumulativeWidth += sectionWidths[i];
            if (progress <= cumulativeWidth) {
                progressIndicator.style.left = `calc(${cumulativeWidth}% - 1px)`;
                break;
            }
        }
			*/
    }

    // ScrollTrigger to update the progress indicator
    const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: updateProgress
    });
}
