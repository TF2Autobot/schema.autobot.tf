import SchemaTF2 from '@tf2autobot/tf2-schema';
import axios from 'axios';
import log from '../lib/logger';
import { Webhook } from '../types/DiscordWebhook';
import * as timersPromises from 'timers/promises';
import filterAxiosError from '@tf2autobot/filter-axios-error';
import fs from 'fs';
import path from 'path';

const itemGrade = new Map();
itemGrade
    .set('common', 'Civilian Grade')
    .set('uncommon', 'Freelance Grade')
    .set('rare', 'Mercenary Grade')
    .set('mythical', 'Commando Grade')
    .set('legendary', 'Assassin Grade')
    .set('ancient', 'Elite Grade');

export default class SchemaManager {
    static schemaManager: SchemaTF2;

    static defindexes: Record<string, string>;

    private static oldDefindexes: Record<string, string>;

    private static newDefindexes: Record<string, string>;

    private static oldEffects: Record<string, number>;

    private static newEffects: Record<string, number>;

    private static newPaintkits: Record<string, number>;

    private static oldPaintkits: Record<string, number>;

    static itemGrades: Record<string, any>;

    static itemGradeByDefindex: { [defindex: string]: string };

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.schemaManager = new SchemaTF2({
                apiKey: process.env.STEAM_API_KEY,
                updateTime: 5 * 60 * 1000
            });

