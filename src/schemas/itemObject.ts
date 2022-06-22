export const itemObject = {
    $id: 'itemObject',
    type: 'object',
    required: ['defindex', 'quality'],
    properties: {
        defindex: {
            type: 'number'
        },
        quality: {
            type: 'number'
        },
        craftable: {
            type: 'boolean',
            default: true
        },
        tradable: {
            type: 'boolean',
            default: true
        },
        killstreak: {
            type: 'number',
            default: 0
        },
        australium: {
            type: 'boolean',
            default: false
        },
        effect: {
            type: 'number',
            default: null,
            nullable: true
        },
        festive: {
            type: 'boolean',
            default: false
        },
        paintkit: {
            type: 'number',
            default: null,
            nullable: true
        },
        wear: {
            type: 'number',
            default: null,
            nullable: true
        },
        quality2: {
            type: 'number',
            default: null,
            nullable: true
        },
        craftnumber: {
            type: 'number',
            default: null,
            nullable: true
        },
        crateseries: {
            type: 'number',
            default: null,
            nullable: true
        },
        target: {
            type: 'number',
            default: null,
            nullable: true
        },
        output: {
            type: 'number',
            default: null,
            nullable: true
        },
        outputQuality: {
            type: 'number',
            default: null,
            nullable: true
        },
        paint: {
            type: 'number',
            default: null,
            nullable: true
        }
    }
};
