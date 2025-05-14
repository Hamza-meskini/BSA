# **App Name**: Brand Buzz Analyzer

## Core Features:

- Brand Search and Selection: Implement a search bar with autocomplete suggestions based on past searches to allow users to quickly find and select brands.
- Filter Implementation: Design and implement filter options (date range, platform) to refine sentiment analysis. Persist the user's filter settings using local storage.
- Sentiment Analysis and Display: Use a pre-trained sentiment analysis model to calculate sentiment scores and dominant emotions from text data, displaying them through summary cards.
- Interactive Charts: Display a trend of sentiment over time using a line chart, and a word cloud to highlight the most frequent keywords associated with the brand. Include a bar chart for platform comparison.
- Sentiment Report Summarization: Implement a summary generator tool, using a language model, that will generate a one-paragraph summary of the current sentiment analysis report.

## Style Guidelines:

- Dark mode with primary color #3f51b5 and accent color #ff4081.
- Use a gradient background for the hero section to draw the user's eye.
- Incorporate a neutral gray (#222222) for backgrounds and card containers to improve content legibility.
- Use LimeGreen (#32CD32) as the accent color for positive UI elements.
- Use Roboto for headers and Montserrat for body text to create a modern, readable style.
- Utilize Angular Material Icons for a consistent and recognizable visual language.
- Design a responsive layout that adapts to different screen sizes, ensuring a consistent user experience across devices.
- Implement smooth animations for chart transitions and loading states to enhance the user experience.

## Original User Request:
Project Name: Brand Sentiment Analysis Engine
Tech Stack:

Frontend: Angular 17+ (TypeScript), Angular Material, Chart.js/D3.js

Backend: FastAPI (Python)

Styling: SCSS + Tailwind CSS (optional for utility classes)

🎨 Page Layout & Components
1. Header (Top Bar)
Logo: Project name/icon (left-aligned).

Navigation Menu:

Home (default view)

History (past reports)

API Docs (link to Swagger)

User Profile: Dropdown for settings/logout (if auth is added later).

2. Main Input Section (Hero Area)
Brand Search Bar:

Placeholder: “Enter a brand (e.g., Nike, Starbucks)”

Autocomplete: Suggests brands from past searches (local storage/API).

Filters:

Date range picker (Last 7/30/90 days or custom).

Platform toggle (Twitter/Reddit checkboxes).

“Advanced Options” dropdown (language, min. post count).

CTA Button:

“Analyze Sentiment” (triggers API call, shows loading spinner).

3. Results Dashboard (Post-Analysis)
A. Summary Cards (Top Row)
Sentiment Score: Circular progress bar (e.g., 78% Positive).

Total Mentions: Number of posts analyzed.

Top Emotion: Dominant emotion (e.g., “Joy”, “Anger”) with icon.

B. Interactive Charts (Middle Row)
Sentiment Trend: Line chart (time-series of positive/negative/neutral).

Word Cloud: Top keywords (size = frequency, color = sentiment).

Platform Comparison: Bar chart (Twitter vs. Reddit sentiment).

C. Raw Data Table (Bottom Row)
Sample Posts: Paginated table with columns:

Text (trimmed to 50 chars + “...” expandable).

Sentiment (colored pill: green/red/gray).

Platform (icon + name).

Date.

4. Report Generation
PDF Export Button:

Options: Summary (1-page) or Detailed (10-page).

Share Options: Copy link, email, or Slack (if time permits).

🎯 Key UI/UX Requirements
Modern Aesthetic:

Color Palette: Dark mode (primary: #3f51b5, accents: #ff4081).

Typography: Google Fonts (Roboto + Montserrat).

Icons: Angular Material Icons or FontAwesome.

Responsive Design:

Mobile-friendly (collapse filters, scrollable tables).

Micro-Interactions:

Hover effects on cards/buttons.

Smooth chart animations (e.g., fade-in).

Error Handling:

Toast notifications for API errors/empty results.

🔧 Sample Angular Component Structure
bash
Copy
src/app/
├── components/
│   ├── header/                  # Top navigation bar
│   ├── search-bar/             # Brand input + filters
│   ├── sentiment-cards/         # Summary metrics
│   ├── charts/                 # All visualizations
│   └── data-table/             # Raw post table
├── pages/
│   └── home/                   # Main dashboard page
├── services/
│   ├── api.service.ts          # FastAPI calls
│   └── pdf.service.ts         # Report generation
└── models/
    └── sentiment.ts           # TypeScript interfaces
📱 Mockup Wireframe
plaintext
Copy
+-------------------------------------------+
|  Logo | Nav Menu               | User Icon |
+-------------------------------------------+
|  [Brand Search Bar] [Filters] [Analyze]   |
+-------------------------------------------+
|  ⭕ 78% Positive | 📊 1,024 Mentions      |
+-------------------------------------------+
|  📈 Line Chart   |  ☁️ Word Cloud         |
+-------------------------------------------+
|  🏷️ Platform Comparison Bar Chart         |
+-------------------------------------------+
|  📝 Raw Data Table (Paginated)            |
+-------------------------------------------+
|  [Export PDF]  [Share]                    |
+-------------------------------------------+
  