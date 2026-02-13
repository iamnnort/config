import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpMethods, HttpStatuses } from './types';

export class HttpMessageBuilder {
  private printQueue: string[];

  private request?: AxiosRequestConfig;
  private response?: AxiosResponse;
  private error?: AxiosError;

  private duration?: number;
  private redactedKeys: string[];

  constructor(options: {
    request?: AxiosRequestConfig;
    response?: AxiosResponse;
    error?: AxiosError;
    duration?: number;
    redactedKeys?: string[];
  }) {
    this.printQueue = [];

    this.request = options.request;
    this.response = options.response;
    this.error = options.error;

    this.duration = options.duration;
    this.redactedKeys = [
      'accessToken',
      'refreshToken',
      'apiKey',
      'password',
      'apiSecretKey',
      'apiPublishableKey',
      ...(options.redactedKeys ?? []),
    ];
  }

  private getRequestParam(paramName: string) {
    return this.request?.[paramName] || this.response?.config?.[paramName] || this.error?.response?.config?.[paramName];
  }

  private getResponseParam(paramName: string) {
    return this.response?.[paramName] || this.error?.response?.[paramName];
  }

  private makeDataObjJson(data: any) {
    return this.redactedKeys.reduce((accData, key) => {
      if (!accData[key]) {
        return accData;
      }

      return {
        ...accData,
        [key]: '[redacted]',
      };
    }, data);
  }

  private makeDataObj(data: any) {
    if (!data) {
      return {};
    }

    if (typeof data === 'string') {
      try {
        return {
          json: this.makeDataObjJson(JSON.parse(data)),
        };
      } catch (error) {
        return {
          text: data,
        };
      }
    }

    return {
      json: this.makeDataObjJson(data),
    };
  }

  makeUrlText() {
    const url = this.getRequestParam('url');
    const params = this.getRequestParam('params');
    const paramsSerializer = this.getRequestParam('paramsSerializer');

    if (url) {
      if (params) {
        delete params['0'];
        this.printQueue.push([url, paramsSerializer.serialize(params)].filter((_) => _).join('?'));
      } else {
        this.printQueue.push(url);
      }
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
