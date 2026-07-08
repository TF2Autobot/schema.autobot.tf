import SKU from '@tf2autobot/tf2-sku';
import { EconItem } from '../../types/EconItem';
import url from 'url';
import { fixItem } from './fixItem';
import { Schema } from '@tf2autobot/tf2-schema';
import SchemaManager from '../../classes/SchemaManager';
import { Item } from 'src/types/TeamFortress2';

let isCrate = false;
let isPainted = false;
let replaceQualityTo11 = false;
let replaceQualityTo15 = false;

let defindex = null;
let quality = null;
let killstreak = null;
let wear = null;
let paintkit = null;

export default function parseEcon(
    econ: EconItem,
    schema: Schema,
    normalizeFestivizedItems: boolean,
    normalizeStrangeAsSecondQuality: boolean,
    normalizePainted: boolean
): { sku: string; isPainted: boolean; item?: Item } {
    isCrate = false;
    isPainted = false;
    replaceQualityTo11 = false;
    replaceQualityTo15 = false;

    defindex = null;
    quality = null;
    killstreak = null;
    wear = null;
    paintkit = null;

    if (econ.appid != 440) {
        if (econ.type && econ.market_name) {
            return {
                sku: `${econ.type}: ${econ.market_name}`,
                isPainted: false
            };
        }

        return { sku: 'unknown', isPainted: false };
    }

    if (!econ.market_hash_name) {
        throw new Error(
            `Item ${econ.id} does not have the "market_hash_name" key, unable to correctly identify the item`
        );
    }

    let item = Object.assign(
        {
            defindex: getDefindex(econ),
            quality: getQuality(econ, schema),
            craftable: isCraftable(econ),
            killstreak: getKillstreak(econ),
            australium: isAustralium(econ),
            festive: isFestive(econ, normalizeFestivizedItems),
            effect: getEffect(econ, schema),
            wear: getWear(econ),
            paintkit: getPaintKit(econ, schema),
            quality2: getElevatedQuality(econ, schema, normalizeStrangeAsSecondQuality),
            crateseries: getCrateSeries(econ),
            paint: getPainted(econ, normalizePainted),
            craftnumber: getCraftNumber(econ, schema)
        },
        getOutput(econ, schema)
    );

    if (item.target === null) {
        item.target = getTarget(econ, schema);
    }

    if (replaceQualityTo15) {
        item.quality = 15;
    }

    if (replaceQualityTo11) {
        item.quality = 11;
    }

    // Add missing properties, except if crates
    if (!isCrate) {
        item = fixItem(SKU.fromString(SKU.fromObject(item)), schema);
    }

    if (item === null) {
        throw new Error('Unknown sku for item "' + econ.market_hash_name + '"');
    }

    return { sku: SKU.fromObject(item), isPainted, item };
}

/**
 * Gets the defindex of an item
 * @param item -Item object
 */
function getDefindex(item: EconItem) {
    if (item.app_data !== undefined) {
        defindex = parseInt(item.app_data.def_index, 10);
        return defindex;
    }

    const link = getAction(item, 'Item Wiki Page...');
    if (link !== null) {
        defindex = parseInt(url.parse(link, true).query.id.toString(), 10);
        return defindex;
    }

    // Last option is to get the name of the item and try and get the defindex that way

    return null;
}

/**
 * Gets the quality of an item
 * @param item - Item object
 */
function getQuality(item: EconItem, schema: Schema) {
    if (item.app_data !== undefined) {
        quality = parseInt(item.app_data.quality, 10);
        return quality;
    }

    const qualityFromTag = getItemTag(item, 'Quality');
    if (qualityFromTag !== null) {
        quality = schema.getQualityIdByName(qualityFromTag);
        return quality;
    }

    return null;
}

/**
 * Determines if the item is craftable
 * @param item - Item object
 */
function isCraftable(item: EconItem) {
    return !hasDescription(item, '( Not Usable in Crafting )');
}

