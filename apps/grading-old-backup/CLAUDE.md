# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-based Writing Assessment and Report System - A comprehensive platform for teachers to evaluate student essays, generate visual reports, and manage classroom achievement data.

### System Goals
- Enable batch evaluation of student writing assignments
- Provide individual visual reports for each student
- Offer classroom-wide achievement analytics dashboard
- Support data export to PDF and spreadsheet formats

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Technology Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Runtime**: React 19 with TypeScript 5
- **Styling**: Tailwind CSS v4 (latest architecture)
- **UI Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)
- **Development**: Turbopack enabled

## Project Structure

```
grading-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with font configuration
│   │   ├── page.tsx           # Main grading report page (currently Step 5 - Individual Report)
│   │   ├── globals.css        # Global styles and Tailwind imports
│   │   └── favicon.ico        # App icon
│   └── components/            # React components
│       ├── GrowthStageIndicator.tsx  # Visual progress indicator
│       └── ui/                # UI component library
│           └── Card.tsx       # Card component system
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
└── eslint.config.mjs         # ESLint configuration
```

## Core Features & Development Steps

### Step 1-3: Assessment Setup & AI Evaluation (Backend)
- Rubric management for evaluation criteria
- Assignment data integration
- AI-powered automatic evaluation engine

### Step 4: Teacher Dashboard (Priority Feature)
**Purpose**: Centralized hub for analyzing and managing classroom evaluation results

**Key Components**:
- **Evaluation Grid**: 
  - Rows: Student list (e.g., 김민준, 박진서, 이서연...)
  - Columns: Evaluation domains + overall grades/scores
  - Cells: Achievement levels per domain ('매우 우수', '우수', etc.)
- **Interactive Features**:
  - Sorting by student name, domain scores, or overall score
  - Click student name to navigate to individual report
- **Export Functions**:
  - Excel export (.xlsx format)
  - Google Sheets integration with OAuth

### Step 5: Individual Student Report (Current Implementation)
**Features**:
- Visual report with growth stage indicators
- Four evaluation domains:
  1. 주장의 명확성 (Claim Clarity)
  2. 근거의 타당성 (Evidence Validity)
  3. 논리적 구조 (Logical Structure)
  4. 설득력 있는 표현 (Persuasive Expression)
- Teacher editing capabilities for AI-generated feedback

### Step 6: Output & Sharing
**Individual Reports** (Student/Parent consultation):
- PDF generation with visual design
- Print-optimized styles

**Class-wide Data** (Teacher use):
- Excel/Google Sheets export from dashboard
- Grade processing and educational planning support

## Architecture & Patterns

### Component Architecture

1. **Page Components**: Located in `src/app/`, using Next.js App Router conventions
2. **Reusable Components**: Organized in `src/components/` with sub-folders for different component types
3. **UI Components**: Custom UI library in `src/components/ui/` following compound component pattern

### Key Patterns

1. **Compound Components**: The Card component uses a compound pattern with sub-components (CardHeader, CardTitle, CardContent, etc.)
2. **ForwardRef Pattern**: All UI components properly forward refs for better composability
3. **TypeScript First**: Strict TypeScript configuration with proper type definitions
4. **Path Aliases**: Uses `@/*` alias for absolute imports from `src/` directory
5. **CSS-in-JS**: Tailwind CSS for styling with custom animations defined in config

## Code Conventions

### TypeScript
- Strict mode enabled
- Interface-first approach for component props
- Proper type exports and imports

### React/Next.js
- Functional components with TypeScript
- Server Components by default (App Router)
- Proper use of React 19 features
- Metadata API for SEO

### Styling
- Tailwind CSS utility classes
- Custom animations defined in config
- Responsive design with breakpoint prefixes
- Hover states and transitions for interactivity

### Component Naming
- PascalCase for component files and exports
- Descriptive names indicating component purpose
- Compound components maintain consistent naming

## Important Notes

1. **Korean Language**: The app is designed for Korean users with Korean text throughout
2. **Education Focus**: Specifically designed for evaluating student writing with pedagogical feedback
3. **Mock Data**: Currently uses mock data in the main page - real data integration needed
4. **Animation**: Custom fade-in-up animation with staggered delays for visual appeal
5. **Responsive Design**: Mobile-first approach with responsive breakpoints

## Next Steps for Development

1. Create data models and types for the grading system
2. Implement Teacher Dashboard (Step 4) with evaluation grid
3. Add sorting and filtering capabilities to the dashboard
4. Implement Excel and Google Sheets export functionality
5. Enhance individual report with teacher editing features
6. Add PDF generation for individual reports
7. Implement print-optimized styles