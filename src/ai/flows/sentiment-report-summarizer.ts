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
  sentimentScore: z.number().describe('The overall sentiment score of the brand.'),
  totalMentions: z.number().describe('The total number of mentions analyzed.'),
  topEmotion: z.string().describe('The dominant emotion expressed in the mentions.'),
  positiveKeywords: z.array(z.string()).describe('Keywords associated with positive sentiment.'),
  negativeKeywords: z.array(z.string()).describe('Keywords associated with negative sentiment.'),
});
export type SentimentReportSummarizerInput = z.infer<typeof SentimentReportSummarizerInputSchema>;

const SentimentReportSummarizerOutputSchema = z.object({
  summary: z.string().describe('A one-paragraph summary of the sentiment analysis report.'),
});
export type SentimentReportSummarizerOutput = z.infer<typeof SentimentReportSummarizerOutputSchema>;

export async function summarizeSentimentReport(input: SentimentReportSummarizerInput): Promise<SentimentReportSummarizerOutput> {
  return sentimentReportSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentReportSummarizerPrompt',
  input: {
    schema: z.object({
      sentimentScore: z.number().describe('The overall sentiment score of the brand.'),
      totalMentions: z.number().describe('The total number of mentions analyzed.'),
      topEmotion: z.string().describe('The dominant emotion expressed in the mentions.'),
      positiveKeywords: z.array(z.string()).describe('Keywords associated with positive sentiment.'),
      negativeKeywords: z.array(z.string()).describe('Keywords associated with negative sentiment.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A one-paragraph summary of the sentiment analysis report.'),
    }),
  },
  prompt: `You are an expert marketing analyst tasked with summarizing sentiment analysis reports.

  Based on the following data, generate a concise, one-paragraph summary of the brand's perception:

  Sentiment Score: {{{sentimentScore}}}
  Total Mentions: {{{totalMentions}}}
  Top Emotion: {{{topEmotion}}}
  Positive Keywords: {{#each positiveKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Negative Keywords: {{#each negativeKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
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
  const {output} = await prompt(input);
  return output!;
});
