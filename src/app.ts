const { version: SERVER_VERSION } = require('../package.json');
process.env.SERVER_VERSION = SERVER_VERSION as string;

import genPaths from './resources/paths';
import dotenv from 'dotenv';
import log, { init } from './lib/logger';
import SchemaManager from './classes/SchemaManager';
import fastify from 'fastify';
import fastifySetup from './fastify';

const paths = genPaths();
init(paths);
dotenv.config({ path: paths.env });

const server = fastify({ keepAliveTimeout: 200 });
fastifySetup(server);

import ON_DEATH from 'death';
import { inspect } from 'util';

ON_DEATH({ uncaughtException: true })(async (signalOrErr, origin) => {
    const crashed = signalOrErr !== 'SIGINT';

    if (crashed) {
        log.error(
            [
                'Server' + ' crashed! Please create an issue with the following log:',
                `package.version: ${process.env.SERVER_VERSION || undefined}; node: ${process.version} ${
                    process.platform
                } ${process.arch}}`,
                'Stack trace:',
                inspect(origin)
            ].join('\r\n')
        );
    } else {
        log.warn('Received kill signal `' + signalOrErr + '`');
    }

    log.info('Server uptime: ' + process.uptime());
    clearInterval(SchemaManager?.schemaManager?._updateInterval);
    clearTimeout(SchemaManager?.schemaManager?._updateTimeout);

    if (server) {
        await server.close();
    }

    process.exit(crashed ? 1 : 0);
});
