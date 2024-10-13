import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';
import { EconItem } from '../../types/EconItem';
import parseEcon from '../../lib/econParser/parseEcon';
import { multiple1, multiple2, single1, single2 } from '../../lib/examples/econ';

const getItemObject: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/fromName/:name',
        {
            schema: {
                description: 'Get an item object from item full name',
                tags: ['Get item object'],
                params: {
                    name: {
                        type: 'string',
                        description: `Example: "Mann Co. Supply Crate Key", "Tesla Coil Herald's Helm"`
                    }
                }
            }
        },
        async (req, reply) => {
            // @ts-ignore
            if (req.params?.name === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "name" MUST be defined'
                });
            }

            // @ts-ignore
            const name = req.params.name as string;
            let itemObject: Item;
            itemObject = SchemaManager.schemaManager.schema.getItemObjectFromName(name);

            if (itemObject.defindex === null || itemObject.quality === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Generated itemObject contains defindex or quality of null - Please check the item name you've sent`
                });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item: itemObject });
        }
    );

    app.post(
        '/fromNameBulk',
        {
            schema: {
                description: 'Get item object from item full name in bulk',
                tags: ['Get item object'],
                body: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    examples: [
                        ['Mann Co. Supply Crate Key', "Tesla Coil Herald's Helm"],
                        [
                            'Strange Festivized Knife',
                            "Vivid Plasma Connoisseur's Cap",
                            'Sparkly Spruce Taunt: Bad Pipes'
                        ]
                    ]
                }
            }
        },
        async (req, reply) => {
            if (Array.isArray(req.body) && req.body.length === 0) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'body MUST be an array for item name, and cannot be empty'
                });
            }

            const names = req.body as string[];
            const itemObjects: Item[] = [];

            for (const name of names) {
                const itemObject = SchemaManager.schemaManager.schema.getItemObjectFromName(name);
                itemObjects.push(itemObject);
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemObjects });
        }
    );

    app.get(
        '/fromSku/:sku',
        {
            schema: {
                description: 'Get an item object from item sku',
                tags: ['Get item object'],
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
            const item = SKU.fromString(sku);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item });
        }
    );

    app.post(
        '/fromSkuBulk',
        {
            schema: {
                description: 'Get item object from item sku in bulk',
                tags: ['Get item object'],
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
            const itemObjects: Item[] = [];
            skus.forEach(sku => {
                itemObjects.push(SKU.fromString(sku));
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemObjects });
        }
    );

    app.post(
        '/fromEconItem',
        {
            schema: {
                description: 'Get an item object from Steam Econ item',
                tags: ['Get item object'],
                querystring: {
                    type: 'object',
                    properties: {
                        normalizeFestivizedItems: {
                            type: 'boolean'
                        },
                        normalizeStrangeAsSecondQuality: {
                            type: 'boolean'
                        },
                        normalizePainted: {
                            type: 'boolean'
                        }
                    }
                },
                body: {
                    $ref: 'econItem#',
                    examples: [single1, single2]
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'body of Econ item object MUST be defined'
                });
            }

            const query = req.query as {
                normalizeFestivizedItems: boolean;
                normalizeStrangeAsSecondQuality: boolean;
                normalizePainted: boolean;
            };

            const item = req.body as EconItem;

            try {
                const parsedEcon = parseEcon(
                    item,
                    SchemaManager.schemaManager.schema,
                    query.normalizeFestivizedItems,
                    query.normalizeStrangeAsSecondQuality,
                    query.normalizePainted
                );
                const itemObject = parsedEcon.item;

                return reply
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({ success: true, itemObject });
            } catch (err) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({ success: false, message: err });
            }
        }
    );

    app.post(
        '/fromEconItemBulk',
        {
            schema: {
                description: 'Get item object from Steam Econ item in bulk',
                tags: ['Get item object'],
                querystring: {
                    type: 'object',
                    properties: {
                        normalizeFestivizedItems: {
                            type: 'boolean'
                        },
                        normalizeStrangeAsSecondQuality: {
                            type: 'boolean'
                        },
                        normalizePainted: {
                            type: 'boolean'
                        }
                    }
                },
                body: {
                    type: 'array',
                    items: {
                        $ref: 'econItem#'
                    },
                    examples: [multiple1, multiple2]
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'body of array of Econ item object MUST be defined'
                });
            }

            const query = req.query as {
                normalizeFestivizedItems: boolean;
                normalizeStrangeAsSecondQuality: boolean;
                normalizePainted: boolean;
            };

            const items = req.body as EconItem[];
            const itemObjects: Item[] = [];
            items.forEach(item => {
                try {
                    const parsedEcon = parseEcon(
                        item,
                        SchemaManager.schemaManager.schema,
                        query.normalizeFestivizedItems,
                        query.normalizeStrangeAsSecondQuality,
                        query.normalizePainted
                    );
                    itemObjects.push(parsedEcon.item);
                } catch (err) {
                    return reply
                        .code(400)
                        .header('Content-Type', 'application/json; charset=utf-8')
                        .send({ success: false, message: err });
                }
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemObjects });
        }
    );
};

export default getItemObject;
