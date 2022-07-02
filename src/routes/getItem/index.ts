import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import SKU from '@tf2autobot/tf2-sku';
import Redis from '../../redis';
import { Item } from '@tf2autobot/tf2-schema';

const getItem: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/fromDefindex/:defindex',
        {
            schema: {
                description: 'Get an item element from item defindex',
                tags: ['Get item element'],
                params: {
                    defindex: {
                        type: 'number',
                        description: `Example: 5021, 30769`
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
            const item = SchemaManager.schemaManager.schema.getItemByDefindex(defindex);

            if (item === null) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Unable to get item element from defindex ${defindex}`
                    });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems: SchemaManager.schemaManager.schema.raw.items_game.items[String(defindex)]
                });
        }
    );

    app.get(
        '/fromName/:name',
        {
            schema: {
                description: 'Get an item element from item full name',
                tags: ['Get item element'],
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

            if (itemObject.defindex === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Unable to get item object from item name (defindex is null)`
                });
            }

            const item = SchemaManager.schemaManager.schema.getItemByDefindex(itemObject.defindex);
            if (item === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Item not found`
                });
            }

            if (!skuCached) {
                Redis.setCache(`s_gsfn_${name}`, SKU.fromObject(itemObject));
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems:
                        SchemaManager.schemaManager.schema.raw.items_game.items[String(itemObject.defindex)]
                });
        }
    );

    app.get(
        '/fromSku/:sku',
        {
            schema: {
                description: 'Get an item element from item sku',
                tags: ['Get item element'],
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
            const itemObject = SKU.fromString(sku);
            const item = SchemaManager.schemaManager.schema.getItemByDefindex(itemObject.defindex);

            if (item === null) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Unable to get item element from item sku (defindex is null)`
                });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems:
                        SchemaManager.schemaManager.schema.raw.items_game.items[String(itemObject.defindex)]
                });
        }
    );
};

export default getItem;
