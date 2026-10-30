/* 第 3 章遍历实验室：四种遍历动画 */
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
  var svg = document.getElementById("trav-svg");
  var seqEl = document.getElementById("trav-seq");
  var noteEl = document.getElementById("trav-note");

  /* 树 A(B(D,E), C(,F)) */
  var tree = {
    A: { x: 430, y: 90, l: "B", r: "C" },
    B: { x: 250, y: 180, l: "D", r: "E" },
    C: { x: 610, y: 180, l: null, r: "F" },
    D: { x: 160, y: 270, l: null, r: null },
    E: { x: 340, y: 270, l: null, r: null },
    F: { x: 610, y: 270, l: null, r: null }
  };
  var orders = {
    pre: { name: "先序（根左右）", seq: ["A", "B", "D", "E", "C", "F"] },
    "in": { name: "中序（左根右）", seq: ["D", "B", "E", "A", "C", "F"] },
    post: { name: "后序（左右根）", seq: ["D", "E", "B", "F", "C", "A"] },
    level: { name: "层序（一层层扫，用队列）", seq: ["A", "B", "C", "D", "E", "F"] }
  };
  var timer = null;
  function draw(marks) {
    svg.innerHTML = "";
    Object.keys(tree).forEach(function (k) {
      var n = tree[k];
      if (n.l) E("line", { x1: n.x, y1: n.y + 26, x2: tree[n.l].x, y2: tree[n.l].y - 26, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
      if (n.r) E("line", { x1: n.x, y1: n.y + 26, x2: tree[n.r].x, y2: tree[n.r].y - 26, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
    });
    Object.keys(tree).forEach(function (k) {
      var n = tree[k], m = marks[k];
      E("circle", { cx: n.x, cy: n.y, r: 27,
        fill: m === "cur" ? "var(--accent-soft)" : m === "visited" ? "var(--brand-soft)" : "var(--svg-fill)",
        stroke: m === "cur" ? "var(--accent)" : m === "visited" ? "var(--brand)" : "var(--line)",
        "stroke-width": m === "cur" ? 4 : 2.5 }, svg);
      T(svg, n.x, n.y + 7, k, 19, m === "cur" ? "var(--accent)" : "var(--svg-ink)", 800);
      if (m === "cur") T(svg, n.x, n.y - 42, "▲ 访问中", 13, "var(--accent)", 700);
    });
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  document.querySelectorAll("[data-trav]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      stop();
      var o = orders[btn.getAttribute("data-trav")];
      var i = 0, marks = {}, collected = [];
      noteEl.innerHTML = "口诀：" + o.name + "。对照动画检查你心里的答案。";
      timer = setInterval(function () {
        if (i > 0) marks[o.seq[i - 1]] = "visited";
        if (i >= o.seq.length) {
          stop();
          seqEl.textContent = o.name + "：" + o.seq.join(" → ");
          noteEl.innerHTML = "✅ 完成！" + o.name + " 结果：" + o.seq.join(" → ") + "。换下一个按钮试试。";
          return;
        }
        marks[o.seq[i]] = "cur";
        collected.push(o.seq[i]);
        seqEl.textContent = o.name + "：" + collected.join(" → ");
        draw(marks);
        i++;
      }, 800);
    });
  });
  draw({});
})();
