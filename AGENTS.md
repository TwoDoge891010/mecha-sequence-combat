# 项目规则

> 仅本项目生效。三家工具(Trae / Codex / DSH)都读这个文件,是项目级规则的唯一锚点。
> 通用规范见中立库 `rules/rule-project-organization.md`;本文件只写本项目特有的东西。

## 项目约定

- **接手/交接先读**：`docs/handover.md`（现状、待办、仓库地址、已知坑）→ `docs/PROJECT-STATUS.md`（单一事实源索引）→ `docs/game-design-requirements.html`（设计正文）。
- 真值优先级：执行层语义 原型 > 三张插件表 xlsx > HTML 正文/决策记录；非执行层语义以 HTML 为准。
- 语言/风格:简体中文；术语统一称「插件」，不写「卡」。
- 目录说明(额外声明的内容目录):`docs\`(设计正文 + 资源 + 状态索引 + 交接说明)、`src\plugin-tables\`(三张数值真值表)。

## 常用命令

```powershell
# 构建 / 运行 / 校验
```

## 禁忌

- 不要在项目根直接新建文件(放 `src\` / `docs\` / `sessions\` / `tmp\` / `out\`)
- 不要提交 `tmp\`
- 不要写绝对路径引用

## 交付

- 成品统一放 `out\`
