import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const COLORS = {
  ERROR: chalk.red,
  WARN: chalk.yellow,
  INFO: chalk.blue,
  DEBUG: chalk.gray
};

export class Logger {
  constructor(level = 'INFO', logToFile = false, logFilePath = './logs/app.log') {
    this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    this.logToFile = logToFile;
    this.logFilePath = logFilePath;

    if (this.logToFile) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  error(message, ...args) {
    if (this.level >= LOG_LEVELS.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message);
      console.error(COLORS.ERROR(formattedMessage), ...args);
      if (this.logToFile) {
        this.writeToFile('ERROR', message, ...args);
      }
    }
  }

  warn(message, ...args) {
    if (this.level >= LOG_LEVELS.WARN) {
      const formattedMessage = this.formatMessage('WARN', message);
      console.warn(COLORS.WARN(formattedMessage), ...args);
      if (this.logToFile) {
        this.writeToFile('WARN', message, ...args);
      }
    }
  }

  info(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      const formattedMessage = this.formatMessage('INFO', message);
      console.info(COLORS.INFO(formattedMessage), ...args);
      if (this.logToFile) {
        this.writeToFile('INFO', message, ...args);
      }
    }
  }

  debug(message, ...args) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message);
      console.debug(COLORS.DEBUG(formattedMessage), ...args);
      if (this.logToFile) {
        this.writeToFile('DEBUG', message, ...args);
      }
    }
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  writeToFile(level, message, ...args) {
    const logEntry = this.formatMessage(level, message) + ' ' + args.join(' ') + '\n';
    fs.appendFileSync(this.logFilePath, logEntry);
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  }
}

export const logger = new Logger();

export function logBotActivity(activity, sender, group = null) {
  const timestamp = new Date().toLocaleString('id-ID');
  const activityLog = `
[${timestamp}]
Activity: ${activity}
Sender: ${sender}
Group: ${group || 'Private'}
Powered by Astralune Bot
----------------------------------------`;

  logger.info(activityLog);

  if (logger.logToFile) {
    const logDir = path.dirname(logger.logFilePath);
    const activityLogPath = path.join(logDir, 'activity.log');
    fs.appendFileSync(activityLogPath, activityLog + '\n');
  }
}

export function logIncomingMessage(message, sender, isGroup = false) {
  const timestamp = new Date().toLocaleString('id-ID');
  const messageLog = `
[${timestamp}]
Name: ${message.pushName || 'Unknown'}
Number: ${sender}
Group: ${isGroup ? 'Yes' : 'No'}
Private: ${!isGroup ? 'Yes' : 'No'}
Text: ${message.message?.conversation || '[Media Message]'}
Size: ${JSON.stringify(message).length} bytes
Feature used: ${getMessageCommand(message) || 'N/A'}
----------------------------------------`;

  logger.info(messageLog);

  if (logger.logToFile) {
    const logDir = path.dirname(logger.logFilePath);
    const messageLogPath = path.join(logDir, 'messages.log');
    fs.appendFileSync(messageLogPath, messageLog + '\n');
  }
}

function getMessageCommand(message) {
  if (!message.message?.conversation) return null;

  const text = message.message.conversation.trim();
  const prefixes = ['.', ','];
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const args = text.slice(prefix.length).trim().split(/ +/);
      return args.shift()?.toLowerCase() || null;
    }
  }

  return null;
}