            this.schemaManager.init(err => {
                if (err) {
                    return reject(err);
                }

                this.setProperties();

                this.schemaManager.on('schema', async () => {
                    this.setProperties();

                    try {
                        await this.checkNewItems();
                        await this.checkNewEffects();
                        await this.checkNewPaintkits();
                    } catch (err) {
                        log.warn('Error while checking for new items/effects/paintkits');
                        log.error(err);
                    }
                });

                setTimeout(() => {
                    if (process.env.LOAD_LOCAL_SCHEMA === 'true') {
                        const data = fs.readFileSync(path.join(__dirname, '../../schema.json'), { encoding: 'utf-8' });
                        // @ts-ignore
                        this.schemaManager.setSchema(JSON.parse(data));
                        this.setProperties();
                        this.oldDefindexes = this.defindexes;
                        this.oldEffects = this.schemaManager.schema.effects;
                        this.oldPaintkits = this.schemaManager.schema.paintkits;
                    }
                }, 1 * 60 * 1000);

                resolve();
            });
        });
    }

    private static setProperties(): void {
        this.setDefindexes();
        this.setItemGrades();
        this.newDefindexes = this.defindexes;
        this.newEffects = this.schemaManager.schema.effects;
        this.newPaintkits = this.schemaManager.schema.paintkits;
    }

    static setDefindexes(): void {
        this.defindexes = this.schemaManager.schema.raw.schema.items.reduce((obj, item) => {
            obj[item.defindex] = item.item_name;
            return obj;
        }, {});
    }

    static setItemGrades(): void {
        // @ts-ignore
        const itemCollections = this.schemaManager.schema.raw.items_game.item_collections as ItemCollections;
        const itemsGameItems = this.schemaManager.schema.raw.items_game.items;
        const obj = {};
        const obj2 = {};

        for (const itemCollection in itemCollections) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    // @ts-ignore
                    itemCollections,
                    itemCollection
                )
            ) {
                continue;
            }

            if (itemCollection.includes('master_collection')) {
                // Ignore Dummy items
                continue;
            }

            for (const grade in itemCollections[itemCollection].items) {
                if (!Object.prototype.hasOwnProperty.call(itemCollections[itemCollection].items, grade)) {
                    continue;
                }

                if (itemGrade.has(grade)) {
                    const displayGrade = itemGrade.get(grade);

                    const items = Object.keys(itemCollections[itemCollection].items[grade]);

                    for (const name of items) {
                        for (const defindex in itemsGameItems) {
                            if (!Object.prototype.hasOwnProperty.call(itemsGameItems, defindex)) {
                                continue;
                            }

                            if (name === itemsGameItems[defindex].name) {
                                if (obj[displayGrade] === undefined) {
                                    obj[displayGrade] = {};
                                }

                                obj[displayGrade][name] = parseInt(defindex);
                                obj2[defindex] = displayGrade;
                            }
                        }
                    }
                }
            }
        }

        obj['count'] = Object.keys(obj).reduce((objc, grade) => {
            objc[grade] = Object.keys(obj[grade]).length;
            return objc;
        }, {});

        this.itemGrades = obj;
        this.itemGradeByDefindex = obj2;
    }

    private static async checkNewItems(): Promise<void> {
        if (this.oldDefindexes === undefined) {
            // first run
            this.oldDefindexes = this.defindexes;
            return;
        }

        const oldDefindexes = Object.keys(this.oldDefindexes);
        const newDefindexes = Object.keys(this.newDefindexes);

        if (newDefindexes.length > oldDefindexes.length) {
            // new items added
            const newItems: { defindex: string; item_name: string }[] = [];
            newDefindexes.forEach(defindex => {
                if (this.oldDefindexes[defindex] === undefined) {
                    newItems.push({ defindex, item_name: this.newDefindexes[defindex] });
                }
            });

            if (process.env.ITEMS_UPDATE_WEBHOOK_URL !== '') {
                // reference: https://github.com/TF2Autobot/tf2autobot/blob/f14f74d44b3fa5417a5e2e2282016b5f7ec56923/src/classes/Commands/sub-classes/Manager.ts#L307-L321

                const limit = 25;
                const newItemsCount = newItems.length;

                if (newItemsCount > limit) {
                    const loops = Math.ceil(newItemsCount / limit);

                    for (let i = 0; i < loops; i++) {
                        const last = loops - i === 1;

                        SchemaManager.enqueueWebhook(
                            this.schemaManager,
                            newItems.slice(i * limit, last ? newItemsCount : (i + 1) * limit)
                        );
                    }
                } else {
                    SchemaManager.enqueueWebhook(this.schemaManager, newItems);
                }
            }
        }

        this.oldDefindexes = this.defindexes;
    }

    private static enqueueWebhook(
        schemaManager: SchemaTF2,
        newItemsArray: { defindex: string; item_name: string }[]
    ): void {
        if (process.env.ITEMS_UPDATE_WEBHOOK_URL !== '') {
            WebhookQueue.enqueue(
                process.env.ITEMS_UPDATE_WEBHOOK_URL,
                'items',
                constructWebhook({
                    title: '__**New item(s) added**__',
                    description:
                        '• ' +
                        newItemsArray
                            .map(item => {
                                let number: string =
                                    schemaManager.schema.raw.items_game.items[item.defindex]?.static_attrs?.[
                                        'set supply crate series'
                                    ];

                                return `[${item.defindex}](https://schema.autobot.tf/getItem/fromDefindex/${
                                    item.defindex
                                }): [${item.item_name}](https://autobot.tf/items/${item.defindex};6${
                                    number ? ';c' + number : ''
                                })`;
                            })
                            .join('\n• '),
                    color: '9171753' // Green
                })
            );
        }
    }

    private static async checkNewEffects(): Promise<void> {
        if (this.oldEffects === undefined) {
            this.oldEffects = this.schemaManager.schema.effects;
            return;
        }

        const oldEffects = Object.keys(this.oldEffects);
        const newEffects = Object.keys(this.newEffects);

        if (newEffects.length > oldEffects.length) {
            // new effects added
            const onlyNewEffects: { id: number; name: string }[] = [];

            newEffects.forEach(effect => {
                if (this.oldEffects[effect] === undefined) {
                    onlyNewEffects.push({ id: this.newEffects[effect], name: effect });
                }
            });

            if (process.env.ITEMS_UPDATE_WEBHOOK_URL !== '') {
                // just use the same link

                WebhookQueue.enqueue(
                    process.env.ITEMS_UPDATE_WEBHOOK_URL,
                    'effects',
                    constructWebhook({
                        title: '__**New particle effect(s) added**__',
                        description:
                            '• ' +
                            onlyNewEffects
                                .map(
                                    effect =>
                                        `[${effect.id}](https://autobot.tf/images/effects/${effect.id}_380x380.png): ${effect.name}`
                                )
                                .join('\n• '),
                        color: '8802476' // Unusual color
                    })
                );
            }
        }

        this.oldEffects = this.schemaManager.schema.effects;
    }

    private static async checkNewPaintkits(): Promise<void> {
        if (this.oldPaintkits === undefined) {
            this.oldPaintkits = this.schemaManager.schema.paintkits;
            return;
        }

        const oldPaintkits = Object.keys(this.oldPaintkits);
        const newPaintkits = Object.keys(this.newPaintkits);

        if (newPaintkits.length > oldPaintkits.length) {
            // new paintkits added
            const onlyNewPaintkits: { id: number; name: string; defindex: string }[] = [];
            const items = this.schemaManager.schema.raw.items_game.items;
            const itemsDefindex = Object.keys(items);
            const itemsDefindexCount = itemsDefindex.length;

            newPaintkits.forEach(paintkit => {
                if (this.oldPaintkits[paintkit] === undefined) {
                    let defindex: string = null;

                    for (let i = 0; i < itemsDefindexCount; i++) {
                        if (`Paintkit ${this.newPaintkits[paintkit]}` === items[itemsDefindex[i]].name) {
                            defindex = itemsDefindex[i];
                            break;
                        }
                    }

                    onlyNewPaintkits.push({
                        id: this.newPaintkits[paintkit],
                        name: paintkit,
                        defindex
                    });
                }
            });

            if (process.env.ITEMS_UPDATE_WEBHOOK_URL !== '') {
                // just use the same link

                WebhookQueue.enqueue(
                    process.env.ITEMS_UPDATE_WEBHOOK_URL,
                    'paintkits',
                    constructWebhook({
                        title: '__**New Paintkit(s)/Texture(s) added**__',
                        description:
                            '• ' +
                            onlyNewPaintkits
                                .map(
                                    paintkit =>
                                        `${
                                            paintkit.defindex !== null
                                                ? `[${paintkit.id}](https://scrap.tf/img/items/warpaint/${paintkit.defindex}_${paintkit.id}_1_0.png)`
                                                : paintkit.id
                                        }: ${paintkit.name}`
                                )
                                .join('\n• '),
                        color: '16711422'
                    })
                );
            }
        }

        this.oldPaintkits = this.schemaManager.schema.paintkits;
    }
}

function constructWebhook({
    title,
    description,
    color
}: {
    title: string;
    description: string;
    color: string;
}): Webhook {
    return {
        username: 'Schema.autobot.tf',
        avatar_url: 'https://autobot.tf/images/tf2autobot.png',
        embeds: [
            {
                title,
                description,
                color,
                footer: {
                    text: `${new Date().toUTCString()} • v${process.env.SERVER_VERSION}`
                }
            }
        ]
    };
}

type WebhookType = 'items' | 'effects' | 'paintkits' | 'skus';

class WebhookQueue {
    private static webhooks: { url: string; type: WebhookType; webhook: Webhook }[] = [];

    private static sleepTime = 5000;

    private static isRateLimited = false;

    private static isProcessing = false;

    static enqueue(url: string, type: WebhookType, webhook: Webhook): void {
        this.webhooks.push({ url, type, webhook });

        this.execute();
    }

    private static execute(): void {
        void this.process().catch(err => {
            // ignore
        });
    }

    private static dequeue(): void {
        this.webhooks.shift();
    }

    private static async process(): Promise<void> {
        const webhook = this.webhooks[0];

        if (webhook === undefined || this.isProcessing === true) {
            return;
        }

        this.isProcessing = true;

        await timersPromises.setTimeout(this.sleepTime);

        if (this.isRateLimited) {
            this.sleepTime = 5000;
            this.isRateLimited = false;
        }

        axios({
            method: 'POST',
            url: webhook.url,
            data: webhook.webhook
        })
            .then(() => {
                this.isProcessing = false;
                this.dequeue();
                this.execute();
            })
            .catch(err => {
                log.warn(`Error sending webhook on new ${webhook.type} update: `, err.message);

                if (err.status === 429) {
                    this.sleepTime = 10000;
                    this.isRateLimited = true;

                    this.isProcessing = false;
                    return this.execute();
                }

                this.isProcessing = false;
                this.dequeue();
                this.execute();
            });
    }
}

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface ItemCollections {
    [collection: string]: Collections;
}

interface Collections {
    name: string;
    description: string;
    is_reference_collection?: string;
    items: CollectionsItemsDummy | CollectionsItems;
}

type internal_grade =
    | 'default'
    | 'common' // Civilian Grade
    | 'uncommon' // Freelance Grade
    | 'rare' // Mercenary Grade
    | 'mythical' // Commando Grade
    | 'legendary' // Assassin Grade
    | 'ancient' // Elite Grade
    | 'immortal' // Heavy update?
    | 'unusual';

interface CollectionsItems {
    [grade: string]: { [name: string]: '10' };
}

interface CollectionsItemsDummy {
    [name: string]: '10';
}
