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
import { GoogleGenerativeAI } from "@google/generative-ai";
// Use the API key from environment variables
const GEMINI_API_KEY = 'AIzaSyDKyou8EKGnHo8wzTl1knGXAd_6RMm8g4E';

// Initialize GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


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


// Function to map MBTI types to Darija/Arabic names and image paths
const mbtiToDarija = (type: string): { name: string; imagePath: string } => {
  const mapping: Record<string, { name: string; imagePath: string }> = {
    INTJ: { name: "Khebach", imagePath: "https://i.postimg.cc/nrWXzSDd/khebach.png" },
    INTP: { name: "Calme", imagePath: "https://i.postimg.cc/nrWXzSDd/calm.png" },
    ENTJ: { name: "Leader", imagePath: "https://i.postimg.cc/nrWXzSDd/leader.png" },
    ENTP: { name: "Clubiste", imagePath: "https://i.postimg.cc/nrWXzSDd/clubiste.png" },
    INFJ: { name: "Calme", imagePath: "https://i.postimg.cc/nrWXzSDd/calm.png" },
    INFP: { name: "Artist", imagePath: "https://i.postimg.cc/nrWXzSDd/artist.png" },
    ENFJ: { name: "Leader", imagePath: "https://i.postimg.cc/nrWXzSDd/leader.png" },
    ENFP: { name: "Vivant", imagePath: "https://i.postimg.cc/nrWXzSDd/vivant.png" },
    ISTJ: { name: "Dicipliné", imagePath: "https://i.postimg.cc/nrWXzSDd/dicipline.png" },
    ISFJ: { name: "Sociable", imagePath: "https://i.postimg.cc/nrWXzSDd/social.png" },
    ESTJ: { name: "Leader", imagePath: "https://i.postimg.cc/nrWXzSDd/lader.png" },
    ESFJ: { name: "Sociable", imagePath: "https://i.postimg.cc/nrWXzSDd/social.png" },
    ISTP: { name: "Khebach", imagePath: "https://i.postimg.cc/nrWXzSDd/khebach.png" },
    ISFP: { name: "Artist", imagePath: "https://i.postimg.cc/nrWXzSDd/artist.png" },
    ESTP: { name: "Clubiste", imagePath: "https://i.postimg.cc/nrWXzSDd/clubiste.png" },
    ESFP: { name: "Vivant", imagePath: "https://i.postimg.cc/nrWXzSDd/vivant.png" },
  };

  return mapping[type] || { name: type, imagePath: "/images/default.png" };
};





