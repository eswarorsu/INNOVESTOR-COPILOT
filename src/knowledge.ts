export const INNOVESTOR_KNOWLEDGE = {
  company: {
    name: "Innovestor",
    founded_year: 2025,
    founded_location: "Visakhapatnam (Vizag), Andhra Pradesh, India",
    website: "https://www.innovestor.online",
    founders: [
      { name: "Eswar Orsu", role: "Founder" },
      { name: "Chepuri Natraj", role: "Co-Founder" }
    ],
    mission: "Enable founders to demonstrate credibility through execution and provide investors with better signals for discovering early-stage opportunities.",
    vision: "Build a trust-first infrastructure where founders prove credibility through execution transparency and investors discover opportunities earlier."
  },
  platform_overview: {
    description: "Innovestor is a discovery and intelligence layer for the startup ecosystem that connects early-stage founders and investors while improving transparency and credibility through execution-based signals. It is NOT initially a financial transaction platform.",
    platform_type: "Founder-Investor discovery and intelligence platform",
    stage: "Prototype / MVP",
    goals: [
      "Validating founder engagement",
      "Building early community adoption",
      "Testing execution-based visibility models"
    ]
  },
  problem_statement: [
    "Early-stage founders struggle to gain credibility before traction.",
    "Investors lack reliable signals when evaluating idea-stage founders.",
    "Startup platforms rely on static profiles and pitch decks.",
    "High rates of founder inactivity/disappearance after initial engagement.",
    "Early progress and execution activity are rarely documented publicly."
  ],
  target_users: {
    founders: [
      "Idea-stage founders", "MVP-stage builders", "Student entrepreneurs", 
      "Independent developers", "Early-stage startup teams", "Small business innovators"
    ],
    investors: [
      "Angel investors", "Early-stage investors", "Startup scouts", 
      "Micro investors", "Individuals exploring startup opportunities"
    ]
  },
  core_concept: {
    description: "Innovestor shifts from pitch-based evaluation to execution-based evaluation.",
    execution_signals: [
      "Weekly progress reports", "Development screenshots", "Prototype improvements", 
      "Market validation", "User feedback", "Milestone achievements"
    ]
  },
  platform_features: {
    founder_profiles: ["Founder background", "Startup/Idea description", "Product concept", "Progress updates", "Milestones"],
    listings: ["Startup ideas", "MVP projects", "Early products", "Innovation concepts"],
    execution_updates: ["Weekly reports", "Screenshots", "Validation data", "User feedback threads"],
    discovery_system: ["Category filters", "Activity-based signals", "Founder/Startup browsing"]
  },
  platform_workflow: [
    "Step 1: Founder Registration & Profile Creation",
    "Step 2: Idea/Startup Submission",
    "Step 3: Posting structured Execution Updates (screenshots/reports)",
    "Step 4: Activity becomes visible in the ecosystem",
    "Step 5: Investors discover founders via tools/signals",
    "Step 6: Engagement and potential collaboration/investment"
  ],
  platform_philosophy: [
    {
      principle: "Execution Over Ideas",
      description: "Ideas alone are insufficient; execution progress builds true credibility."
    },
    {
      principle: "Transparency Builds Trust",
      description: "Visible progress helps the ecosystem evaluate founders objectively."
    },
    {
      principle: "Early Visibility Matters",
      description: "Founders deserve recognition before achieving massive traction."
    }
  ],
  differentiation: [
    "Execution-based credibility signals vs. pitch decks",
    "Structured progress tracking over time",
    "Early-stage transparency for discovery",
    "Intelligence layer before transaction layer"
  ],
  business_model: {
    status: "Conceptual / Focused on growth first",
    potential_streams: [
      "Founder listing access", "Premium visibility features", 
      "Investor intelligence subscriptions", "Platform analytics tools"
    ]
  },
  ecosystem_role: "Innovestor acts as an early-stage discovery and credibility layer, focusing on the stage BEFORE traditional VC or accelerators.",
  success_metrics: [
    "Number of active founders", "Frequency of progress updates", 
    "Investor discovery engagement", "Founder retention", "Founder-investor interactions"
  ]
};

