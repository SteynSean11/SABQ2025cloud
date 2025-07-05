"use client";
import React, { useState, useRef } from 'react';

export function AiAssistantSection() {
  const [advice, setAdvice] = useState('');
  const [recipe, setRecipe] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);

  const budgetingQuestionRef = useRef<HTMLTextAreaElement>(null);
  const recipeInputRef = useRef<HTMLTextAreaElement>(null);

  const callGeminiAPI = async (prompt: string, setLoading: (loading: boolean) => void, setData: (data: string) => void) => {
    setData('');
    setLoading(true);

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = ""; // This will be handled by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setData(text);
      } else {
        setData('Sorry, I could not generate a response. Please try again.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setData('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAdvice = () => {
    const question = budgetingQuestionRef.current?.value.trim();
    if (question) {
      const prompt = `Provide practical budgeting advice for a South African context based on this question: "${question}"`;
      callGeminiAPI(prompt, setAdviceLoading, setAdvice);
    } else {
      setAdvice('Please enter a question.');
    }
  };

  const handleGenerateRecipe = () => {
    const recipePrompt = recipeInputRef.current?.value.trim();
    if (recipePrompt) {
      const prompt = `Suggest a budget-friendly recipe idea for a South African family based on: "${recipePrompt}". Include ingredients and simple steps.`;
      callGeminiAPI(prompt, setRecipeLoading, setRecipe);
    } else {
      setRecipe('Please list some ingredients or a budget.');
    }
  };

  return (
    <section id="ai-assistant" className="mb-16 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-sabq-emerald mb-6 border-b-2 border-sabq-primary-teal pb-2">8. Royal AI Assistant ✨</h2>
      <p className="mb-6 text-gray-700">Leverage the power of AI to get personalized budgeting advice and creative recipe ideas, tailored to your needs. Our Royal AI Assistant is here to empower your financial journey.</p>

      {/* Royal Budgeting Advisor */}
      <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-bold text-sabq-emerald mb-4">Royal Budgeting Advisor ✨</h3>
        <p className="mb-4 text-gray-600">Ask any question about budgeting, saving, or managing finances in a South African context.</p>
        <textarea ref={budgetingQuestionRef} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sabq-primary-teal" rows={4} placeholder="e.g., How can I save money on groceries in South Africa?"></textarea>
        <button onClick={handleGetAdvice} className="mt-4 bg-sabq-emerald text-sabq-gold px-6 py-2 rounded-full font-bold hover:bg-sabq-dark-teal transition shadow-lg">
          Get Royal Advice ✨
        </button>
        {adviceLoading && <div className="mt-4 text-gray-500">Generating advice...</div>}
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 text-gray-700 min-h-[80px] overflow-auto">{advice}</div>
      </div>

      {/* Budget-Friendly Recipe Idea */}
      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-bold text-sabq-emerald mb-4">Budget-Friendly Recipe Idea ✨</h3>
        <p className="mb-4 text-gray-600">Tell me what ingredients you have, or your budget, and I&apos;ll suggest a recipe idea.</p>
        <textarea ref={recipeInputRef} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sabq-primary-teal" rows={4} placeholder="e.g., Chicken, rice, R50 budget"></textarea>
        <button onClick={handleGenerateRecipe} className="mt-4 bg-sabq-emerald text-sabq-gold px-6 py-2 rounded-full font-bold hover:bg-sabq-dark-teal transition shadow-lg">
          Generate Recipe Idea ✨
        </button>
        {recipeLoading && <div className="mt-4 text-gray-500">Generating recipe...</div>}
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 text-gray-700 min-h-[80px] overflow-auto">{recipe}</div>
      </div>
    </section>
  );
}