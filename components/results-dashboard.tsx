"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Define interfaces for the personality data
interface Dimension {
  name: string;
  value: number;
}

interface MBTI {
  type: string;
  dimensions: Dimension[];
}

interface BigFiveTrait {
  name: string;
  value: number;
}

interface LearningStyle {
  name: string;
  value: number;
}

interface PersonalityData {
  mbti: MBTI;
  bigFive: BigFiveTrait[];
  learningStyles: LearningStyle[];
  socialLearning: number;
  independentLearning: number;
  neuroticismScore: number;
  leadershipPotential: boolean;
  collaborationSuitability: boolean;

  explanations: string;
  feedback: string;
}

// Function to clean up text
const cleanText = (text: string): string => {
  return text
    .replace(/[*]+/g, "") // Remove asterisks
    .replace(/[\{\}]/g, "") // Remove curly braces
    .replace(/\\n/g, " ") // Replace escaped newlines with spaces
    .replace(/ +/g, " ") // Replace multiple spaces with a single space
    .replace(/","version":0/g, "") // Remove version number from JSON data
    .trim(); // Trim whitespace from both ends
};


// Function to map MBTI types to Darija/Arabic names and image paths
const mbtiToDarija = (type: string): { name: string; imagePath: string } => {
  const mapping: Record<string, { name: string; imagePath: string }> = {
    INTJ: { name: "Khebach", imagePath: "/images/khebach.png" },
    INTP: { name: "Calme", imagePath: "/images/calm.png" },
    ENTJ: { name: "Leader", imagePath: "/images/leader.png" },
    ENTP: { name: "Clubiste", imagePath: "/images/clubiste.png" },
    INFJ: { name: "Calme", imagePath: "/images/calm.png" },
    INFP: { name: "Artist", imagePath: "/images/artist.png" },
    ENFJ: { name: "Leader", imagePath: "/images/leader.png" },
    ENFP: { name: "Vivant", imagePath: "/images/vivant.png" },
    ISTJ: { name: "Dicipliné", imagePath: "/images/disciplined.png" },
    ISFJ: { name: "Sociable", imagePath: "/images/sociable.png" },
    ESTJ: { name: "Leader", imagePath: "/images/leader.png" },
    ESFJ: { name: "Sociable", imagePath: "/images/sociable.png" },
    ISTP: { name: "Khebach", imagePath: "/images/khebach.png" },
    ISFP: { name: "Artist", imagePath: "/images/artist.png" },
    ESTP: { name: "Clubiste", imagePath: "/images/clubiste.png" },
    ESFP: { name: "Vivant", imagePath: "/images/vivant.png" },
  };

  return mapping[type] || { name: type, imagePath: "/images/default.png" };
};


// Function to parse personality data from raw input
const parsePersonalityData = (rawData: string): PersonalityData | null => {
  try {
    const jsonRegex = /```json([\s\S]*?)```/;
    const match = rawData.match(jsonRegex);

    if (!match || match.length < 2) {
      console.error("No valid JSON data found in the input.");
      return null;
    }

    let cleanedData = match[1].trim();
    cleanedData = cleanedData
      .replace(/\\n/g, "") // Remove escaped newlines
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\\//g, "/"); // Unescape forward slashes

    const parsedData = JSON.parse(cleanedData);

    const explanationsRegex = /(\*\*Explanation:\*\*[\s\S]*?)(?=\*\*Important Note:\*\*|$)/;
    const feedbackRegex = /\*\*Important Note:\*\*\s*([\s\S]+)$/;

    const explanationsMatch = rawData.match(explanationsRegex);
    const feedbackMatch = rawData.match(feedbackRegex);

    let explanations = explanationsMatch ? cleanText(explanationsMatch[1]) : "";
    const feedback = feedbackMatch ? cleanText(feedbackMatch[1]) : "";

    return {
      ...parsedData,
      explanations,
      feedback,
    };
  } catch (error) {
    console.error("Error parsing or validating personality data:", error);
    return null;
  }
};

// Main component
const UpdatedResultsDashboard = () => {
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(
    null
  );

  useEffect(() => {
    const storedData = localStorage.getItem("personality-storage");
    if (storedData) {
      const parsedPersonalityData = parsePersonalityData(storedData);
      if (parsedPersonalityData) {
        setPersonalityData(parsedPersonalityData);
      } else {
        alert("Failed to set personality data.");
      }
    } else {
      alert("No data found in localStorage.");
    }
  }, []);

  if (!personalityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="bg-white shadow-lg rounded-3xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
              <CardTitle className="text-4xl font-bold">
                Personality Quiz Results
              </CardTitle>
              <CardDescription className="text-blue-100 text-xl">
                Your personalized insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 text-lg">Loading personality data...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-white shadow-lg rounded-3xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
            <CardTitle className="text-4xl font-bold">
              Personality Quiz Results
            </CardTitle>
            <CardDescription className="text-blue-100 text-xl">
              Your personalized insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">


            {/* MBTI Section */}
            <section className="mb-12">

              <div className="flex items-center justify-center mb-6">
                <div className="bg-white shadow-lg rounded-lg p-4">
                  <img
                    src={mbtiToDarija(personalityData.mbti.type).imagePath}
                    alt="MBTI Type"
                    className="w-48 h-48 rounded-lg mx-auto mb-4"
                  />
                  <p className="text-center text-lg font-semibold text-gray-800">
                    {mbtiToDarija(personalityData.mbti.type).name}
                  </p>
                </div>
              </div>
              
              <Card className="bg-white shadow-md rounded-2xl p-6">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  Student Type: {mbtiToDarija(personalityData.mbti.type).name}
                </h3>
                <ChartContainer
                  className="h-[150px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
                  config={{}}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={personalityData.mbti.dimensions}
                    >
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: "#4B5563" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#4B5563" }} />
                      <Radar name="MBTI" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <p className="mt-4 text-gray-700">
                  The Analysis indicates a strong preference for{" "}
                  {mbtiToDarija(personalityData.mbti.type).name}.
                </p>
              </Card>
            </section>

            {/* Big Five Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                2. Big Five Personality Traits
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={personalityData.bigFive}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#4B5563" />
                    <YAxis stroke="#4B5563" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="mt-4 text-gray-700">
                  Here’s how you score in the Big Five personality traits:
                  <ul className="list-disc pl-5">
                    {personalityData.bigFive.map((trait, index) => (
                      <li key={index}>
                        {trait.name}: {trait.value}%
                      </li>
                    ))}
                  </ul>
                </p>
              </Card>
            </section>

            {/* Learning Styles Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                
              3. Learning Styles
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={personalityData.learningStyles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {personalityData.learningStyles.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </section>

            {/* Social Learning Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                
              4. Social Learning
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              You scored {personalityData.socialLearning} out of 100 in social
                  learning.
                </p>
              </Card>
            </section>
              
              {/* Independent Learning Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                5. Independent Learning
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              You scored {personalityData.independentLearning} out of 100 in independent
                  learning.
                </p>
              </Card>
            </section>

            {/* Neuroticism Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                6. Neuroticism Score
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              Your neuroticism score is {personalityData.neuroticismScore}.
                </p>
              </Card>
            </section>
              
              {/* Leadership Potential Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                7. Leadership Potential
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              You have {personalityData.leadershipPotential ? "high" : "low"} leadership potential.
                </p>
              </Card>
            </section>
              
              {/* Collaboration Suitability Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                8. Collaboration Suitability
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              You are {personalityData.collaborationSuitability ? "suitable" : "not suitable"} for collaboration.
                </p>
              </Card>
            </section>
              
              {/* Explanations Section */}
            <section className="mb-12">
                      
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                9. Explanations
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
              <p className="text-gray-700 text-center">
              {personalityData.explanations}
                </p>
              </Card>
            </section>
              
              {/* Feedback Section */}
            <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">                10. Feedback
              </h3>
              <Card className="bg-white shadow-md rounded-2xl p-6">
                <p className="text-gray-700 text-center">
                  {personalityData.feedback}
                </p>
              </Card>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatedResultsDashboard;
