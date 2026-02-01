#!/bin/bash

# Download Moondream 3 ONNX model for on-device inference
# This script downloads the quantized model for mobile deployment

set -e

MODEL_DIR="apps/mobile/assets/models"
MODEL_URL="https://huggingface.co/vikhyatk/moondream2/resolve/main/moondream2.onnx"

echo "📥 Downloading Moondream 3 ONNX model..."

mkdir -p "$MODEL_DIR"

# Check if model already exists
if [ -f "$MODEL_DIR/moondream.onnx" ]; then
    echo "⚠️  Model already exists. Delete it first to re-download."
    exit 0
fi

# Download model
# Note: Replace with actual Moondream 3 ONNX URL when available
echo "⏳ This may take a while (~500MB)..."

# Using curl with progress
curl -L -o "$MODEL_DIR/moondream.onnx" "$MODEL_URL" --progress-bar

echo ""
echo "✅ Model downloaded to $MODEL_DIR/moondream.onnx"
echo ""
echo "⚠️  Note: The model is git-ignored. Each developer needs to run this script."
