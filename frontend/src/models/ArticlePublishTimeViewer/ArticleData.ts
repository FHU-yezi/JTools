export interface ArticleDataRequest {
  article_url: string;
}

export interface ArticleDataRqsponse {
  title: string;
  is_updated: boolean;
  publish_time: number;
  publish_time_to_now_human_readable: string;
  update_time: number;
  update_time_to_now_human_readable: string;
}
