# Universal Deep Research - Docker 部署指南

本文档介绍如何使用Docker部署Universal Deep Research应用程序。

## 📋 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

## 🚀 快速启动

### 开发环境（推荐）

如果您需要修改代码并希望支持热重载：

```bash
# 使用开发环境启动脚本
./docker-dev.sh
```

**开发环境特性**：
- ✅ **后端热重载**: 修改Python代码自动重启，无需重新构建
- ✅ **前端热重载**: 修改React/Next.js代码自动刷新
- ✅ **代码挂载**: 本地代码直接挂载到容器，修改立即生效
- ✅ **快速迭代**: 无需每次修改都重新构建Docker镜像

### 生产环境

如果您只需要运行应用而不修改代码：

```bash
# 使用生产环境启动脚本
./docker-start.sh
```

### 1. 准备API密钥文件

在启动之前，请确保以下API密钥文件存在：

```bash
# OpenAI API密钥
echo "your-openai-api-key" > backend/openai_api.txt

# Tavily API密钥  
echo "your-tavily-api-key" > backend/tavily_api.txt

# NVIDIA API密钥
echo "your-nvidia-api-key" > backend/nvdev_api.txt
```

### 2. 使用启动脚本（推荐）

```bash
# 运行启动脚本
./docker-start.sh
```

### 3. 手动启动

```bash
# 构建并启动服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 🌐 访问应用

启动成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000  
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/

## 🏗️ 架构说明

### 服务组件

1. **backend**: FastAPI后端服务
   - 端口: 8000
   - 提供研究API和数据处理
   - 集成OpenAI、NVIDIA、Tavily API

2. **frontend**: Next.js前端服务
   - 端口: 3000
   - 提供用户界面
   - 与后端API通信

### 网络配置

- 所有服务运行在 `udr-network` 网络中
- 前端依赖后端服务健康检查
- 支持局域网访问（绑定到 0.0.0.0）

## 📁 目录挂载

以下目录被挂载到宿主机，用于数据持久化：

```
./backend/logs -> /app/logs              # 日志文件
./backend/instances -> /app/instances    # 研究实例数据
./backend/mock_instances -> /app/mock_instances  # 模拟数据
```

## ⚙️ 环境配置

### 后端环境变量

主要配置项在 `docker-compose.yml` 中定义：

```yaml
environment:
  - HOST=0.0.0.0
  - PORT=8000
  - DEFAULT_MODEL=llama-3.1-nemotron-253b
  - LLM_BASE_URL=https://integrate.api.nvidia.com/v1
  - FRONTEND_URL=http://localhost:3000
  # ... 更多配置
```

### 前端环境变量

```yaml
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  - NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up --build -d

# 查看服务状态
docker-compose ps
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近的日志
docker-compose logs --tail=50
```

### 调试和维护

```bash
# 进入后端容器
docker-compose exec backend bash

# 进入前端容器
docker-compose exec frontend sh

# 查看容器资源使用
docker stats

# 清理未使用的镜像和容器
docker system prune -f
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep -E ":3000|:8000"
   
   # 修改docker-compose.yml中的端口映射
   ports:
     - "3001:3000"  # 前端
     - "8001:8000"  # 后端
   ```

2. **API密钥文件不存在**
   ```bash
   # 检查文件是否存在
   ls -la backend/*.txt
   
   # 创建缺失的密钥文件
   touch backend/openai_api.txt
   touch backend/tavily_api.txt
   touch backend/nvdev_api.txt
   ```

3. **服务启动失败**
   ```bash
   # 查看详细错误日志
   docker-compose logs backend
   docker-compose logs frontend
   
   # 检查容器状态
   docker-compose ps
   ```

4. **内存不足**
   ```bash
   # 检查系统资源
   docker system df
   free -h
   
   # 清理Docker缓存
   docker system prune -a
   ```

### 健康检查

服务包含内置健康检查：

```bash
# 检查后端健康状态
curl -f http://localhost:8000/

# 检查前端健康状态
curl -f http://localhost:3000/

# 查看Docker健康检查状态
docker-compose ps
```

## 🔒 安全注意事项

1. **API密钥安全**
   - 不要将API密钥文件提交到版本控制
   - 使用适当的文件权限 (600)
   - 定期轮换API密钥

2. **网络安全**
   - 生产环境中考虑使用反向代理
   - 配置防火墙规则
   - 使用HTTPS

3. **容器安全**
   - 定期更新基础镜像
   - 使用非root用户运行服务
   - 限制容器资源使用

## 📊 性能优化

### 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### 缓存优化

```bash
# 使用构建缓存
docker-compose build --parallel

# 预拉取基础镜像
docker pull python:3.11-slim
docker pull node:18-alpine
```

## 🚀 生产部署

### 环境变量文件

创建 `.env` 文件用于生产配置：

```bash
# .env
COMPOSE_PROJECT_NAME=udr-prod
HOST=0.0.0.0
PORT=8000
NODE_ENV=production
LOG_LEVEL=warning
```

### 使用生产配置

```bash
# 使用生产配置启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📞 支持

如果遇到问题，请：

1. 查看日志文件
2. 检查GitHub Issues
3. 参考项目文档
4. 联系维护团队

---

更多信息请参考项目主README文件。
