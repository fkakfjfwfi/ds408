/* 第 5 章交互实验室：BST / 散列表（线性探测） */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function E(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function T(parent, x, y, s, size, fill, w, mono) {
    var t = E("text", { x: x, y: y, "text-anchor": "middle", "font-size": size || 15,
      fill: fill || "var(--svg-ink)", "font-weight": w || 600,
      "font-family": mono ? "Consolas,monospace" : "inherit" }, parent);
    t.textContent = s; return t;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ── BST 实验室 ── */
  var bst = null, busy = false;
  var bSvg = document.getElementById("bst-svg"), bNote = document.getElementById("bst-note");
  function insertB(v) {
    if (!bst) { bst = { val: v, l: null, r: null }; return; }
    var cur = bst;
    for (;;) {
      if (v < cur.val) { if (!cur.l) { cur.l = { val: v, l: null, r: null }; return; } cur = cur.l; }
      else { if (!cur.r) { cur.r = { val: v, l: null, r: null }; return; } cur = cur.r; }
    }
  }
  function layout() {
    var pos = {}, xi = 0, depth = 0, maxD = 0;
    (function walk(n) {
      if (!n) return;
      walk(n.l);
      pos[n.val] = { x: 60 + xi * 74, y: 60 + depth * 78 };
      xi++; depth++; maxD = Math.max(maxD, depth); walk(n.r); depth--;
    })(bst);
    return { pos: pos, w: 120 + xi * 74 };
  }
  function drawB(hot) {
    bSvg.innerHTML = "";
    if (!bst) { T(bSvg, 430, 150, "空树", 16, "var(--ink-3)", 400); return; }
    var L = layout();
    bSvg.setAttribute("viewBox", "0 0 " + Math.max(860, L.w) + " 300");
    (function edges(n) {
      if (!n) return;
      if (n.l) { var a = L.pos[n.val], b = L.pos[n.l.val]; E("line", { x1: a.x, y1: a.y + 24, x2: b.x, y2: b.y - 24, stroke: "var(--line)", "stroke-width": 2.5 }, bSvg); edges(n.l); }
      if (n.r) { var a2 = L.pos[n.val], b2 = L.pos[n.r.val]; E("line", { x1: a2.x, y1: a2.y + 24, x2: b2.x, y2: b2.y - 24, stroke: "var(--line)", "stroke-width": 2.5 }, bSvg); edges(n.r); }
    })(bst);
    Object.keys(L.pos).forEach(function (k) {
      var p = L.pos[k], isHot = hot === +k;
      E("circle", { cx: p.x, cy: p.y, r: 26, fill: isHot ? "var(--accent-soft)" : "var(--svg-fill)",
        stroke: isHot ? "var(--accent)" : "var(--brand)", "stroke-width": isHot ? 4 : 2.5 }, bSvg);
      T(bSvg, p.x, p.y + 6, k, 17, isHot ? "var(--accent)" : "var(--svg-ink)", 800);
    });
  }
  function bMsg(m) { bNote.innerHTML = m; }
  document.getElementById("bst-reset").addEventListener("click", function () {
    bst = null; [34, 21, 56, 12, 28].forEach(insertB); drawB();
    bMsg("已载入示例树（34,21,56,12,28）。试试再插入 27 和 13，然后中序读一遍——还是递增的吗？");
  });
  document.getElementById("bst-ins").addEventListener("click", async function () {
    if (busy) return;
    var v = parseInt(document.getElementById("bst-val").value, 10);
    if (isNaN(v)) { bMsg("请输入数字"); return; }
    busy = true;
    if (!bst) { bst = { val: v, l: null, r: null }; drawB(v); bMsg("空树，" + v + " 成为根结点。"); busy = false; return; }
    var cur = bst, path = [cur.val];
    drawB(cur.val);
    for (;;) {
      if (v === cur.val) { bMsg("⚠️ " + v + " 已存在，BST 通常不插重复值。"); busy = false; return; }
      await sleep(650);
      if (v < cur.val) {
        bMsg(v + " < " + cur.val + " → 左拐"); 
        if (!cur.l) { await sleep(500); cur.l = { val: v, l: null, r: null }; drawB(v); break; }
        cur = cur.l;
      } else {
        bMsg(v + " > " + cur.val + " → 右拐");
        if (!cur.r) { await sleep(500); cur.r = { val: v, l: null, r: null }; drawB(v); break; }
        cur = cur.r;
      }
      path.push(cur.val);
      drawB(cur.val);
    }
    await sleep(400);
    bMsg("✅ " + v + " 插入完成，比较了 " + path.length + " 次，落在叶子位置。路径：" + path.join(" → ") + " → <b>" + v + "</b>");
    busy = false;
  });
  document.getElementById("bst-find").addEventListener("click", async function () {
    if (busy || !bst) { if (!bst) bMsg("树为空，先插入或重置。"); return; }
    busy = true;
    var v = parseInt(document.getElementById("bst-val").value, 10);
    var cur = bst, cnt = 1;
    drawB(cur.val);
    for (;;) {
      await sleep(700);
      if (v === cur.val) { bMsg("✅ 找到 " + v + "，共比较 " + cnt + " 次。"); busy = false; return; }
      if (v < cur.val) {
        bMsg(v + " < " + cur.val + " → 往左找");
        if (!cur.l) { await sleep(400); bMsg("❌ 左子树为空，" + v + " 不存在（共比较 " + cnt + " 次）。这就是“失败结点”。"); busy = false; return; }
        cur = cur.l;
      } else {
        bMsg(v + " > " + cur.val + " → 往右找");
        if (!cur.r) { await sleep(400); bMsg("❌ 右子树为空，" + v + " 不存在（共比较 " + cnt + " 次）。"); busy = false; return; }
        cur = cur.r;
      }
      cnt++; drawB(cur.val);
    }
  });
  document.getElementById("bst-reset").click(); // 载入示例

  /* ── 哈希实验室 ── */
  var HCAP = 7, ht = new Array(HCAP).fill(null), hBusy = false;
  var hSvg = document.getElementById("hash-svg"), hNote = document.getElementById("hash-note");
  function drawH(probe) {
    hSvg.innerHTML = "";
    var w = 100, gap = 22, x0 = (860 - (w * HCAP + gap * (HCAP - 1))) / 2, y = 60;
    for (var i = 0; i < HCAP; i++) {
      var has = ht[i] != null;
      var isProbe = probe === i;
      E("rect", { x: x0 + i * (w + gap), y: y, width: w, height: 62, rx: 10,
        fill: isProbe ? "var(--accent-soft)" : has ? "var(--svg-fill)" : "var(--card)",
        stroke: isProbe ? "var(--accent)" : has ? "var(--brand)" : "var(--line)", "stroke-width": has || isProbe ? 2 : 1.5 }, hSvg);
      T(hSvg, x0 + i * (w + gap) + w / 2, y + 38, has ? ht[i] : "空", has ? 18 : 13, has ? "var(--svg-ink)" : "var(--ink-3)");
      T(hSvg, x0 + i * (w + gap) + w / 2, y + 88, "下标 " + i + "（H=k%7=" + i + "）", 11.5, "var(--ink-3)", 400);
    }
    var n = ht.filter(function (x) { return x != null; }).length;
    T(hSvg, 430, 170, "装填因子 α = " + n + "/" + HCAP + " = " + (n / HCAP).toFixed(2) + "（α 越大冲突越多）", 14, "var(--ink-2)", 700);
  }
  function hMsg(m) { hNote.innerHTML = m; }
  document.getElementById("hash-reset").addEventListener("click", function () {
    ht = new Array(HCAP).fill(null); drawH(); hMsg("已清空。按顺序点 23 → 14 → 9，观察 9 被迫“搬家”；再点 30、16 看连锁堆积。");
  });
  document.querySelectorAll("[data-hv]").forEach(function (b) {
    b.addEventListener("click", async function () {
      if (hBusy) return;
      var v = parseInt(b.getAttribute("data-hv"), 10);
      if (ht.indexOf(v) >= 0) { hMsg(v + " 已在表中。"); return; }
      hBusy = true;
      var h = v % HCAP, i = h, cnt = 1;
      hMsg(v + " % 7 = " + h + "，先探测下标 " + h + "……");
      for (;;) {
        drawH(i);
        if (ht[i] == null) {
          await sleep(600);
          ht[i] = v; drawH();
          hMsg("✅ " + v + " 存入下标 " + i + "，共探测 " + cnt + " 次（这次插入的比较次数 = 以后成功查找它的比较次数）。");
          hBusy = false; return;
        }
        await sleep(700);
        hMsg("下标 " + i + " 已被 " + ht[i] + " 占用 → 线性探测 +1 → " + ((i + 1) % HCAP));
        i = (i + 1) % HCAP; cnt++;
        if (cnt > HCAP) { hMsg("❌ 表满，插入失败。"); hBusy = false; return; }
      }
    });
  });
  drawH();
})();
