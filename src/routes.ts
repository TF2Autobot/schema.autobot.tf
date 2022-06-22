import { FastifyInstance, FastifyServerOptions } from 'fastify';
import SchemaManager from './schemaManager';
import SKU from '@tf2autobot/tf2-sku';
import { CharacterClasses, Item } from '@tf2autobot/tf2-schema';
import log from './lib/logger';
import { itemObject } from './schemas/itemObject';

export default async function routes(
    app: FastifyInstance,
    options?: FastifyServerOptions
): Promise<void> {
    app.get(
        '/schema',
        {
            schema: {
                description:
                    'Get Team Fortress 2 Item Schema (Warning: Might cause browser to freeze)',
                tags: ['Schema (raw)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /schema request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema);
        }
    );

    app.get(
        '/schema/download',
        {
            schema: {
                description: 'Download the Team Fortress 2 Item Schema',
                tags: ['Schema (raw)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /schema/download request`);

            return reply
                .code(200)
                .header(
                    'Content-Disposition',
                    'attachment; filename=schema.json'
                )
                .send(
                    JSON.stringify(SchemaManager.schemaManager.schema, null, 2)
                );
        }
    );

    app.get(
        '/properties/qualities',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Qualities',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/qualities request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.qualities);
        }
    );

    app.get(
        '/properties/effects',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Effects',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/effects request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.effects);
        }
    );

    app.get(
        '/properties/paints',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Paints',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/paints request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.paints);
        }
    );

    app.get(
        '/properties/strangeParts',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Strange Parts',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/strangeParts request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.getStrangeParts());
        }
    );

    app.get(
        '/properties/paintkits',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Paintkits (War Paints)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/paintkits request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.paintkits);
        }
    );

    app.get(
        '/properties/crateseries',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Crate Series',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/crateseries request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.crateSeriesList);
        }
    );

    app.get(
        '/properties/craftWeapons',
        {
            schema: {
                description:
                    'Get an array of Team Fortress 2 Craftable Weapons (for trading)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/craftWeapons request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(
                    SchemaManager.schemaManager.schema.getCraftableWeaponsForTrading()
                );
        }
    );

    app.get(
        '/properties/uncraftWeapons',
        {
            schema: {
                description:
                    'Get an array of Team Fortress 2 Uncraftable Weapons (for trading)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/uncraftWeapons request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(
                    SchemaManager.schemaManager.schema.getUncraftableWeaponsForTrading()
                );
        }
    );

    app.get(
        '/properties/craftWeaponsByClass/:classChar',
        {
            schema: {
                description:
                    'Get an array of Team Fortress 2 Craftable Weapons (for trading) by Character class',
                tags: ['Schema Properties (simplified)'],
                required: ['params'],
                params: {
                    classChar: {
                        type: 'string'
                    }
                }
            }
        },
        (req, reply) => {
            if (req.params === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of Character Class must be defined'
                    });
            }

            // @ts-ignore
            const params = req.params.classChar as string;
            const fixCharClass =
                params.charAt(0).toUpperCase() + params.slice(1);
            log.info(
                `Got GET /properties/craftWeaponsByClass/${fixCharClass} request`
            );

            try {
                const weapons =
                    SchemaManager.schemaManager.schema.getWeaponsForCraftingByClass(
                        fixCharClass as CharacterClasses
                    );

                return reply
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send(weapons);
            } catch (err) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'Invalid Character class.',
                        validChar: [
                            'Scout',
                            'Soldier',
                            'Pyro',
                            'Demoman',
                            'Heavy',
                            'Engineer',
                            'Medic',
                            'Sniper',
                            'Spy'
                        ]
                    });
            }
        }
    );

    // ===

    app.post(
        '/getName/fromItemObject',
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
                body: itemObject
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item object is not defined'
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
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Item name returned null`
                    });
            }

            log.info(`Got GET /getName/fromItemObject request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, name: itemName });
        }
    );

    app.post(
        '/getName/fromSku',
        {
            schema: {
                description: 'Get an item name from item sku',
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
                    type: 'string',
                    examples: ['5021;6']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item sku is not defined'
                    });
            }

            const sku = req.body as string;
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
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Item name returned null`
                    });
            }

            log.info(`Got GET /getName/fromSku request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, name: itemName });
        }
    );

    // ===

    app.post(
        '/getSku/fromItemObject',
        {
            schema: {
                description: 'Get an item sku from item object',
                tags: ['Get item sku'],
                required: ['body'],
                body: itemObject
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
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

            log.info(`Got GET /getSku/fromItem request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    app.post(
        '/getSku/fromName',
        {
            schema: {
                description: 'Get an item sku from item full name',
                tags: ['Get item sku'],
                required: ['body'],
                body: {
                    type: 'string',
                    examples: ['Mann Co. Supply Crate Key']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item name is not defined'
                    });
            }

            const name = req.body as string;
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

            log.info(`Got GET /getSku/fromName request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    // ===

    app.post(
        '/getItemObject/fromName',
        {
            schema: {
                description: 'Get an item instance from item full name',
                tags: ['Get item object'],
                required: ['body'],
                body: {
                    type: 'string',
                    examples: ['Mann Co. Supply Crate Key']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item name is not defined'
                    });
            }

            const name = req.body as string;
            const item =
                SchemaManager.schemaManager.schema.getItemObjectFromName(name);

            log.info(`Got GET /getItemObject/fromName request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item });
        }
    );

    app.post(
        '/getItemObject/fromSku',
        {
            schema: {
                description: 'Get an item object from item sku',
                tags: ['Get item object'],
                required: ['body'],
                body: {
                    type: 'string',
                    examples: ['5021;6']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item sku is not defined'
                    });
            }

            const sku = req.body as string;
            const item = SKU.fromString(sku);

            log.info(`Got GET /getItemObject/fromSku request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item });
        }
    );

    // ===

    app.post(
        '/getItem/fromDefindex',
        {
            schema: {
                description: 'Get an item element from item defindex',
                tags: ['Get item element'],
                required: ['body'],
                body: {
                    type: 'number',
                    examples: [5021]
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item defindex is not defined'
                    });
            }

            const defindex = req.body as number;
            const item =
                SchemaManager.schemaManager.schema.getItemByDefindex(defindex);

            if (item === null) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Unable to get item element from defindex ${defindex}`
                    });
            }

            log.info(`Got GET /getItem/fromDefindex request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems:
                        SchemaManager.schemaManager.schema.raw.items_game.items[
                            String(defindex)
                        ]
                });
        }
    );

    app.post(
        '/getItem/fromName',
        {
            schema: {
                description: 'Get an item element from item full name',
                tags: ['Get item element'],
                required: ['body'],
                body: {
                    type: 'string',
                    examples: ['Mann Co. Supply Crate Key']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item name is not defined'
                    });
            }

            const name = req.body as string;
            const itemObject =
                SchemaManager.schemaManager.schema.getItemObjectFromName(name);
            if (itemObject.defindex === null) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Unable to get item object from item name (defindex is null)`
                    });
            }

            const item = SchemaManager.schemaManager.schema.getItemByDefindex(
                itemObject.defindex
            );
            if (item === null) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Item not found`
                    });
            }

            log.info(`Got GET /getItem/fromName request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems:
                        SchemaManager.schemaManager.schema.raw.items_game.items[
                            String(itemObject.defindex)
                        ]
                });
        }
    );

    app.post(
        '/getItem/fromSku',
        {
            schema: {
                description: 'Get an item element from item sku',
                tags: ['Get item element'],
                required: ['body'],
                body: {
                    type: 'string',
                    examples: ['5021;6']
                }
            }
        },
        (req, reply) => {
            if (req.body === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'body of item sku is not defined'
                    });
            }

            const sku = req.body as string;
            const itemObject = SKU.fromString(sku);
            const item = SchemaManager.schemaManager.schema.getItemByDefindex(
                itemObject.defindex
            );

            if (item === null) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Unable to get item element from item sku (defindex is null)`
                    });
            }

            log.info(`Got GET /getItem/fromSku request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    schemaItems: item,
                    items_gameItems:
                        SchemaManager.schemaManager.schema.raw.items_game.items[
                            String(itemObject.defindex)
                        ]
                });
        }
    );

    // ===
}
