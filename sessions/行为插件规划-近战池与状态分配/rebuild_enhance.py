# -*- coding: utf-8 -*-
# 重构赋能插件表 v0.9：结构/说明/命名规范/Tag体系 对齐行为插件表范式
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

P = r'e:\Projects\my-projects\mecha-sequence-combat\plugin-tables\enhance-plugin-tables-v0.9.xlsx'

# ---- 样式常量（对齐行为插件表）----
F_TITLE = Font(name='Arial', size=14, bold=True, color='1F2937')
F_HDR   = Font(name='Arial', size=11, bold=True, color='FFFFFF')
F_LABEL = Font(name='Arial', size=10, bold=True, color='1F2937')
F_DATA  = Font(name='Arial', size=10)
F_HDR2  = Font(name='Arial', size=11, bold=True, color='1F2937')
FILL_HDR  = PatternFill('solid', fgColor='1F2937')
FILL_TITLE = PatternFill('solid', fgColor='F1F5F9')
FILL_WHITE = PatternFill('solid', fgColor='FFFFFF')
FILL_ZEBRA = PatternFill('solid', fgColor='F7F9FC')
THIN = Side(style='thin', color='D9DEE7')
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
AL_C = Alignment(horizontal='center', vertical='center', wrap_text=True)
AL_L = Alignment(horizontal='left', vertical='center', wrap_text=True)


def put_title(ws, text):
    ws.cell(1, 1, text)
    ws.cell(1, 1).font = F_TITLE
    ws.cell(1, 1).alignment = AL_L


def put_header(ws, row, headers):
    for j, h in enumerate(headers, 1):
        c = ws.cell(row, j, h)
        c.font = F_HDR
        c.fill = FILL_HDR
        c.border = BORDER
        c.alignment = AL_C


def put_body(ws, row0, rows, half=None):
    # rows: 每行是列值列表；half: 若提供则在奇数行斑马纹用于有分组结构时忽略（默认按行奇偶）
    for i, r in enumerate(rows):
        rn = row0 + i
        fill = FILL_WHITE if i % 2 == 0 else FILL_ZEBRA
        for j, v in enumerate(r, 1):
            c = ws.cell(rn, j, v)
            c.font = F_DATA
            c.border = BORDER
            c.alignment = AL_L
            c.fill = fill


def put_label(ws, r, text):
    c = ws.cell(r, 1, text)
    c.font = F_LABEL
    c.alignment = AL_L


def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


def merge_borders(ws, r1, c1, r2, c2):
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            ws.cell(r, c).border = BORDER
    # 合并后保留左上内容格样式
    mc = ws.cell(r1, c1)
    mc.font = F_DATA
    mc.alignment = AL_L


wb = openpyxl.Workbook()

# ============ 1) 说明 ============
ws = wb.active
ws.title = '说明'
set_widths(ws, [16, 110])
put_title(ws, '赋能插件设计表（v0.9 · 可编辑版 · 词缀模型）')
put_label(ws, 3, '用途')
ws.cell(3, 2, '本工作簿专用于赋能插件（行为插件的「词缀」）设计，供设计 / 开发逐项对照。行为插件数据在 behavior-plugin-tables-v0.8.xlsx；中继插件另开工作簿。').font = F_DATA
ws.cell(3, 2).alignment = AL_L
put_label(ws, 4, '结构')
ws.cell(4, 2, '赋能插件 = 行为插件的词缀，不分稀有度、不占槽位、不入树结构：从构装库拖到行为卡上（或点行为卡「◆赋能」选择），作用于所附着的那张行为卡本身（直接子节点）。主表（A）每词缀一行；命名规范页定义命名；Tag体系页定义检索分类；受附要求体系页定义可附着对象与适用性权衡。').font = F_DATA
ws.cell(4, 2).alignment = AL_L
put_label(ws, 6, '与行为插件差异')
rows = [
    ('稀有度', '赋能插件不分稀有度（无 I/II/III 九变体），只有一种形态', '行为插件 = 插件系列 × 3 稀有度 × 3 槽 = 9 变体'),
    ('槽位 / 树结构', '不占攻击/重装/超限三槽，不入树结构、不参与树形拼装', '行为/中继构成「行为→中继→行为」纯链，行为卡本身占槽入树'),
    ('作用范围', '只作用于所附着的那张行为卡本身（直接子节点）', '行为插件本身即技能，作用于命中的敌人'),
    ('衔接职责', '不承担衔接——攻击之间仍须由中继插件衔接', '中继插件承担攻击之间的触发衔接'),
    ('上限', '每张行为卡最多附着 2 个赋能（原型 MAX_AFFIXES=2），载荷叠加到所属卡', '载荷计入技能树整装载荷'),
]
r = 7
put_header(ws, r, ['比较面', '赋能插件', '行为插件'])
for i, (a, b, c) in enumerate(rows):
    rn = r + 1 + i
    fill = FILL_WHITE if i % 2 == 0 else FILL_ZEBRA
    for j, v in enumerate([a, b, c], 1):
        cc = ws.cell(rn, j, v)
        cc.font = F_DATA; cc.border = BORDER; cc.alignment = AL_L; cc.fill = fill
