#!/bin/bash
# Script untuk copy gambar SEO ke public directory
# Jalankan dari root project: bash setup-seo-images.sh

ARTIFACT_DIR="/home/mikeudev/.gemini/antigravity-ide/brain/156c64bb-c506-46e6-860a-caf79bfaad7a"

echo "Copying OG image..."
cp "${ARTIFACT_DIR}/og_image_1781191483039.png" public/og-image.png

echo "Copying favicon/icon..."
cp "${ARTIFACT_DIR}/favicon_logo_1781191499561.png" public/icon.png

echo "Done! Files copied to public/"
ls -la public/og-image.png public/icon.png
