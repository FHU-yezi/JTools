-- date: 2024-11-13
-- description: 初始化

CREATE ROLE jtools LOGIN PASSWORD 'jtools';

CREATE DATABASE jtools WITH OWNER = jtools;

GRANT CONNECT ON DATABASE jtools TO jtools;
GRANT CONNECT ON DATABASE jianshu TO jtools;
GRANT CONNECT ON DATABASE jpep TO jtools;