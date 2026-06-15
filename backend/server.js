const app = require('./src/app');
const env = require('./src/config/env');

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

module.exports = server;
