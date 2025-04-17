// --- START OF FILE script.js ---

// --- Define Constants Outside the Listener ---
const functions = ['Si', 'Se', 'Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe'];
const attitudePairs = ['NiNe', 'TiTe', 'FiFe', 'SiSe'];
const binaryChoiceQuestions = ['Ti_Fe', 'Fi_Te', 'Si_Ne', 'Ni_Se'];
const typeFunctionStacks = {
    'INTP': ['Ti', 'Ne', 'Si', 'Fe'], 'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
    'ISTP': ['Ti', 'Se', 'Ni', 'Fe'], 'ESTP': ['Se', 'Ti', 'Fe', 'Ni'],
    'INFJ': ['Ni', 'Fe', 'Ti', 'Se'], 'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'],
    'INTJ': ['Ni', 'Te', 'Fi', 'Se'], 'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
    'ISFP': ['Fi', 'Se', 'Ni', 'Te'], 'ESFP': ['Se', 'Fi', 'Te', 'Ni'],
    'INFP': ['Fi', 'Ne', 'Si', 'Te'], 'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
    'ISTJ': ['Si', 'Te', 'Fi', 'Ne'], 'ESTJ': ['Te', 'Si', 'Ne', 'Fi'],
    'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'], 'ESFJ': ['Fe', 'Si', 'Ne', 'Ti']
};
const temperamentGroups = {
    'NT': ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    'NF': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    'SJ': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'SP': ['ISTP', 'ISFP', 'ESTP', 'ESFP']
};
const temperamentRankScores = [3, 1.5, 0, -1.5]; // Scores for 1st, 2nd, 3rd, 4th rank

const likertQuestionsPerFunction = 3;
const binaryAttitudeQuestionsPerPair = 3;
// binaryChoiceQuestions is defined above
const ieQuestionNames = ['I_E', 'I_E2', 'I_E3'];
// attitudePairs is defined above

const reverseScoredQuestions = new Set([
    'Si_Q3', 'Se_Q3', 'Ni_Q3', 'Ne_Q3',
    'Ti_Q3', 'Te_Q3', 'Fi_Q3', 'Fe_Q3'
]);

