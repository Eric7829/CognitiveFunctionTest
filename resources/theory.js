// --- Table of Contents (TOC) Functionality for theory.html ---
// This script is very similar to the one used for individual type pages (e.g., istp.js)
// It dynamically creates a TOC sidebar based on <section> tags with IDs in main.content.

document.addEventListener('DOMContentLoaded', () => {
    let tocItems = []; // To store references to TOC <a> elements and their target sections

    function initializeTOC() {
        const tocContainer = document.createElement('nav');
        tocContainer.classList.add('toc-sidebar'); // Use the same class as type pages for styling
        tocContainer.innerHTML = '<h3>On This Page</h3><ul id="toc-list"></ul>'; // TOC Title

        const tocList = tocContainer.querySelector('#toc-list');
        if (!tocList) {
            console.warn("TOC list element not found in TOC container.");
            return;
        }

        // Select all sections with an ID within the main content
        const sections = document.querySelectorAll('.main-content section[id]');

        sections.forEach(section => {
            const sectionId = section.id;
            const sectionTitleElem = section.querySelector('h2'); // Use h2 as section title

            if (!sectionTitleElem) {
                console.warn(`Section with ID '${sectionId}' is missing an H2 for TOC title.`);
                return;
            }
            const sectionTitle = sectionTitleElem.textContent;

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${sectionId}`;
            link.textContent = sectionTitle;
            link.dataset.targetId = sectionId; // Store target ID for scroll highlighting

            // Smooth scroll event listener
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetElement = document.getElementById(sectionId);
                if (targetElement) {
                    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0; // Adjust for fixed header
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset - 15; // Extra 15px buffer

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    // Optionally update URL hash without page jump for history (can be tricky with smooth scroll)
                    // history.pushState(null, null, `#${sectionId}`);
                }
            });

            listItem.appendChild(link);
            tocList.appendChild(listItem);
            tocItems.push({ linkElement: link, sectionElement: section });
        });

        if (tocItems.length > 0) {
            // Insert TOC:
            // Try to insert it before the .page-wrapper if .page-wrapper exists at the body level
            // Otherwise, prepend to body as a fallback.
            const pageWrapper = document.querySelector('.page-wrapper');
            if (pageWrapper && pageWrapper.parentNode === document.body) {
                document.body.insertBefore(tocContainer, pageWrapper);
            } else {
                document.body.prepend(tocContainer); // Fallback if no page-wrapper directly under body
            }

            document.body.classList.add('body-has-toc'); // For responsive CSS adjustments
            window.addEventListener('scroll', handleTocScrollActiveState, { passive: true });
            handleTocScrollActiveState(); // Initial check on load
        } else {
            console.warn("No sections with H2 found for TOC generation.");
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

        // Adjust activationOffset to be slightly lower than center, to make it feel more natural
        // This means a section becomes active when its top part is in the upper ~40% of the screen.
        const activationOffset = viewportHeight * 0.25; // 25% down the viewport

        // Find the section whose top is just above the activation point
        for (let i = tocItems.length - 1; i >= 0; i--) {
            const item = tocItems[i];
            const section = item.sectionElement;
            const sectionTop = section.offsetTop; // Position relative to document top

            if (scrollY >= sectionTop - activationOffset) {
                currentActiveSectionId = section.id;
                break;
            }
        }

        // If scrolled to the very top, or no section is "active" by the above logic (e.g. above first section),
        // make the first TOC item active.
        if (currentActiveSectionId === null && tocItems.length > 0) {
            if (scrollY < tocItems[0].sectionElement.offsetTop - activationOffset + (viewportHeight*0.1) ) { // add some tolerance
                currentActiveSectionId = tocItems[0].sectionElement.id;
            }
        }
        // If at the bottom of the page and last section is fully visible or passed
        const totalPageHeight = document.documentElement.scrollHeight;
        const scrollPositionAtBottom = scrollY + viewportHeight;
        if (scrollPositionAtBottom >= totalPageHeight - 50 && tocItems.length > 0) { // 50px tolerance
            currentActiveSectionId = tocItems[tocItems.length - 1].sectionElement.id;
        }


        updateTocActiveState(currentActiveSectionId);
    }

    initializeTOC(); // Initialize the TOC on page load
});