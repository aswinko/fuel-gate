"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Camera,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Define types for OCR results
interface OCRResult {
  text: string;
  confidence: number;
  bbox?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export default function VerifyPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<null | {
    isValid: boolean;
    vehicleDetails: {
      registrationNumber: string;
      make: string;
      model: string;
      year: number;
      color: string;
      fuelType: string;
      owner: string;
    };
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // OCR state
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [ocrWords, setOcrWords] = useState<OCRResult[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [rawOcrText, setRawOcrText] = useState<string>("");



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setExtractedText("");
        setRawOcrText("");
        setVerificationResult(null);
        setOcrWords([]);
        setOcrProgress(0);
        setOcrStatus("");
        setOcrConfidence(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image when it's loaded
  useEffect(() => {
    if (image && imageRef.current) {
      const img = imageRef.current;

      // When image is loaded, get its dimensions
      img.onload = () => {
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    }
  }, [image]);

  // Function to preprocess the image for better OCR results
  const preprocessImage = async () => {
    if (!imageRef.current || !canvasRef.current) return null;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Set canvas dimensions to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply preprocessing (grayscale and increase contrast)
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

      // Increase contrast
      const newValue = avg > 120 ? 255 : 0;

      data[i] = newValue; // R
      data[i + 1] = newValue; // G
      data[i + 2] = newValue; // B
    }

    // Put processed image back on canvas
    ctx.putImageData(imageData, 0, 0);

    // Return processed image as data URL
    return canvas.toDataURL("image/jpeg");
  };

  const extractText = async () => {
    if (!image || !imageFile) {
      setError("No image available. Please upload an image.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setOcrProgress(0);
    setOcrWords([]);
    setOcrStatus("Preprocessing image...");

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setOcrProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // Preprocess the image
      const processedImageUrl = await preprocessImage();
      setOcrStatus("Sending image for analysis...");

      // Create form data to send the image
      const formData = new FormData();

      // If we have a processed image, convert it to a file and send that
      if (processedImageUrl) {
        const response = await fetch(processedImageUrl);
        const blob = await response.blob();
        const processedFile = new File([blob], "processed-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("image", processedFile);
      } else {
        // Otherwise send the original image
        formData.append("image", imageFile);
      }

      // Send the image to our OCR API endpoint
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const data = await response.json();

      // Save the raw OCR text
      setRawOcrText(data.text || "");

      // Update OCR results
      setOcrWords(data.words || []);
      setOcrConfidence(data.confidence || 0);

      // Format the extracted text as a license plate
      const plateText = formatAsLicensePlate(data.text);
      setExtractedText(plateText);

      setOcrStatus("Text extraction complete");
      setOcrProgress(100);
    } catch (err) {
      console.error("OCR Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to extract text from the image. Please try a clearer image."
      );
      setOcrProgress(0);
    } finally {
      setIsExtracting(false);
    }
  };

  // Format extracted text as a license plate
  const formatAsLicensePlate = (text: string): string => {
    if (!text) return "";

    // Remove unwanted characters and normalize spaces
    const cleaned = text
      .replace(/[^A-Z0-9 ]/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    // Try to match Indian license plate format (e.g., MH 01 AB 1234)
    const plateRegex = /([A-Z]{2})\s*(\d{1,2})\s*([A-Z]{1,3})\s*(\d{1,4})/;
    const match = cleaned.match(plateRegex);

    if (match) {
      // Format as standard license plate
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    // If no match, return the cleaned text
    return cleaned;
  };

  const verifyVehicle = async () => {
    if (!extractedText) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Call the vehicle verification API
      const response = await fetch("/api/verify-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: extractedText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify vehicle");
      }

      const data = await response.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Verification Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify vehicle. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resetProcess = () => {
    setImage(null);
    setImageFile(null);
    setExtractedText("");
    setRawOcrText("");
    setVerificationResult(null);
    setError(null);
    setOcrProgress(0);
    setOcrStatus("");
    setOcrWords([]);
    setOcrConfidence(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto container max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Vehicle Verification System
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Upload a number plate image to verify if the vehicle meets the age
            requirement
          </p>

          <Card className="border-0 shadow-lg overflow-hidden py-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6">
              <CardTitle className="text-xl">
                Number Plate Verification
              </CardTitle>
              <CardDescription className="text-purple-100">
                Verify if a vehicle was manufactured after 2015 using AI-powered
                number plate recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Step 1: Upload Image */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mr-3">
                      <span className="text-sm font-bold text-purple-600">
                        1
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">
                      Upload Number Plate Image
                    </h3>
                  </div>

                  {image ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <div className="relative">
                          {/* Hidden canvas for image processing */}
                          <canvas ref={canvasRef} className="hidden" />

                          {/* Visible image */}
                          <img
                            ref={imageRef}
                            src={image || "/placeholder.svg"}
                            alt="Number plate"
                            className="w-full object-cover max-h-[300px]"
                          />

                          {/* Overlay for detected words */}
                          {ocrWords.length > 0 && (
                            <div className="absolute inset-0 pointer-events-none">
                              {ocrWords.map((word, index) => {
                                if (!word.bbox) return null;

                                // Calculate position as percentage of image size
                                const x =
                                  (word.bbox.x0 / imageSize.width) * 100;
                                const y =
                                  (word.bbox.y0 / imageSize.height) * 100;
                                const width =
                                  ((word.bbox.x1 - word.bbox.x0) /
                                    imageSize.width) *
                                  100;
                                const height =
                                  ((word.bbox.y1 - word.bbox.y0) /
                                    imageSize.height) *
                                  100;

                                return (
                                  <div
                                    key={index}
                                    className="absolute border border-indigo-400 rounded-sm flex items-center justify-center text-[8px] text-white"
                                    style={{
                                      left: `${x}%`,
                                      top: `${y}%`,
                                      width: `${width}%`,
                                      height: `${height}%`,
                                      backgroundColor: `rgba(124, 58, 237, ${
                                        word.confidence / 200
                                      })`,
                                      boxShadow:
                                        "0 0 0 1px rgba(255,255,255,0.2)",
                                    }}
                                  >
                                    {word.text}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={resetProcess}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Change
                        </Button>
                      </div>

                      {!extractedText && (
                        <div className="space-y-3">
                          {isExtracting ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-purple-700 font-medium">
                                  {ocrStatus}
                                </span>
                                <span className="text-gray-500">
                                  {Math.round(ocrProgress)}%
                                </span>
                              </div>
                              <Progress
                                value={ocrProgress}
                                className="h-2 bg-gray-200"
                              />
                              <p className="text-xs text-gray-500 italic text-center">
                                AI is analyzing the image to extract the
                                registration number
                              </p>
                            </div>
                          ) : (
                            <Button
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              onClick={extractText}
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Extract Number Plate Text
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-300 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
                            <Upload className="h-8 w-8 text-purple-500" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG or JPEG (max. 5MB)
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          Select Image
                        </Button>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Extracted Text */}
                {extractedText && !verificationResult && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mr-3">
                        <span className="text-sm font-bold text-purple-600">
                          2
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Extracted Registration Number
                      </h3>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Detected Registration Number:
                          </p>
                          <p className="text-xl font-mono font-bold tracking-wider text-purple-700">
                            {extractedText}
                          </p>
                          {rawOcrText && rawOcrText !== extractedText && (
                            <p className="text-xs text-gray-500 mt-1">
                              Raw OCR text:{" "}
                              <span className="font-medium">{rawOcrText}</span>
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                ocrConfidence > 80
                                  ? "bg-green-500"
                                  : ocrConfidence > 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              } mr-1.5`}
                            ></div>
                            <p className="text-xs text-gray-500">
                              Confidence:{" "}
                              <span className="font-medium text-gray-700">
                                {ocrConfidence.toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            onClick={extractText}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Re-scan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            onClick={() => {
                              // Manual edit functionality
                              const newText = prompt(
                                "Edit registration number:",
                                extractedText
                              );
                              if (newText) setExtractedText(newText);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={verifyVehicle}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying Vehicle...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Verify Vehicle Details
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Step 3: Verification Result */}
                {verificationResult && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mr-3">
                        <span className="text-sm font-bold text-purple-600">
                          3
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Verification Result
                      </h3>
                    </div>

                    <Alert
                      className={
                        verificationResult.isValid
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }
                    >
                      <div className="flex items-center">
                        {verificationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <AlertTitle
                          className={
                            verificationResult.isValid
                              ? "text-green-800"
                              : "text-red-800"
                          }
                        >
                          {verificationResult.isValid
                            ? "Vehicle Approved"
                            : "Vehicle Rejected"}
                        </AlertTitle>
                      </div>
                      <AlertDescription
                        className={
                          verificationResult.isValid
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        {verificationResult.isValid
                          ? "This vehicle meets the age requirement (manufactured after 2015)"
                          : "This vehicle does not meet the age requirement (manufactured before 2015)"}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Vehicle Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Registration Number
                          </p>
                          <p className="font-medium">
                            {
                              verificationResult.vehicleDetails
                                .registrationNumber
                            }
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Manufacturing Year
                          </p>
                          <p className="font-medium">
                            {verificationResult.vehicleDetails.year}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Make & Model</p>
                          <p className="font-medium">
                            {verificationResult.vehicleDetails.make}{" "}
                            {verificationResult.vehicleDetails.model}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Color</p>
                          <p className="font-medium">
                            {verificationResult.vehicleDetails.color}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Fuel Type</p>
                          <p className="font-medium">
                            {verificationResult.vehicleDetails.fuelType}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Registered Owner
                          </p>
                          <p className="font-medium">
                            {verificationResult.vehicleDetails.owner}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-4">
              {verificationResult ? (
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={resetProcess}
                  >
                    Verify Another Vehicle
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Download Verification Report
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 w-full text-center">
                  This system uses OCR.space API to extract real text from
                  vehicle registration plates
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
