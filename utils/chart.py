from typing import List, Tuple

import pyecharts.options as opts
from pyecharts.charts import Line, WordCloud
from pyecharts.globals import CurrentConfig

from utils.config import config
from utils.page import get_chart_height, get_chart_width

# 设置 PyEcharts CDN
CurrentConfig.ONLINE_HOST = config.deploy.pyecharts_cdn


def get_line_chart(x: List, y: List) -> Line:
    return (
        Line(
            init_opts=opts.InitOpts(width=f"{get_chart_width()}px",
                                    height=f"{get_chart_height()}px")
        )
        .add_xaxis(x)
        .add_yaxis("y", y, is_smooth=True)
    )


def get_wordcloud(word_freq, size_range: Tuple[int, int]) -> WordCloud:
    return (
        WordCloud(
            init_opts=opts.InitOpts(width=f"{get_chart_width()}px",
                                    height=f"{get_chart_height()}px")
        )
        .add(series_name="", data_pair=word_freq, word_size_range=size_range)
    )
