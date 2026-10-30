/* 第 1 章交互实验室：顺序表 / 单链表 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function E(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function T(parent, x, y, s, size, fill, w) {
    var t = E("text", { x: x, y: y, "text-anchor": "middle", "font-size": size || 16, fill: fill || "var(--svg-ink)", "font-weight": w || 600 }, parent);
    t.textContent = s; return t;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ── 顺序表实验室 ── */
  var seq = { data: [3, 7, 11, 15, 19], cap: 7, busy: false };
  var seqSvg = document.getElementById("seq-svg");
  var seqNote = document.getElementById("seq-note");
  function drawSeq(hotIdx, hotFill) {
    seqSvg.innerHTML = "";
    var w = 92, gap = 16, x0 = (860 - (w * seq.cap + gap * (seq.cap - 1))) / 2, y = 30;
    for (var i = 0; i < seq.cap; i++) {
      var has = i < seq.data.length;
      var isHot = hotIdx === i;
      E("rect", { x: x0 + i * (w + gap), y: y, width: w, height: 64, rx: 10,
        fill: isHot ? (hotFill || "var(--accent-soft)") : (has ? "var(--svg-fill)" : "var(--card)"),
        stroke: isHot ? "var(--accent)" : (has ? "var(--brand)" : "var(--line)"), "stroke-width": has ? 2 : 1 }, seqSvg);
      if (has) T(seqSvg, x0 + i * (w + gap) + w / 2, y + 40, seq.data[i], 20);
      T(seqSvg, x0 + i * (w + gap) + w / 2, y + 88, i + "", 12, "var(--ink-3)", 400);
      if (i === 0) T(seqSvg, x0 - 40, y + 40, "LOC", 12, "var(--ink-3)", 400);
    }
    T(seqSvg, 430, 140, "表长 length = " + seq.data.length + "　MaxSize = " + seq.cap, 14, "var(--ink-2)", 400);
  }
  function seqMsg(m) { seqNote.textContent = m; }
  document.getElementById("seq-reset").addEventListener("click", function () {
    seq.data = [3, 7, 11, 15, 19]; drawSeq(); seqMsg("已重置：表长 5，容量 7。等你的操作。");
  });
  document.getElementById("seq-ins").addEventListener("click", async function () {
    if (seq.busy) return;
    var i = parseInt(document.getElementById("seq-pos").value, 10) - 1; // 转下标
    var v = document.getElementById("seq-val").value;
    if (isNaN(i) || i < 0 || i > seq.data.length) { seqMsg("❌ 位序非法：合法范围是 1 ~ " + (seq.data.length + 1) + "（插入允许等于表长+1）"); return; }
    if (seq.data.length >= seq.cap) { seqMsg("❌ 表已满（length ≥ MaxSize），插入前必须判满！这是真题考点。"); return; }
    seq.busy = true;
    seqMsg("第 " + (i + 1) + " 位序插入 " + v + "：从最后一个元素起，依次后移一格……");
    for (var k = seq.data.length; k > i; k--) {
      seq.data[k] = seq.data[k - 1]; seq.data[k - 1] = null; drawSeq(k, "var(--accent-soft)");
      await sleep(420);
    }
    seq.data[i] = v; drawSeq(i, "var(--green-soft)");
    seqMsg("✅ 完成！共后移 " + (seq.data.length - 1 - i) + " 个元素。位序 i 插入需移动 n−i+1 个，这里 n=" + (seq.data.length - 1) + "，正好对上。");
    seq.busy = false;
  });
  document.getElementById("seq-del").addEventListener("click", async function () {
    if (seq.busy) return;
    var i = parseInt(document.getElementById("seq-pos").value, 10) - 1;
    if (isNaN(i) || i < 0 || i >= seq.data.length) { seqMsg("❌ 删除位序非法：当前合法范围是 1 ~ " + seq.data.length); return; }
    if (seq.data.length === 0) { seqMsg("❌ 空表不能删！"); return; }
    seq.busy = true;
    var v = seq.data[i];
    seqMsg("删除位序 " + (i + 1) + "（值 " + v + "）：后面元素依次前移补位……");
    drawSeq(i, "var(--red-soft)"); await sleep(420);
    for (var k = i; k < seq.data.length - 1; k++) {
      seq.data[k] = seq.data[k + 1]; drawSeq(k, "var(--accent-soft)");
      await sleep(420);
    }
    seq.data.length--; drawSeq();
    seqMsg("✅ 完成！共前移 " + (seq.data.length - i) + " 个元素。位序 i 删除需移动 n−i 个。");
    seq.busy = false;
  });
  drawSeq();

  /* ── 单链表实验室 ── */
  var lnk = { vals: [12, 25, 33, 46], busy: false };
  var lnkSvg = document.getElementById("lnk-svg");
  var lnkNote = document.getElementById("lnk-note");
  var NW = 84, NH = 58, GAP = 74;
  function lnkX(i) { return 96 + i * (NW + GAP); }
  function drawLnk(opts) {
    opts = opts || {};
    lnkSvg.innerHTML = "";
    // head
    E("rect", { x: 8, y: 96, width: 72, height: NH, rx: 10, fill: "var(--svg-fill-2)", stroke: "var(--brand)", "stroke-width": 2 }, lnkSvg);
    T(lnkSvg, 44, 130, "head", 14);
    arrow(80, 125, 92, 125);
    lnk.vals.forEach(function (v, i) {
      var x = lnkX(i), y = 96;
      var hot = opts.hot === i, dying = opts.dying === i, ghost = opts.ghost === i;
      E("rect", { x: x, y: y, width: NW, height: NH, rx: 10,
        fill: ghost ? "var(--green-soft)" : dying ? "var(--red-soft)" : hot ? "var(--accent-soft)" : "var(--svg-fill)",
        stroke: ghost ? "var(--green)" : dying ? "var(--red)" : hot ? "var(--accent)" : "var(--line)",
        "stroke-width": (hot || dying || ghost) ? 2.5 : 1.5, opacity: dying ? .55 : 1 }, lnkSvg);
      E("line", { x1: x + NW / 2, y1: y + 18, x2: x + NW / 2, y2: y + NH - 8, stroke: "var(--line)", "stroke-width": 1 }, lnkSvg);
      T(lnkSvg, x + NW / 2 - 16, y + 38, v, 16);
      T(lnkSvg, x + NW / 2 + 16, y + 38, "●", 11, "var(--ink-3)", 400);
      T(lnkSvg, x + NW / 2, y + NH + 20, "第 " + (i + 1) + " 个", 12, "var(--ink-3)", 400);
      if (i < lnk.vals.length - 1 && !(opts.breakAfter === i)) arrow(x + NW, 125, x + NW + GAP - 4, 125, opts.dashedFrom === i);
      else if (i === lnk.vals.length - 1) T(lnkSvg, x + NW + 30, 130, "∧", 20, "var(--ink-3)", 400);
    });
    function arrow(x1, y1, x2, y2, dashed) {
      if (!lnkSvg.querySelector("defs")) {
        var defs = E("defs", {}, lnkSvg);
        var mk = E("marker", { id: "lnkArrow", markerWidth: 9, markerHeight: 7, refX: 8, refY: 3.5, orient: "auto" }, defs);
        E("polygon", { points: "0 0, 9 3.5, 0 7", fill: "var(--brand)" }, mk);
      }
      E("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "var(--brand)", "stroke-width": 2.5,
        "marker-end": "url(#lnkArrow)", "stroke-dasharray": dashed ? "6 5" : "none", opacity: dashed ? .8 : 1 }, lnkSvg);
    }
  }
  function lnkMsg(m) { lnkNote.innerHTML = m; }
  document.getElementById("lnk-reset").addEventListener("click", function () {
    lnk.vals = [12, 25, 33, 46]; drawLnk(); lnkMsg("head → 头结点数据省略 → 12 → 25 → 33 → 46 → NULL（已重置）");
  });
  document.getElementById("lnk-ins").addEventListener("click", async function () {
    if (lnk.busy) return; lnk.busy = true;
    var k = 2; // 在第 3 个结点（下标 2）后插入 27
    lnkMsg("目标：在第 3 个结点（33 的前一个 25？不——是 33）之后插入 <b>27</b>。先找到第 3 个结点 p……");
    drawLnk({ hot: k }); await sleep(700);
    lnk.vals.splice(k + 1, 0, 27);
    lnkMsg("第一步 ① <code>s->next = p->next</code>：新结点 27 先“钩住”p 的后继（虚线 = 刚建立的指针）");
    drawLnk({ ghost: k + 1, dashedFrom: k }); await sleep(900);
    lnkMsg("第二步 ② <code>p->next = s</code>：p 再拉住新结点，原本 p→后继 的旧指针自然断开");
    drawLnk({ ghost: k + 1 }); await sleep(900);
    drawLnk();
    lnkMsg("✅ 插入完成：12 → 25 → 33 → <b>27</b> → 46。全程只改两根指针，O(1)。顺序反了会怎样？第二步先执行的话 46 就丢了——回去看动画第 5 幕。");
    lnk.busy = false;
  });
  document.getElementById("lnk-del").addEventListener("click", async function () {
    if (lnk.busy) return; lnk.busy = true;
    var k = 2; // 删除第 3 个
    lnkMsg("目标：删除第 3 个结点（值 " + lnk.vals[k] + "）。第一步：<code>q = p->next</code> 先用 q 存住它……");
    drawLnk({ dying: k }); await sleep(800);
    lnkMsg("第二步：<code>p->next = q->next</code>（跳过 q 指向再下一个）——红线结点即将出局");
    drawLnk({ dying: k, breakAfter: k - 1 }); await sleep(900);
    lnk.vals.splice(k, 1);
    drawLnk();
    lnkMsg("✅ 删除完成：被删结点交给 free() 释放。口诀：先存后断，防止断链。");
    lnk.busy = false;
  });
  drawLnk();
})();
