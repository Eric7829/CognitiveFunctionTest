# HSP3U Project: Jungian Cognitive Function Estimator

This project, developed for my Grade 11 Introduction to Anthropology, Psychology, and Sociology (HSP3U) class, is a web-based tool designed to estimate an individual's personality type based on concepts derived from Carl Jung's theory of cognitive functions, adapted into frameworks like the Myers-Briggs Type Indicator (MBTI) and Keirsey Temperaments.

**Disclaimer:** This tool is a student project intended for educational exploration within the HSP3U curriculum. It is a simplified model of complex psychological theories and should be used for self-reflection and discussion, not as a definitive psychological assessment. Personality is complex and cannot be fully captured by any single test.

## How to Use

1.  Open the `index.html` file in your web browser.
2.  Read the introductory text and instructions carefully.
3.  Answer all 45 questions across the different sections:
    *   **Function Preferences:** Rate your agreement with statements on a 1-7 Likert scale.
    *   **Attitude Preferences:** Choose the option in each pair that best reflects your preference regarding the introverted or extraverted expression of certain functions.
    *   **General Preferences (Axis):** Choose the option in each pair that best reflects your general preference on core cognitive "axes" (like Thinking vs. Feeling).
    *   **Temperament Preferences:** Click to sort the descriptions to rank them from MOST to LEAST like you.
    *   **Overall Orientation:** Choose the option in each pair that best reflects your general Introversion/Extraversion preference.
4.  As you answer questions, the progress bar at the top will update.
5.  Once all questions are answered, click the "Calculate My Type" button.
6.  Your estimated top 3 personality types, along with supporting details, will appear below the form.

## Behind the Scenes: How it Works

The tool processes your answers through several steps to arrive at a type estimation:

1.  **Calculating Raw Function Scores (Q1-24):**
    *   Your responses to the 24 Likert scale questions are averaged for each of the eight cognitive functions (Si, Se, Ni, Ne, Ti, Te, Fi, Fe).
    *   Some questions are "reverse-scored," meaning a high agreement score indicates *low* preference for that function and vice-versa (as noted in the HTML comments). This helps balance the questions.
    *   This provides a "raw score" or baseline preference level for each function.

2.  **Modeling Function Suppression:**
    *   Based on Jung's idea that dominant functions suppress weaker, opposing functions, the system applies a mathematical model (specifically, a smooth sigmoid function) to the raw function scores.
    *   If one function scores significantly higher than others, it acts as a "dominant" function, and the scores of other functions (especially those mathematically "opposite" or lower in a theoretical stack) are proportionally reduced (suppressed).
    *   This isn't a simple "off" switch; the degree of suppression is gradual, aiming to reflect the nuanced nature of function development.

3.  **Determining Attitude & Binary Preferences (Q25-40 & Q43-45):**
    *   For the binary choice questions related to Function Attitude Pairs (like Ti/Te, Fi/Fe) and General Axes (like Ti_Fe, Si_Ne), the tool simply counts which option you chose more often within each set. This determines your preferred "side" or orientation for that aspect.
    *   Similarly, the three I/E questions are tallied to determine your overall leaning towards Introversion or Extraversion.

4.  **Scoring Temperament (Q41-42):**
    *   For the temperament sorting questions, points are assigned based on the rank you give to each temperament description (e.g., MOST = 3 points, 2nd = 1.5, 3rd = 0, LEAST = -1.5).
    *   These scores accumulate for each of the four Keirsey temperaments (SP, SJ, NT, NF).

