import { FastifyInstance, FastifyPluginAsync, FastifySchema, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';
import Redis from '../../redis';

const getSku: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.post(
        '/fromItemObject',
        {
            schema: {
                description: 'Get an item sku from item object',
                tags: ['Get item sku'],
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
                    message: 'body of item object is not defined'
                });
            }

            const item = req.body as Item;
            const sku = SKU.fromObject(item);

            if (sku.includes(';null') || sku.includes(';undefined')) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Generated sku: ${sku} - Please check the item name you've sent`
                    });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    app.post(
        '/fromItemObjectBulk',
        {
            schema: {
                description: 'Get an item sku from item object in bulk',
                tags: ['Get item sku'],
                body: {
                    type: 'array',
                    items: { $ref: 'itemObject#' },
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
            const skus: string[] = [];
            itemObjects.forEach(item => {
                skus.push(SKU.fromObject(item));
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, skus });
        }
    );

    app.get(
        '/fromName/:name',
        {
            schema: {
                description: 'Get an item sku from item full name',
                tags: ['Get item sku'],
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
            const name = req.params.name as string;
            // gsfn - getSku/fromName
            const skuCached = await Redis.getCache(`s_gsfn_${name}`);

            if (skuCached) {
                return reply
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({ success: true, sku: skuCached });
            }

            const sku = SchemaManager.schemaManager.schema.getSkuFromName(name);

            if (sku.includes(';null') || sku.includes(';undefined')) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Generated sku: ${sku} - Please check the item name you've sent`
                    });
            }

            Redis.setCache(`s_gsfn_${name}`, sku);
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    app.post(
        '/fromNameBulk',
        {
            schema: {
                description: 'Get item sku from item full name in bulk',
                tags: ['Get item sku'],
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
            const skus: string[] = [];

            for (const name of names) {
                const skuCached = await Redis.getCache(`s_gsfn_${name}`);

                if (skuCached) {
                    skus.push(skuCached);
                } else {
                    const sku = SchemaManager.schemaManager.schema.getSkuFromName(name);
                    skus.push(sku);

                    if (!sku.includes(';null') && !sku.includes(';undefined')) {
                        Redis.setCache(`s_gsfn_${name}`, sku);
                    }
                }
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, skus });
        }
    );
};

export default getSku;
