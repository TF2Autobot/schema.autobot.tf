import SchemaManager from './classes/SchemaManager';
import log from './lib/logger';
import fastifySwagger from '@fastify/swagger';
import { FastifyInstance } from 'fastify';

import schema from './routes/schema/index';
import properties from './routes/properties/index';
import getName from './routes/getName/index';
import getSku from './routes/getSku/index';
import getItemObject from './routes/getItemObject/index';
import getItemGrade from './routes/getItemGrade/index';
import getItem from './routes/getItem/index';
import raw from './routes/raw/index';
import root from './routes/index';
import itemObjectProperties from './schemas/itemObject';
import econItemProperties from './schemas/econItem';

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

    try {
        log.debug('Initiaziling schema manager...');
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

    server.addSchema({
        $id: 'itemObject',
        type: 'object',
        required: ['defindex', 'quality'],
        properties: itemObjectProperties
    });

    server.addSchema({
        $id: 'econItem',
        type: 'object',
        additionalProperties: true,
        required: ['appid', 'descriptions', 'tradable', 'actions', 'market_hash_name', 'tags'],
        properties: econItemProperties
    });

    log.debug('Initiaziling routes...');
    server.register(root, {
        prefix: '/'
    });
    server.register(schema, {
        prefix: '/schema'
    });
    server.register(raw, {
        prefix: '/raw'
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
    server.register(getItemGrade, {
        prefix: '/getItemGrade'
    });
    server.register(getItem, {
        prefix: '/getItem'
    });

    const port = parseInt(process.env.PORT, 10);

    log.debug('Starting the server...');
    try {
        await server.listen({ port });
        log.debug(`Server is up! Listening at http://localhost:${port}`);

        server.swagger({ yaml: true });
    } catch (err) {
        throw err;
    }
}
