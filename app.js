document.addEventListener('DOMContentLoaded', () => {
    let allQuestions = [];
    let currentQuestionIndex = -1;
    let userAnswers = {}; // Stores answers: { "Si_Q1": 5, "TiTe_Q1": 1, ... }

    const titlePage = document.getElementById('title-page');
    const testArea = document.getElementById('test-area');
    const questionContainer = document.getElementById('question-container');
    const resultsPanel = document.getElementById('results-panel');
    const resultsLoading = document.getElementById('results-loading');
    const resultsContent = document.getElementById('results-content');

    const startButton = document.getElementById('start-test-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const calculateButton = document.getElementById('calculate-button');
    const clearTestButton = document.getElementById('clear-test-button'); // This button is still inside testArea

    // Navigation button container (now fixed footer)
    const navigationButtonsContainer = document.getElementById('navigation-buttons');


    // Existing progress bar elements (can be accessed directly or passed around)
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text'); // Still exists in HTML but hidden by CSS

    // --- Initialization ---
    async function initializeTest() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            document.title = data.testTitle || "Cosmic Mindscape Personality Test"; // Set page title
            titlePage.querySelector('h1').textContent = data.testTitle;

            // Flatten questions and add section info
            data.sections.forEach(section => {
                // Randomize Likert questions if it's the Likert section
                if (section.sectionType === 'likert') {
                    for (let i = section.questions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [section.questions[i], section.questions[j]] = [section.questions[j], section.questions[i]];
                    }
                }
                section.questions.forEach(q => {
                    allQuestions.push({
                        ...q,
                        sectionType: section.sectionType, // Ensure each question has its type
                        sectionTitle: section.sectionTitle, // And its original section title
                        // Store original slotLabels for temperament questions if they exist
                        slotLabels: section.sectionType === 'temperament_sorting' ? section.slotLabels : undefined
                    });
                });
            });

            setupEventListeners();
            showTitlePage();
        } catch (error) {
            console.error("Could not load questions:", error);
            questionContainer.innerHTML = "<p style='color: red;'>Error loading questions. Please try refreshing the page.</p>"; // Themed error text color
            // Hide test area and navigation buttons on error
            testArea.style.display = 'none';
            navigationButtonsContainer.style.display = 'none';
        }
    }

    function setupEventListeners() {
        startButton.addEventListener('click', startTest);
        prevButton.addEventListener('click', showPreviousQuestion);
        nextButton.addEventListener('click', showNextQuestion);
        calculateButton.addEventListener('click', handleSubmit);
        clearTestButton.addEventListener('click', resetTest);
        // Event delegation for input changes is set up once on testArea
        testArea.addEventListener('change', handleQuestionInputChange);
    }

    function showTitlePage() {
        titlePage.style.display = 'block';
        testArea.style.display = 'none';
        resultsPanel.style.display = 'none';
        navigationButtonsContainer.style.display = 'none'; // Hide nav buttons on title page
        currentQuestionIndex = -1;
        userAnswers = {};
        updateProgressBar();
        // Scroll to top when showing title page
        window.scrollTo(0, 0);
    }

    function startTest() {
        titlePage.style.display = 'none';
        testArea.style.display = 'block';
        resultsPanel.style.display = 'none';
        navigationButtonsContainer.style.display = 'flex'; // Show nav buttons once test starts
        currentQuestionIndex = 0;
        renderQuestion();
        updateNavigationButtons();
        updateProgressBar();
        // Scroll to top when starting test
        window.scrollTo(0, 0);
    }

    function resetTest() {
        if (confirm("Are you sure you want to clear your progress and start over?")) {
            showTitlePage();
        }
    }

    // --- Question Rendering ---
    function renderQuestion() {
        if (currentQuestionIndex < 0 || currentQuestionIndex >= allQuestions.length) {
            return;
        }
        const question = allQuestions[currentQuestionIndex];
        questionContainer.innerHTML = ''; // Clear previous content

        // Optional: Display section title
        // Always display section title for clarity in themed design?
        // Check if it's the first question or section title changed
        if (currentQuestionIndex === 0 || (currentQuestionIndex > 0 && allQuestions[currentQuestionIndex-1].sectionTitle !== question.sectionTitle)) {
            const sectionHeader = document.createElement('h2');
            sectionHeader.textContent = question.sectionTitle;
            questionContainer.appendChild(sectionHeader);
        }

        const qNumberDisplay = document.createElement('p');
        qNumberDisplay.innerHTML = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;
        qNumberDisplay.style.textAlign = 'center';
        qNumberDisplay.style.color = 'var(--text-primary)'; // Ensure color matches theme
        questionContainer.appendChild(qNumberDisplay);

        let questionElement;
        if (question.sectionType === 'likert') {
            questionElement = createLikertQuestion(question);
        } else if (question.sectionType === 'binary_attitude' || question.sectionType === 'overall_orientation') {
            questionElement = createBinaryQuestion(question);
        } else if (question.sectionType === 'temperament_sorting') {
            // Pass the specific question object which now contains slotLabels
            questionElement = createTemperamentQuestion(question);
        }
        if(questionElement) {
            questionContainer.appendChild(questionElement);
        } else {
            // Handle case where createQuestion function failed
            questionContainer.innerHTML += "<p style='color: red;'>Error rendering question.</p>";
        }


        // Scroll to the top of the question container (below the progress bar)
        // Added buffer for sticky progress bar
        // Check if progress container exists before trying to get its offset
        const progressContainerElement = document.getElementById('progress-container');
        let offset = 0;
        if (progressContainerElement) {
            offset = progressContainerElement.offsetHeight + parseInt(window.getComputedStyle(progressContainerElement).marginTop);
        }

        // Use requestAnimationFrame to ensure elements are rendered before scrolling
        requestAnimationFrame(() => {
            const targetScrollTop = questionContainer.offsetTop - offset;
            window.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        });
    }

    // Event handler for input changes within the test area (using delegation)
    function handleQuestionInputChange(event) {
        const target = event.target;
        // Only trigger for inputs within question groups inside the question container
        // and exclude the temperament sorter's hidden input for auto-next logic
        if (target.closest('#question-container .question-group') &&
            (target.type === 'radio' || (target.type === 'hidden' && target.classList.contains('ts-hidden-order')))) {

            // Store answer immediately for any relevant input change
            storeCurrentAnswer();
            updateProgressBar();  // Update progress bar on each interaction

            // Auto-next logic ONLY for radio buttons (Likert, Binary, Overall Orientation)
            // and ONLY if the question is answered AND it's not the last question.
            if (target.type === 'radio' && target.checked) {
                // Small delay to allow visual feedback of selection
                setTimeout(() => {
                    // Find the question object related to this input (by name)
                    const questionName = target.name;
                    const currentQuestion = allQuestions[currentQuestionIndex];

                    // Check if the changed input belongs to the current question AND the question is now validly answered
                    if (currentQuestion && currentQuestion.name === questionName && validateCurrentAnswer()) {
                        // Auto-next if not on the last question
                        if (currentQuestionIndex < allQuestions.length - 1) {
                            showNextQuestion(false); // false to skip re-validation in showNextQuestion
                        } else {
                            // If it's the last question and answered, update buttons to show calculate
                            updateNavigationButtons();
                        }
                    }
                }, 200); // Short delay
            }
        }
    }


    function createLikertQuestion(question) {
        const qDiv = document.createElement('div');
        qDiv.className = 'question-group';
        qDiv.innerHTML = `
            <p><strong>${question.text}</strong></p>
            <div class="likert-options" id="${question.id}">
                ${[1,2,3,4,5,6,7].map(val => `
                    <label>
                        <input type="radio" name="${question.name}" value="${val}" ${userAnswers[question.name] == val ? 'checked' : ''} required>
                        <span class="likert-visual">${val}</span>
                    </label>
                `).join('')}
            </div>
        `;
        return qDiv;
    }

    function createBinaryQuestion(question) {
        const qDiv = document.createElement('div');
        qDiv.className = 'question-group';
        if (question.legend) {
            const legendP = document.createElement('p');
            legendP.innerHTML = `<em>${question.legend}</em>`;
            legendP.style.color = 'var(--text-secondary)'; // Themed color for legend/emphasis text
            qDiv.appendChild(legendP);
        }
        qDiv.innerHTML += `
            <p><strong>${question.text}</strong></p>
            <div class="binary-choice-pair">
                <span class="binary-text binary-text-left">${question.option1Text}</span>
                <label class="binary-option binary-option-1">
                    <input type="radio" name="${question.name}" value="1" ${userAnswers[question.name] == 1 ? 'checked' : ''} required>
                    <span class="binary-visual"></span>
                </label>
                <label class="binary-option binary-option-2">
                    <input type="radio" name="${question.name}" value="2" ${userAnswers[question.name] == 2 ? 'checked' : ''} required>
                    <span class="binary-visual"></span>
                </label>
                <span class="binary-text binary-text-right">${question.option2Text}</span>
            </div>
        `;
        return qDiv;
    }

    function createTemperamentQuestion(question) {
        // Corrected: Get the div container, not the template tag
        const templateContainer = document.getElementById('temperament-sorter-template');
        // Check if the template container was found and has content
        if (!templateContainer || !templateContainer.firstElementChild) {
            console.error("Temperament sorter template or its content not found!", templateContainer);
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = "<p style='color: red;'>Error: Temperament question template content missing.</p>";
            return errorDiv; // Return an error message element
        }
        // Clone the fieldset directly (the first child of the div)
        const temperamentFieldset = templateContainer.firstElementChild.cloneNode(true);

        // Ensure the cloned element is visible (it's hidden by default in the template div)
        temperamentFieldset.style.display = 'block';

        // Now use temperamentFieldset for all subsequent queries and manipulations
        temperamentFieldset.querySelector('legend').textContent = question.legend;
        temperamentFieldset.querySelector('.ts-instruction').textContent = question.instructionText;

        const hiddenInput = temperamentFieldset.querySelector('.ts-hidden-order');
        hiddenInput.name = question.name;
        hiddenInput.id = question.name;

        const sortedArea = temperamentFieldset.querySelector('.sorted-area');
        sortedArea.innerHTML = ''; // Clear template slots
        // Use the slotLabels from the question object, falling back to default
        const slotLabels = question.slotLabels || ["MOST", "2nd", "3rd", "LEAST"];
        slotLabels.forEach((label, index) => {
            const slot = document.createElement('div');
            slot.className = 'sorted-slot';
            slot.dataset.rank = index + 1;
            slot.innerHTML = `<span class="slot-label">${label} (${index + 1})</span>`; // Adding rank number
            sortedArea.appendChild(slot);
        });

        const unsortedArea = temperamentFieldset.querySelector('.unsorted-area');
        unsortedArea.innerHTML = ''; // Clear template items
        const items = question.items;
        // Randomize initial order of unsorted items only if *not* restoring an answer
        // This ensures the items appear in a random order in the unsorted area if it's a fresh load
        // but are deterministic if reloading a page with answers (before repopulate moves them)
        if (!userAnswers[question.name]) {
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
        }
        items.forEach(item => {
            const sortable = document.createElement('div');
            sortable.className = 'sortable-item'; // CSS handles theme classes based on data-temperament
            sortable.dataset.temperament = item.temperament;
            // Use a span inside for text positioning relative to potential ::before/::after effects
            sortable.innerHTML = `<span>${item.text}</span>`;
            unsortedArea.appendChild(sortable);
        });

        // Initialize sorter logic using the cloned fieldset element and pass slotLabels
        initializeSingleTemperamentSorter(temperamentFieldset, question.name, slotLabels);

        // Set the stored value *after* sorter is initialized and items are added to unsorted area
        // This also triggers repopulation visually
        if (userAnswers[question.name]) {
            const storedValue = userAnswers[question.name];
            hiddenInput.value = storedValue; // Set the value on the hidden input
            // Visually move items to slots based on stored value, passing slotLabels
            repopulateTemperamentSorter(temperamentFieldset, storedValue, slotLabels);
            // No need to dispatch 'change' here, the updateHiddenInput inside sorter logic does it when items are moved.
        } else {
            // Ensure hidden input is initially empty if no answer stored
            hiddenInput.value = '';
        }

        return temperamentFieldset; // Return the created fieldset element
    }

    // Simplified sorter initialization for dynamically created elements
    // Added slotLabels parameter
    function initializeSingleTemperamentSorter(sorterElement, hiddenInputName, slotLabels) {
        const unsortedArea = sorterElement.querySelector('.unsorted-area');
        const sortedArea = sorterElement.querySelector('.sorted-area'); // Get sorted area for delegation
        const sortedSlots = Array.from(sortedArea.querySelectorAll('.sorted-slot'));
        const resetButton = sorterElement.querySelector('.reset-sort-button');
        const hiddenInput = sorterElement.querySelector(`input[name="${hiddenInputName}"]`);

        function updateHiddenInput() {
            const sortedTemperaments = [];
            // Iterate through slots in order to build the sorted string
            sortedSlots.forEach(slot => {
                const placedItem = slot.querySelector('.sortable-item.placed-in-slot');
                if (placedItem) {
                    sortedTemperaments.push(placedItem.dataset.temperament);
                }
                // If a slot is empty, push an empty string or placeholder if needed for validation,
                // but the validation check currently expects exactly 4, so missing means invalid.
            });
            // The hidden input value is only set once all 4 are in place for validation to pass.
            // Or set it always, and validation checks the length? The validation check expects length 4.
            // Let's only update the hidden input value when 4 items are placed.
            if (sortedTemperaments.length === 4) {
                hiddenInput.value = sortedTemperaments.join(',');
            } else {
                hiddenInput.value = ''; // Value is empty if not all 4 are placed
            }

            // Trigger change for progress bar and auto-next (if applicable)
            // The `handleQuestionInputChange` attached to testArea should catch this bubbling change
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Use event delegation for click on sortable items within the unsorted area
        unsortedArea.addEventListener('click', (event) => {
            const item = event.target.closest('.sortable-item');
            // Check if click was on an item and if it's currently in the unsorted area
            if (!item || item.parentElement !== unsortedArea) return;

            const targetSlot = sortedSlots.find(slot => !slot.querySelector('.sortable-item.placed-in-slot'));
            if (targetSlot) {
                // Move the actual item to the slot
                item.classList.add('placed-in-slot'); // Mark it as placed in a slot
                item.classList.add('placed'); // Mark the original item in unsorted area (for styling opacity)

                targetSlot.innerHTML = ''; // Clear placeholder/slot label *before* appending item
                targetSlot.appendChild(item); // Move the element

                updateHiddenInput();
            }
        });

        // Make placed items clickable to return to unsorted area
        // Use delegation on the sortedArea parent
        sortedArea.addEventListener('click', (event) => {
            const placedItem = event.target.closest('.sortable-item.placed-in-slot');
            if (!placedItem) return; // Click wasn't on a placed item in a slot

            const sourceSlot = placedItem.parentElement; // The slot the item is coming from

            // Ensure the item is removed from its current slot
            if (placedItem.parentElement) {
                placedItem.parentElement.removeChild(placedItem);
            }

            placedItem.classList.remove('placed-in-slot');
            placedItem.classList.remove('placed'); // Remove the 'placed' marker as it's back in unsorted

            unsortedArea.appendChild(placedItem); // Move item back

            // Restore the slot label in the now-empty slot
            const slotRank = parseInt(sourceSlot.dataset.rank);
            if (!isNaN(slotRank) && slotLabels[slotRank - 1] !== undefined) {
                sourceSlot.innerHTML = `<span class="slot-label">${slotLabels[slotRank - 1]} (${slotRank})</span>`;
            }

            updateHiddenInput(); // Update hidden input and trigger change
        });


        resetButton.addEventListener('click', () => {
            // Get all items currently in slots within *this* sorter element
            const itemsCurrentlyInSlots = Array.from(sorterElement.querySelectorAll('.sorted-area .sortable-item.placed-in-slot'));

            itemsCurrentlyInSlots.forEach(item => {
                // Remove from slot
                if (item.parentElement) {
                    item.parentElement.removeChild(item);
                }
                // Remove placed classes
                item.classList.remove('placed-in-slot');
                item.classList.remove('placed');
                // Append back to unsorted area
                unsortedArea.appendChild(item);
            });

            // Restore slot labels for all slots in this sorter
            sortedSlots.forEach((slot, index) => {
                slot.innerHTML = ''; // Clear content
                const labelSpan = document.createElement('span');
                labelSpan.classList.add('slot-label');
                // Use the provided labels
                const labelText = slotLabels[index] !== undefined ? `${slotLabels[index]} (${index + 1})` : `Rank ${index+1}`;
                labelSpan.textContent = labelText;
                slot.appendChild(labelSpan);
            });

            // Re-randomize the items in the unsorted area visually on reset
            const currentUnsortedItems = Array.from(unsortedArea.querySelectorAll('.sortable-item'));
            // Shuffle array (Fisher-Yates)
            for (let i = currentUnsortedItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentUnsortedItems[i], currentUnsortedItems[j]] = [currentUnsortedItems[j], currentUnsortedItems[i]];
            }
            // Append shuffled items back to the unsorted area to update DOM order
            unsortedArea.innerHTML = ''; // Clear existing
            currentUnsortedItems.forEach(item => unsortedArea.appendChild(item));


            hiddenInput.value = ''; // Clear the hidden input value
            updateHiddenInput(); // This will trigger change event (value is empty)
        });
    }

    // Helper to visually repopulate temperament sorter from stored answer
    // Added slotLabels parameter to restore labels correctly
    function repopulateTemperamentSorter(sorterElement, storedOrderString, slotLabels) {
        if (!storedOrderString) return;

        const sortedOrder = storedOrderString.split(',');
        if (sortedOrder.length !== 4) {
            console.warn("Stored temperament order is not 4 items:", storedOrderString);
            return; // Only repopulate if the stored order is valid
        }

        const sortedArea = sorterElement.querySelector('.sorted-area');
        const unsortedArea = sorterElement.querySelector('.unsorted-area');
        const slots = Array.from(sortedArea.querySelectorAll('.sorted-slot'));

        // Get all sortable items that were initially created for *this* sorter instance
        // A robust way is to find them anywhere within the sorter element.
        // This assumes no other .sortable-item elements exist outside this structure.
        // Or, get them from the unsorted area first, assuming that's where they are put on render.
        const allSortableItems = Array.from(unsortedArea.querySelectorAll('.sortable-item'));


        // Move items from current location (could be unsorted or wrong slot if re-rendering)
        // back to unsorted area first, and clean up classes.
        const itemsCurrentlySomewhere = Array.from(sorterElement.querySelectorAll('.sortable-item')); // Get all items within the sorter
        itemsCurrentlySomewhere.forEach(item => {
            // Only remove if they have a parent (i.e., are in the DOM)
            if (item.parentElement) {
                item.parentElement.removeChild(item);
            }
            item.classList.remove('placed-in-slot');
            item.classList.remove('placed');
            unsortedArea.appendChild(item); // Put them back in unsorted first
        });


        // Restore empty slot labels for all slots in this sorter
        sortedSlots.forEach((slot, index) => {
            slot.innerHTML = ''; // Clear content
            const labelSpan = document.createElement('span');
            labelSpan.classList.add('slot-label');
            // Use the provided labels
            const labelText = slotLabels && slotLabels[index] !== undefined ? `${slotLabels[index]} (${index + 1})` : `Rank ${index+1}`;
            labelSpan.textContent = labelText;
            slot.appendChild(labelSpan);
        });


        // Place items into slots according to the sortedOrder
        sortedOrder.forEach((temp, idx) => {
            // Find the item by temperament in the unsorted area list (where they were just placed)
            const itemToPlace = unsortedArea.querySelector(`.sortable-item[data-temperament="${temp}"]`);
            if (slots[idx]) {
                if (itemToPlace) {
                    // Move the existing item from unsortedArea to the slot
                    // No need to remove from unsortedArea first, appendChild handles it.
                    itemToPlace.classList.add('placed-in-slot');
                    itemToPlace.classList.add('placed'); // Mark original as placed (visual greyout)
                    slots[idx].innerHTML = ''; // Clear slot label before appending
                    slots[idx].appendChild(itemToPlace);
                } else {
                    console.warn(`Repopulate Error: Temperament item "${temp}" not found in unsorted area.`);
                }
            } else {
                console.warn(`Repopulate Error: Slot index ${idx} not found for repopulating temperament "${temp}".`);
            }
        });
        // After placing, ensure items remaining in unsorted area don't have the 'placed' class
        Array.from(unsortedArea.querySelectorAll('.sortable-item')).forEach(item => {
            if (!sortedOrder.includes(item.dataset.temperament)) {
                item.classList.remove('placed'); // Remove the 'placed' marker if it wasn't moved
            }
        });
    }


    // --- Answer Storage & Navigation ---
    function storeCurrentAnswer() {
        if (currentQuestionIndex < 0 || currentQuestionIndex >= allQuestions.length) return;
        const question = allQuestions[currentQuestionIndex];

        if (question.sectionType === 'temperament_sorting') {
            // The hidden input value is updated directly by the sorter's event listeners
            // We just ensure it's captured into userAnswers
            const hiddenInput = questionContainer.querySelector(`input[name="${question.name}"]`);
            if (hiddenInput) {
                // Only store if value is set (i.e., 4 items placed)
                if (hiddenInput.value && hiddenInput.value.split(',').length === 4) {
                    userAnswers[question.name] = hiddenInput.value;
                } else {
                    // Store null if not fully answered, so validation fails
                    userAnswers[question.name] = null;
                }
            } else {
                userAnswers[question.name] = null; // Should not happen if element created correctly
            }
        } else { // Likert or Binary (radio buttons) or Overall Orientation
            // Use name to select radio group within the current question container
            const radioGroupInputs = questionContainer.querySelectorAll(`input[type="radio"][name="${question.name}"]`);
            const checkedInput = Array.from(radioGroupInputs).find(rb => rb.checked);
            if (checkedInput) {
                userAnswers[question.name] = checkedInput.value;
            } else {
                // If nothing is checked (shouldn't happen with 'required'), store as null
                userAnswers[question.name] = null;
            }
        }
        // console.log('Answers:', userAnswers); // Debugging
    }

    function validateCurrentAnswer() {
        if (currentQuestionIndex < 0 || currentQuestionIndex >= allQuestions.length) return true; // No question to validate
        const question = allQuestions[currentQuestionIndex];

        if (question.sectionType === 'temperament_sorting') {
            // Check if the answer exists in userAnswers and represents exactly 4 items
            const answer = userAnswers[question.name];
            return answer && typeof answer === 'string' && answer.split(',').length === 4;
        } else { // Likert, Binary, Overall Orientation (radio)
            // Check if the answer exists in userAnswers for this question's name and is not null/undefined/empty string
            const answer = userAnswers[question.name];
            return answer !== null && answer !== undefined && answer !== '';
            // Note: parseInt validation done in updateProgressBar if needed for counting answered
        }
    }

    function showNextQuestion(performValidation = true) {
        // storeCurrentAnswer(); // Answer is already stored by the input change listener

        if (performValidation && !validateCurrentAnswer()) {
            alert("Please answer the current question before proceeding.");
            return;
        }

        if (currentQuestionIndex < allQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            // If it's the last question, clicking Next does nothing, the user must click Calculate.
            // The calculate button is already shown by updateNavigationButtons
        }
        updateNavigationButtons();
        // updateProgressBar(); // Progress bar updated by input change listener
    }

    function showPreviousQuestion() {
        // storeCurrentAnswer(); // Store just in case, though typically done on change
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
        updateNavigationButtons();
        // updateProgressBar(); // Progress bar updated by input change listener
    }

    function updateNavigationButtons() {
        // Toggle visibility of buttons within the fixed footer
        prevButton.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';

        const onLastQuestion = currentQuestionIndex === allQuestions.length - 1;
        const lastQuestionAnswered = validateCurrentAnswer(); // Check if the final question is answered

        if (onLastQuestion) {
            nextButton.style.display = 'none';
            // Only show calculate if on the last question AND it's answered
            calculateButton.style.display = lastQuestionAnswered ? 'inline-block' : 'none';
        } else {
            nextButton.style.display = 'inline-block';
            calculateButton.style.display = 'none';
        }
        // Ensure Clear button visibility is handled if it were in the footer
        // It is currently in testArea, so its visibility is tied to testArea.
    }

    // --- Progress Bar Update ---
    function updateProgressBar() {
        if (allQuestions.length === 0) {
            progressBar.style.width = '0%';
            testArea.dataset.progressText = '0%'; // Update data attribute for potential ::before text
            return;
        }

        // Count distinct answered questions with valid answers
        let distinctAnswered = 0;
        allQuestions.forEach(q => {
            // Check if the answer is in userAnswers and passes validation
            if (validateAnswerForQuestion(q, userAnswers[q.name])) {
                distinctAnswered++;
            }
        });

        const totalQuestions = allQuestions.length;
        const progressPercentage = totalQuestions > 0 ? Math.round((distinctAnswered / totalQuestions) * 100) : 0;

        progressBar.style.width = `${progressPercentage}%`;
        // Update data attribute on #test-area for custom text display via CSS ::before
        testArea.dataset.progressText = `${distinctAnswered}/${totalQuestions} answered (${progressPercentage}%)`;

        // Also update button visibility based on progress (specifically, calculate button)
        // This check is only needed when the *current* question's answer state changes.
        // updateNavigationButtons(); // This is called by handleQuestionInputChange already.
    }

    // Helper function to validate a stored answer against a specific question structure
    function validateAnswerForQuestion(question, answer) {
        if (answer === null || answer === undefined || answer === '') {
            return false; // No answer or empty string is not valid
        }

        if (question.sectionType === 'temperament_sorting') {
            return typeof answer === 'string' && answer.split(',').length === 4;
        } else { // Likert, Binary, Overall Orientation (radio)
            const answerValue = parseInt(answer);
            if (isNaN(answerValue)) return false; // Must be a number

            if (question.sectionType === 'likert') {
                return answerValue >= 1 && answerValue <= 7;
            } else if (question.sectionType === 'binary_attitude' || question.sectionType === 'overall_orientation') {
                return answerValue === 1 || answerValue === 2;
            }
        }
        return false; // Unknown question type or other validation issue
    }


    // --- Submission and Results ---
    function handleSubmit() {
        // Validate the last question explicitly before calculating
        if (!validateCurrentAnswer()) {
            alert("Please answer the final question before calculating your results.");
            return;
        }

        // Check if all questions are answered (optional, but good for completeness)
        const answeredCount = allQuestions.filter(q => validateAnswerForQuestion(q, userAnswers[q.name])).length;
        const totalQuestions = allQuestions.length;
        const allAnswered = answeredCount === totalQuestions;


        if (!allAnswered) {
            // If not all answered, show confirmation
            if (!confirm(`${answeredCount} out of ${totalQuestions} questions answered. Some questions might be unanswered or partially answered. Continue to results anyway?`)) {
                return;
            }
        }


        testArea.style.display = 'none';
        navigationButtonsContainer.style.display = 'none'; // Hide nav buttons on results screen
        resultsPanel.style.display = 'flex'; // Use flex for centering loading spinner
        resultsLoading.style.display = 'flex'; // Show loading spinner flex container
        resultsContent.innerHTML = ''; // Clear previous results content
        resultsContent.style.display = 'none'; // Hide content while loading

        // Scroll to the top of the results panel
        window.scrollTo(0, 0); // Scroll window to top

        // Show loading markup immediately
        resultsLoading.innerHTML = `<p>Forging Your Constellation...</p><div class="loader-animation"></div>`;

        // Simulate processing time for loading effect
        setTimeout(() => {
            // The existing scoring logic from score_calculator.js
            if (window.calculateAndFormatScores) {
                // Pass userAnswers and allQuestionsList (contains original question structure including slotLabels)
                const resultsData = window.calculateAndFormatScores(userAnswers, allQuestions);
                resultsLoading.style.display = 'none'; // Hide loading
                resultsContent.style.display = 'block'; // Show content
                displayFinalResults(resultsData);
            } else {
                resultsLoading.style.display = 'none';
                resultsContent.style.display = 'block';
                resultsContent.innerHTML = "<p style='color: red;'>Error: Scoring function not found.</p>";
                // Add retake button
                const retakeButton = document.createElement('button');
                retakeButton.id = 'retake-test-button'; // Use themed button ID
                retakeButton.textContent = "Retake Test";
                retakeButton.onclick = resetTest;
                resultsContent.appendChild(retakeButton);
            }
        }, 1000); // Adjust loading simulation time if desired (e.g., 1000ms)
    }

    // ... (other parts of app.js) ...

    function displayFinalResults(data) {
        resultsContent.innerHTML = ''; // Clear

        if (!data || !data.topResults || data.topResults.length === 0 || data.topResults[0].type === "N/A") {
            resultsContent.innerHTML = "<p>Could not calculate results. Please ensure you've answered enough questions.</p>";
            const retakeButton = document.createElement('button');
            retakeButton.id = 'retake-test-button';
            retakeButton.textContent = "Retake Test";
            retakeButton.onclick = resetTest;
            resultsContent.appendChild(retakeButton);
            return;
        }

        const primaryType = data.topResults[0].type;
        const stack = data.typeFunctionStacks && data.typeFunctionStacks[primaryType] ? data.typeFunctionStacks[primaryType] : ["N/A", "N/A", "N/A", "N/A"];
        const roleNames = ["Dominant Function", "Auxiliary Function", "Tertiary Function", "Inferior Function"];

        let html = `<h2>Your Stellar Signature: ${primaryType}</h2>`;

        const constellationContainer = document.createElement('div');
        constellationContainer.id = 'constellation-graphic-container';
        const constellationImg = document.createElement('img');
        constellationImg.src = `assets/constellations/${primaryType}.svg`;
        constellationImg.alt = `${primaryType} Stellar Constellation Graphic`;
        constellationImg.onerror = function() { this.style.display='none'; console.warn(`Constellation SVG not found for type: ${primaryType}`); };
        constellationContainer.appendChild(constellationImg);
        resultsContent.appendChild(constellationContainer);

        html += `
            <div class="function-stack-display">
                <p style="text-align: center; font-family: var(--font-heading); color: var(--accent-secondary); font-size: 1.3em; margin-bottom: 15px;">Your Cognitive Orbit</p>
                ${stack.map((func, index) => `
                    <p><strong>${roleNames[index]}</strong> ${func}</p>
                `).join('')}
            </div>
        `;

        // --- START: NEW "Explore your type" button ---
        if (primaryType && primaryType !== "N/A") {
            // Construct the link to the type page.
            // Assuming type pages are named like 'INFP.html', 'ISTJ.html', etc.
            // and are located in a 'types/' subfolder relative to index.html.
            const typePageLink = `types/${primaryType.toLowerCase()}.html`;

            html += `
                <div style="text-align: center; margin-bottom: 25px;">
                    <a href="${typePageLink}" class="explore-type-button">Explore Your ${primaryType} Constellation</a>
                </div>
            `;
        }
        // --- END: NEW "Explore your type" button ---


        html += `<h3>Top 3 Likely Stellar Signatures:</h3><ul>`;
        data.topResults.slice(0, 3).forEach(res => {
            if (res.type && res.type !== "N/A") {
                html += `<li>${res.type} <span>(Score: ${res.score.toFixed(2)})</span></li>`;
            }
        });
        if (data.topResults.filter(r => r.type && r.type !== "N/A").length < 3) {
            const validDisplayedCount = data.topResults.slice(0,3).filter(r => r.type && r.type !== "N/A").length;
            for (let i = validDisplayedCount; i < 3; i++) {
                html += `<li>N/A <span>(Score: N/A)</span></li>`;
            }
        }
        html += `</ul>`;

        html += `<div id="stats-for-nerds">
                    <h4>Behind the Stellar Data: Scoring Details</h4>`;
        const functionsOrder = data.functionsOrder || ['Si', 'Se', 'Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe'];
        html += "<p><strong>Raw Function Averages (Likert Scales):</strong><br>";
        functionsOrder.forEach(func => {
            const scoreVal = data.rawFunctionScores && data.rawFunctionScores[func] !== undefined ? data.rawFunctionScores[func].toFixed(2) : 'N/A';
            html += `${func}: ${scoreVal} `;
        });
        html += "</p>";

        html += "<p><strong>Attitude Preferences (Binary Pairs):</strong><br>";
        const attitudePairsOrder = data.attitudePairsOrder || [];
        const ATTITUDE_PAIR_FUNCTIONS = data.ATTITUDE_PAIR_FUNCTIONS || {};
        attitudePairsOrder.forEach(pairKey => {
            const counts = data.attitudeCounts && data.attitudeCounts[pairKey] || { pref1: 'N/A', pref2: 'N/A' };
            const funcs = ATTITUDE_PAIR_FUNCTIONS[pairKey] || ['Func1', 'Func2'];
            html += `${funcs[0]}: ${counts.pref1} | ${funcs[1]}: ${counts.pref2}<br>`;
        });
        html += "</p>";

        const rawTemperament1 = userAnswers['temperament_set1_order'] || '';
        const rawTemperament2 = userAnswers['temperament_set2_order'] || '';
        html += `<p><strong>Temperament Sorting Order:</strong><br>
                    Set 1: ${rawTemperament1 ? rawTemperament1.split(',').join(' > ') : 'Not sorted or incomplete'}<br>
                    Set 2: ${rawTemperament2 ? rawTemperament2.split(',').join(' > ') : 'Not sorted or incomplete'}</p>`;

        html += `<p><strong>I/E Orientation:</strong><br>
                    Introverted Preference: ${data.ieCounts ? data.ieCounts.I : 'N/A'} | Extraverted Preference: ${data.ieCounts ? data.ieCounts.E : 'N/A'}</p>`;
        html += `</div>`;

        html += `<button id="retake-test-button">Retake Test</button>`;
        resultsContent.innerHTML += html;

        resultsContent.querySelector('#retake-test-button').onclick = resetTest;

        // Scroll to top (already handled by window.scrollTo(0,0) in handleSubmit)
    }


    // Start the application
    initializeTest();
});
