/**
 * @name 战斗系统设计示意（v0.8 赋能词缀模型）
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHashPage, defineHashPageRoute } from '../../common/useHashPage';
import './style.css';

/* ================= 数据定义 ================= */

type CardType = 'attack' | 'buff' | 'link';

interface SkillCard {
    id: string;
    type: CardType;
    name: string;
    load: number;
    eff: string;
    tags?: string[];
    slots?: number;
    cond?: string;
    effRate?: number;
}

const POOL: SkillCard[] = [
    { id: 'a1', type: 'attack', name: '火拳', load: 40, tags: ['近战', '燃烧'], eff: '命中施加 燃烧' },
    { id: 'a2', type: 'attack', name: '电磁指', load: 50, tags: ['远程', '感电'], eff: '命中施加 感电' },
    { id: 'a3', type: 'attack', name: '钩索', load: 30, tags: ['远程', '聚怪'], eff: '拉近敌人（聚怪）' },
    { id: 'a4', type: 'attack', name: '挑飞斩', load: 40, tags: ['近战', '失衡'], eff: '破韧条件下命中施加 失衡' },
    { id: 'a5', type: 'attack', name: '火箭冲拳', load: 60, tags: ['近战', '突进'], eff: '带甲突进' },
    { id: 'a6', type: 'attack', name: '蓄能炮', load: 70, tags: ['远程', '蓄力'], eff: '蓄能贯穿' },
    { id: 'a7', type: 'attack', name: '浮游炮', load: 50, tags: ['召唤'], eff: '召唤自动射击单位' },
    { id: 'a8', type: 'attack', name: '光剑挑刺', load: 35, tags: ['近战', '失衡'], eff: '破韧条件下快速上挑制造失衡' },
    { id: 'a9', type: 'attack', name: '余烬弹', load: 20, tags: ['远程', '燃烧'], eff: '被触发：自动发射' },
    { id: 'a10', type: 'attack', name: '火墙', load: 25, tags: ['远程', '区域'], eff: '被触发：自动展开' },
    { id: 'a11', type: 'attack', name: '火雨', load: 15, tags: ['远程', '区域'], eff: '被触发：自动落下' },
    { id: 'a12', type: 'attack', name: '雷霆轰炸', load: 40, tags: ['远程', '电'], eff: '被触发：自动轰炸' },
    { id: 'a13', type: 'attack', name: '升龙斩', load: 30, tags: ['近战', '失衡'], eff: '被触发：追加失衡' },
    { id: 'a14', type: 'attack', name: '聚能炮', load: 70, tags: ['远程', '蓄力', '大招'], eff: '超限释放：强化演出 + 卡点音效' },
    { id: 'a15', type: 'attack', name: '扩散弹', load: 30, tags: ['远程'], eff: '被触发：自动散射' },
    { id: 'b1', type: 'buff', name: '范围扩大', load: 15, eff: '直接子节点：范围 +30%' },
    { id: 'b2', type: 'buff', name: '双重释放', load: 20, eff: '直接子节点：释放 ×2' },
    { id: 'b3', type: 'buff', name: '环绕', load: 20, eff: '直接子节点：环绕本体' },
    { id: 'b4', type: 'buff', name: '强行追踪', load: 20, eff: '直接子节点：追踪索敌' },
    { id: 'b5', type: 'buff', name: '贯穿+', load: 15, eff: '直接子节点：贯穿' },
    { id: 'b6', type: 'buff', name: '从天而降', load: 18, eff: '直接子节点：改为从天而降' },
    { id: 'l1', type: 'link', name: '击中时触发', load: 20, slots: 2, cond: '击中时', effRate: 0.4, eff: '上方技能命中时 → 触发下方技能 ×0.4' },
    { id: 'l2', type: 'link', name: '命中燃烧敌人时', load: 30, slots: 1, cond: '命中燃烧敌人', effRate: 1.4, eff: '上方技能命中燃烧敌人时 → 触发下方技能 ×1.4' },
    { id: 'l3', type: 'link', name: '命中失衡敌人时', load: 40, slots: 1, cond: '命中失衡敌人', effRate: 1.6, eff: '上方技能命中失衡敌人时 → 触发下方技能 ×1.6' },
    { id: 'l4', type: 'link', name: '累积释放 10 次', load: 25, slots: 3, cond: '累积释放 10 次', effRate: 0.8, eff: '累积释放 10 次时 → 触发下方技能 ×0.8' },
    { id: 'l5', type: 'link', name: '命中感电敌人时', load: 30, slots: 1, cond: '命中感电敌人', effRate: 1.4, eff: '上方技能命中感电敌人时 → 触发下方技能 ×1.4' },
];

