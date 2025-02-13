# eCFR Analytics Project 🏛️

[Live Dashboard](https://frontend-ecfr.onrender.com/)

# TL;DR

# Overview 🔎

A web application for analyzing and visualizing the Electronic Code of Federal Regulations (eCFR). This tool provides insights into regulatory complexity, patterns, and changes over time. It combines some light natural language processing with legal domain knowledge to extract meaningful metrics from regulatory text.

The dashboard provides insights into federal regulations through various metrics and visualizations, helping users understand:

- How consumable regulatory text is for the average American
- How regulations evolve over time
- Which agencies have the most regulatory oversight
- The complexity and burden of different regulations
- Overlapping jurisdictions between agencies

# Metrics

The dashboard gives a general overview of the **Agencies** and **Titles** published on eCRF. You can drill down into an agency or titles from the [dashboard homepage](https://frontend-ecfr.onrender.com/)

Metrics come in two categories:

- Title
- Agency

## Title Complexity Metrics

### Simple Counting Metrics

- Average Sentence Length
- Average Word Length

### Flesch-Kincaid Score

The **Flesch-Kincaid Score** is a readability test that measures how easy or difficult a text is to understand ([link](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)). Flesch Reading Ease Score (0-100):

- Higher scores = easier to read
- Lower scores = more difficult to read
- 0-30: Very difficult (Best understood by university graduates)
- 60-70: Standard/Plain English
- 90-100: Very easy (Can be understood by 11-year-old students)

Some examples:

- Score 100: "The cat sat" (Easy)
- Score 0: "Pursuant to aforementioned subsection..." (Ouch!)
- Most regulations score between 30-50 (Graduate level)

### Technical Term Frequency

Tracks specialized language usage

- Identifies industry-specific terminology
- Helps spot potential compliance challenges
- Useful for targeting areas needing plain language improvements

## Title Text Metrics

### Text Entropy

Text entropy measures the complexity and unpredictability of language in regulatory text. The score ranges from 0 to ~7, where:

- 0-3: Simple, repetitive language
- 3-4: Standard regulatory language
- 4-5: Complex technical language
- 5+: Highly specialized or potentially overly complex language

Higher entropy indicates more varied vocabulary and complex sentence structures, while lower entropy suggests more standardized and predictable language patterns.

### Legal Clairty Score

The Legal Clarity Score evaluates how clearly and unambiguously legal concepts are expressed. Scored from 0-100:

- 80-100: Excellent clarity, precise language
- 60-79: Good clarity, minor ambiguities
- 40-59: Moderate clarity, some unclear sections
- Below 40: Poor clarity, significant revision recommended

The score considers factors like:

- Use of defined terms
- Consistent terminology
- Clear hierarchical structure
- Proper legal cross-references
- Logical organization

### Abiguity Score

The Ambiguity Score identifies potential sources of confusion or multiple interpretations in regulatory text. The score combines:

- Term Analysis:

  - Identification of ambiguous terms
  - Usage frequency
  - Context examples showing potential confusion

- Severity Levels:

  - Low: Minor clarification needed
  - Medium: Multiple sections need revision
  - High: Significant ambiguity risks
  - Critical: Immediate clarity needed

- Contributing Factors:
  - Undefined technical terms
  - Vague qualifiers ("reasonable", "substantial")
  - Inconsistent term usage
  - Unclear time references ("promptly", "timely")
  - Subjective standards ("appropriate", "satisfactory")

### Definition Coverage

Definition Coverage analyzes how well technical and legal terms are defined within the regulation. The metric provides:

- Coverage Rate:

  - Percentage of technical terms with formal definitions
  - Ratio of defined to undefined terms
  - Cross-reference completeness

- Term Analysis:
  - List of defined terms
  - Missing critical definitions
  - Definition consistency
  - Cross-section definition references

Lower coverage rates may indicate a need for additional term definitions or clarification of existing ones. High coverage suggests well-documented terminology that supports clear interpretation.

## Agency Metrics

### Regulatory Burden Analysis

Regulatory Burden metrics assess the complexity and compliance requirements imposed by regulations. These measurements help understand the practical impact on regulated entities.

#### Restriction Words

Counts terms that indicate mandatory actions or limitations:

- Must, shall, required, prohibited
- Mandatory, necessary, forbidden
- Essential, compulsory
- Higher counts suggest more prescriptive regulations.

#### Exception Words

Identifies conditional requirements and special cases:

- Unless, except, provided that
- However, notwithstanding
- Subject to, contingent upon
- Higher counts indicate more complex compliance scenarios.

#### Form Requirements

Tracks documentation and filing obligations:

- Required forms and submissions
- Reporting frequencies
- Documentation retention periods
- Indicates administrative burden on regulated entities.

#### Deadline Mentions

Catalogs time-sensitive requirements:

- Filing deadlines
- Compliance dates
- Review periods
- Renewal timeframes

#### Enforcement Metrics

##### Penalty Provisions

Counts and classifies enforcement mechanisms:

- Civil penalties
- Criminal penalties
- Administrative actions
- License revocations

##### Inspection Requirements

Tracks oversight obligations:

- Site inspections
- Audits
- Compliance reviews
- Record examinations

##### Audit Requirements

Documents verification procedures:

- Financial audits
- Compliance audits
- Third-party verification
- Self-assessment requirements

#### Regulatory Flexibility

##### Small Entity Mentions

Identifies special provisions for small entities:

- Small business accommodations
- Reduced requirements
- Extended deadlines
- Simplified procedures

##### Exemptions

Lists exceptions from requirements:

- Entity-based exemptions
- Activity-based exemptions
- Conditional waivers

##### Alternatives

Documents compliance options:

- Alternative methods
- Equivalent procedures
- Optional approaches

#### Interagency Complexity

##### Agency References

Tracks interactions between agencies:

- Cross-agency requirements
- Shared jurisdiction
- Collaborative enforcement
- Referral requirements

##### Overlapping Jurisdictions

Identifies areas where multiple agencies have authority:

- Concurrent jurisdiction
- Sequential review requirements
- Joint rulemaking
- Coordinated enforcement

This analysis helps stakeholders:

- Assess compliance costs
- Plan implementation strategies
- Identify regulatory bottlenecks
- Advocate for burden reduction

### Word Count

Simple counting metrics for an agency.

- Total word count across all Titles
- Total number of sections owned
- Average words per section
- List of Titles with word and section count

## Historical Change Tracking

- Word Count Changes: Net additions/removals
- Significant Changes: Major modifications to regulatory text

Change Types:

- Additions (new sections)
- Removals (deleted sections)
- Modifications (text changes)

# General Architecture

The eCRF dashboard is a simple client/server web app. I use:

- Frontend:
  - Next.js, Typescript, React, Mui
- Backend:
  - node, express

This is a monorepo that leverages `turbo` for dependency management.

## Offline analysis

I precompute all the analysis in the dashboard to get around the eCRF API rate limiting as well as memory issues when trying to gather certain metrics. You can find the cache at `apps/api/db-json`

If the files for some reason cannot be found I fallback to a web client to call the API

# Running locally

## Dependencies

Included is a `.tools-version` file. If you're using `asdf` (or if not I recommend) you can run `asdf install` to get the correct version of `node`.

Other than node you'll need:

- `pnpm` (pnpm is just a fancier version of npm, it does some nifty caching stuff so I highly recommend)
- `docker`

## Clone the repository

`git clone https://github.com/sbarreiros/ecfr-analytics.git`

## Install dependencies

`pnpm install`

## Start the development server

`docker-compose up`

After running `docker-compose up` you'll have a local server running at http://localhost:3000

# Usage 🚀

## Run specific analyses:

```typescript
// Initialize the analytics engine
const cache = new FileAnalyticsCache('./db-json')
const client = new WebECFRClient()

const analysisClient = new ECFRAnalytics(client, cache)
await analysisClient.initialize()

// Get word counts by agency
const wordCounts = await analytics.getAgencyWordCounts(
  'administrative-conference-of-the-united-states'
)

// Analyze complexity
const complexity = await analytics.getComplexityMetrics(40)

// Get regulatory burden
const burden = await analytics.getRegulatoryBurden('administrative-conference-of-the-united-states')
```
