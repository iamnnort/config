import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpMethods, HttpStatuses } from './types';

export class HttpMessageBuilder {
  private printQueue: string[];

  private request?: AxiosRequestConfig;
  private response?: AxiosResponse;
  private error?: AxiosError;

  private duration?: number;

  constructor(options: {
    request?: AxiosRequestConfig;
    response?: AxiosResponse;
    error?: AxiosError;
    duration?: number;
  }) {
    this.printQueue = [];

    this.request = options.request;
    this.response = options.response;
    this.error = options.error;

    this.duration = options.duration;
  }

  private getRequestParam(paramName: string) {
    return this.request?.[paramName] || this.response?.config?.[paramName] || this.error?.response?.config?.[paramName];
  }

  private getResponseParam(paramName: string) {
    return this.response?.[paramName] || this.error?.response?.[paramName];
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

  makeRequestDataText() {
    const data = this.getRequestParam('data');

    if (data) {
      if (typeof data === 'string') {
        this.printQueue.push(data);

        return this;
      }

      if (Object.keys(data).length) {
        this.printQueue.push(JSON.stringify(data));

        return this;
      }
    }

    return this;
  }

  makeResponseDataText() {
    const data = this.getResponseParam('data');

    if (data) {
      if (typeof data === 'string') {
        this.printQueue.push(data);

        return this;
      }

      if (Object.keys(data).length) {
        this.printQueue.push(JSON.stringify(data));

        return this;
      }
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
