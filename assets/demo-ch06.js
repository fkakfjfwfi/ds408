/* 第 6 章交互实验室：排序可视化（冒泡/插入/选择/快排 逐步动画） */
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
    var t = E("text", { x: x, y: y, "text-anchor": "middle", "font-size": size || 15, fill: fill || "var(--svg-ink)", "font-weight": w || 600 }, parent);
    t.textContent = s; return t;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var ORIG = [38, 55, 24, 71, 13, 46, 62, 30];
  var svg = document.getElementById("sort-svg");
  var noteEl = document.getElementById("sort-note");
  var statEl = document.getElementById("sort-stat");
  var runId = 0;

  function draw(a, marks) {
    svg.innerHTML = "";
    var w = 78, gap = 22, x0 = (860 - (w * a.length + gap * (a.length - 1))) / 2, baseY = 210;
    var max = Math.max.apply(null, a);
    a.forEach(function (v, i) {
      var h = 26 + (v / max) * 140;
      var m = marks && marks[i];
      E("rect", { x: x0 + i * (w + gap), y: baseY - h, width: w, height: h, rx: 7,
        fill: m === "pivot" ? "var(--accent-soft)" : m === "cmp" ? "var(--brand-soft)" : m === "swap" ? "var(--red-soft)" : m === "done" ? "var(--green-soft)" : "var(--svg-fill)",
        stroke: m === "pivot" ? "var(--accent)" : m === "cmp" ? "var(--brand)" : m === "swap" ? "var(--red)" : m === "done" ? "var(--green)" : "var(--line)", "stroke-width": 2 }, svg);
      T(svg, x0 + i * (w + gap) + w / 2, baseY - h - 10, v + "", 14, m === "swap" ? "var(--red)" : "var(--ink-2)", 800);
      T(svg, x0 + i * (w + gap) + w / 2, baseY + 22, i + "", 11, "var(--ink-3)", 400);
    });
  }
  function reset() {
    runId++;
    draw(ORIG, {});
    noteEl.innerHTML = "数组：38 55 24 71 13 46 62 30 —— 点一个算法开始（橙=枢轴/关键，蓝=比较，红=交换，绿=已归位）";
    statEl.textContent = "";
  }

  /* 生成步骤序列：每步 {a, m, note} */
  function genBubble(a0) {
    var a = a0.slice(), steps = [], cmp = 0, sw = 0, n = a.length;
    for (var i = 0; i < n - 1; i++) {
      var moved = false;
      for (var j = 0; j < n - 1 - i; j++) {
        cmp++;
        var m = {}; m[j] = "cmp"; m[j + 1] = "cmp";
        for (var d = n - i; d < n; d++) m[d] = "done";
        steps.push({ a: a.slice(), m: m, note: "比较 " + a[j] + " 和 " + a[j + 1] + "：相邻两张比一比" });
        if (a[j] > a[j + 1]) {
          var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; sw++; moved = true;
          m = {}; m[j] = "swap"; m[j + 1] = "swap";
          for (var d2 = n - i; d2 < n; d2++) m[d2] = "done";
          steps.push({ a: a.slice(), m: m, note: a[j + 1] + " > " + a[j] + " → 交换！大的往右沉" });
        }
      }
      var me = {}; me[n - 1 - i] = "done";
      steps.push({ a: a.slice(), m: me, note: "第 " + (i + 1) + " 趟结束：" + a[n - 1 - i] + " 归位" });
      if (!moved) { steps.push({ a: a.slice(), m: {}, note: "本趟无交换 → 已有序，提前结束（冒泡独有的剪枝）" }); break; }
    }
    return { steps: steps, cmp: cmp, sw: sw };
  }
  function genInsert(a0) {
    var a = a0.slice(), steps = [], cmp = 0, sw = 0, n = a.length;
    steps.push({ a: a.slice(), m: { 0: "done" }, note: "第 0 张牌默认在手牌区" });
    for (var i = 1; i < n; i++) {
      var key = a[i], j = i - 1;
      var m0 = {}; m0[i] = "pivot";
      steps.push({ a: a.slice(), m: m0, note: "抓起新牌 " + key + "，往左边手牌里插" });
      while (j >= 0 && a[j] > key) {
        cmp++;
        a[j + 1] = a[j]; sw++;
        var m1 = {}; m1[j] = "cmp"; m1[j + 1] = "swap";
        steps.push({ a: a.slice(), m: m1, note: key + " < " + a[j] + " → " + a[j] + " 右移让位" });
        j--;
      }
      if (j >= 0) cmp++;
      a[j + 1] = key;
      var m2 = {}; m2[j + 1] = "done";
      steps.push({ a: a.slice(), m: m2, note: key + " 插入下标 " + (j + 1) + " ✅" });
    }
    return { steps: steps, cmp: cmp, sw: sw };
  }
  function genSelect(a0) {
    var a = a0.slice(), steps = [], cmp = 0, sw = 0, n = a.length;
    for (var i = 0; i < n - 1; i++) {
      var min = i;
      for (var j = i + 1; j < n; j++) {
        cmp++;
        var m = {}; m[i] = "pivot"; m[min] = "cmp"; m[j] = "cmp";
        steps.push({ a: a.slice(), m: m, note: "把 " + a[j] + " 和当前最小 " + a[min] + " 比一比" });
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) {
        var t = a[i]; a[i] = a[min]; a[min] = t; sw++;
        var m2 = {}; m2[i] = "swap"; m2[min] = "swap";
        steps.push({ a: a.slice(), m: m2, note: "本圈最小 " + a[i] + " 换到队头（长距离交换 → 这就是不稳定的来源）" });
      } else {
        var m3 = {}; m3[i] = "done";
        steps.push({ a: a.slice(), m: m3, note: a[i] + " 本来就在队头，不用换" });
      }
    }
    return { steps: steps, cmp: cmp, sw: sw };
  }
  function genQuick(a0) {
    var a = a0.slice(), steps = [], cmp = 0, sw = 0;
    function markDone(m, lo, hi) { for (var k = lo; k <= hi; k++) m[k] = "done"; }
    function part(lo, hi) {
      var pivot = a[lo], hole = lo, L = lo, H = hi;
      var m0 = {}; m0[hole] = "pivot";
      steps.push({ a: a.slice(), m: m0, note: "枢轴 = " + pivot + "（下标 " + lo + "），离场留坑" });
      while (L < H) {
        while (L < H && a[H] >= pivot) { cmp++; H--; }
        if (L < H) { a[hole] = a[H]; hole = H; sw++; cmp++;
          var m1 = {}; m1[hole] = "pivot"; m1[H] = "swap";
          steps.push({ a: a.slice(), m: m1, note: a[H] + " < " + pivot + " → 从右边填坑，坑挪到 " + H }); }
        while (L < H && a[L] <= pivot) { cmp++; L++; }
        if (L < H) { a[hole] = a[L]; hole = L; sw++; cmp++;
          var m2 = {}; m2[hole] = "pivot"; m2[L] = "swap";
          steps.push({ a: a.slice(), m: m2, note: a[L] + " > " + pivot + " → 从左边填坑，坑挪到 " + L }); }
      }
      a[hole] = pivot;
      var m3 = {}; m3[hole] = "done";
      steps.push({ a: a.slice(), m: m3, note: pivot + " 归位下标 " + hole + " ✅ 左半递归 [" + lo + "," + (hole - 1) + "]，右半递归 [" + (hole + 1) + "," + hi + "]" });
      if (lo < hole - 1) part(lo, hole - 1);
      if (hole + 1 < hi) part(hole + 1, hi);
    }
    part(0, a.length - 1);
    var mf = {}; markDone(mf, 0, a.length - 1);
    steps.push({ a: a.slice(), m: mf, note: "🎉 全部归位，排序完成！" });
    return { steps: steps, cmp: cmp, sw: sw };
  }

  async function play(genFn, name) {
    var id = ++runId;
    var res = genFn(ORIG.slice());
    var totalCmp = 0, totalSw = 0;
    for (var i = 0; i < res.steps.length; i++) {
      if (id !== runId) return;
      var s = res.steps[i];
      draw(s.a, s.m);
      noteEl.innerHTML = "[" + name + "] 第 " + (i + 1) + " 步：" + s.note;
      totalCmp++; // 近似计数：以步数展示节奏
      statEl.textContent = "已播放 " + (i + 1) + " / " + res.steps.length + " 步";
      await sleep(520);
    }
    if (id === runId) {
      noteEl.innerHTML = "✅ [" + name + "] 演示完成，共 " + res.steps.length + " 步。换个算法对比步数差异！";
      statEl.textContent = "";
    }
  }
  document.querySelectorAll("[data-sort]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-sort");
      if (k === "bubble") play(genBubble, "冒泡");
      else if (k === "insert") play(genInsert, "插入");
      else if (k === "select") play(genSelect, "选择");
      else if (k === "quick") play(genQuick, "快排");
    });
  });
  document.getElementById("sort-reset").addEventListener("click", reset);
  reset();
})();
