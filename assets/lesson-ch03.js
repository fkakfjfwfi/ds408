/* 第 3 集《一棵树的四种走法》 · 6 幕 · 示例树 A(B(D,E), C(,F)) */
window.LESSON = {
  id: "ch03",
  title: "一棵树的四种走法",
  scenes: [
    /* S1 树=家谱 */
    { voice: "F", duration: 9, narration: "树，像一张家谱：一位祖先开枝散叶，每个成员只属于一个分支，两人之间有且只有一条路。树是递归定义的——每棵子树又是一棵树。",
      draw: function (svg, p) {
        drawTree(svg, {}, 0);
        LS.txt(svg, 480, 385, "根 A · 家谱自上而下 · 任意两结点有且仅有唯一路径", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp(p * 3 - 1, 0, 1) });
      } },
    /* S2 性质 n0=n2+1 */
    { voice: "F", duration: 11, narration: "第一个重要性质：叶子数等于度为二的结点数加一。推导两步：总结点等于三部分之和；总度数等于结点数减一。两式一减，n0 等于 n2 加一。",
      draw: function (svg, p) {
        drawTree(svg, { D: "leaf", E: "leaf", F: "leaf" }, 0);
        var t = LS.clamp(p * 3, 0, 1), t2 = LS.clamp(p * 3 - 1, 0, 1);
        LS.txt(svg, 790, 130, "① n = n₀ + n₁ + n₂", { size: 17, mono: true, weight: 700, opacity: t, anchor: "middle" });
        LS.txt(svg, 790, 170, "② n − 1 = n₁ + 2n₂", { size: 17, mono: true, weight: 700, opacity: t2, anchor: "middle" });
        LS.txt(svg, 790, 215, "① − ②：", { size: 15, opacity: Math.max(t, t2), anchor: "middle" });
        LS.txt(svg, 790, 258, "n₀ = n₂ + 1", { size: 24, mono: true, weight: 800, fill: "var(--brand)", opacity: LS.clamp(p * 3 - 1.6, 0, 1), anchor: "middle" });
        LS.txt(svg, 790, 298, "本例：3 = 2 + 1 ✓", { size: 15, fill: "var(--green)", weight: 700, opacity: LS.clamp(p * 3 - 1.8, 0, 1), anchor: "middle" });
      } },
    /* S3 先序 */
    { voice: "F", duration: 11, narration: "先序遍历，口诀根左右：每到一个点，先访问它自己，再走进左子树，最后右子树。看动画的点亮顺序——A、B、D、E、C、F。",
      draw: function (svg, p) {
        var seq = ["A", "B", "D", "E", "C", "F"];
        drawTraversal(svg, p, seq, "先序 = 根左右");
      } },
    /* S4 中序 */
    { voice: "F", duration: 11, narration: "中序遍历，口诀左根右：先把左边走干净，回来访问自己，再去右边。中序对二叉排序树有奇效——得到的正好是升序序列。",
      draw: function (svg, p) {
        var seq = ["D", "B", "E", "A", "C", "F"];
        drawTraversal(svg, p, seq, "中序 = 左根右");
      } },
    /* S5 后序+层序 */
    { voice: "M", duration: 12, narration: "后序，左右根，根最后出场，适合自底向上做统计。层序则是一层一层扫，用队列实现——第二章的队列在这里回收利用。",
      draw: function (svg, p) {
        var seq = ["D", "E", "B", "F", "C", "A"];
        drawTraversal(svg, p, seq, "后序 = 左右根", "层序（队列）：A B C D E F");
      } },
    /* S6 总结 */
    { voice: "M", duration: 12, narration: "总结：三种遍历只差根的时机。重建二叉树必须有中序：先序或后序告诉你根是谁，中序负责切出左右子树，递归下去。先序加后序不能唯一重建，这是经典陷阱。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "三种遍历，一张口诀卡", { size: 24, weight: 700 });
        var cards = [
          { x: 105, name: "先序", rule: "根 左 右", color: "var(--brand)" },
          { x: 480, name: "中序", rule: "左 根 右", color: "var(--accent)" },
          { x: 855, name: "后序", rule: "左 右 根", color: "var(--green)" }
        ];
        cards.forEach(function (c, i) {
          var show = LS.clamp(p * 4 - i * 0.7, 0, 1);
          if (show <= 0) return;
          LS.box(svg, c.x - 130, 110, 260, 130, { rx: 16, fill: "var(--card-2)", stroke: c.color, opacity: show });
          LS.txt(svg, c.x, 150, c.name + "遍历", { size: 19, weight: 800, fill: c.color, opacity: show });
          LS.txt(svg, c.x, 200, c.rule, { size: 22, weight: 800, mono: true, opacity: show });
        });
        var t2 = LS.clamp(p * 4 - 2.2, 0, 1);
        if (t2 > 0) {
          LS.box(svg, 105, 270, 750, 95, { rx: 16, fill: "var(--brand-soft)", opacity: t2 });
          LS.txt(svg, 480, 310, "重建二叉树：必须有中序！", { size: 19, weight: 800, fill: "var(--brand)", opacity: t2 });
          LS.txt(svg, 480, 345, "先序(或后序)定根 → 中序切左右 → 递归；先序+后序 ❌ 不能唯一确定", { size: 15, fill: "var(--ink-2)", opacity: t2 });
        }
      } }
  ]
};

