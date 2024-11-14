# 部署

## 环境

- Python 3.9+
- PostgreSQL

## 数据库准备

本服务的部分模块依赖外部数据源 `jianshu` 与 `jpep` 数据库，您需事先下载并进行导入。

进入 `sql` 目录：

```shell
cd sql
```

如果您需要修改数据库用户名和密码，请修改 `sql` 目录下的 `0.sql` 和每个子目录下的 `0.sql` 文件。

您需要一个具有创建用户和数据库权限的用户（一般是超级用户）来完成数据库准备。

每个目录中的 SQL 脚本均应按照编号顺序执行。

首先，执行 `sql` 目录下的脚本。

依次切换到与 `sql` 下的子目录（数据库目录）名称相同的数据库中，先执行每个表目录中的 SQL 脚本，再执行数据库目录下的 SQL 脚本。

## 配置

复制 `config.example.toml` 文件，将其重命名为 `config.toml`。

```shell
cp config.example.toml config.toml
```

如果您使用 Docker 进行部署：

- jtools_postgres.host 填写 `postgres`
- jianshu_postgres.host 填写 `postgres`
- jpep_postgres.host 填写 `postgres`
- uvicorn.host 填写 `0.0.0.0`

同时，您需要填写正确的 `{db_name}_postgres.user` 和 `{db_name}_postgres.password`。

`word_split_access_key` 为具有 [NLP 服务](https://ai.aliyun.com/nlp) 使用权限的阿里云用户 Access Key，您可在 [RAM 访问控制](https://ram.console.aliyun.com) 中创建用户，并为其赋予 `AliyunNLPReadOnlyAccess` 权限。

该项非必填，其内容为空字符串时，「文章词云图」模块不可用。

## 使用 Docker 部署

创建 Docker 网络：

```shell
docker network create postgres
```

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