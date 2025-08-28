import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const questionQualityAssessor = new Agent({
  name: 'questionQualityAssessor',
  instructions: `does this question contain code, expected output, and actual output. respond yes or no and return a one-line explaination of what to improve if the anwer is no (be friendly) `,
  model: openai('gpt-4o')
});