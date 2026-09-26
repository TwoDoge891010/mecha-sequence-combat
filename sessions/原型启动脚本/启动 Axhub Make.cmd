@echo off
setlocal enabledelayedexpansion
chcp 936 >nul
title Axhub Make
cd /d "E:\Projects\axhub-make-client"

echo ==========================================
echo   Axhub Make 一键启动（机动战姬 战斗体系原型）
echo ==========================================
echo.

echo [1/3] 启动后台编辑服务（端口 53817）...
call npx -y @axhub/make@latest --no-open --background
if errorlevel 1 echo   [提示] 后台服务返回非零，继续下一步，稍后统一验证。

echo.
echo [2/3] 检查原型运行时（端口 51720）...
curl -s -o nul --max-time 2 http://localhost:51720/
if errorlevel 1 (
  echo   未运行，正在启动 npm run dev ...
  start "AxhubMake-Runtime" /min /d "E:\Projects\axhub-make-client" cmd /c "npm run dev"
) else (
  echo   已在运行，跳过启动。
)

echo.
echo [3/3] 等待运行时就绪（最多约 60 秒）...
set /a _try=0
:waitloop
set /a _try+=1
curl -s -o nul --max-time 2 http://localhost:51720/
if not errorlevel 1 goto ready
if !_try! geq 30 goto timeout
ping -n 3 127.0.0.1 >nul
goto waitloop

:ready
echo   就绪，正在打开编辑器...
start "" http://localhost:51720/
echo.
echo ------------------------------------------
echo  编辑器已在浏览器打开。
echo  运行时在最小化的 AxhubMake-Runtime 窗口里，
echo  关掉那个窗口即停止运行时（后台服务不受影响）。
echo ------------------------------------------
echo.
pause >nul
exit /b 0

:timeout
echo   等待超时（约 60 秒）。
echo   请手动在浏览器打开 http://localhost:51720/ 查看。
echo   若仍失败，检查最小化窗口里的报错信息。
echo.
pause >nul
exit /b 1
