# ts + axios 的封装

## 封装请求类

```ts
// axios/types.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
export interface RequestInterceptors {
	// 请求拦截
	requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig;
	requestInterceptorsCatch?: (err: unknown) => unknown;
	// 响应拦截
	responseInterceptors?: <T = AxiosResponse>(res: T) => T;
	responseInterceptorsCatch?: (err: unknown) => unknown;
}

export interface RequestConfig extends AxiosRequestConfig {
	interceptors?: RequestInterceptors;
}

export interface Response<T> {
	code: '000000' | '000001';
	data: T;
	message: string;
}
```

```ts
// axios/index.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { RequestInterceptors, RequestConfig, Response } from './types';

class Request {
	// axios 实例
	instance: AxiosInstance;
	// 拦截器对象
	interceptorsObj?: RequestInterceptors;

	constructor(config: RequestConfig) {
		this.instance = axios.create(config);
		this.interceptorsObj = config.interceptors;
		// 执行顺序：实例请求 -> 类请求 -> 实例响应 -> 类相应
		// 请求拦截时，执行顺序和注册顺序相反(unshift)；响应拦截的时候，执行顺序和注册顺序相同(push)

		// 类请求拦截器
		this.instance.interceptors.request.use(
			res => res,
			err => err
		);

		// 实例请求拦截器（实例化时传进来的拦截器规则）
		this.instance.interceptors.request.use(
			this.interceptorsObj?.requestInterceptors,
			this.interceptorsObj?.requestInterceptorsCatch
		);

		// 实例响应拦截器
		this.instance.interceptors.response.use(
			this.interceptorsObj?.responseInterceptors,
			this.interceptorsObj?.responseInterceptorsCatch
		);

		// 类相应拦截器
		this.instance.interceptors.response.use(
			res => res.data, // 将请求结果中得 .data 返回
			err => err
		);
	}

	// axios 最终都会执行 request 方法
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	request<T>(config: RequestConfig): Promise<Response<T>> {
		return new Promise((resolve, reject) => {
			if (config.interceptors?.requestInterceptors) {
				config = config.interceptors.requestInterceptors(config);
			}
			this.instance.request<any, Response<T>>(config).then(
				res => {
					if (config.interceptors?.responseInterceptors) {
						res = config.interceptors.responseInterceptors(res);
					}
					resolve(res);
				},
				err => {
					reject(err);
				}
			);
		});
	}
}

export default Request;
```

## 实例化请求类

```ts
// http/index.ts
import Request from '@/api/axios/index';
import { RequestConfig, Response } from '@/api/axios/types';

const request = new Request({
	baseURL: '',
	timeout: 1000 * 60 * 5,
	interceptors: {
		requestInterceptors: config => config,
		responseInterceptors: res => res,
	},
});

interface requestConfigPrimary<T> extends RequestConfig {
	data?: T;
}

export const requestPrimary = <T, R>(
	config: requestConfigPrimary<T>
): Promise<Response<R>> => {
	const { method = 'GET' } = config;
	if (method === 'get' || method === 'GET') {
		config.params = config.data;
	}
	return request.request<R>(config);
};
```