/**
 * Gets the killstreak tier of an item
 * @param item - Item object
 */
function getKillstreak(item: EconItem) {
    const killstreaks = ['Professional ', 'Specialized ', ''];

    const index = killstreaks.findIndex(killstreak => item.market_hash_name.includes(killstreak + 'Killstreak '));

    killstreak = index === -1 ? 0 : 3 - index;
    return killstreak;
}

/**
 * Determines if the item is australium
 * @param item - Item object
 */
function isAustralium(item: EconItem) {
    if (quality !== 11) {
        return false;
    }

    return item.market_hash_name.includes('Australium ');
}

/**
 * Determines if the item is festivized
 * @param item - Item object
 * @param normalizeFestivizedItems - toggle normalize festivized
 *
 */
function isFestive(item: EconItem, normalizeFestivizedItems = false) {
    return !normalizeFestivizedItems && item.market_hash_name.includes('Festivized ');
}

/**
 * Gets the effect of an item
 * @param item - Item object
 */
function getEffect(item: EconItem, schema: Schema) {
    if (!Array.isArray(item.descriptions)) {
        return null;
    }

    if (item.descriptions.some(description => description.value === 'Case Global Unusual Effect(s)')) {
        return null;
    }

    const effects = item.descriptions.filter(description => description.value.startsWith('★ Unusual Effect: '));
    if (effects.length !== 1) {
        return null;
    }

    return schema.getEffectIdByName(effects[0].value.substring(18));
}

/**
 * Gets the wear of an item
 * @param item - Item object
 */
function getWear(item: EconItem) {
    const itemWear = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle Scarred'].indexOf(
        getItemTag(item, 'Exterior')
    );

    wear = itemWear === -1 ? null : itemWear + 1;
    return wear;
}

/**
 * Get skin from item
 * @param item - Item object
 */
function getPaintKit(item: EconItem, schema: Schema) {
    if (wear === null) {
        return null;
    }

    if (!Array.isArray(item.descriptions)) {
        return null;
    }

    let hasCaseCollection = false;
    let skin = null;

    const descriptionsCount = item.descriptions.length;

    for (let i = 0; i < descriptionsCount; i++) {
        if (!hasCaseCollection && item.descriptions[i].value.endsWith('Collection')) {
            hasCaseCollection = true;
        } else if (
            hasCaseCollection &&
            (item.descriptions[i].value.startsWith('✔') || item.descriptions[i].value.startsWith('★'))
        ) {
            skin = item.descriptions[i].value.substring(1).replace(' War Paint', '').trim();
            break;
        }
    }

    if (skin === null) {
        if (hasCaseCollection && item.market_hash_name?.includes('Red Rock Roscoe Pistol')) {
            paintkit = 0;
            return paintkit;
        }

        return null;
    }

    if (skin.includes('Mk.I')) {
        paintkit = schema.getSkinIdByName(skin);
        return paintkit;
    }

    const schemaItem = schema.getItemByDefindex(defindex);
    // Remove weapon from skin name
    if (schemaItem !== null) {
        skin = skin.replace(schemaItem.item_type_name, '').trim();
    }

    paintkit = schema.getSkinIdByName(skin);
    return paintkit;
}

/**
 * Gets the elevated quality of an item
 * @param item - Item object
 * @param normalizeStrangeAsSecondQuality - toggle strange unusual normalization
 */
