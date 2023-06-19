export interface CheckRequest {
    article_url: string;
}

export interface CheckItem {
    name: string;
    item_passed: boolean;
    limit_value: number;
    operator: string;
    actual_value: number;
}

export interface CheckResponse {
    title: string;
    release_time: number;
    release_time_human_readable: string;
    check_passed: boolean;
    check_items: CheckItem[]
}