const cleanText = (response: string): string => {
  try {
    return response
      // Replace escaped newlines with actual newlines
      .replace(/\\n/g, '\n')
      // Remove unnecessary newlines and multiple spaces
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      // Remove leading and trailing whitespace
      .replace(/^\s+|\s+$/g, '')
      // Remove the entire block starting with { "response": { "candidates": [...] }
      .replace(/{\s*"response":\s*{\s*"candidates":\s*\[\s*{\s*"content":\s*{\s*"parts":\s*\[\s*{\s*"text":\s*"/g, '')
      .replace(/"}\s*]\s*}\s*}\s*]\s*}\s*},?/g, '')
      // Remove "role": "model" sections and trailing commas
      .replace(/}\s*],\s*"role":\s*"model"\s*},?/g, '')
      // Remove "finishReason": "STOP", and "index": 0,
      .replace(/"finishReason":\s*"STOP",?/g, '')
      .replace(/"index":\s*\d+,?/g, '')
      // Remove safetyRatings block
      .replace(/"safetyRatings":\s*\[.*?\],/g, '')
      // Remove usageMetadata block
      .replace(/"usageMetadata":\s*{.*?},?/g, '')
      // Remove "}" followed by another "}" or spaces
      .replace(/}\s*}/g, '')
      // Remove any stray asterisks (*)
      .replace(/\*/g, '')
      // Final clean-up for stray spaces or commas
      .replace(/^\s+|\s+$/g, '')
      .trim();
  } catch (error) {
    console.error('Error cleaning text:', error);
    return 'Error extracting text from response.';
  }
};





// Main component
const UpdatedResultsDashboard = () => {
  const [explanations, setExplanations] = useState<string | null>(null);

  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(
    null
  );


  // Add a function to call the Google Gemini API
const callGeminiAPI = async (data: PersonalityData): Promise<{ explanations: string }> => {
  try {
    // Create the prompt for the Gemini
    const prompt = `Based on the following personality data: 
      MBTI Type: ${data.mbti.type}, 
      Big Five Traits: ${data.bigFive.map(trait => `${trait.name}: ${trait.value}%`).join(", ")}, 
      Learning Styles: ${data.learningStyles.map(style => `${style.name}: ${style.value}%`).join(", ")}, 
      Social Learning: ${data.socialLearning}, 
      Independent Learning: ${data.independentLearning}, 
      Neuroticism Score: ${data.neuroticismScore}, 
      Leadership Potential: ${data.leadershipPotential ? "Yes" : "No"}, 
      Collaboration Suitability: ${data.collaborationSuitability ? "Yes" : "No"}. 
      
      Please generate detailed explanations and feedback for this user.`;

    // Make the API request
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const response = await model.generateContent(prompt);
    console.log("Response from API:", JSON.stringify(response, null, 2));
    const explanationApi = JSON.stringify(response, null, 2);

    // Check if the response contains

    if (explanationApi) {
      const cleaned = cleanText(explanationApi);
      console.log("Cleaned explanation:", cleaned); 
      setExplanations( cleaned ); // Update state with the explanation
      return { explanations: explanationApi };
    } else {
      console.error("No candidates found in response:", response);
      setExplanations("No explanation available from the API."); // Set a fallback explanation
      return { explanations: "No explanation available from the API." };
    }
  } catch (error) {
    console.error("Error fetching explanation and feedback from Gemini API:", error);
    return { explanations: "Error fetching explanation and feedback from Gemini API." };
  }
};



const parsePersonalityData = async (rawData: string): Promise<PersonalityData | null> => {
  try {
    // Log raw data for debugging
    console.log('Raw data:', rawData);

    // Extract JSON string from raw data
    const jsonStringMatch = rawData.match(/```json[\s\S]*?```/);

    if (!jsonStringMatch) {
      console.error('JSON string not found in raw data.');
      return null; // Return null if JSON string not found
    }

    let jsonString = jsonStringMatch[0].replace(/```json|```/g, '').trim();
    jsonString = jsonString.replace(/\\n/g, '\n').replace(/\\"/g, '"');

    // Parse JSON string
    const parsedData = JSON.parse(jsonString);

    // Call Gemini API to get explanations and feedback
    const explanations  = await callGeminiAPI(parsedData);

    // Validate that the necessary fields exist in the parsed data
    if (
      parsedData.mbti &&
      parsedData.mbti.type &&
      Array.isArray(parsedData.mbti.dimensions) &&
      parsedData.bigFive &&
      Array.isArray(parsedData.bigFive) &&
      parsedData.learningStyles &&
      Array.isArray(parsedData.learningStyles) &&
      typeof parsedData.socialLearning === 'number' &&
      typeof parsedData.independentLearning === 'number' &&
      typeof parsedData.neuroticismScore === 'number' &&
      typeof parsedData.leadershipPotential === 'boolean' &&
      typeof parsedData.collaborationSuitability === 'boolean'
    ) {
      return {
        ...parsedData,
        explanations,
      }; // Return parsed data if valid
    } else {
      console.error('Parsed data is missing required fields.');
      return null; // Return null if data is invalid
    }
  } catch (error) {
    console.error('Error parsing or validating personality data:', error);
    return null;
  }
};

  useEffect(() => {
    const fetchData = async () => {
      const storedData = localStorage.getItem("personality-storage");
      if (storedData) {
        const parsedPersonalityData = await parsePersonalityData(storedData);
        if (parsedPersonalityData) {
          setPersonalityData(parsedPersonalityData);
        } else {
          alert("Failed to set personality data.");
        }
      } else {
        alert("No data found in localStorage.");
      }
    };
  
    fetchData(); // Call the async function inside useEffect
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
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  9. Explanations
                </h3>
                <Card className="bg-white shadow-md rounded-2xl p-6">
                  <p className="text-gray-700 text-center">
                    <strong>{explanations}</strong>
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