5.  **Calculating Individual Type Scores:**
    *   The tool knows the theoretical function stack for each of the 16 MBTI types (e.g., INTP = Ti, Ne, Si, Fe).
    *   For each of the 16 types, a composite score is calculated based on how well your personal results match that type's profile:
        *   **Function Stack Match:** The scores of the functions in the type's stack (using the *suppressed* function scores) are weighted heavily, with higher weight given to the dominant and auxiliary functions.
        *   **Function Hierarchy Penalties:** The system checks if your function scores align with the typical hierarchy of a type's stack. For instance, if your score for a type's tertiary function is much higher than its dominant function, a penalty is applied to that type's score. This models the idea that functions develop in a certain order and balance.
        *   **Attitude Preference Boost:** If the attitude of a type's dominant or auxiliary function matches your preferred attitude for that function pair (from Step 3), the type's score gets a boost.
        *   **Binary Axis Boost:** If a type's dominant or auxiliary function aligns with your preference on the corresponding axis questions, the type's score gets a boost.
        *   **Temperament Boost/Penalty:** Types belonging to your higher-ranked temperaments receive a significant boost, while those in lower-ranked temperaments receive a penalty, reflecting your core values/approach preferences.
        *   **I/E Match Boost:** If a type's overall orientation (Introvert or Extravert) matches your overall I/E preference count (from Step 3), the type's score gets a boost.
    *   The final score for each type is a combination of these factors, designed to reward types that show a consistent pattern across the different question types.

6.  **Ranking and Display:**
    *   All 16 types are ranked from highest score to lowest score.
    *   The top 3 types are displayed as the primary result.
    *   A "Details (for nerds only)" section shows the raw function scores, counts for attitude/binary/I/E questions, and the temperament sorting order, allowing for deeper analysis of the results.

## Strengths of This Approach

*   **Directly Addresses Cognitive Functions:** Unlike tests solely based on the four MBTI dichotomies (E/I, S/N, T/F, J/P), this tool attempts to measure and model the eight core Jungian cognitive functions and their attitudes.
*   **Models Suppression:** Incorporating function suppression is a key feature that aligns with a significant aspect of Jung's original theory on function development and interaction.
*   **Incorporates Multiple Facets:** By including Likert scales for function strength, forced choices for attitude/axis preference, and sorting for temperament, the test gathers data from various angles to build a more nuanced profile.
*   **Handles Ambiguity:** The scoring system allows for inconsistent or moderate answers without simply forcing a dichotomy, providing a probabilistic ranking rather than a rigid classification.
*   **Emergent Patterns:** The scoring system is designed such that the natural groupings and relationships between types (like Socionics-ish quadras) tend to emerge from the calculations, even without being explicitly coded.
*   **Concise:** While more detailed than a 4-question MBTI test, 45 questions offer a reasonable balance between depth and completion time, especially for a student project context.
*   **Manual Typing Vibe:** The layered scoring and various question types are intended to mimic the process and considerations someone might use when trying to manually determine their type based on understanding the functions.

## Limitations

*   **Self-Report Bias:** Like any self-report questionnaire, the accuracy depends heavily on the individual's self-awareness and honesty in answering the questions.
*   **Simplified Model:** Psychological reality is far more complex than this model can capture. It simplifies Jungian theory and doesn't account for factors like environment, development stage, trauma, etc.
*   **Parameter Values:** The specific weights, boost values, and suppression parameters used in the scoring algorithm were determined through iterative testing and tuning (pilot testing), and while aiming for accuracy based on observed patterns, they are ultimately somewhat arbitrary design choices of this specific model.
*   **Question Depth:** Having only 3 Likert questions per function provides a limited sample size for measuring the strength of each function. The binary questions and temperament sorting are included to help compensate for this brevity.
*   **Student Project Scope:** This is a learning project. It is not a professionally validated psychological instrument.

## Technologies Used

*   **HTML:** Structures the survey form and result display.
*   **CSS:** Styles the layout, provides visual feedback for selections, implements the circular Likert/Binary options, and styles the sticky progress bar and temperament sorter.
*   **JavaScript:** Handles client-side logic including question randomization (for Likert), processing form submissions, calculating scores based on the described algorithm, implementing the temperament sorting functionality, managing the progress bar, and displaying the results dynamically.

---

