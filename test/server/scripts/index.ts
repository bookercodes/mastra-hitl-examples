import 'dotenv/config';
import { mastra } from '../src/mastra/index';

(async () => {
  const workflow = mastra.getWorkflow('generateTweetWorkflow');

  const run = await workflow.createRunAsync()
  const res = await run.start({ 
    inputData: {
      topic: "The weather in New York is sunny"
    }
  })

  console.log('executionGraph', run.getState().executionGraph)
  console.log('res', res)
  // console.log('getState', run.getState())
  // const y= run.stream()
  // console.log("res.status", res.status)
  // console.log("res.steps", res.steps['plan-activities'].payload.condition)
})()