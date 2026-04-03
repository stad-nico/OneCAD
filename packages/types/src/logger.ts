export class Logger {
  public static debug(...args: Array<unknown>): void {
    console.debug(...args);
  }

  public static info(...args: Array<unknown>): void {
    console.info(...args);
  }

  public static log(...args: Array<unknown>): void {
    console.log(...args);
  }

  public static warn(...args: Array<unknown>): void {
    console.warn(...args);
  }

  public static error(...args: Array<unknown>): void {
    console.error(...args);
  }
}
