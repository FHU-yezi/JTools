from re import findall, search, sub

from pywebio import pin
from pywebio.output import (put_button, put_markdown, scroll_to, toast,
                            use_scope)

from .utils import LinkInHTML, SetFooter


def WordageStatisticsTool():
    """文章字数统计工具"""

    # 这些字符无论输入多少次，都不计入字数统计
    NotCountingChars = ("`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "[", "]", ";", "'", ",", ".", "/", "?", "\"", "{", "}", "（", "）", "-", " ")

    # 这些字符如果重复输入多次，只算作一个字
    # 包含英文字母和数字
    CountingOneTimeChars = ("_", "[a-zA-z]", "[0-9]")

    TextToReplace = "ꞏ"  # 只算作一个字的字符将被替换成该字符，以便统计

    # 这些字符不应该出现在文章中（例如零宽空格）
    DislikeChars = ("​", "‌", "‍", "‎", "‏")

    def StatisticsWordage():
        text = pin.pin["text"]  # 定义局部变量引用，提高性能

        while "\n" in text:
            text = text.replace("\n", "")  # 去除换行符

        if not text:
            toast("请输入文本", color="error")
            return  # 发生错误，不再运行后续逻辑

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
                for char in NotCountingChars:
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
                for char in NotCountingChars:
                    find_result = find_result.replace(char, "")
                MarkdownTextChars += len(find_result)

        NotCountingCharsCount = 0
        for char in NotCountingChars:
            NotCountingCharsCount += text.count(char)

        CountingOneTimeCharsCount = 0  # 仅计算一次的字符个数
        RealCountCharsCount = 0  # 这些字符实际计入的字符数
        text_copy = text[:]  # 创建字符串的副本
        for char in CountingOneTimeChars:
            text_copy = sub(char, TextToReplace, text_copy)  # 将所有只出现一次的字符替换成占位符

        find_result = [x for x in findall(f"{TextToReplace}+", text_copy) if len(x) > 1]  # 如果该字符仅出现一次，将其忽略
        CountingOneTimeCharsCount += len("".join(find_result))  # 将查找结果进行合并，获取其长度
        RealCountCharsCount += len(find_result)

        DislikeCharsCount = 0
        for char in DislikeChars:
            DislikeCharsCount += text.count(char)

        WordageInJianshu = (TotalCharsCount - NotCountingCharsCount - CountingOneTimeCharsCount - MarkdownIgnoredChars + MarkdownTextChars + RealCountCharsCount)

        toast("统计完成", color="success")
        with use_scope("output", if_exist="remove"):
            put_markdown(f"""
            # 字数统计信息
            总字符数：{TotalCharsCount}
            不计入统计的字符数：{NotCountingCharsCount}
            仅计算一次的字符数：{CountingOneTimeCharsCount} -> {RealCountCharsCount}
            Markdown 语法字符数：{MarkdownIgnoredChars} -> {MarkdownTextChars}
            **简书内显示的字数：{WordageInJianshu}**

            """, lstrip=True)

        scroll_to("output")

    put_markdown("""
    # 文章字数统计工具
    提供文章字数统计与建议。
    使用 Markdown 撰写文章，可获得更多统计维度数据。
    """, lstrip=True)

    pin.put_textarea("text", label="文章内容", rows=12, placeholder="在此处输入...")
    put_button("统计", StatisticsWordage)

    SetFooter(f"Powered By \
              {LinkInHTML('JRT', 'https://github.com/FHU-yezi/JianshuResearchTools/')} \
              and {LinkInHTML('PyWebIO', 'https://github.com/pywebio/PyWebIO')}")
