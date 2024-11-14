-- date: 2024-11-14
-- description: 添加 article_earning_ranking_records author_slug 索引

CREATE INDEX CONCURRENTLY idx_article_earning_ranking_records_author_slug ON article_earning_ranking_records (author_slug);