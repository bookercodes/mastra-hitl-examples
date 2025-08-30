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
  }),
  execute: async ({ inputData }) => {
    const result = await customerSupportAgent.generate(`Answer the following customer query: ${inputData.query}`)

    return {
      answer: result.text,
    }
  },
})

const askUserForApproval = createStep({
  id: "askUserForAnswer",
  inputSchema: z.object({
    answer: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean().optional(),
  }),
  execute: async ({ bail, inputData, resumeData, suspend }) => {
    // if no resumeData, step is executing from the beginning (not being resumed)!
    if (!resumeData) {
      // pause workflow and ask for resumeSchema
      return suspend({})
    }

    // else the step is resuming execution
    if (!resumeData.approved) {
      // exit workflow with an error (do not run next step)
      // throw new Error("not approved")

      // end workflow execution without an err
       return bail({})
    }

    return { answer: inputData.answer }
  },
})

const respond = createStep({
  id: "respond",
  inputSchema: z.object({
    answer: z.string(),
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    console.log("pretending to respond with answer", inputData.answer)
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
  .then(generateAnswer)
  .then(askUserForApproval)
  .then(respond)
  .commit()