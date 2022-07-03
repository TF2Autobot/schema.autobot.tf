import { createClient, RedisClientType } from 'redis';
import log from './lib/logger';

export default class Redis {
    private static client: RedisClientType;

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = createClient({
                url: process.env.REDIS_URL,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD
            });

            this.client
                .connect()
                .then(() => {
                    log.info('Connected to Redis!');
                    this.initEventListeners();
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    private static initEventListeners(): void {
        this.client.on('error', err => {
            // just to prevent crashing
            if (err) {
                log.error(err);
            }
        });
    }

    static setCache(key: string, value: string): void {
        this.client.SET(key, value);
    }

    static setCachex(key: string, time: number, value: string): void {
        this.client.SETEX(key, time, value);
    }

    static async getCache(key: string): Promise<string> {
        return await this.client.GET(key);
    }

    static async shutdown(): Promise<void> {
        if (this.client) {
            return await this.client.quit();
        }
    }
}
