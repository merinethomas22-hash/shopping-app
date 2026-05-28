const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Add CloudWatch Logging if AWS keys are present
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'mock_access_key') {
  logger.add(new CloudWatchTransport({
    logGroupName: process.env.CLOUDFRONT_LOG_GROUP || 'babypro-app-logs',
    logStreamName: `${process.env.NODE_ENV || 'development'}-stream`,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    messageFormatter: ({ level, message, additionalInfo }) => {
      return JSON.stringify({ level, message, additionalInfo, timestamp: new Date().toISOString() });
    }
  }));
}

module.exports = logger;
