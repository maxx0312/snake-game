# 贪吃蛇 · Snake 🐍

一个纯前端实现的网页版贪吃蛇小游戏，无需任何依赖，打开 `index.html` 即可游玩。

## 特性

- 🎮 键盘（方向键 / WASD）与屏幕按钮双操作，支持手机触摸
- 🏆 最高分本地保存（`localStorage`）
- ⚡ 吃食物逐步加速，难度递增
- ⏸ 空格暂停 / 回车开始
- 🌈 霓虹风暗色界面

## 快速开始

直接双击 `index.html` 在浏览器中打开，或运行本地服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 操作说明

| 按键 | 功能 |
| ---- | ---- |
| ↑ ↓ ← → / W A S D | 控制方向 |
| 空格 | 暂停 / 继续 |
| 回车 | 开始 / 重新开始 |

## 文件结构

```
snake-game/
├── index.html   # 页面结构
├── style.css    # 样式
└── script.js    # 游戏逻辑
```

## 技术栈

- HTML5 Canvas 绘制
- 原生 JavaScript（ES6+）
- CSS3 响应式布局

纯静态项目，可部署到任意静态托管（GitHub Pages / Vercel / Netlify 等）。
