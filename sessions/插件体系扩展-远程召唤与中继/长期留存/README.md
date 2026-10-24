# 长期留存 · 插件表生成与校验脚本

本目录留存 v0.9 插件表（中继 / 赋能）的生成与校验脚本，用于日后表结构变更时**可复现重建**与**回归校验**。

## 脚本清单

| 脚本 | 作用 | 输出 |
|---|---|---|
| `build_relay_v09.py` | 生成中继插件表 v0.9（结构：说明 / 命名规范 / 主表 / 效率档位表等） | `src\plugin-tables\relay-plugin-tables-v0.9.xlsx` |
| `build_enhance_v09b.py` | 生成赋能插件表 v0.9b（18 条词缀：原有 6 + 新增 12；Tag 体系扩为 6 组） | `src\plugin-tables\enhance-plugin-tables-v0.9.xlsx` |
| `check_enhance.py` | 赋能表回归校验：公式错误扫描、主表序号连续性、Tag 体系 / 受附要求体系三方一致性 | 控制台输出（无文件落盘） |

## 运行方式

在项目根目录下执行：

```powershell
python sessions\插件体系扩展-远程召唤与中继\长期留存\check_enhance.py
```

依赖：`openpyxl`。脚本内路径以**脚本自身位置**解析（上溯 3 层到项目根），不含绝对路径，任意机器克隆后可直接运行。

## 注意

- `build_*.py` 为**全量重建**脚本：运行会整体覆盖对应 xlsx。执行前请确认表内手工改动已回写进脚本数据区，否则会被冲掉。
- 脚本是「表结构的可复现来源」，不是规范真值；规范真值以 `docs\PROJECT-STATUS.md` 登记的当前表为准。
- `check_enhance.py` 中的 `LO` 对照副本指向 `tmp\lo-check\`（临时目录，不入库）：该文件不存在时自动跳过该项扫描，不影响其余校验。