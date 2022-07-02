import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';
import Redis from '../../redis';

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

            const skuCached = await Redis.getCache(`s_gsfn_${name}`);
            let itemObject: Item;
            if (skuCached) {
                itemObject = SKU.fromString(skuCached);
            } else {
                itemObject = SchemaManager.schemaManager.schema.getItemObjectFromName(name);
            }

            if (itemObject.defindex === null || itemObject.quality === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Generated itemObject contains defindex or quality of null - Please check the item name you've sent`
                });
            }

            if (!skuCached) {
                Redis.setCache(`s_gsfn_${name}`, SKU.fromObject(itemObject));
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
                const skuCached = await Redis.getCache(`s_gsfn_${name}`);

                if (skuCached) {
                    itemObjects.push(SKU.fromString(skuCached));
                } else {
                    const itemObject = SchemaManager.schemaManager.schema.getItemObjectFromName(name);
                    itemObjects.push(itemObject);

                    if (itemObject.defindex !== null && itemObject.quality !== null) {
                        Redis.setCache(`s_gsfn_${name}`, SKU.fromObject(itemObject));
                    }
                }
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
};

export default getItemObject;
