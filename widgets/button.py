from typing import Any, Callable

from pywebio.output import Output, OutputPosition
from pywebio.output import put_button as _put_button
from pywebio.session import run_js


def put_button(
    label: str,
    onclick: Callable[[], None],
    color: str,
    block: bool = False,
    small: bool = False,
    outline: bool = False,
    link_style: bool = False,
    disabled: bool = False,
    scope: Any = None,
    position: int = OutputPosition.BOTTOM,
) -> Output:
    button = _put_button(
        label=label,
        onclick=onclick,
        color=color,
        small=small,
        link_style=link_style,
        outline=outline,
        disabled=disabled,
        scope=scope,
        position=position,
    )
    if block:
        # 通过 JS 为按钮添加 btn-block 类
        run_js(
            """
            $(document).ready(
                function(e){
                    $("button:contains(\'%s\')")[0].className += " btn-block"
                }
            )
            """ % label,
        )
    return button
