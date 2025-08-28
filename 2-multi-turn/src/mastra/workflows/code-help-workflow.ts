import { createWorkflow, createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { questionQualityAssessor } from "../agents/question-quality-assesor"
import { scoringExtractStepResultSchema } from "@mastra/core/scores"

const promptUserForQuestion = createStep({
  id: "promptUserForQuestion",
  inputSchema: z.object({ }),
  resumeSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    query: z.string(),
    goodQuality: z.boolean(),
    explanation: z.string(),
  }),
  execute: async ({ resumeData, suspend }) => {

    if (!resumeData) {
      return suspend({})
    }

    const result = await questionQualityAssessor.generate([
      {
        role: 'user',
        content: resumeData.query,
      }
    ], { 
      output: z.object({
        goodQuality: z.boolean(),
        explanation: z.string()
      })
    })

    return {
      query:  resumeData.query,
      goodQuality: result.object.goodQuality,
      explanation: result.object.explanation
    }
  }
})

const answerQuestion = createStep({
  id: "answerQuestion",
  inputSchema: z.object({
    query: z.string(),
    goodQuality: z.boolean(),
    explanation: z.string(),
  }),
  outputSchema: z.object({}),
  execute: async ({ inputData }) => {
    console.log("The user won 🎉")
    // TODO: something
    return inputData
  },
})

export const codeHelpWorkflow = createWorkflow({
  id: "codeHelpWorkflow",
  inputSchema: z.object({ }),
  outputSchema: z.object({
    answer: z.string()
  }),
})
  .dountil(promptUserForQuestion, async ({ inputData: { goodQuality } }) => goodQuality)
  .then(answerQuestion)
  .commit()