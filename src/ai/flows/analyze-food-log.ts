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

const FoodItemSchema = z.object({
  name: z.string().describe('The name of the food item.'),
  calories: z.number().describe('Estimated calories for this food item.'),
  protein: z.number().describe('Estimated grams of protein for this food item.'),
  carbs: z.number().describe('Estimated grams of carbohydrates for this food item.'),
  fat: z.number().describe('Estimated grams of fat for this food item.'),
});

const AnalyzeFoodLogOutputSchema = z.object({
  foodItems: z.array(FoodItemSchema).describe('A list of food items and their estimated nutritional breakdown.'),
  totalCalories: z.number().describe('Estimated total calories for the day.'),
  totalProtein: z.number().describe('Estimated grams of protein for the day.'),
  totalCarbs: z.number().describe('Estimated grams of carbohydrates for the day.'),
  totalFat: z.number().describe('Estimated grams of fat for the day.'),
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
      foodItems: z.array(FoodItemSchema).describe('A list of food items and their estimated nutritional breakdown.'),
      totalCalories: z.number().describe('Estimated total calories for the day.'),
      totalProtein: z.number().describe('Estimated grams of protein for the day.'),
      totalCarbs: z.number().describe('Estimated grams of carbohydrates for the day.'),
      totalFat: z.number().describe('Estimated grams of fat for the day.'),
    }),
  },
  prompt: `You are a nutritionist analyzing a user's food log to estimate their daily calorie and macronutrient intake.

  Analyze the following food log and estimate the nutritional breakdown of each food item, as well as the total calories, protein, carbs, and fat for the day.

  Food Log: {{{foodLog}}}

  Please provide the results in a JSON format with two main parts: "foodItems" and the totals.

  The "foodItems" should be an array of objects, where each object represents a food item from the log. For each food item, estimate and include the following:

  - "name": The name of the food item.
  - "calories": Estimated total calories for the food item.
  - "protein": Estimated grams of protein in the food item.
  - "carbs": Estimated grams of carbohydrates in the food item.
  - "fat": Estimated grams of fat in the food item.

  In addition to the "foodItems" array, include the following totals for the entire day:

  - "totalCalories": Estimated total calories for the day.
  - "totalProtein": Estimated grams of protein for the day.
  - "totalCarbs": Estimated grams of carbohydrates for the day.
  - "totalFat": Estimated grams of fat for the day.

  Ensure that the calories, protein, carbs, and fat values for both individual food items and totals reflect whole numbers.  Do not give explanations, only the JSON. Do not list the individual foods eaten and their nutrition information.
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
