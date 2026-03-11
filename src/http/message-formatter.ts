export class HttpMessageFormatter {
  private ignoredKeys: string[] = [
    'level',
    'msg',
    'name',
    'time',
    'pid',
    'hostname',
    'req',
    'res',
    'responseTime',
    'reqId',
  ];

  private levelMap: Record<number, { label: string; log: (...data: any[]) => void }> = {
    10: {
      label: 'TRACE',
      log: console.trace,
    },
    20: {
      label: 'DEBUG',
      log: console.debug,
    },
    30: {
      label: 'INFO',
      log: console.info,
    },
    40: {
      label: 'WARN',
      log: console.warn,
    },
    50: {
      label: 'ERROR',
      log: console.error,
    },
    60: {
      label: 'FATAL',
      log: console.error,
    },
  };

  private makeLevelLabel(log: any): string {
    return this.levelMap[log.level]?.label || 'INFO';
  }

  private makeLevelLog(log: any): (...data: any[]) => void {
    return this.levelMap[log.level]?.log || console.info;
  }

  private makeName(log: any): string {
    return log.name || '';
  }

  private makeMessage(log: any): string {
    return log.msg || '';
  }

  private makeMessageTitle(log: any): string {
    const name = this.makeName(log);

    if (name) {
      return `${this.makeLevelLabel(log)} (${this.makeName(log)}): ${this.makeMessage(log)}`;
    }

    return `${this.makeLevelLabel(log)}: ${this.makeMessage(log)}`;
  }

  private makeMessageExtraValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  private makeMessageExtraLine(key: string, value: unknown): string {
    const extraValue = this.makeMessageExtraValue(value);

    const extraIndentedValue = extraValue
      .split('\n')
      .map((line) => `      ${line}`)
      .join('\n');

    return `    ${key}:\n${extraIndentedValue}`;
  }

  private makeMessageExtra(data: Record<string, unknown>): string {
    const extraLines = Object.entries(data).reduce((accLines, [key, value]) => {
      if (this.ignoredKeys.includes(key)) {
        return accLines;
      }

      return [...accLines, this.makeMessageExtraLine(key, value)];
    }, [] as string[]);

    return extraLines.join('\n');
  }

  private makeDataExtra(data: Record<string, unknown>): Record<string, unknown> {
    const extra = Object.entries(data).reduce(
      (accExtra, [key, value]) => {
        if (this.ignoredKeys.includes(key)) {
          return accExtra;
        }

        return { ...accExtra, [key]: value };
      },
      {} as Record<string, unknown>,
    );

    return extra;
  }

  private makeData(log: any): any {
    const data = {
      level: this.makeLevelLabel(log),
      name: this.makeName(log),
      message: this.makeMessage(log),
      ...this.makeDataExtra(log),
    };

    return data;
  }

  makeLogStream() {
    if (process.env.NODE_ENV === 'production') {
      return this.makeDataLogStream();
    }

    return this.makeMessageLogStream();
  }

  makeMessageLogStream() {
    return {
      write: (msg: string) => {
        try {
          const log = JSON.parse(msg);

          const output: string[] = [];

          const title = this.makeMessageTitle(log);

          if (title) {
            output.push(title);
          }

          const extra = this.makeMessageExtra(log);

          if (extra) {
            output.push(extra);
          }

          const message = output.join('\n');

          const levelLog = this.makeLevelLog(log);

          levelLog(message);
        } catch {
          console.error(msg);
        }
      },
    };
  }

  makeDataLogStream() {
    return {
      write: (msg: string) => {
        try {
          const log = JSON.parse(msg);

          const data = this.makeData(log);

          const levelLog = this.makeLevelLog(log);

          levelLog(JSON.stringify(data, null, 2));
        } catch {
          console.error(msg);
        }
      },
    };
  }
}
