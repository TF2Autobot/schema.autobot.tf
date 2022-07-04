import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';
import SKU from '@tf2autobot/tf2-sku';
import Redis from '../../classes/Redis';
import { Item } from '@tf2autobot/tf2-schema';

const getItemGrade: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/v1',
        {
            schema: {
                description: 'Get a list of items by Grade',
                tags: ['Get item grade']
            }
        },
        (req, reply) => {
            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                items: SchemaManager.itemGrades
            });
        }
    );

    app.get(
        '/v2',
        {
            schema: {
                description: 'Get a list of item defindexes with Grade',
                tags: ['Get item grade']
            }
        },
        (req, reply) => {
            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                success: true,
                items: SchemaManager.itemGradeByDefindex
            });
        }
    );

    app.get(
        '/fromDefindex/:defindex',
        {
            schema: {
                description: 'Get an item grade from item defindex',
                tags: ['Get item grade'],
                params: {
                    defindex: {
                        type: 'number',
                        description: `Example: 15013, 30768`
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
            const defindex = req.params.defindex;

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    grade: SchemaManager.itemGradeByDefindex[defindex] ?? 'default'
                });
        }
    );

    app.get(
        '/fromName/:name',
        {
            schema: {
                description: 'Get an item grade from item full name',
                tags: ['Get item grade'],
                params: {
                    name: {
                        type: 'string',
                        description: `Example: "Dead Head", "Giger Counter"`
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

            if (SchemaManager.defindexes[itemObject.defindex] === undefined) {
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
                    grade: SchemaManager.itemGradeByDefindex[itemObject.defindex] ?? 'default'
                });
        }
    );

    app.get(
        '/fromSku/:sku',
        {
            schema: {
                description: 'Get an item grade from item sku',
                tags: ['Get item grade'],
                params: {
                    sku: {
                        type: 'string',
                        description: `Example: "30693;6", "30648;5;u108"`
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

            if (SchemaManager.defindexes[itemObject.defindex] === undefined) {
                return reply.code(404).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: `Item not found`
                });
            }

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    grade: SchemaManager.itemGradeByDefindex[itemObject.defindex] ?? 'default'
                });
        }
    );
};

export default getItemGrade;
