# Nginx 部署文档

## 服务器信息
- 服务器 IP：8.134.66.175
- 部署用户：deployer
- 部署目录：/home/deployer/nginx

## 目录结构
```
/home/deployer/nginx/
├── html/              # 静态资源目录
│   ├── index.html    # 网站首页
│   └── ...          # 其他静态资源
├── conf/             # 配置文件目录
│   └── nginx.conf    # Nginx 配置文件
├── logs/             # 日志目录
│   ├── access.log    # 访问日志
│   └── error.log     # 错误日志
├── Dockerfile        # Docker 构建文件
└── docker-compose.yml # Docker 编排文件
```

## 前置条件
1. 确保服务器已安装 Docker 和 Docker Compose
2. 确保 deployer 用户有足够的权限执行 docker 命令
3. 确保服务器防火墙已开放 80 端口
4. 确保 deployer 用户已配置 sudo 权限，且无需密码验证

## 部署步骤

### 1. 创建必要的目录
```bash
# 在服务器上创建目录结构
mkdir -p /home/deployer/nginx/{html,conf,logs}

# 创建初始的 index.html 文件
cat > /home/deployer/nginx/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Nginx!</title>
    <style>
        body {
            width: 35em;
            margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif;
        }
    </style>
</head>
<body>
    <h1>Welcome to Nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and
    working. Further configuration is required.</p>
    <p>For online documentation and support please refer to
    <a href="http://nginx.org/">nginx.org</a>.<br/>
    Commercial support is available at
    <a href="http://nginx.com/">nginx.com</a>.</p>
    <p><em>Thank you for using nginx.</em></p>
</body>
</html>
EOF

# 设置目录权限
sudo chown -R deployer:deployer /home/deployer/nginx/html
sudo chmod -R 755 /home/deployer/nginx/html
```

### 2. 上传配置文件
```bash
# 上传 nginx 配置文件到 conf 目录
scp nginx.conf deployer@8.134.66.175:/home/deployer/nginx/conf/

# 上传 Docker 相关文件到根目录
scp Dockerfile docker-compose.yml deployer@8.134.66.175:/home/deployer/nginx/
```

### 3. 设置目录权限
```bash
# 方法1：如果已配置 sudo 无需密码
ssh deployer@8.134.66.175 "sudo chown -R deployer:deployer /home/deployer/nginx && sudo chmod -R 755 /home/deployer/nginx"

# 方法2：如果需要输入密码，使用 -t 参数
ssh -t deployer@8.134.66.175 "sudo chown -R deployer:deployer /home/deployer/nginx && sudo chmod -R 755 /home/deployer/nginx"

# 方法3：如果以上方法都不行，可以分步执行
ssh deployer@8.134.66.175
sudo chown -R deployer:deployer /home/deployer/nginx
sudo chmod -R 755 /home/deployer/nginx
exit
```

### 4. 启动服务
```bash
# 方法1：使用单引号
ssh deployer@8.134.66.175 'cd /home/deployer/nginx && docker compose up -d'

# 方法2：如果方法1不行，可以分步执行
ssh deployer@8.134.66.175
cd /home/deployer/nginx
docker compose up -d
exit
```

### 5. 验证部署
```bash
# 检查容器状态
ssh deployer@8.134.66.175 'docker ps'

# 检查 nginx 配置是否正确
ssh deployer@8.134.66.175 'docker exec nginx-nginx-1 nginx -t'

# 检查静态资源目录是否正确挂载
ssh deployer@8.134.66.175 'docker exec nginx-nginx-1 ls -l /home/deployer/nginx/html'

# 检查日志目录是否正确挂载
ssh deployer@8.134.66.175 'docker exec nginx-nginx-1 ls -l /home/deployer/nginx/logs'

# 检查 nginx 日志
ssh deployer@8.134.66.175 'docker logs nginx-nginx-1'

# 测试服务是否可访问
ssh deployer@8.134.66.175 'curl http://localhost'
```