type SlotKey = 'lightA' | 'lightB' | 'heavy';

const SLOT_META: { key: SlotKey; label: string; note: string }[] = [
    { key: 'lightA', label: '攻击序列', note: '技能树 · 无 CD 普攻连段' },
    { key: 'lightB', label: '重装序列', note: '技能树 · 根卡 CD 特殊攻击' },
    { key: 'heavy', label: '超限释放', note: '单卡终结技 · 零载荷' },
];

const LOAD_CAP = 500;
const MAX_AFFIXES = 2;

const TYPE_META: Record<CardType, { label: string; cls: string; shape: string }> = {
    attack: { label: '行为插件', cls: 'c-attack', shape: '□' },
    buff: { label: '赋能插件', cls: 'c-buff', shape: '◆' },
    link: { label: '中继插件', cls: 'c-link', shape: '○' },
};

function uid(): string {
    return 'n' + Math.random().toString(36).slice(2, 9);
}

/* ================= 树状技能树（行为→中继→行为纯链 + 赋能词缀） ================= */

interface TNode { id: string; card: SkillCard; childIds: (string | null)[]; affixes: string[]; }
interface TreeState { rootId: string | null; nodes: Record<string, TNode>; }

const EMPTY_TREE: TreeState = { rootId: null, nodes: {} };

function treeLoad(t: TreeState): number {
    return Object.values(t.nodes).reduce((s, n) => {
        const affixLoad = n.affixes.reduce((a, id) => a + (POOL.find((c) => c.id === id)?.load ?? 0), 0);
        return s + n.card.load + affixLoad;
    }, 0);
}

function treeNote(t: TreeState): string {
    const parts: string[] = [];
    function walk(id: string | null) {
        if (!id || !t.nodes[id]) return;
        const n = t.nodes[id];
        const affixNames = n.affixes.map((aid) => POOL.find((c) => c.id === aid)?.name ?? '').filter(Boolean);
        parts.push(n.card.name + (affixNames.length ? `[${affixNames.join('+')}]` : ''));
        n.childIds.forEach((cid, k) => {
            if (!cid) return;
            parts.push(k === 0 ? '→{' : '|');
            walk(cid);
            parts.push('}');
        });
    }
    walk(t.rootId);
    return parts.join(' ');
}

function makeNode(card: SkillCard): TNode {
    return { id: uid(), card, childIds: [], affixes: [] };
}

function attachChild(tree: TreeState, parentId: string, card: SkillCard): TreeState {
    const parent = tree.nodes[parentId];
    if (!parent) return tree;
    const node = makeNode(card);
    const idx = parent.childIds.findIndex((c) => c === null);
    const childIds = parent.childIds.slice();
    if (idx >= 0) childIds[idx] = node.id;
    else childIds.push(node.id);
    return {
        ...tree,
        nodes: { ...tree.nodes, [node.id]: node, [parentId]: { ...parent, childIds } },
    };
}

function attachAffix(tree: TreeState, nodeId: string, affixId: string): TreeState {
    const node = tree.nodes[nodeId];
    if (!node || node.affixes.length >= MAX_AFFIXES) return tree;
    if (node.affixes.includes(affixId)) return tree;
    return {
        ...tree,
        nodes: { ...tree.nodes, [nodeId]: { ...node, affixes: [...node.affixes, affixId] } },
    };
}

function removeAffix(tree: TreeState, nodeId: string, affixIdx: number): TreeState {
    const node = tree.nodes[nodeId];
    if (!node) return tree;
    return {
        ...tree,
        nodes: { ...tree.nodes, [nodeId]: { ...node, affixes: node.affixes.filter((_, i) => i !== affixIdx) } },
    };
}

/* 衔接规则：行为↔中继 交替衔接；赋能插件只作词缀附着、不入树结构 */
function canChild(parent: TNode, child: SkillCard): boolean {
    if (child.type === 'buff') return false;
    if (parent.card.type === 'attack') return child.type === 'link';
    if (parent.card.type === 'link') return child.type === 'attack';
    return false;
}

function childFull(node: TNode): boolean {
    const max = node.card.type === 'link' ? (node.card.slots ?? 1) : 1;
    return node.childIds.filter((c) => c !== null).length >= max;
}

/* ================= 编辑器 ================= */

