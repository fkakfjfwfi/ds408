/* 第 6 集《一副扑克牌的七种整理法》 · 6 幕 · 演示数组 [38,55,24,71,13,46] */
(function () {
  var ARR = [38, 55, 24, 71, 13, 46];

  function bars(svg, arr, marks, caption, capColor) {
    LS.clear(svg);
    var w = 92, gap = 26, x0 = (960 - (w * arr.length + gap * (arr.length - 1))) / 2, baseY = 300;
    var max = Math.max.apply(null, arr);
    arr.forEach(function (v, i) {
      var h = 30 + (v / max) * 180;
      var m = marks && marks[i];
      LS.box(svg, x0 + i * (w + gap), baseY - h, w, h, { rx: 8,
        fill: m === "pivot" ? "var(--accent-soft)" : m === "cmp" ? "var(--brand-soft)" : m === "swap" ? "var(--red-soft)" : m === "done" ? "var(--green-soft)" : "var(--svg-fill)",
        stroke: m === "pivot" ? "var(--accent)" : m === "cmp" ? "var(--brand)" : m === "swap" ? "var(--red)" : m === "done" ? "var(--green)" : "var(--line)", sw: 2 });
      LS.txt(svg, x0 + i * (w + gap) + w / 2, baseY - h - 12, v + "", { size: 16, weight: 800,
        fill: m === "swap" ? "var(--red)" : m ? "var(--brand)" : "var(--ink-2)" });
    });
    if (caption) LS.txt(svg, 480, 355, caption, { size: 16, weight: 700, fill: capColor || "var(--ink-2)" });
  }

  window.LESSON = {
    id: "ch06",
    title: "一副扑克牌的七种整理法",
    scenes: [
      /* S1 类比 */
      { voice: "F", duration: 10, narration: "排序，就是整理手牌：抓牌时顺手插进合适位置是插入排序；相邻两张两两交换是冒泡；先看一圈挑最小的放最前是选择排序。方法不同，结局一样——从小到大排好。",
        draw: function (svg, p) {
          var t = LS.clamp(p * 3, 0, 1);
          bars(svg, ARR, {}, "同一副牌，七种整理法：插入 / 希尔 / 冒泡 / 快排 / 选择 / 堆排 / 归并 / 基数", "var(--ink-2)");
          LS.txt(svg, 480, 60, "排序 = 整理手牌", { size: 23, weight: 800, opacity: t });
          LS.txt(svg, 480, 388, "评价维度三件套：时间、空间、稳定性", { size: 14, fill: "var(--ink-3)", opacity: LS.clamp(p * 3 - 2, 0, 1) });
        } },
      /* S2 插入排序 */
      { voice: "F", duration: 12, narration: "直接插入：左边是排好的手牌。第二张五十五不用动；第三张二十四从右往左比，五十五右移让位，二十四插进队首；照此办理，手牌越来越长，直到抓完最后一张。",
        draw: function (svg, p) {
          // 事件: [0]=38 sorted; t1: 55 ok; t2: 24 插入; t3: 71 ok; t4: 13 插入; t5: 46 插入
          var ev = LS.clamp(p * 6, 0, 6);
          var a = ARR.slice();
          var marks = { 0: "done" };
          var cap = "初始：38 已在手牌";
          if (ev >= 1) { marks[1] = "done"; cap = "55 ≥ 38，不用动 → 手牌 [38,55]"; }
          if (ev >= 2.2) { a = [24, 38, 55, 71, 13, 46]; marks = { 0: "done", 1: "done", 2: "done", 3: "cmp", 4: "cmp", 5: "cmp" }; cap = "24 依次越过 55、38 插入队首 → [24,38,55]"; }
          if (ev >= 3.4) { marks[3] = "done"; cap = "71 最大，不用动 → 手牌 [24,38,55,71]"; }
          if (ev >= 4.6) { a = [13, 24, 38, 55, 71, 46]; marks = { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done", 5: "cmp" }; cap = "13 一路插到最前 → [13,24,38,55,71]"; }
          if (ev >= 5.8) { a = [13, 24, 38, 46, 55, 71]; marks = { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done", 5: "done" }; cap = "46 插入 38 和 55 之间 → 排序完成 ✅"; }
          bars(svg, a, marks, cap, "var(--brand)");
          LS.txt(svg, 480, 55, "直接插入排序：抓一张，插一针", { size: 23, weight: 800 });
          LS.txt(svg, 480, 390, "基本有序时最快 O(n) · 稳定 · 408 喜欢考“第 k 趟后前 k+1 个局部有序”", { size: 14, fill: "var(--ink-3)", opacity: LS.clamp(p * 3 - 2, 0, 1) });
        } },
      /* S3 快排 partition */
      { voice: "M", duration: 13, narration: "快排的 Partition：枢轴三十八离场留坑；右指针往左找小的，十三填坑，坑挪到右边；左指针往右找大的，五十五填坑；再找二十四填坑；七十一填坑后两指针相遇，枢轴回坑——它左边全不大于它，右边全不小于它，位置就是最终位置。",
        draw: function (svg, p) {
          var e = LS.clamp(p * 6.5, 0, 6.5);
          var a = ARR.slice(), marks = {}, cap = "枢轴 = 38（第一个元素），离场留坑（橙色）", hole = 0;
          var frames = [
            { a: [38, 55, 24, 71, 13, 46], hole: 0, cap: "① 枢轴 38 离场，0 号位是坑；high 从右往左找比 38 小的" },
            { a: [13, 55, 24, 71, 13, 46], hole: 4, cap: "② 13 < 38 → 13 填坑，坑挪到 4 号位；low 从左往右找比 38 大的" },
            { a: [13, 55, 24, 71, 55, 46], hole: 1, cap: "③ 55 > 38 → 55 填坑，坑挪到 1 号位" },
            { a: [13, 24, 24, 71, 55, 46], hole: 2, cap: "④ 24 < 38 → 24 填坑，坑挪到 2 号位" },
            { a: [13, 24, 71, 71, 55, 46], hole: 3, cap: "⑤ 71 > 38 → 71 填坑；low ≥ high，指针相遇" },
            { a: [13, 24, 38, 71, 55, 46], hole: -1, cap: "⑥ 38 归位 3 号位：左边全 ≤ 38，右边全 ≥ 38 ✅ 每趟归位一个！" }
          ];
          var fi = Math.min(5, Math.floor(e));
          var f = frames[fi];
          a = f.a.slice(); hole = f.hole; cap = f.cap;
          a.forEach(function (v, i) {
            if (i === hole) marks[i] = "pivot";
            else if (fi === 5 && i === 2) marks[i] = "pivot";
            else marks[i] = "cmp";
          });
          bars(svg, a, marks, cap, hole >= 0 ? "var(--accent)" : "var(--green)");
          LS.txt(svg, 480, 55, "快速排序：Partition 让枢轴归位", { size: 23, weight: 800 });
          LS.txt(svg, 480, 390, "平均 O(nlogn) · 但基本有序时退化 O(n²) · 不稳定", { size: 14, fill: "var(--ink-3)", opacity: LS.clamp(p * 6.5 - 5.6, 0, 1) });
        } },
      /* S4 冒泡 */
      { voice: "F", duration: 11, narration: "冒泡：相邻两张比一比，大的往右沉。看第一趟：五十五和二十四交换，七十一一路沉底——每趟保证当前最大的到位。哪一趟一次交换都没发生，说明已经有序，可以提前收工。",
        draw: function (svg, p) {
          var e = LS.clamp(p * 6, 0, 6);
          var frames = [
            { a: [38, 55, 24, 71, 13, 46], cmp: [0, 1], cap: "比较 38 和 55：38 < 55，不交换" },
            { a: [38, 24, 55, 71, 13, 46], cmp: [1, 2], sw: [0, 1], cap: "55 > 24 → 交换！55 继续向右漂" },
            { a: [38, 24, 55, 71, 13, 46], cmp: [2, 3], cap: "55 < 71，不交换，71 是新擂主" },
            { a: [38, 24, 55, 13, 71, 46], cmp: [3, 4], sw: [2, 3], cap: "71 > 13 → 交换！71 沉过一格" },
            { a: [38, 24, 55, 13, 46, 71], cmp: [4, 5], sw: [3, 4], cap: "71 > 46 → 交换！71 沉底，最大值归位 ✅" },
            { a: [38, 24, 55, 13, 46, 71], done: 5, cap: "第一趟结束：71 已在最终位置；下一趟对前 5 个继续冒泡" }
          ];
          var f = frames[Math.min(5, Math.floor(e))];
          var marks = {};
          f.a.forEach(function (v, i) { marks[i] = "cmp"; });
          if (f.sw) f.sw.forEach(function (i) { marks[i] = "swap"; });
          else if (f.cmp) f.cmp.forEach(function (i) { marks[i] = "cmp"; });
          if (f.done != null) for (var d = f.done; d < f.a.length; d++) marks[d] = "done";
          bars(svg, f.a, marks, f.cap, "var(--brand)");
          LS.txt(svg, 480, 55, "冒泡排序：相邻比较，大数下沉", { size: 23, weight: 800 });
          LS.txt(svg, 480, 390, "某趟无交换即可提前结束 → 已有序时 O(n) · 稳定", { size: 14, fill: "var(--ink-3)", opacity: LS.clamp(p * 6 - 5.2, 0, 1) });
        } },
      /* S5 归并 */
      { voice: "M", duration: 11, narration: "归并：把两个已经排好的序列拉链式合并。左边一二三...不对，是十三、二十四、三十八；右边四十六、五十五、七十一。每次比较两队队首，小的出队进结果——合并一次 O(n)，总趟数 log n。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 52, "2 路归并：拉链式合并", { size: 23, weight: 800 });
          var L = [13, 24, 38], R = [46, 55, 71];
          var total = 6;
          var k = Math.min(6, Math.floor(p * 6.6)); // 已合并个数
          var merged = [];
          var li = 0, ri = 0;
          for (var s = 0; s < k; s++) {
            if (li >= L.length) { merged.push(R[ri++]); continue; }
            if (ri >= R.length) { merged.push(L[li++]); continue; }
            if (L[li] <= R[ri]) merged.push(L[li++]); else merged.push(R[ri++]);
          }
          function row(arr, y, name, taken) {
            LS.txt(svg, 130, y + 20, name, { size: 14, fill: "var(--ink-3)" });
            arr.forEach(function (v, i) {
              var gone = i < taken;
              LS.box(svg, 200 + i * 110, y, 92, 44, { rx: 9, fill: gone ? "var(--card-2)" : "var(--svg-fill)", stroke: gone ? "var(--line)" : "var(--brand)", sw: gone ? 1.5 : 2, opacity: gone ? .4 : 1 });
              LS.txt(svg, 246 + i * 110, y + 29, v + "", { size: 17, weight: 800, opacity: gone ? .4 : 1 });
            });
          }
          row(L, 100, "左段", li); row(R, 170, "右段", ri);
          LS.txt(svg, 130, 260, "合并后", { size: 14, fill: "var(--ink-3)" });
          for (var j = 0; j < total; j++) {
            var has = j < k;
            LS.box(svg, 200 + j * 110, 236, 92, 48, { rx: 9, fill: has ? "var(--green-soft)" : "var(--card)", stroke: has ? "var(--green)" : "var(--line)", sw: has ? 2.5 : 1.5 });
            LS.txt(svg, 246 + j * 110, 266, has ? merged[j] + "" : "·", { size: 17, weight: 800, fill: has ? "var(--green)" : "var(--ink-3)" });
          }
          LS.txt(svg, 480, 345, "每趟 O(n)，共 ⌈log₂n⌉ 趟 → O(nlogn) · 需要 O(n) 辅助数组 · 稳定", { size: 15, fill: "var(--ink-2)", opacity: LS.clamp(p * 6.6 - 5, 0, 1) });
          LS.txt(svg, 480, 385, "“要稳定 + O(nlogn)”——内部排序里只能选它", { size: 14, fill: "var(--brand)", weight: 700, opacity: LS.clamp(p * 6.6 - 5.6, 0, 1) });
        } },
      /* S6 总结 */
      { voice: "M", duration: 12, narration: "成绩单：快排平均最快，堆排最坏也稳且空间最小，归并用空间换稳定性，插入冒泡在基本有序时反而最快。口诀送你：插冒归基稳，快选希堆不稳。大题考手工模拟，选择考这张表——把它印在脑子里。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 44, "七大排序成绩单（默写级）", { size: 22, weight: 800 });
          var rows = [
            ["算法", "平均时间", "空间", "稳定", "最坏情形"],
            ["快速排序", "O(nlogn)", "O(logn)", "❌", "基本有序 → O(n²)"],
            ["堆排序", "O(nlogn)", "O(1)", "❌", "依然 O(nlogn)"],
            ["归并排序", "O(nlogn)", "O(n)", "✅", "依然 O(nlogn)"],
            ["直接插入", "O(n²)", "O(1)", "✅", "基本有序 → O(n) 最好"],
            ["冒泡", "O(n²)", "O(1)", "✅", "可提前终止"]
          ];
          rows.forEach(function (r, i) {
            var s2 = LS.clamp(p * 6.5 - i * 0.8, 0, 1);
            if (s2 <= 0) return;
            var y = 80 + i * 52, head = i === 0;
            LS.box(svg, 60, y, 840, 44, { rx: i === 0 ? 12 : 8, fill: head ? "var(--brand-soft)" : "var(--card-2)", stroke: "var(--line)", opacity: s2 });
            [110, 330, 520, 640, 800].forEach(function (cx, k) {
              LS.txt(svg, cx, y + 29, r[k], { size: head ? 15 : 15.5, weight: head ? 800 : 700,
                fill: head ? "var(--brand)" : (r[k] === "✅" ? "var(--green)" : r[k] === "❌" ? "var(--red)" : "var(--ink-2)"), opacity: s2 });
            });
          });
          LS.txt(svg, 480, 370, "口诀：插冒归基稳，快选希堆不稳", { size: 18, weight: 800, fill: "var(--brand)", opacity: LS.clamp(p * 6.5 - 5, 0, 1) });
        } }
    ]
  };
  initLesson();
})();
