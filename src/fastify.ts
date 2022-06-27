import SchemaManager from './schemaManager';
import log from './lib/logger';
import fastifySwagger from '@fastify/swagger';
import { FastifyInstance } from 'fastify';

import schema from './routes/schema/index';
import properties from './routes/properties/index';
import getName from './routes/getName/index';
import getSku from './routes/getSku/index';
import getItemObject from './routes/getItemObject/index';
import getItem from './routes/getItem/index';
import raw from './routes/raw/index';
import root from './routes/index';

export default async function fastifySetup(server: FastifyInstance): Promise<void> {
    // @ts-ignore
    server.register(fastifySwagger, {
        exposeRoute: true,
        routePrefix: '/docs',
        openapi: {
            info: {
                title: 'Team Fortress 2 Schema Public Unofficial APIs',
                description: 'Documentation for schema.autobot.tf public APIs.',
                version: process.env.SERVER_VERSION
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
    server.register(root, {
        prefix: '/'
    });
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
}
