#!/bin/bash

# 启动Python服务器
echo "启动Python服务器..."
python app.py &
PYTHON_PID=$!

# 等待Python服务器启动
sleep 5

# 进入客户端目录
cd client

# 启动Node.js开发服务器
echo "启动Node.js开发服务器..."
bun dev &

# 等待用户输入任何键来终止服务
read -p "按任意键停止所有服务..." key

# 停止Node.js开发服务器
kill $!

# 返回上一层目录
cd ..

# 停止Python服务器
kill $PYTHON_PID