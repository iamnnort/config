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

  private levelMap: Record<number, string> = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL',
  };

  private makeExtraValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  private makeExtraLine(key: string, value: unknown): string {
    const extraValue = this.makeExtraValue(value);

    const extraIndentedValue = extraValue
      .split('\n')
      .map((line) => `      ${line}`)
      .join('\n');

    return `    ${key}:\n${extraIndentedValue}`;
  }

  private makeExtra(data: Record<string, unknown>): string {
    const lines = Object.entries(data).reduce((accLines, [key, value]) => {
      if (this.ignoredKeys.includes(key)) {
        return accLines;
      }

      return [...accLines, this.makeExtraLine(key, value)];
    }, [] as string[]);

    return lines.join('\n');
  }

  private makeLevel(log: any): string {
    return this.levelMap[log.level] || 'INFO';
  }

  private makeName(log: any): string {
    return log.name ? ` (${log.name})` : '';
  }

  private makeTitle(log: any): string {
    return `${this.makeLevel(log)}${this.makeName(log)}: ${log.msg}`;
  }

  makeLogStream() {
    return {
      write: (msg: string) => {
        try {
          const log = JSON.parse(msg);

          const output: string[] = [];

          const title = this.makeTitle(log);

          if (title) {
            output.push(title);
          }

          const extra = this.makeExtra(log);

          if (extra) {
            output.push(extra);
          }

          output.push('');

          process.stdout.write(output.join('\n'));
        } catch {
          process.stdout.write(msg);
        }
      },
    };
  }
}
