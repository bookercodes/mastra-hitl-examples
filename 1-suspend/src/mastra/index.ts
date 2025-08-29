
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { customerSupportWorkflow } from './workflows/customer-support-workflow';

export const mastra = new Mastra({
  workflows: { customerSupportWorkflow },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
    // url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
