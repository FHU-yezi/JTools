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
        restore=None,  # type: ignore
        data_view=None,  # type: ignore
        data_zoom=None,  # type: ignore
        magic_type=None,  # type: ignore
        brush=None,  # type: ignore
    ),
)

JIANSHU_COLOR = "#ea6f5a"

LEGEND_HIDDEN = opts.LegendOpts(
    is_show=False,
)

TOOLTIP_HIDDEN = opts.TooltipOpts(
    is_show=False,
)

LABEL_HIDDEN = opts.LabelOpts(
    is_show=False,
)
