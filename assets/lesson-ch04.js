/* 第 4 集《一张地图的两种走法》 · 6 幕 · 示例图 A-B A-C B-D C-E D-F E-F */
window.LESSON = {
  id: "ch04",
  title: "一张地图的两种走法",
  scenes: [
    /* S1 地图类比 */
    { voice: "F", duration: 10, narration: "图，就是一张城市地图：站点是顶点，道路是边。线性表一对一，树一对多，图是多对多——任何两个顶点都可以直接相连，这是最自由的数据结构。",
      draw: function (svg, p) {
        drawG(svg, {}, p);
        LS.txt(svg, 480, 46, "图 = 地铁线路图（多对多）", { size: 23, weight: 800 });
        LS.txt(svg, 480, 375, "有向图：微博关注 · 无向图：微信好友", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp(p * 2.5 - 1, 0, 1) });
      } },
    /* S2 存储 */
    { voice: "F", duration: 11, narration: "图的存储两大门派。邻接矩阵：六乘六的二维数组，两点相邻不相邻一眼查到，代价是平方级空间；邻接表：每个顶点挂一条邻居链，稀疏图的省钱首选。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 42, "两种存法", { size: 23, weight: 800 });
        var vs = ["A", "B", "C", "D", "E", "F"];
        var adjM = { A: [0, 1, 1, 0, 0, 0], B: [1, 0, 0, 1, 0, 0], C: [1, 0, 0, 0, 1, 0], D: [0, 1, 0, 0, 0, 1], E: [0, 0, 1, 0, 0, 1], F: [0, 0, 0, 1, 1, 0] };
        // 左：邻接矩阵
        var t1 = LS.clamp(p * 3, 0, 1);
        LS.txt(svg, 250, 80, "邻接矩阵 O(n²)", { size: 16, weight: 700, fill: "var(--brand)", opacity: t1 });
        var cell = 40, gx = 105, gy = 100;
        vs.forEach(function (v, j) { LS.txt(svg, gx + 20 + j * cell, gy - 8, v, { size: 12, fill: "var(--ink-3)", opacity: t1 }); });
        vs.forEach(function (v, i) {
          LS.txt(svg, gx - 10, gy + 20 + i * cell + 5, v, { size: 12, fill: "var(--ink-3)", opacity: t1 });
          adjM[v].forEach(function (val, j) {
            if (t1 > i * 0.12 + j * 0.015) {
              LS.box(svg, gx + j * cell, gy + i * cell, cell - 3, cell - 3, { rx: 5, fill: val ? "var(--brand-soft)" : "var(--card-2)" });
              if (val) LS.txt(svg, gx + j * cell + 18, gy + i * cell + 25, "1", { size: 13, weight: 700, fill: "var(--brand)" });
            }
          });
        });
        // 右：邻接表
        var t2 = LS.clamp(p * 3 - 1.2, 0, 1);
        var nexts = { A: ["B", "C"], B: ["A", "D"], C: ["A", "E"], D: ["B", "F"], E: ["C", "F"], F: ["D", "E"] };
        LS.txt(svg, 700, 80, "邻接表 O(n+e)", { size: 16, weight: 700, fill: "var(--accent)", opacity: t2 });
        vs.forEach(function (v, i) {
          if (t2 <= i * 0.12) return;
          var y = 105 + i * 44;
          LS.box(svg, 570, y, 46, 36, { rx: 8, fill: "var(--accent-soft)" });
          LS.txt(svg, 593, y + 24, v, { size: 15, weight: 700, fill: "var(--accent)" });
          nexts[v].forEach(function (n2, k) {
            LS.arrow(svg, 616 + k * 84, y + 18, 668 + k * 84, y + 18, { sw: 2 });
            LS.box(svg, 670 + k * 84, y, 46, 36, { rx: 8, fill: "var(--svg-fill)" });
            LS.txt(svg, 693 + k * 84, y + 24, n2, { size: 15, weight: 700 });
          });
          LS.txt(svg, 852, y + 24, "∧", { size: 16, fill: "var(--ink-3)", opacity: t2 });
        });
        LS.txt(svg, 480, 380, "考点：邻接矩阵的遍历序列唯一，邻接表不唯一", { size: 16, weight: 700, fill: "var(--brand)", opacity: LS.clamp(p * 3 - 2.2, 0, 1) });
      } },
    /* S3 BFS */
    { voice: "F", duration: 13, narration: "广度优先遍历，像往水里扔石子：访问起点 A，把它的邻居 B、C 排进队列；然后一层层向外扩散。注意看队列——先进先出，正是第二章的老朋友。",
      draw: function (svg, p) {
        var order = ["A", "B", "C", "D", "E", "F"];
        var qs = [["B", "C"], ["C", "D"], ["D", "E"], ["E", "F"], ["F"], []];
        var k = Math.min(6, Math.floor(p * 6.6));
        var marks = {};
        for (var i = 0; i < Math.min(k, 6); i++) marks[order[i]] = "visited";
        if (k < 6) marks[order[k]] = "cur";
        drawG(svg, marks, p);
        LS.txt(svg, 480, 46, "BFS：波纹扩散（队列）", { size: 23, weight: 800 });
        var shown = order.slice(0, Math.max(0, Math.min(k, 6))).join(" → ");
        LS.txt(svg, 200, 320, "访问序列：" + (shown || "……"), { size: 15, weight: 700, fill: "var(--brand)", anchor: "start", mono: true });
        var q = k === 0 ? ["A"] : (k >= 1 ? qs[Math.min(k - 1, 5)] : []);
        LS.txt(svg, 200, 355, "队列状态：", { size: 14, fill: "var(--ink-3)", anchor: "start" });
        q.forEach(function (v, j) {
          LS.box(svg, 290 + j * 52, 335, 44, 34, { rx: 8, fill: "var(--green-soft)", stroke: "var(--green)" });
          LS.txt(svg, 312 + j * 52, 358, v, { size: 15, weight: 700, fill: "var(--green)" });
        });
        if (!q.length) LS.txt(svg, 300, 358, "空", { size: 13, fill: "var(--ink-3)", anchor: "start" });
        LS.txt(svg, 480, 388, "一层一层向外扩散 · 无权图的最短路就用它", { size: 14, fill: "var(--ink-2)", opacity: LS.clamp(p * 2.5 - 1.5, 0, 1) });
      } },
    /* S4 DFS */
    { voice: "M", duration: 13, narration: "深度优先，像走迷宫：从 A 冲进 B，冲进 D，冲进 F，撞到南墙再回头。看访问顺序 A、B、D、F、E、C——辅助结构是栈或递归，第三章的遍历思想原样搬过来。",
      draw: function (svg, p) {
        var order = ["A", "B", "D", "F", "E", "C"];
        var stacks = [["A"], ["A", "B"], ["A", "B", "D"], ["A", "B", "D", "F"], ["A", "B", "E"], ["A", "C"]];
        var k = Math.min(6, Math.floor(p * 6.6));
        var marks = {};
        for (var i = 0; i < Math.min(k, 6); i++) marks[order[i]] = "visited";
        if (k < 6) marks[order[k]] = "cur";
        drawG(svg, marks, p);
        LS.txt(svg, 480, 46, "DFS：走迷宫（栈/递归）", { size: 23, weight: 800 });
        var shown = order.slice(0, Math.max(0, Math.min(k, 6))).join(" → ");
        LS.txt(svg, 200, 320, "访问序列：" + (shown || "……"), { size: 15, weight: 700, fill: "var(--brand)", anchor: "start", mono: true });
        var st = k === 0 ? ["A"] : (k >= 1 ? stacks[Math.min(k - 1, 5)] : []);
        LS.txt(svg, 640, 320, "递归栈：", { size: 14, fill: "var(--ink-3)", anchor: "start" });
        LS.txt(svg, 640, 352, st.length ? st.join(" → ") : "空", { size: 16, weight: 700, fill: "var(--accent)", anchor: "start", mono: true });
        LS.txt(svg, 480, 388, "一条道走到黑，撞墙回头 · 序列与 BFS 完全不同", { size: 14, fill: "var(--ink-2)", opacity: LS.clamp(p * 2.5 - 1.5, 0, 1) });
      } },
    /* S5 最小生成树 */
    { voice: "M", duration: 12, narration: "最小生成树的 Kruskal 算法：把所有边按权值从小到大排队，逐条收购，只要不成环就要。绿色是被选中的边，最后那条红边会让图成环，果断拒绝。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 46, "Kruskal：按权收购边，不成环就要", { size: 22, weight: 800 });
        // 带权图
        var P = G4.nodes, E = [["A", "B", 6], ["A", "C", 1], ["B", "D", 5], ["C", "E", 4], ["D", "F", 3], ["E", "F", 2]];
        var accept = [["A", "C"], ["E", "F"], ["D", "F"], ["C", "E"], ["B", "D"]];
        var k = Math.min(5, Math.floor(p * 5.8)); // 已决定几条边
        var marks = {};
        E.forEach(function (e) {
          var decided = LS.clamp(p * 5.8 - E.indexOf(e), 0, 1);
          var isAccept = accept.slice(0, k).some(function (a) { return (a[0] === e[0] && a[1] === e[1]) || (a[0] === e[1] && a[1] === e[0]); });
          var rej = e[0] === "A" && e[1] === "B" && k >= 5;
          var a = P[e[0]], b = P[e[1]];
          var col = isAccept ? "var(--green)" : rej ? "var(--red)" : "var(--line)";
          LS.el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: col, "stroke-width": isAccept || rej ? 4.5 : 2.5, "stroke-dasharray": rej ? "7 6" : "none", opacity: decided > 0 ? 1 : .25 }, svg);
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          LS.circle(svg, mx, my, 14, { fill: isAccept ? "var(--green-soft)" : rej ? "var(--red-soft)" : "var(--card)", stroke: col, sw: 1.5 });
          LS.txt(svg, mx, my + 5, e[2] + "", { size: 13, weight: 700, fill: isAccept ? "var(--green)" : rej ? "var(--red)" : "var(--ink-2)" });
        });
        Object.keys(P).forEach(function (kk) {
          var on = k >= 1;
          LS.circle(svg, P[kk][0], P[kk][1], 26, { fill: on ? "var(--svg-fill)" : "var(--card)", stroke: on ? "var(--brand)" : "var(--line)", sw: 2.5 });
          LS.txt(svg, P[kk][0], P[kk][1] + 7, kk, { size: 18, weight: 800 });
        });
        var total = [1, 2, 3, 4, 5].slice(0, k).reduce(function (a2, b2) { return a2 + b2; }, 0);
        LS.txt(svg, 480, 320, "已收 " + Math.min(k, 5) + " 条（共需 5 条 = 6 − 1）· 当前总权 " + total, { size: 15, fill: "var(--ink-2)" });
        LS.txt(svg, 480, 360, "总权 15 · Prim 是“加点滚雪球”，Kruskal 是“加边收购”", { size: 15, fill: "var(--brand)", weight: 700, opacity: LS.clamp(p * 5.8 - 4.5, 0, 1) });
      } },
    /* S6 拓扑排序 */
    { voice: "M", duration: 12, narration: "拓扑排序管先修关系：每学期只修入度为零的课，修完就把它和它的边删掉，释放新的入度为零的课。中途卡住等于有环。DFS 的逆后序也是一种拓扑序。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 46, "拓扑排序：入度为 0 就“毕业”", { size: 22, weight: 800 });
        var pos = { V1: [180, 200], V2: [420, 110], V3: [420, 290], V4: [660, 200], V5: [860, 200] };
        var edges = [["V1", "V2"], ["V1", "V3"], ["V2", "V4"], ["V3", "V4"], ["V4", "V5"]];
        var indeg = { V1: 0, V2: 1, V3: 1, V4: 2, V5: 1 };
        var seq = ["V1", "V2", "V3", "V4", "V5"];
        var k = Math.min(5, Math.floor(p * 5.5)); // 已毕业数
        var marks = {};
        for (var i = 0; i < k; i++) marks[seq[i]] = "visited";
        if (k < 5) marks[seq[k]] = "cur";
        edges.forEach(function (e) {
          var dead = seq.indexOf(e[0]) < k; // 起点已毕业则边被删
          var a = pos[e[0]], b = pos[e[1]];
          LS.arrow(svg, a[0] + 26, a[1], b[0] - 26, b[1], { sw: 2.5, opacity: dead ? .12 : 1, stroke: dead ? "var(--ink-3)" : "var(--brand)" });
        });
        Object.keys(pos).forEach(function (kk) {
          var pp = pos[kk], m = marks[kk];
          LS.circle(svg, pp[0], pp[1], 30, { fill: m === "cur" ? "var(--accent-soft)" : m === "visited" ? "var(--green-soft)" : "var(--svg-fill)", stroke: m === "cur" ? "var(--accent)" : m === "visited" ? "var(--green)" : "var(--line)", sw: m === "cur" ? 4 : 2.5 });
          LS.txt(svg, pp[0], pp[1] + 7, kk, { size: 17, weight: 800 });
          var curIn = kk === "V2" || kk === "V3" ? Math.max(0, indeg[kk] - (k >= 1 ? 1 : 0)) : kk === "V4" ? Math.max(0, indeg[kk] - (k >= 2 ? 2 : k >= 1 ? 1 : 0)) : kk === "V5" ? Math.max(0, indeg[kk] - (k >= 4 ? 1 : 0)) : indeg[kk];
          LS.txt(svg, pp[0], pp[1] + 52, "入度 " + (m === "visited" ? "✓" : curIn), { size: 12, fill: "var(--ink-3)" });
        });
        var shown = seq.slice(0, Math.max(0, Math.min(k, 5))).join(" → ");
        LS.txt(svg, 480, 355, "拓扑序列：" + (shown || "……") + "（不唯一！）", { size: 17, weight: 800, fill: "var(--brand)", mono: true, opacity: .9 + .1 });
        LS.txt(svg, 480, 390, "中途无点可删 = 有环 · DFS 逆后序也是拓扑序", { size: 14, fill: "var(--ink-2)", opacity: LS.clamp(p * 5.5 - 4.2, 0, 1) });
      } }
  ]
};

