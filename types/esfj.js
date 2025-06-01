// Data for ESFJ cognitive functions
const functionData = [
    {
        id: 'Fe',
        number: '01',
        label: 'Dominant', // ESFJ Dominant is Fe
        heading: 'Fe',
        body: 'Fe is your external antenna for the emotional atmosphere and group values. You naturally pick up on how others are feeling and what the group needs to create harmony and connection. You are motivated to respond to these external emotional cues, often prioritizing the well-being and feelings of the collective. It\'s about creating a positive social environment, building consensus, and ensuring everyone feels included and supported. You express your own feelings outwardly in a way that considers the impact on others.',
        howToDevelop: 'Practice active listening to others\' emotions, Work to build consensus and harmony in groups, Express appreciation for others openly, Participate in community or group activities focused on well-being.',
        auxiliaryText: 'The Dominant function is the most conscious and developed part of an individual\'s personality, emerging in early childhood. It shapes how a person primarily interacts with the world and processes information, often feeling like their natural state of being. Its primary purpose is to drive the individual\'s core motivations and preferences.',
        icon: '🤗' // Embracing/Group harmony
    },
    {
        id: 'Si',
        number: '02',
        label: 'Auxiliary', // ESFJ Auxiliary is Si
        heading: 'Si',
        body: 'Si is a deeply focused function on internal sensations, memories, and past experiences. It stores and recalls detailed sensory information, creating a comprehensive inner database of subjective impressions. Si users often value stability, routine, and tradition, finding comfort in the familiar and predictable. They are meticulous and diligent, relying on their past experiences to guide their present actions and decisions. Si often manifests as a strong memory for details and a tendency to refer back to established methods.',
        howToDevelop: 'Focus on concrete details and sensory input, Build consistency in routines and habits, Document and remember past experiences for future reference, Practice mindfulness to anchor yourself in the present moment.',
        auxiliaryText: 'The Auxiliary function, nicknamed "The Good Parent" because it is often influenced by good parenting during the early teen years, helps the Dominant function achieve its goals and balance it out by providing a different perspective. It develops over the course of the teenage years and into young adulthood.',
        icon: '📸' // Camera - Si memory/past/vivid impression
    },
    {
        id: 'Ne',
        number: '03',
        label: 'Tertiary', // ESFJ Tertiary is Ne
        heading: 'Ne',
        body: 'Ne is like fireworks, illuminating and expanding the mind with a burst of creativity and possibility, sparking new connections and ideas. Ne focuses on exploring the potential possibilities, implications, and connections within a situation or idea. It aims to understand the abstract, implicit qualities of a situation in an objective and unfiltered manner. Ne is innovative and open-ended, and is often characterized by a desire for new ideas and possibilities. It can be artistic, scientific, mechanical, or adventurous, and is often comfortable with self-expression.',
        howToDevelop: 'Brainstorming without judgment, Explore new concepts and diverse subjects, Connect seemingly unrelated ideas, Engage in creative problem-solving, Seek out novel experiences.',
        auxiliaryText: 'The Tertiary function is often referred to as the "Child" function, developing in adulthood and offering a playful, sometimes immature, way of expressing oneself. While less developed than the dominant and auxiliary, it provides balance and can be a source of relief or comfort when the primary functions are stressed. It represents an area for growth and development in later life.',
        icon: '🎇' // Fireworks
    },
    {
        id: 'Ti',
        number: '04',
        label: 'Inferior', // ESFJ Inferior is Ti
        heading: 'Ti',
        body: 'Ti is your internal logic engine, constantly analyzing and building a precise, consistent understanding of how things work. You excel at dissecting complex systems, finding underlying principles, and identifying logical inconsistencies purely for the sake of internal clarity. Your mind is a powerful laboratory where ideas are refined and structured into a personal, coherent framework. You value accuracy and truth based on your own rigorous analysis, making you a masterful problem-solver on a fundamental level.',
        howToDevelop: 'Dedicate time to independent research on topics of interest, Practice clarifying concepts for your own understanding, Analyze systems to find logical inconsistencies, Develop your critical thinking skills without external pressure.',
        auxiliaryText: 'The Inferior function, also known as the "Anima/Animus" or "Aspirational" function, is the least conscious and most underdeveloped of the four primary functions. It often emerges during times of stress or intense focus, sometimes leading to awkward or exaggerated behavior. While challenging to develop, it represents a path for significant personal growth and integration in the second half of life.',
        icon: '⚙️' // Gear/Logic
    }
];

