#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/pjasicek/OpenClaw.git"
REPO_DIR="${PWD}/openclaw-src"
BUILD_DIR=""
BUILD_TYPE="Release"
SKIP_DEPS=false
JOBS=""

usage() {
  cat <<USAGE
Usage: $0 [options]

Options:
  --repo-dir <path>     OpenClaw source directory (default: ./openclaw-src)
  --build-dir <path>    Build directory (default: <repo-dir>/build)
  --build-type <type>   CMake build type (default: Release)
  --jobs <n>            Parallel build jobs (default: auto)
  --skip-deps           Skip dependency installation
  -h, --help            Show this help message
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-dir)
      REPO_DIR="$2"
      shift 2
      ;;
    --build-dir)
      BUILD_DIR="$2"
      shift 2
      ;;
    --build-type)
      BUILD_TYPE="$2"
      shift 2
      ;;
    --jobs)
      JOBS="$2"
      shift 2
      ;;
    --skip-deps)
      SKIP_DEPS=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${BUILD_DIR}" ]]; then
  BUILD_DIR="${REPO_DIR}/build"
fi

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || return 1
}

install_deps() {
  if [[ "$SKIP_DEPS" == true ]]; then
    echo "[INFO] Skipping dependency installation."
    return
  fi

  if ! need_cmd apt-get; then
    echo "[WARN] apt-get not found. Install dependencies manually and re-run with --skip-deps."
    return
  fi

  echo "[INFO] Installing OpenClaw build dependencies..."
  sudo apt-get update
  sudo apt-get install -y \
    git cmake build-essential pkg-config \
    libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libsdl2-ttf-dev \
    libopenal-dev libvorbis-dev zlib1g-dev
}

clone_or_update_repo() {
  if [[ -d "${REPO_DIR}/.git" ]]; then
    echo "[INFO] OpenClaw repo exists, pulling latest changes..."
    git -C "${REPO_DIR}" pull --ff-only
  else
    echo "[INFO] Cloning OpenClaw repo to ${REPO_DIR}..."
    git clone "${REPO_URL}" "${REPO_DIR}"
  fi
}

configure_and_build() {
  mkdir -p "${BUILD_DIR}"
  echo "[INFO] Configuring with CMake (build type: ${BUILD_TYPE})..."
  cmake -S "${REPO_DIR}" -B "${BUILD_DIR}" -DCMAKE_BUILD_TYPE="${BUILD_TYPE}"

  if [[ -z "${JOBS}" ]]; then
    if need_cmd nproc; then
      JOBS="$(nproc)"
    else
      JOBS="4"
    fi
  fi

  echo "[INFO] Building OpenClaw with ${JOBS} jobs..."
  cmake --build "${BUILD_DIR}" -- -j"${JOBS}"
}

print_result() {
  echo "[SUCCESS] OpenClaw build finished."
  echo "[INFO] Build directory: ${BUILD_DIR}"

  if [[ -x "${BUILD_DIR}/openclaw" ]]; then
    echo "[INFO] Executable: ${BUILD_DIR}/openclaw"
  elif [[ -x "${BUILD_DIR}/OpenClaw" ]]; then
    echo "[INFO] Executable: ${BUILD_DIR}/OpenClaw"
  else
    echo "[WARN] Executable not found with common names. Please inspect ${BUILD_DIR}."
  fi
}

install_deps
clone_or_update_repo
configure_and_build
print_result
