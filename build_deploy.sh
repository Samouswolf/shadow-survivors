#!/bin/bash
# ============================================================
# 部署构建脚本 — 从源文件生成网页版本
# 源文件 (本地版，含素材工厂)： C:\Users\Samous\割草.html
# 部署目录 (网页版，无素材工厂)： C:\Users\Samous\Desktop\暗影幸存者-deploy\
# ============================================================

set -e

SOURCE_SHADOW="C:/Users/Samous/割草.html"
SOURCE_MAHJONG="C:/Users/Samous/麻将.html"
DEPLOY_DIR="C:/Users/Samous/Desktop/暗影幸存者-deploy"

echo "=== 构建部署版本 ==="

# 1. 复制割草.html，然后剥离素材工厂
echo "[1/3] 处理暗影幸存者..."
cp "$SOURCE_SHADOW" "$DEPLOY_DIR/game.html"

python -c "
import re
with open('$DEPLOY_DIR/game.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 移除 CSS: .factory-* 所有样式 + captionPop 动画
content = re.sub(r'\.factory-overlay\{[^}]*\}\n\.factory-overlay\.show\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-panel\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-panel h3\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-panel \.sub\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-row\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-row label\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-row select[^}]*\}\n', '', content)
content = re.sub(r'\.factory-row select option\{[^}]*\}\n', '', content)
content = re.sub(r'\.caption-theme-btn\{[^}]*\}\n', '', content)
content = re.sub(r'\.caption-theme-btn\.active\{[^}]*\}\n', '', content)
content = re.sub(r'\.caption-preview\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-start-btn\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-start-btn:hover\{[^}]*\}\n', '', content)
content = re.sub(r'\.factory-close-btn\{[^}]*\}\n', '', content)
content = re.sub(r'@keyframes captionPop\{[^}]*\}\n', '', content)

# 移除 HTML: factory overlay div
content = re.sub(r'\n<!-- FACTORY -->\n<div class=\"factory-overlay\" id=\"factoryOverlay\">[\s\S]*?</div>\n', '\n', content)

# 移除 JS: G 状态中的 factory 属性
content = re.sub(r'\n\t  factoryMode[^\n]*\n\t  facCaptions[^\n]*\n', '\n', content)

# 移除 JS: 素材工厂相关函数调用
content = content.replace('  updateFactoryCaptions();\n', '')
content = content.replace('  // Factory captions\n  if (G.factoryMode) renderFactoryCaptions();\n', '')
content = content.replace('  if (G.aiEnabled) { aiControl(); } else { movePlayer(); }', '  movePlayer();')

# 移除 JS: Factory mode 在 gameVictory 和 gameOver 中的分支
content = re.sub(r'  if \(G\.factoryMode\) \{\s*[\s\S]*?return;\s*\}\n', '', content)
content = re.sub(r'    // Auto restart in factory mode\s*[\s\S]*?return;\s*\}\n', '', content)

# 移除 JS: 所有 factory/ai/caption 函数和按钮注入
content = re.sub(r'\n{2,}function buildFactoryPanel\(\)[\s\S]*?\}\)\(\);', '', content)
content = re.sub(r\"\ndocument\.getElementById\('factoryClose'\)\.onclick.*;\n\", '\n', content)
content = re.sub(r'\n{2,}// ===== CAPTION SETS =====[\s\S]*?// ===== FACTORY MODE =====\n', '\n', content)
content = re.sub(r'\n  // Factory captions\n', '\n', content)

with open('$DEPLOY_DIR/game.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('  暗影幸存者: 素材工厂已剥离 ✓')
"

# 2. 复制麻将.html
echo "[2/3] 处理四川麻将..."
cp "$SOURCE_MAHJONG" "$DEPLOY_DIR/mahjong.html"
echo "  四川麻将: 已复制 ✓"

# 3. 验证
echo "[3/3] 验证..."
if grep -q 'factoryMode\|素材工厂\|buildFactoryPanel\|aiControl' "$DEPLOY_DIR/game.html"; then
    echo "  ❌ 错误: 部署版仍含素材工厂代码！"
    exit 1
fi
echo "  验证通过 ✓"

echo "=== 构建完成 ==="
echo "下一步: cd \"$DEPLOY_DIR\" && git add game.html mahjong.html && git commit -m '...' && git push"
