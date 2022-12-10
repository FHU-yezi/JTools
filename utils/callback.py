from typing import Any, Callable

from pywebio.io_ctrl import output_register_callback as get_callback_id
from pywebio.session import run_js


def bind_enter_key_callback(pin_name: str, on_press: Callable[[Any], None]) -> None:
    callback_id = get_callback_id(on_press)
    run_js(
        """
        $("input[name=\'%s\']").keyup(function(e){
            if(e.which == "13"){
                console.log(e.which)
                WebIO.pushData(null, callback_id)
            }
        });
        """
        % pin_name,
        pin_name=pin_name,
        callback_id=callback_id,
    )
