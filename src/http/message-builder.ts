import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpMethods, HttpStatuses } from './types';

const REDACTED = '[redacted]';
const COMPRESSED = '[compressed]';

export const DEFAULT_REDACTED_KEYS = [
  'accessToken',
  'refreshToken',
  'apiKey',
  'password',
  'secretKey',
  'clientSecret',
  'privateKey',
  'apiSecretKey',
  'apiPublishableKey',
  'botTgToken',
  'botMaxToken',
  'providerToken',
];

export type HttpDataObj = Record<string, unknown> | unknown[] | string;

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

export class HttpMessageBuilder {
  private printQueue: string[];

  private request?: AxiosRequestConfig;
  private response?: AxiosResponse;
  private error?: AxiosError;

  private duration?: number;
  private redactedKeys: Set<string>;
  private redactedValues: string[];

  constructor(options: {
    request?: AxiosRequestConfig;
    response?: AxiosResponse;
    error?: AxiosError;
    duration?: number;
    redactedKeys?: string[];
    redactedValues?: (string | null | undefined)[];
  }) {
    this.printQueue = [];

    this.request = options.request;
    this.response = options.response;
    this.error = options.error;

    this.duration = options.duration;

    this.redactedKeys = new Set(
      [...DEFAULT_REDACTED_KEYS, ...(options.redactedKeys ?? [])].map(normalizeKey).filter(Boolean),
    );

    const redactedValues = (options.redactedValues ?? [])
      .filter((value): value is string => !!value)
      .flatMap((value) => [value, encodeURIComponent(value)]);

    this.redactedValues = [...new Set(redactedValues)].sort((a, b) => b.length - a.length);
  }

  private getRequestParam(paramName: string) {
    return this.request?.[paramName] || this.response?.config?.[paramName] || this.error?.response?.config?.[paramName];
  }

  private getResponseParam(paramName: string) {
    return this.response?.[paramName] || this.error?.response?.[paramName];
  }

  private isRedactedKey(key: string) {
    return key.split(/\[|\]|%5B|%5D/i).some((part) => this.redactedKeys.has(normalizeKey(part)));
  }

  private redactText(text: string) {
    return this.redactedValues.reduce((result, value) => result.split(value).join(REDACTED), text);
  }

  private redactQuery(query: string) {
    return query
      .split('&')
      .map((pair) => {
        const [key] = pair.split('=');

        return pair.includes('=') && this.isRedactedKey(key) ? `${key}=${REDACTED}` : pair;
      })
      .join('&');
  }

  private redactData(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.redactData(item));
    }

    if (typeof data === 'string') {
      try {
        return /^[[{]/.test(data) && JSON.parse(data) ? COMPRESSED : this.redactText(data);
      } catch {
        return this.redactText(data);
      }
    }

    if (Object.prototype.toString.call(data) === '[object Object]') {
      return Object.fromEntries(
        Object.entries(data as object).map(([key, value]) => [
          key,
          this.isRedactedKey(key) ? REDACTED : this.redactData(value),
        ]),
      );
    }

    return data;
  }

  private makeDataObj(data: unknown): HttpDataObj {
    if (!data) {
      return {};
    }

    if (typeof data === 'string') {
      try {
        return this.makeDataObj(JSON.parse(data));
      } catch {
        return this.redactText(data.includes('=') && !/\s/.test(data) ? this.redactQuery(data) : data);
      }
    }

    if (typeof data !== 'object') {
      return {};
    }

    return this.redactData(Array.isArray(data) ? data : { ...data }) as HttpDataObj;
  }

  makeUrlText() {
    const url = this.getRequestParam('url');
    const params = this.getRequestParam('params');
    const paramsSerializer = this.getRequestParam('paramsSerializer');

    if (url) {
      if (params) {
        delete params['0'];
      }

      const [path, ...urlQuery] = url.split('?');
      const query = [urlQuery.join('?'), params && paramsSerializer.serialize(params)].filter(Boolean).join('&');

      this.printQueue.push(this.redactText(query ? `${path}?${this.redactQuery(query)}` : path));
    }

    return this;
  }

  makeMethodText() {
    const method = this.getRequestParam('method');

    if (method) {
      this.printQueue.push(method.toUpperCase());
    }

    return this;
  }

  makeStatusText() {
    const status = this.getResponseParam('status');

    if (status) {
      this.printQueue.push(status);

      const statusText = this.getResponseParam('statusText');

      if (statusText) {
        this.printQueue.push(statusText);
      }
    }

    return this;
  }

  makeDurationText() {
    if (this.duration) {
      this.printQueue.push(`(${this.duration}ms)`);
    }

    return this;
  }

  build() {
    return this.printQueue.join(' ');
  }

  makeRequestDataObj() {
    const data = this.getRequestParam('data');

    return this.makeDataObj(data);
  }

  makeResponseDataObj() {
    const data = this.getResponseParam('data');

    return this.makeDataObj(data);
  }

  makeMethod() {
    const method = this.getRequestParam('method');

    if (!method) {
      return HttpMethods.GET;
    }

    return method.toLowerCase() as HttpMethods;
  }

  makeResponseData() {
    const data = this.getResponseParam('data');

    if (!data) {
      return '';
    }

    if (typeof data === 'string') {
      return data;
    }

    return JSON.stringify(data);
  }

  makeStatus() {
    const status = this.getResponseParam('status');

    if (!status) {
      return HttpStatuses.INTERNAL_SERVER_ERROR;
    }

    return status as HttpStatuses;
  }

  makeResponse<T>() {
    return {
      success: this.error === undefined,
      status: this.makeStatus(),
      method: this.makeMethod(),
      data: this.makeResponseData() as T,
    };
  }
}
