// --- START OF MODIFIED score_calculator.js ---

// --- Define Constants (Global to this script file) ---

// List of all 8 cognitive functions
const functions = ['Si', 'Se', 'Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe'];

// Maps MBTI types to their function stack (Dominant, Auxiliary, Tertiary, Inferior)
// This definition is pasted from the original script and assumed to be correct.
const typeFunctionStacks = {
    'ISTJ': ['Si', 'Te', 'Fi', 'Ne'], 'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
    'ESTJ': ['Te', 'Si', 'Ne', 'Fi'], 'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'],
    'ISTP': ['Ti', 'Se', 'Ni', 'Fe'], 'ISFP': ['Fi', 'Se', 'Ni', 'Te'],
    'ESTP': ['Se', 'Ti', 'Fe', 'Ni'], 'ESFP': ['Se', 'Fi', 'Te', 'Ni'],
    'INFJ': ['Ni', 'Fe', 'Ti', 'Se'], 'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
    'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'], 'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
    'INFP': ['Fi', 'Ne', 'Si', 'Te'], 'INTP': ['Ti', 'Ne', 'Si', 'Fe'],
    'ENFP': ['Ne', 'Fi', 'Te', 'Si'], 'ENTP': ['Ne', 'Ti', 'Fe', 'Si']
};

// Configuration for Likert questions that are reverse scored.
// True means the question's score should be inverted (e.g., 1 becomes 7, 2 becomes 6 on a 1-7 scale).
// Based on questions.json having reverseScored=true for Q5 and Q6 of each function.
const reverseScoredQuestionsConfig = {
    'Te_Q5': true, 'Te_Q6': true, 'Ti_Q5': true, 'Ti_Q6': true,
    'Fe_Q5': true, 'Fe_Q6': true, 'Fi_Q5': true, 'Fi_Q6': true,
    'Se_Q5': true, 'Se_Q6': true, 'Si_Q5': true, 'Si_Q6': true,
    'Ne_Q5': true, 'Ne_Q6': true, 'Ni_Q5': true, 'Ni_Q6': true
};

// Minimum possible score a function can have after any suppression or transfer.
const MIN_SCORE_CLAMP = 1.0;

// List of attitude pairs, used for parsing binary attitude questions and for attitude transfer.
// e.g., 'NiNe' represents questions comparing Ni and Ne.
const attitudePairs = ['NiNe', 'TiTe', 'FiFe', 'SiSe'];

// Maps attitude pair keys (from `attitudePairs`) to the two functions in that pair.
// Used in attitude transfer and boosting logic.
const ATTITUDE_PAIR_FUNCTIONS = {
    'NiNe': ['Ni', 'Ne'], 'TiTe': ['Ti', 'Te'],
    'FiFe': ['Fi', 'Fe'], 'SiSe': ['Si', 'Se']
};

// Defines the percentage of a score to transfer between functions in an attitude pair,
// based on the difference in preference counts from binary attitude questions.
// Aligned with script.js: { 3: 0.2, 1: 0.1 }
// A difference of 3 in counts means 20% transfer, a difference of 1 means 10% transfer.
const ATTITUDE_TRANSFER_PERCENTAGES = {
    1: 0.1, // 1 difference, 10% transfer
    3: 0.2  // 3 difference, 20% transfer
    // A difference of 0 or 2 results in 0% transfer (implicitly, or handled by logic).
};

// Defines pairs of functions for the intra-pair suppression mechanism.
// This logic suppresses the score of the weaker function within these specific pairs.
// Aligned with script.js definition.
const RATIONALITY_ATTITUDE_PAIRS = {
    'ExtravertedJudging': ['Fe', 'Te'],
    'IntrovertedJudging': ['Fi', 'Ti'],
    'ExtravertedPerceiving': ['Ne', 'Se'],
    'IntrovertedPerceiving': ['Ni', 'Si']
};

// Maps temperament groups (SP, SJ, NT, NF) to the MBTI types associated with them.
// Used for temperament-based scoring boosts.
const temperamentGroups = {
    'SP': ['ESTP', 'ESFP', 'ISTP', 'ISFP'], 'SJ': ['ESTJ', 'ESFJ', 'ISTJ', 'ISFJ'],
    'NT': ['ENTJ', 'ENTP', 'INTJ', 'INTP'], 'NF': ['ENFJ', 'ENFP', 'INFJ', 'INFP']
};

