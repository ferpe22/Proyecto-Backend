const winston = require('winston')
const setting = require('../commands/command')
const { create } = require('connect-mongo')
const environment = setting.environment

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'red',
    error: 'yellow',
    warning: 'blue',
    info: 'green',
    http: 'magenta',
    debug: 'cyan'
  }
}

const createLogger = (environment) => {
  const transports = []

  if (environment == 'prod') {
    transports.push(new winston.transports.Console({ level: 'info' }))
    transports.push(new winston.transports.File({ filename: './src/logs/error.log', level: 'error' }))
  } else if (environment === 'dev') {
    transports.push(new winston.transports.Console({ level: 'debug' }))
  }
}

const logger = createLogger(environment)

const addLogger = (req, res, next) => {
  req.logger = logger
  
  req.logger.http(`${req.method} on ${req.url} - ${new Date().toLocaleDateString()}`);

  next()
}

module.exports = addLogger

