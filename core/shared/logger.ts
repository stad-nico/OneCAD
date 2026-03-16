export class Logger {
  public static log(...messages: Array<unknown>) {
    console.log(...messages);
  }

  public static error(...messages: Array<unknown>) {
    console.error(...messages);
  }

  public static warn(...messages: Array<unknown>) {
    console.warn(...messages);
  }

  public static info(...messages: Array<unknown>) {
    console.info(...messages);
  }

  public static debug(...messages: Array<unknown>) {
    console.debug(...messages);
  }
}
