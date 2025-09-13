import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`🚀 http://localhost:${env.PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
