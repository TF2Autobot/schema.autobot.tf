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
            info: { title: 'schema.autobot.tf', version: '1.1.0' }
        }
    });

    log.debug('Initiaziling schema manager...');
    try {
        await SchemaManager.init();
    } catch (err) {
        throw err;
    }

    log.debug('Initiaziling routes...');
    server.register(routes);

    const port = parseInt(process.env.PORT, 10);

    log.debug('Starting the server...');
    try {
        await server.listen({ port });
        log.debug(`Server is up! Listening at http://localhost:${port}`);
    } catch (err) {
        throw err;
    }
});

import ON_DEATH from 'death';
import { inspect } from 'util';

ON_DEATH({ uncaughtException: true })((signalOrErr, origin) => {
    const crashed = signalOrErr !== 'SIGINT';

    if (crashed) {
        log.error(
            [
                'Server' +
                    ' crashed! Please create an issue with the following log:',
                `package.version: ${
                    process.env.SERVER_VERSION || undefined
                }; node: ${process.version} ${process.platform} ${
                    process.arch
                }}`,
                'Stack trace:',
                inspect(origin)
            ].join('\r\n')
        );
    } else {
        log.warn('Received kill signal `' + signalOrErr + '`');
    }

    log.info('Server uptime:' + process.uptime());
    clearInterval(SchemaManager?.schemaManager?._updateInterval);
    clearTimeout(SchemaManager?.schemaManager?._updateTimeout);
    process.exit(1);
});
