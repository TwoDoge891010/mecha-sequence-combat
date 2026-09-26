/* 机甲序列战斗 — 策划需求文档 流程图初始化 */
(function () {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var fontBody = style.getPropertyValue('--font-body').trim();

  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      theme: 'base',
      fontFamily: fontBody,
      flowchart: { curve: 'basis', padding: 14 },
      themeVariables: {
        background: 'transparent',
        primaryColor: '#16202f',
        primaryBorderColor: accent,
        primaryTextColor: ink,
        secondaryColor: '#1a2436',
        secondaryBorderColor: accent2,
        secondaryTextColor: ink,
        tertiaryColor: '#121a26',
        tertiaryBorderColor: rule,
        lineColor: accent,
        textColor: ink,
        fontSize: '14px',
        edgeLabelBackground: '#121a26',
        nodeBorder: rule,
        clusterBkg: 'transparent',
        clusterBorder: rule
      }
    });
  }
})();
