# OpenClaw 部署指南（Ubuntu 22.04+）

本仓库提供了一个自动化脚本，帮助你在 Linux 服务器或开发机上完成 OpenClaw 的下载、编译与启动。

## 1. 快速开始

```bash
chmod +x scripts/deploy_openclaw.sh
./scripts/deploy_openclaw.sh
```

脚本默认会：

1. 安装编译依赖（`cmake`、`g++`、`libsdl2-dev` 等）
2. 克隆 OpenClaw 源码到 `./openclaw-src`
3. 在 `./openclaw-src/build` 执行 CMake 构建
4. 输出可执行文件路径

## 2. 自定义参数

```bash
./scripts/deploy_openclaw.sh --repo-dir /opt/openclaw-src --build-type Debug --jobs 8
```

参数说明：

- `--repo-dir`: OpenClaw 源码目录（默认 `./openclaw-src`）
- `--build-dir`: 构建目录（默认 `<repo-dir>/build`）
- `--build-type`: CMake 构建类型（默认 `Release`）
- `--jobs`: 并行编译线程数（默认自动检测）
- `--skip-deps`: 跳过系统依赖安装

## 3. 运行 OpenClaw

构建完成后，常见可执行文件路径：

- `openclaw-src/build/openclaw`
- `openclaw-src/build/OpenClaw`

启动示例：

```bash
cd openclaw-src/build
./openclaw
```

## 4. 常见问题

- 如果你在非 Debian/Ubuntu 发行版上部署，请手动安装同等依赖后加 `--skip-deps`。
- 缺少游戏资源文件时，程序可能无法完整运行；请按 OpenClaw 项目说明放置资源。
- 如果服务器没有图形界面，可使用 Xvfb、VNC 或在本地桌面环境中运行。
