from re import findall, search, sub

from config_manager import Config
from pywebio.output import (put_button, put_markdown, scroll_to, toast,
                            use_scope)
from pywebio.pin import pin, put_textarea

from .utils import SetFooter

# 这些字符无论输入多少次，都不计入字数统计
NOT_COUNTING_CHARS = ("`", "~", "!", "@", "#", "$", "%", "^",
                      "&", "*", "(", ")", "+", "[", "]", ";",
                      "'", ",", ".", "/", "?", "\"", "{", "}",
                      "（", "）", "-", " ")

# 这些字符如果重复输入多次，只算作一个字
# 包含英文字母和数字
COUNTING_ONE_TIME_CHARS = ("_", "[a-zA-z]", "[0-9]")

TEXT_TO_REPLACE = "ꞏ"  # 只算作一个字的字符将被替换成该字符，以便统计

# 这些字符不应该出现在文章中（例如零宽空格）
DISLIKE_CHARS = ("​", "‌", "‍", "‎", "‏")


def OnStatisticsButtonClicked():
    text = pin.text

    if not text:
        toast("请输入文本", color="error")
        return

    text = text.replace("\n", "")  # 去除换行符

    TotalCharsCount = len(text)

    MarkdownIgnoredChars = 0  # Markdown 语法中的被忽略字符数
    MarkdownTextChars = 0  # Markdown 语法中实际计入的字符数

    MarkdownImages = findall(r"!\[.*?\]\(.*?\)", text)  # 查找 Markdown 中的图片
    for image in MarkdownImages:
        text = text.replace(image, "")
        find_result = search(r"\[(?P<result>.+)\]", image)
        if find_result:
            find_result = find_result.group("result")
        MarkdownIgnoredChars += len(image)
        if find_result:
            for char in NOT_COUNTING_CHARS:
                find_result = find_result.replace(char, "")
            MarkdownTextChars += len(find_result)

    MarkdownUrls = findall(r"\[.*?\]\(.*?\)", text)  # 查找 Markdown 中的链接

    for url in MarkdownUrls:
        text = text.replace(url, "")
        find_result = search(r"\[(?P<result>.+)\]", url)
        if find_result:
            find_result = find_result.group("result")
        MarkdownIgnoredChars += len(url)
        if find_result:
            for char in NOT_COUNTING_CHARS:
                find_result = find_result.replace(char, "")
            MarkdownTextChars += len(find_result)

    NotCountingCharsCount = sum(text.count(char) for char in NOT_COUNTING_CHARS)
    CountingOneTimeCharsCount = 0  # 仅计算一次的字符个数
    RealCountCharsCount = 0  # 这些字符实际计入的字符数
    text_copy = text[:]  # 创建字符串的副本
    for char in COUNTING_ONE_TIME_CHARS:
        text_copy = sub(char, TEXT_TO_REPLACE, text_copy)  # 将所有只出现一次的字符替换成占位符

    find_result = [x for x in findall(f"{TEXT_TO_REPLACE}+", text_copy) if len(x) > 1]  # 如果该字符仅出现一次，将其忽略
    CountingOneTimeCharsCount += len("".join(find_result))  # 将查找结果进行合并，获取其长度
    RealCountCharsCount += len(find_result)

    # DislikeCharsCount = sum(text.count(char) for char in DISLIKE_CHARS)
    WordageInJianshu = (TotalCharsCount - NotCountingCharsCount
                        - CountingOneTimeCharsCount - MarkdownIgnoredChars
                        + MarkdownTextChars + RealCountCharsCount)

    toast("统计完成", color="success")
    with use_scope("output", clear=True):
        put_markdown(f"""
        # 字数统计信息
        总字符数：{TotalCharsCount}
        不计入统计的字符数：{NotCountingCharsCount}
        仅计算一次的字符数：{CountingOneTimeCharsCount} -> {RealCountCharsCount}
        Markdown 语法字符数：{MarkdownIgnoredChars} -> {MarkdownTextChars}
        **简书内显示的字数：{WordageInJianshu}**
        """)

    scroll_to("output")  # 滚动到输出区域


def WordageStatisticsTool():
    """文章字数统计工具"""

    put_markdown("""
    # 文章字数统计工具
    提供文章字数统计与建议。
    使用 Markdown 撰写文章，可获得更多维度统计数据。
    """)

    put_textarea("text", label="文章内容", rows=12, placeholder="在此处输入文章内容...")
    put_button("统计字数信息", OnStatisticsButtonClicked)

    SetFooter(Config()["service_pages_footer"])