/* 共享图数据 */
var G4 = {
  nodes: { A: [140, 130], B: [370, 75], C: [370, 245], D: [600, 75], E: [600, 245], F: [830, 160] },
  edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"], ["D", "F"], ["E", "F"]]
};
function drawG(svg, marks, p) {
  LS.clear(svg);
  G4.edges.forEach(function (e) {
    var a = G4.nodes[e[0]], b = G4.nodes[e[1]];
    LS.el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--line)", "stroke-width": 3, opacity: LS.clamp(p * 3, 0, 1) }, svg);
  });
  Object.keys(G4.nodes).forEach(function (k) {
    var n = G4.nodes[k], m = marks[k];
    LS.circle(svg, n[0], n[1], 28, {
      fill: m === "cur" ? "var(--accent-soft)" : m === "visited" ? "var(--brand-soft)" : "var(--svg-fill)",
      stroke: m === "cur" ? "var(--accent)" : m === "visited" ? "var(--brand)" : "var(--line)",
      sw: m === "cur" ? 4.5 : 2.5
    });
    LS.txt(svg, n[0], n[1] + 7, k, { size: 19, weight: 800, fill: m === "cur" ? "var(--accent)" : "var(--svg-ink)" });
    if (m === "cur") LS.txt(svg, n[0], n[1] - 42, "▲ 访问中", { size: 13, fill: "var(--accent)", weight: 700 });
  });
}
initLesson();
