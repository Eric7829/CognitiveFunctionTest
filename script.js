// --- START OF FILE script.js ---

// --- Define Constants Outside the Listener ---
const functions = ['Si', 'Se', 'Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe'];
// Attitude Pairs for Binary Attitude Questions and Attitude Transfer Logic
const attitudePairs = ['NiNe', 'TiTe', 'FiFe', 'SiSe'];
const ATTITUDE_PAIR_FUNCTIONS = { // Maps pair key to function names
    'NiNe': ['Ni', 'Ne'],
    'TiTe': ['Ti', 'Te'],
    'FiFe': ['Fi', 'Fe'],
    'SiSe': ['Si', 'Se']
};
// Rationality/Attitude Pairs for Intra-Pair Suppression
const RATIONALITY_ATTITUDE_PAIRS = {
    'ExtravertedJudging': ['Fe', 'Te'],
    'IntrovertedJudging': ['Fi', 'Ti'],
    'ExtravertedPerceiving': ['Ne', 'Se'],
    'IntrovertedPerceiving': ['Ni', 'Si']
};
// Mapping count difference in attitude questions to transfer percentage
const ATTITUDE_TRANSFER_PERCENTAGES = { 3: 0.2, 1: 0.1 }; // 20% for 3 diff, 10% for 1 diff

