import { createStep, createWorkflow } from "@mastra/core"
import z from "zod"
import { generateAnswerWorkflow } from "./generate-answer-workflow"

const respond = createStep({
  id: "respond",
  inputSchema: z.object({
    answer: z.string(),
    query: z.string(),
    approved: z.boolean(),
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    console.log("sending answer", inputData.answer)
    return {}
  },
})

export const customerSupportWorkflow = createWorkflow({
  id: "customerSupportWorkflow",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
})
  .dountil(generateAnswerWorkflow, async ({ inputData }) => inputData.approved)
  .then(respond)
  .commit()
