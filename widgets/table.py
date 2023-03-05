from typing import Any, Dict, List

from pywebio.output import Output, put_html


def put_table(data: List[Dict[Any, Any]]) -> Output:
    headers = list(data[0])
    html_text: List[str] = [
        '<div class="table-responsive"><table class="table" style="white-space: nowrap;">',
        '<thead class="thead-light"><tr>',
    ]
    html_text.extend(f'<th scope="col">{hedaer}</th>' for hedaer in headers)
    html_text.extend(("</thead></tr>", "<tbody>"))

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
