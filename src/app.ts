const { version: SERVER_VERSION } = require('../package.json');
process.env.SERVER_VERSION = SERVER_VERSION as string;

import genPaths from './resources/paths';
import dotenv from 'dotenv';
import log, { init } from './lib/logger';
import SchemaManager from './schemaManager';

import fastify from 'fastify';
import routes from './routes';

const paths = genPaths();
init(paths);
dotenv.config({ path: paths.env });

const server = fastify({ keepAliveTimeout: 200 });
void import('@fastify/swagger').then(async (sw) => {
    // @ts-ignore
    server.register(sw, {
        exposeRoute: true,
        routePrefix: '/',
        swagger: {
            info: { title: 'schema.autobot.tf' }
        }
    });

    log.debug('Initiaziling schema manager...');
    try {
        await SchemaManager.init();
    } catch (err) {
        abort(err);
    }

    log.debug('Initiaziling routes...');
    server.register(routes);

    const port = parseInt(process.env.PORT, 10);

    log.debug('Starting the server...');
    try {
        await server.listen({ port });
        log.debug(`Server is up! Listening at http://localhost:${port}`);
    } catch (err) {
        abort(err);
    }
});

function abort(err): void {
    log.error(err);
    process.exit(1);
}
