/**
 * Log levels for the CLI logger.
 */
export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
  Success
}

/**
 * Simple logger for CLI output with color support.
 */
export class Logger {
  private logLevel: LogLevel = LogLevel.Info;
  
  constructor(logLevel: LogLevel = LogLevel.Info) {
    this.logLevel = logLevel;
  }
  
  /**
   * Sets the minimum log level to display.
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  /**
   * Logs a debug message.
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Debug) {
      this.writeLog('🔍', message, args, '\x1b[90m'); // Gray
    }
  }
  
  /**
   * Logs an info message.
   */
  info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Info) {
      this.writeLog('ℹ️', message, args, '\x1b[36m'); // Cyan
    }
  }
  
  /**
   * Logs a warning message.
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Warning) {
      this.writeLog('⚠️', message, args, '\x1b[33m'); // Yellow
    }
  }
  
  /**
   * Logs an error message.
   */
  error(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Error) {
      this.writeLog('❌', message, args, '\x1b[31m'); // Red
    }
  }
  
  /**
   * Logs a success message.
   */
  success(message: string, ...args: unknown[]): void {
    this.writeLog('✅', message, args, '\x1b[32m'); // Green
  }
  
  /**
   * Writes a formatted log message.
   */
  private writeLog(icon: string, message: string, args: unknown[], color: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;
    
    // Use color if terminal supports it
    const coloredMessage = process.stdout.isTTY 
      ? `${color}${formattedMessage}\x1b[0m`
      : formattedMessage;
    
    console.log(`${icon} [${timestamp}] ${coloredMessage}`);
  }
}