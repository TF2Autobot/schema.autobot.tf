const econItemProperties = {
    appid: {
        type: 'number'
    },
    contextid: {
        type: 'string'
    },
    assetid: {
        type: 'string'
    },
    id: {
        type: 'string'
    },
    classid: {
        type: 'string'
    },
    instanceid: {
        type: 'string'
    },
    amount: {
        type: 'string'
    },
    pos: {
        type: 'number'
    },
    missing: {
        type: 'boolean'
    },
    currency: {
        type: 'number'
    },
    background_color: {
        type: 'string'
    },
    icon_url: {
        type: 'string'
    },
    icon_url_large: {
        type: 'string'
    },
    icon_drag_url: {
        type: 'string'
    },
    descriptions: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                value: {
                    type: 'string'
                },
                color: {
                    type: 'string'
                },
                app_data: {
                    type: 'object',
                    properties: {
                        def_index: {
                            type: 'string'
                        }
                    }
                }
            },
            required: ['value']
        }
    },
    tradable: {
        type: 'number'
    },
    actions: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                link: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                }
            }
        }
    },
    fraudwarnings: {
        type: 'array',
        items: {
            type: 'string'
        }
    },
    name: {
        type: 'string'
    },
    name_color: {
        type: 'string'
    },
    type: {
        type: 'string'
    },
    market_name: {
        type: 'string'
    },
    market_hash_name: {
        type: 'string'
    },
    market_actions: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                link: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                }
            }
        }
    },
    commodity: {
        type: 'number'
    },
    market_tradable_restriction: {
        type: 'number'
    },
    market_marketable_restriction: {
        type: 'number'
    },
    marketable: {
        type: 'number'
    },
    tags: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                internal_name: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                },
                category: {
                    type: 'string'
                },
                color: {
                    type: 'string'
                },
                category_name: {
                    type: 'string'
                },
                localized_tag_name: {
                    type: 'string'
                },
                localized_category_name: {
                    type: 'string'
                }
            }
        }
    },
    app_data: {
        type: 'object',
        properties: {
            def_index: {
                type: 'string'
            },
            quality: {
                type: 'string'
            },
            limited: {
                type: 'string'
            },
            slot: {
                type: 'string'
            },
            filter_data: {
                type: 'object'
            },
            player_class_ids: {
                type: 'object'
            },
            highlight_color: {
                type: 'string'
            }
        }
    },
    owner_descriptions: {
        type: 'array'
    },
    owner_actions: {
        type: 'array'
    }
};

export default econItemProperties;
