import { FastifyInstance, FastifyPluginAsync, FastifySchema, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';

const getSku: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.post(
        '/fromItemObject',
        {
            schema: {
                description: 'Get an item sku from item object',
                tags: ['Get item sku'],
                required: ['body'],
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
                required: ['body'],
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
        (req, reply) => {
            // @ts-ignore
            if (req.params?.name === undefined) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of "name" MUST be defined'
                });
            }

            // @ts-ignore
            const name = req.params.name as string;
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
                required: ['body'],
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
        (req, reply) => {
            const names = req.body as string[];
            const skus: string[] = [];
            names.forEach(name => {
                skus.push(SchemaManager.schemaManager.schema.getSkuFromName(name));
            });

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, skus });
        }
    );
};

export default getSku;
