# 部署

## 环境

- Python 3.9+
- MongoDB
- PostgreSQL

## 数据库准备

本服务的部分模块依赖外部数据源 `jianshu` 数据库，您需事先下载并进行导入。

创建用户：

```sql
CREATE ROLE jtools LOGIN PASSWORD 'jtools';
```

创建数据库：

```sql
CREATE DATABASE jtools WITH OWNER = jtools;
CREATE DATABASE logs;
```

创建扩展：

（`jianshu` 数据库）

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

为用户授权：

（`logs` 数据库）

```sql
GRANT CREATE ON SCHEMA public TO jtools;
```

（`jianshu` 数据库）

```sql
GRANT SELECT ON TABLE article_earning_ranking_records TO jtools;
GRANT SELECT ON TABLE lottery_win_records TO jtools;
GRANT SELECT ON TABLE users TO jtools;
```

创建索引：

（`jianshu` 数据库）

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_article_earning_ranking_records_ranking ON article_earning_ranking_records (ranking);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lottery_win_records_time ON lottery_win_records (time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lottery_win_records_user_slug ON lottery_win_records (user_slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lottery_win_records_award_name ON lottery_win_records (award_name);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name ON users USING gin (name gin_trgm_ops);
```

## 配置

复制 `config.example.toml` 文件，将其重命名为 `config.toml`。

```shell
cp config.example.toml config.toml
```

如果您使用 Docker 进行部署：

- mongo.host 填写 `mongodb`
- postgres.host 填写 `postgres`
- uvicorn.host 填写 `0.0.0.0`

同时，您需要填写正确的 `postgres.user` 和 `postgres.password`。

`word_split_access_key` 为具有 [NLP 服务](https://ai.aliyun.com/nlp) 使用权限的阿里云用户 Access Key，您可在 [RAM 访问控制](https://ram.console.aliyun.com) 中创建用户，并为其赋予 `AliyunNLPReadOnlyAccess` 权限。

该项非必填，其内容为空字符串时，「文章词云图」模块不可用。

## 使用 Docker 部署

创建 Docker 网络：

```shell
docker network create mongodb
docker network create postgres
```

您需要在 `mongodb` 网络的 `27017` 端口上运行一个 MongoDB 服务，该服务不开启身份验证。

您需要在 `postgres` 网络的 `5173` 端口上运行一个 PostgreSQL 服务，身份验证相关信息请参考 `部署 - 数据库准备` 一节。

如您希望更换 Docker 网络名称或服务端口号，请同时调整 `config.toml` 中的相关配置。

启动服务：

```shell
docker compose up -d
```

您可在 <http://localhost:8602> 访问服务。

## 传统部署（不推荐）

下载 Python 项目管理工具 [uv](https://github.com/astral-sh/uv)：

```shell
pip install uv
```

安装依赖库（将自动创建虚拟环境）：

```shell
uv install
```

下载前端运行时 [Bun](https://bun.sh/)：

```shell
curl -fsSL https://bun.sh/install | bash
```

安装依赖库：

```shell
bun install
```

您需要在 `27017` 端口上运行一个 MongoDB 服务，该服务不开启身份验证。

您需要在 `5173` 端口上运行一个 PostgreSQL 服务，身份验证相关信息请参考 `部署 - 数据库准备` 一节。

如您希望更换服务端口号，请同时调整 `config.toml` 中的相关配置。

启动后端服务：

```shell
cd backend
uv run main.py
```

启动前端服务：

```shell
cd frontend
bun run dev
```

您可在 <http://localhost:5173> 访问服务。