function getElevatedQuality(item: EconItem, schema: Schema, normalizeStrangeAsSecondQuality = false) {
    const isNotNormalized = !normalizeStrangeAsSecondQuality;
    const quality = getQuality(item, schema);

    const isUnusualHat =
        getItemTag(item, 'Type') === 'Cosmetic' &&
        quality === 5 &&
        item.type?.includes('Strange') &&
        item.type?.includes('Points Scored');
    const isOtherItemsNotStrangeQuality = item.type?.startsWith('Strange') && quality !== 11;

    if (
        hasDescription(item, 'Strange Stat Clock Attached') ||
        ((isUnusualHat || isOtherItemsNotStrangeQuality) && isNotNormalized)
    ) {
        if (typeof paintkit === 'number') {
            const hasRarityGradeTag = item.tags?.some(
                tag => tag.category === 'Rarity' && tag.category_name === 'Grade'
            );
            const hasWarPaintTypeTag = getItemTag(item, 'Type') === 'War Paint';

            if (hasWarPaintTypeTag || !hasRarityGradeTag) {
                replaceQualityTo11 = true;
                return null;
            } else if (hasRarityGradeTag && quality === 11) {
                replaceQualityTo15 = true;
                return 11;
            }
        }
        return 11;
    } else {
        return null;
    }
}

function getOutput(item: EconItem, schema: Schema) {
    if (!Array.isArray(item.descriptions)) {
        return null;
    }

    let index = -1;

    const descriptionsCount = item.descriptions.length;

    for (let i = 0; i < descriptionsCount; i++) {
        if (
            item.descriptions[i].value ==
            'You will receive all of the following outputs once all of the inputs are fulfilled.'
        ) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        return {
            target: null,
            output: null,
            outputQuality: null
        };
    }

    const output = item.descriptions[index + 1].value;

    let target = null;
    let outputQuality = null;
    let outputDefindex = null;

    if (killstreak !== 0) {
        // Killstreak Kit Fabricator

        const name = output
            .replace(['Killstreak', 'Specialized Killstreak', 'Professional Killstreak'][killstreak - 1], '')
            .replace('Kit', '')
            .trim();

        target = schema.getItemByItemName(name).defindex;
        outputQuality = 6;
        outputDefindex = [6527, 6523, 6526][killstreak - 1];
    } else if (output.includes(' Strangifier')) {
        // Strangifier Chemistry Set

        const name = output.replace('Strangifier', '').trim();

        target = schema.getItemByItemName(name).defindex;
        outputQuality = 6;
        outputDefindex = 6522;
    } else if (output.includes("Collector's")) {
        // Collector's Chemistry Set

        const name = output.replace("Collector's", '').trim();

        outputQuality = 14;
        outputDefindex = schema.getItemByItemName(name).defindex;
    }

    return {
        target: target,
        output: outputDefindex,
        outputQuality: outputQuality
    };
}

function getTarget(item: EconItem, schema: Schema) {
    if (defindex === null) {
        throw new Error('Could not get defindex of item "' + item.market_hash_name + '"');
    }

    if (item.market_hash_name.includes('Strangifier')) {
        // Strangifiers
        const gameItem = schema.raw.items_game.items[defindex];

        if (gameItem.attributes !== undefined && gameItem.attributes['tool target item'] !== undefined) {
            return parseInt(gameItem.attributes['tool target item'].value, 10);
        } else if (gameItem.static_attrs !== undefined && gameItem.static_attrs['tool target item'] !== undefined) {
            return parseInt(gameItem.static_attrs['tool target item'], 10);
        }

        // Get schema item using market_hash_name
        const schemaItem = schema.getItemByItemName(item.market_hash_name.replace('Strangifier', '').trim());

        if (schemaItem !== null) {
            return schemaItem.defindex;
        }

        throw new Error('Could not find target for item "' + item.market_hash_name + '"');
    }

    const itemHashNameLength = item.market_hash_name.length;

    if (
        [
            6527, // general
            5726, // Rocket Launcher
            5727, // Scattergun
            5728, // Sniper Rifle
            5729, // Shotgun
            5730, // Ubersaw
            5731, // GRU
            5732, // Spy-cicle
            5733, // Axtinguisher
            5743, // Sticky Launcher
            5744, // Minigun
            5745, // Direct Hit
            5746, // Huntsman
            5747, // Backburner
            5748, // Backscatter
            5749, // Kritzkrieg
            5750, // Ambassador
            5751, // Frontier Justice
            5793, // Flaregun
            5794, // Wrench
            5795, // Revolver
            5796, // Machina
            5797, // Baby Face Blaster
            5798, // Huo Long Heatmaker
            5799, // Loose Cannon
            5800, // Vaccinator
            5801 // Air Strike
        ].includes(defindex)
    ) {
        // Killstreak Kit
        return schema.getItemByItemName(
            item.market_hash_name
                .substring(10, itemHashNameLength - 3)
                .replace('Killstreak', '')
                .trim()
        ).defindex;
    } else if (defindex === 6523) {
        // Specialized Killstreak Kit
        return schema.getItemByItemName(item.market_hash_name.substring(22, itemHashNameLength - 3).trim()).defindex;
    } else if (defindex === 6526) {
        // Professional Killstreak Kit
        return schema.getItemByItemName(item.market_hash_name.substring(23, itemHashNameLength - 3).trim()).defindex;
    } else if (defindex === 9258) {
        // Unusualifier
        return schema.getItemByItemName(item.market_hash_name.substring(7, itemHashNameLength - 12).trim()).defindex;
    }

    return null;
}

