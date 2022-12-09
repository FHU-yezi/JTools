from typing import Any, Dict, List

from pywebio.output import Output, put_html


def put_table(data: List[Dict[Any, Any]]) -> Output:
    # 强制表格中的内容单行显示
    html_text: List[str] = [
        '<div class="table-responsive"><table class="table" style="white-space: nowrap;">'
    ]

    headers = list(data[0])
    html_text.append('<thead class="thead-light"><tr>')
    for hedaer in headers:
        html_text.append(f'<th scope="col">{hedaer}</th>')
    html_text.append("</thead></tr>")

    html_text.append("<tbody>")
    for row in data:
        html_text.append("<tr>")
        for index, item in enumerate(row.values()):
            if index == 0:
                html_text.append(f'<th scope="row">{item}</th>')
            else:
                html_text.append(f"<td>{item}</td>")
        html_text.append("</tr>")
    html_text.append("</tbody></table></div>")

    return put_html("".join(html_text), sanitize=False)
