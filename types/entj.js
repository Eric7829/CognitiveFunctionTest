// Data for ENTJ cognitive functions
const functionData = [
    {
        id: 'Te',
        number: '01',
        label: 'Dominant', // ENTJ Dominant is Te
        heading: 'Te',
        body: 'Te is all about bringing order, logic, and efficiency to the external world. It\'s the drive to organize resources, people, and plans to achieve clear, objective goals effectively. You likely feel a pull to structure your environment, create systems, and ensure things are running smoothly and productively. Decisions are often based on what makes the most logical sense externally, using objective criteria, data, and established procedures. It\'s about getting things *done* in the real world and seeing tangible, demonstrable results.',
        howToDevelop: 'Organize tasks and environments efficiently, Set clear and measurable goals, Implement plans and follow through, Seek objective feedback on your methods, Delegate tasks and manage resources effectively.',
        auxiliaryText: 'The Dominant function is the most conscious and developed part of an individual\'s personality, emerging in early childhood. It shapes how a person primarily interacts with the world and processes information, often feeling like their natural state of being. Its primary purpose is to drive the individual\'s core motivations and preferences.',
        icon: '📊' // Graph - External data
    },
    {
        id: 'Ni',
        number: '02',
        label: 'Auxiliary', // ENTJ Auxiliary is Ni
        heading: 'Ni',
        body: 'Ni gives you quiet, often sudden, flashes of insight into underlying meanings or a sense of where things are heading in the future. It’s not about brainstorming many possibilities, but rather getting a singular, sometimes mysterious, "aha!" moment that reveals a deeper pattern or trajectory. This function can help you connect abstract ideas internally and provides a sense of foresight, even if it’s difficult to articulate how you arrived at the conclusion.',
        howToDevelop: 'Pay attention to recurring patterns or symbols in your thoughts, Allow for quiet reflection time without external input, Journal about your insights or hunches, Explore abstract concepts or theories that intrigue you.',
        auxiliaryText: 'The Auxiliary function, nicknamed "The Good Parent" because it is often influenced by good parenting during the early teen years, helps the Dominant function achieve its goals and balance it out by providing a different perspective. It develops over the course of the teenage years and into young adulthood.',
        icon: '🔮' // Crystal Ball/Insight
    },
    {
        id: 'Se',
        number: '03',
        label: 'Tertiary', // ENTJ Tertiary is Se
        heading: 'Se',
        body: 'Se connects you powerfully to the immediate physical world. It’s an extraordinary awareness of what is happening right now – the sights, sounds, sensations, and opportunities present in the environment. You learn and thrive by engaging directly with reality, reacting spontaneously and effectively to whatever comes your way. There’s an energy and focus on the present moment, making you adept at hands-on activities and experiencing life vividly and directly.',
        howToDevelop: 'Engage in hands-on activities and sports, Practice mindfulness to stay grounded in the present, Seek out new physical experiences and environments, Respond readily to immediate opportunities as they arise.',
        auxiliaryText: 'The Tertiary function is often referred to as the "Child" function, developing in adulthood and offering a playful, sometimes immature, way of expressing oneself. While less developed than the dominant and auxiliary, it provides balance and can be a source of relief or comfort when the primary functions are stressed. It represents an area for growth and development in later life.',
        icon: '👁️' // Eye/Senses/Present
    },
    {
        id: 'Fi',
        number: '04',
        label: 'Inferior', // ENTJ Inferior is Fi
        heading: 'Fi',
        body: 'Fi is a deeply introspective function, focused on understanding and defining one\'s own internal value system and emotional landscape. It involves a strong sense of personal identity, authenticity, and a desire to live in alignment with one\'s core beliefs. Fi users are often highly empathetic, able to connect with others\' feelings by relating them to their own emotional experiences. They prioritize inner harmony and moral consistency, often striving for personal growth and self-awareness.',
        howToDevelop: 'Practice introspection through journaling or meditation, Understand and articulate your core values, Express your feelings authentically and constructively, Engage in activities that align with your personal ethics.',
        auxiliaryText: 'The Inferior function, also known as the "Anima/Animus" or "Aspirational" function, is the least conscious and most underdeveloped of the four primary functions. It often emerges during times of stress or intense focus, sometimes leading to awkward or exaggerated behavior. While challenging to develop, it represents a path for significant personal growth and integration in the second half of life.',
        icon: '💖' // Heart - Fi values/emotions
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
let currentFunctionIndex = 0; // Default to Te (index 0 for ENTJ)

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