// Scores assigned based on the user's ranking of temperament descriptions.
// MOST preferred gets +3, LEAST preferred gets -1.5.
const temperamentRankScores = [3, 1.5, 0, -1.5];

// Names/IDs of the questions used to determine Introversion/Extraversion preference.
const ieQuestionNames = ['I_E', 'I_E2', 'I_E3'];


// --- Helper Functions for Scoring ---

/**
 * Applies Intra-Pair Suppression to function scores.
 * For each defined pair in RATIONALITY_ATTITUDE_PAIRS, if one function's score
 * is significantly higher than the other, the lower score is suppressed.
 * Uses a sigmoid function for smooth suppression.
 * Sigmoid parameters are unified: threshold=1.34, factor=0.8, smoothness=4.0.
 *
 * @param {Object} functionScoresInput - Raw scores for each cognitive function.
 * @param {number} [suppressionThreshold=1.34] - Relative difference threshold to start suppression.
 * @param {number} [suppressionFactor=0.8] - Max suppression amount (e.g., 0.8 means score becomes 80% of original).
 * @param {number} [smoothnessFactor=4.0] - Controls the steepness of the sigmoid curve.
 * @param {number} [minScoreAfterSuppression=MIN_SCORE_CLAMP] - Minimum score after suppression.
 * @returns {Object} - Function scores after intra-pair suppression.
 */
function applyIntraPairSuppression(
    functionScoresInput,
    suppressionThreshold = 1.34, // Unified parameter
    suppressionFactor = 0.8,    // Unified parameter
    smoothnessFactor = 4.0,   // Unified parameter
    minScoreAfterSuppression = MIN_SCORE_CLAMP
) {
    if (!functionScoresInput || Object.keys(functionScoresInput).length === 0) { return {}; }
    const adjustedScores = { ...functionScoresInput };

    // Iterate over defined rationality/attitude pairs (e.g., Fe vs Te, Ni vs Si)
    for (const pairKey in RATIONALITY_ATTITUDE_PAIRS) {
        const [func1Name, func2Name] = RATIONALITY_ATTITUDE_PAIRS[pairKey];
        const score1 = adjustedScores[func1Name] !== undefined ? adjustedScores[func1Name] : 0.0;
        const score2 = adjustedScores[func2Name] !== undefined ? adjustedScores[func2Name] : 0.0;

        const numScore1 = typeof score1 === 'number' ? score1 : 0.0;
        const numScore2 = typeof score2 === 'number' ? score2 : 0.0;

        // If scores are equal, no suppression within this pair
        if (Math.abs(numScore1 - numScore2) < 1e-6) { continue; }

        let higherScoreVal, lowerScoreValInPair, funcToSuppress;
        if (numScore1 > numScore2) {
            higherScoreVal = numScore1; lowerScoreValInPair = numScore2; funcToSuppress = func2Name;
        } else {
            higherScoreVal = numScore2; lowerScoreValInPair = numScore1; funcToSuppress = func1Name;
        }

        let multiplier = 1.0; // Default: no suppression
        // If the lower score is already very low, and the higher score is not, apply max suppression.
        if (lowerScoreValInPair < minScoreAfterSuppression) {
            if (higherScoreVal > minScoreAfterSuppression) { multiplier = suppressionFactor; }
        } else {
            // Calculate suppression using a sigmoid function for smoothness
            const relativeDifference = higherScoreVal / lowerScoreValInPair;
            const exponent = -smoothnessFactor * (relativeDifference - suppressionThreshold);
            let sigmoidPart;
            try {
                sigmoidPart = (exponent > 700) ? 1.0 : (exponent < -700) ? 0.0 : 1 / (1 + Math.exp(exponent));
            } catch (e) { // Fallback for extreme exponent values
                sigmoidPart = (exponent > 0) ? 1.0 : 0.0;
            }
            // Multiplier smoothly transitions from 1.0 down to suppressionFactor
            const currentMultiplier = 1.0 - (1.0 - suppressionFactor) * sigmoidPart;
            multiplier = Math.max(suppressionFactor, Math.min(1.0, currentMultiplier));
        }
        const suppressedValue = lowerScoreValInPair * multiplier;
        adjustedScores[funcToSuppress] = Math.max(suppressedValue, minScoreAfterSuppression);
    }

    // Final clamp for all scores after pair processing
    for (const func in adjustedScores) {
        if (adjustedScores[func] !== undefined && adjustedScores[func] < MIN_SCORE_CLAMP) {
            adjustedScores[func] = MIN_SCORE_CLAMP;
        }
    }
    return adjustedScores;
}

