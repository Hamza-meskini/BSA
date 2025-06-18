# Brand Sentiment Analysis Frontend

This is the frontend application for the Brand Sentiment Analysis project, built with Next.js. The application provides real-time sentiment and emotion analysis of brand mentions across multiple social media platforms.

## Environment Variables

The following environment variables need to be set in your Railway project:

- `NEXT_PUBLIC_API_URL`: The URL of your backend API (e.g., https://brandsentimentanalysisbackend-production.up.railway.app)
- `GOOGLE_GENAI_API_KEY`: Your Google Generative AI API key
- `API_KEY`: Your backend API key (this is used server-side only)

Note: The `API_KEY` is used server-side in the API routes to authenticate requests to the backend. It is not exposed to the client.

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/Hamza-meskini/BrandSentimentAnalysisFrontEnd.git
cd BrandSentimentAnalysisFrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=https://brandsentimentanalysisbackend-production.up.railway.app
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
API_KEY=your_backend_api_key
```

4. Run the development server:
```bash
npm run dev
```

## Application Workflow

### 1. Brand Analysis
- **Input**: 
  - Enter a brand name
  - Select the analysis period (days)
  - Choose data sources (Twitter, Reddit, Google News)

- **Data Collection Process**:
  1. **Twitter Data Collection**:
     - Fetch tweets using Twitter API
     - Filter tweets containing brand name (case-insensitive)
     - Include variations (e.g., "brand's", "BRAND")
     - Collect engagement metrics (likes, retweets)
     - Store tweet metadata (date, author, link)

  2. **Reddit Data Collection**:
     - Access subreddit posts via PRAW
     - Collect posts and comments
     - Gather engagement metrics (upvotes, comments)
     - Store post metadata (date, author, link)

  3. **Google News Collection**:
     - Fetch news articles via Serper API
     - Apply source credibility scoring
     - Collect article metadata
     - Store publication dates and links

- **Data Processing**:
  1. **Text Cleaning**:
     - Remove URLs and special characters
     - Normalize text (lowercase, whitespace)
     - Remove mentions and hashtags
     - Preserve meaningful content

  2. **Data Normalization**:
     - Standardize date formats
     - Normalize engagement metrics
     - Align data structures across platforms
     - Handle missing or invalid data

  3. **Sentiment Analysis**:
     - Process text through Gemini AI
     - Classify sentiment (positive, negative, neutral)
     - Calculate sentiment scores
     - Generate sentiment distribution

  4. **Emotion Analysis**:
     - Identify primary emotions (joy, sadness, anger, fear, frustration, neutral)
     - Calculate emotion scores
     - Generate emotion distribution
     - Track emotion trends

- **Analysis Generation**:
  1. **Statistical Analysis**:
     - Calculate engagement metrics
     - Generate platform-specific statistics
     - Compute overall sentiment scores
     - Analyze emotion patterns

  2. **Trend Analysis**:
     - Track sentiment changes over time
     - Monitor emotion evolution
     - Identify peak engagement periods
     - Analyze platform-specific trends

  3. **Insight Generation**:
     - Process data through AI
     - Generate key findings
     - Create actionable recommendations
     - Identify notable patterns

- **Output**:
  1. **Dashboard Components**:
     - Sentiment distribution charts
     - Emotion analysis graphs
     - Platform comparison visualizations
     - Trend analysis timelines
     - Word cloud of key terms

  2. **Interactive Features**:
     - Filterable data views
     - Drill-down capabilities
     - Export functionality
     - Real-time updates

  3. **Report Generation**:
     - PDF report creation
     - Executive summary
     - Detailed analysis
     - Recommendations
     - Raw data access

### 2. Sentiment Analysis
- **Features**:
  - Overall sentiment distribution (positive, negative, neutral)
  - Sentiment trends over time
  - Platform-specific sentiment comparison
  - Word cloud of key terms
- **Visualization**: Interactive charts and graphs

### 3. Emotion Analysis
- **Emotions Tracked**:
  - Joy
  - Sadness
  - Anger
  - Fear
  - Frustration
  - Neutral
- **Features**:
  - Emotion distribution across platforms
  - Emotion trends over time
  - Engagement scores by emotion

### 4. AI-Powered Insights
- **Generation Process**:
  1. Analyze sentiment and emotion data
  2. Process key terms and trends
  3. Generate contextual insights
  4. Provide actionable recommendations
- **Output**:
  - Summary of findings
  - Key insights
  - Strategic recommendations

### 5. Report Generation
- **PDF Report Features**:
  - Executive summary
  - Sentiment and emotion analysis
  - Platform-specific insights
  - Key metrics and trends
  - AI-generated recommendations
  - Relevant posts and mentions
- **Generation Process**:
  1. Collect all analysis data
  2. Format for PDF generation
  3. Generate downloadable report

### 6. Data Sources
- **Twitter**:
  - Tweets mentioning the brand
  - Engagement metrics
  - Sentiment analysis
- **Reddit**:
  - Subreddit posts and comments
  - Community engagement
  - Discussion analysis
- **Google News**:
  - News articles
  - Media coverage
  - Source credibility scoring

## Deployment

This project is configured for deployment on Railway. To deploy:

1. Create a Railway account and install the Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize your project:
```bash
railway init
```

4. Configure the environment variables in your Railway project settings:
   - Add `NEXT_PUBLIC_API_URL`
   - Add `GOOGLE_GENAI_API_KEY`
   - Add `API_KEY`

5. Deploy your application:
```bash
railway up
```

6. Monitor your deployment:
```bash
railway status
```

Additional Railway commands:
- `railway logs` - View deployment logs
- `railway connect` - Connect to your database
- `railway variables` - Manage environment variables
- `railway domain` - Configure custom domains

## Features

- Real-time sentiment analysis
- Interactive data visualization
- PDF report generation
- AI-powered insights and recommendations
- Responsive design
- Multi-platform data aggregation
- Emotion analysis
- Trend tracking
- Engagement scoring
- Customizable analysis periods

## Tech Stack

- **Frontend Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI
- **Animations**: Framer Motion
- **Data Visualization**: Chart.js
- **PDF Generation**: Server-side PDF generation
- **AI Integration**: Google Generative AI
- **API Integration**: Custom backend API

## Performance Considerations

- Caching of analysis results
- Optimized data fetching
- Lazy loading of components
- Responsive image handling
- Efficient PDF generation

## Security Features

- Server-side API key handling
- Secure data transmission
- Input validation
- Rate limiting
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