// DOM element references within the component
const componentContainer = document.querySelector('.cognitive-function-component');
const functionIcon = componentContainer?.querySelector('.function-icon');
const functionHeading = componentContainer?.querySelector('.function-heading');
const functionLabel = componentContainer?.querySelector('.function-label');
const functionsCarousel = componentContainer?.querySelector('.functions-carousel');
const navigationBar = componentContainer?.querySelector('.navigation-bar');
const mouseCursor = componentContainer?.querySelector('.mouse-cursor'); // Added mouseCursor reference


// State variable for the current active function
let currentFunctionIndex = 0; // Default to Fe (index 0 for ESFJ)

/**
 * Initializes the Cognitive Function UI component.
 */
function initializeCognitiveFunctionsUI() {
    if (!componentContainer || !functionsCarousel || !navigationBar) {
        console.warn("Cognitive function component elements not found. Skipping initialization.");
        return;
    }

    const totalPages = functionData.length;

    functionsCarousel.innerHTML = ''; // Clear any existing content

    if (totalPages > 0) {
        functionsCarousel.style.width = `${totalPages * 100}%`;
    }

    functionData.forEach(func => {
        const functionPage = document.createElement('div');
        functionPage.classList.add('function-page');

        if (totalPages > 0) {
            functionPage.style.width = `${100 / totalPages}%`;
        }

        // Format howToDevelop with bullet points
        const howToDevelopHtml = func.howToDevelop.split(', ').map(item => `• ${item.trim()}`).join('<br>');

        functionPage.innerHTML = `
            <p class="body-text">${func.body}</p>
            <h3 class="how-to-develop-heading">How to develop ${func.heading}:</h3>
            <p class="how-to-develop-text">${howToDevelopHtml}</p>
            <div class="auxiliary-text">${func.auxiliaryText}</div>
        `;
        functionsCarousel.appendChild(functionPage);
    });

    navigationBar.innerHTML = '';
    functionData.forEach((func, index) => {
        const navItem = document.createElement('div');
        navItem.classList.add('nav-item');
        navItem.dataset.index = index;
        navItem.innerHTML = `
            <span class="nav-label">${func.id}</span>
            <span class="nav-number">${func.number}</span>
        `;
        navItem.addEventListener('click', handleNavClick);
        navigationBar.appendChild(navItem);
    });

    updateCognitiveFunctionDisplay(currentFunctionIndex);
}

function updateHeader(index) {
    if (!functionIcon || !functionHeading || !functionLabel) return;
    const func = functionData[index];
    functionIcon.textContent = func.icon;
    functionHeading.textContent = func.heading;
    functionLabel.textContent = func.label;
}

function slideContent(index) {
    if (!functionsCarousel) return;
    const totalPages = functionData.length;
    if (totalPages === 0) return;

    const translateXValue = -index * (100 / totalPages);
    functionsCarousel.style.transform = `translateX(${translateXValue}%)`;
}

function updateNavigationHighlight(index) {
    if (!navigationBar) return;
    const navItems = navigationBar.querySelectorAll('.nav-item');
    navItems.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add('active');
            if (mouseCursor) moveMouseCursor(item); // Renamed from moveCursor
        } else {
            item.classList.remove('active');
        }
    });
}

function handleNavClick(event) {
    const clickedItem = event.target.closest('.nav-item');
    if (clickedItem) {
        const index = parseInt(clickedItem.dataset.index);
        if (index !== currentFunctionIndex) {
            currentFunctionIndex = index;
            updateCognitiveFunctionDisplay(currentFunctionIndex);
        }
    }
}

