/* 第 7 集《不回头的侦探》 · 6 幕 */
(function () {
  /* 字符串网格绘制 */
  function drawStr(svg, str, x0, y, cw, marks, label, labelFill) {
    if (label) LS.txt(svg, x0 - 14, y + 26, label, { size: 14, weight: 700, fill: labelFill || "var(--ink-3)", anchor: "start" });
    for (var i = 0; i < str.length; i++) {
      var m = marks && marks[i];
      LS.box(svg, x0 + i * cw, y, cw - 6, 44, { rx: 7,
        fill: m === "match" ? "var(--green-soft)" : m === "cur" ? "var(--accent-soft)" : m === "bad" ? "var(--red-soft)" : m === "pre" ? "var(--brand-soft)" : "var(--svg-fill)",
        stroke: m === "match" ? "var(--green)" : m === "cur" ? "var(--accent)" : m === "bad" ? "var(--red)" : m === "pre" ? "var(--brand)" : "var(--line)", sw: m ? 2.5 : 1.5 });
      LS.txt(svg, x0 + i * cw + (cw - 6) / 2, y + 29, str[i], { size: 18, weight: 800,
        fill: m === "cur" ? "var(--accent)" : m === "bad" ? "var(--red)" : m ? "var(--brand)" : "var(--svg-ink)" });
      LS.txt(svg, x0 + i * cw + (cw - 6) / 2, y + 60, (i + 1) + "", { size: 10.5, fill: "var(--ink-3)" });
    }
  }

  window.LESSON = {
    id: "ch07",
    title: "不回头的侦探",
    scenes: [
      /* S1 类比 */
      { voice: "F", duration: 9, narration: "串，就是字符组成的线性表。在长文档里找关键词：文档是主串，关键词是模式串，找到的那段叫子串。Ctrl+F 每天都在做模式匹配——本章只关心一件事：怎么找得又快又稳。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 52, "串 = 字符组成的线性表", { size: 23, weight: 800 });
          drawStr(svg, "我爱数据结构四十捌", 220, 130, 76, { 2: "cur", 3: "cur", 4: "cur" }, "主串 S（文档）", "var(--ink-3)");
          drawStr(svg, "数据结构", 348, 220, 76, {}, "模式串 T（关键词）", "var(--brand)");
          LS.txt(svg, 480, 330, "匹配成功：模式串在主串中的位序 = 3", { size: 16, fill: "var(--green)", weight: 700, opacity: LS.clamp(p * 3 - 1.5, 0, 1) });
          LS.txt(svg, 480, 375, "位序从 1 开始数（408 / 严蔚敏约定）", { size: 13, fill: "var(--ink-3)", opacity: LS.clamp(p * 3 - 2, 0, 1) });
        } },
      /* S2 BF 的笨 */
      { voice: "F", duration: 12, narration: "朴素匹配 BF：对齐了从头比，比到第五位发现对不上——主串指针竟然退回第二位重来。前面看过的四个字符全部白看！最坏情况下每个起点都白比一轮，代价 n 乘 m。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 46, "BF：失配就回头，全白看", { size: 23, weight: 800 });
          var S = "abcabdabcabe", T = "abcabe";
          var phase = LS.clamp(p * 4, 0, 4);
          var sm = {}, tm = {};
          if (phase < 1.6) {
            for (var i = 0; i < 5; i++) sm[i] = "match";
            sm[5] = "cur"; tm[5] = "bad";
            drawStr(svg, S, 150, 110, 58, sm, "主串 S", "var(--ink-3)");
            drawStr(svg, T, 150, 200, 58, tm, "模式串 T（对齐位序1）", "var(--brand)");
            LS.txt(svg, 480, 310, "前 5 位都对上了……第 6 位：T[6]='e' ≠ S[6]='d' ❌", { size: 16, weight: 700, fill: "var(--red)" });
          } else {
            for (var j = 0; j < 5; j++) sm[j] = "bad";
            sm[1] = "cur";
            drawStr(svg, S, 150, 110, 58, sm, "主串 S", "var(--ink-3)");
            drawStr(svg, T, 208, 200, 58, {}, "模式串 T（退对齐位序2）", "var(--brand)");
            LS.txt(svg, 480, 310, "i 从 6 退回 2！橙色 = 刚看过的被迫重看 😤", { size: 16, weight: 700, fill: "var(--red)" });
            LS.arrow(svg, 150 + 5 * 58, 96, 150 + 1 * 58, 96, { stroke: "var(--red)", sw: 3 });
          }
          LS.txt(svg, 480, 370, "BF 最坏 ≈ (n−m+1) × m → O(n×m)", { size: 15, fill: "var(--ink-2)", opacity: LS.clamp(p * 4 - 2.6, 0, 1) });
        } },
      /* S3 前后缀 */
      { voice: "M", duration: 11, narration: "KMP 的灵感：已匹配的部分 abaab 里，开头两个字符 ab 和结尾两个字符 ab 完全一样。主串里刚比过的尾巴必然等于模式串自己的前缀——那就让模式串滑过来，让前缀直接对上后缀，i 一步不用退。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 46, "最长相等前后缀 = 滑动的距离表", { size: 23, weight: 800 });
          var t = LS.clamp(p * 4, 0, 1);
          var t2 = LS.clamp(p * 4 - 1.5, 0, 1);
          drawStr(svg, "abaab", 350, 110, 62, { 0: "pre", 1: "pre" }, "已匹配部分 T[1..5]", "var(--ink-3)");
          LS.txt(svg, 480, 200, "前缀 ab", { size: 15, fill: "var(--brand)", weight: 700, opacity: t });
          LS.txt(svg, 700, 200, "后缀 ab", { size: 15, fill: "var(--brand)", weight: 700, opacity: t, anchor: "end" });
          LS.el("path", { d: "M 381 160 C 300 190, 660 190, 579 160", fill: "none", stroke: "var(--brand)", "stroke-width": 2.5, "stroke-dasharray": "6 5", opacity: t }, svg);
          if (t2 > 0) {
            drawStr(svg, "abaabc", 305, 250, 62, { 0: "match", 1: "match", 2: "cur", 3: "cur", 4: "cur", 5: "cur" }, "T 滑动后：前缀直接对上主串后缀", "var(--green)");
            LS.txt(svg, 480, 350, "失配点之前的比较全部保留，j 滑到 3 继续比 —— i 纹丝不动", { size: 16, weight: 700, fill: "var(--green)", opacity: t2 });
          }
          LS.txt(svg, 480, 390, "每个位置滑多远，提前算好存进 next 数组", { size: 14, fill: "var(--ink-3)", opacity: LS.clamp(p * 4 - 3, 0, 1) });
        } },
      /* S4 手算 next */
      { voice: "F", duration: 13, narration: "手算 next 四步：第一位永远零；第二位永远一；后面的每一位，看它前面的子串，数最长相等真前后缀再加一。比如第四位看 aba，前后缀 a 相等长度一，加一得二。注意：只看前面，不看自己。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 42, "手算 next：'abaabc'", { size: 23, weight: 800 });
          var cols = [
            { j: 1, pre: "—", k: "—", next: 0 },
            { j: 2, pre: "a", k: "—", next: 1 },
            { j: 3, pre: "ab", k: "无", next: 1 },
            { j: 4, pre: "aba", k: "a (长1)", next: 2 },
            { j: 5, pre: "abaa", k: "a (长1)", next: 2 },
            { j: 6, pre: "abaab", k: "ab (长2)", next: 3 }
          ];
          var T = "abaabc";
          var k = Math.min(6, Math.floor(p * 6.8)); // 已填列数
          var cw = 118, x0 = 120, y0 = 100;
          // 表头
          ["位序 j", "T[j]", "看 T[1..j−1]", "最长相等前后缀", "next[j]"].forEach(function (h, c) {
            LS.txt(svg, x0 + 40 + [0, 1, 2.2, 3.9, 5.6][c] * 60, y0 - 14, h, { size: 12.5, fill: "var(--ink-3)" });
          });
          for (var j = 1; j <= 6; j++) {
            var done = j <= k;
            var y = y0 + j * 40;
            LS.box(svg, x0, y, cw * 4.9, 34, { rx: 8, fill: done ? "var(--card-2)" : "var(--card)", stroke: "var(--line)", opacity: done ? 1 : .35 });
            LS.txt(svg, x0 + 40, y + 23, j + "", { size: 15, weight: 700, opacity: done ? 1 : .35 });
            LS.txt(svg, x0 + 100, y + 23, T[j - 1], { size: 15, weight: 800, opacity: done ? 1 : .35 });
            if (done) {
              var c = cols[j - 1];
              LS.txt(svg, x0 + 232, y + 23, c.pre, { size: 14, fill: "var(--ink-2)", mono: true });
              LS.txt(svg, x0 + 374, y + 23, c.k, { size: 14, fill: c.k === "无" ? "var(--red)" : "var(--green)", weight: 700, mono: true });
              LS.txt(svg, x0 + 456, y + 23, c.next + "", { size: 16, weight: 800, fill: "var(--brand)", mono: true });
            }
          }
          LS.txt(svg, 480, 378, "口诀：看前串（不含自己），数相等真前后缀，加一填表", { size: 15, weight: 700, fill: "var(--brand)", opacity: LS.clamp(p * 6.8 - 5.4, 0, 1) });
        } },
      /* S5 KMP 匹配 */
      { voice: "M", duration: 13, narration: "看 KMP 实战：前五位顺利匹配，第六位失配，j 从六滑到三；继续比，第七位又失配，j 从四滑到二。注意看主串指针 i——它始终只往右走，绝不回头。这就是 O(n+m) 的来源。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 44, "KMP：i 永不回退，j 会跳", { size: 23, weight: 800 });
          var S = "abaababaabaabc", T = "abaabc";
          var next = [0, 1, 1, 2, 2, 3];
          // 阶段: 0-1 匹配1..5  1-2 失配6→j=3  2-3 续比+二次失配 7→j=2  3-4 冲线
          var ph = LS.clamp(p * 4, 0, 4);
          var sm = {}, align = 0, jShown = 1, note = "";
          if (ph < 1) {
            align = 0; jShown = Math.max(1, Math.min(6, Math.ceil(ph * 6)));
            for (var q = 0; q < jShown - 1; q++) sm[q] = "match";
            if (jShown <= 6) sm[jShown - 1] = "cur";
            note = "i=" + jShown + "，j=" + jShown + "：逐位对上，一路绿灯";
          } else if (ph < 2) {
            align = 0; sm[5] = "bad"; jShown = 6;
            note = "i=6 失配：T[6]='c' ≠ S[6]='a' → j = next[6] = 3（i 不动！）";
          } else if (ph < 3) {
            align = 2; jShown = 3; sm[2] = "match"; sm[6] = "bad";
            note = "j=3 续比通过；i=7 又失配：T[4]='a' ≠ S[7]='b' → j = next[4] = 2";
          } else {
            align = 8; jShown = 6;
            for (var w = 8; w < 14; w++) sm[w] = "match";
            sm[8] = "cur";
            note = "一路匹配到底：位序 9 命中！i 全程只前进不后退 ✅";
          }
          drawStr(svg, S, 60, 110, 55, sm, "主串 S（14 位）", "var(--ink-3)");
          var tm = {};
          for (var t2 = 0; t2 < 6; t2++) tm[t2] = t2 < jShown - 1 ? "match" : t2 === jShown - 1 ? "cur" : null;
          drawStr(svg, T, 60 + align * 55, 200, 55, tm, "模式串 T（当前对齐位序 " + (align + 1) + "）", "var(--brand)");
          LS.txt(svg, 480, 320, note, { size: 15.5, weight: 700, fill: "var(--brand)" });
          LS.txt(svg, 480, 365, "i 指针：→→→→→ 只前进 · j 指针：会滑会跳，但总量摊销 O(m)", { size: 14, fill: "var(--ink-2)", opacity: LS.clamp(p * 4 - 3, 0, 1) });
          LS.txt(svg, 480, 392, "KMP 总复杂度 O(n+m) · BF 是 O(n×m)", { size: 14, weight: 700, fill: "var(--green)", opacity: LS.clamp(p * 4 - 3.4, 0, 1) });
        } },
      /* S6 总结 */
      { voice: "M", duration: 11, narration: "总结：next 答“跳到哪”，nextval 答“跳过明知会失败的”。约定陷阱：408 用 next 一等于零的 1 起始约定，别的资料可能差一。大题就三种：算 next、算 nextval、分析复杂度——去实验室练三遍就稳了。",
        draw: function (svg, p) {
          LS.clear(svg);
          LS.txt(svg, 480, 46, "考点三连收尾", { size: 23, weight: 800 });
          var t = LS.clamp(p * 4, 0, 1), t2 = LS.clamp(p * 4 - 1.2, 0, 1), t3 = LS.clamp(p * 4 - 2.4, 0, 1);
          LS.box(svg, 80, 90, 800, 70, { rx: 14, fill: "var(--card-2)", stroke: "var(--line)", opacity: t });
          LS.txt(svg, 480, 133, "① 手算 next：next[1]=0，next[2]=1，其余看前串的前后缀 + 1", { size: 17, weight: 700, opacity: t });
          LS.box(svg, 80, 180, 800, 70, { rx: 14, fill: "var(--card-2)", stroke: "var(--line)", opacity: t2 });
          LS.txt(svg, 480, 223, "② nextval：T[j] 与 T[next[j]] 相同 → 继承 nextval[next[j]]（跳过白比）", { size: 17, weight: 700, opacity: t2 });
          LS.box(svg, 80, 270, 800, 70, { rx: 14, fill: "var(--brand-soft)", opacity: t3 });
          LS.txt(svg, 480, 313, "③ 复杂度：BF O(n×m) → KMP O(n+m)，主串指针不回溯", { size: 17, weight: 800, fill: "var(--brand)", opacity: t3 });
          LS.txt(svg, 480, 380, "约定陷阱：严蔚敏 1 起始 next[1]=0 ｜ 某些资料 0 起始 next[0]=−1，先看题面！", { size: 14, fill: "var(--red)", weight: 700, opacity: LS.clamp(p * 4 - 3.4, 0, 1) });
        } }
    ]
  };
  initLesson();
})();
