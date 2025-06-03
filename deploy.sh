#!/bin/bash

# 设置变量
PROJECT="qia-editor"
PORT="3003"
IMAGE_TAG=$(date +%Y%m%d_%H%M%S)

# 构建 Docker 镜像
echo "Building Docker image..."
docker build -t $PROJECT:$IMAGE_TAG -f Dockerfile.editor .

# 停止并删除旧容器
echo "Stopping and removing old container..."
docker stop $PROJECT || true
docker rm $PROJECT || true

# 启动新容器
echo "Starting new container..."
docker run -d \
  --name $PROJECT \
  --network qia-network \
  -p $PORT:$PORT \
  $PROJECT:$IMAGE_TAG

# 清理旧镜像
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment completed!" 