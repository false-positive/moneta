"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useRouter } from "next/navigation";

// Sample quiz data - you can replace this with your own questions and options
const questions = [
  {
    id: 1,
    question: "What is your favorite programming language?",
    options: ["JavaScript", "Python", "Java", "C#", "Other"],
  },
  {
    id: 2,
    question: "How many years of programming experience do you have?",
    options: ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
  },
  {
    id: 3,
    question: "What type of applications do you build most often?",
    options: ["Web", "Mobile", "Desktop", "Backend/API", "Data Science", "Other"],
  },
]

export default function QuizPage() {
  const router = useRouter()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const currentAnswer = answers[currentQuestion.id] || ""

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={() => {
            router.push("/chat")
          }}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="flex-1 flex flex-col m-0 rounded-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <CardDescription className="text-lg">What will Iva do?</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
            {currentQuestion.options.map((option) => (
              <div
                key={option}
                className={`
                  p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${
                  currentAnswer === option
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }
                `}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{option}</span>
                  {currentAnswer === option && <Check className="h-5 w-5 text-primary" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 sm:p-6">
          <Button variant="outline" onClick={goToPreviousQuestion} disabled={isFirstQuestion} className="px-4 py-2">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <span
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex ? "bg-primary" : index in answers ? "bg-muted-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <Button onClick={() => alert("Quiz completed! Answers: " + JSON.stringify(answers))} className="px-4 py-2">
              Submit
            </Button>
          ) : (
            <Button onClick={goToNextQuestion} className="px-4 py-2">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

