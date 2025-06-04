# Cosmic Mindscape: A Jungian Cognitive Function Estimator

Welcome to the Cosmic Mindscape! This project is a personality assessment tool designed to estimate your psychological type based on Carl Jung's theory of cognitive functions, as further developed by Katharine Briggs and Isabel Myers into the 16 Myers-Jung personality types.

## Project Origin & Purpose

This "Cosmic Mindscape Estimator" began as a Grade 11 Independent Study Project (ISP) in HSP3U (Introduction to Anthropology, Psychology, and Sociology). It was born out of a critical observation: many widely used personality assessments in educational settings (such as those found on platforms like MyBlueprint, often mirroring the 16Personalities.com model) lack a strong theoretical grounding in Jungian cognitive functions. Instead, they often rely on mapping broad personality traits to MBTI-like labels, potentially leading to inaccurate self-perceptions and misguided educational or career guidance for students.

The primary goal of this project is to:

1.  Provide a **more theoretically sound and transparent** personality assessment experience based on Jungian cognitive functions.
2.  Offer an **educational tool** that helps users understand the underlying principles of their cognitive preferences.
3.  Serve as a **demonstration and potential alternative** to less accurate, trait-based assessments currently prevalent in some educational systems.
4.  Explore the **predictive potential of cognitive functions** in relation to educational philosophy preferences, as investigated in the original ISP research.

This entire website, including the test, scoring algorithm, theory explanations, and type descriptions, was developed as part of this research.

## Core Theory: Jungian Cognitive Functions & Myers-Jung Types

This assessment is rooted in the work of:

*   **Carl Jung:** A Swiss psychiatrist and psychoanalyst who founded analytical psychology. Jung introduced the concepts of introversion and extraversion as fundamental attitudes and identified four primary psychological functions:
    *   **Sensing (S)** & **iNtuition (N)** (Perceiving functions - how we gather information)
    *   **Thinking (T)** & **Feeling (F)** (Judging functions - how we make decisions)
    Each of these can be primarily directed inward (Introverted - i) or outward (Extraverted - e), resulting in 8 cognitive functions (e.g., Introverted Thinking - Ti, Extraverted Sensing - Se).
*   **Katharine Cook Briggs & Isabel Briggs Myers:** A mother-daughter duo who built upon Jung's work to create the Myers-Briggs Type Indicator® (MBTI®). They developed the concept of a "function stack" (a hierarchy of four primary cognitive functions: Dominant, Auxiliary, Tertiary, and Inferior) for each of the 16 personality types.

This test attempts to estimate your preferences for these 8 functions and, based on their dynamic interplay, suggest your most likely 16-type Myers-Jung profile.

## How the Scoring Algorithm Works (A Glimpse Under the Hood)

The personality type estimation is not a simple tally. The `score_calculator.js` employs a multi-step algorithm:

1.  **Raw Function Scores:** Initial scores for each of the 8 cognitive functions are derived from your responses to Likert-scale questions.
2.  **Attitude Preference Integration:** Your choices in binary questions (e.g., preferring Ni over Ne) directly influence the scores, transferring some "weight" from the less-preferred to the more-preferred function within a pair.
3.  **Intra-Pair Suppression:** The algorithm models how a strong preference for one function in a related pair (e.g., Te vs. Fe, or Ti vs. Fi) can "suppress" or overshadow its counterpart, creating a clearer differentiation.
4.  **Global Suppression:** Functions scoring significantly lower than your highest-scoring function(s) have their influence gently reduced using a sigmoid function. This helps to highlight your most prominent cognitive preferences.
5.  **Temperament & I/E Boosts:** Your responses to temperament sorting questions (if included in the version you took) and Introversion/Extraversion preference questions provide boosts to types that align with these broader patterns. Based on David Keirsey's temperament theory.
6.  **Function Stack Matching:** Finally, your adjusted function scores are compared against the theoretical "ideal" function stacks for all 16 Myers-Jung types. Each function's position (Dominant, Auxiliary, Tertiary, Inferior) is weighted. The type whose stack best matches your unique profile of function strengths is presented as your most likely result.

This function-based, dynamic approach aims to provide a more nuanced estimation than simple dichotomous scoring.

## Website Structure

The Cosmic Mindscape website is organized as follows:

*   **Personality Test (`index.html`):** The main entry point where you can take the assessment.
    *   Powered by `app.js` (handles UI, question loading, progress) and `score_calculator.js` (calculates results).
    *   Questions are sourced from `questions.json`.
*   **Type Pages (`types/` directory):** Detailed descriptions for each of the 16 personality types (e.g., `types/istp.html`). Each page includes:
    *   An introduction to the type.
    *   A dynamic cognitive function carousel explaining its dominant, auxiliary, tertiary, and inferior functions.
    *   Strengths, challenges, relationship insights, career paths, work habits, and learning strengths.
*   **Resource Pages (`resources/` directory):**
    *   **Theory (`resources/theory.html`):** An in-depth explanation of Jungian cognitive functions, the 16 types, function stacks, and how this test differs from others like 16Personalities.com.
    *   **History (`resources/history.html`):** A brief overview of the development of Jungian typology and the MBTI.
    *   **Special Thanks (`resources/special_thanks.html`):** Acknowledgments.

## How to Use This Website

1.  **Take the Test:** Start at `index.html`. Answer all questions thoughtfully.
2.  **Review Your Results:** The results page will show your estimated type and a breakdown of your function scores.
3.  **Explore Your Type Page:** Click through to your estimated type's page for a detailed profile.
4.  **Dive into the Theory:** Visit the `resources/theory.html` page to understand the concepts behind your results.
5.  **Browse Other Types:** Curious about other personality constellations? Explore the "Types" menu.

## Key Differentiators: Why This Test?

This "Cosmic Mindscape Estimator" differs significantly from many popular online personality quizzes (like 16Personalities.com) because:

*   **It's Function-Based:** It attempts to measure your preference for Jung's 8 cognitive functions and model their hierarchy, not just score you on four behavioral dichotomies derived from trait theory.
*   **Theoretically Grounded:** The questions and scoring are designed with Jungian and Myers-Briggs theory in mind.
*   **Transparent:** We aim to explain the underlying theory and scoring logic.
*   **Educational Focus:** The goal is genuine self-understanding and learning about psychological type, not just a label.
*   **Ethically Developed:** This is a student-led research project offered freely, without the commercial motivations or misleading disclaimers found in some other platforms.

Preliminary empirical research (part of the original ISP) showed this instrument's type distribution aligns more closely with established Canadian MBTI base rates than those derived from 16Personalities.com results, and that function preferences derived from this model correlate with educational philosophy preferences.

## Limitations

*   **Student Project:** This tool was developed by a Grade 11 student as part of an Independent Study Project. While based on extensive research, it has not undergone formal, large-scale psychometric validation by professional psychometricians.
*   **Self-Report Nature:** All personality assessments based on self-report are subject to individual biases and levels of self-awareness.
*   **Estimation, Not Diagnosis:** The results provide an *estimation* of your likely Myers-Jung type. It is a tool for exploration, not a definitive psychological diagnosis.

## Future Work

This project is a continuous work in progress. Potential future enhancements include:

*   Further refinement of questions and the scoring algorithm based on more data.
*   Expanded type descriptions and resources.
*   Perhaps more interactive visualizations of function dynamics.

## Contact & Feedback

Your feedback is valuable! If you have any questions, suggestions, or encounter any issues, please feel free to reach out.
Email me at ericzhao8008@gmail.com 

---
