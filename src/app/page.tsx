"use client";

import {useState} from "react";
import {analyzeFoodLog} from "@/ai/flows/analyze-food-log";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";

type FoodItem = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AnalysisResult = {
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export default function Home() {
  const [foodLog, setFoodLog] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeFoodLog({foodLog});
      setAnalysisResult(result);
      setAnalysisHistory([result, ...analysisHistory.slice(0, 2)]); // Keep only the last 3 analyses
      toast({
        title: "Analysis Complete",
        description: "Your food log has been analyzed.",
      });
    } catch (error: any) {
      console.error("Error analyzing food log:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to analyze food log.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-secondary">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        <span className="inline-flex items-center">
          NutriJournal <Icons.workflow className="w-6 h-6 ml-2"/>
        </span>
      </h1>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Food Log</CardTitle>
          <CardDescription>Enter the foods you&apos;ve consumed today:</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="text"
            placeholder="e.g., 1 apple, 1 cup oatmeal, grilled chicken salad"
            value={foodLog}
            onChange={(e) => setFoodLog(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <>
                Analyzing...
                <Icons.spinner className="ml-2 h-4 w-4 animate-spin"/>
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Estimated nutritional breakdown:</CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult.foodItems.map((item, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Calories</TableHead>
                      <TableHead>Protein (🍗 g)</TableHead>
                      <TableHead>Carbs (🌾 g)</TableHead>
                      <TableHead>Fat (🥑 g)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{item.calories}</TableCell>
                      <TableCell>{item.protein}</TableCell>
                      <TableCell>{item.carbs}</TableCell>
                      <TableCell>{item.fat}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Totals:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Calories</TableHead>
                    <TableHead>Protein (🍗 g)</TableHead>
                    <TableHead>Carbs (🌾 g)</TableHead>
                    <TableHead>Fat (🥑 g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{analysisResult.totalCalories}</TableCell>
                    <TableCell>{analysisResult.totalProtein}</TableCell>
                    <TableCell>{analysisResult.totalCarbs}</TableCell>
                    <TableCell>{analysisResult.totalFat}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisHistory.length > 0 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>Your last few analyses:</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein (🍗 g)</TableHead>
                  <TableHead>Carbs (🌾 g)</TableHead>
                  <TableHead>Fat (🥑 g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisHistory.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.totalCalories}</TableCell>
                    <TableCell>{result.totalProtein}</TableCell>
                    <TableCell>{result.totalCarbs}</TableCell>
                    <TableCell>{result.totalFat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
