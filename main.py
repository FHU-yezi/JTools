import streamlit as st

import welcome
import user_assect_query

__version__ = "0.1.0"

features_list = ["欢迎", "用户资产查询"]

selected_feature = st.sidebar.selectbox("功能选择", features_list)

st.sidebar.write("版本：" + __version__)
st.sidebar.write("Powered By JRT")

if selected_feature == "欢迎":
    welcome.main()
elif selected_feature == "用户资产查询":
    user_assect_query.main()