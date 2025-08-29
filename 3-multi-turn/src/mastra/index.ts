
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { customerSupportWorkflow } from './workflows/customer-support-workflow';
import { generateAnswerWorkflow } from './workflows/generate-answer-workflow';

export const mastra = new Mastra({
  workflows: { customerSupportWorkflow, generateAnswerWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
