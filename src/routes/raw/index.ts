import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';

const raw: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/schema/:key',
        {
            schema: {
                description: 'Raw value for "raw.schema[key]"',
                tags: ['Raw'],
                params: {
                    key: {
                        type: 'string',
                        enum: Object.keys(SchemaManager.schemaManager.schema.raw.schema)
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.key === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "key" MUST be defined'
                });
            }

            // @ts-ignore
            const key = req.params.key;

            const value = SchemaManager.schemaManager.schema.raw.schema[key];
            if (value === undefined) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Cannot find value of ${key} key in raw.schema`
                    });
            }

            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                value
            });
        }
    );

    app.get(
        '/items_game/:key',
        {
            schema: {
                description: 'Raw value for "raw.items_game[key]"',
                tags: ['Raw'],
                params: {
                    key: {
                        type: 'string',
                        enum: Object.keys(SchemaManager.schemaManager.schema.raw.items_game)
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.key === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "key" MUST be defined'
                });
            }

            // @ts-ignore
            const key = req.params.key;

            const value = SchemaManager.schemaManager.schema.raw.items_game[key];
            if (value === undefined) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Cannot find value of ${key} key in raw.items_game`
                    });
            }

            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                value
            });
        }
    );
};

export default raw;
