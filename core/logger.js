import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.prettyPrint(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const baseTransportConfig = {
  maxFiles: 5,
  colorize: false,
  handleExceptions: true,
}

const transports = [
  new winston.transports.Console(),
  new winston.transports.File(
    Object.assign({}, baseTransportConfig, {
      json: true,
      maxsize: 5242880, //5MB,
      level: 'error',
      filename: './logs/error-logs.log',
    })
  ),
  new winston.transports.File(
    Object.assign({}, baseTransportConfig, {
      json: false,
      maxsize: 5242880, //5MB
      level: 'debug',
      filename: './logs/all-logs.log',
    })
  ),
]

const Logger = winston.createLogger({
  exitOnError: false,
  level: level(),
  levels,
  format,
  transports,
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      // format: winston.format.simple(),
      format: winston.format.combine(winston.format.splat(), winston.format.simple()),
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    })
  );
}

console.log = (...args) => logger.info.call(logger, ...args);
console.info = (...args) => logger.info.call(logger, ...args);
console.warn = (...args) => logger.warn.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);
console.debug = (...args) => logger.debug.call(logger, ...args);

export default Logger;
