# Athlete Align: Fuzzy Data Matcher

A specialized data engineering workbench designed to align Olympic and Paralympic athlete datasets. This tool addresses the common challenge of inconsistent data entry across disparate athletic organizations, specifically focusing on mismatched hometown spellings and name variations.

## 🚀 Key Features

- **Fuzzy Matching Engine**: Utilizes Levenshtein distance algorithms combined with heuristic-based normalization to identify potential matches between separate datasets.
- **Geographic Heuristics**: Automatically resolves common location abbreviations (e.g., "Colo Spgs" → "Colorado Springs", "NYC" → "New York City").
- **Tiered Review System**:
  - **Confident Matches**: Automated alignments with high similarity scores.
  - **Flagged for Review**: Matches that meet the threshold but exhibit enough variance to require human validation.
  - **Orphaned Records**: Records from either dataset that could not be matched with high confidence.
- **Two Flags, One Team AI Insights**: Integrated Gemini API assistant that generates strategic parity insights based on geographic distribution data, treating Olympic and Paralympic participation with equal prominence.

## 🛠 Technical Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS (Professional Polish theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: Google Generative AI (@google/genai)

## 📋 Data Logic Specifications

### Normalization
The system transforms raw strings into a canonical format by:
1. Converting to lowercase.
2. Stripping non-alphanumeric characters.
3. Applying a dictionary of common athletic/geographic substitutions.
4. Trimming whitespace.

### Similarity Scoring
The final score is a weighted heuristic:
- **Name Similarity**: 70% weight
- **Hometown Similarity**: 30% weight
- **Year Match**: Strict requirement (exact match required)

Matched records with a combined score below **95%** are automatically flagged for manual review to prevent "Update-Gaps" or data poisoning.

## ⚖️ Usage Note
As per data engineering best practices, this tool's logic **suggests** alignment based on mathematical probability but does not **guarantee** absolute accuracy. Users should always perform manual verification on flagged records before final database commit.
