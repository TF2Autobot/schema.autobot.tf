import SchemaTF2 from '@tf2autobot/tf2-schema';

export default class SchemaManager {
    static schemaManager: SchemaTF2;

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.schemaManager = new SchemaTF2({
                apiKey: process.env.STEAM_API_KEY,
                updateTime: 5 * 60 * 1000,
            });

            this.schemaManager.init((err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
