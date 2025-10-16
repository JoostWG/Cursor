import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ApiError } from './api-error';
import type { Definition, ResponseData } from './types';

export class Api {
    private readonly axios: AxiosInstance;

    public constructor() {
        this.axios = axios.create({
            baseURL: 'https://api.urbandictionary.com/v0',
        });
    }

    public async define(term: string): Promise<Definition[]> {
        const data = await this.get<{ list: Definition[] }>('/define', { params: { term } });

        return data.list;
    }

    public async autocomplete(term: string): Promise<string[]> {
        return await this.get<string[]>('/autocomplete', { params: { term } });
    }

    private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.get<ResponseData<T>>(url, config);

        // `data` can be anything
        if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'error' in data) {
            throw new ApiError(typeof data.error === 'number' ? data.error.toString() : data.error);
        }

        return data;
    }
}
