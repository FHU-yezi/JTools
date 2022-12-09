from typing import Dict, List, Tuple, Union

import pyecharts.options as opts
from pyecharts.charts import Line, Pie, WordCloud
from pyecharts.globals import CurrentConfig

from utils.config import config
from utils.page import get_chart_height, get_chart_width

# 设置 PyEcharts CDN
CurrentConfig.ONLINE_HOST = config.deploy.pyecharts_cdn


def get_line_chart(x: List, y: List, in_tab: bool = False) -> Line:
    return (
        Line(
            init_opts=opts.InitOpts(
                width=f"{get_chart_width(in_tab=in_tab)}px",
                height=f"{get_chart_height()}px",
            )
        )
        .add_xaxis(x)
        .add_yaxis("y", y, is_smooth=True)
    )


def get_pie_chart(data: Dict[str, Union[int, float]], in_tab: bool = False) -> Pie:
    return (
        Pie(
            init_opts=opts.InitOpts(
                width=f"{get_chart_width(in_tab=in_tab)}px",
                height=f"{get_chart_height()}px",
            )
        )
        .add("", tuple(data.items()))
    )


def get_wordcloud(word_freq, size_range: Tuple[int, int], in_tab: bool = False) -> WordCloud:
    return WordCloud(
        init_opts=opts.InitOpts(
            width=f"{get_chart_width(in_tab=in_tab)}px",
            height=f"{get_chart_height()}px",
        )
    ).add(
        series_name="",
        data_pair=word_freq,
        word_size_range=size_range,
    )
