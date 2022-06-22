import path from 'path';

interface PublicPaths {
    schema: string;
}

interface LogPaths {
    log: string;
    error: string;
}

export interface Paths {
    env: string;
    public: PublicPaths;
    logs: LogPaths;
}

export default function genPaths(): Paths {
    return {
        env: path.join(__dirname, '../../.env'),
        public: {
            schema: path.join(__dirname, `../../public/files/schema.json`)
        },
        logs: {
            log: path.join(__dirname, `../../logs/%DATE%.log`),
            error: path.join(__dirname, `../../logs/error.log`)
        }
    };
}
