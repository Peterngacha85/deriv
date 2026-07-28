const levels = ['info', 'warn', 'error', 'debug'];

function timestamp() {
  return new Date().toISOString();
}

const logger = {};

levels.forEach((level) => {
  logger[level] = (message) => {
    const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  };
});

module.exports = logger;
