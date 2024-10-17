'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import useStore, { StoreState } from '@/store/store';

// Define the full set of questions
const questions = [
  // Myers-Briggs
  { id: 1, question: "On a scale of 1 to 5, how much do you enjoy participating in group discussions?", type: "scale", min: 1, max: 5 },
  { id: 2, question: "Do you feel energized after spending time with large groups of people?", type: "yesno" },
  { id: 3, question: "Do you prefer working alone rather than in teams?", type: "yesno" },
  { id: 4, question: "On a scale of 1 to 5, how much do you focus on facts and details when learning?", type: "scale", min: 1, max: 5 },
  { id: 5, question: "Do you enjoy working on theoretical or abstract problems more than practical ones?", type: "yesno" },
  { id: 6, question: "How often do you look for patterns or deeper meaning in what you're learning?", type: "multiple-choice", options: ['Never', 'Sometimes', 'Often'] },
  
  // Big Five Personality Traits
  { id: 7, question: "On a scale of 1 to 5, how much do you enjoy learning new ideas or exploring different perspectives?", type: "scale", min: 1, max: 5 },
  { id: 8, question: "Do you prefer sticking to traditional methods rather than experimenting with new ways?", type: "yesno" },
  { id: 9, question: "How likely are you to try something unfamiliar in your studies or work?", type: "multiple-choice", options: ['Unlikely', 'Neutral', 'Likely'] },
  { id: 10, question: "On a scale of 1 to 5, how organized and structured are you in managing your tasks?", type: "scale", min: 1, max: 5 },
  { id: 11, question: "Do you often plan ahead and set goals for yourself?", type: "yesno" },
  { id: 12, question: "How often do you procrastinate on tasks or assignments?", type: "multiple-choice", options: ['Often', 'Sometimes', 'Never'] },

  // Learning Styles and Other Traits
  { id: 13, question: "On a scale of 1 to 5, how much do you enjoy learning by doing, such as through hands-on activities or projects?", type: "scale", min: 1, max: 5 },
  { id: 14, question: "Do you prefer to think through problems before trying to solve them?", type: "yesno" },
  { id: 15, question: "Do you prefer to try out new learning material immediately rather than reflecting on it first?", type: "yesno" },
  { id: 16, question: "On a scale of 1 to 5, how often do you take the lead in group projects?", type: "scale", min: 1, max: 5 },
  { id: 17, question: "Do you enjoy being the one to direct and guide others in class activities?", type: "yesno" },
  { id: 18, question: "On a scale of 1 to 5, how often do you ask questions during class?", type: "scale", min: 1, max: 5 },
  { id: 19, question: "Do you enjoy self-paced learning, where you have control over how and when you study?", type: "yesno" },
  { id: 20, question: "On a scale of 1 to 5, how much do you enjoy learning in group settings?", type: "scale", min: 1, max: 5 },
];

type Answer = number | string | null; // Assuming answers can be scale (number) or yes/no (string)

export function SoftUiQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: Answer }>({});  
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  
  // Get the function to set the personality report from the store
  const setPersonalityReport = useStore((state: StoreState) => state.setPersonalityReport);
  
  const handleAnswer = (value: Answer) => {
    setAnswers({ ...answers, [currentQuestion]: value });
};

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmissionMessage(null);
    
    try {
      const response = await fetch('https://quiz.dzearilife.com/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: answers }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Personality Report:", result.report); 
        setPersonalityReport(result.report);  // Save report to Zustand store
        console.log("Store Data:", useStore.getState());
        setSubmissionMessage("Your responses have been submitted successfully!");
        window.location.href = '/result.html';
      } else {
        console.error("Error in submission:", response.statusText);
        setSubmissionMessage("There was an error submitting your responses. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmissionMessage("Submission failed. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-700">{question.question}</Label>
            <Slider
              min={question.min ?? 0}
              max={question.max ?? 10}
              step={1}
              value={[typeof answers[currentQuestion] === 'number' ? answers[currentQuestion] : question.min ?? 0]}
              onValueChange={(value) => handleAnswer(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.min === 1 ? "Not at all" : "Low"}</span>
              <span>{question.max === 5 ? "A lot" : "High"}</span>
            </div>
          </div>
        );

      case 'yesno':
        return (
          <div className="space-y-6">
            <Label className="text-lg font-medium text-gray-700">{question.question}</Label>
            <RadioGroup
              onValueChange={handleAnswer}
              value={typeof answers[currentQuestion] === 'string' ? answers[currentQuestion] : undefined}
              className="flex flex-col space-y-3"
            >
              {['yes', 'no'].map((value) => (
                <div key={value} className="flex items-center">
                  <RadioGroupItem value={value} id={value} className="peer sr-only" />
                  <Label
                    htmlFor={value}
                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-2 ring-transparent transition-all hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-6">
            <Label className="text-lg font-medium text-gray-700">{question.question}</Label>
            <RadioGroup
              onValueChange={handleAnswer}
              value={typeof answers[currentQuestion] === 'string' ? answers[currentQuestion] : undefined}
              className="flex flex-col space-y-3"
            >
              {question.options && question.options.map((option) => (
                <div key={option} className="flex items-center">
                  <RadioGroupItem value={option} id={option} className="peer sr-only" />
                  <Label
                    htmlFor={option}
                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-2 ring-transparent transition-all hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return <div>Unknown question type.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
        <CardHeader className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-t-2xl p-6">
          <CardTitle className="text-3xl font-bold">Personality Quiz</CardTitle>
          <CardDescription className="text-blue-100 text-lg">
            Question {currentQuestion + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {renderQuestion()}
          {submissionMessage && <p className="mt-4 text-green-600">{submissionMessage}</p>}
        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-gray-50 rounded-b-2xl">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-white text-blue-600 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out"
          >
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_8px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
              className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_8px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out ${answers[currentQuestion] === undefined ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