/**
 * Applies Attitude Transfer to function scores.
 * If binary attitude questions show a preference for one function in a pair (e.g., Ni over Ne),
 * a percentage of the *raw score* of the less-preferred function is transferred to the more-preferred one.
 * The percentage is determined by `ATTITUDE_TRANSFER_PERCENTAGES`.
 *
 * @param {Object} scoresAfterIntraSuppInput - Scores after intra-pair suppression.
 * @param {Object} attitudeCountsInput - Counts of preferences from binary attitude questions.
 * @param {Object} rawFunctionScoresInput - Original raw scores (used as the base for transfer amount).
 * @returns {Object} - Function scores after attitude transfer.
 */
function applyAttitudeTransfer(scoresAfterIntraSuppInput, attitudeCountsInput, rawFunctionScoresInput) {
    const scoresAfterAttitudeTransfer = { ...scoresAfterIntraSuppInput };

    for (const pairKey in attitudeCountsInput) { // e.g., pairKey = 'NiNe'
        const counts = attitudeCountsInput[pairKey]; // { pref1: countForNi, pref2: countForNe }
        const count1 = counts.pref1; const count2 = counts.pref2;

        // No transfer if preferences are tied
        if (count1 === count2) continue;

        const funcsInPair = ATTITUDE_PAIR_FUNCTIONS[pairKey]; // ['Ni', 'Ne']
        if (!funcsInPair || funcsInPair.length !== 2) continue;
        const func1Name = funcsInPair[0]; const func2Name = funcsInPair[1];

        const countDiff = Math.abs(count1 - count2);
        // Get transfer percentage based on count difference (e.g., 10% for 1 diff, 20% for 3 diff)
        const transferPercentage = ATTITUDE_TRANSFER_PERCENTAGES[countDiff] || 0.0;
        if (transferPercentage === 0) continue;

        let higherCountFunc, lowerCountFunc;
        if (count1 > count2) { // func1 (e.g., Ni) is preferred
            higherCountFunc = func1Name; lowerCountFunc = func2Name;
        } else { // func2 (e.g., Ne) is preferred
            higherCountFunc = func2Name; lowerCountFunc = func1Name;
        }

        // Transfer amount is based on the *raw score* of the function with the *lower* preference count
        const sourceRawScoreForTransfer = rawFunctionScoresInput[lowerCountFunc] !== undefined ? rawFunctionScoresInput[lowerCountFunc] : MIN_SCORE_CLAMP;
        const transferAmount = Math.max(0.0, sourceRawScoreForTransfer) * transferPercentage;

        const currentModifiedHigher = scoresAfterAttitudeTransfer[higherCountFunc] !== undefined ? scoresAfterAttitudeTransfer[higherCountFunc] : MIN_SCORE_CLAMP;
        const currentModifiedLower = scoresAfterAttitudeTransfer[lowerCountFunc] !== undefined ? scoresAfterAttitudeTransfer[lowerCountFunc] : MIN_SCORE_CLAMP;

        // Apply transfer: add to preferred, subtract from less-preferred
        scoresAfterAttitudeTransfer[higherCountFunc] = currentModifiedHigher + transferAmount;
        scoresAfterAttitudeTransfer[lowerCountFunc] = currentModifiedLower - transferAmount;

        // Ensure scores don't go below MIN_SCORE_CLAMP after transfer
        scoresAfterAttitudeTransfer[higherCountFunc] = Math.max(scoresAfterAttitudeTransfer[higherCountFunc], MIN_SCORE_CLAMP);
        scoresAfterAttitudeTransfer[lowerCountFunc] = Math.max(scoresAfterAttitudeTransfer[lowerCountFunc], MIN_SCORE_CLAMP);
    }
    return scoresAfterAttitudeTransfer;
}