function TreeEditor({ tree, onChange }: { tree: TreeState; onChange: (t: TreeState) => void }) {
    const [selectedSlot, setSelectedSlot] = useState<{ nodeId: string } | null>(null);
    const [affixTarget, setAffixTarget] = useState<string | null>(null);
    const [pickerTab, setPickerTab] = useState<CardType | 'all'>('all');
    const [message, setMessage] = useState('树状衔接：点击下方接口圆圈接入下一级插件；点行为卡上的「◆赋能」或从卡池拖拽赋能插件到行为卡上，附着为赋能（每卡最多 2 个）。');

    const total = treeLoad(tree);
    const over = total > LOAD_CAP;

    function setRoot(card: SkillCard) {
        if (tree.rootId) return;
        if (total + card.load > LOAD_CAP) { setMessage('载荷超限'); return; }
        const node = makeNode(card);
        onChange({ rootId: node.id, nodes: { ...tree.nodes, [node.id]: node } });
        setMessage(`树根 =「${card.name}」`);
    }

    function addChildToPort(card: SkillCard) {
        if (!selectedSlot) return;
        const parent = tree.nodes[selectedSlot.nodeId];
        if (!parent) return;
        if (!canChild(parent, card)) {
            setMessage('无法接入：行为插件与中继插件需交替衔接（行为 → 中继 → 行为）；赋能插件只能作为词缀附着在行为插件上。');
            return;
        }
        if (childFull(parent)) { setMessage(`「${parent.card.name}」的接口已满`); setSelectedSlot(null); return; }
        if (total + card.load > LOAD_CAP) { setMessage('载荷超限'); return; }
        onChange(attachChild(tree, selectedSlot.nodeId, card));
        setMessage(`「${parent.card.name}」下方接入「${card.name}」`);
        setSelectedSlot(null);
        setPickerTab('all');
    }

    function handleDropCard(e: React.DragEvent, nodeId: string) {
        e.preventDefault();
        e.stopPropagation();
        const raw = e.dataTransfer.getData('text/plain');
        const card = POOL.find((c) => c.id === raw);
        if (!card) return;
        const node = tree.nodes[nodeId];
        if (!node) return;

        // 赋能插件拖到行为插件 → 附着为词缀
        if (card.type === 'buff') {
            if (node.card.type !== 'attack') { setMessage('赋能插件只能附着在行为插件上。'); return; }
            if (node.affixes.length >= MAX_AFFIXES) { setMessage(`「${node.card.name}」赋能已满（上限 ${MAX_AFFIXES}）`); return; }
            if (node.affixes.includes(card.id)) { setMessage(`「${node.card.name}」已赋能「${card.name}」`); return; }
            if (treeLoad(tree) + card.load > LOAD_CAP) { setMessage('载荷超限'); return; }
            onChange(attachAffix(tree, nodeId, card.id));
            setMessage(`「${node.card.name}」赋能「${card.name}」`);
            return;
        }

        // 行为/中继插件 → 作为下一级接入
        if (!canChild(node, card)) {
            if (card.type === 'attack' && node.card.type === 'attack') setMessage('两个行为插件之间必须有中继插件衔接。');
            else if (card.type === 'link' && node.card.type === 'link') setMessage('中继插件之间需用行为插件衔接。');
            else setMessage('无法接入该插件。');
            return;
        }
        if (childFull(node)) { setMessage(`「${node.card.name}」的接口已满`); return; }
        if (treeLoad(tree) + card.load > LOAD_CAP) { setMessage('载荷超限'); return; }
        onChange(attachChild(tree, nodeId, card));
        setMessage(`「${node.card.name}」下方接入「${card.name}」`);
    }

    function chooseAffix(card: SkillCard) {
        if (!affixTarget) return;
        const node = tree.nodes[affixTarget];
        if (!node) return;
        if (node.affixes.length >= MAX_AFFIXES) { setMessage('赋能已满。'); return; }
        if (node.affixes.includes(card.id)) { setMessage(`「${node.card.name}」已赋能「${card.name}」`); return; }
        if (treeLoad(tree) + card.load > LOAD_CAP) { setMessage('载荷超限'); return; }
        onChange(attachAffix(tree, affixTarget, card.id));
        setMessage(`「${node.card.name}」赋能「${card.name}」`);
        setAffixTarget(null);
    }

    function handleRemoveAffix(nodeId: string, idx: number) {
        onChange(removeAffix(tree, nodeId, idx));
    }

    function removeNode(id: string) {
        const next: TreeState = { rootId: tree.rootId === id ? null : tree.rootId, nodes: { ...tree.nodes } };
        const stack = [id];
        while (stack.length) {
            const cur = stack.pop()!;
            const n = next.nodes[cur];
            if (!n) continue;
            n.childIds.forEach((c) => c && stack.push(c));
            delete next.nodes[cur];
        }
        Object.keys(next.nodes).forEach((k) => {
            next.nodes[k].childIds = next.nodes[k].childIds.map((c) => (c === id ? null : c));
        });
        onChange(next);
        setSelectedSlot(null);
    }

    /* —— 卡片渲染 —— */
    function cardEl(node: TNode, isRoot: boolean) {
        const card = node.card;
        const isLink = card.type === 'link';
        const outCount = card.type === 'link' ? (card.slots ?? 1) : 1;
        const children = node.childIds;
        const affixCards = node.affixes.map((aid) => POOL.find((c) => c.id === aid)).filter(Boolean) as SkillCard[];
        const affixLoad = affixCards.reduce((s, c) => s + c.load, 0);
        const nodeLoad = card.load + affixLoad;
        const canAffix = card.type === 'attack' && node.affixes.length < MAX_AFFIXES;

        return (
            <div
                className={`tn-card ${TYPE_META[card.type].cls}`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => handleDropCard(e, node.id)}
            >
                <div className="tn-in">
                    <span className={`io io-in ${isRoot ? 'root' : ''}`} title={isRoot ? '树根' : '上方输入'} />
                </div>
                <div className="cn-body">
                    <div className="cn-name">{card.name} <span className="cn-load">{nodeLoad}</span></div>
                    {isLink && (
                        <div className="cn-cond">{card.cond} · 效率 {card.effRate}</div>
                    )}
                    {affixCards.length > 0 && (
                        <div className="cn-affixes">
                            {affixCards.map((af, i) => (
                                <span key={i} className="affix-tag" onClick={() => handleRemoveAffix(node.id, i)} title={`${af.name}：${af.eff}（载荷 ${af.load}）· 点击移除`}>
                                    ◆ {af.name} <small>{af.load}</small>
                                </span>
                            ))}
                        </div>
                    )}
                    {card.type === 'attack' && (
                        <div className="cn-eff">{card.eff}</div>
                    )}
                    {card.tags && <div className="cn-tags">{card.tags.map((t) => <em key={t}>{t}</em>)}</div>}
                </div>
                {(card.type === 'attack' || card.type === 'link') && (
                    <div className="tn-out">
                        {Array.from({ length: outCount }).map((_, k) => {
                            const connected = !!children[k];
                            const active = !connected && selectedSlot?.nodeId === node.id;
                            return (
                                <button
                                    key={k}
                                    className={`io io-out ${connected ? 'connected' : ''} ${active ? 'active' : ''}`}
                                    onClick={() => { if (!connected) setSelectedSlot(active ? null : { nodeId: node.id }); }}
                                    title={connected ? `已连` : `接口 ${k + 1}`}
                                >
                                    {connected ? '●' : `○${outCount > 1 ? k + 1 : ''}`}
                                </button>
                            );
                        })}
                    </div>
                )}
                {canAffix && <span className="affix-hint" onClick={() => setAffixTarget(node.id)} title="点击或拖拽赋能插件到此卡">◆ 赋能</span>}
                <button className="cn-del" onClick={() => removeNode(node.id)}>×</button>
            </div>
        );
    }

    function renderNode(id: string): React.ReactNode {
        const node = tree.nodes[id];
        if (!node) return null;
        const maxChildren = node.card.type === 'link' ? (node.card.slots ?? 1) : 1;
        const children = node.childIds.filter((c): c is string => c !== null).slice(0, maxChildren);
        return (
            <div className="tn-branch">
                {cardEl(node, tree.rootId === id)}
                {children.length > 0 && (
                    <div className="tn-children">
                        {children.map((cid) => (
                            <div key={cid} className="tn-child">{renderNode(cid)}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    /* —— 接口弹层（只显示攻击和中继） —— */
    function renderPicker() {
        if (!selectedSlot) return null;
        const parent = tree.nodes[selectedSlot.nodeId];
        if (!parent) return null;
        const pool = POOL.filter((c) => c.type === 'attack' || c.type === 'link');
        const tabs: (CardType | 'all')[] = ['all', 'attack', 'link'];
        const filtered = pickerTab === 'all' ? pool : pool.filter((c) => c.type === pickerTab);
        const slotDesc = `${parent.card.name} 的下方接口`;
        return (
            <div className="picker">
                <div className="picker-head">
                    <span>{slotDesc}（赋能插件请点击行为卡「◆赋能」或直接拖到行为卡上）</span>
                    <button className="picker-close" onClick={() => setSelectedSlot(null)}>×</button>
                </div>
                <div className="picker-tabs">
                    {tabs.map((t) => (
                        <button key={t} className={`picker-tab ${pickerTab === t ? 'active' : ''}`} onClick={() => setPickerTab(t)}>
                            {t === 'all' ? '全部' : `${TYPE_META[t].shape}${TYPE_META[t].label}`}
                        </button>
                    ))}
                </div>
                <div className="picker-cards">
                    {filtered.map((c) => {
                        const err = total + c.load > LOAD_CAP ? '载荷超限' : null;
                        return (
                            <div key={c.id} className={`picker-card ${TYPE_META[c.type].cls}${err ? ' disabled' : ''}`} onClick={() => !err && addChildToPort(c)}>
                                <div className="pc-name">{TYPE_META[c.type].shape} {c.name}</div>
                                <div className="pc-meta">
                                    载荷 {c.load}
                                    {c.type === 'link' && ` · 一拖${c.slots}`}
                                    {c.type === 'attack' && c.tags && ` · ${c.tags.join('/')}`}
                                </div>
                                <div className="pc-eff">{c.eff}</div>
                                {err && <div className="pc-err">{err}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* —— 赋能词缀选择弹层（点击「◆赋能」触发，仅显示赋能插件） —— */
    function renderAffixPicker() {
        if (!affixTarget) return null;
        const node = tree.nodes[affixTarget];
        if (!node) return null;
        const pool = POOL.filter((c) => c.type === 'buff');
        return (
            <div className="picker">
                <div className="picker-head">
                    <span>为「{node.card.name}」选择赋能插件（每卡最多 {MAX_AFFIXES} 个）</span>
                    <button className="picker-close" onClick={() => setAffixTarget(null)}>×</button>
                </div>
                <div className="picker-cards">
                    {pool.map((c) => {
                        const used = node.affixes.includes(c.id);
                        const err = !used && total + c.load > LOAD_CAP ? '载荷超限' : null;
                        return (
                            <div key={c.id} className={`picker-card ${TYPE_META[c.type].cls}${used ? ' disabled' : ''}`} onClick={() => { if (!used && !err) chooseAffix(c); }}>
                                <div className="pc-name">{TYPE_META[c.type].shape} {c.name}</div>
                                <div className="pc-meta">载荷 {c.load}</div>
                                <div className="pc-eff">{c.eff}</div>
                                {used && <div className="pc-err">已赋能</div>}
                                {err && <div className="pc-err">{err}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* —— 树根选择 —— */
    function renderRootPicker() {
        if (tree.rootId) return null;
        const pool = POOL.filter((c) => c.type === 'attack');
        return (
            <div className="root-picker">
                <div className="rp-title">树根（选择一个行为插件起手）</div>
                <div className="rp-cards">
                    {pool.map((c) => (
                        <div key={c.id} className={`picker-card ${TYPE_META[c.type].cls}`} onClick={() => setRoot(c)}>
                            <div className="pc-name">{TYPE_META[c.type].shape} {c.name}</div>
                            <div className="pc-meta">载荷 {c.load}{c.tags && ` · ${c.tags.join('/')}`}</div>
                            <div className="pc-eff">{c.eff}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="tree-editor">
            <div className="tree-stage">
                {tree.rootId && tree.nodes[tree.rootId]
                    ? renderNode(tree.rootId)
                    : renderRootPicker()}
            </div>
            {renderPicker()}
            {renderAffixPicker()}
            <div className={`chain-foot ${over ? 'over' : ''}`}>
                整装载荷 <b>{total}</b> / {LOAD_CAP} {over && '· 超限'}
                {tree.rootId && <span className="chain-seq">结构：{treeNote(tree)}</span>}
            </div>
            <div className="chain-msg">{message}</div>
        </div>
    );
}

/* ================= 装配工作台 ================= */

function BuildPage() {
    const [trees, setTrees] = useState<Record<SlotKey, TreeState>>({
        lightA: (() => {
            const r = makeNode(POOL.find((c) => c.id === 'a1')!);
            const l = makeNode(POOL.find((c) => c.id === 'l1')!);
            const c1 = makeNode(POOL.find((c) => c.id === 'a9')!);
            const c2 = makeNode(POOL.find((c) => c.id === 'a10')!);
            r.childIds = [l.id];
            l.childIds = [c1.id, c2.id];
            r.affixes = ['b1'];
            return { rootId: r.id, nodes: { [r.id]: r, [l.id]: l, [c1.id]: c1, [c2.id]: c2 } };
        })(),
        lightB: EMPTY_TREE,
        heavy: EMPTY_TREE,
    });
    const [selected, setSelected] = useState<SlotKey>('lightA');
    const [poolTab, setPoolTab] = useState<CardType | 'all'>('all');

    const totalLoad = useMemo(() => Object.values(trees).reduce((s, t) => s + treeLoad(t), 0), [trees]);
    const over = totalLoad > LOAD_CAP;

    return (
        <div className="build">
            <div className="pool-panel">
                <div className="panel-title">构装库</div>
                <div className="pool-tabs">
                    {(['all', 'attack', 'buff', 'link'] as (CardType | 'all')[]).map((t) => (
                        <button key={t} className={`pool-tab ${poolTab === t ? 'active' : ''}`} onClick={() => setPoolTab(t)}>
                            {t === 'all' ? '全部' : `${TYPE_META[t].shape}${TYPE_META[t].label}`}
                        </button>
                    ))}
                </div>
                <div className="pool-cards">
                    {POOL.filter((c) => poolTab === 'all' || c.type === poolTab).map((c) => (
                        <div
                            key={c.id}
                            className={`pool-card ${TYPE_META[c.type].cls}`}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                        >
                            <div className="pc-name">{TYPE_META[c.type].shape} {c.name}</div>
                            <div className="pc-meta">
                                载荷 {c.load}
                                {c.type === 'link' && ` · 一拖${c.slots}`}
                                {c.type === 'attack' && c.tags && ` · ${c.tags.join('/')}`}
                            </div>
                            <div className="pc-eff">{c.eff}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="editor-panel">
                <div className="slot-tabs">
                    {SLOT_META.map((m) => (
                        <button key={m.key} className={`slot-tab ${selected === m.key ? 'active' : ''}`} onClick={() => setSelected(m.key)}>
                            {m.label} <small>{m.note}</small>
                        </button>
                    ))}
                </div>
                <div className="editor-head">
                    <span>机体整备 · 当前插槽：{SLOT_META.find((m) => m.key === selected)?.label}</span>
                    <span className={`cost-chip ${over ? 'over' : ''}`}>
                        整装载荷 {totalLoad} / {LOAD_CAP} {over && '· 超限'}
                    </span>
                </div>
                <TreeEditor
                    tree={trees[selected]}
                    onChange={(t) => setTrees((prev) => ({ ...prev, [selected]: t }))}
                />
                <div className="editor-tip">
                    机体整备 · 树状编程：点击接口圆圈接入行为/中继插件构建技能树；赋能插件可从卡池拖到行为卡，或点行为卡「◆赋能」后在选择弹层中点选（◆ 标记，每卡最多 2 个，载荷叠加）。树结构：行为 → 中继 → 行为。
                </div>
            </div>
            <div className="rules-panel">
                <div className="panel-title">设计规则速览</div>
                <ul className="rules-list">
                    <li><b>树状编程</b>：行为→中继→行为纯链结构，接口圆点对接。</li>
                    <li><b>赋能插件</b>：拖到行为卡上或点「◆赋能」后选择；每卡最多 2 个；作用于该行为插件本身；载荷叠加到所属行为卡。</li>
                    <li><b>中继插件</b>：「上方技能命中时 → 触发下方技能」；下方接口 N 个圆圈 = 一拖 N。</li>
                    <li><b>衔接规则</b>：两个行为插件之间必须有中继插件衔接。</li>
                    <li><b>载荷</b>：构装插件占载荷（含词缀），整装载荷上限 500，全部序列槽位共用。</li>
                    <li><b>中继效率</b>：条件越苛刻效率越高（可超 100%）；效率沿树继承叠乘（根卡 100% × 中继 0.6 = 60% × 0.4 = 24%）；多分支摊薄 ×0.8/个。</li>
                    <li><b>热量值</b>：根行为卡命中积攒，超限释放消耗；热量超出释放耗热的部分按比例加成伤害；中继触发的技能不产生也不消耗热量值。</li>
                    <li><b>索敌</b>：近战无控制自动索敌贴身、有控制优先控制方向；远程索敌范围大于近战；追踪插件仅作用于弹道类技能（近战不可赋予）。</li>
                    <li><b>跨树协作</b>：中继触发条件只能引用他树制造的状态。</li>
                </ul>
            </div>
        </div>
    );
}

/* ================= 施放模拟 ================= */

const HEAT_CAP = 120;        // 热量值上限（示例）
const HEAT_COST = 80;        // 超限释放耗热量（示例）
const HEAT_GAIN_ATTACK = 20; // 攻击序列根卡命中积攒（示例）
const HEAT_GAIN_HEAVY = 30;  // 重装序列根卡命中积攒（示例）

interface SimTree {
    key: string;
    name: string;
    nodes: string[];
    linkCond?: string;
}

const SIM_TREES: SimTree[] = [
    { key: 'A', name: '攻击序列 · 火拳', nodes: ['□ 火拳[范围扩大]（燃烧·普攻连段·无CD）', '○ 击中触发 0.4（一拖2）', '□ 子：余烬弹 ②火墙'] },
    { key: 'B', name: '重装序列 · 电磁指', nodes: ['□ 电磁指[双重释放]（感电·特殊攻击·CD 4s）', '□ 子：挑飞斩（破韧→失衡）', '○ 命中失衡触发 1.6', '□ 子：雷霆轰炸'], linkCond: 'stun' },
    { key: 'H', name: '超限释放 · 聚能炮', nodes: [`□ 聚能炮[贯穿+]（终结技 · 消耗热量值 ${HEAT_COST} · 溢出加成伤害）`] },
];

type SimStates = { burn: boolean; shock: boolean; erode: number; erodeUp: number; stun: boolean; mark: boolean; overload: boolean };
const INIT_SIM_STATES: SimStates = { burn: false, shock: false, erode: 0, erodeUp: 0, stun: false, mark: false, overload: false };

function SimPage() {
    const [energy, setEnergy] = useState(0);
    const [states, setStates] = useState<SimStates>(INIT_SIM_STATES);
    const [log, setLog] = useState<string[]>([
        '双序列编程：攻击序列（普攻连段·无CD）挂燃烧 → 重装序列（特殊攻击·CD）挂感电+失衡 → 跨树协作触发高倍率（燃烧+感电=爆燃）。',
    ]);
    const timers = useRef<number[]>([]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    function pushLog(msg: string) { setLog((prev) => [...prev.slice(-9), msg]); }
    function later(ms: number, fn: () => void) { timers.current.push(window.setTimeout(fn, ms)); }

    function applyState(name: 'burn' | 'shock' | 'erode' | 'stun' | 'mark') {
        setStates((prev) => {
            const next = { ...prev };
            if (name === 'burn') next.burn = true;
            if (name === 'shock') next.shock = true;
            if (name === 'erode') {
                if (next.erodeUp > 0) {
                    if (next.erodeUp < 4) { next.erodeUp++; pushLog('电蚀叠层 ' + next.erodeUp + '/4（出伤加快）'); }
                    else { pushLog('电蚀已满层 4/4（刷新持续时间）'); }
                } else if (next.erode < 3) {
                    next.erode++; if (next.erode > 1) pushLog('侵蚀叠层 ' + next.erode + '/3（刷新持续时间）');
                }
            }
            if (name === 'stun') next.stun = true;
            if (name === 'mark') { next.mark = true; later(5000, () => setStates((p) => ({ ...p, mark: false }))); }

            // 反应①爆燃：燃烧 + 感电 → 范围伤害 + 短暂过载（快速恢复的减速，不禁行动），消耗双状态
            if (next.burn && next.shock) {
                next.burn = false; next.shock = false; next.overload = true;
                pushLog('💥 反应「爆燃」：燃烧 + 感电 → 范围伤害 + 短暂过载（快速恢复的减速，不禁行动）');
                later(1500, () => { setStates((p) => ({ ...p, overload: false })); pushLog('过载结束（快速恢复）'); });
            }
            // 反应②电蚀：感电 + 侵蚀共存 → 侵蚀升级为电蚀（上限+1、出伤加快），感电保留
            else if (next.shock && next.erode > 0) {
                next.erodeUp = Math.min(4, next.erode);
                next.erode = 0;
                pushLog('⚡ 反应「电蚀」：感电 + 侵蚀 → 侵蚀升级为电蚀（上限 4、出伤加快），感电保留');
            }

            if (name === 'burn') later(4000, () => setStates((p) => ({ ...p, burn: false })));
            if (name === 'shock') later(4000, () => setStates((p) => ({ ...p, shock: false })));
            if (name === 'stun') later(3000, () => setStates((p) => ({ ...p, stun: false })));
            return next;
        });
    }

    function releaseTree(idx: number) {
        const tree = SIM_TREES[idx];
        if (!tree) return;
        if (tree.key === 'H') {
            if (energy < HEAT_COST) { pushLog(`热量值不足：超限释放需 ${HEAT_COST} 热量值（当前 ${energy}）`); return; }
            const bonus = Math.max(0, energy - HEAT_COST);
            setEnergy((e) => e - HEAT_COST);
            pushLog(`超限释放（终结技）：聚能炮[贯穿+]（闪光时停！超绝打击感）——消耗热量值 ${HEAT_COST}`);
            if (bonus > 0) pushLog(`  🔥 热量溢出 ${bonus} → 伤害加成 +${bonus}%`);
            return;
        }
        if (tree.key === 'A') {
            pushLog('攻击序列（普攻连段·无CD）→ 火拳');
            applyState('burn');
            pushLog('  中继「击中时触发」一拖二：余烬弹 / 火墙 ×0.4');
            setEnergy((e) => Math.min(HEAT_CAP, e + HEAT_GAIN_ATTACK));
        }
        if (tree.key === 'B') {
            pushLog('重装序列（特殊攻击·CD 4s）→ 电磁指');
            applyState('shock');
            // 破防插件：挑飞斩在破韧条件下制造失衡
            applyState('stun');
            pushLog('  子插件：挑飞斩 → 破韧条件下命中施加失衡（跨树制造）');
            pushLog('  中继「命中失衡敌人」→ 待失衡窗口');
            setStates((p) => (p.stun ? { ...p, stun: false } : p));
            pushLog('★ 重装树苛刻中继「命中失衡」触发雷霆轰炸 ×1.6');
            setEnergy((e) => Math.min(HEAT_CAP, e + HEAT_GAIN_HEAVY));
        }
    }

    function autoDemo() {
        pushLog('—— 双序列跨树协作演示：攻击序列 → 重装序列 ——');
        releaseTree(0); later(700, () => releaseTree(1)); later(1400, () => releaseTree(2));
    }

    return (
        <div className="sim-page">
            <div className="sim-trees">
                {SIM_TREES.map((t) => (
                    <div key={t.key} className="sim-tree">
                        <div className="sim-tree-head">
                            <b>{t.name}</b>
                            <span className="ptr-mark">{t.key !== 'H' ? `序列 ${t.key}` : '超限释放'}</span>
                        </div>
                        {t.nodes.map((n, j) => (<div key={j} className="sim-node">{n}</div>))}
                    </div>
                ))}
            </div>
            <div className="sim-console">
                <div className="sim-btns">
                    <button className="btn primary" onClick={() => releaseTree(0)}>攻击序列（普攻连段）</button>
                    <button className="btn primary" onClick={() => releaseTree(1)}>重装序列（特殊攻击）</button>
                    <button className="btn heavy" onClick={() => releaseTree(2)}>超限释放（终结技）</button>
                    <button className="btn ghost" onClick={autoDemo}>自动演示跨树</button>
                    <button className="btn ghost" onClick={() => { setEnergy(0); setStates(INIT_SIM_STATES); setLog(['已重置。']); }}>重置</button>
                </div>
                <div className="meter-row"><span>热量值</span><div className="meter"><div style={{ width: `${(energy / HEAT_CAP) * 100}%` }} /><em className="meter-th" style={{ left: `${(HEAT_COST / HEAT_CAP) * 100}%` }} title={`超限释放消耗 ${HEAT_COST}，超出此线按比例加成伤害`} /></div><b>{energy} / {HEAT_CAP}</b></div>
                <div className="meter-note">超限释放需 {HEAT_COST} 热量值，超出部分加成伤害</div>
                <div className="status-row"><span>敌人状态</span>
                    {(['burn', 'shock', 'erode', 'erodeUp', 'stun', 'mark', 'overload'] as const).map((s) => {
                        const on = s === 'erode' || s === 'erodeUp' ? states[s] > 0 : Boolean(states[s]);
                        const label = s === 'erode' ? `侵蚀${states.erode > 0 ? ' ' + states.erode : ''}` : s === 'erodeUp' ? `电蚀${states.erodeUp > 0 ? ' ' + states.erodeUp : ''}` : { burn: '燃烧', shock: '感电', stun: '失衡', mark: '标记', overload: '过载' }[s]!;
                        return <span key={s} className={`st ${on ? 'on' : ''} ${s === 'stun' ? 'stun' : ''}`}>{label}</span>;
                    })}
                </div>
                <div className="sim-log">{log.map((l, i) => <div key={i}>{l}</div>)}</div>
            </div>
        </div>
    );
}

/* ================= 入口 ================= */

export default function App() {
    const route = useMemo(
        () => defineHashPageRoute(
            [
                { id: 'build', title: '机体整备' },
                { id: 'sim', title: '施放模拟' },
            ],
            { defaultPageId: 'build' },
        ),
        [],
    );
    const { page, setPage } = useHashPage(route);

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-title">机动战姬：棘罪魔女 · 机体整备</div>
                <nav className="app-tabs">
                    {route.pages.map((p) => (
                        <button key={p.id} className={`tab ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
                            {p.title}
                        </button>
                    ))}
                </nav>
            </header>
            {page === 'build' ? <BuildPage /> : <SimPage />}
        </div>
    );
}
