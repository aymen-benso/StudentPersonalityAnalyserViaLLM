'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Users, Lightbulb, MessageCircle } from "lucide-react"
import Link from "next/link"

export function PersonalityQuizLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600">CSCC Quiz Student Personality</h1>
            <div className="flex space-x-2">
              <Users className="text-blue-500" />
              <Lightbulb className="text-yellow-500" />
              <BarChart className="text-green-500" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Discover your ideal role in the tech world! Our personality quiz matches your traits and preferences to various computer science specialties. Get insights into your strengths and find your perfect fit in the industry.
          </p>
          <div className="flex justify-center mb-8">
            <Link href="/quiz">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
              Start Your Journey
            </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4 bg-blue-50 rounded-xl">
              <Users className="text-blue-500 mb-2" />
              <h3 className="font-semibold text-blue-700">Personality Insights</h3>
              <p className="text-sm text-gray-600">Understand your tech persona</p>
            </Card>
            <Card className="p-4 bg-yellow-50 rounded-xl">
              <BarChart className="text-yellow-500 mb-2" />
              <h3 className="font-semibold text-yellow-700">Career Statistics</h3>
              <p className="text-sm text-gray-600">See how you align with roles</p>
            </Card>
            <Card className="p-4 bg-green-50 rounded-xl">
              <Lightbulb className="text-green-500 mb-2" />
              <h3 className="font-semibold text-green-700">Learning Paths</h3>
              <p className="text-sm text-gray-600">Get tailored recommendations</p>
            </Card>
          </div>
        </div>
        <div className="bg-blue-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">What others are saying:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Alex", comment: "This quiz helped me realize my passion for AI!" },
              { name: "Sam", comment: "Insightful statistics about different tech roles." },
              { name: "Jordan", comment: "The career advice was spot-on. Highly recommend!" },
              { name: "Taylor", comment: "Fun way to explore CS specialties. Very accurate!" },
            ].map((testimonial, index) => (
              <Card key={index} className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <MessageCircle className="text-blue-500 mr-2" />
                  <span className="font-semibold text-blue-700">{testimonial.name}</span>
                </div>
                <p className="text-gray-600 text-sm">{testimonial.comment}</p>
              </Card>
            ))}
          </div>
        </div>
      </Card>
      <footer className="mt-8 text-center text-gray-500">
        © 2025 CSCC Personality Quiz. Empowering tech careers through self-discovery.
      </footer>
    </div>
  )
}