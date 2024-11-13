-- date: 2024-11-13
-- description: 初始化

CREATE TYPE enum_tech_stacks_type AS ENUM ('LIBRARY', 'EXTERNAL_SERVICE');
CREATE TYPE enum_tech_stacks_scope AS ENUM ('FRONTEND', 'BACKEND', 'TOOLCHAIN');

CREATE TABLE tech_stacks (
    name TEXT NOT NULL CONSTRAINT pk_tech_stacks_name PRIMARY KEY,
    type enum_tech_stacks_type NOT NULL,
    scope enum_tech_stacks_scope NOT NULL,
    is_self_developed BOOLEAN NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL
);