-- date: 2024-11-13
-- description: 初始化

CREATE TABLE debug_project_records (
    id SMALLSERIAL CONSTRAINT pk_debug_project_records_id PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_slug VARCHAR(12) NOT NULL,
    reward SMALLINT NOT NULL
);