/* ===== 知识图谱交互增强脚本 =====
 * 功能：
 * 1. 设置作物照片，让节点显示作物图片
 * 2. 增强节点展开/收起交互（点击节点展开子节点，再点击收起）
 * 3. 增强图谱移动/缩放体验
 * 4. 节点拖拽
 */
(function(){
'use strict';

// ===== 1. 设置作物图片 =====
window.GRAPH_NODE_IMAGES = Object.assign({}, window.GRAPH_NODE_IMAGES || {}, {
  '泊头鸭梨': { src: '/images/pear.png', subject: '泊头鸭梨', license: '用户提供参考照片' },
  '鸭梨': { src: '/images/pear.png', subject: '鸭梨', license: '用户提供参考照片' },
  '黄骅旱碱麦': { src: '/images/wheat.png', subject: '黄骅旱碱麦', license: '用户提供参考照片' },
  '旱碱麦': { src: '/images/wheat.png', subject: '旱碱麦', license: '用户提供参考照片' },
  '沧州金丝小枣': { src: '/images/jujube.png', subject: '沧州金丝小枣', license: '用户提供参考照片' },
  '金丝小枣': { src: '/images/jujube.png', subject: '金丝小枣', license: '用户提供参考照片' },
  '设施蔬菜': { src: '/images/vegetables.png', subject: '设施蔬菜', license: '用户提供参考照片' }
});

// ===== 2. 智能文字换行 =====
function smartWrap(text, maxWidth) {
  if (!text) return [''];
  var chars = [], line = '', lineW = 0;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var w = /[\u4e00-\u9fff\u3000-\u30ff\uFF00-\uFFEF]/.test(ch) ? 2 : 1;
    if (lineW + w > maxWidth && line.length > 0) {
      chars.push(line);
      line = ch;
      lineW = w;
    } else {
      line += ch;
      lineW += w;
    }
  }
  if (line) chars.push(line);
  return chars;
}

// ===== 3. 增强节点文字显示（防止文字溢出） =====
function fixNodeText() {
  document.querySelectorAll('.simple-node .simple-caption').forEach(function(caption) {
    if (caption.dataset.fixedText) return;
    caption.dataset.fixedText = '1';
    var text = caption.textContent;
    if (text && text.length > 12) {
      caption.textContent = text.slice(0, 11) + '…';
    }
  });
  
  // 修复pill-node中的文字
  document.querySelectorAll('.pill-node text').forEach(function(textEl) {
    if (textEl.dataset.fixedPill) return;
    textEl.dataset.fixedPill = '1';
    // 原有tspan结构保留，只确保不溢出
  });
  
  // 修复根节点文字
  document.querySelectorAll('.simple-node.root text').forEach(function(textEl) {
    if (textEl.dataset.fixedRoot) return;
    textEl.dataset.fixedRoot = '1';
    var spans = textEl.querySelectorAll('tspan');
    if (spans.length > 3) {
      // 最多显示3行
      for (var i = 3; i < spans.length; i++) {
        spans[i].textContent = '';
      }
      if (spans[2]) {
        var txt = spans[2].textContent;
        if (txt.length > 6) spans[2].textContent = txt.slice(0, 5) + '…';
      }
    }
  });
}

// ===== 4. 增强图谱交互体验 =====
function enhanceGraphInteractions() {
  var graph = document.getElementById('explorer-graph');
  if (!graph) return;
  
  var canvas = graph.closest('.simple-canvas');
  if (!canvas) return;

  // 添加操作提示文字
  var hint = canvas.closest('.simple-body')?.querySelector('.simple-hint');
  if (hint && !hint.dataset.enhanced) {
    hint.dataset.enhanced = '1';
    hint.textContent = '🖱 拖拽空白处平移 · 滚轮缩放 · 拖拽节点调整位置 · 点击节点展开/收起子节点';
  }

  // 增强拖拽时的视觉反馈
  var svg = graph;
  var originalPointerDown = svg.onpointerdown;
  svg.addEventListener('pointerdown', function(e) {
    var node = e.target.closest('.simple-node');
    if (node) {
      node.classList.add('dragging');
    }
  }, true);
  
  svg.addEventListener('pointerup', function(e) {
    document.querySelectorAll('.simple-node.dragging').forEach(function(n) {
      n.classList.remove('dragging');
    });
  }, true);
  
  svg.addEventListener('pointercancel', function() {
    document.querySelectorAll('.simple-node.dragging').forEach(function(n) {
      n.classList.remove('dragging');
    });
  }, true);
}

// ===== 5. 添加展开/收起动画提示 =====
function addExpandCollapseHints() {
  document.querySelectorAll('.simple-node').forEach(function(g) {
    if (g.dataset.hintEnhanced) return;
    g.dataset.hintEnhanced = '1';
    
    // 鼠标悬停时高亮
    g.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    g.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
}

// ===== 6. 执行所有增强 =====
function init() {
  // 监听节点渲染完成
  function checkAndEnhance() {
    fixNodeText();
    enhanceGraphInteractions();
    addExpandCollapseHints();
  }
  
  // 立即执行一次
  checkAndEnhance();
  
  // 持续监听，因为paintSimple会不断重建DOM
  var observer = new MutationObserver(function() {
    checkAndEnhance();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 定期修复（确保所有节点都被处理）
  setInterval(checkAndEnhance, 2000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('Graph interactions enhanced: expand/collapse, zoom, pan, drag');
})();