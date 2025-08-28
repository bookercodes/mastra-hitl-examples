import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";
import { customerSupportAgent } from "../agents/customer-support-agent";

const generateAnswer = createStep({
  id: 'generateAnswer',
  inputSchema: z.object({
    query: z.string()
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

const askUserForApproval = createStep({
  id: 'askUserForAnswer',
  inputSchema: z.object({
    answer: z.string()
  }),
  resumeSchema: z.object({
    approved: z.boolean().optional()
  }),
  outputSchema: z.object({
    answer: z.string()
  }),
  execute: async ({ inputData, resumeData, suspend, bail }) => {
    if  (!resumeData) {
      return suspend({})
    }

     if (!resumeData.approved) { 
      return bail({
        reason: 'not approved'
      })
     }

    return { answer: inputData.answer }
  }
})


const respond = createStep({
  id: 'respond',
  inputSchema: z.object({
     answer: z.string()
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    console.log("sending answer", inputData.answer)
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
.then(generateAnswer)
.then(askUserForApproval)
.then(respond)
.commit()