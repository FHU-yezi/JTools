import JianshuResearchTools as jrt
import streamlit as st
import matplotlib.pyplot as plt


def main():
    with st.form("主表单"):
        user_url = st.text_input("用户个人主页 URL")
        display_figure = st.checkbox("显示图表")
        do_query = st.form_submit_button("查询")
    if do_query == True:
        if jrt.IsUserURL(user_url) == False:
            st.error("请输入正确的简书用户主页 URL")
            return  # 停止执行
        status = st.empty()
        status.info("查询中")
        fp = jrt.GetUserFP(user_url)
        ftn = jrt.GetUserFTN(user_url)
        assets = jrt.GetUserAssetsCount(user_url)
        status.success("查询成功！")
        
        st.write("用户总资产：", assets)
        st.write("简书钻数量：", fp)
        st.write("简书贝数量：", ftn)
        
    if display_figure == True:
        st.set_option('deprecation.showPyplotGlobalUse', False)  # 关闭一个警告
        plt.rcParams['font.sans-serif']=['SimHei']  # 用来正常显示中文
        label = ["简书钻", "简书贝"]
        data = [fp, ftn]
        plt.pie(data, labels=label)
        plt.title("用户资产分配饼图")
        fig = plt.show()
        st.pyplot(fig)