/* 共享：示例树 A(B(D,E), C(,F)) */
var T3 = {
  nodes: { A: [480, 95], B: [300, 185], C: [660, 185], D: [210, 285], E: [390, 285], F: [570, 285] },
  edges: [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"], ["C", "F"]]
};
function drawTree(svg, marks, pulse) {
  LS.clear(svg);
  T3.edges.forEach(function (e) {
    var a = T3.nodes[e[0]], b = T3.nodes[e[1]];
    LS.el("line", { x1: a[0], y1: a[1] + 26, x2: b[0], y2: b[1] - 26, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
  });
  Object.keys(T3.nodes).forEach(function (k) {
    var n = T3.nodes[k];
    var m = marks[k];
    var fill = m === "visited" ? "var(--brand-soft)" : m === "leaf" ? "var(--green-soft)" : "var(--svg-fill)";
    var stroke = m === "cur" ? "var(--accent)" : m === "visited" || m === "leaf" ? (m === "leaf" ? "var(--green)" : "var(--brand)") : "var(--line)";
    LS.circle(svg, n[0], n[1], 26, { fill: fill, stroke: stroke, sw: m === "cur" ? 4 : 2.5 });
    LS.txt(svg, n[0], n[1] + 7, k, { size: 19, weight: 800 });
    if (m === "cur") {
      LS.txt(svg, n[0], n[1] - 38, "▲ 访问", { size: 13, fill: "var(--accent)", weight: 700 });
    }
    if (m === "leaf") LS.txt(svg, n[0], n[1] + 46, "叶子", { size: 11, fill: "var(--green)" });
  });
}
function drawTraversal(svg, p, seq, title, extra) {
  var k = Math.min(seq.length, Math.floor(p * seq.length * 1.15 + 0.001));
  var marks = {};
  for (var i = 0; i < k && i < seq.length; i++) marks[seq[i]] = "visited";
  if (k > 0 && k <= seq.length) marks[seq[Math.min(k, seq.length) - 1]] = k <= seq.length ? "cur" : "visited";
  drawTree(svg, marks, p);
  LS.txt(svg, 480, 40, title, { size: 22, weight: 800 });
  var shown = seq.slice(0, Math.max(0, Math.min(k, seq.length))).join(" → ");
  LS.txt(svg, 480, 362, "序列：" + (shown || "……"), { size: 18, weight: 800, fill: "var(--brand)", mono: true });
  if (extra) LS.txt(svg, 480, 392, extra, { size: 14, fill: "var(--ink-2)" });
}
initLesson();
