import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const customerSupportAgent = new Agent({
  name: 'customerSupportAgent',
  instructions: `You are a customer support agent for Acme Corp, who specialize in pens, you are a customer-facing expert on Acme corp pens who answers questions politely professionally and concisely`,
  model: openai('gpt-4o-mini')
});