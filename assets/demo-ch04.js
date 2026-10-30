/* 第 4 章交互实验室：BFS / DFS 图遍历动画 */
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
  var svg = document.getElementById("g-svg");
  var seqEl = document.getElementById("g-seq");
  var noteEl = document.getElementById("g-note");

  var POS = { A: [110, 130], B: [300, 55], C: [300, 225], D: [500, 55], E: [500, 225], F: [700, 140] };
  var EDGES = [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"], ["D", "F"], ["E", "F"]];
  var ADJ = { A: ["B", "C"], B: ["A", "D"], C: ["A", "E"], D: ["B", "F"], E: ["C", "F"], F: ["D", "E"] };

  /* 预计算 BFS 步骤：入队即标记，出队即访问 */
  var bfsSteps = (function () {
    var visited = { A: true }, q = ["A"], seq = [], steps = [];
    while (q.length) {
      var u = q.shift();
      seq.push(u);
      ADJ[u].forEach(function (v) {
        if (!visited[v]) { visited[v] = true; q.push(v); }
      });
      steps.push({ node: u, q: q.slice(), seq: seq.slice() });
    }
    return steps;
  })();
  /* 预计算 DFS 步骤（按字母序递归） */
  var dfsSteps = (function () {
    var visited = {}, seq = [], stack = [], steps = [];
    (function go(u) {
      visited[u] = true; seq.push(u); stack.push(u);
      steps.push({ node: u, st: stack.slice(), seq: seq.slice() });
      ADJ[u].forEach(function (v) { if (!visited[v]) go(v); });
      stack.pop();
    })("A");
    return steps;
  })();

  var timer = null, marks = {};
  function draw() {
    svg.innerHTML = "";
    EDGES.forEach(function (e) {
      var a = POS[e[0]], b = POS[e[1]];
      E("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--line)", "stroke-width": 3 }, svg);
    });
    Object.keys(POS).forEach(function (k) {
      var p = POS[k], m = marks[k];
      E("circle", { cx: p[0], cy: p[1], r: 30,
        fill: m === "cur" ? "var(--accent-soft)" : m === "visited" ? "var(--brand-soft)" : "var(--svg-fill)",
        stroke: m === "cur" ? "var(--accent)" : m === "visited" ? "var(--brand)" : "var(--line)",
        "stroke-width": m === "cur" ? 4.5 : 2.5 }, svg);
      T(svg, p[0], p[1] + 7, k, 19, m === "cur" ? "var(--accent)" : "var(--svg-ink)", 800);
      if (m === "cur") T(svg, p[0], p[1] - 46, "▲ 访问中", 13, "var(--accent)", 700);
    });
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function reset() {
    stop(); marks = {}; seqEl.textContent = ""; draw();
    noteEl.innerHTML = "邻接表：A→B,C　B→A,D　C→A,E　D→B,F　E→C,F　F→D,E（邻接点按字母序）";
  }
  function run(kind) {
    stop(); marks = {};
    var steps = kind === "bfs" ? bfsSteps : dfsSteps;
    var i = 0, seqStr = kind === "bfs" ? "BFS" : "DFS";
    noteEl.innerHTML = kind === "bfs" ? "队列演变中……（先进先出，一层层扩散）" : "递归栈演变中……（一条道走到黑，撞墙回头）";
    timer = setInterval(function () {
      Object.keys(marks).forEach(function (k) { if (marks[k] === "cur") marks[k] = "visited"; });
      if (i >= steps.length) {
        stop();
        seqEl.textContent = seqStr + "：" + steps[steps.length - 1].seq.join(" → ");
        noteEl.innerHTML = "✅ 完成！从 A 出发的 " + seqStr + " 序列：" + steps[steps.length - 1].seq.join(" → ") + "。换个按钮对比走法。";
        return;
      }
      var s = steps[i];
      marks[s.node] = "cur";
      seqEl.textContent = seqStr + "：" + s.seq.join(" → ");
      noteEl.innerHTML = (kind === "bfs" ? "队列 [" + s.q.join(", ") + "]" : "递归栈 [" + s.st.join(" → ") + "]") + "　← 第 " + (i + 1) + " 步，刚访问 " + s.node;
      draw();
      i++;
    }, 950);
  }
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.getAttribute("data-go")); });
  });
  document.getElementById("g-reset").addEventListener("click", reset);
  draw();
})();
