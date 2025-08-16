#!/bin/bash
echo "📢 Bắt đầu chạy tool"

# Kiểm tra file input
echo "📂 Copy file data vào tool"
cp data_mua_1.json core/data.json

cd core
echo "🚀 Khởi chạy tool"
#node index.js

read -p "✅ Nhấn Enter để thoát..."
