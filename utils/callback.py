from typing import Callable, Any
from pywebio.session import run_js
from pywebio.io_ctrl import output_register_callback as get_callback_id


def bind_enter_key_callback(pin_name: str, on_press: Callable[[Any], None]) -> None:
    callback_id = get_callback_id(on_press)
    run_js("""
    $(document).ready(function(e){
        $(this).keydown(function (e){
            if(e.which == "13"){
                var focusActId = document.activeElement.id;
                    if(focusActId.startsWith(pin_name)){
                        WebIO.pushData(null, callback_id)
                    }
                }
            })
        });
    """, pin_name=pin_name, callback_id=callback_id)
