import { generateAdvice } from "../adapter/ai-coach.adapter"

export const generateSuggestions = async () => {
    return await generateAdvice({
        temperature: 80,
        humidity: 45,
        duration: 30,
        breaks: 1
    })
}