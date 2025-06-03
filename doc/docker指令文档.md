docker compose up --build 启动并编译
docker-compose.yml

docker builder prune 只想清除构建缓存

docker system prune -a 清除所有未使用的 Docker 资源（包括未使用的镜像、容器、网络和构建缓存）

docker compose down --rmi all --volumes --remove-orphans 清除所有未使用的容器、网络、镜像和构建缓存