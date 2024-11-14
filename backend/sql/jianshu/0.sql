-- date: 2024-11-13
-- description: 初始化

GRANT SELECT ON TABLE article_earning_ranking_records TO jtools;
GRANT SELECT ON TABLE lottery_win_records TO jtools;
GRANT SELECT ON TABLE users TO jtools;

CREATE EXTENSION pg_trgm;

CREATE INDEX CONCURRENTLY idx_article_earning_ranking_records_ranking ON article_earning_ranking_records (ranking);
CREATE INDEX CONCURRENTLY idx_lottery_win_records_time ON lottery_win_records (time);
CREATE INDEX CONCURRENTLY idx_lottery_win_records_user_slug ON lottery_win_records (user_slug);
CREATE INDEX CONCURRENTLY idx_lottery_win_records_award_name ON lottery_win_records (award_name);
CREATE INDEX CONCURRENTLY idx_users_name ON users USING gin (name gin_trgm_ops);
