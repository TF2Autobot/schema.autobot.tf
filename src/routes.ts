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
        '/properties/killstreaks',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Killstreaks',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/killstreaks request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    // https://github.com/danocmx/node-tf2-static-schema/blob/master/static/killstreaks.json
                    None: 0,
                    Killstreak: 1,
                    'Specialized Killstreak': 2,
                    'Professional Killstreak': 3,

                    '0': 'None',
                    '1': 'Killstreak',
                    '2': 'Specialized Killstreak',
                    '3': 'Professional Killstreak'
                });
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
        '/properties/wears',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Wears',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            log.info(`Got GET /properties/wears request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    // https://github.com/danocmx/node-tf2-static-schema/blob/master/static/wears.json
                    'Factory New': 1,
                    'Minimal Wear': 2,
                    'Field-Tested': 3,
                    'Well-Worn': 4,
                    'Battle Scarred': 5,

                    '1': 'Factory New',
                    '2': 'Minimal Wear',
                    '3': 'Field-Tested',
                    '4': 'Well-Worn',
                    '5': 'Battle Scarred'
                });
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
                description:
                    'Get Team Fortress 2 Item Strange Parts (excluding built-in)',
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

    const charClass = [
        'Scout',
        'Soldier',
        'Pyro',
        'Demoman',
        'Heavy',
        'Engineer',
        'Medic',
        'Sniper',
        'Spy'
    ];

    app.get(
        '/properties/craftWeaponsByClass/:classChar',
        {
            schema: {
                description:
                    'Get an array of Team Fortress 2 Craftable Weapons (for trading) by Character class',
                tags: ['Schema Properties (simplified)'],
                params: {
                    classChar: {
                        type: 'string',
                        enum: charClass
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
                        message: 'params of Character Class MUST be defined'
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
                        validChar: charClass
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
        '/getName/fromItemObjectBulk',
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
                    items: itemObject
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
            itemObjects.forEach((item) => {
                itemNames.push(
                    SchemaManager.schemaManager.schema.getName(
                        item,
                        query?.proper ?? false,
                        query?.usePipeForSkin ?? false
                    )
                );
            });

            log.info(`Got GET /getName/fromItemObjectBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemNames });
        }
    );

    app.get(
        '/getName/fromSku/:sku',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
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
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Item name returned null`
                    });
            }

            log.info(`Got GET /getName/fromSku/${sku} request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, name: itemName });
        }
    );

    app.post(
        '/getName/fromSkuBulk',
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
                    }
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
            skus.forEach((sku) => {
                itemNames.push(
                    SchemaManager.schemaManager.schema.getName(
                        SKU.fromString(sku),
                        query?.proper ?? false,
                        query?.usePipeForSkin ?? false
                    )
                );
            });

            log.info(`Got GET /getName/fromSkuBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemNames });
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

            log.info(`Got GET /getSku/fromItemObject request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    app.post(
        '/getSku/fromItemObjectBulk',
        {
            schema: {
                description: 'Get an item sku from item object in bulk',
                tags: ['Get item sku'],
                required: ['body'],
                body: {
                    type: 'array',
                    items: itemObject
                }
            }
        },
        (req, reply) => {
            const itemObjects = req.body as Item[];
            const skus: string[] = [];
            itemObjects.forEach((item) => {
                skus.push(SKU.fromObject(item));
            });

            log.info(`Got GET /getSku/fromItemObjectBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, skus });
        }
    );

    app.get(
        '/getSku/fromName/:name',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
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

            log.info(`Got GET /getSku/fromName/${name} request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, sku });
        }
    );

    app.post(
        '/getSku/fromNameBulk',
        {
            schema: {
                description: 'Get item sku from item full name in bulk',
                tags: ['Get item sku'],
                required: ['body'],
                body: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            }
        },
        (req, reply) => {
            const names = req.body as string[];
            const skus: string[] = [];
            names.forEach((name) => {
                skus.push(
                    SchemaManager.schemaManager.schema.getSkuFromName(name)
                );
            });

            log.info(`Got GET /getSku/fromNameBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, skus });
        }
    );

    // ===

    app.get(
        '/getItemObject/fromName/:name',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "name" MUST be defined'
                    });
            }

            // @ts-ignore
            const name = req.params.name as string;
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
        '/getItemObject/fromNameBulk',
        {
            schema: {
                description: 'Get item object from item full name in bulk',
                tags: ['Get item object'],
                required: ['body'],
                body: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            }
        },
        (req, reply) => {
            const names = req.body as string[];
            const itemObjects: Item[] = [];
            names.forEach((name) => {
                itemObjects.push(
                    SchemaManager.schemaManager.schema.getItemObjectFromName(
                        name
                    )
                );
            });

            log.info(`Got GET /getItemObject/fromNameBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemObjects });
        }
    );

    app.get(
        '/getItemObject/fromSku/:sku',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "sku" MUST be defined'
                    });
            }

            // @ts-ignore
            const sku = req.params.sku as string;
            const item = SKU.fromString(sku);

            log.info(`Got GET /getItemObject/fromSku request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, item });
        }
    );

    app.post(
        '/getItemObject/fromSkuBulk',
        {
            schema: {
                description: 'Get item object from item sku in bulk',
                tags: ['Get item object'],
                required: ['body'],
                body: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            }
        },
        (req, reply) => {
            const skus = req.body as string[];
            const itemObjects: Item[] = [];
            skus.forEach((sku) => {
                itemObjects.push(SKU.fromString(sku));
            });

            log.info(`Got GET /getItemObject/fromSkuBulk request`);

            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({ success: true, itemObjects });
        }
    );

    // ===

    app.get(
        '/getItem/fromDefindex/:defindex',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "defindex" MUST be defined'
                    });
            }

            // @ts-ignore
            const defindex = parseInt(req.params.defindex) as number;
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

    app.get(
        '/getItem/fromName/:name',
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
        (req, reply) => {
            // @ts-ignore
            if (req.params?.name === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "name" MUST be defined'
                    });
            }

            // @ts-ignore
            const name = req.params.name as string;
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

    app.get(
        '/getItem/fromSku/:sku',
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
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "sku" MUST be defined'
                    });
            }

            // @ts-ignore
            const sku = req.params.sku as string;
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

    app.get(
        '/raw/schema/:key',
        {
            schema: {
                description: 'Raw value for "raw.schema[key]"',
                tags: ['Raw'],
                params: {
                    key: {
                        type: 'string',
                        enum: [
                            'items_game_url',
                            'qualities',
                            'qualityNames',
                            'originNames',
                            'attributes',
                            'item_sets',
                            'attribute_controlled_attached_particles',
                            'item_levels',
                            'kill_eater_score_types',
                            'string_lookups',
                            'items',
                            'paintkits'
                        ]
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.key === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
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

            log.info(`Got GET /raw/schema/${key} request`);
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    value
                });
        }
    );

    app.get(
        '/raw/items_game/:key',
        {
            schema: {
                description: 'Raw value for "raw.items_game[key]"',
                tags: ['Raw'],
                params: {
                    key: {
                        type: 'string',
                        enum: [
                            'game_info',
                            'qualities',
                            'colors',
                            'rarities',
                            'equip_regions_list',
                            'equip_conflicts',
                            'quest_objective_conditions',
                            'item_series_types',
                            'item_collections',
                            'operations',
                            'prefabs',
                            'items',
                            'attributes',
                            'item_criteria_templates',
                            'random_attribute_templates',
                            'lootlist_job_template_definitions',
                            'item_sets',
                            'client_loot_lists',
                            'revolving_loot_lists',
                            'recipes',
                            'achievement_rewards',
                            'attribute_controlled_attached_particles',
                            'armory_data',
                            'item_levels',
                            'kill_eater_score_types',
                            'mvm_maps',
                            'mvm_tours',
                            'matchmaking_categories',
                            'maps',
                            'master_maps_list',
                            'steam_packages',
                            'string_lookups',
                            'community_market_item_remaps',
                            'war_definitions'
                        ]
                    }
                }
            }
        },
        (req, reply) => {
            // @ts-ignore
            if (req.params?.key === undefined) {
                return reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'params of "key" MUST be defined'
                    });
            }

            // @ts-ignore
            const key = req.params.key;

            const value =
                SchemaManager.schemaManager.schema.raw.items_game[key];
            if (value === undefined) {
                return reply
                    .code(404)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: `Cannot find value of ${key} key in raw.items_game`
                    });
            }

            log.info(`Got GET /raw/items_game/${key} request`);
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({
                    success: true,
                    value
                });
        }
    );
}
