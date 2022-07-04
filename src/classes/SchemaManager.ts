import SchemaTF2 from '@tf2autobot/tf2-schema';

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

    static itemGrades: Record<string, any>;

    static itemGradeByDefindex: { [defindex: string]: string };

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.schemaManager = new SchemaTF2({
                apiKey: process.env.STEAM_API_KEY,
                updateTime: 5 * 60 * 1000
            });

            this.schemaManager.on('schema', () => {
                this.setDefindexes();
                this.setItemGrades();
            });

            this.schemaManager.init(err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
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

                const items = Object.keys(itemCollections[itemCollection].items[grade]);

                for (const name of items) {
                    for (const defindex in itemsGameItems) {
                        if (!Object.prototype.hasOwnProperty.call(itemsGameItems, defindex)) {
                            continue;
                        }

                        if (name === itemsGameItems[defindex].name) {
                            if (grade === 'common') {
                                if (obj['Civilian Grade'] === undefined) {
                                    obj['Civilian Grade'] = {};
                                }
                                obj['Civilian Grade'][name] = parseInt(defindex);
                            } else if (grade === 'uncommon') {
                                if (obj['Freelance Grade'] === undefined) {
                                    obj['Freelance Grade'] = {};
                                }
                                obj['Freelance Grade'][name] = parseInt(defindex);
                            } else if (grade === 'rare') {
                                if (obj['Mercenary Grade'] === undefined) {
                                    obj['Mercenary Grade'] = {};
                                }
                                obj['Mercenary Grade'][name] = parseInt(defindex);
                            } else if (grade === 'mythical') {
                                if (obj['Commando Grade'] === undefined) {
                                    obj['Commando Grade'] = {};
                                }
                                obj['Commando Grade'][name] = parseInt(defindex);
                            } else if (grade === 'legendary') {
                                if (obj['Assassin Grade'] === undefined) {
                                    obj['Assassin Grade'] = {};
                                }
                                obj['Assassin Grade'][name] = parseInt(defindex);
                            } else if (grade === 'ancient') {
                                if (obj['Elite Grade'] === undefined) {
                                    obj['Elite Grade'] = {};
                                }
                                obj['Elite Grade'][name] = parseInt(defindex);
                            }

                            obj2[defindex] = itemGrade.get(grade);
                        }
                    }
                }
            }
        }

        obj['count'] = {
            'Civilian Grade': obj['Civilian Grade'] ? Object.keys(obj['Civilian Grade']).length : 0,
            'Freelance Grade': obj['Freelance Grade'] ? Object.keys(obj['Freelance Grade']).length : 0,
            'Mercenary Grade': obj['Mercenary Grade'] ? Object.keys(obj['Mercenary Grade']).length : 0,
            'Commando Grade': obj['Commando Grade'] ? Object.keys(obj['Commando Grade']).length : 0,
            'Assassin Grade': obj['Assassin Grade'] ? Object.keys(obj['Assassin Grade']).length : 0,
            'Elite Grade': obj['Elite Grade'] ? Object.keys(obj['Elite Grade']).length : 0
        };

        this.itemGrades = obj;
        this.itemGradeByDefindex = obj2;
    }
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
