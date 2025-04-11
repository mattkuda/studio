'use server';
/**
 * @fileOverview Analyzes a food log to estimate calorie and macronutrient breakdown.
 *
 * - analyzeFoodLog - A function that handles the food log analysis process.
 * - AnalyzeFoodLogInput - The input type for the analyzeFoodLog function.
 * - AnalyzeFoodLogOutput - The return type for the analyzeFoodLog function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeFoodLogInputSchema = z.object({
  foodLog: z.string().describe('The user-provided food log as a text string.'),
});
export type AnalyzeFoodLogInput = z.infer<typeof AnalyzeFoodLogInputSchema>;

const AnalyzeFoodLogOutputSchema = z.object({
  calories: z.number().describe('Estimated total calories for the day.'),
  protein: z.number().describe('Estimated grams of protein.'),
  carbs: z.number().describe('Estimated grams of carbohydrates.'),
  fat: z.number().describe('Estimated grams of fat.'),
});
export type AnalyzeFoodLogOutput = z.infer<typeof AnalyzeFoodLogOutputSchema>;

export async function analyzeFoodLog(input: AnalyzeFoodLogInput): Promise<AnalyzeFoodLogOutput> {
  return analyzeFoodLogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodLogPrompt',
  input: {
    schema: z.object({
      foodLog: z.string().describe('The user-provided food log as a text string.'),
    }),
  },
  output: {
    schema: z.object({
      calories: z.number().describe('Estimated total calories for the day.'),
      protein: z.number().describe('Estimated grams of protein.'),
      carbs: z.number().describe('Estimated grams of carbohydrates.'),
      fat: z.number().describe('Estimated grams of fat.'),
    }),
  },
  prompt: `You are a nutritionist analyzing a user's food log to estimate their daily calorie and macronutrient intake.

  Analyze the following food log and estimate the total calories, protein, carbs, and fat.

  Food Log: {{{foodLog}}}

  Please provide the results in a JSON format.  Ensure that the calories, protein, carbs, and fat reflect whole numbers.  Do not give explanations, only the JSON. Do not list the individual foods eaten and their nutrition information.
  `,
});

const analyzeFoodLogFlow = ai.defineFlow<
  typeof AnalyzeFoodLogInputSchema,
  typeof AnalyzeFoodLogOutputSchema
>({
  name: 'analyzeFoodLogFlow',
  inputSchema: AnalyzeFoodLogInputSchema,
  outputSchema: AnalyzeFoodLogOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
