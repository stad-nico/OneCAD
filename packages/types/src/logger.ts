export class Logger {
  // Check for window to detect main thread, but also self for Web Workers
  private static isBrowser =
    typeof window !== "undefined" ||
    (typeof self !== "undefined" && typeof process === "undefined");

  private static format(
    level: string,
    bgColor: string,
    fgColor: string,
    cssBg: string,
    cssFg: string,
    args: Array<unknown>,
  ): Array<unknown> {
    if (this.isBrowser) {
      return [
        `%c ${level} %c %c`,
        `background: ${cssBg}; color: black; font-weight: bold; padding: 2px 4px; border-radius: 3px;`,
        "",
        `color: ${cssFg};`,
        ...args,
      ];
    } else {
      return [
        `\x1b[30;${bgColor}m ${level} \x1b[0m`,
        `\x1b[${fgColor}m`,
        ...args,
        "\x1b[0m",
      ];
    }
  }

  public static debug(...args: Array<unknown>): void {
    console.debug(
      ...this.format("DEBUG", "46", "36", "#0dcaf0", "#0dcaf0", args),
    );
  }

  public static info(...args: Array<unknown>): void {
    console.info(
      ...this.format("INFO ", "42", "32", "#198754", "#198754", args),
    );
  }

  public static log(...args: Array<unknown>): void {
    console.log(
      ...this.format(" LOG ", "44", "34", "#0d6efd", "#0d6efd", args),
    );
  }

  public static warn(...args: Array<unknown>): void {
    console.warn(
      ...this.format("WARN ", "43", "33", "#ffc107", "#ffc107", args),
    );
  }

  public static error(...args: Array<unknown>): void {
    console.error(
      ...this.format("ERROR", "41", "31", "#dc3545", "#dc3545", args),
    );
  }
}
