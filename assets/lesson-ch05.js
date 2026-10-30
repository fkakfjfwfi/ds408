/* 第 5 集《翻字典的三种姿势》 · 6 幕 */
window.LESSON = {
  id: "ch05",
  title: "翻字典的三种姿势",
  scenes: [
    /* S1 类比 */
    { voice: "F", duration: 9, narration: "查字典有三种姿势：从头一页页翻，翻到中间折半再翻，按拼音索引直达。对应顺序查找、折半查找和散列。评价好坏只看一件事——平均要翻几次，也就是 ASL。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "查找 = 翻字典，看平均翻几次（ASL）", { size: 23, weight: 800 });
        // 一本字典
        var show = LS.clamp(p * 3, 0, 1);
        LS.box(svg, 120, 110, 220, 240, { rx: 12, fill: "var(--svg-fill)", opacity: show });
        LS.box(svg, 140, 100, 200, 20, { rx: 8, fill: "var(--svg-fill-2)", opacity: show });
        for (var i = 0; i < 6; i++) LS.el("line", { x1: 145, y1: 150 + i * 32, x2: 315, y2: 150 + i * 32, stroke: "var(--line)", "stroke-width": 4, opacity: show }, svg);
        var cards = [
          { x: 480, name: "顺序查找", desc: "一页页翻 O(n)" },
          { x: 730, name: "折半查找", desc: "折半扔一半 O(logn)" },
          { x: 480, name: "散列 Hash", desc: "索引直达 O(1)", y: 250 },
          { x: 730, name: "BST / AVL", desc: "树形折半 O(logn)", y: 250 }
        ];
        cards.forEach(function (c, i) {
          var s2 = LS.clamp(p * 5 - i * 0.8 - 1, 0, 1);
          if (s2 <= 0) return;
          var y = c.y || 130;
          LS.box(svg, c.x - 100, y, 200, 90, { rx: 12, fill: "var(--card-2)", stroke: "var(--line)", opacity: s2 });
          LS.txt(svg, c.x, y + 38, c.name, { size: 17, weight: 800, opacity: s2 });
          LS.txt(svg, c.x, y + 66, c.desc, { size: 13, fill: "var(--ink-3)", opacity: s2 });
        });
        LS.arrow(svg, 345, 230, 375, 180, { opacity: LS.clamp(p * 3 - 2, 0, 1) });
      } },
    /* S2 折半查找 */
    { voice: "F", duration: 12, narration: "折半查找有序数组，找四十二：mid 指向三十五，比目标小，扔掉左半；mid 指向五十六，比目标大，扔掉右半；mid 命中。三次比较，每次扔掉一半——这就是 O(logn)。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 48, "折半查找：找 42", { size: 23, weight: 800 });
        var a = [7, 14, 21, 35, 42, 56, 68];
        var w = 100, gap = 20, x0 = (960 - (w * 7 + gap * 6)) / 2, y = 170;
        // 三次探测: [0,6] mid3(35<42) → [4,6] mid5(56>42) → [4,4] mid4 命中
        var phases = [{ lo: 0, hi: 6, mid: 3 }, { lo: 4, hi: 6, mid: 5 }, { lo: 4, hi: 4, mid: 4 }];
        var ph = LS.clamp(p * 3.2, 0, 3);
        var cur = phases[Math.min(2, Math.floor(ph))];
        var done = ph > 3 || (Math.floor(ph) === 2 && ph > 2.7);
        a.forEach(function (v, i) {
          var inRange = i >= cur.lo && i <= cur.hi;
          var isMid = i === cur.mid;
          var hit = done && i === 4;
          LS.box(svg, x0 + i * (w + gap), y, w, 70, { rx: 10,
            fill: hit ? "var(--green-soft)" : isMid ? "var(--accent-soft)" : inRange ? "var(--svg-fill)" : "var(--card-2)",
            stroke: hit ? "var(--green)" : isMid ? "var(--accent)" : inRange ? "var(--brand)" : "var(--line)",
            sw: isMid || hit ? 3 : 1.5, opacity: inRange || isMid || hit ? 1 : .45 });
          LS.txt(svg, x0 + i * (w + gap) + w / 2, y + 43, v, { size: 20, weight: 700, opacity: inRange || isMid || hit ? 1 : .45 });
          LS.txt(svg, x0 + i * (w + gap) + w / 2, y + 95, i + "", { size: 11, fill: "var(--ink-3)" });
        });
        var midX = x0 + cur.mid * (w + gap) + w / 2;
        LS.arrow(svg, midX, 130, midX, 162, { stroke: "var(--accent)", sw: 3 });
        LS.txt(svg, midX, 118, "mid=" + cur.mid + " → " + a[cur.mid] + (done ? " 命中！" : a[cur.mid] < 42 ? " < 42，扔左半" : " > 42，扔右半"), { size: 15, weight: 700, fill: "var(--accent)" });
        LS.txt(svg, 480, 320, "第 " + Math.min(3, Math.max(1, Math.ceil(ph))) + " 次比较 · 最多比较 ⌈log₂(n+1)⌉ 次", { size: 16, fill: "var(--ink-2)" });
        LS.txt(svg, 480, 360, "判定树：mid 是根，左半区是左子树，右半区是右子树", { size: 14, fill: "var(--brand)", weight: 700, opacity: LS.clamp(p * 2.5 - 1.8, 0, 1) });
      } },
    /* S3 BST 生长 */
    { voice: "M", duration: 12, narration: "二叉排序树：比根小的去左边，大的去右边。看依次插入三十四、二十一、五十六、十二、二十八，每个新结点沿着查找路径走到底——新结点永远是叶子。记住铁律：BST 的中序序列必然递增。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 46, "BST：左小右大，插入即寻路", { size: 23, weight: 800 });
        var ins = [34, 21, 56, 12, 28];
        var k = Math.min(5, Math.floor(p * 5.4)); // 已插入个数
        // 树形坐标
        var posMap = { 34: [480, 140], 21: [330, 230], 56: [630, 230], 12: [240, 320], 28: [420, 320] };
        var par = { 21: 34, 56: 34, 12: 21, 28: 21 };
        var cur = k > 0 && k <= 5 ? ins[k - 1] : null;
        for (var i = 0; i < k; i++) {
          var v = ins[i];
          if (par[v]) {
            var a = posMap[par[v]], b = posMap[v];
            LS.el("line", { x1: a[0], y1: a[1] + 24, x2: b[0], y2: b[1] - 24, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
          }
        }
        Object.keys(posMap).forEach(function (kk) {
          if (ins.slice(0, k).indexOf(+kk) < 0) return;
          var pp = posMap[kk], isCur = +kk === cur;
          LS.circle(svg, pp[0], pp[1], 30, { fill: isCur ? "var(--accent-soft)" : "var(--svg-fill)", stroke: isCur ? "var(--accent)" : "var(--brand)", sw: isCur ? 4 : 2.5 });
          LS.txt(svg, pp[0], pp[1] + 7, kk, { size: 18, weight: 800 });
        });
        // 插入路径提示
        if (cur != null && cur !== 34) {
          var path = cur === 21 ? ["34"] : cur === 56 ? ["34"] : cur === 12 ? ["34", "21"] : ["34", "21"];
          LS.txt(svg, 810, 140, "比较路径：", { size: 14, fill: "var(--ink-3)", anchor: "start" });
          LS.txt(svg, 810, 172, path.join(" → ") + " → " + cur + " ✅", { size: 14, weight: 700, fill: "var(--brand)", anchor: "start", mono: true });
        }
        LS.txt(svg, 480, 380, "中序遍历：12 → 21 → 28 → 34 → 56（必然递增！）", { size: 16, weight: 800, fill: "var(--green)", opacity: LS.clamp(p * 5.4 - 4, 0, 1), mono: true });
      } },
    /* S4 AVL 旋转 */
    { voice: "M", duration: 11, narration: "顺序插入会让 BST 退化成链表，于是有了 AVL：任何结点左右子树高度差不超过一。看 LL 失衡：十、二十、三十排成一条左斜链，把中间值二十转上去，右旋完成，树又平衡了。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 46, "AVL：LL 失衡 → 右旋（中间值转上去）", { size: 22, weight: 800 });
        var split = LS.clamp(p * 2.4, 0, 1);
        // 左：失衡
        var showL = LS.clamp(p * 4, 0, 1);
        function nd(x, y, v, cur) {
          LS.circle(svg, x, y, 30, { fill: cur ? "var(--accent-soft)" : "var(--svg-fill)", stroke: cur ? "var(--accent)" : "var(--brand)", sw: cur ? 4 : 2.5 });
          LS.txt(svg, x, y + 7, v + "", { size: 18, weight: 800 });
        }
        LS.txt(svg, 250, 100, "失衡（左斜链）", { size: 15, fill: "var(--red)", weight: 700, opacity: showL });
        if (showL > 0) {
          LS.el("line", { x1: 250, y1: 170, x2: 190, y2: 240, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
          LS.el("line", { x1: 190, y1: 240, x2: 130, y2: 310, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
          nd(250, 140, 30, split < .3);
          nd(190, 240, 20, split >= .3 && split < .6);
          nd(130, 310, 10, split >= .6 && split < .9);
          LS.txt(svg, 250, 200, "BF=2!", { size: 13, fill: "var(--red)", weight: 700 });
        }
        // 箭头
        var showR = LS.clamp(p * 4 - 2, 0, 1);
        if (showR > 0) LS.arrow(svg, 380, 220, 560, 220, { sw: 3, stroke: "var(--green)" });
        LS.txt(svg, 470, 205, "右旋", { size: 15, weight: 700, fill: "var(--green)", opacity: showR });
        // 右：平衡
        LS.txt(svg, 710, 100, "平衡了", { size: 15, fill: "var(--green)", weight: 700, opacity: showR });
        if (showR > 0) {
          LS.el("line", { x1: 710, y1: 200, x2: 650, y2: 310, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
          LS.el("line", { x1: 710, y1: 200, x2: 770, y2: 310, stroke: "var(--line)", "stroke-width": 2.5 }, svg);
          nd(710, 170, 20, true);
          nd(650, 310, 10, false);
          nd(770, 310, 30, false);
          LS.txt(svg, 710, 370, "中序仍是 10 20 30，但高度从 3 降到 2", { size: 13, fill: "var(--ink-2)", opacity: showR });
        }
        LS.txt(svg, 480, 392, "LL→右旋　RR→左旋　LR/RL→两次对折", { size: 15, weight: 700, fill: "var(--brand)", opacity: LS.clamp(p * 4 - 3.2, 0, 1) });
      } },
    /* S5 哈希拉链 */
    { voice: "F", duration: 11, narration: "散列表的拉链法：散列函数 key 取模七定桶号，撞桶的同义词直接挂成链表。二十三挂二号桶，九也该在二号桶，排队挂上去——冲突不再互相挤占位置，这就是拉链的智慧。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 46, "散列拉链法：H(key) = key % 7", { size: 23, weight: 800 });
        var buckets = [[], [14], [], [30], [], [], [23, 9, 16]]; // 展示状态
        var reveal = LS.clamp(p * 6, 0, 1);
        for (var i = 0; i < 7; i++) {
          var y = 90 + i * 42;
          var show = reveal > i * 0.7;
          LS.box(svg, 200, y, 100, 34, { rx: 8, fill: "var(--svg-fill)", opacity: show ? 1 : .2 });
          LS.txt(svg, 250, y + 23, "桶 " + i, { size: 14, weight: 700, opacity: show ? 1 : .2 });
          buckets[i].forEach(function (k, j) {
            var s2 = LS.clamp(reveal - i * 0.7 - j * 0.5, 0, 1);
            if (s2 <= 0) return;
            LS.arrow(svg, 300 + j * 82, y + 17, 348 + j * 82, y + 17, { opacity: s2, sw: 2 });
            LS.box(svg, 352 + j * 82, y, 64, 34, { rx: 8, fill: "var(--accent-soft)", stroke: "var(--accent)", opacity: s2 });
            LS.txt(svg, 384 + j * 82, y + 23, k + "", { size: 14, weight: 700, opacity: s2 });
          });
        }
        LS.txt(svg, 700, 120, "23 % 7 = 2", { size: 14, fill: "var(--ink-2)", anchor: "start", mono: true, opacity: LS.clamp(reveal - 1, 0, 1) });
        LS.txt(svg, 700, 152, "16 % 7 = 2 → 挂链尾", { size: 14, fill: "var(--ink-2)", anchor: "start", mono: true, opacity: LS.clamp(reveal - 3.5, 0, 1) });
        LS.txt(svg, 480, 380, "拉链法：同义词挂一链，不堆积 · 开放定址法：被占就顺移，易堆积", { size: 15, fill: "var(--brand)", weight: 700, opacity: LS.clamp(reveal - 4.5, 0, 1) });
      } },
    /* S6 ASL 总结 */
    { voice: "M", duration: 11, narration: "总结：折半查找 ASL 约等于 log n；AVL 保证 O(logn) 不退化；散列表理论 O(1)，但 ASL 与装填因子直接挂钩、与表长无关。散列大题的失败查找分母是模数，不是表长，动笔前先提醒自己。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 48, "三种姿势的成绩单", { size: 23, weight: 800 });
        var rows = [
          { n: "顺序查找", t: "O(n)", asl: "(n+1)/2", c: "var(--ink-2)" },
          { n: "折半查找", t: "O(logn)", asl: "≈ log₂(n+1) − 1", c: "var(--brand)" },
          { n: "AVL 树", t: "O(logn) 稳定", asl: "≈ 1.44 log₂n", c: "var(--accent)" },
          { n: "散列表", t: "O(1) 理想", asl: "取决于装填因子 α", c: "var(--green)" }
        ];
        rows.forEach(function (r, i) {
          var s2 = LS.clamp(p * 5 - i * 0.7, 0, 1);
          if (s2 <= 0) return;
          var y = 100 + i * 58;
          LS.box(svg, 120, y, 720, 48, { rx: 12, fill: "var(--card-2)", stroke: "var(--line)", opacity: s2 });
          LS.txt(svg, 220, y + 31, r.n, { size: 17, weight: 800, opacity: s2 });
          LS.txt(svg, 470, y + 31, r.t, { size: 16, weight: 700, fill: r.c, opacity: s2, mono: true });
          LS.txt(svg, 700, y + 31, "ASL " + r.asl, { size: 14, fill: "var(--ink-2)", opacity: s2, mono: true });
        });
        LS.txt(svg, 480, 375, "散列大题：失败 ASL 分母 = 模数 p（不是表长！）", { size: 16, weight: 800, fill: "var(--red)", opacity: LS.clamp(p * 5 - 3.8, 0, 1) });
      } }
  ]
};
initLesson();
