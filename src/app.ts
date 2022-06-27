const { version: SERVER_VERSION } = require('../package.json');
process.env.SERVER_VERSION = SERVER_VERSION as string;

import genPaths from './resources/paths';
import dotenv from 'dotenv';
import log, { init } from './lib/logger';
import SchemaManager from './schemaManager';
import fastify from 'fastify';

import schema from './routes/schema/index';
import properties from './routes/properties/index';
import getName from './routes/getName/index';
import getSku from './routes/getSku/index';
import getItemObject from './routes/getItemObject/index';
import getItem from './routes/getItem/index';
import raw from './routes/raw/index';

const paths = genPaths();
init(paths);
dotenv.config({ path: paths.env });

const server = fastify({ keepAliveTimeout: 200 });
void import('@fastify/swagger').then(async sw => {
    // @ts-ignore
    server.register(sw, {
        exposeRoute: true,
        routePrefix: '/',
        openapi: {
            info: {
                title: 'Team Fortress 2 Schema Public Unofficial APIs',
                description: 'Documentation for schema.autobot.tf public APIs.',
                version: process.env.SERVER_VERSION,
                license: 'MIT'
            },
            externalDocs: {
                url: 'https://github.com/TF2Autobot/schema.autobot.tf',
                description: 'Github repository'
            }
        }
    });

    log.debug('Initiaziling schema manager...');
    try {
        await SchemaManager.init();
    } catch (err) {
        throw err;
    }

    log.debug('Initiaziling hooks...');
    // https://stackoverflow.com/questions/57645360/fastify-middleware-access-to-query-and-params
    server.addHook('onRequest', (req, res, done) => {
        if (['/static', '/uiConfig', '/json', '/initOAuth'].some(key => req.url.includes(key))) {
            return done();
        }

        log.info(`Got ${req.method} ${decodeURIComponent(req.url)}`);

        done();
    });

    log.debug('Initiaziling routes...');
    server.register(schema, {
        prefix: '/schema'
    });
    server.register(properties, {
        prefix: '/properties'
    });
    server.register(getName, {
        prefix: '/getName'
    });
    server.register(getSku, {
        prefix: '/getSku'
    });
    server.register(getItemObject, {
        prefix: '/getItemObject'
    });
    server.register(getItem, {
        prefix: '/getItem'
    });
    server.register(raw, {
        prefix: '/raw'
    });

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

    log.info('Server uptime:' + process.uptime());
    clearInterval(SchemaManager?.schemaManager?._updateInterval);
    clearTimeout(SchemaManager?.schemaManager?._updateTimeout);
    process.exit(1);
});
