import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';

const raw: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/schema/:key',
        {
            schema: {
                description: 'Raw value for "raw.schema[key]"',
                tags: ['Schema (raw)'],
                params: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            enum: Object.keys(SchemaManager.schemaManager.schema.raw.schema)
                        }
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
                tags: ['Schema (raw)'],
                params: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            enum: Object.keys(SchemaManager.schemaManager.schema.raw.items_game)
                        }
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

    app.get(
        '/isFestivizable/:defindex',
        {
            schema: {
                description: 'Determine if the defindex can be festivized, return a boolean',
                tags: ['Schema (raw)'],
                params: {
                    type: 'object',
                    properties: {
                        defindex: {
                            type: 'number',
                            description: `Example (true): 35, 36, 127, 423, 1178, 15000,`
                        }
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.defindex === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "defindex" MUST be defined'
                });
            }

            // @ts-ignore
            const defindex = parseInt(req.params.defindex) as number;
            const isFestivizable = SchemaManager.schemaManager.schema.isFestivizable(defindex);

            if (typeof isFestivizable !== 'boolean') {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `isFestivizable return ${isFestivizable} for defindex ${defindex}`
                    });
            }

            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                isFestivizable
            });
        }
    );

    app.get(
        '/getStrangifierTarget/:defindex',
        {
            schema: {
                description: 'Get Strangifier target (td-), return number or null',
                tags: ['Schema (raw)'],
                params: {
                    type: 'object',
                    properties: {
                        defindex: {
                            type: 'number',
                            description: `Example (with valid value): 5661, 5721, 5722, 5723, 5724`
                        }
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.defindex === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "defindex" MUST be defined'
                });
            }

            // @ts-ignore
            const defindex = parseInt(req.params.defindex) as number;
            const strangifierTarget = SchemaManager.schemaManager.schema.getStrangifierTarget(defindex);

            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                strangifierTarget
            });
        }
    );
};

export default raw;
