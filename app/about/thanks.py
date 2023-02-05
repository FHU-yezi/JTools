from typing import Any, Dict, List, Tuple

from pywebio.output import put_markdown
from yaml import safe_load as yaml_load

from utils.html import link
from widgets.card import put_debug_project_record_card

NAME: str = "鸣谢"
DESC: str = "本服务的贡献者和开源库列表。"


THANKS_DATA: Dict[str, Any] = yaml_load(
    open("./thanks.yaml", encoding="utf-8"),  # noqa
)
USER_TO_TOTAL_AWARD: Dict[Tuple[str, str], int] = {}


for item in THANKS_DATA["debug_project_records"]:
    user_name_url: Tuple[str, str] = (item["user_name"], item["user_url"])

    if user_name_url not in USER_TO_TOTAL_AWARD:
        USER_TO_TOTAL_AWARD[user_name_url] = item["award"]
    else:
        USER_TO_TOTAL_AWARD[user_name_url] += item["award"]

# 按照获得的奖励总数倒序排列
USER_TO_TOTAL_AWARD = dict(
    sorted(
        USER_TO_TOTAL_AWARD.items(),
        key=lambda x: x[1],
        reverse=True,
    )
)


def thanks() -> None:
    put_markdown("## 贡献者")

    contributors_data: List[str] = []
    for (user_name, user_url), total_award in USER_TO_TOTAL_AWARD.items():
        contributors_data.append(
            f"- {link(user_name, user_url, new_window=True)}"
            f"（获得奖励 {total_award} 简书贝）"
        )
    put_markdown("\n".join(contributors_data), sanitize=False)

    put_markdown("## 开源库")

    opensource_packages_data: List[str] = [
        f"- {link(package_name, github_url, new_window=True)}"
        for package_name, github_url in THANKS_DATA["opensource_packages"].items()
    ]
    put_markdown("\n".join(opensource_packages_data))

    put_markdown("## 「捉虫计划」反馈记录")

    # thanks.yaml 文件中是正序记录，此处应倒序展示
    for item in reversed(THANKS_DATA["debug_project_records"]):
        put_debug_project_record_card(
            time=item["time"],
            type_=item["type"],
            module=item["module"],
            desc=item["desc"],
            user_name=item["user_name"],
            user_url=item["user_url"],
            award=item["award"],
        )
