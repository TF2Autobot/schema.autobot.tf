import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';

const getName: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.post(
        '/fromItemObject',
        {
            schema: {
                description: 'Get an item name from item object',
                tags: ['Get item name'],
                required: ['body'],
                querystring: {
                    type: 'object',
                    properties: {
                        proper: {
                            type: 'boolean'
                        },
                        usePipeForSkin: {
                            type: 'boolean'
                        }
                    }
                },
                body: {
                    $ref: 'itemObject#',
                    examples: [
                        { defindex: 5021, quality: 6 },
                        { defindex: 30769, quality: 5, effect: 108 }
                    ]
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'body of item object MUST be defined'
                });
            }

            const item = req.body as Item;
            const query = req.query as {
                proper?: boolean;
                usePipeForSkin?: boolean;
            };
            const itemName = SchemaManager.schemaManager.schema.getName(
                item,
                query?.proper ?? false,
                query?.usePipeForSkin ?? false
            );

            if (itemName === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Item name returned null`
                });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, name: itemName });
        }
    );

    app.post(
        '/fromItemObjectBulk',
        {
            schema: {
                description: 'Get item name from item object in bulk',
                tags: ['Get item name'],
                required: ['body'],
                querystring: {
                    type: 'object',
                    properties: {
                        proper: {
                            type: 'boolean'
                        },
                        usePipeForSkin: {
                            type: 'boolean'
                        }
                    }
                },
                body: {
                    type: 'array',
                    items: {
                        $ref: 'itemObject#'
                    },
                    examples: [
                        [
                            { defindex: 5021, quality: 6 },
                            { defindex: 30769, quality: 5, effect: 108 }
                        ],
                        [
                            { defindex: 588, quality: 11, craftable: false },
                            { defindex: 194, quality: 11, festive: false }
                        ]
                    ]
                }
            }
        },
        (req, reply) => {
            const itemObjects = req.body as Item[];
            const query = req.query as {
                proper?: boolean;
                usePipeForSkin?: boolean;
            };

            const itemNames: string[] = [];
            itemObjects.forEach(item => {
                itemNames.push(
                    SchemaManager.schemaManager.schema.getName(
                        item,
                        query?.proper ?? false,
                        query?.usePipeForSkin ?? false
                    )
                );
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemNames });
        }
    );

    app.get(
        '/fromSku/:sku',
        {
            schema: {
                description: 'Get an item name from item sku',
                tags: ['Get item name'],
                querystring: {
                    type: 'object',
                    properties: {
                        proper: {
                            type: 'boolean'
                        },
                        usePipeForSkin: {
                            type: 'boolean'
                        }
                    }
                },
                params: {
                    sku: {
                        type: 'string',
                        description: `Example: "5021;6", "30769;5;u108"`
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.sku === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "sku" MUST be defined'
                });
            }

            // @ts-ignore
            const sku = req.params.sku as string;
            const query = req.query as {
                proper?: boolean;
                usePipeForSkin?: boolean;
            };
            const itemName = SchemaManager.schemaManager.schema.getName(
                SKU.fromString(sku),
                query?.proper ?? false,
                query?.usePipeForSkin ?? false
            );

            if (itemName === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Item name returned null`
                });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, name: itemName });
        }
    );

    app.post(
        '/fromSkuBulk',
        {
            schema: {
                description: 'Get item name from item sku in bulk',
                tags: ['Get item name'],
                required: ['body'],
                querystring: {
                    type: 'object',
                    properties: {
                        proper: {
                            type: 'boolean'
                        },
                        usePipeForSkin: {
                            type: 'boolean'
                        }
                    }
                },
                body: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    examples: [
                        ['5021;6', '30769;5;108'],
                        ['321;5;u62', '183;5;u87', '30658;5;u76']
                    ]
                }
            }
        },
        (req, reply) => {
            const skus = req.body as string[];
            const query = req.query as {
                proper?: boolean;
                usePipeForSkin?: boolean;
            };

            const itemNames: string[] = [];
            skus.forEach(sku => {
                itemNames.push(
                    SchemaManager.schemaManager.schema.getName(
                        SKU.fromString(sku),
                        query?.proper ?? false,
                        query?.usePipeForSkin ?? false
                    )
                );
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemNames });
        }
    );
};

export default getName;
