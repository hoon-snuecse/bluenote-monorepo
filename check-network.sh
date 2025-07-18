#!/bin/bash

echo "=== 네트워크 진단 스크립트 ==="
echo ""

echo "1. 로컬호스트 ping 테스트:"
ping -c 2 127.0.0.1

echo ""
echo "2. 로컬호스트 이름 확인:"
ping -c 2 localhost

echo ""
echo "3. 포트 스캔 (3000-4000):"
for port in 3000 3001 3002 3003 4000; do
    nc -zv 127.0.0.1 $port 2>&1 | grep -E "succeeded|refused"
done

echo ""
echo "4. Node.js 프로세스:"
ps aux | grep -i node | grep -v grep | wc -l

echo ""
echo "5. 네트워크 인터페이스:"
ifconfig lo0 | grep "status"