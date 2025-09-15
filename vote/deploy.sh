#!/bin/bash

echo "开始部署流程..."

# 1. 清理旧的构建文件
echo "清理旧的构建文件..."
rm -rf out .next

# 2. 构建项目
echo "构建项目..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "构建失败！"
    exit 1
fi

echo "构建成功！"
echo "静态文件已生成在 out/ 目录中"
echo "所有静态资源路径已通过 assetPrefix 自动配置为正确的OSS路径"
echo ""
echo "OSS路径结构:"
echo "- 基础路径: https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/"
echo "- Next.js静态文件: https://static-thefair-bj.oss-cn-beijing.aliyuncs.com/activity/vote-book/_next/static/"
echo ""
echo "现在你可以将 out/ 目录的内容上传到OSS的 activity/vote-book/ 路径下"
echo "主要文件包括："
echo "- index.html (主页)"
echo "- bookDetail/index.html (书籍详情页)"
echo "- _next/ 目录 (所有静态资源)"
echo "- 其他静态文件 (图片、图标等)"