## 配置说明
1. nginx.conf 包含了以下主要配置：
   - 安全相关头部配置
   - Gzip 压缩配置
   - 静态资源服务配置
   - 日志配置

2. Dockerfile 使用 nginx:alpine 作为基础镜像，主要配置：
   - 使用标准的 Nginx 目录结构
   - 配置文件的复制和设置

3. docker-compose.yml 配置：
   - 端口映射：80:80
   - 卷挂载配置：
     - 静态资源目录：/home/deployer/nginx/html
     - 配置文件：/home/deployer/nginx/conf/nginx.conf
     - 日志目录：/home/deployer/nginx/logs
   - 网络配置：使用 qia-network
   - 自动重启策略

## 注意事项
1. 确保服务器有足够的内存和磁盘空间
2. 定期检查日志文件大小，必要时进行日志轮转
3. 建议配置 SSL 证书，启用 HTTPS
4. 定期更新 Nginx 和 Docker 镜像以修复安全漏洞
5. 建议配置监控和告警机制
6. 如果修改了配置，需要重新构建并启动服务：
   ```bash
   docker compose down
   docker compose up -d --build
   ```

## 常见问题处理
1. 如果遇到权限问题：
   - 检查 deployer 用户权限
   - 检查 sudo 配置是否正确
   - 可以尝试使用 `-t` 参数进行 SSH 连接
2. 如果服务无法访问，检查：
   - 防火墙配置
   - 端口占用情况
   - 容器日志
   - 服务是否正常运行（docker ps）
3. 如果静态资源无法加载，检查：
   - 文件权限
   - 路径配置
   - 缓存配置
4. 如果出现 "host not found" 错误：
   - 检查 docker-compose.yml 中的服务配置
   - 确保所有服务都在同一个网络中
   - 检查服务名称是否正确
5. 如果构建失败，检查：
   - 确保所有文件都在正确的目录中
   - 确保 nginx.conf 在 conf 目录下
   - 确保 Dockerfile 和 docker-compose.yml 在根目录下
   - 检查文件权限是否正确
6. 如果出现 403 Forbidden 错误：
   - 检查静态资源目录是否存在：
     ```bash
     ls -l /home/deployer/nginx/html
     ```
   - 检查目录权限：
     ```bash
     sudo chown -R deployer:deployer /home/deployer/nginx/html
     sudo chmod -R 755 /home/deployer/nginx/html
     ```
   - 检查 index.html 是否存在：
     ```bash
     # 如果不存在，创建一个测试页面
     echo "<html><body><h1>Welcome to Nginx!</h1></body></html>" > /home/deployer/nginx/html/index.html
     ```
   - 检查 SELinux 上下文（如果启用了 SELinux）：
     ```bash
     sudo chcon -R -t httpd_sys_content_t /home/deployer/nginx/html
     ```
   - 检查 Nginx 错误日志：
     ```bash
     docker exec nginx-nginx-1 cat /home/deployer/nginx/logs/error.log
     ```

## sudo 配置说明
如果需要配置 deployer 用户无需密码使用 sudo，可以按以下步骤操作：

1. 在服务器上使用 root 用户或具有 sudo 权限的用户执行：
```bash
sudo visudo
```

2. 在文件末尾添加以下行：
```
deployer ALL=(ALL) NOPASSWD: ALL
```

3. 保存并退出（在 vi 编辑器中按 ESC，然后输入 `:wq`）

4. 验证配置：
```bash
sudo -l
```

注意：此配置会允许 deployer 用户无需密码执行所有 sudo 命令，请确保这是您想要的安全级别。

## 后续部署 qia-editor 服务
当需要部署 qia-editor 服务时，需要：

1. 修改 nginx.conf，添加 qia-editor 的代理配置
2. 更新 docker-compose.yml，添加 qia-editor 服务
3. 重新构建并启动服务

具体配置将在 qia-editor 部署时提供。 