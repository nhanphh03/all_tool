#!/bin/bash
echo "📢 Bắt đầu chạy tool"

# Kiểm tra file input
if [ ! -f data_mua_nhieu.json ]; then
  echo "❌ Không tìm thấy file data_mua_nhieu.json"
  exit 1
fi

# Kiểm tra thư mục đích
if [ ! -d core/v2 ]; then
  echo "❌ Thư mục core/v2 không tồn tại"
  exit 1
fi

echo "📂 Copy file data vào tool"
cp data_mua_nhieu.json core/v2/data.json

cd core/v2 || exit 1
echo "🚀 Khởi chạy tool"
node index_v2.js
#node index.js

read -p "✅ Nhấn Enter để thoát..."
