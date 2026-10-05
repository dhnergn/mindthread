import { UserQuestion } from '../types';

export const SAMPLE_QUESTION_SETS: { name: string; tag: string; description: string; questions: Partial<UserQuestion>[] }[] = [
  {
    name: "The Polymath's Thursday",
    tag: "Everyday Curiosity",
    description: "A blend of coffee biology, computing internals, physics, and history asked during a workday.",
    questions: [
      {
        text: "Why does coffee sometimes make you more tired instead of awake?",
        timeOfDay: "morning",
        contextTag: "Morning Kitchen",
        domain: "Neurobiology",
        quickAnswer: "Coffee blocks adenosine receptors without eliminating adenosine; if you are already sleep-deprived, adenosine continues accumulating behind the barricade, leading to a severe crash or tiredness when tolerance or dehydration kicks in.",
        keyConcepts: ["Adenosine Receptors", "Circadian Rhythm", "Metabolic Tolerance", "Vasoconstriction"],
        prerequisiteLevel: "Foundational",
        curiositySpark: "Reveals how psychoactive substances interact with cellular debt rather than providing actual biological energy."
      },
      {
        text: "How does HTTPS negotiate encryption keys in public without an eavesdropper stealing them?",
        timeOfDay: "afternoon",
        contextTag: "At Work / Code",
        domain: "Computer Science & Cryptography",
        quickAnswer: "Through Diffie-Hellman key exchange and asymmetric public-private key cryptography, both parties combine private secrets with mathematical one-way modular arithmetic to agree on a shared secret that an observer cannot compute.",
        keyConcepts: ["Diffie-Hellman Key Exchange", "Modular Arithmetic", "Public Key Cryptography", "TLS Handshake"],
        prerequisiteLevel: "Intermediate",
        curiositySpark: "Unlocks the foundational mathematical sleight-of-hand that safeguards all modern digital civilization."
      },
      {
        text: "Why does sprinkling salt on icy roads melt the ice, and why does it fail when it gets extremely cold?",
        timeOfDay: "afternoon",
        contextTag: "Commute",
        domain: "Physical Chemistry",
        quickAnswer: "Dissolved salt ions disrupt water molecules from organizing into rigid crystal lattices, lowering the freezing point (freezing point depression) down to about -21°C (-6°F), below which even saturated brine freezes solid.",
        keyConcepts: ["Freezing Point Depression", "Ionic Dissociation", "Thermodynamic Equilibrium", "Lattice Energy"],
        prerequisiteLevel: "Foundational",
        curiositySpark: "Connects everyday winter municipal maintenance directly to entropy and intermolecular bonding."
      },
      {
        text: "Why did the Roman Empire permanently split into the Western and Eastern empires?",
        timeOfDay: "evening",
        contextTag: "Reading Book",
        domain: "World History",
        quickAnswer: "The empire became administratively and militarily too massive for a single ruler to defend along thousands of miles of hostile frontiers, and Diocletian established the Tetrarchy to balance governance between the Latin West and wealthier Greek East.",
        keyConcepts: ["Diocletianic Reforms", "Tetrarchy", "Geopolitical Fragmentation", "Byzantine Transition"],
        prerequisiteLevel: "Intermediate",
        curiositySpark: "Demonstrates how logistical limits and economic divergence dictate the lifespan of massive centralized superstructures."
      },
      {
        text: "How do transformers in large language models actually use attention to understand context across long texts?",
        timeOfDay: "night",
        contextTag: "Late Night Thought",
        domain: "Artificial Intelligence",
        quickAnswer: "Self-attention computes dot-product similarity matrix between query, key, and value vectors of tokens, allowing every word to dynamically weigh and attend to every other word regardless of linear distance.",
        keyConcepts: ["Self-Attention Mechanism", "Query-Key-Value Vectors", "Softmax Weighting", "Positional Embeddings"],
        prerequisiteLevel: "Deep Dive",
        curiositySpark: "Bridges linear linguistic communication to multi-dimensional vector space geometry."
      }
    ]
  },
  {
    name: "The Science & Mind Explorer",
    tag: "Mind & Nature",
    description: "Curiosities about cognitive perception, acoustic physics, materials science, and atmospheric wonders.",
    questions: [
      {
        text: "Why do noise-canceling headphones work so well for airplane hums but struggle with sudden human speech?",
        timeOfDay: "morning",
        contextTag: "Morning Commute",
        domain: "Acoustics & Signal Processing",
        quickAnswer: "Active noise cancellation generates anti-phase sound waves (destructive interference); constant repetitive low-frequency hums give the DSP predictable lead time, whereas erratic, high-frequency human vocal transients happen faster than the loop can counteract.",
        keyConcepts: ["Destructive Interference", "Phase Inversion", "Digital Signal Processing", "Acoustic Latency"],
        prerequisiteLevel: "Intermediate",
        curiositySpark: "Demonstrates how physics must race against algorithmic latency in real-time embedded hardware."
      },
      {
        text: "Why is glass completely transparent to visible light when it is made from opaque sand?",
        timeOfDay: "afternoon",
        contextTag: "Coffee Break",
        domain: "Solid State Physics",
        quickAnswer: "Glass is an amorphous solid with an electronic bandgap so wide that visible photons lack the energy required to excite electrons to the conduction band, allowing the light to pass right through unabsorbed.",
        keyConcepts: ["Electronic Bandgap", "Amorphous Structure", "Photon Absorption", "Molecular Energy States"],
        prerequisiteLevel: "Intermediate",
        curiositySpark: "Reveals that transparency is not empty space, but a quantum mismatch between photon energy and atomic electrons."
      },
      {
        text: "Why does the sensation of Déjà vu occur in healthy brains?",
        timeOfDay: "evening",
        contextTag: "Dinner Conversation",
        domain: "Cognitive Neuroscience",
        quickAnswer: "It is widely theorized as a brief micro-mismatch in temporal memory encoding—where perceptual sensory input bypasses short-term processing and directly triggers familiarity signals in the temporal lobe/hippocampus.",
        keyConcepts: ["Temporal Lobe Signaling", "Hippocampal Retrieval", "Perceptual Processing", "Dual-Processing Mismatch"],
        prerequisiteLevel: "Intermediate",
        curiositySpark: "Highlights how our certainty of time and memory is an actively computed hallucination of brain regions."
      }
    ]
  }
];