ws.column_dimensions['C'].width = 60
ws.row_dimensions[1].height = 22

# ============ 2) 命名规范 ============
ws = wb.create_sheet('命名规范')
set_widths(ws, [14, 60, 42])
put_title(ws, '赋能词缀命名规范（v0.9）')
r = 3
put_header(ws, r, ['项', '规则', '示例'])
rows = [
    ('序号', '赋能词缀序号（1、2、3...，主表 / Tag体系共用同一序号）', '1'),
    ('通用名', '赋能词缀中文名：短词缀，直接描述强化方向（范围扩大 / 双重释放 / 环绕 / 强行追踪 / 贯穿+ / 从天而降）', '范围扩大'),
    ('引擎系列码', '词缀引擎前缀：EN_<系列>；系列 = 强化方向英文词', 'EN_RANGE / EN_DOUBLE / EN_ORBIT / EN_HOMING / EN_AP / EN_ASTRA'),
    ('引擎 ID', 'EN_<系列码>（赋能不分稀有度 / 槽位，故无 SLASH/BURST/DRAGON 与稀有度后缀；与行为插件 BT_<系列>_<槽>_<稀有度> 不同级）', 'EN_RANGE / EN_HOMING_II(不存在)'),
]
put_body(ws, r + 1, rows)
ws.column_dimensions['C'].width = 60

# ============ 3) A-赋能主表 ============
ws = wb.create_sheet('A-赋能主表')
set_widths(ws, [8, 14, 20, 14, 30, 12, 22, 26, 10, 10])
put_title(ws, 'A. 赋能词缀主表（每词缀一行 · 词缀模型）')
r = 3
put_header(ws, r, ['序号', '通用名', '引擎系列码', '强化方向(Tag)', '效果', '加强/质变', '受附要求', '适用性权衡', '载荷', '来源'])
rows = [
    (1, '范围扩大', 'EN_RANGE',   '范围',   '范围 +30%', '加强', '通用',                                    '与「环绕」不同方向（影响面积 vs 轨道）',        15, '新增'),
    (2, '双重释放', 'EN_DOUBLE',  '多重',   '释放 ×2',   '加强', '通用',                                    '受每卡赋能上限（≤2）与载荷约束',                20, '新增'),
    (3, '环绕', 'EN_ORBIT', '环绕', '环绕本体运作', '质变', '通用（近战/远程皆可）',                    '与「强行追踪」（长距索敌）互斥',                  20, '新增'),
    (4, '强行追踪', 'EN_HOMING',  '追踪',   '弹道类技能拐弯命中，与攻击面无关', '质变', '仅限远程/弹道类行为卡', '近战不可赋予；与「环绕」互斥；索敌规则改写',  20, '新增'),
    (5, '贯穿+',    'EN_AP',      '弹道',   '弹道贯穿敌人', '加强', '仅限弹道类行为卡',                        '穿透后可能损失单点最高伤害',                    15, '新增'),
    (6, '从天而降', 'EN_ASTRA',   '触达',   '改为从天而降落地', '质变', '通用',                                 '改变命中时机（延迟），需择机使用',                18, '新增'),
]
put_body(ws, r + 1, rows)

# ============ 4) Tag体系 ============
ws = wb.create_sheet('Tag体系')
set_widths(ws, [20, 40, 34])
put_title(ws, 'Tag 体系（赋能词缀检索 / 强化方向分类 · 可随设计扩展）')
r = 3
put_header(ws, r, ['Tag 组', 'Tag', '用于'])
rows = [
    ('强化方向', '范围 / 弹道 / 追踪 / 多重 / 环绕 / 触达', '赋能插件（检索分类；一个词缀归属一个强化方向 Tag；随新词缀设计扩展 Tag 组）'),
]
put_body(ws, r + 1, rows)

# ============ 5) 受附要求体系 ============
ws = wb.create_sheet('受附要求体系')
set_widths(ws, [20, 26, 34, 16])
put_title(ws, '受附要求体系（对应行为插件「稀有度体系」：词的附着约束与权衡）')
r = 3
put_header(ws, r, ['强化方向(Tag)', '受附要求', '适用性权衡', '加强/质变'])
rows = [
    ('范围',   '通用',                         '与「环绕」不同方向（影响面积 vs 轨道）',                                '加强'),
    ('多重',   '通用',                         '受每卡赋能上限（≤2）与载荷约束',                                        '加强'),
    ('弹道',   '仅限弹道类行为卡',              '穿透后可能损失单点最高伤害',                                              '加强'),
    ('追踪',   '仅限远程/弹道类行为卡；近战不可赋予', '与「环绕」互斥（长距索敌）；索敌规则改写',                             '质变'),
    ('环绕',   '通用（近战/远程皆可）',           '与「强行追踪」互斥',                                                     '质变'),
    ('触达',   '通用',                         '改变命中时机（延迟），需择机使用',                                         '质变'),
]
put_body(ws, r + 1, rows)

# 说明页数据行统一边框（逐格已设，仅数据内容行保证边框闭合）
for row in wb['说明'].iter_rows():
    for c in row:
        if c.value is not None and c.border.left.style is None:
            c.border = BORDER

wb.save(P)
print('rebuilt OK:', wb.sheetnames)