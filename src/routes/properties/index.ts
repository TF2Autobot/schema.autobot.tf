import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';
import { CharacterClasses } from '@tf2autobot/tf2-schema';

const properties: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '/qualities',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Qualities',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.qualities);
        }
    );

    app.get(
        '/killstreaks',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Killstreaks',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
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
        '/effects',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Effects',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.effects);
        }
    );

    app.get(
        '/paintkits',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Paintkits (War Paints)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.paintkits);
        }
    );

    app.get(
        '/wears',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Wears',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
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
        '/crateseries',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Crate Series',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.crateSeriesList);
        }
    );

    app.get(
        '/paints',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Paints',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.paints);
        }
    );

    app.get(
        '/strangeParts',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Strange Parts (excluding built-in)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.getStrangeParts());
        }
    );

    app.get(
        '/craftWeapons',
        {
            schema: {
                description: 'Get an array of Team Fortress 2 Craftable Weapons (for trading)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.getCraftableWeaponsForTrading());
        }
    );

    app.get(
        '/uncraftWeapons',
        {
            schema: {
                description: 'Get an array of Team Fortress 2 Uncraftable Weapons (for trading)',
                tags: ['Schema Properties (simplified)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema.getUncraftableWeaponsForTrading());
        }
    );

    const charClass = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy'];

    app.get(
        '/craftWeaponsByClass/:classChar',
        {
            schema: {
                description: 'Get an array of Team Fortress 2 Craftable Weapons (for trading) by Character class',
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
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'params of Character Class MUST be defined'
                });
            }

            // @ts-ignore
            const params = req.params.classChar as string;
            const fixCharClass = params.charAt(0).toUpperCase() + params.slice(1);

            try {
                const weapons = SchemaManager.schemaManager.schema.getWeaponsForCraftingByClass(
                    fixCharClass as CharacterClasses
                );

                return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send(weapons);
            } catch (err) {
                return reply.code(400).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: false,
                    message: 'Invalid Character class.',
                    validChar: charClass
                });
            }
        }
    );
};

export default properties;
