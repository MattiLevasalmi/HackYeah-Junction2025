import { GoogleGenAI } from "@google/genai";

interface SaunaRecommendation {

}

const ai = new GoogleGenAI({});

export const generateAdvice = async (recommendation: SaunaRecommendation) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: 
            "You are a friendly and knowledgeable sauna coach. " +
            "You will receive a sauna recommendation consisting of temperature, humidity, duration, and frequency of breaks. " +
            "Based on this information, respond with exactly 5 short, standalone sentences. " +
            "Each sentence should: " +
            "Give practical advice or tips to improve the sauna experience based on the provided values. " +
            "Explain why the recommendation parameters (temperature, humidity, duration, breaks) are beneficial. " +
            "Be concise, helpful, and encouraging. " +
            "Not reference the list format—just produce 5 separate sentences. " +
            "Return the sentences strictly as a valid JSON array of 5 strings in this format: " +
            "['sentence 1', 'sentence 2', 'sentence 3', 'sentence 4', 'sentence 5'] " +
            "Do not include any additional text outside the JSON array. " +
            "Recommendation: " + recommendation
        }
    );
    return (response.text ? JSON.parse(response.text) : null);
}