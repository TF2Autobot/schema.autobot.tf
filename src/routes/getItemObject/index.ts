import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { Item } from '@tf2autobot/tf2-schema';
import SKU from '@tf2autobot/tf2-sku';

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
            const item = SchemaManager.schemaManager.schema.getItemObjectFromName(name);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item });
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
        (req, reply) => {
            const names = req.body as string[];
            const itemObjects: Item[] = [];
            names.forEach(name => {
                itemObjects.push(SchemaManager.schemaManager.schema.getItemObjectFromName(name));
            });

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
