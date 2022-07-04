type stringNumber = string;

export interface EconItem {
    appid: number;
    contextid?: stringNumber;
    assetid?: stringNumber;
    id?: stringNumber;
    classid?: stringNumber;
    instanceid?: stringNumber;
    amount?: stringNumber;
    pos?: number;
    missing?: boolean;
    currency?: number;
    background_color?: string;
    icon_url?: string;
    icon_url_large?: string;
    descriptions: EconDescription[];
    tradable: number;
    actions: EconAction[];
    fraudwarnings: string[];
    name: string;
    name_color: string;
    type: string;
    market_name: string;
    market_hash_name: string;
    market_actions: EconAction[];
    commodity: number;
    market_tradable_restriction: number;
    market_marketable_restriction: number;
    marketable: number;
    tags: EconTags[];
    app_data?: Record<string, any>;
    owner_descriptions?: string;
    owner_actions?: string;
}

export interface EconDescription {
    value: string;
    color?: string;
    app_data?: EconAppData;
}

export interface EconAppData {
    def_index?: stringNumber;
    quality?: string;
    limited?: string;
    slot?: string;
    filter_data?: EconAppDataFilterData;
    player_class_ids?: EconAppDataPlayerClassIds;
    highlight_color?: string;
}

// not sure what is this for
export interface EconAppDataFilterData {
    [id: number]: {
        element_ids: {
            [id: number]: stringNumber;
        };
    };
}

export interface EconAppDataPlayerClassIds {
    [id: number]: stringNumber;
}

export interface EconAction {
    link: string;
    name: string;
}

export interface EconTags {
    internal_name: string;
    name: string;
    category: string;
    color?: string;
    category_name: string;
    localized_tag_name?: string;
    localized_category_name?: string;
}
