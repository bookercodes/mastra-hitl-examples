import { createStep, createWorkflow } from "@mastra/core"
import z from "zod"
import { customerSupportAgent } from "../agents/customer-support-agent"

const generateAnswer = createStep({
  id: "generateAnswer",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
    query: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { text } = await customerSupportAgent.generate(
      `Answer the following customer query: ${inputData.query}`,
      {
        temperature: 1.5,
        topP: 0.9,
      },
    )

    return {
      query: inputData.query,
      answer: text,
    }
  },
})

const askUserForApproval = createStep({
  id: "askUserForApproval",
  inputSchema: z.object({
    answer: z.string(),
    query: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
    query: z.string(),
    approved: z.boolean(),
  }),
  resumeSchema: z.object({
    approved: z.boolean().optional(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    if (!resumeData) {
      return suspend({})
    } 
    return {
      answer: inputData.answer,
      query: inputData.query,
      approved: resumeData.approved,
    }
  },
})
export const generateAnswerWorkflow = createWorkflow({
  id: "generateAnswerWorkflow",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
    query: z.string(),
    approved: z.boolean(),
  }),
})
  .then(generateAnswer)
  .then(askUserForApproval)
  .commit()