/**
 * Gets crate series of Mann Co. Supply Crate
 * @param item - Item object
 */
function getCrateSeries(item: EconItem) {
    if (!item.market_hash_name.includes('Mann Co. Supply Crate Series #')) {
        return null;
    }

    if (![5022, 5041, 5045, 5068].includes(defindex)) {
        return null;
    }

    isCrate = true;
    return parseInt(item.market_hash_name.replace('Salvaged ', '').replace('Mann Co. Supply Crate Series #', ''));
}

function getPainted(item: EconItem, normalizePainted = false): number {
    if (normalizePainted) {
        return null;
    }

    if (!Array.isArray(item.descriptions)) {
        return null;
    }

    const descriptions = item.descriptions;
    const descriptionCount = descriptions.length;

    for (let i = 0; i < descriptionCount; i++) {
        if (descriptions[i].value.startsWith('Paint Color: ') && descriptions[i].color === '756b5e') {
            const name = descriptions[i].value.replace('Paint Color: ', '').trim();

            const paintDecimal = SchemaManager.schemaManager.schema.paints[name];
            isPainted = true;
            return paintDecimal;
        }
    }

    if (!item.type?.includes('Tool') && item.icon_url?.includes('SLcfMQEs5nqWSMU5OD2NwHzHZdmi')) {
        isPainted = true;
        return 5801378;
    }

    return null;
}

function getCraftNumber(item: EconItem, schema: Schema): number {
    if (isCrate) {
        return null;
    }

    const schemaItem = schema.getItemByDefindex(defindex);
    if (schemaItem.item_class === 'supply_crate') {
        return null;
    }

    const name = item.market_hash_name;
    const withoutNumber = name.replace(/#\d+/, '');
    const number = name.substring(withoutNumber.length + 1).trim();

    return parseInt(number);
}

/**
 * Gets an action by name
 * @param action - Action to search for
 */
function getAction(econ: EconItem, action: string) {
    if (!Array.isArray(econ.actions)) {
        return null;
    }

    const match = econ.actions.find(v => v.name === action);

    if (match === undefined) {
        return null;
    } else return match.link;
}

/**
 * Gets a tag by category
 * @param category - Category to search for
 */
function getItemTag(econ: EconItem, category: string) {
    const self = econ;

    if (!Array.isArray(self.tags)) {
        return null;
    }

    const match = self.tags.find(v => v.category === category);

    if (match === undefined) {
        return null;
    } else {
        // localized_tag_name for EconItem and name for CEconItem
        return match.localized_tag_name || match.name;
    }
}

/**
 * Checks if an item has a specific description
 * @param description - Description to search for
 */
function hasDescription(econ: EconItem, description: string) {
    const self = econ;

    if (!Array.isArray(self.descriptions)) {
        return false;
    }

    const has = self.descriptions.some(d => d.value === description);
    return has;
}