const binaryChoiceQuestions = ['Ti_Fe', 'Fi_Te', 'Si_Ne', 'Ni_Se']; // Axis questions
const typeFunctionStacks = { // Using the top 4 functions for scoring weights as in Python
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

const likertQuestionsPerFunction = 3; // Assuming 3 likert questions per function
const binaryAttitudeQuestionsPerPair = 3; // Assuming 3 binary questions per attitude pair
const ieQuestionNames = ['I_E', 'I_E2', 'I_E3']; // Assuming these are the I/E question names

const reverseScoredQuestions = new Set([
    'Si_Q3', 'Se_Q3', 'Ni_Q3', 'Ne_Q3',
    'Ti_Q3', 'Te_Q3', 'Fi_Q3', 'Fe_Q3'
]);

const MIN_SCORE_CLAMP = 1.0; // Minimum score value to clamp to after modifications

document.getElementById('personalitySurvey').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const answers = {};
    let allLikertAnswered = true;
    let allBinaryAttitudeAnswered = true;
    let allBinaryChoiceAnswered = true;
    let allIeAnswered = true;


    // Collect answers and check if required questions are answered
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('temperament_')) {
             answers[key] = value; // Keep as string "NT,SJ,SP,NF"
        } else {
             // Attempt to parse as integer
             const intValue = parseInt(value);
             if (!isNaN(intValue)) {
                 answers[key] = intValue;
             } else {
                  // Handle cases where answer might be missing or non-numeric for value questions
                 answers[key] = null; // Use null for missing/invalid number answers
             }
        }
    }

    // Basic check for required questions (Likert, Binary Attitude, Binary Choice, I/E)
    functions.forEach(func => {
        for (let i = 1; i <= likertQuestionsPerFunction; i++) {
            const key = `${func}_Q${i}`;
            if (answers[key] === undefined || answers[key] === null) {
                 allLikertAnswered = false;
                 console.warn(`Missing or invalid answer for Likert question: ${key}`);
            }
        }
    });
     attitudePairs.forEach(pair => {
         for (let i = 1; i <= binaryAttitudeQuestionsPerPair; i++) {
             const key = `${pair}_Q${i}`;
             if (answers[key] === undefined || answers[key] === null || ![1, 2].includes(answers[key])) {
                  allBinaryAttitudeAnswered = false;
                   console.warn(`Missing or invalid answer for Binary Attitude question: ${key}`);
             }
         }
     });
     binaryChoiceQuestions.forEach(pair => {
         const key = pair;
         if (answers[key] === undefined || answers[key] === null || ![1, 2].includes(answers[key])) {
             allBinaryChoiceAnswered = false;
             console.warn(`Missing or invalid answer for Binary Choice question: ${key}`);
         }
     });
     ieQuestionNames.forEach(name => {
         const key = name;
         if (answers[key] === undefined || answers[key] === null || ![1, 2].includes(answers[key])) {
             allIeAnswered = false;
             console.warn(`Missing or invalid answer for I/E question: ${key}`);
         }
     });


    // --- NEW: Helper for Intra-Pair Suppression ---
    function applyIntraPairSuppression(
        functionScoresInput,
        suppressionThreshold = 1.1, // Python example: 1.1
        suppressionFactor = 0.7,  // Python example: 0.7
        smoothnessFactor = 3.0, // Python example: 3.0
        minScoreAfterSuppression = MIN_SCORE_CLAMP
    ) {
        if (!functionScoresInput || Object.keys(functionScoresInput).length === 0) {
            return {};
        }

        const adjustedScores = { ...functionScoresInput }; // Work on a copy

        for (const pairKey in RATIONALITY_ATTITUDE_PAIRS) {
            const [func1Name, func2Name] = RATIONALITY_ATTITUDE_PAIRS[pairKey];
            const score1 = adjustedScores[func1Name] !== undefined ? adjustedScores[func1Name] : 0.0;
            const score2 = adjustedScores[func2Name] !== undefined ? adjustedScores[func2Name] : 0.0;

             // Ensure scores are treated as numbers
             const numScore1 = typeof score1 === 'number' ? score1 : 0.0;
             const numScore2 = typeof score2 === 'number' ? score2 : 0.0;

            if (Math.abs(numScore1 - numScore2) < 1e-6) { // Scores are effectively equal
                continue;
            }

            let higherScoreVal, lowerScoreValInPair, funcToSuppress;

            if (numScore1 > numScore2) {
                higherScoreVal = numScore1;
                lowerScoreValInPair = numScore2;
                funcToSuppress = func2Name;
            } else { // numScore2 > numScore1
                higherScoreVal = numScore2;
                lowerScoreValInPair = numScore1;
                funcToSuppress = func1Name;
            }

            let multiplier = 1.0; // Default to no suppression

            if (lowerScoreValInPair < minScoreAfterSuppression) { // If the lower score is very low (e.g., at or below clamp)
                if (higherScoreVal > minScoreAfterSuppression) { // And the higher score is above clamp
                    multiplier = suppressionFactor; // Apply maximum suppression
                }
                 // If both are low, already handled by equality check or stays low
            } else { // lowerScoreValInPair is above clamp
                 const relativeDifference = higherScoreVal / lowerScoreValInPair;

                 const exponent = -smoothnessFactor * (relativeDifference - suppressionThreshold);
                 let sigmoidPart;
                 try {
                     // Handle potential overflow for large positive exponents
                     sigmoidPart = (exponent > 700) ? 1.0 : (exponent < -700) ? 0.0 : 1 / (1 + Math.exp(exponent));
                 } catch (e) {
                     console.error("Error calculating sigmoidPart:", e);
                     sigmoidPart = (exponent > 0) ? 1.0 : 0.0; // Fallback
                 }


                 // Multiplier smoothly transitions from 1 down to suppressionFactor
                 const currentMultiplier = 1.0 - (1.0 - suppressionFactor) * sigmoidPart;
                 multiplier = Math.max(suppressionFactor, Math.min(1.0, currentMultiplier));
            }

            // Apply suppression to the identified lower score
            const suppressedValue = lowerScoreValInPair * multiplier;
            adjustedScores[funcToSuppress] = Math.max(suppressedValue, minScoreAfterSuppression);
        }

        // Ensure all scores are at least MIN_SCORE_CLAMP even if not suppressed
         for (const func in adjustedScores) {
             if (adjustedScores[func] !== undefined && adjustedScores[func] < MIN_SCORE_CLAMP) {
                 adjustedScores[func] = MIN_SCORE_CLAMP;
             }
         }


        return adjustedScores;
    }


    // --- Existing Helper function for Global Suppression (Modified Parameters) ---
     function applySuppression(functionScores, suppressionThreshold = 1.34, suppressionFactor = 0.8, smoothnessFactor = 4.0) { // Python example: 1.34, 0.8, 4.0
        if (!functionScores || Object.keys(functionScores).length === 0) {
            return {};
        }
        const positiveScores = Object.values(functionScores).filter(score => typeof score === 'number' && score > 0);
        const highestScore = positiveScores.length > 0 ? Math.max(...positiveScores) : 0.0;

        const adjustedScores = {};
        if (highestScore <= 1e-6) {
             // If highest is zero or near zero, clamp all to min
            for (const func in functionScores) {
                 adjustedScores[func] = Math.max(MIN_SCORE_CLAMP, functionScores[func] !== undefined ? functionScores[func] : 0.0);
            }
            return adjustedScores;
        }

        for (const func in functionScores) {
            const score = functionScores[func] !== undefined ? functionScores[func] : 0.0;
            const safeScore = Math.max(score, MIN_SCORE_CLAMP); // Use clamp as safe minimum
            const relativeDifference = highestScore / safeScore;

            const exponent = -smoothnessFactor * (relativeDifference - suppressionThreshold);
            let sigmoidPart;
             try {
                 // Handle potential overflow for large positive exponents
                 sigmoidPart = (exponent > 700) ? 1.0 : (exponent < -700) ? 0.0 : 1 / (1 + Math.exp(exponent));
             } catch (e) {
                 console.error("Error calculating sigmoidPart (global):", e);
                 sigmoidPart = (exponent > 0) ? 1.0 : 0.0; // Fallback
             }


            let multiplier = 1.0 - (1.0 - suppressionFactor) * sigmoidPart;
            multiplier = Math.max(suppressionFactor, Math.min(1.0, multiplier));

            adjustedScores[func] = score * multiplier;
             // Clamp after multiplication
             adjustedScores[func] = Math.max(adjustedScores[func], MIN_SCORE_CLAMP);
        }
        return adjustedScores;
    }


    // --- 1. Raw Function Preference Calculation (Likert) ---
    let rawFunctionScores = {}; // Store raw scores here
    let allRawScoresPopulated = true; // Check if we got scores for all functions
    functions.forEach(func => {
        let scores = [];
        for (let i = 1; i <= likertQuestionsPerFunction; i++) {
            const key = `${func}_Q${i}`;
            // Check if the key exists and is a valid number
            if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && !isNaN(answers[key])) {
                let scoreValue = answers[key];
                if (reverseScoredQuestions.has(key)) {
                    scoreValue = 8 - scoreValue; // Apply reverse scoring (assuming 1-7 scale)
                }
                scores.push(scoreValue);
            }
        }

        if (scores.length === likertQuestionsPerFunction) {
            const sum = scores.reduce((a, b) => a + b, 0);
            rawFunctionScores[func] = sum / scores.length;
        } else {
            console.warn(`Warning: Function ${func} - Did not find ${likertQuestionsPerFunction} valid scores. Found ${scores.length}. Setting raw score to ${MIN_SCORE_CLAMP}.`);
            rawFunctionScores[func] = MIN_SCORE_CLAMP; // Default to clamp minimum if missing/invalid
            allRawScoresPopulated = false; // Mark that we couldn't get all raw scores properly
        }
    });

     // If not all Likert answers were valid/present, we might have issues.
     // We continue anyway but results might be skewed.

    // --- NEW: Apply Intra-Pair Suppression ---
    // This step modifies scores *based on raw scores* within Rationality-Attitude pairs.
    const scoresAfterIntraSupp = applyIntraPairSuppression(rawFunctionScores);


    // --- 2. Function Attitude Preference (Binary Counts) ---
    // Calculate preference counts for attitude pairs (used for attitude transfer)
    const attitudeCounts = {};
    attitudePairs.forEach(pair => {
        let pref1Count = 0;
        let pref2Count = 0;
        for (let i = 1; i <= binaryAttitudeQuestionsPerPair; i++) {
            const key = `${pair}_Q${i}`;
            if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && [1, 2].includes(answers[key])) {
                if (answers[key] === 1) pref1Count++;
                else if (answers[key] === 2) pref2Count++;
            } else if (answers[key] === undefined || answers[key] === null) {
                 // Missing answer is implicitly counted as neither preference
            }
        }
        // Store counts regardless of tie, the transfer logic handles ties (no transfer)
        attitudeCounts[pair] = { pref1: pref1Count, pref2: pref2Count };
    });

    // --- NEW: Apply Attitude Transfer based on Binary Counts ---
    // This step modifies scores *after* intra-pair suppression, based on attitude counts
    const scoresAfterAttitudeTransfer = { ...scoresAfterIntraSupp }; // Start from intra-suppressed scores

    for (const pairKey in attitudeCounts) {
        const counts = attitudeCounts[pairKey];
        const count1 = counts.pref1;
        const count2 = counts.pref2;

        if (count1 === count2) continue; // No transfer on a tie

        const funcsInPair = ATTITUDE_PAIR_FUNCTIONS[pairKey];
        if (!funcsInPair || funcsInPair.length !== 2) continue; // Should not happen if constants are correct
        const func1Name = funcsInPair[0]; // e.g., Ni
        const func2Name = funcsInPair[1]; // e.g., Ne

        const countDiff = Math.abs(count1 - count2);
        const transferPercentage = ATTITUDE_TRANSFER_PERCENTAGES[countDiff] || 0.0; // Get percentage, default 0 if diff not 1 or 3

        if (transferPercentage === 0) continue; // No transfer if percentage is 0

        let higherCountFunc, lowerCountFunc;
        if (count1 > count2) {
            higherCountFunc = func1Name;
            lowerCountFunc = func2Name;
        } else { // count2 > count1
            higherCountFunc = func2Name;
            lowerCountFunc = func1Name;
        }

        // The transfer amount is based on the *original raw score* of the function with the *lower* count
        const sourceRawScoreForTransfer = rawFunctionScores[lowerCountFunc] !== undefined ? rawFunctionScores[lowerCountFunc] : MIN_SCORE_CLAMP;

        const transferAmount = Math.max(0.0, sourceRawScoreForTransfer) * transferPercentage;

        // Apply the transfer amount to the scores *after* intra-pair suppression
        const currentModifiedHigher = scoresAfterAttitudeTransfer[higherCountFunc] !== undefined ? scoresAfterAttitudeTransfer[higherCountFunc] : MIN_SCORE_CLAMP;
        const currentModifiedLower = scoresAfterAttitudeTransfer[lowerCountFunc] !== undefined ? scoresAfterAttitudeTransfer[lowerCountFunc] : MIN_SCORE_CLAMP;

        scoresAfterAttitudeTransfer[higherCountFunc] = currentModifiedHigher + transferAmount;
        scoresAfterAttitudeTransfer[lowerCountFunc] = currentModifiedLower - transferAmount;

        // Ensure scores don't drop below the minimum clamp value after transfer
        scoresAfterAttitudeTransfer[higherCountFunc] = Math.max(scoresAfterAttitudeTransfer[higherCountFunc], MIN_SCORE_CLAMP);
        scoresAfterAttitudeTransfer[lowerCountFunc] = Math.max(scoresAfterAttitudeTransfer[lowerCountFunc], MIN_SCORE_CLAMP);
    }

    // --- Apply Global Suppression to the MODIFIED scores ---
    // This is the final suppression step.
    let functionScores = applySuppression(scoresAfterAttitudeTransfer);

     // Final check to ensure functionScores is populated and meaningful
     if (!functionScores || Object.keys(functionScores).length === 0 || Object.values(functionScores).every(score => score < MIN_SCORE_CLAMP * 2)) {
         console.error("Final function scores are invalid or too low.");
          // Use the new displayResults function structure, even for errors
         displayResults({ topResults: [{ type: "Error", dom: "N/A", aux: "N/A", score: 0.0 }], rawFunctionScores: rawFunctionScores }); // Pass raw scores if available
         return; // Stop processing
     }


    // --- 3. Binary Choice Preference (Axis) ---
    const binaryPreferences = {};
    binaryChoiceQuestions.forEach(col => {
         const key = col; // Key is like 'Ti_Fe'
         if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && [1, 2].includes(answers[key])) {
            binaryPreferences[col] = answers[key];
        } else {
            binaryPreferences[col] = null; // Store null if question is unanswered or invalid
        }
    });
     // If not all Binary Choice answers were valid/present, results might be skewed.


    // --- 4. Introversion/Extraversion Preference ---
    const ieAnswers = []; // Store 1 for Introverted, 2 for Extraverted, null for missing/invalid
    ieQuestionNames.forEach(name => {
         const key = name;
         if (answers.hasOwnProperty(key) && typeof answers[key] === 'number' && [1, 2].includes(answers[key])) {
            ieAnswers.push(answers[key]);
        } else {
            ieAnswers.push(null);
        }
    });
     // If not all I/E answers were valid/present, results might be skewed.

     // --- NEW: Calculate I/E counts (for display and boost) ---
     const ieCounts = { I: 0, E: 0 };
     ieAnswers.forEach(answer => {
         if (answer === 1) ieCounts.I++;
         else if (answer === 2) ieCounts.E++;
     });


    // --- 5. Temperament Preference Calculation ---
    const temperamentBoosts = {}; // Store boosts per MBTI type
    Object.keys(typeFunctionStacks).forEach(type => temperamentBoosts[type] = 0); // Initialize boosts to 0

    // Process Set 1
    const sortedSet1 = answers['temperament_set1_order'] ? answers['temperament_set1_order'].split(',') : [];
    if (sortedSet1.length === 4 && sortedSet1.every(t => temperamentGroups.hasOwnProperty(t))) { // Only score if fully and validly sorted
        sortedSet1.forEach((temperament, index) => {
            const score = temperamentRankScores[index];
            const typesToBoost = temperamentGroups[temperament] || [];
            typesToBoost.forEach(type => {
                temperamentBoosts[type] += score;
            });
        });
    } else if (answers['temperament_set1_order'] && sortedSet1.length > 0) { // Log if partially or invalidly sorted but don't score
         console.warn("Temperament Set 1 not fully or validly sorted, skipping boost calculation for this set.");
    }

     // Process Set 2
    const sortedSet2 = answers['temperament_set2_order'] ? answers['temperament_set2_order'].split(',') : [];
     if (sortedSet2.length === 4 && sortedSet2.every(t => temperamentGroups.hasOwnProperty(t))) { // Only score if fully and validly sorted
        sortedSet2.forEach((temperament, index) => {
            const score = temperamentRankScores[index];
            const typesToBoost = temperamentGroups[temperament] || [];
            typesToBoost.forEach(type => {
                temperamentBoosts[type] += score; // Add to existing boost
            });
        });
    } else if (answers['temperament_set2_order'] && sortedSet2.length > 0) { // Log if partially or invalidly sorted but don't score
        console.warn("Temperament Set 2 not fully or validly sorted, skipping boost calculation for this set.");
    }


    // --- 6. Jungian Type Scoring and Ranking (ADOPTED PYTHON LOGIC) ---
    const typeScores = {};
    // Calculate overall average from the *final* function scores (after all suppression/transfer)
    const finalFunctionScoresValues = Object.values(functionScores).filter(s => typeof s === 'number');
    const overallAverageScore = finalFunctionScoresValues.length > 0 ? finalFunctionScoresValues.reduce((a, b) => a + b, 0) / finalFunctionScoresValues.length : MIN_SCORE_CLAMP;

    Object.entries(typeFunctionStacks).forEach(([mbtiType, stack]) => {
        let score = 0;
        const functionStackScores = stack.map(func => functionScores[func] !== undefined ? functionScores[func] : MIN_SCORE_CLAMP); // Get final scores, default to clamp min

        // Calculate local average from the *final* scores of the current stack
        const validFunctionStackScores = functionStackScores.filter(s => typeof s === 'number');
         const localStackAverage = validFunctionStackScores.length > 0 ? validFunctionStackScores.reduce((a, b) => a + b, 0) / validFunctionStackScores.length : MIN_SCORE_CLAMP;

        // Calculate weighted score from function stack (using FINAL scores)
        stack.forEach((func, i) => {
            const currentScore = functionScores[func] !== undefined ? functionScores[func] : MIN_SCORE_CLAMP;

            // Python Weights for top 4
            let weight = 0;
            if (i === 0) weight = 4; // Dominant
            else if (i === 1) weight = 3; // Auxiliary
            else if (i === 2) weight = 2; // Tertiary
            else if (i === 3) weight = 1; // Inferior
            else return; // Only score top 4 as per typeFunctionStacks definition

            // Python Penalty/Bonus Logic
            let penalty = 0.0;
            if (i === 0) { // Dominant
                penalty = -(currentScore - overallAverageScore) * 4.0; // Bonus if score > avg, penalty if score < avg
            } else if (i === 1) { // Auxiliary
                penalty = -(currentScore - overallAverageScore) * 2.0; // Bonus if score > avg, penalty if score < avg
            } else if (i === 2) { // Tertiary
                penalty = 0.0; // No penalty/bonus based on deviation in Python
            } else if (i === 3) { // Inferior
                // Penalize if inferior is *higher* than local stack average
                penalty = (currentScore - localStackAverage) * 2.0;
            }

            const adjustedScore = (currentScore * weight) - penalty;
            score += adjustedScore;
        });

        // Add attitude preference boost (using attitudeCounts - ADOPTED PYTHON BOOST AMOUNTS)
        let attitudeBoost = 0.0;
        Object.entries(attitudeCounts).forEach(([pairKey, counts]) => {
             const count1 = counts.pref1;
             const count2 = counts.pref2;
             if (count1 === count2) return; // Skip ties

             const pref = count1 > count2 ? 1 : 2; // 1 prefers func1, 2 prefers func2

             const funcsInPair = ATTITUDE_PAIR_FUNCTIONS[pairKey];
             if (!funcsInPair || funcsInPair.length !== 2) return;
             const func1Name = funcsInPair[0]; // e.g., Ni (often Introverted)
             const func2Name = funcsInPair[1]; // e.g., Ne (often Extraverted)

             if (pref === 1) { // Prefers func1 (often Introverted)
                 if (stack[0] === func1Name) attitudeBoost += 3.0; // Python: 3.0 for Dom match
                 else if (stack[1] === func1Name) attitudeBoost += 2.0; // Python: 2.0 for Aux match
                 // Python has minor boost for Tert match (1.0), but let's stick closer to the core Dom/Aux structure
             } else if (pref === 2) { // Prefers func2 (often Extraverted)
                 if (stack[0] === func2Name) attitudeBoost += 3.0; // Python: 3.0 for Dom match
                 else if (stack[1] === func2Name) attitudeBoost += 2.0; // Python: 2.0 for Aux match
                  // Python has minor boost for Tert match (1.0)
             }
        });
        score += attitudeBoost;

        // Add binary choice preference boost (Axis - using binaryPreferences - ADOPTED PYTHON BOOST AMOUNTS)
        let binaryBoost = 0.0;
        Object.entries(binaryPreferences).forEach(([binaryCol, choice]) => {
             if (choice !== null && binaryCol && binaryCol.includes('_')) {
                const [func1Bin, func2Bin] = binaryCol.split('_');
                const chosenFuncBin = choice === 1 ? func1Bin : (choice === 2 ? func2Bin : null);

                if (chosenFuncBin) {
                    if (stack[0] === chosenFuncBin) binaryBoost += 3.0; // Python: 3.0 for Dom match
                    else if (stack[1] === chosenFuncBin) binaryBoost += 2.0; // Python: 2.0 for Aux match
                }
            }
        });
        score += binaryBoost;

        // Add I/E preference boost (using ieAnswers - ADOPTED PYTHON BASE BOOST AMOUNT, EXCLUDING EXTRA INTROVERT BOOST)
        let ieBoost = 0.0;
        const typeOrientation = mbtiType[0]; // 'I' or 'E'
        ieAnswers.forEach(answer => {
            if (answer !== null) { // Only consider answered questions
                // Python base boost is 2.0 for a match
                if (answer === 1 && typeOrientation === 'I') ieBoost += 2.0;
                else if (answer === 2 && typeOrientation === 'E') ieBoost += 2.0;
            }
        });
         // EXCLUDE the extra 4.0 Python boost for introverts as requested
        score += ieBoost;

        // --- Add Temperament Boost ---
        score += (temperamentBoosts[mbtiType] || 0); // Add the calculated boost for this type

        // Store final score, ensuring it's not negative
        typeScores[mbtiType] = Math.max(0, score);
    });

    // Sort and get top types
    const sortedTypes = Object.entries(typeScores)
        .map(([mbti_type, score_val]) => ({
            type: mbti_type,
            score: score_val,
            dom: typeFunctionStacks[mbti_type] ? typeFunctionStacks[mbti_type][0] : 'N/A',
            aux: typeFunctionStacks[mbti_type] ? typeFunctionStacks[mbti_type][1] : 'N/A'
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

    // --- 7. Call displayResults with comprehensive data ---
    displayResults({
        topResults: topResults,
        // Pass scores *after* all processing for details section if needed,
        // but the detail section specifically asks for Raw Averages
        // functionScores: functionScores,
        rawFunctionScores: rawFunctionScores, // Pass raw scores here for details display
        attitudeCounts: attitudeCounts, // Pass counts for details
        binaryPreferences: binaryPreferences, // Pass preferences for details
        temperamentSet1: answers['temperament_set1_order'] || 'Not sorted',
        temperamentSet2: answers['temperament_set2_order'] || 'Not sorted',
        ieCounts: ieCounts // Pass counts for details
    });

}); // End of submit event listener


// --- Helper function to display results in the HTML (KEPT EXISTING STRUCTURE) ---
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>'; // Clear previous results

    // Check for errors or empty results
    if (!data.topResults || data.topResults.length === 0 || data.topResults[0].type === "Error") {
         resultsDiv.innerHTML += '<p>Could not determine types. Please ensure all required questions are answered and valid.</p>';
        if (data.rawFunctionScores) { // Display raw scores even on error if available
            let funcScoresText = '<strong>Raw Function Averages (Presuppression):</strong><br>';
             functions.forEach(func => {
                 const scoreVal = data.rawFunctionScores[func] !== undefined && data.rawFunctionScores[func] !== null ? data.rawFunctionScores[func].toFixed(2) : 'N/A';
                 funcScoresText += `${func}: ${scoreVal}<br>`;
             });
             resultsDiv.innerHTML += `<div style="background:#f0f0f0; padding:15px; border-radius:8px; margin-top:20px;">${funcScoresText}</div>`;
        }
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Display main results (Top 3 Types)
    const resultsList = document.createElement('ul');
    data.topResults.forEach((result, index) => {
        const listItem = document.createElement('li');
        // Handle potential N/A scores gracefully
        const scoreDisplay = result.score !== undefined && result.score !== null ? result.score.toFixed(2) : "N/A";
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


    // --- Details Section (using data calculated in the listener) ---
    const detailsSection = document.createElement('div');
    detailsSection.innerHTML = '<h3>Details (for nerds only)</h3>';

    // Prepare content for details section
    // Display RAW function scores before any suppression/transfer
    let funcScoresText = '<strong>Raw Function Averages (Presuppression):</strong><br>';
    functions.forEach(func => {
        // Check if raw function score exists before trying to display it
        const scoreVal = data.rawFunctionScores && data.rawFunctionScores[func] !== undefined && data.rawFunctionScores[func] !== null ? data.rawFunctionScores[func].toFixed(2) : 'N/A';
        funcScoresText += `${func}: ${scoreVal}<br>`;
    });

    let attitudeText = '<br><strong>Attitude Preferences:</strong><br>';
    attitudePairs.forEach(pair => {
        const counts = data.attitudeCounts ? data.attitudeCounts[pair] : { pref1: 'N/A', pref2: 'N/A' };
        const funcs = ATTITUDE_PAIR_FUNCTIONS[pair] || ['Func1', 'Func2']; // Fallback names
        attitudeText += `${funcs[0]}: ${counts.pref1} | ${funcs[1]}: ${counts.pref2}<br>`;
    });


    let binaryText = '<br><strong>Axis Preferences:</strong><br>';
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