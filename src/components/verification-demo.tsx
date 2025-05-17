"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, FileText, ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function VerificationDemo() {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showPlateOutline, setShowPlateOutline] = useState(false)
  const [showCharacters, setShowCharacters] = useState(false)
  const [plateText, setPlateText] = useState("MH 01 AB 1234")
  const [showResult, setShowResult] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")

  const nextStep = () => {
    if (step < 3) {
      setIsProcessing(true)
      setProgress(0)

      // Reset states
      setShowPlateOutline(false)
      setShowCharacters(false)
      setShowResult(false)

      // Simulate processing with realistic OCR status messages
      const statusMessages =
        step === 1
          ? [
              "Initializing OCR engine...",
              "Preprocessing image...",
              "Analyzing image...",
              "Detecting plate region...",
              "Enhancing plate region...",
              "Extracting characters...",
            ]
          : [
              "Connecting to database...",
              "Searching registration records...",
              "Retrieving vehicle details...",
              "Verifying manufacturing date...",
              "Generating verification report...",
            ]

      let messageIndex = 0
      setProcessingStatus(statusMessages[0])

      // Simulate processing with status updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 5 + 2 // Random increment between 2-7%
          const newProgress = prev + increment

          // Update status message at certain progress points
          if (
            newProgress > (messageIndex + 1) * (100 / statusMessages.length) &&
            messageIndex < statusMessages.length - 1
          ) {
            messageIndex++
            setProcessingStatus(statusMessages[messageIndex])
          }

          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 150)

      // Simulate completion
      setTimeout(() => {
        setIsProcessing(false)
        setStep(step + 1)

        if (step === 1) {
          // After step 1, show plate detection
          setTimeout(() => setShowPlateOutline(true), 300)
          setTimeout(() => setShowCharacters(true), 1000)
        } else if (step === 2) {
          // After step 2, show verification result
          setTimeout(() => setShowResult(true), 500)
        }
      }, 4000)
    } else {
      // Reset to first step
      setStep(1)
      setShowPlateOutline(false)
      setShowCharacters(false)
      setShowResult(false)
    }
  }

  // Generate a random plate number when the component mounts
  useEffect(() => {
    const states = ["MH", "DL", "KA", "TN", "GJ", "UP"]
    const randomState = states[Math.floor(Math.random() * states.length)]
    const randomNumber = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")
    const randomLetters =
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const randomDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    setPlateText(`${randomState} ${randomNumber} ${randomLetters} ${randomDigits}`)
  }, [])

  return (
    <Card className="border-0 shadow-xl mx-auto container overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              initial={{ width: "33.33%" }}
              animate={{ width: `${step * 33.33}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="pt-6 px-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Verification Process</h3>
              <div className="text-sm text-gray-500">Step {step} of 3</div>
            </div>

            <div className="relative h-[300px]">
              {/* Step 1: Upload Image */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 1, x: 0 }}
                animate={{
                  opacity: step === 1 ? 1 : 0,
                  x: step === 1 ? 0 : -20,
                  zIndex: step === 1 ? 10 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-medium">Upload Number Plate Image</h4>
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    Take a clear photo of the vehicle's number plate or upload an existing image
                  </p>
                  <div className="relative">
                    <img
                      src="/placeholder.svg?height=100&width=250"
                      alt="Number plate example"
                      className="rounded-lg border border-gray-200 h-[60px] object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Extract Text */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: step === 2 ? 1 : 0,
                  x: step === 2 ? 0 : step < 2 ? 20 : -20,
                  zIndex: step === 2 ? 10 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-medium">AI Extracts Registration Number</h4>
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    Our AI technology automatically reads and extracts the registration number from the image
                  </p>

                  <div className="relative w-[250px] h-[100px] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src="/placeholder.svg?height=100&width=250"
                      alt="Number plate"
                      className="w-full h-full object-cover"
                    />

                    {/* Plate detection outline */}
                    {showPlateOutline && (
                      <motion.div
                        className="absolute inset-[15%] border-2 border-purple-500 rounded-sm"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Character detection */}
                    {showCharacters && (
                      <div className="absolute inset-0">
                        {plateText.split("").map((char, index) => {
                          if (char === " ") return null

                          // Calculate position based on index
                          const totalChars = plateText.replace(/ /g, "").length
                          const width = 80 / totalChars
                          const spacing = 10 / (totalChars - 1)
                          const charIndex = plateText.substring(0, index).replace(/ /g, "").length
                          const left = 10 + charIndex * (width + spacing)

                          return (
                            <motion.div
                              key={index}
                              className="absolute border border-indigo-400 bg-purple-500/20 flex items-center justify-center text-[10px] text-white font-bold"
                              style={{
                                left: `${left}%`,
                                top: "40%",
                                width: `${width}%`,
                                height: "20%",
                              }}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: charIndex * 0.1 }}
                            >
                              {char}
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {showCharacters && (
                    <motion.div
                      className="bg-purple-50 rounded-lg px-4 py-2 border border-purple-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <p className="font-mono font-bold tracking-wider text-purple-700">{plateText}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Step 3: Verification Result */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: step === 3 ? 1 : 0,
                  x: step === 3 ? 0 : 20,
                  zIndex: step === 3 ? 10 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium">Instant Verification Result</h4>
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    The system verifies if the vehicle meets the age requirement (manufactured after 2015)
                  </p>

                  {showResult ? (
                    <motion.div
                      className="space-y-3 w-full max-w-[250px]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-green-50 rounded-lg px-4 py-3 border border-green-100 flex items-center">
                        <svg
                          className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-medium text-green-800">Vehicle Approved (2018 Model)</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Registration</p>
                            <p className="font-medium">{plateText}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Make & Model</p>
                            <p className="font-medium">Honda City</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Year</p>
                            <p className="font-medium">2018</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Fuel Type</p>
                            <p className="font-medium">Petrol</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full max-w-[250px] flex flex-col items-center">
                      <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                      <p className="text-sm text-gray-500 mt-2">Retrieving vehicle details...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            {isProcessing ? (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700 font-medium">{processingStatus}</span>
                  <span className="text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-200" />
              </div>
            ) : (
              <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 ml-auto">
                {step === 3 ? "Restart Demo" : "Next Step"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