export const STARTUP_UNICORN_ROADMAP = [
  {
    stage: "A: The Spark (Ideation)",
    description: "Identifying a massive pain point in a large market. Moving from 'solution-looking-for-a-problem' to 'problem-first' thinking.",
    innovestor_role: "Submitting the initial idea to the platform."
  },
  {
    stage: "B: Validation & MVP",
    description: "Building the smallest possible version of the product to test core assumptions. Talking to 100+ potential users.",
    innovestor_role: "Posting first execution signals and development screenshots."
  },
  {
    stage: "C: The 0 to 1 (Early Traction)",
    description: "Getting the first 10-100 paying customers. Iterating rapidly based on feedback. Finding 'Founder-Market Fit'.",
    innovestor_role: "Demonstrating consistency through weekly updates to attract first angel signals."
  },
  {
    stage: "D: Product-Market Fit (PMF)",
    description: "The 'pull' from the market. Users are joining faster than you can support them. Retention is high.",
    innovestor_role: "Using execution history as proof of PMF for seed/angel investors."
  },
  {
    stage: "E: Scaling (Seed to Series A)",
    description: "Building a repeatable sales/marketing engine. Hiring the first key team members beyond the founders.",
    innovestor_role: "Transitioning to institutional discovery."
  },
  {
    stage: "F: Hypergrowth (Series B & C)",
    description: "Aggressive market expansion. Dominating the category. Refining unit economics (LTV > 3x CAC).",
    innovestor_role: "Historical record on Innovestor serves as 'foundational proof' of the founder's long-term execution."
  },
  {
    stage: "G: The Billion Dollar Milestone (Unicorn)",
    description: "Achieving a $1B+ valuation through massive scale, global presence, or platform-level dominance.",
    innovestor_role: "Celebrating the journey from an idea-stage founder to a global leader."
  }
];

export const getKnowledgePrompt = (): string => `
# INNOVESTOR OFFICIAL KNOWLEDGE BASE
Official Website: ${INNOVESTOR_KNOWLEDGE.company.website}

## 1. IDENTITY & MISSION
Founded in 2025 in Visakhapatnam, India by Eswar Orsu and Chepuri Natraj.
- Mission: ${INNOVESTOR_KNOWLEDGE.company.mission}
- Vision: ${INNOVESTOR_KNOWLEDGE.company.vision}

## 2. THE CORE SHIFT: EXECUTION OVER PITCH
Innovestor addresses the "Credibility Gap" at the earliest stages.
- Philosophy: ${INNOVESTOR_KNOWLEDGE.platform_philosophy.map(p => `**${p.principle}**: ${p.description}`).join(' | ')}
- Core Concept: Execution-based evaluation. Founders prove worth through consistent activity, not just slides.

## 3. STARTUP GROWTH ROADMAP (A TO Z)
Innovestor trains founders to navigate the path to a billion-dollar company:
${STARTUP_UNICORN_ROADMAP.map(r => `### ${r.stage}\n- **Goal**: ${r.description}\n- **Innovestor Activity**: ${r.innovestor_role}`).join('\n')}

## 4. PLATFORM CAPABILITIES
- **Founder Profiles**: Public credibility layer with progress history.
- **Execution Updates**: Weekly reports, proof-of-work screenshots, and validation signals.
- **Discovery**: Investors track activity and discovery emerging talent early.

## 5. DIFFERENTIATION
${INNOVESTOR_KNOWLEDGE.differentiation.map(d => `- ${d}`).join('\n')}

## 6. WORKFLOW
${INNOVESTOR_KNOWLEDGE.platform_workflow.join('\n')}

## 7. TARGET AUDIENCE
- Founders: ${INNOVESTOR_KNOWLEDGE.target_users.founders.join(', ')}
- Investors: ${INNOVESTOR_KNOWLEDGE.target_users.investors.join(', ')}
`;