document.getElementById('personalitySurvey').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const answers = {};
    for (let [key, value] of formData.entries()) {
        // Ensure numbers are parsed, keep strings for temperament order
        if (key.startsWith('temperament_')) {
             answers[key] = value; // Keep as string "NT,SJ,SP,NF"
        } else {
             answers[key] = parseInt(value);
        }
    }



    // --- Suppression Function (Smooth Sigmoid Version) ---
    function applySuppression(functionScores, suppressionThreshold = 1.2, suppressionFactor = 0.4, smoothnessFactor = 4.0) {
        if (!functionScores || Object.keys(functionScores).length === 0) {
            return {};
        }
        let highestScore = 0;
        for (const func in functionScores) {
            if (functionScores[func] > highestScore) {
                highestScore = functionScores[func];
            }
        }
        const adjustedScores = {};
        if (highestScore <= 1e-6) {
            return { ...functionScores };
        }
        for (const func in functionScores) {
            const score = functionScores[func];
            const safeScore = Math.max(score, 1.0);
            const relativeDifference = highestScore / safeScore;
            const exponent = -smoothnessFactor * (relativeDifference - suppressionThreshold);
            const sigmoidPart = 1 / (1 + Math.exp(exponent));
            let multiplier = 1.0 - (1.0 - suppressionFactor) * sigmoidPart;
            multiplier = Math.max(suppressionFactor, Math.min(1.0, multiplier));
            adjustedScores[func] = score * multiplier;
        }
        return adjustedScores;
    }

    // --- 1. Function Preference Calculation ---
    let functionScores = {};
    let rawFunctionScores = {}; // Store raw scores here
    let allScoresValid = true;
    functions.forEach(func => {
        let scores = [];
        for (let i = 1; i <= likertQuestionsPerFunction; i++) {
            const key = `${func}_Q${i}`;
            // Check if the key exists and is a number (skip temperament keys here)
            if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && !isNaN(answers[key])) {
                let scoreValue = answers[key];
                if (reverseScoredQuestions.has(key)) {
                    scoreValue = 8 - scoreValue; // Apply reverse scoring
                }
                scores.push(scoreValue);
            }
        }

        if (scores.length === likertQuestionsPerFunction) {
            const sum = scores.reduce((a, b) => a + b, 0);
            rawFunctionScores[func] = sum / scores.length; // Store raw score
            functionScores[func] = sum / scores.length; // Initially set functionScores to raw as well

        } else {
            console.warn(`Warning: Function ${func} - Did not find ${likertQuestionsPerFunction} valid scores. Found ${scores.length}. Setting score to 1.`);
            rawFunctionScores[func] = 1.0; // Store 1.0 for raw score as well
            functionScores[func] = 1.0;

            allScoresValid = false;
        }
    });

    // Apply Smooth Suppression
    if (allScoresValid && Object.keys(functionScores).length > 0) {
        functionScores = applySuppression(functionScores, 1.14, 0.5, 4.0);
    } else {
        console.warn("Skipping suppression due to invalid initial scores.");
    }

     // Check if function_scores is still meaningful
    if (Object.keys(functionScores).length === 0) {
         // Use the new displayResults function structure, even for errors
         displayResults({ topResults: [{ type: "Error", dom: "N/A", aux: "N/A", score: 0.0 }] });
         return; // Stop processing
    }

    // --- 2. Function Attitude Preference (for scoring) ---
    const attitudePreferences = {};
    // attitudePairs defined earlier
    attitudePairs.forEach(pair => {
        let pref1Count = 0;
        let pref2Count = 0;
        for (let i = 1; i <= binaryAttitudeQuestionsPerPair; i++) {
            const key = `${pair}_Q${i}`;
            if (answers.hasOwnProperty(key) && typeof answers[key] === 'number') { // Ensure it's a number answer
                if (answers[key] === 1) pref1Count++;
                else if (answers[key] === 2) pref2Count++;
            }
        }
        if (pref1Count > pref2Count) attitudePreferences[pair] = 1;
        else if (pref2Count > pref1Count) attitudePreferences[pair] = 2;
        else attitudePreferences[pair] = null;
    });

    // --- 3. Binary Choice Preference (Axis) ---
    const binaryPreferences = {};
    binaryChoiceQuestions.forEach(col => {
         const key = col; // Key is like 'Ti_Fe'
         if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && [1, 2].includes(answers[key])) {
            binaryPreferences[col] = answers[key];
        } else {
            binaryPreferences[col] = null;
        }
    });

    // --- 4. Introversion/Extraversion Preference ---
    const ieAnswers = [];
    ieQuestionNames.forEach(name => {
         const key = name; // Key is like 'I_E'
         if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && [1, 2].includes(answers[key])) {
            ieAnswers.push(answers[key]); // Store 1 for Introverted, 2 for Extraverted
        } else {
            ieAnswers.push(null); // Store null if question is unanswered or invalid
        }
    });

    // --- 5. Temperament Preference Calculation ---
    const temperamentBoosts = {}; // Store boosts per MBTI type
    Object.keys(typeFunctionStacks).forEach(type => temperamentBoosts[type] = 0); // Initialize boosts to 0

    // Process Set 1
    const sortedSet1 = answers['temperament_set1_order'] ? answers['temperament_set1_order'].split(',') : [];
    if (sortedSet1.length === 4) { // Only score if fully sorted
        sortedSet1.forEach((temperament, index) => {
            const score = temperamentRankScores[index];
            const typesToBoost = temperamentGroups[temperament] || [];
            typesToBoost.forEach(type => {
                temperamentBoosts[type] += score;
            });
        });
    } else if (answers['temperament_set1_order']) { // Log if partially sorted but don't score
         console.warn("Temperament Set 1 not fully sorted, skipping boost calculation for this set.");
    }

     // Process Set 2
    const sortedSet2 = answers['temperament_set2_order'] ? answers['temperament_set2_order'].split(',') : [];
     if (sortedSet2.length === 4) { // Only score if fully sorted
        sortedSet2.forEach((temperament, index) => {
            const score = temperamentRankScores[index];
            const typesToBoost = temperamentGroups[temperament] || [];
            typesToBoost.forEach(type => {
                temperamentBoosts[type] += score; // Add to existing boost
            });
        });
    } else if (answers['temperament_set2_order']) { // Log if partially sorted but don't score
        console.warn("Temperament Set 2 not fully sorted, skipping boost calculation for this set.");
    }

    // --- 6. Jungian Type Scoring and Ranking ---
    const typeScores = {};
    const validScores = Object.values(functionScores).filter(s => !isNaN(s));
    const overallAverageScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 1.0;
    

    Object.entries(typeFunctionStacks).forEach(([mbtiType, stack]) => {
        let score = 0;
        const functionStackScores = stack.map(func => functionScores[func] || 1.0); // Get scores, default to 1.0 if missing
        const localAverageScore = functionStackScores.length > 0
            ? functionStackScores.reduce((a, b) => a + b, 0) / functionStackScores.length
            : 1.0;
        // Calculate weighted score from function stack (using suppressed scores)
        stack.forEach((func, i) => {
            const rawScore = functionScores[func] !== undefined ? functionScores[func] : 1.0;
            let weight = 0;
            if (i === 0) weight = 4;
            else if (i === 1) weight = 3.2;
            else if (i === 2) weight = 2.4;
            else weight = 1.8;
            const deviation = rawScore - overallAverageScore;
            const localDeviation = rawScore - localAverageScore;
            let penalty = 0;
            if (i === 0) penalty = Math.max(0, -deviation) * 3.0;
            else if (i === 1) {
                penalty = Math.max(0, -deviation) * 0.5;
                if (rawScore > functionScores[stack[0]]) {
                     penalty += (rawScore - functionScores[stack[0]]) * 0.5;
                }
            }
            else if (i === 2) penalty = Math.abs(deviation) * 0.5;
            else penalty = Math.max(0, localDeviation) * 4.0;
            const weightedScore = rawScore * weight;
            const adjustedScore = weightedScore - penalty;
            score += adjustedScore;
        });

        // Add attitude preference boost (using attitudePreferences)
        let attitudeBoost = 0;
        Object.entries(attitudePreferences).forEach(([pairKey, pref]) => {
             if (pref !== null) {
                const func1Type = pairKey.substring(0, 2);
                const func2Type = pairKey.substring(2, 4);
                const domFuncBase = stack[0].substring(0, 2);
                const auxFuncBase = stack[1].substring(0, 2);
                const tertFuncBase = stack[2].substring(0, 2);
                if (pref === 1) { // Prefers func1 (e.g., Ni over Ne)
                    if (domFuncBase === func1Type) attitudeBoost += 2.5;
                    if (auxFuncBase === func1Type) attitudeBoost += 1.5;
                    if (tertFuncBase === func1Type) attitudeBoost += 1.0; // Original logic kept
                } else if (pref === 2) { // Prefers func2 (e.g., Ne over Ni)
                    if (domFuncBase === func2Type) attitudeBoost += 2.0; // Slightly less boost for external preference? Okay.
                    if (auxFuncBase === func2Type) attitudeBoost += 1.5;
                    if (tertFuncBase === func2Type) attitudeBoost += 1.0; // Adjusted logic as discussed
                }
            }
        });
        score += attitudeBoost;

        // Add binary choice preference boost (Axis - using binaryPreferences)
        let binaryBoost = 0;
        Object.entries(binaryPreferences).forEach(([binaryCol, choice]) => {
             if (choice !== null && binaryCol !== null) {
                const func1Bin = binaryCol.substring(0, 2);
                const func2Bin = binaryCol.substring(3, 5);
                if (choice === 1) { // Prefers axis func 1 (e.g., Ti in Ti_Fe)
                    if (stack[0].startsWith(func1Bin) || stack[1].startsWith(func1Bin)) binaryBoost += 1.5;
                } else if (choice === 2) { // Prefers axis func 2 (e.g., Fe in Ti_Fe)
                    if (stack[0].startsWith(func2Bin) || stack[1].startsWith(func2Bin)) binaryBoost += 1.5;
                }
            }
        });
        score += binaryBoost;

        // Add I/E preference boost (using ieAnswers)
        let ieBoost = 0;
        const typeOrientation = mbtiType[0]; // 'I' or 'E'
        ieAnswers.forEach(answer => {
            if (answer !== null) { // Only consider answered questions
                if (answer === 1 && typeOrientation === 'I') ieBoost += 1.5;
                else if (answer === 2 && typeOrientation === 'E') ieBoost += 1.5;
            }
        });
        score += ieBoost;

        // --- Add Temperament Boost ---
        score += (temperamentBoosts[mbtiType] || 0); // Add the calculated boost for this type

        // Store final score
        typeScores[mbtiType] = Math.max(0, score); // Ensure score isn't negative
    });

    // Sort and get top types
    const sortedTypes = Object.entries(typeScores)
        .map(([mbti_type, score_val]) => ({
            type: mbti_type,
            score: score_val,
            dom: typeFunctionStacks[mbti_type][0],
            aux: typeFunctionStacks[mbti_type][1]
        }))
        .sort((a, b) => b.score - a.score); // Sort descending by score

    // Get top 3 results
    const topResults = sortedTypes.slice(0, 3);

     // Ensure we always have 3 results for display consistency, padding if needed
    while (topResults.length < 3) {
        // Check if there are more actual results to add
        if (sortedTypes.length > topResults.length) {
            topResults.push(sortedTypes[topResults.length]);
        } else {
            // Pad with N/A if no more actual results exist
            topResults.push({ type: "N/A", dom: "N/A", aux: "N/A", score: 0.0 });
        }
    }

    // --- NEW: Calculate I/E counts (for display) ---
    const ieCounts = { I: 0, E: 0 };
    ieAnswers.forEach(answer => { // Use the already calculated ieAnswers
        if (answer === 1) ieCounts.I++;
        else if (answer === 2) ieCounts.E++;
    });

    // --- NEW: Collect attitude counts (for display) ---
    const attitudeCounts = {};
    // attitudePairs defined earlier
    attitudePairs.forEach(pair => {
        let pref1Count = 0;
        let pref2Count = 0;
        for (let i = 1; i <= binaryAttitudeQuestionsPerPair; i++) {
            const key = `${pair}_Q${i}`;
            if (answers.hasOwnProperty(key) && typeof answers[key] === 'number') {
                if (answers[key] === 1) pref1Count++;
                else if (answers[key] === 2) pref2Count++;
            }
        }
        attitudeCounts[pair] = { pref1: pref1Count, pref2: pref2Count };
    });


    // --- 7. Call displayResults with comprehensive data ---
    displayResults({
        topResults: topResults,
        functionScores: functionScores, // Keep functionScores as suppressed for other calculations if needed
        rawFunctionScores: rawFunctionScores, // Pass raw scores here
        attitudeCounts: attitudeCounts,
        binaryPreferences: binaryPreferences,
        temperamentSet1: answers['temperament_set1_order'] || 'Not sorted',
        temperamentSet2: answers['temperament_set2_order'] || 'Not sorted',
        ieCounts: ieCounts
    });

}); // End of submit event listener


