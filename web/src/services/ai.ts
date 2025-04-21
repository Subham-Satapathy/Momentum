import { Priority } from '../types/todo';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
const taskAnalysisSchema = z.object({
  suggestedPriority: z.enum(['low', 'medium', 'high']).describe("The suggested priority level for the task"),
  tips: z.array(z.string()).describe("List of reasons or tips about the task priority"),
  reasoning: z.string().describe("A brief explanation of why this priority was chosen")
});

export const analyzeTaskWithAI = async (task: {
  content: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
}) => {
  try {

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-1.5-pro",
      temperature: 0.2,
      apiVersion: "v1",
    });

    const parser = StructuredOutputParser.fromZodSchema(taskAnalysisSchema);

    const formatInstructions = parser.getFormatInstructions();
    const prompt = PromptTemplate.fromTemplate(`
      You are a productivity assistant that helps analyze tasks and assign priorities.
      
      Please analyze the following task and provide a suggested priority level (low, medium, or high),
      along with some specific, actionable tips and reasoning for your suggestion.
      
      Make tips short (5-7 words), specific, and actionable. Focus on time management, focus techniques,
      or task management strategies that would be helpful for this specific task.
      
      Examples of good tips:
      - "Break into smaller subtasks"
      - "Schedule focused work blocks"
      - "Set clear completion criteria"
      - "Consider delegating if possible"
      - "Use timeboxing technique"
      
      Task: {content}
      Description: {description}
      Due Date: {dueDate}
      Current Priority: {priority}
      
      Respond with JSON that matches this format:
      {format_instructions}
    `);

    const chain = RunnableSequence.from([
      prompt,
      model,
      parser,
    ]);

    const response = await chain.invoke({
      content: task.content,
      description: task.description || "",
      dueDate: task.dueDate || "No due date specified",
      priority: task.priority || "Not set",
      format_instructions: formatInstructions
    });

    return {
      suggestedPriority: response.suggestedPriority as Priority,
      tips: response.tips,
      reasoning: response.reasoning
    };
  } catch (error) {
    console.error("Error in AI task analysis:", error);
  }
};

export async function analyzePriority(
  taskContent: string,
  taskDescription: string
): Promise<{ priority: Priority; reasoning: string }> {
  const result = await analyzeTaskWithAI({
    content: taskContent,
    description: taskDescription
  });
  
  return { 
    priority: result?.suggestedPriority || 'medium',
    reasoning: result?.reasoning || ''
  };
}