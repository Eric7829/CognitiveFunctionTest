// --- theory.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- START: Cognitive Function Carousel Data & Logic ---
    const cognitiveFunctionData = [
        // Extraverted Intuition (Ne)
        {
            id: 'Ne',
            number: '01',
            label: 'Perceiving',
            heading: 'Ne - Extraverted iNtuition',
            icon: '🎇', // Fireworks for ideas/possibilities
            description: "Extraverted iNtuition (Ne) is like a cosmic idea-generator! It scans the outer world for connections, patterns, and especially new possibilities. It loves asking 'What if...?' and brainstorming a thousand different paths. It's energized by novelty, change, and exploring potential. Think of it as seeing a web of interconnected ideas branching out from everything you encounter.",
            positions: [
                {
                    role: "Dominant / Hero (ENTPs & ENFPs)",
                    manifestation: "As your main power, Ne makes you a whirlwind of inventive ideas and possibilities. You're constantly picking up on new angles and what *could* be. You might jump from one exciting idea to the next, always seeking fresh inspiration from the world around you. You're naturally optimistic about new ventures and can inspire others with your visions for change.",
                    monologue: "<em>'I'm swimming in an endless sea of possibilities about what to do, experience, or think about next, and I want to try them all!'</em>",
                    example: "An ENTP might suddenly connect three unrelated news articles to propose a wild but intriguing solution to a local problem, or an ENFP might get a burst of inspiration for a new community project after talking to a stranger."
                },
                {
                    role: "Auxiliary / Parent (INTPs & INFPs)",
                    manifestation: "Here, Ne supports your dominant Introverted Thinking or Feeling. After you've deeply analyzed something internally (Ti) or checked in with your core values (Fi), Ne helps you explore all the different ways that idea or value could be expressed, understood, or applied in the world. It helps you see multiple perspectives or generate creative options once your main internal work is done. It can bring a more responsible, thought-out creativity.",
                    monologue: "<em>'I see a million different ways to look at this concept I’ve been analyzing (or this value I hold dear), and I want to consider them all to make it better or share it effectively.'</em>",
                    example: "An INTP, after developing a complex theory (Ti), uses Ne to brainstorm various ways to explain it or find real-world examples. An INFP, deeply committed to a cause (Fi), uses Ne to imagine innovative ways to raise awareness or support it."
                },
                {
                    role: "Tertiary / Child (ESTJs & ESFJs)",
                    manifestation: "Ne in this spot is more playful and optimistic. When your practical Te or Se needs a creative boost, Ne can pop up with surprising solutions or a fresh way to look at a problem. It's not your main tool, so it might feel a bit childlike or less refined, but it can bring moments of fun innovation, especially when you're relaxed or trying to find a clever way to achieve a goal.",
                    monologue: "<em>'Okay, this is the plan, but what if we added this little creative twist? That might make it even better/more fun to achieve my goal!'</em>",
                    example: "An ESTJ organizing an event (Te-Si) might use tertiary Ne to come up with a unique theme to make it more engaging. An ESFJ helping a friend (Fe-Si) might use Ne to suggest an unconventional but fun activity to cheer them up."
                },
                {
                    role: "Inferior / Aspirational (ISTJs & ISFJs)",
                    manifestation: "As your biggest challenge, Ne can initially feel scary or chaotic. You might resist new ways of doing things, prefer sticking to the tried-and-true (Si), and feel anxious about too many unpredictable possibilities. You might worry about 'what ifs' in a negative way. Growth involves slowly becoming more comfortable with uncertainty, trying new things, and seeing the potential benefits in change. It's learning to trust that not all new paths lead to disaster.",
                    monologue: "<em>(Before maturation): 'It’s best to stick to reliable methods. Why risk getting lost in a sea of unpredictable possibilities? That sounds stressful!' (With growth): 'Hmm, maybe exploring this new idea isn't so bad after all. It could even be interesting.'</em>",
                    example: "An ISTJ, very comfortable with their routine (Si), might initially dismiss a new software at work, fearing it will disrupt everything. With growth, they might cautiously explore it and find it actually improves efficiency (appealing to their Te). An ISFJ, when their carefully planned family gathering is disrupted by an unexpected event, might initially panic (fear of Ne chaos), but with development, might find a creative way to adapt and even enjoy the spontaneity."
                }
            ]
        },
        // Introverted Intuition (Ni)
        {
            id: 'Ni',
            number: '02',
            label: 'Perceiving',
            heading: 'Ni - Introverted iNtuition',
            icon: '🔮', // Crystal ball for foresight/depth
            description: "Introverted iNtuition (Ni) is like having a deep, internal well of insight. It doesn't brainstorm lots of ideas; instead, it dives deep to uncover the underlying meaning, the hidden pattern, or the most likely future outcome. Ni often works unconsciously, leading to sudden 'aha!' moments or a strong gut feeling about how things will unfold. It's about a singular, profound vision.",
            positions: [
                {
                    role: "Dominant / Hero (INTJs & INFJs)",
                    manifestation: "With Ni as your captain, you live in a world of deep insights and long-range visions. You're constantly piecing together information to understand the essential meaning or predict the future trajectory of events. You trust these inner 'knowings,' even if you can't always explain how you got there. You're driven to understand the 'why' behind everything and see the interconnectedness of all things.",
                    monologue: "<em>'Everything is interconnected, and I must determine the profound meaning and future implications behind those connections.'</em>",
                    example: "An INFJ might have a sudden, clear insight into a friend's hidden motivations. An INTJ might develop a complex, long-term strategy based on a deep understanding of how current trends are likely to evolve."
                },
                {
                    role: "Auxiliary / Parent (ENTJs & ENFJs)",
                    manifestation: "Ni here supports your dominant Extraverted Thinking or Feeling. Once you've decided on an external goal (Te) or how you want to connect with/influence people (Fe), Ni provides the strategic foresight. It helps you see the best path forward, anticipate obstacles, and understand the deeper implications of your actions. It's like an inner compass guiding your external efforts.",
                    monologue: "<em>'How can I use my intuitive knowledge of how things are connected and will likely unfold to achieve what I want effectively (Te) or to best help others (Fe)?'</em>",
                    example: "An ENTJ uses Ni to develop a long-range business plan, foreseeing market shifts. An ENFJ uses Ni to understand the underlying needs of a group and guide them towards a positive future."
                },
                {
                    role: "Tertiary / Child (ISTPs & ISFPs)",
                    manifestation: "When Ni is in this spot, it adds a touch of playful insight or a desire to perfect something you're already good at (thanks to your dominant Ti or Fi, supported by Se). You might get occasional 'hunches' or a desire to find a deeper meaning in your hands-on activities or personal values. It's not about grand visions, but more about refining your craft or understanding with a flash of insight.",
                    monologue: "<em>'How can I use a sudden insight to improve or even perfect this skill I enjoy (Ti-Se) or this thing I deeply care about (Fi-Se)?'</em>",
                    example: "An ISTP might suddenly see a more elegant way to fix an engine (Ti-Se-Ni). An ISFP might have an intuitive flash about how to express a deep emotion through their art (Fi-Se-Ni)."
                },
                {
                    role: "Inferior / Aspirational (ESTPs & ESFPs)",
                    manifestation: "As your hidden challenge, Ni can make you wary of over-analyzing, deep theories, or looking too far into the future. You might prefer to live in the moment (Se) and find abstract, 'hidden meaning' talk a bit pointless. You might fear being 'stuck in your head.' Growth involves learning to appreciate that sometimes there *are* deeper patterns and that a little foresight can be helpful. You might start to get 'gut feelings' you learn to trust more over time.",
                    monologue: "<em>(Before maturation): 'Why overthink everything? The answer is obvious if you just look at what’s happening now! Stop trying to find hidden meanings.' (With growth): 'Okay, maybe there's something to this hunch I have about how this will turn out...'</em>",
                    example: "An ESTP, focused on immediate action (Se), might initially dismiss long-term strategic planning as boring. With development, they might start to see the value in anticipating future challenges for their ventures. An ESFP, enjoying the current social scene (Se), might find discussions about abstract future possibilities draining, but later develop a knack for sensing the underlying dynamics in a group."
                }
            ]
        },
        // Extraverted Sensing (Se)
        {
            id: 'Se',
            number: '03',
            label: 'Perceiving',
            heading: 'Se - Extraverted Sensing',
            icon: '👁️', // Eyes
            description: "Extraverted Sensing (Se) is all about fully engaging with the physical world in the present moment! It's tuned into sights, sounds, tastes, textures, and immediate experiences. Se loves action, variety, and making an impact right here, right now. It's about experiencing life directly and responding spontaneously to what's happening. Nardi's research even shows a 'tennis hop' brain pattern for Se users, ready for quick action!",
            positions: [
                {
                    role: "Dominant / Hero (ESTPs & ESFPs)",
                    manifestation: "With Se as your superpower, you're a force of nature in the present moment! You're incredibly attuned to your surroundings, love hands-on experiences, and are quick to react to opportunities. You thrive on excitement, new sensations, and practical action. You're often adaptable, resourceful, and enjoy making things happen.",
                    monologue: "<em>'I want to sample all the exciting experiences available to me right now and see where they lead! Let's do it!'</em>",
                    example: "An ESTP might impulsively join a pick-up basketball game and excel, or an ESFP might liven up a party with their engaging presence and spontaneous fun."
                },
                {
                    role: "Auxiliary / Parent (ISTPs & ISFPs)",
                    manifestation: "Se here supports your dominant Introverted Thinking or Feeling. After you've figured something out logically (Ti) or decided what's deeply important to you (Fi), Se helps you bring it into the real world. It allows you to engage skillfully with your environment, test your ideas practically, or express your values through tangible actions. It's a more focused, purposeful engagement with the physical world.",
                    monologue: "<em>'Now that I know what I think (Ti) / feel (Fi) is right, I want to go live it out, experience it, or create it in the real world.'</em>",
                    example: "An ISTP uses Se to skillfully apply their mechanical understanding (Ti) to build or fix something. An ISFP uses Se to create beautiful art (Fi) or engage in sensory experiences that align with their values."
                },
                {
                    role: "Tertiary / Child (ENTJs & ENFJs)",
                    manifestation: "Se in this spot brings a more playful and sometimes impulsive engagement with the physical world. It can be a way to blow off steam or enjoy the moment after a lot of focused planning (Ni-Te) or connecting with people (Ni-Fe). You might enjoy occasional thrills, aesthetics, or hands-on activities, and can be surprisingly good at thinking on your feet when needed, even if it's not your usual style.",
                    monologue: "<em>'I usually plan, but hey, sometimes you just gotta seize the moment! This looks fun/interesting, I can react to this.'</em>",
                    example: "An ENTJ, after a long week of strategic planning, might impulsively decide to go rock climbing for fun. An ENFJ, usually focused on emotional dynamics, might suddenly decide to redecorate a room with a keen eye for aesthetics."
                },
                {
                    role: "Inferior / Aspirational (INTJs & INFJs)",
                    manifestation: "As your biggest challenge, Se can make you feel disconnected from or distrustful of the immediate physical world. You might be more in your head (Ni) and find focusing on concrete, present details difficult or overwhelming. You might fear losing control or being too impulsive. Growth involves learning to be more present, appreciate sensory experiences, and trust your ability to act in the moment without overthinking. You might secretly admire people who are very 'in the moment.'",
                    monologue: "<em>(Before maturation): 'The physical world is so unpredictable and chaotic; I need to analyze every possible outcome before acting. Or better yet, just stay in my head where it's safe.' (With growth): 'Actually, this sunset is beautiful. Maybe being present isn't so bad.'</em>",
                    example: "An INTJ, engrossed in a complex theory (Ni), might trip over something obvious in their path. With development, they might learn to enjoy a mindful walk or a hands-on hobby. An INFJ, focused on future possibilities (Ni), might feel anxious in a fast-paced, unpredictable environment. Growth could involve learning to ground themselves through sensory activities like cooking or gardening."
                }
            ]
        },
        // Introverted Sensing (Si)
        {
            id: 'Si',
            number: '04',
            label: 'Perceiving',
            heading: 'Si - Introverted Sensing',
            icon: '📸', // Camera for capturing past impressions
            description: "Introverted Sensing (Si) is like having a highly detailed internal library of past experiences and sensory impressions. It doesn't just remember facts; it re-experiences the subjective feeling of past moments. Si values consistency, reliability, and what has been proven to work. It compares current situations to past ones, looking for familiarity and building a stable, predictable inner world. It provides a strong sense of continuity.",
            positions: [
                {
                    role: "Dominant / Hero (ISTJs & ISFJs)",
                    manifestation: "With Si leading, you have a powerful memory for details and experiences that matter to you. You build your life around what's reliable, proven, and consistent with your past. Traditions, duty, and practical realities are important. You notice when things deviate from the norm and strive to maintain stability and order based on your deeply stored impressions.",
                    monologue: "<em>'I prefer to plan my life around traditional or tried-and-true methods because they've proven reliable. Consistency and dependability are key.'</em>",
                    example: "An ISTJ meticulously follows a budget that has worked for years, noticing any small discrepancy. An ISFJ lovingly prepares a traditional family recipe, recalling cherished memories associated with it."
                },
                {
                    role: "Auxiliary / Parent (ESTJs & ESFJs)",
                    manifestation: "Si here supports your dominant Extraverted Thinking or Feeling. When you're organizing externally (Te) or connecting with others (Fe), Si provides the reliable data and past experiences. It helps you implement plans using proven methods or ensures your social interactions are appropriate and considerate based on established norms. It brings a practical, grounding influence to your external actions.",
                    monologue: "<em>'To achieve my goal (Te) / maintain harmony (Fe), I'll use the most reliable and socially acceptable methods I know from past experience.'</em>",
                    example: "An ESTJ uses Si to draw on past successful projects when creating a new efficient workflow. An ESFJ uses Si to remember important details about people, helping them connect in a caring and appropriate way."
                },
                {
                    role: "Tertiary / Child (INTPs & INFPs)",
                    manifestation: "Si in this spot can bring a fondness for nostalgia or a way to ground your abstract ideas (Ne) or deep feelings (Fi) in something familiar. You might enjoy revisiting favorite books, movies, or memories. It can be a comfort zone, but if overused or immature, it might make you a bit resistant to new experiences if they don't match up to your comfortable past. It's often more playful and less about strict adherence.",
                    monologue: "<em>'How does this new idea/experience I'm exploring (Ne/Fi) compare to what I've known or felt comfortable with in the past? Is it as good as my favorite old thing?'</em>",
                    example: "An INTP might compare a new scientific theory to established principles they've learned, enjoying the contrast. An INFP might find comfort in re-reading a favorite childhood book when feeling overwhelmed by new emotions."
                },
                {
                    role: "Inferior / Aspirational (ENTPs & ENFPs)",
                    manifestation: "As your hidden challenge, Si can make you resistant to routine, tradition, or focusing on mundane details. You might find 'the old way' boring or restrictive (opposite to your dominant Ne). You might overlook important practicalities or past lessons. Growth involves learning that not all traditions are bad, and sometimes details and consistency *are* important for bringing your many ideas (Ne) to fruition. You might secretly admire people who are very dependable and grounded.",
                    monologue: "<em>(Before maturation): 'Ugh, rules and traditions are so limiting! Out with the old, in with the new! Why get bogged down in boring details?' (With growth): 'Okay, maybe having *some* routine could actually help me finish one of my awesome projects. And remembering that past mistake could be useful.'</em>",
                    example: "An ENTP, always chasing new ideas (Ne), might struggle to follow through on projects due to neglecting practical details. With development, they might learn to appreciate systems (a form of Si) that help them organize their innovations. An ENFP, focused on future possibilities (Ne), might initially resist established social norms, but later learn to selectively integrate traditions that align with their values (Fi)."
                }
            ]
        },
        // Extraverted Thinking (Te)
        {
            id: 'Te',
            number: '05',
            label: 'Judging',
            heading: 'Te - Extraverted Thinking',
            icon: '📊', // Chart for organization/efficiency
            description: "Extraverted Thinking (Te) is all about organizing the external world logically and efficiently. It wants to get things done effectively based on facts, systems, and measurable results. Te is decisive, likes clear plans, and values competence. It's focused on creating order and structure in the environment to achieve goals. It's the classic 'results-oriented' mindset.",
            positions: [
                {
                    role: "Dominant / Hero (ESTJs & ENTJs)",
                    manifestation: "With Te as your driving force, you are a master of efficiency and organization in the outer world. You naturally see how to structure systems, implement plans, and achieve goals. You're decisive, direct, and expect competence from yourself and others. You're all about making things happen logically and effectively.",
                    monologue: "<em>'I will achieve my goal by any means necessary, using the most logical and efficient plan. Let's get this done!'</em>",
                    example: "An ESTJ takes charge of a chaotic project, quickly assigning roles and creating a clear action plan. An ENTJ develops a comprehensive long-term strategy for a company, focusing on measurable outcomes."
                },
                {
                    role: "Auxiliary / Parent (INTJs & ISTJs)",
                    manifestation: "Te supports your dominant Introverted iNtuition or Sensing. After you've had your deep insight (Ni) or reviewed your reliable past data (Si), Te helps you bring it into the world in a structured, actionable way. It allows you to organize your thoughts, make clear decisions, and implement your internal vision or knowledge effectively. It's about externalizing your inner world with logic and order.",
                    monologue: "<em>'Now that I have this clear vision (Ni) / reliable information (Si), I will set it into motion using the most straightforward and effective method available.'</em>",
                    example: "An INTJ uses Te to create a detailed project plan to execute their innovative vision. An ISTJ uses Te to organize their workspace and tasks efficiently based on proven methods."
                },
                {
                    role: "Tertiary / Child (ESFPs & ENFPs)",
                    manifestation: "Te here is more about finding straightforward ways to make your immediate desires (Se) or inspiring ideas (Ne) a reality. It's less about grand systems and more about 'how can I get this done simply and quickly?' It can be playful and sometimes a bit blunt, but it gives you a knack for finding the resources or taking the direct step needed to achieve something you want in the moment.",
                    monologue: "<em>'I want this fun thing (Se) / this cool idea (Ne) to happen! I'll just find the most direct way to make it real, no fuss.'</em>",
                    example: "An ESFP might use tertiary Te to quickly figure out the logistics for a spontaneous road trip. An ENFP might use it to find the simplest way to start a new creative project they're excited about."
                },
                {
                    role: "Inferior / Aspirational (ISFPs & INFPs)",
                    manifestation: "As your greatest challenge, Te can make you uncomfortable with external structures, strict logic (especially if it clashes with your values - Fi), or being overly assertive/organized in the outer world. You might struggle to set your plans in motion or fear being seen as incompetent. Growth involves learning to express your thoughts more directly, organize your efforts, and see the value in practical efficiency, without sacrificing your core Fi. You might secretly admire people who are very decisive and effective.",
                    monologue: "<em>(Before maturation): 'I have so many deep values/ideas, but I often struggle to make them happen in the real world. I'm scared of being bossy or not good enough at organizing things.' (With growth): 'Okay, a little structure and a clear plan can actually help me bring my passions to life. And speaking my mind logically isn't always bad.'</em>",
                    example: "An ISFP, driven by their values (Fi), might initially avoid leadership roles. With development, they might learn to use Te to organize a charity event effectively. An INFP, full of ideals (Fi), might struggle with the practical steps of a project, but can learn to appreciate Te for helping them make their dreams a reality. Your own research notes how INFPs might be hesitant to seek help for fear of judgment related to their Te."
                }
            ]
        },
        // Introverted Thinking (Ti)
        {
            id: 'Ti',
            number: '06',
            label: 'Judging',
            heading: 'Ti - Introverted Thinking',
            icon: '⚙️', // Gear for precision/internal logic
            description: "Introverted Thinking (Ti) is like an internal precision engineer. It's all about building a perfectly consistent and accurate logical framework within your own mind. Ti wants to understand the exact principles of how things work, define concepts precisely, and find any inconsistencies in a system of thought. It's less concerned with external results and more with the purity and coherence of its own internal logic. Nardi's research highlights Ti users' ability to enter a dissociative 'objective' state.",
            positions: [
                {
                    role: "Dominant / Hero (INTPs & ISTPs)",
                    manifestation: "With Ti as your guide, your mind is a finely tuned machine for logical analysis. You're constantly identifying patterns, seeking precise definitions, and ensuring your internal understanding of the world is perfectly consistent. You enjoy taking things apart (literally or figuratively) to see how they work and are driven by a need for accuracy and logical truth, even if it's not conventional.",
                    monologue: "<em>'I must figure out exactly how everything works logically in relation to everything else. Is this precise? Is this consistent?'</em>",
                    example: "An INTP might spend hours refining a complex theory to ensure every part is logically sound. An ISTP might expertly diagnose a mechanical problem by understanding the underlying system with incredible precision."
                },
                {
                    role: "Auxiliary / Parent (ENTPs & ESTPs)",
                    manifestation: "Ti supports your dominant Extraverted iNtuition or Sensing. After you've explored a world of possibilities (Ne) or engaged with an immediate experience (Se), Ti helps you analyze it, categorize it, and understand its underlying logic. It brings a critical, analytical lens to your external interactions, helping you refine your ideas or actions based on sound principles. It allows you to think on your feet with precision.",
                    monologue: "<em>'Okay, I've got all these ideas/experiences (Ne/Se). Now, how can I make logical sense of them, find the core principle, or use this understanding to my advantage?'</em>",
                    example: "An ENTP uses Ti to critically analyze the many ideas their Ne generates, picking the most logically coherent one. An ESTP uses Ti to quickly understand the mechanics of a situation (Se) and figure out the most logical way to respond."
                },
                {
                    role: "Tertiary / Child (INFJs & ISFJs)",
                    manifestation: "Ti here adds a playful or developing interest in logical systems and principles. It can help you organize your deep insights (Ni) or your caring actions (Fe-Si) with a bit more internal structure. You might enjoy figuring things out for yourself or finding a logical explanation that fits your worldview, but it's usually in service of your primary functions and might not be as rigorous or detached as dominant Ti.",
                    monologue: "<em>'Does this new insight (Ni) or this way of helping (Fe-Si) fit with what I already know to be true and logical in my own way?'</em>",
                    example: "An INFJ might use tertiary Ti to create a logical framework to explain their intuitive insights about people. An ISFJ might use it to find a more organized way to manage their caregiving responsibilities."
                },
                {
                    role: "Inferior / Aspirational (ENFJs & ESFJs)",
                    manifestation: "As your hidden challenge, Ti can make you uncomfortable with cold, impersonal logic, especially if it seems to dismiss people's feelings (your dominant Fe). You might be overly critical of others (or yourself) if you feel your logic is being questioned, or you might try to use logic in a way that feels a bit forced or harsh. Growth involves learning to value objective truth alongside emotional harmony and developing confidence in your own ability to think critically without it undermining your connections. You might admire people who are very logically precise.",
                    monologue: "<em>(Before maturation): 'Why are they being so nitpicky and critical? Can't they see how this affects people? Their logic feels so cold!' (With growth): 'Okay, I can see the logical point here, even if it's hard to hear. How can I integrate this with what feels right for everyone?'</em>",
                    example: "An ENFJ, focused on group harmony (Fe), might initially avoid situations that require harsh logical analysis. With development, they might learn to deliver constructive criticism in a way that is both logical and compassionate. An ESFJ, wanting to ensure everyone feels good (Fe), might struggle with decisions that are logically necessary but unpopular, but can learn to articulate the rationale calmly."
                }
            ]
        },
        // Extraverted Feeling (Fe)
        {
            id: 'Fe',
            number: '07',
            label: 'Judging',
            heading: 'Fe - Extraverted Feeling',
            icon: '🤗', // Hug for connection/harmony
            description: "Extraverted Feeling (Fe) is all about creating and maintaining emotional harmony in the external environment. It's tuned into the feelings and social expectations of others, and strives to make people feel comfortable, valued, and connected. Fe users are often skilled at reading social cues, facilitating group cohesion, and expressing emotions in a way that is appropriate and considerate of others. It's the glue that holds social groups together. Nardi notes Fe users often use brain regions for social feedback and suppressing raw impulses for sophisticated social responses.",
            positions: [
                {
                    role: "Dominant / Hero (ENFJs & ESFJs)",
                    manifestation: "With Fe as your guiding star, you are a natural at connecting with people and creating a positive social atmosphere. You intuitively understand what others are feeling and what a situation needs emotionally. You strive to meet those needs, ensure everyone feels included, and maintain group harmony. You value cooperation and shared positive experiences.",
                    monologue: "<em>'I will make those around me feel comfortable and happy by identifying what we're all striving for and creating a cohesive, supportive environment.'</em>",
                    example: "An ENFJ expertly mediates a conflict, helping everyone feel heard and understood. An ESFJ hosts a gathering where everyone feels welcomed and well-cared for, anticipating their needs."
                },
                {
                    role: "Auxiliary / Parent (INFJs & ISFJs)",
                    manifestation: "Fe supports your dominant Introverted iNtuition or Sensing. After you've had your deep insight (Ni) or consulted your inner world of experience (Si), Fe helps you share it or act on it in a way that is considerate of others and fosters connection. It helps you communicate your complex inner world in an understandable and appropriate way, or use your knowledge to help and support others effectively.",
                    monologue: "<em>'Now that I understand this deeply (Ni) / have this reliable knowledge (Si), how can I use it to help others, connect with them, or ensure peace?'</em>",
                    example: "An INFJ uses Fe to gently share their insights in a way that empowers others. An ISFJ uses Fe to provide practical, caring support to loved ones based on their needs."
                },
                {
                    role: "Tertiary / Child (ENTPs & ESTPs)",
                    manifestation: "Fe here can be a bit more playful or inconsistently used. You might enjoy charming people or understanding group dynamics, sometimes even to get what you want (Ne-Ti or Se-Ti). It can make you surprisingly good at reading a room or turning on the charisma when needed. As it matures, it becomes less about manipulation and more about genuinely incorporating others' needs into your plans.",
                    monologue: "<em>(Less mature): 'I can sense what they want to hear; maybe I can use that to get my idea across/win this.' (More mature): 'Okay, how can I make this exciting plan/action also good for the group?'</em>",
                    example: "An ENTP might use tertiary Fe to rally support for a new, unconventional idea by appealing to shared excitement. An ESTP might use it to build camaraderie within a team to achieve a practical goal."
                },
                {
                    role: "Inferior / Aspirational (INTPs & ISTPs)",
                    manifestation: "As your biggest challenge, Fe can make you feel awkward or anxious in emotionally charged social situations. You might not know how to respond to others' feelings, or you might fear offending someone accidentally because your focus is on logic (Ti). You might resist social norms or feel overwhelmed by emotional demands. Your secondary research highlighted how inferior Fe in INTPs can lead to behaviors like: resisting commitment, sabotaging relationships, rejecting calls for social responsibility, perceiving emotional influence as corrosive, pointing out logical flaws in others, or even manipulating people as a poor substitute for genuine connection. Growth involves learning to value and navigate the emotional world with more confidence, understanding that connection and harmony have their own kind of 'logic.'",
                    monologue: "<em>(Before maturation): 'Feelings are messy and illogical. I don't know what to do with them, and I'm terrified of saying the wrong thing or being emotionally manipulated.' (With growth): 'Okay, I'm starting to understand why these social connections matter, and maybe I can learn to express care in my own way.'</em>",
                    example: "An INTP, focused on logical precision (Ti), might blurt out a critical truth that upsets someone. With development, they learn to consider the emotional impact of their words. An ISTP, usually self-reliant (Ti-Se), might avoid group activities, but can learn to appreciate the value of shared experiences and offer quiet, practical support that shows they care."
                }
            ]
        },
        // Introverted Feeling (Fi)
        {
            id: 'Fi',
            number: '08',
            label: 'Judging',
            heading: 'Fi - Introverted Feeling',
            icon: '💖', // Heart for inner values/authenticity
            description: "Introverted Feeling (Fi) is like an inner moral compass, deeply attuned to personal values, ethics, and authenticity. It's about understanding what feels truly right or wrong on an individual level, regardless of external pressures or social norms. Fi strives for congruence between one's actions and deepest beliefs. It's less about group harmony and more about personal integrity and the emotional resonance of one's own inner world.",
            positions: [
                {
                    role: "Dominant / Hero (INFPs & ISFPs)",
                    manifestation: "With Fi as your core, you are guided by a powerful sense of your own values and what is truly meaningful to you. You make decisions based on what feels right in your soul, and strive to live a life that is authentic and true to your inner convictions. You have deep empathy for others, especially those who are suffering or misunderstood, filtered through your own ethical framework.",
                    monologue: "<em>'I must decide how I feel and where I stand on these issues based on my deepest values before I can act or come to a conclusion.'</em>",
                    example: "An INFP champions a cause they believe in with unwavering passion, even if it's unpopular. An ISFP creates art that expresses their deepest, most personal emotions and values."
                },
                {
                    role: "Auxiliary / Parent (ENFPs & ESFPs)",
                    manifestation: "Fi supports your dominant Extraverted iNtuition or Sensing. After you've explored a world of possibilities (Ne) or immersed yourself in an experience (Se), Fi helps you check in with yourself: 'How do I feel about this? Does this align with what's important to me?' It brings a depth of personal meaning and ethical consideration to your external adventures, ensuring your actions feel authentic.",
                    monologue: "<em>'After all this excitement/exploration (Ne/Se), I need to reflect: How do I truly feel about this, and is it in line with my core values?'</em>",
                    example: "An ENFP, after generating many exciting ideas, uses Fi to choose the project that resonates most deeply with their personal mission. An ESFP, after an engaging social event, uses Fi to consider if their interactions were genuine and true to themselves."
                },
                {
                    role: "Tertiary / Child (INTJs & ISTJs)",
                    manifestation: "Fi here is more about developing a quiet, personal sense of ethics or values that underpins your logical (Te) and experience-based (Si) approach. It might not be loudly expressed, but it can lead to strong, unwavering moral stances on certain issues, often related to justice or personal integrity. It can be a bit black-and-white and childlike in its conviction, but it adds a layer of inner consistency to your decisions.",
                    monologue: "<em>'This is just RIGHT (or WRONG) based on my inner sense, and I must stick to that, even if it's not the most 'efficient' or 'traditional' thing.'</em>",
                    example: "An INTJ, despite their focus on logical systems, might have an unshakeable personal ethical code that influences their long-term plans. An ISTJ, typically focused on duty and rules, might quietly stand up for an underdog if they feel a deep sense of injustice."
                },
                {
                    role: "Inferior / Aspirational (ENTJs & ESTJs)",
                    manifestation: "As your hidden challenge, Fi can make you uncomfortable with deep, personal emotions (your own or others'), or with situations that require a lot of subjective value judgments. You might dismiss feelings as 'illogical' or 'weak' (opposite to your dominant Te). You might fear being vulnerable or appearing sentimental. Growth involves learning to connect with your own inner values, understand the importance of personal meaning, and express your authentic self with more confidence, realizing that not everything can be decided by pure logic or efficiency.",
                    monologue: "<em>(Before maturation): 'Feelings are messy and get in the way of getting things done. Just stick to the facts and be logical!' (With growth): 'Okay, I'm starting to realize that what *I* truly value matters, and maybe being a bit vulnerable isn't so bad after all.'</em>",
                    example: "An ENTJ, focused on achieving ambitious goals (Te), might initially overlook the emotional impact of their decisions on their team. With development, they learn to lead with more empathy and consider personal values. An ESTJ, focused on rules and efficiency (Te), might struggle with situations that don't have a clear 'right' or 'wrong' answer based on external standards, but can learn to appreciate the nuances of individual values."
                }
            ]
        }
    ];


    // DOM element references within the component
    const componentContainer = document.querySelector('.cognitive-function-component');
    const functionIconEl = componentContainer?.querySelector('.function-icon'); // Renamed to avoid conflict
    const functionHeadingEl = componentContainer?.querySelector('.function-heading'); // Renamed
    const functionLabelEl = componentContainer?.querySelector('.function-label'); // Renamed
    const functionsCarouselEl = componentContainer?.querySelector('.functions-carousel'); // Renamed
    const navigationBarEl = componentContainer?.querySelector('.navigation-bar'); // Renamed
    const mouseCursorEl = componentContainer?.querySelector('.mouse-cursor'); // Renamed

    let currentFunctionIndex = 0; // Default to the first function in the data

    function initializeCognitiveFunctionsUI() {
        if (!componentContainer || !functionsCarouselEl || !navigationBarEl) {
            console.warn("Cognitive function component elements for theory page not found. Skipping initialization.");
            return;
        }

        const totalPages = cognitiveFunctionData.length;
        if (totalPages === 0) return;

        functionsCarouselEl.innerHTML = '';
        functionsCarouselEl.style.width = `${totalPages * 100}%`;

        cognitiveFunctionData.forEach(funcData => {
            const functionPage = document.createElement('div');
            functionPage.classList.add('function-page');
            functionPage.style.width = `${100 / totalPages}%`;

            let positionsHtml = funcData.positions.map(pos => `
                <div class="function-position-block">
                    <h4>${pos.role}</h4>
                    <p>${pos.manifestation}</p>
                    <p class="function-monologue">${pos.monologue}</p>
                    <p><strong>Example:</strong> ${pos.example}</p>
                </div>
            `).join('');

            functionPage.innerHTML = `
                <p class="body-text">${funcData.description}</p>
                ${positionsHtml}
            `;
            functionsCarouselEl.appendChild(functionPage);
        });

        navigationBarEl.innerHTML = '';
        cognitiveFunctionData.forEach((funcData, index) => {
            const navItem = document.createElement('div');
            navItem.classList.add('nav-item');
            navItem.dataset.index = index;
            navItem.innerHTML = `
                <span class="nav-label">${funcData.id}</span>
                <span class="nav-number">${funcData.number}</span>
            `;
            navItem.addEventListener('click', handleNavClick);
            navigationBarEl.appendChild(navItem);
        });

        updateCognitiveFunctionDisplay(currentFunctionIndex);
    }

    function updateHeader(index) {
        if (!functionIconEl || !functionHeadingEl || !functionLabelEl) return;
        const func = cognitiveFunctionData[index];
        functionIconEl.textContent = func.icon;
        functionHeadingEl.textContent = func.heading;
        functionLabelEl.textContent = func.label; // This shows "Perceiving" or "Judging"
    }

    function slideContent(index) {
        if (!functionsCarouselEl) return;
        const totalPages = cognitiveFunctionData.length;
        if (totalPages === 0) return;

        const translateXValue = -index * (100 / totalPages);
        functionsCarouselEl.style.transform = `translateX(${translateXValue}%)`;
    }

    function updateNavigationHighlight(index) {
        if (!navigationBarEl) return;
        const navItems = navigationBarEl.querySelectorAll('.nav-item');
        navItems.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('active');
                if (mouseCursorEl) moveMouseCursor(item);
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

    function moveMouseCursor(activeNavItem) {
        if (!mouseCursorEl || !navigationBarEl || !componentContainer) return;

        const navBarRect = navigationBarEl.getBoundingClientRect();
        const itemRect = activeNavItem.getBoundingClientRect();
        const componentRect = componentContainer.getBoundingClientRect();

        const cursorOffsetX = itemRect.left + (itemRect.width / 2) - componentRect.left;
        // Adjust Y position to be below the nav item, inside the component bounds
        const cursorOffsetY = itemRect.bottom - componentRect.top -2; // Position it just below the item


        mouseCursorEl.style.left = `${cursorOffsetX - (mouseCursorEl.offsetWidth / 2)}px`;
        mouseCursorEl.style.top = `${cursorOffsetY}px`;
        mouseCursorEl.style.opacity = '1';
    }
    // --- END: Cognitive Function Carousel Logic ---


    // --- START: Table of Contents (TOC) Functionality ---
    let tocItems = [];

    function initializeTOC() {
        const tocContainer = document.createElement('nav');
        tocContainer.classList.add('toc-sidebar');
        tocContainer.innerHTML = '<h3>On This Page</h3><ul id="toc-list"></ul>';

        const tocList = tocContainer.querySelector('#toc-list');
        if (!tocList) {
            console.warn("TOC list element not found in TOC container.");
            return;
        }

        const sections = document.querySelectorAll('.main-content section[id]');
        sections.forEach(section => {
            const sectionId = section.id;
            const sectionTitleElem = section.querySelector('h2');

            if (!sectionTitleElem) {
                console.warn(`Section with ID '${sectionId}' is missing an H2 for TOC title.`);
                return;
            }
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
                    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset - 15;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });

            listItem.appendChild(link);
            tocList.appendChild(listItem);
            tocItems.push({ linkElement: link, sectionElement: section });
        });

        if (tocItems.length > 0) {
            const pageWrapper = document.querySelector('.page-wrapper');
            if (pageWrapper && pageWrapper.parentNode === document.body) {
                document.body.insertBefore(tocContainer, pageWrapper);
            } else {
                document.body.prepend(tocContainer);
            }

            document.body.classList.add('body-has-toc');
            window.addEventListener('scroll', handleTocScrollActiveState, { passive: true });
            handleTocScrollActiveState();
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
        const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
        const activationPoint = headerOffset + viewportHeight * 0.2;


        for (let i = tocItems.length - 1; i >= 0; i--) {
            const item = tocItems[i];
            const section = item.sectionElement;
            const sectionTop = section.offsetTop;

            if (scrollY >= sectionTop - activationPoint) {
                currentActiveSectionId = section.id;
                break;
            }
        }

        if (currentActiveSectionId === null && tocItems.length > 0) {
            if (scrollY < tocItems[0].sectionElement.offsetTop - activationPoint + (viewportHeight*0.1) ) {
                currentActiveSectionId = tocItems[0].sectionElement.id;
            }
        }

        const totalPageHeight = document.documentElement.scrollHeight;
        const scrollPositionAtBottom = scrollY + viewportHeight;
        if (scrollPositionAtBottom >= totalPageHeight - 50 && tocItems.length > 0) {
            currentActiveSectionId = tocItems[tocItems.length - 1].sectionElement.id;
        }

        updateTocActiveState(currentActiveSectionId);
    }
    // --- END: Table of Contents (TOC) Functionality ---

    // Initialize all UI components
    initializeCognitiveFunctionsUI(); // Initialize the new carousel
    initializeTOC();                // Initialize the TOC
});