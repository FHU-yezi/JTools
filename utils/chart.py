import pyecharts.options as opts

ANIMATION_OFF = opts.AnimationOpts(
    animation=False,
)

TOOLBOX_ONLY_SAVE_PNG_WHITE_2X = opts.ToolboxOpts(
    pos_left="5px",
    pos_top="5px",
    feature=opts.ToolBoxFeatureOpts(
        save_as_image=opts.ToolBoxFeatureSaveAsImageOpts(
            type_="png",
            title="下载",
            background_color="#FFFFFF",
            pixel_ratio=2,
        ),
        restore=None,
        data_view=None,
        data_zoom=None,
        magic_type=None,
        brush=None,
    ),
)

JIANSHU_COLOR = "#ea6f5a"

LEGEND_HIIDEN = opts.LegendOpts(
    is_show=False,
)
