import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body to get the image data
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert the file to a base64 string for the OCR API
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")

    // Prepare the request to OCR.space API
    const ocrApiFormData = new FormData()
    ocrApiFormData.append("base64Image", `data:image/jpeg;base64,${base64Image}`)
    ocrApiFormData.append("language", "eng")
    ocrApiFormData.append("isOverlayRequired", "true")
    ocrApiFormData.append("filetype", "jpg")
    ocrApiFormData.append("detectOrientation", "true")
    ocrApiFormData.append("OCREngine", "2") // More accurate OCR engine

    // Call the OCR.space API
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: "K81945170788957", // Free API key for OCR.space
      },
      body: ocrApiFormData,
    })

    const ocrData = await ocrResponse.json()

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      return NextResponse.json({ error: "Failed to extract text from image" }, { status: 500 })
    }

    // Extract the text and word-level data
    const extractedText = ocrData.ParsedResults[0].ParsedText
    const confidence =
      ocrData.ParsedResults[0].TextOverlay?.Lines?.length > 0
        ? ocrData.ParsedResults[0].TextOverlay.Lines[0].Words[0].WordsConfidence * 100
        : 70

    // Extract word boxes for visualization
    type WordBox = {
      text: string
      confidence: number
      bbox: {
        x0: number
        y0: number
        x1: number
        y1: number
      }
    }
    const words: WordBox[] = []
    if (ocrData.ParsedResults[0].TextOverlay && ocrData.ParsedResults[0].TextOverlay.Lines) {
      ocrData.ParsedResults[0].TextOverlay.Lines.forEach((line: any) => {
        if (line.Words) {
          line.Words.forEach((word: any) => {
            words.push({
              text: word.WordText,
              confidence: word.WordsConfidence * 100,
              bbox: {
                x0: word.Left,
                y0: word.Top,
                x1: word.Left + word.Width,
                y1: word.Top + word.Height,
              },
            })
          })
        }
      })
    }

    // Return the OCR results
    return NextResponse.json({
      text: extractedText,
      confidence: confidence,
      words: words,
    })
  } catch (error) {
    console.error("OCR Error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
