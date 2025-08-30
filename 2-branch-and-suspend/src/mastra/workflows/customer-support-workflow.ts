import { createStep, createWorkflow } from "@mastra/core"
import z from "zod"
import { customerSupportAgent } from "../agents/customer-support-agent"
import { queryEvaluatorAgent } from "../agents/query-evaluator-agent"

const categorySchema = z.enum(["GENERAL", "ORDER INQUIRY"])

const generateAnswer = createStep({
  id: "generateAnswer",
  inputSchema: z.object({
    query: z.string(),
    category: categorySchema,
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { text } = 
      await customerSupportAgent.generate(`Answer the following customer query: ${inputData.query}`)

    return {
      answer: text,
    }
  },
})

const categorizeQuery = createStep({
  id: "categorizeQuery",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    query: z.string(),
    category: categorySchema,
  }),
  execute: async ({ inputData }) => {
    const result = await queryEvaluatorAgent.generate(
      `Evaluate the following customer query: ${inputData.query}`,
      {
        // define expected output format
        output: z.object({
          category: categorySchema,
        }),
      },
    )

    return {
      query: inputData.query,
      category: result.object.category,
    }
  },
})

const askUserForAnswer = createStep({
  id: "askUserForAnswer",
  inputSchema: z.object({
    query: z.string(),
    category: categorySchema,
  }),
  resumeSchema: z.object({
    answer: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
  execute: async ({ suspend, resumeData }) => {
    if (!resumeData) {
      // execute function returns/finishes running
      return suspend({})
    }
    return { answer: resumeData.answer }
  },
})

const respond = createStep({
  id: "respond",
  inputSchema: z.object({
    generateAnswer: z.object({ answer: z.string() }),
    askUserForAnswer: z.object({ answer: z.string() }),
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    const answer =
      inputData.generateAnswer?.answer || inputData.askUserForAnswer?.answer
    console.log("pretending to respond with", answer)
    return {}
  },
})

export const customerSupportWorkflow = createWorkflow({
  id: "customerSupportWorkflow",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({ }),
})
  .then(categorizeQuery)
  .branch([
    // only one runs
    [ async ({ inputData: { category } }) => category === "GENERAL", generateAnswer ],
    [ async ({ inputData: { category } }) => category === "ORDER INQUIRY", askUserForAnswer ],
  ])
  // ^ either branch returns a message, so respond can process their outputSchema
  .then(respond)
  .commit()
