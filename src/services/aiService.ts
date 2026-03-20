
export const getAiTutorResponse = async (message: string, context: string = "") => {
  try {
    const response = await fetch('/api/aiTutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Tutor failed");
    return data.text || "Oops! I got a bit confused. Can you ask that again?";
  } catch (error) {
    console.error("Tutor API Error:", error);
    return "I'm having a little trouble connecting to my brain right now! Try again in a second.";
  }
};

export const generateLesson = async (topic: string, gradeLevel: number, difficulty: string) => {
  console.log(`🤖 Requesting server to generate lesson about ${topic}...`);
  const response = await fetch('/api/generateLesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, gradeLevel, difficulty })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Lesson generation failed");
  }
  
  return data;
};