function updateCognitiveFunctionDisplay(index) {
    updateHeader(index);
    slideContent(index);
    updateNavigationHighlight(index);
}

function moveMouseCursor(activeNavItem) { // Renamed from moveCursor
    if (!mouseCursor || !navigationBar || !componentContainer) return;

    const navBarRect = navigationBar.getBoundingClientRect();
    const itemRect = activeNavItem.getBoundingClientRect();
    const componentRect = componentContainer.getBoundingClientRect();

    const cursorOffsetX = itemRect.left + (itemRect.width / 2) - componentRect.left;
    const cursorOffsetY = (itemRect.top - componentRect.top) + itemRect.height + 3;

    mouseCursor.style.left = `${cursorOffsetX - (mouseCursor.offsetWidth / 2)}px`;
    mouseCursor.style.top = `${cursorOffsetY}px`;
    mouseCursor.style.opacity = '1';
}


// --- Table of Contents (TOC) Functionality ---
let tocItems = []; // To store references to TOC <a> elements and their target sections

function initializeTOC() {
    const tocContainer = document.createElement('nav');
    tocContainer.classList.add('toc-sidebar');
    tocContainer.innerHTML = '<h3>Table of Contents</h3><ul id="toc-list"></ul>';

    const tocList = tocContainer.querySelector('#toc-list');
    if (!tocList) return;

    // Select all sections with an ID within the main content
    const sections = document.querySelectorAll('.main-content section[id]');

    sections.forEach(section => {
        const sectionId = section.id;
        const sectionTitleElem = section.querySelector('h2'); // Use h2 as section title
        if (!sectionTitleElem) return;

        const sectionTitle = sectionTitleElem.textContent;

        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${sectionId}`;
        link.textContent = sectionTitle;
        link.dataset.targetId = sectionId;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
                // Calculate target position considering potential fixed header offset
                const headerOffset = 0; // No fixed header to account for currently
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Manually update hash for history and direct linking (optional)
                // history.pushState(null, null, `#${sectionId}`);
            }
        });

        listItem.appendChild(link);
        tocList.appendChild(listItem);
        tocItems.push({ linkElement: link, sectionElement: section });
    });

    if (tocItems.length > 0) {
        // Insert TOC before the page wrapper
        document.body.insertBefore(tocContainer, document.querySelector('.page-wrapper'));
        document.body.classList.add('body-has-toc');
        window.addEventListener('scroll', handleTocScrollActiveState, { passive: true });
        handleTocScrollActiveState(); // Initial check on load
    }
}

function updateTocActiveState(activeSectionId) {
    tocItems.forEach(item => {
        if (item.linkElement.dataset.targetId === activeSectionId) {
            item.linkElement.classList.add('active');
        } else {
            item.linkElement.classList.remove('active');
        }
    });
}

function handleTocScrollActiveState() {
    if (tocItems.length === 0) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    let currentActiveSectionId = null;

    // Define an activation point relative to the top of the viewport
    // A section is considered active if its top edge is between this point and the next section's top edge
    const activationOffset = viewportHeight * 0.3; // 30% down the viewport, adjust as needed

    // Find the section whose top is just above the activation point
    for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        const section = item.sectionElement;
        const sectionTop = section.offsetTop; // Position relative to document top

        // Check if the scroll position is at or past the section's top + offset
        if (scrollY >= sectionTop - activationOffset) {
            currentActiveSectionId = section.id;
            break; // Found the current section
        }
    }

    // Handle the case when the user is at the very top of the page
    // Ensure the first section is active when scrolled near the top
    if (scrollY < tocItems[0].sectionElement.offsetTop - (viewportHeight * 0.1) && tocItems.length > 0) { // Add some tolerance
        currentActiveSectionId = tocItems[0].sectionElement.id;
    }


    updateTocActiveState(currentActiveSectionId);
}


// --- Initialize all UI components on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    initializeCognitiveFunctionsUI();
    initializeTOC(); // This will now include the new section
});