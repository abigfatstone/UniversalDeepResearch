#!/bin/bash

# Universal Deep Research Docker 启动脚本
# 此脚本用于构建和启动整个应用程序栈

set -e

echo "🚀 启动 Universal Deep Research Docker 服务..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查docker compose是否可用
if ! docker compose version &> /dev/null; then
    echo "❌ docker compose 不可用，请确保Docker版本支持compose插件"
    exit 1
fi

# 检查API密钥文件是否存在
echo "🔍 检查API密钥文件..."
if [ ! -f "backend/openai_api.txt" ]; then
    echo "⚠️  警告: backend/openai_api.txt 不存在"
fi

if [ ! -f "backend/tavily_api.txt" ]; then
    echo "⚠️  警告: backend/tavily_api.txt 不存在"
fi

if [ ! -f "backend/nvdev_api.txt" ]; then
    echo "⚠️  警告: backend/nvdev_api.txt 不存在"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p backend/logs
mkdir -p backend/instances
mkdir -p backend/mock_instances

# 停止现有容器（如果存在）
echo "🛑 停止现有容器..."
docker compose down --remove-orphans

# 构建镜像
echo "🔨 构建Docker镜像..."
docker compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker compose ps

# 显示日志
echo "📋 显示服务日志..."
docker compose logs --tail=20

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost:3000"
echo "   后端API: http://localhost:8000"
echo "   后端文档: http://localhost:8000/docs"
echo ""
echo "📝 常用命令："
echo "   查看日志: docker compose logs -f"
echo "   停止服务: docker compose down"
echo "   重启服务: docker compose restart"
echo "   查看状态: docker compose ps"
echo ""