// --- REPLACED Helper function to display results in the HTML ---
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>'; // Clear previous results

    // Check for errors or empty results
    if (!data.topResults || data.topResults.length === 0 || data.topResults[0].type === "Error") {
        resultsDiv.innerHTML += '<p>Could not determine types. Please ensure all questions are answered.</p>';
        return;
    }

    // Display main results (Top 3 Types)
    const resultsList = document.createElement('ul');
    data.topResults.forEach((result, index) => {
        const listItem = document.createElement('li');
        // Handle potential N/A scores gracefully
        const scoreDisplay = result.score !== undefined && result.score !== null ? result.score.toFixed(2) : "N/A";
        // *** This is the display logic from the original function ***
        listItem.innerHTML = `
            ${index + 1}. <span>Type:</span> ${result.type}
            (<span>Dom:</span> ${result.dom}, <span>Aux:</span> ${result.aux}),
            <span>Score:</span> ${scoreDisplay}
        `;
        resultsList.appendChild(listItem);
    });
    resultsDiv.appendChild(resultsList); // Add the list of top types

    // Conclusion Paragraph (Moved before details as per original flow)
    resultsDiv.innerHTML += `<p>These results point to your most probable personality types within this framework. The top 3 are excellent starting points for exploration – delve into each to discover which feels most accurate. Personality is multifaceted, so consider this test as just one step in your self-discovery journey. Don't forget to check out the Type Descriptions on this site for deeper insights!</p>`;


    // --- NEW: Detailed Section ---
    const detailsSection = document.createElement('div');
    detailsSection.innerHTML = '<h3>Details (for nerds only)</h3>';

    // Prepare content for details section
    let funcScoresText = '<strong>Raw Function Averages (Presuppression):</strong><br>'; // Changed label to indicate raw scores
    // Use the globally defined functions array
    functions.forEach(func => {
        // Check if raw function score exists before trying to display it and use rawFunctionScores here
        const scoreVal = data.rawFunctionScores && data.rawFunctionScores[func] !== undefined ? data.rawFunctionScores[func].toFixed(2) : 'N/A';
        funcScoresText += `${func}: ${scoreVal}<br>`;
    });

    let attitudeText = '<br><strong>Attitude Preferences:</strong><br>';
    // Use the globally defined attitudePairs array
    attitudePairs.forEach(pair => {
        const counts = data.attitudeCounts ? data.attitudeCounts[pair] : { pref1: 'N/A', pref2: 'N/A' };
        const func1 = pair.substring(0, 2);
        const func2 = pair.substring(2, 4);
        attitudeText += `${func1}: ${counts.pref1} | ${func2}: ${counts.pref2}<br>`;
    });


    let binaryText = '<br><strong>Axis Preferences:</strong><br>';
     // Use the globally defined binaryChoiceQuestions array
    binaryChoiceQuestions.forEach(pair => {
        const choice = data.binaryPreferences ? data.binaryPreferences[pair] : null;
        const [func1, func2] = pair.split('_');
        binaryText += `${pair}: ${choice === 1 ? func1 : choice === 2 ? func2 : 'Undecided'}<br>`;
    });


    let tempText = `<br><strong>Temperament Sorting:</strong><br>
        Set 1: ${data.temperamentSet1.replace(/,/g, ' > ')}<br>
        Set 2: ${data.temperamentSet2.replace(/,/g, ' > ')}`;


    let ieText = `<br><strong>I/E Orientation:</strong><br>
        I: ${data.ieCounts ? data.ieCounts.I : 'N/A'} | E: ${data.ieCounts ? data.ieCounts.E : 'N/A'}`;

    // Add the formatted details into the details section div
    detailsSection.innerHTML += `<div style="background:#f0f0f0; padding:15px; border-radius:8px; margin-top:20px;">
        ${funcScoresText}
        ${attitudeText}
        ${binaryText}
        ${tempText}
        ${ieText}
    </div>`;

    // Add details section to the results div
    resultsDiv.appendChild(detailsSection);

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// --- END OF FILE script.js ---