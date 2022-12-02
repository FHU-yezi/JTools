from pywebio.output import put_widget


def put_app_card(name: str, status_color: str, status_text: str, url: str, desc: str) -> None:
    tpl: str = """
    <div class="card" style="padding: 20px; margin-bottom: 20px; border-radius: 20px;">
        <b style="font-size: 20px; padding-bottom: 15px;">{{name}}</b>
        <p>状态：<font color="{{status_color}}">{{status_text}}</font></p>
        <p>{{desc}}</p>
        <button class="btn btn-outline-secondary" style="position: absolute; right: 30px;" onclick="window.open('{{url}}', '_blank')" {{disabled}}>&gt;</button>
    </div>
    """
    return put_widget(
        tpl,
        {
            "name": name,
            "status_color": status_color,
            "status_text": status_text,
            "desc": desc,
            "url": url if status_text != "暂停服务" else "",
            "disabled": "disabled" if status_text == "暂停服务" else "",
        },
    )
