import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";
import { customerSupportAgent } from "../agents/customer-support-agent";
import { queryEvaluatorAgent } from "../agents/query-evaluator-agent";

const categorySchema = z.enum(['GENERAL', 'ORDER INQUIRY']);

const generateAnswer = createStep({
  id: 'generateAnswer',
  inputSchema: z.object({
    query: z.string(),
    category: categorySchema
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
  execute: async ({ inputData }) => {
    const result = await customerSupportAgent.generate([
      {
        role: 'user',
        content: `Answer the following customer query: ${inputData.query}`
      }
    ])

    return {
      answer: result.text
    }
  }
})

const categorizeQuery = createStep({
  id: 'categorizeQuery',
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    query: z.string(),
    category: categorySchema
  }),
  execute: async ({ inputData }) => {

    const result = await queryEvaluatorAgent.generate([
      {
        role: 'user',
        content: `Evaluate the following customer query: ${inputData.query}`
      }
    ], {
      output: z.object({
        category: categorySchema
      })
    })

    return {
      category: result.object.category,
      query: inputData.query
    }
  }
})


const askUserForAnswer = createStep({
  id: 'askUserForAnswer',
  inputSchema: z.object({
    query: z.string(),
    category: categorySchema
  }),
  resumeSchema: z.object({
    answer: z.string()
  }),
  outputSchema: z.object({
    answer: z.string()
  }),
  execute: async ({ suspend, resumeData }) => {
    if (!resumeData) {
      return suspend({})
    }
    return { answer: resumeData.answer }
  }
})

const respond = createStep({
  id: 'respond',
  inputSchema: z.object({
    generateAnswer: z.object({ answer: z.string() }),
    askUserForAnswer: z.object({ answer: z.string() }),
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    const answer = inputData.generateAnswer?.answer || inputData.askUserForAnswer?.answer
    console.log("sending answer", answer)
    return {}
  }
})

export const customerSupportWorkflow = createWorkflow({
  id: 'customerSupportWorkflow',
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string()
  })
})
  .then(categorizeQuery)
  .branch([
    [async ({ inputData: { category } }) => category === 'GENERAL', generateAnswer],
    [async ({ inputData: { category } }) => category === 'ORDER INQUIRY', askUserForAnswer]
  ])
  .then(respond)
  .commit()