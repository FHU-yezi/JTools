-- date: 2024-11-13
-- description: 初始化

CREATE TYPE enum_tools_status AS ENUM ('NORMAL', 'DOWNGRADED', 'UNAVAILABLE');

CREATE TABLE tools (
    slug TEXT CONSTRAINT pk_tools_slug PRIMARY KEY,
    status enum_tools_status NOT NULL,
    status_description TEXT,
    data_update_freq TEXT NOT NULL,
    last_update_time_table TEXT,
    last_update_time_order_by TEXT,
    last_update_time_target_field TEXT,
    data_count_table TEXT,
    data_source JSONB
);