/**
 * Applies Global Suppression to all function scores.
 * Scores that are significantly lower than the highest score are suppressed.
 * Uses a sigmoid function for smooth suppression.
 * Sigmoid parameters are unified: threshold=1.34, factor=0.8, smoothness=4.0.
 *
 * @param {Object} functionScores - Scores to be suppressed (typically after intra-pair and attitude transfer).
 * @param {number} [suppressionThreshold=1.34] - Relative difference threshold to start suppression.
 * @param {number} [suppressionFactor=0.8] - Max suppression amount.
 * @param {number} [smoothnessFactor=4.0] - Controls the steepness of the sigmoid curve.
 * @returns {Object} - Function scores after global suppression.
 */
function applySuppression(
    functionScores,
    suppressionThreshold = 1.34, // Unified parameter
    suppressionFactor = 0.8,    // Unified parameter
    smoothnessFactor = 4.0      // Unified parameter
) {
    if (!functionScores || Object.keys(functionScores).length === 0) { return {}; }

    const positiveScores = Object.values(functionScores).filter(score => typeof score === 'number' && score > MIN_SCORE_CLAMP); // Consider scores above clamp
    const highestScore = positiveScores.length > 0 ? Math.max(...positiveScores) : MIN_SCORE_CLAMP; // Default to clamp if no scores are above
    const adjustedScores = {};

    // Handle case where all scores are at or below clamp (e.g., all 1.0)
    if (highestScore <= MIN_SCORE_CLAMP) {
        for (const func in functionScores) {
            adjustedScores[func] = Math.max(MIN_SCORE_CLAMP, functionScores[func] !== undefined ? functionScores[func] : MIN_SCORE_CLAMP);
        }
        return adjustedScores;
    }

    for (const func in functionScores) {
        const score = functionScores[func] !== undefined ? functionScores[func] : MIN_SCORE_CLAMP;

        // Suppress only if score is above the minimum clamp and below the highest score.
        // Scores at MIN_SCORE_CLAMP or equal to highestScore are not suppressed by this logic itself.
        if (score > MIN_SCORE_CLAMP && score < highestScore) {
            const relativeDifference = highestScore / score; // Will be > 1
            const exponent = -smoothnessFactor * (relativeDifference - suppressionThreshold);
            let sigmoidPart;
            try {
                sigmoidPart = (exponent > 700) ? 1.0 : (exponent < -700) ? 0.0 : 1 / (1 + Math.exp(exponent));
            } catch (e) {
                sigmoidPart = (exponent > 0) ? 1.0 : 0.0;
            }
            let multiplier = 1.0 - (1.0 - suppressionFactor) * sigmoidPart;
            multiplier = Math.max(suppressionFactor, Math.min(1.0, multiplier));
            adjustedScores[func] = score * multiplier;
        } else {
            // Scores at MIN_SCORE_CLAMP, or the highest score itself, remain untouched by this loop's core suppression logic
            adjustedScores[func] = score;
        }
        // Final clamp for each score after potential suppression
        adjustedScores[func] = Math.max(adjustedScores[func], MIN_SCORE_CLAMP);
    }
    return adjustedScores;
}


// --- Main Public Scoring Function ---

/**
 * Calculates and formats all personality scores based on user answers.
 * This is the main entry point called by the application.
 *
 * @param {Object} userAnswers - An object containing user's answers, keyed by question names (e.g., "Si_Q1", "NiNe_Q1").
 * @param {Array} allQuestionsList - The list of all questions from questions.json (not directly used in this version of score_calculator but part of the interface).
 * @returns {Object} An object containing various processed scores and data for display:
 *  - topResults: Array of top 3 likely MBTI types with scores and Dom/Aux functions.
 *  - rawFunctionScores: Object of raw average scores from Likert questions for each function.
 *  - finalFunctionScores: Object of function scores after all suppressions and transfers.
 *  - attitudeCounts: Object of preference counts from binary attitude questions.
 *  - temperamentSet1: String of user's sorted order for temperament set 1.
 *  - temperamentSet2: String of user's sorted order for temperament set 2.
 *  - ieCounts: Object with counts for 'I' and 'E' preferences.
 *  - typeFunctionStacks: The typeFunctionStacks constant.
 *  - functionsOrder: The functions constant.
 *  - attitudePairsOrder: The attitudePairs constant.
 *  - ATTITUDE_PAIR_FUNCTIONS: The ATTITUDE_PAIR_FUNCTIONS constant.
 */
