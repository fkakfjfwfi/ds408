/* 第 2 章交互实验室：栈 / 循环队列 */
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
    var t = E("text", { x: x, y: y, "text-anchor": "middle", "font-size": size || 16,
      fill: fill || "var(--svg-ink)", "font-weight": w || 600,
      "font-family": mono ? "Consolas,monospace" : "inherit" }, parent);
    t.textContent = s; return t;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var LETTERS = "ABCDEGHIJKLMN".split("");
  var li = 0;

  /* ── 栈实验室 ── */
  var stk = [], CAP = 6, busy = false;
  var sSvg = document.getElementById("stk-svg"), sNote = document.getElementById("stk-note");
  function drawStk(pushing, popping) {
    sSvg.innerHTML = "";
    var cx = 430, w = 110, h = 30, topY = 24;
    E("rect", { x: cx - w / 2 - 16, y: topY - 8, width: w + 32, height: h * CAP + 36, rx: 16, fill: "var(--card-2)", stroke: "var(--brand)", "stroke-width": 2.5 }, sSvg);
    T(sSvg, cx - w / 2 - 40, topY - 14, "栈底", 13, "var(--ink-3)", 400);
    T(sSvg, cx - w / 2 - 40, topY + h * CAP + 20, "栈顶方向 ↑", 13, "var(--ink-3)", 400);
    for (var i = 0; i < stk.length; i++) {
      var y = topY + h * CAP - (i + 1) * h + 6;
      var hot = (pushing && i === stk.length - 1) || (popping && i === stk.length - 1);
      E("rect", { x: cx - w / 2, y: y, width: w, height: h - 4, rx: 7,
        fill: hot ? "var(--accent-soft)" : "var(--svg-fill)", stroke: hot ? "var(--accent)" : "var(--brand)", "stroke-width": hot ? 2.5 : 1.5 }, sSvg);
      T(sSvg, cx, y + 20, stk[i], 16);
    }
    // top 指针
    var ty = stk.length ? topY + h * CAP - stk.length * h + 6 + h / 2 - 2 : topY + h * CAP + 16;
    T(sSvg, cx + w / 2 + 34, ty + 5, "← top=" + (stk.length ? stk.length - 1 : -1), 13, "var(--brand)", 700, true);
    T(sSvg, 790, 120, "length = " + stk.length, 15, "var(--ink-2)", 700);
    T(sSvg, 790, 150, "MaxSize = " + CAP, 15, "var(--ink-3)", 400);
    T(sSvg, 790, 180, stk.length === 0 ? "状态：栈空" : stk.length === CAP ? "状态：栈满" : "状态：正常", 14, stk.length === 0 || stk.length === CAP ? "var(--red)" : "var(--green)", 700);
  }
  function sMsg(m) { sNote.innerHTML = m; }
  document.getElementById("stk-reset").addEventListener("click", function () { stk = []; drawStk(); sMsg("已清空栈。top = −1 表示空栈。"); });
  document.getElementById("stk-push").addEventListener("click", async function () {
    if (busy) return;
    if (stk.length >= CAP) { sMsg("❌ <b>上溢（overflow）</b>：栈满还要 push！顺序栈必须判满。"); drawStk(); return; }
    busy = true;
    stk.push(LETTERS[li++ % LETTERS.length]);
    drawStk(true);
    sMsg("push 成功：top 从 " + (stk.length - 2) + " 变为 " + (stk.length - 1) + "（若约定 top 指向栈顶元素）。");
    await sleep(300); busy = false;
  });
  document.getElementById("stk-pop").addEventListener("click", async function () {
    if (busy) return;
    if (stk.length === 0) { sMsg("❌ <b>下溢（underflow）</b>：空栈还要 pop！这是合法的“栈空”信号，常用于算法终止判断。"); return; }
    busy = true;
    var v = stk.pop();
    drawStk(false, true);
    sMsg("pop 弹出 <b>" + v + "</b>——最后进去的先出来（LIFO）。");
    await sleep(300); busy = false;
  });
  drawStk();

  /* ── 循环队列实验室 ── */
  var QCAP = 6, q = { arr: new Array(QCAP).fill(null), front: 0, rear: 0, busy: false };
  var qSvg = document.getElementById("que-svg"), qNote = document.getElementById("que-note");
  function drawQ(hotIdx) {
    qSvg.innerHTML = "";
    var w = 100, gap = 24, x0 = (860 - (w * QCAP + gap * (QCAP - 1))) / 2, y = 80;
    for (var i = 0; i < QCAP; i++) {
      var has = q.arr[i] != null;
      var isHot = hotIdx === i;
      E("rect", { x: x0 + i * (w + gap), y: y, width: w, height: 70, rx: 10,
        fill: isHot ? "var(--accent-soft)" : has ? "var(--svg-fill)" : "var(--card)",
        stroke: isHot ? "var(--accent)" : has ? "var(--brand)" : "var(--line)", "stroke-width": has || isHot ? 2 : 1.5 }, qSvg);
      T(qSvg, x0 + i * (w + gap) + w / 2, y + 44, has ? q.arr[i] : "空", has ? 18 : 13, has ? "var(--svg-ink)" : "var(--ink-3)");
      T(qSvg, x0 + i * (w + gap) + w / 2, y + 96, "下标 " + i, 12, "var(--ink-3)", 400);
    }
    // front / rear 标记
    function mark(idx, color, name) {
      var x = x0 + idx * (w + gap) + w / 2;
      E("line", { x1: x, y1: y - 26, x2: x, y2: y - 6, stroke: color, "stroke-width": 3 }, qSvg);
      E("polygon", { points: (x - 6) + " " + (y - 10) + ", " + (x + 6) + " " + (y - 10) + ", " + x + " " + (y - 2), fill: color }, qSvg);
      T(qSvg, x, y - 34, name + "=" + idx, 15, color, 800, true);
    }
    mark(q.front, "var(--green)", "front");
    mark(q.rear, "var(--accent)", "rear");
    var cnt = (q.rear - q.front + QCAP) % QCAP;
    T(qSvg, 430, 220, "(rear − front + 6) % 6 = (" + q.rear + " − " + q.front + " + 6) % 6 = " + cnt, 16, "var(--ink-2)", 700, true);
  }
  function qMsg(m) { qNote.innerHTML = m; }
  document.getElementById("que-reset").addEventListener("click", function () {
    q.arr = new Array(QCAP).fill(null); q.front = 0; q.rear = 0; drawQ();
    qMsg("已重置：front = 0，rear = 0 → 空队。front 指队头元素，rear 指下一个入队位置。");
  });
  document.getElementById("que-in").addEventListener("click", async function () {
    if (q.busy) return;
    if ((q.rear + 1) % QCAP === q.front) {
      drawQ(); qMsg("❌ <b>队满</b>：(rear+1) % 6 == front。牺牲一格方案下最多存 5 个元素——rear 后面那一格永远空着。"); return;
    }
    q.busy = true;
    var v = "v" + (li++ % 9 + 1);
    q.arr[q.rear] = v; drawQ(q.rear);
    var oldRear = q.rear;
    q.rear = (q.rear + 1) % QCAP;
    await sleep(500); drawQ();
    q.busy = false;
    qMsg("✅ " + v + " 存入下标 " + oldRear + "，rear = (" + oldRear + " + 1) % 6 = <b>" + q.rear + "</b>" + (oldRear === 5 ? "（绕回起点！这就是取模魔法）" : ""));
  });
  document.getElementById("que-out").addEventListener("click", async function () {
    if (q.busy) return;
    if (q.front === q.rear) { drawQ(); qMsg("❌ <b>队空</b>：front == rear。出队前要判空！"); return; }
    q.busy = true;
    var v = q.arr[q.front]; q.arr[q.front] = null; drawQ(q.front);
    var oldFront = q.front;
    q.front = (q.front + 1) % QCAP;
    await sleep(500); drawQ();
    q.busy = false;
    qMsg("✅ " + v + " 从下标 " + oldFront + " 出队，front = (" + oldFront + " + 1) % 6 = <b>" + q.front + "</b>。空出来的格子留给绕圈的 rear 复用——假溢出被消灭。");
  });
  drawQ();
})();
