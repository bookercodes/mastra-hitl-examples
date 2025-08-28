import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const queryEvaluatorAgent = new Agent({
  name: 'queryEvaluatorAgent',
  instructions: `Your task is to evaluate the nature of the given question related to pens. 
  Determine whether it is a general inquiry that can be answered using model knowledge or an order inquiry that requires human intervention to look up specific information.
  For each question, output the following:

	Category: Indicate 'General Inquiry' or 'Order Inquiry.'`,
  model: openai('gpt-4o-mini')
});