window.calculateAndFormatScores = function(userAnswers, allQuestionsList) {
    // --- 1. Raw Function Preference Calculation (Likert Scale Questions) ---
    let rawFunctionScores = {};
    const likertQuestionsPerFunction = 6; // As per questions.json structure

    functions.forEach(func => {
        let scores = [];
        for (let i = 1; i <= likertQuestionsPerFunction; i++) {
            const key = `${func}_Q${i}`; // e.g., Si_Q1, Si_Q2 ... Si_Q6
            if (userAnswers.hasOwnProperty(key) && userAnswers[key] !== null && userAnswers[key] !== undefined && userAnswers[key] !== '') {
                let scoreValue = parseInt(userAnswers[key]);
                if (!isNaN(scoreValue)) {
                    if (reverseScoredQuestionsConfig[key]) { // Check if this question is reverse-scored
                        scoreValue = 8 - scoreValue; // On a 1-7 scale, 1->7, 2->6, ..., 7->1
                    }
                    scores.push(scoreValue);
                }
            }
        }
        // Calculate average if scores were collected, otherwise default to MIN_SCORE_CLAMP
        if (scores.length > 0) {
            rawFunctionScores[func] = scores.reduce((a, b) => a + b, 0) / scores.length;
        } else {
            rawFunctionScores[func] = MIN_SCORE_CLAMP;
        }
        // Ensure raw scores are at least MIN_SCORE_CLAMP
        rawFunctionScores[func] = Math.max(rawFunctionScores[func], MIN_SCORE_CLAMP);
    });

    // --- 2. Intra-Pair Suppression ---
    // Applies suppression within specific function pairs (e.g., Fe vs Te, Ni vs Si).
    // Uses unified sigmoid parameters (1.34, 0.8, 4.0).
    const scoresAfterIntraSupp = applyIntraPairSuppression(rawFunctionScores, 1.34, 0.8, 4.0);

    // --- 3. Function Attitude Preference (Binary Counts from Attitude Questions) ---
    const attitudeCounts = {}; // Stores { pref1: count, pref2: count } for each attitudePair
    const binaryAttitudeQuestionsPerPair = 3; // As per questions.json structure

    attitudePairs.forEach(pair => { // e.g., pair = 'NiNe'
        let pref1Count = 0; // Preference for the first function in ATTITUDE_PAIR_FUNCTIONS (e.g., Ni)
        let pref2Count = 0; // Preference for the second function (e.g., Ne)
        for (let i = 1; i <= binaryAttitudeQuestionsPerPair; i++) {
            const key = `${pair}_Q${i}`; // e.g., NiNe_Q1
            if (userAnswers.hasOwnProperty(key) && userAnswers[key] !== null && userAnswers[key] !== undefined && userAnswers[key] !== '') {
                const answer = parseInt(userAnswers[key]); // Answer is 1 or 2
                if (!isNaN(answer)) {
                    if (answer === 1) pref1Count++;
                    else if (answer === 2) pref2Count++;
                }
            }
        }
        attitudeCounts[pair] = { pref1: pref1Count, pref2: pref2Count };
    });

    // --- 4. Attitude Transfer ---
    // Transfers score magnitude between functions in a pair based on preference counts.
    // Uses updated ATTITUDE_TRANSFER_PERCENTAGES {1: 0.1, 3: 0.2}.
    const scoresAfterAttitudeTransfer = applyAttitudeTransfer(scoresAfterIntraSupp, attitudeCounts, rawFunctionScores);

    // --- 5. Global Suppression ---
    // Applies suppression across all functions, reducing scores significantly lower than the highest.
    // Uses unified sigmoid parameters (1.34, 0.8, 4.0).
    let finalFunctionScores = applySuppression(scoresAfterAttitudeTransfer, 1.34, 0.8, 4.0);


    // --- 6. Introversion/Extraversion Preference (from I/E Questions) ---
    const ieCounts = { I: 0, E: 0 };
    const ieAnswersForScoring = []; // Store valid answers for boost logic
    ieQuestionNames.forEach(name => { // Iterate over 'I_E', 'I_E2', 'I_E3'
        if (userAnswers.hasOwnProperty(name) && userAnswers[name] !== null && userAnswers[name] !== undefined && userAnswers[name] !== '') {
            const answer = parseInt(userAnswers[name]); // Answer is 1 (Introverted) or 2 (Extraverted)
            if (!isNaN(answer)) {
                ieAnswersForScoring.push(answer);
                if (answer === 1) ieCounts.I++;
                else if (answer === 2) ieCounts.E++;
            }
        }
    });

    // --- 7. Temperament Preference Calculation (from Temperament Sorting Questions) ---
    const temperamentBoosts = {}; // Stores total boost score per MBTI type
    Object.keys(typeFunctionStacks).forEach(type => temperamentBoosts[type] = 0); // Initialize

    ['temperament_set1_order', 'temperament_set2_order'].forEach(setName => {
        if (userAnswers[setName]) {
            const sortedSet = userAnswers[setName].split(','); // e.g., "NT,SP,SJ,NF"
            if (sortedSet.length === 4) { // Expects 4 temperaments sorted
                sortedSet.forEach((temperament, index) => {
                    if (temperamentGroups.hasOwnProperty(temperament) && temperamentRankScores[index] !== undefined) {
                        const score = temperamentRankScores[index]; // Get score based on rank (e.g., MOST = 3)
                        const typesToBoost = temperamentGroups[temperament] || []; // Get MBTI types for this temperament
                        typesToBoost.forEach(type => {
                            temperamentBoosts[type] = (temperamentBoosts[type] || 0) + score;
                        });
                    }
                });
            }
        }
    });

    // --- 8. Jungian Type Scoring and Ranking ---
    const typeScores = {};
    // Calculate overall average from FINAL function scores (after all processing)
    const finalFunctionScoresValues = Object.values(finalFunctionScores).filter(s => typeof s === 'number');
    const overallAverageScore = finalFunctionScoresValues.length > 0 ? finalFunctionScoresValues.reduce((a, b) => a + b, 0) / finalFunctionScoresValues.length : MIN_SCORE_CLAMP;

    Object.entries(typeFunctionStacks).forEach(([mbtiType, stack]) => { // stack = ['Si', 'Te', 'Fi', 'Ne'] for ISTJ
        let score = 0;
        const functionStackScores = stack.map(func => finalFunctionScores[func] !== undefined ? finalFunctionScores[func] : MIN_SCORE_CLAMP);

        // Calculate local stack average from FINAL scores of functions in this type's stack
        const validFunctionStackScores = functionStackScores.filter(s => typeof s === 'number');
        const localStackAverage = validFunctionStackScores.length > 0 ? validFunctionStackScores.reduce((a, b) => a + b, 0) / validFunctionStackScores.length : MIN_SCORE_CLAMP;

        // Calculate weighted score and apply penalties/bonuses
        stack.forEach((func, i) => { // i = 0 (Dom), 1 (Aux), 2 (Tert), 3 (Inf)
            const currentScore = finalFunctionScores[func] !== undefined ? finalFunctionScores[func] : MIN_SCORE_CLAMP;
            let weight = 0;
            if (i === 0) weight = 6;      // Dominant
            else if (i === 1) weight = 5; // Auxiliary
            else if (i === 2) weight = 3; // Tertiary
            else if (i === 3) weight = 1; // Inferior
            else return;

            let penalty = 0.0;
            // Penalty/Bonus logic aligned with script.js
            if (i === 0) {      // Dominant
                penalty = -(currentScore - overallAverageScore) * 4.0; // Bonus if Dom > overall avg, penalty if <
            } else if (i === 1) { // Auxiliary
                penalty = -(currentScore - overallAverageScore) * 2.0; // Bonus if Aux > overall avg, penalty if <
            } else if (i === 2) { // Tertiary
                penalty = 0.0; // No specific penalty/bonus based on averages for Tertiary
            } else if (i === 3) { // Inferior
                penalty = (currentScore - localStackAverage) * 4.0;    // Penalty if Inferior > local stack average
            }
            score += (currentScore * weight) - penalty;
        });

        // --- Apply Boosts from other sections ---

        // Attitude Boost (from binary attitude question preferences)
        // Boosts if a preferred function (from NiNe_Q, TiTe_Q etc.) is Dom or Aux for this MBTI type.
        // Boost amounts (3.0 for Dom, 2.0 for Aux, 1.0 for tert) aligned with script.js.
        let attitudeBoost = 0.0;
        Object.entries(attitudeCounts).forEach(([pairKey, counts]) => {
            const count1 = counts.pref1;
            const count2 = counts.pref2;
            if (count1 === count2) return; // No boost for tied preference

            const pref = count1 > count2 ? 1 : 2; // 1 if first func in pair preferred, 2 if second
            const funcsInPair = ATTITUDE_PAIR_FUNCTIONS[pairKey];
            if (!funcsInPair || funcsInPair.length !== 2) return;
            const func1Name = funcsInPair[0];
            const func2Name = funcsInPair[1];
            const preferredFunc = pref === 1 ? func1Name : func2Name;

            if (stack[0] === preferredFunc) attitudeBoost += 3.0;      // Dominant match
            else if (stack[1] === preferredFunc) attitudeBoost += 2.0; // Auxiliary match
            else if (stack[2]===preferredFunc) attitudeBoost += 1.0; //Tertiary match
        });
        score += attitudeBoost;

        // I/E Boost (from I/E question preferences)
        // Boosts if the MBTI type's orientation (I or E) matches answers from I/E questions.
        // Boost amount (3.0 per matching question) aligned with script.js.
        let ieBoost = 0.0;
        const typeOrientation = mbtiType[0]; // 'I' or 'E' from MBTI type string
        ieAnswersForScoring.forEach(answer => { // Iterate stored valid I/E answers
            if (answer !== null) {
                if (answer === 1 && typeOrientation === 'I') ieBoost += 3.0; // User chose 'I', type is 'I'
                else if (answer === 2 && typeOrientation === 'E') ieBoost += 3.0; // User chose 'E', type is 'E'
            }
        });
        score += ieBoost;

        // Temperament Boost
        score += (temperamentBoosts[mbtiType] || 0);

        typeScores[mbtiType] = Math.max(0, score); // Ensure final score is not negative
    });

    // --- 9. Sort and Format Results for Display ---
    const sortedTypes = Object.entries(typeScores)
        .map(([mbti_type, score_val]) => ({
            type: mbti_type,
            score: score_val,
            dom: typeFunctionStacks[mbti_type] ? typeFunctionStacks[mbti_type][0] : 'N/A',
            aux: typeFunctionStacks[mbti_type] ? typeFunctionStacks[mbti_type][1] : 'N/A'
        }))
        .sort((a, b) => b.score - a.score); // Sort descending by score

    const topResults = sortedTypes.slice(0, 3);
    // Pad results if fewer than 3 types have scores (e.g., if many scores are 0)
    while (topResults.length < 3) {
        topResults.push({ type: "N/A", dom: "N/A", aux: "N/A", score: 0.0 });
    }

    // Return all necessary data for display
    return {
        topResults: topResults,
        rawFunctionScores: rawFunctionScores,
        finalFunctionScores: finalFunctionScores,
        attitudeCounts: attitudeCounts,
        temperamentSet1: userAnswers['temperament_set1_order'] || '',
        temperamentSet2: userAnswers['temperament_set2_order'] || '',
        ieCounts: ieCounts,
        // Pass through constants that might be needed for display logic in app.js
        typeFunctionStacks: typeFunctionStacks,
        functionsOrder: functions,
        attitudePairsOrder: attitudePairs,
        ATTITUDE_PAIR_FUNCTIONS: ATTITUDE_PAIR_FUNCTIONS
    };
};
// --- END OF MODIFIED score_calculator.js ---