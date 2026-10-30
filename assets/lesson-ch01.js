/* 第 1 集《一节车厢的两种连法》 · 6 幕 · 晓晓(基础) + 云健(考点) */
window.LESSON = {
  id: "ch01",
  title: "一节车厢的两种连法",
  scenes: [
    /* S1 火车类比 */
    { voice: "F", duration: 9, narration: "线性表，就是一列火车：车厢一节接一节排成一条线。除了车头和车尾，每节车厢前面只有一节、后面也只挂一节——这就是线性关系。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "线性表 = 一列火车", { size: 24, weight: 700 });
        var xs = [90, 270, 450, 630, 810];
        // 车头
        LS.box(svg, xs[0], 160, 150, 90, { rx: 14, fill: "var(--svg-fill-2)" });
        LS.txt(svg, xs[0] + 75, 210, "车头 a₁", { size: 18, weight: 700 });
        for (var i = 1; i < 5; i++) {
          LS.box(svg, xs[i], 160, 130, 90, { rx: 14 });
          LS.txt(svg, xs[i] + 65, 210, "a" + (i + 1), { size: 18, weight: 700 });
        }
        // 轮子
        xs.forEach(function (x, k) {
          LS.circle(svg, x + 45, 265, 12, { fill: "var(--svg-fill-2)", sw: 1.5 });
          LS.circle(svg, x + (k === 0 ? 105 : 95), 265, 12, { fill: "var(--svg-fill-2)", sw: 1.5 });
        });
        // 连接杆（随进度“挂钩”）
        for (var j = 0; j < 4; j++) {
          var hook = LS.clamp(p * 5 - j * 0.8, 0, 1);
          if (hook > 0) LS.arrow(svg, xs[j] + (j === 0 ? 150 : 130), 205, xs[j + 1] - 6, 205, { sw: 3, opacity: .4 + .6 * hook });
        }
        LS.txt(svg, 480, 330, "除表头表尾外：每个元素有且仅有一个直接前驱、一个直接后继", { size: 16, fill: "var(--ink-2)" });
      } },
    /* S2 顺序表 */
    { voice: "F", duration: 10, narration: "第一种连法：顺序表。把元素放进一段连续内存，像电影院的一排连座。知道下标就能一步算出地址，直达座位——这叫随机访问。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "顺序表：连续内存的连排座位", { size: 24, weight: 700 });
        var vals = ["A", "B", "C", "D", "E"];
        var w = 110, gap = 18, x0 = (960 - (w * 5 + gap * 4)) / 2, y = 150;
        vals.forEach(function (v, i) {
          var show = p > i * 0.12;
          if (show) {
            LS.box(svg, x0 + i * (w + gap), y, w, 80, { rx: 10 });
            LS.txt(svg, x0 + i * (w + gap) + w / 2, y + 50, v, { size: 24, weight: 700 });
            LS.txt(svg, x0 + i * (w + gap) + w / 2, y + 110, "下标 " + i, { size: 13, fill: "var(--ink-3)" });
          }
        });
        LS.txt(svg, 480, 320, "地址 = 首地址 + (位序 − 1) × 每格大小", { size: 17, fill: "var(--brand)", weight: 700, opacity: LS.clamp(p * 2 - 1, 0, 1) });
        LS.txt(svg, 480, 355, "按位序访问：O(1) 一步到位", { size: 15, fill: "var(--ink-2)", opacity: LS.clamp(p * 2 - 1.4, 0, 1) });
      } },
    /* S3 顺序表插入 */
    { voice: "F", duration: 12, narration: "但中间要插一个人呢？座位全满的话，从插入位置起，后面所有人都要往后挪一格。平均要挪半张表——所以顺序表插入是 O(n)。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "顺序表插入：后面的人集体后移", { size: 24, weight: 700 });
        var orig = ["A", "C", "D", "E", ""];
        var w = 110, gap = 18, x0 = (960 - (w * 5 + gap * 4)) / 2, y = 170;
        // 动画：从右往左依次后移 (E→空位, D→E位, C→D位)，最后 B 落入 2 号位
        var phase = p * 3.4; // 0..3.4
        var moved = [0, 0, 0, 0, 0]; // 每格位移格数
        var bIn = LS.clamp((phase - 3) / 0.4, 0, 1);
        var order = [3, 2, 1]; // E,D,C 依次右移
        order.forEach(function (idx, k) {
          var t = LS.clamp((phase - k) / 0.85, 0, 1);
          moved[idx] = LS.ease(t);
        });
        var hot = [];
        order.forEach(function (idx, k) { if (phase > k && phase < k + 1) hot.push(idx); });
        orig.forEach(function (v, i) {
          var off = moved[i] * (w + gap);
          var isHot = hot.indexOf(i) >= 0;
          LS.box(svg, x0 + i * (w + gap) + off, y, w, 80, { rx: 10, fill: isHot ? "var(--accent-soft)" : "var(--svg-fill)", stroke: isHot ? "var(--accent)" : "var(--line)" });
          if (v) LS.txt(svg, x0 + i * (w + gap) + off + w / 2, y + 50, v, { size: 24, weight: 700, fill: isHot ? "var(--accent)" : "var(--svg-ink)" });
          LS.txt(svg, x0 + i * (w + gap) + w / 2, y + 112, i + "", { size: 13, fill: "var(--ink-3)" });
        });
        if (bIn > 0) {
          var bx = x0 + 1 * (w + gap);
          LS.box(svg, bx, y - 90 * (1 - LS.ease(bIn)), w, 80, { rx: 10, fill: "var(--green-soft)", stroke: "var(--green)" });
          LS.txt(svg, bx + w / 2, y - 90 * (1 - LS.ease(bIn)) + 50, "B", { size: 24, weight: 700, fill: "var(--green)" });
        }
        LS.txt(svg, 480, 345, "在下标 1 处插入 B：C、D、E 依次后移 → 共挪 3 格 → O(n)", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp(p * 2 - .6, 0, 1) });
      } },
    /* S4 链表 */
    { voice: "M", duration: 11, narration: "第二种连法：链表，像寻宝游戏。每个结点存着数据，和下一站的地址。宝箱散落在内存各处，但线索把它们串成一条线。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "单链表：寻宝游戏", { size: 24, weight: 700 });
        var nodes = [{ x: 120, v: "head" }, { x: 330, v: "12" }, { x: 510, v: "25" }, { x: 690, v: "33" }, { x: 860, v: "46" }];
        nodes.forEach(function (n, i) {
          var show = LS.clamp(p * 4 - i * 0.7, 0, 1);
          if (show <= 0) return;
          var yy = 170 + Math.sin(i * 2.1) * 26;
          LS.box(svg, n.x, yy, 84, 62, { rx: 12, fill: i === 0 ? "var(--svg-fill-2)" : "var(--svg-fill)", opacity: show });
          LS.txt(svg, n.x + 42, yy + 38, n.v, { size: 17, weight: 700, opacity: show });
          if (i === 0) LS.txt(svg, n.x + 42, yy + 82, "头指针", { size: 12, fill: "var(--ink-3)", opacity: show });
          else {
            LS.txt(svg, n.x + 20, yy + 20, "数", { size: 11, fill: "var(--ink-3)", opacity: show });
            LS.txt(svg, n.x + 62, yy + 20, "址", { size: 11, fill: "var(--ink-3)", opacity: show });
            LS.el("line", { x1: n.x + 42, y1: yy + 26, x2: n.x + 42, y2: yy + 36, stroke: "var(--line)", "stroke-width": 1 }, svg);
          }
          if (i < 4) {
            var nx = nodes[i + 1], ny = 170 + Math.sin((i + 1) * 2.1) * 26;
            var hook = LS.clamp(p * 4 - i * 0.7 - 0.4, 0, 1);
            LS.arrow(svg, n.x + 84, yy + 31, nx - 4, ny + 31, { opacity: hook, sw: 2.5 });
          } else {
            LS.txt(svg, 912, 170 + Math.sin(4 * 2.1) * 26 + 36, "NULL", { size: 13, fill: "var(--ink-3)", opacity: LS.clamp(p * 4 - 3, 0, 1) });
          }
        });
        LS.txt(svg, 480, 345, "逻辑上相邻，物理上散落 · 查找只能顺藤摸瓜：O(n)", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp(p * 2 - 1, 0, 1) });
      } },
    /* S5 链表插入 */
    { voice: "M", duration: 12, narration: "链表插入不用挪任何人，只改两根指针：第一步，新结点拉住 25 的后继；第二步，25 拉住新结点。记住口诀：先钩新，后接旧。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "链表插入：只改两根指针", { size: 24, weight: 700 });
        var y = 200;
        function node(x, v, hot) {
          LS.box(svg, x, y, 90, 60, { rx: 12, fill: hot ? "var(--accent-soft)" : "var(--svg-fill)", stroke: hot ? "var(--accent)" : "var(--line)" });
          LS.txt(svg, x + 45, y + 38, v, { size: 18, weight: 700, fill: hot ? "var(--accent)" : "var(--svg-ink)" });
        }
        node(80, "head"); node(290, "25"); node(500, "33"); node(690, "46");
        LS.arrow(svg, 170, y + 30, 286, y + 30);              // head → 25
        // 新结点 27 悬浮
        var s = LS.ease(LS.clamp(p * 3, 0, 1));
        var ny = 60 + (1 - s) * 0;
        LS.box(svg, 395, ny, 90, 60, { rx: 12, fill: "var(--green-soft)", stroke: "var(--green)", opacity: s });
        LS.txt(svg, 440, ny + 38, "27", { size: 18, weight: 700, fill: "var(--green)", opacity: s });
        var step1 = LS.clamp((p - 0.35) * 4, 0, 1);  // ① 27 -> 33
        var step2 = LS.clamp((p - 0.62) * 4, 0, 1);  // ② 25 -> 27
        var oldGone = step2 > 0.5;                    // 25 → 33 断开
        if (step1 > 0) LS.arrow(svg, 485, ny + 30, 496, y + 26, { stroke: "var(--green)", opacity: step1 * .9, sw: 2.5 });
        LS.txt(svg, 700, ny + 18, "① s->next = p->next", { size: 14, fill: "var(--green)", opacity: step1 });
        if (!oldGone) LS.arrow(svg, 380, y + 30, 496, y + 30, { sw: 2.5 });
        if (step2 > 0) LS.arrow(svg, 380, y + 30, 391, ny + 40, { stroke: "var(--brand)", opacity: step2, sw: 2.5 });
        LS.txt(svg, 190, ny + 18, "② p->next = s", { size: 14, fill: "var(--brand)", opacity: step2 });
        LS.txt(svg, 480, 345, "顺序不能反：先 p->next = s 的话，33 号结点就成了没有指针指向的孤儿", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp((p - .5) * 2, 0, 1) });
        LS.txt(svg, 480, 383, "找到位置后插入 O(1) —— 不用挪任何元素", { size: 16, fill: "var(--green)", weight: 700, opacity: LS.clamp((p - .6) * 2, 0, 1) });
      } },
    /* S6 总结 */
    { voice: "M", duration: 11, narration: "总结：查多插少用顺序，插多查少用链表。顺序表随机访问 O(1)、插入删除 O(n)；链表正好相反。408 选择题年年考，记住这句口诀就够了。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "两种连法，怎么选？", { size: 24, weight: 700 });
        var half = LS.clamp(p * 3, 0, 1), half2 = LS.clamp(p * 3 - 1, 0, 1);
        // 左：顺序表
        LS.box(svg, 70, 100, 380, 210, { rx: 16, fill: "var(--brand-soft)", opacity: half });
        LS.txt(svg, 260, 140, "顺序表 🚋", { size: 20, weight: 700, opacity: half });
        LS.txt(svg, 260, 185, "按位序访问 O(1) ✦", { size: 16, opacity: half });
        LS.txt(svg, 260, 225, "插入 / 删除 O(n)：整体挪", { size: 16, opacity: half });
        LS.txt(svg, 260, 265, "适合：查多、表长可预估", { size: 14, fill: "var(--ink-2)", opacity: half });
        // 右：链表
        LS.box(svg, 510, 100, 380, 210, { rx: 16, fill: "var(--accent-soft)", opacity: half2 });
        LS.txt(svg, 700, 140, "单链表 🔗", { size: 20, weight: 700, opacity: half2 });
        LS.txt(svg, 700, 185, "按位序访问 O(n)：顺藤摸瓜", { size: 16, opacity: half2 });
        LS.txt(svg, 700, 225, "插入 / 删除 O(1) ✦ 改指针", { size: 16, opacity: half2 });
        LS.txt(svg, 700, 265, "适合：频繁插删、表长多变", { size: 14, fill: "var(--ink-2)", opacity: half2 });
        LS.txt(svg, 480, 360, "口诀：查多插少用顺序，插多查少用链表", { size: 20, weight: 800, fill: "var(--brand)", opacity: LS.clamp(p * 3 - 2, 0, 1) });
      } }
  ]
};
initLesson();
