# 机动战姬：棘罪魔女（mecha-sequence-combat）

> 项目卡。俯视角 2D 机甲动作 + 战斗之外技能编程（类 BALDR SKY / Bio-Prototype）。

## 目标

设计并维护一套「行为 / 中继 / 赋能三类插件 + 序列插槽 + 机甲核心」的三维可编程战斗体系，并以设计文档 + 原型源码 + 数值表格三种形式交付。

## 状态

- 阶段：进行中（战斗体系 v0.8；中继 / 赋能插件表独立 v0.9）
- 最近更新：2026-09-30
- 当前进度：行为插件 6 个（近战 3 / 远程 2 / 召唤 1）、中继插件 3 个（×3 稀有度 = 9 变体）、赋能词缀 18 条；核心决策 Q1–Q12 已全部关闭
- 待办与下一步：见 `docs/PROJECT-STATUS.md` 第六章「进度快照与待办清单」（接替工作的直接入口）

## 结构

```
mecha-sequence-combat\
├── README.md          本文件（项目卡）
├── AGENTS.md          项目规则（三家工具唯一锚点）
├── .gitignore
├── src\               源材料 / 数据表：plugin-tables\（行为 / 中继 / 赋能插件表 xlsx）
├── docs\              设计、调研、决策、报告：设计正文 HTML + 资源；PROJECT-STATUS（单一事实源索引）
├── sessions\          agent 过程归档：原型分发包时点快照 / 行为插件规划 / 插件体系扩展-远程召唤与中继
├── tmp\               临时（不提交）
└── out\               交付成品：分发包 zip
```

### 内容 / 资源目录声明

- `docs\`:游戏设计主文档 `game-design-requirements.html`(正文+决策记录+交互原型)及其同目录资源 `assets\(charts.js)`、`_shared\(echarts/mermaid/字体)`
- `src\plugin-tables\`:行为插件表 v0.8、中继插件表 v0.9、赋能插件表 v0.9(数值真值所在)
- `docs\PROJECT-STATUS.md`:项目状态索引,单一事实源,登记文件职责 / 版本真值 / 已知过时点与修复状态 —— 改任何设计前先读

## 怎么跑 / 怎么用

- 设计正文:直接打开 `docs\game-design-requirements.html`(自包含,含图表与交互原型)
- 数值表:用 Excel / WPS 打开 `src\plugin-tables\*.xlsx`
- 交付物:解压 `out\机甲序列战斗-项目介绍与原型分发包.zip` 后可独立打开

## 成品

| 成品 | 位置 | 说明 |
|---|---|---|
| 游戏设计主文档(HTML) | `docs\game-design-requirements.html` | 设计正文 + 决策记录 + 交互原型 |
| 行为插件数值表 | `src\plugin-tables\behavior-plugin-tables-v0.8.xlsx` | 行为插件 9 变体数据 |
| 中继插件数值表 | `src\plugin-tables\relay-plugin-tables-v0.9.xlsx` | 中继插件 3 × 3 稀有度 = 9 变体数据 |
| 赋能插件数值表 | `src\plugin-tables\enhance-plugin-tables-v0.9.xlsx` | 赋能词缀数据(对齐行为插件表范式) |
| 分发包 | `out\机甲序列战斗-项目介绍与原型分发包.zip` | 可独立打开的项目介绍 + 原型快照 |