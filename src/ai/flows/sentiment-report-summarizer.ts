// The directive tells the Next.js runtime that this code should only be executed on the server side.
'use server';

/**
 * @fileOverview A sentiment report summarization AI agent.
 *
 * - summarizeSentimentReport - A function that handles the sentiment report summarization process.
 * - SentimentReportSummarizerInput - The input type for the summarizeSentimentReport function.
 * - SentimentReportSummarizerOutput - The return type for the summarizeSentimentReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SentimentReportSummarizerInputSchema = z.object({
  sentimentScore: z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    percentage: z.number()
  }).describe('The overall sentiment score and percentage of the brand.'),
  totalMentions: z.number().describe('The total number of mentions analyzed.'),
  topEmotion: z.string().describe('The dominant emotion expressed in the mentions.'),
  positiveKeywords: z.array(z.string()).describe('Keywords associated with positive sentiment.'),
  negativeKeywords: z.array(z.string()).describe('Keywords associated with negative sentiment.'),
  emotionDistribution: z.record(z.number()).optional().describe('Distribution of emotions across mentions.'),
  platformComparison: z.array(z.object({
    platform: z.string(),
    positive: z.number(),
    negative: z.number(),
    neutral: z.number()
  })).optional().describe('Sentiment distribution across different platforms.'),
  sentimentTrend: z.array(z.object({
    date: z.string(),
    positive: z.number(),
    negative: z.number(),
    neutral: z.number()
  })).optional().describe('Sentiment trend over time.')
});

export type SentimentReportSummarizerInput = z.infer<typeof SentimentReportSummarizerInputSchema>;

const SentimentReportSummarizerOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the sentiment analysis report.'),
  keyInsights: z.array(z.string()).describe('Key insights and observations from the analysis.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations based on the analysis.')
});

export type SentimentReportSummarizerOutput = z.infer<typeof SentimentReportSummarizerOutputSchema>;

export async function summarizeSentimentReport(input: SentimentReportSummarizerInput): Promise<SentimentReportSummarizerOutput> {
  console.log('Server action called with input:', JSON.stringify(input, null, 2));
  try {
    const result = await sentimentReportSummarizerFlow.run(input);
    console.log('Server action result:', JSON.stringify(result, null, 2));
    return (result as unknown) as SentimentReportSummarizerOutput;
  } catch (error) {
    console.error('Server action error:', error);
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'sentimentReportSummarizerPrompt',
  input: {
    schema: SentimentReportSummarizerInputSchema,
  },
  output: {
    schema: SentimentReportSummarizerOutputSchema,
  },
  prompt: `You are an expert marketing analyst tasked with providing comprehensive sentiment analysis reports.

  Based on the following data, generate a detailed analysis:

  Overall Sentiment:
  - Sentiment: {{{sentimentScore.sentiment}}}
  - Percentage: {{{sentimentScore.percentage}}}%
  - Total Mentions: {{{totalMentions}}}
  - Top Emotion: {{{topEmotion}}}

  {{#if emotionDistribution}}
  Emotion Distribution:
  {{#each emotionDistribution}}
  - {{{@key}}}: {{{this}}}%
  {{/each}}
  {{/if}}

  {{#if platformComparison}}
  Platform Comparison:
  {{#each platformComparison}}
  - {{{platform}}}:
    * Positive: {{{positive}}}
    * Negative: {{{negative}}}
    * Neutral: {{{neutral}}}
  {{/each}}
  {{/if}}

  {{#if sentimentTrend}}
  Recent Sentiment Trend:
  {{#each sentimentTrend}}
  - {{{date}}}: Positive({{{positive}}}), Negative({{{negative}}}), Neutral({{{neutral}}})
  {{/each}}
  {{/if}}

  Keywords:
  - Positive: {{#each positiveKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Negative: {{#each negativeKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Please provide:
  1. A comprehensive summary of the brand's perception
  2. Key insights about sentiment patterns and trends
  3. Actionable recommendations for brand management

  Focus on:
  - Overall brand perception
  - Emotional resonance
  - Platform-specific insights
  - Recent trends and changes
  - Key topics and concerns
  - Opportunities for improvement
  `,
});

const sentimentReportSummarizerFlow = ai.defineFlow<
  typeof SentimentReportSummarizerInputSchema,
  typeof SentimentReportSummarizerOutputSchema
>({
  name: 'sentimentReportSummarizerFlow',
  inputSchema: SentimentReportSummarizerInputSchema,
  outputSchema: SentimentReportSummarizerOutputSchema,
}, async input => {
  console.log('Flow started with input:', JSON.stringify(input, null, 2));
  try {
    const result = await (prompt as any)(input);
    console.log('Raw AI response:', JSON.stringify(result, null, 2));
    
    // The AI response is already in the correct format
    if (result && typeof result === 'object' && 'summary' in result && 'keyInsights' in result && 'recommendations' in result) {
      console.log('Using direct AI response:', result);
      return {
        summary: result.summary || '',
        keyInsights: Array.isArray(result.keyInsights) ? result.keyInsights : [],
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
      };
    }

    // If the response is in the custom format, extract it
    const textContent = result.custom?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Text content:', textContent);
    
    if (!textContent) {
      console.error('No text content found in response:', result);
      throw new Error('No text content found in AI response');
    }

    // Parse the response text into JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(textContent);
      console.log('Parsed result:', JSON.stringify(parsedResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // If parsing fails, try to extract the content directly
      const lines = textContent.split('\n');
      const summary = lines.find((line: string) => line.startsWith('Summary:'))?.replace('Summary:', '').trim() || '';
      const keyInsights = lines
        .filter((line: string) => line.startsWith('- '))
        .map((line: string) => line.replace('- ', '').trim());
      const recommendations = lines
        .filter((line: string) => line.startsWith('* '))
        .map((line: string) => line.replace('* ', '').trim());

      return {
        summary,
        keyInsights,
        recommendations
      };
    }
    
    // Validate the parsed result
    if (!parsedResult || typeof parsedResult !== 'object') {
      console.error('Invalid parsed result:', parsedResult);
      throw new Error('Invalid response format from AI');
    }

    // Extract the fields from the parsed result
    const summary = parsedResult.summary || '';
    const keyInsights = Array.isArray(parsedResult.keyInsights) ? parsedResult.keyInsights : [];
    const recommendations = Array.isArray(parsedResult.recommendations) ? parsedResult.recommendations : [];

    // Log the extracted fields
    console.log('Extracted fields:', {
      summary,
      keyInsights,
      recommendations
    });

    // Return the formatted result
    const formattedResult = {
      summary,
      keyInsights,
      recommendations
    };

    console.log('Returning formatted result:', JSON.stringify(formattedResult, null, 2));
    return formattedResult;
  } catch (error) {
    console.error('Error in sentiment report summarizer:', error);
    throw error;
  }
});
