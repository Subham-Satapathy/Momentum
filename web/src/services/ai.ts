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
      You are a productivity and motivation assistant that helps analyze tasks and assign priorities.
    
      Please analyze the following task and provide:
      - A **suggested priority level**: low, medium, or high
      - **Three detailed productivity tips** (around 30 words each)
      - A brief **reasoning** for your suggestion
      - One **motivational tip or quote** to inspire the user
    
      Focus your tips on:
      - Time management
      - Focus and energy optimization
      - Task organization and planning
      - Momentum and consistency
    
      Examples of detailed tips:
      - "Break the task into three clear subtasks, and allocate separate 30-minute focus blocks on your calendar to work on each without distractions."
      - "Use the Pomodoro Technique—25 minutes of deep work followed by a 5-minute break—to maintain energy and prevent burnout over longer periods."
      - "Visualize the completed outcome before starting. This can provide clarity and motivation to take action even when you're feeling overwhelmed or unmotivated."
    
      Examples of motivational quotes:
      - "Small progress is still progress."
      - "You don’t have to be great to start, but you have to start to be great."
      - "Discipline turns dreams into reality."
    
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