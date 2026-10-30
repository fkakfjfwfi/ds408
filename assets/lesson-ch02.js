/* 第 2 集《盘子、队伍与传送带》 · 6 幕 */
window.LESSON = {
  id: "ch02",
  title: "盘子、队伍与传送带",
  scenes: [
    /* S1 栈=羽毛球筒 */
    { voice: "F", duration: 10, narration: "栈，就是一个羽毛球筒：球只能从筒口进出。先塞进去的被压在最底下，最后才拿出来——这就是后进先出，LIFO。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "栈 = 羽毛球筒（后进先出 LIFO）", { size: 24, weight: 700 });
        var cx = 480, topY = 120, ballR = 34, slotH = 72;
        // 筒身
        LS.box(svg, cx - 160, topY - 40, 320, 260, { rx: 22, fill: "none", stroke: "var(--brand)", sw: 3 });
        LS.txt(svg, cx - 200, topY - 60, "筒口（栈顶 top）", { size: 14, fill: "var(--brand)", anchor: "start" });
        var items = ["A", "B", "C", "D"];
        var phase = p * 6; // 0-4 push A~D, 4-6 pop D,C
        var inStack = [];
        items.forEach(function (v, i) {
          var t = LS.clamp(phase - i, 0, 1);
          if (t > 0 && phase <= 4 + i) {
            var target = 330 - i * slotH - ballR;
            var y = topY - 60 + LS.ease(t) * (target - (topY - 60));
            LS.circle(svg, cx, y, ballR, { fill: "var(--svg-fill)", sw: 2.5 });
            LS.txt(svg, cx, y + 7, v, { size: 20, weight: 700 });
            inStack.push(v);
          }
        });
        var popT = LS.clamp(phase - 4, 0, 1);
        if (popT > 0 && popT < 1) {
          var y = 330 - 3 * slotH - ballR - LS.ease(popT) * 150;
          LS.circle(svg, cx, y, ballR, { fill: "var(--accent-soft)", stroke: "var(--accent)", sw: 2.5 });
          LS.txt(svg, cx, y + 7, "D", { size: 20, weight: 700, fill: "var(--accent)" });
        } else if (popT >= 1) {
          var y2 = 330 - 2 * slotH - ballR - LS.ease(LS.clamp(phase - 5, 0, 1)) * 150;
          LS.circle(svg, cx, y2, ballR, { fill: "var(--accent-soft)", stroke: "var(--accent)", sw: 2.5 });
          LS.txt(svg, cx, y2 + 7, "C", { size: 20, weight: 700, fill: "var(--accent)" });
        }
        var n = Math.min(4, Math.floor(phase));
        LS.txt(svg, 820, 200, "栈内 " + Math.max(0, n - Math.floor(LS.clamp(phase - 4, 0, 2))) + " 个", { size: 16, fill: "var(--ink-2)" });
        LS.txt(svg, 480, 375, "push 入栈 · pop 出栈 · 只碰栈顶一端", { size: 16, fill: "var(--ink-2)", opacity: LS.clamp(p * 3 - 1, 0, 1) });
      } },
    /* S2 括号匹配 */
    { voice: "F", duration: 11, narration: "栈的经典应用：括号匹配。左括号进栈，右括号来时弹出栈顶配对。三种失败：右括号来了栈空、扫完了栈还剩、配的类型不对。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "括号匹配：用栈逐字符扫描", { size: 24, weight: 700 });
        var s = ["(", "(", "[", "]", ")", ")"];
        var cx = 300, w = 60;
        // 表达式
        s.forEach(function (c, i) {
          var scanned = p * 6 > i + 0.3;
          LS.box(svg, cx + i * (w + 14), 100, w, 60, { rx: 8, fill: scanned ? "var(--brand-soft)" : "var(--card)", stroke: scanned ? "var(--brand)" : "var(--line)" });
          LS.txt(svg, cx + i * (w + 14) + w / 2, 138, c, { size: 26, weight: 700 });
        });
        // 模拟栈状态
        var k = Math.min(6, Math.floor(p * 6 + 0.29));
        var st = [], matched = [];
        for (var i = 0; i < k; i++) {
          var c = s[i];
          if (c === "(" || c === "[") st.push({ c: c, i: i });
          else if (st.length) { var o = st.pop(); matched.push(o.i); matched.push(i); }
        }
        // 栈可视化
        LS.box(svg, 700, 100, 110, 240, { rx: 14, fill: "var(--card-2)", stroke: "var(--line)" });
        LS.txt(svg, 755, 92, "栈", { size: 15, fill: "var(--ink-3)" });
        st.forEach(function (o, j) {
          LS.box(svg, 715, 320 - 62 - j * 58, 80, 50, { rx: 8, fill: "var(--svg-fill)" });
          LS.txt(svg, 755, 320 - 62 - j * 58 + 33, o.c, { size: 22, weight: 700 });
        });
        // 配对成功的括号变绿
        matched.forEach(function (idx) {
          var r = LS.el("rect", { x: cx + idx * (w + 14) + 4, y: 104, width: w - 8, height: 52, rx: 6, fill: "none", stroke: "var(--green)", "stroke-width": 3 }, svg);
        });
        LS.txt(svg, 480, 380, k >= 6 ? (st.length === 0 ? "扫描完毕，栈空 → 全部匹配成功 ✅" : "扫描完毕，栈非空 → 缺右括号 ❌") : "扫描中……", { size: 16, weight: 700, fill: "var(--green)" });
      } },
    /* S3 卡特兰数 */
    { voice: "M", duration: 10, narration: "进阶考点：n 个元素依次进栈，出栈序列有卡特兰数种。3 个元素是 5 种，注意 312 这种序列不可能——3 先出来时，1 必须还压在栈里。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "3 个元素进栈，出栈序列有几种？", { size: 24, weight: 700 });
        var seqs = ["1 2 3", "1 3 2", "2 1 3", "2 3 1", "3 2 1"];
        seqs.forEach(function (t, i) {
          var show = LS.clamp(p * 6 - i * 0.8, 0, 1);
          if (show <= 0) return;
          LS.box(svg, 240, 110 + i * 52, 200, 44, { rx: 10, fill: "var(--svg-fill)", opacity: show });
          LS.txt(svg, 340, 139 + i * 52, t, { size: 19, weight: 700, opacity: show, mono: true });
        });
        var bad = LS.clamp(p * 6 - 4.2, 0, 1);
        if (bad > 0) {
          LS.box(svg, 540, 110 + 0 * 52, 200, 44, { rx: 10, fill: "var(--red-soft)", stroke: "var(--red)", opacity: bad });
          LS.txt(svg, 640, 139, "3 1 2", { size: 19, weight: 700, fill: "var(--red)", opacity: bad, mono: true });
          LS.txt(svg, 770, 139, "❌ 不可能", { size: 15, fill: "var(--red)", opacity: bad, anchor: "start" });
        }
        var f = LS.clamp(p * 6 - 4.8, 0, 1);
        LS.txt(svg, 640, 330, "卡特兰数 = C₍₂ₙₙ₎ / (n+1)", { size: 20, weight: 800, fill: "var(--brand)", opacity: f });
        LS.txt(svg, 640, 368, "n=3 → 5 种　n=4 → 14 种　n=5 → 42 种", { size: 15, fill: "var(--ink-2)", opacity: f });
      } },
    /* S4 队列 */
    { voice: "F", duration: 9, narration: "队列反过来：像奶茶店排队，新来的排到队尾，店员从队头叫号——先进先出 FIFO。入队在 rear，出队在 front。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "队列 = 排队买奶茶（先进先出 FIFO）", { size: 24, weight: 700 });
        var w = 90, gap = 20, y = 150;
        var n = 4, extra = p > .55 ? 1 : 0;
        var gone = p > .75 ? 1 : 0;
        var total = n + extra - gone;
        var shift = gone * (w + gap) * LS.ease(LS.clamp((p - .75) * 4, 0, 1));
        for (var i = 0; i < total; i++) {
          var x = 140 + i * (w + gap) + shift;
          LS.box(svg, x, y, w, 84, { rx: 12, fill: i === 0 ? "var(--green-soft)" : i === total - 1 ? "var(--accent-soft)" : "var(--svg-fill)", stroke: i === 0 ? "var(--green)" : i === total - 1 ? "var(--accent)" : "var(--line)", sw: 2 });
          LS.txt(svg, x + w / 2, y + 50, "同学" + (i + 1 + gone), { size: 16, weight: 700 });
        }
        LS.arrow(svg, 150 + shift, 270, 150 + shift, 250, { stroke: "var(--green)", sw: 3 });
        LS.txt(svg, 175 + shift, 285, "队头 front · 出队", { size: 14, fill: "var(--green)", anchor: "start" });
        var tailX = 140 + (total - 1) * (w + gap) + shift + w;
        LS.arrow(svg, tailX, 270, tailX, 250, { stroke: "var(--accent)", sw: 3 });
        LS.txt(svg, tailX - 6, 285, "队尾 rear · 入队", { size: 14, fill: "var(--accent)", anchor: "end" });
        LS.txt(svg, 480, 360, "first come, first served —— 先来的先出队", { size: 16, fill: "var(--ink-2)" });
      } },
    /* S5 循环队列 */
    { voice: "F", duration: 12, narration: "数组实现的队列有个坑：出队后前半段空着，rear 却已到底，这叫假溢出。解法是首尾相接成传送带：rear = (rear+1) 取模容量，走到头就绕回来。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 48, "循环队列：取模让指针绕圈", { size: 24, weight: 700 });
        var cx = 400, cy = 225, R = 130, n = 6;
        var ops = [["E", "in"], ["E", "in"], ["D", "out"], ["D", "out"], ["E", "in"]]; // front=0
        var front = 0, rear = 0, cnt = 0;
        var step = Math.floor(p * 5.99); // 当前执行到第几步
        var st = LS.clamp(p * 5.99 - step, 0, 1);
        var labels = [];
        for (var k = 0; k <= step; k++) {
          if (ops[k][0] === "E") { if (cnt < 5) { labels[rear] = "E" + (cnt + 1); rear = (rear + 1) % n; cnt++; } }
          else { if (cnt > 0) { labels[front] = null; front = (front + 1) % n; cnt--; } }
        }
        var cur = null, curOp = null;
        if (step < 5) curOp = ops[step][0] === "E" ? "in" : "out";
        for (var i = 0; i < n; i++) {
          var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
          var x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
          var has = labels[i] != null;
          var isCur = false;
          if (curOp === "in" && i === rear) isCur = true;
          if (curOp === "out" && i === front) isCur = true;
          LS.circle(svg, x, y, 40, { fill: isCur ? "var(--accent-soft)" : has ? "var(--svg-fill)" : "var(--card)", stroke: isCur ? "var(--accent)" : has ? "var(--brand)" : "var(--line)", sw: has || isCur ? 2.5 : 1.5 });
          LS.txt(svg, x, y + 7, has ? labels[i] : "空", { size: 15, weight: has ? 700 : 400, fill: has ? "var(--svg-ink)" : "var(--ink-3)" });
          LS.txt(svg, x, y + 62, i, { size: 11, fill: "var(--ink-3)" });
        }
        function mark(idx, color, name, dy) {
          var ang = -Math.PI / 2 + idx * 2 * Math.PI / n;
          var x = cx + (R + 78) * Math.cos(ang), y = cy + (R + 78) * Math.sin(ang);
          LS.txt(svg, x, y + dy, name + "=" + idx, { size: 15, weight: 800, fill: color });
        }
        mark(front, "var(--green)", "front", 0);
        mark(rear, "var(--accent)", "rear", 20);
        LS.txt(svg, 800, 180, "入队：rear=(rear+1)%6", { size: 15, fill: "var(--accent)", anchor: "middle", weight: 700 });
        LS.txt(svg, 800, 215, "出队：front=(front+1)%6", { size: 15, fill: "var(--green)", anchor: "middle", weight: 700 });
        LS.txt(svg, 800, 250, "元素个数", { size: 13, fill: "var(--ink-3)", anchor: "middle" });
        LS.txt(svg, 800, 280, "(rear−front+6)%6 = " + cnt, { size: 16, weight: 700, anchor: "middle" });
        LS.txt(svg, 400, 380, "指针走到下标 5 之后，取模回到 0 —— 假溢出消失", { size: 15, fill: "var(--ink-2)" });
      } },
    /* S6 判满判空总结 */
    { voice: "M", duration: 11, narration: "408 必考：循环队列怎么判满判空？方案一牺牲一格，判满是 rear 下一格撞上 front；方案三用 tag 标记最近一次操作，入队置 1、出队置 0，不浪费存储单元。",
      draw: function (svg, p) {
        LS.clear(svg);
        LS.txt(svg, 480, 52, "判空判满：三大方案（默写级）", { size: 24, weight: 700 });
        var t = LS.clamp(p * 3, 0, 1), t2 = LS.clamp(p * 3 - 1, 0, 1);
        // 方案①
        LS.box(svg, 60, 100, 400, 250, { rx: 16, fill: "var(--card-2)", stroke: "var(--line)", opacity: t });
        LS.txt(svg, 260, 140, "① 牺牲一格（最常用）", { size: 18, weight: 700, opacity: t });
        LS.txt(svg, 260, 185, "判空：front == rear", { size: 16, mono: true, opacity: t });
        LS.txt(svg, 260, 225, "判满：(rear+1)%MaxSize == front", { size: 16, mono: true, opacity: t });
        LS.txt(svg, 260, 265, "个数：(rear−front+MaxSize)%MaxSize", { size: 14, mono: true, fill: "var(--ink-2)", opacity: t });
        LS.txt(svg, 260, 310, "代价：满队时只能存 MaxSize−1 个", { size: 14, fill: "var(--red)", opacity: t });
        // 方案③ tag
        LS.box(svg, 500, 100, 400, 250, { rx: 16, fill: "var(--card-2)", stroke: "var(--line)", opacity: t2 });
        LS.txt(svg, 700, 140, "③ tag 标志（不牺牲格子）", { size: 18, weight: 700, opacity: t2 });
        LS.txt(svg, 700, 185, "判空：tag==0 且 front==rear", { size: 16, mono: true, opacity: t2 });
        LS.txt(svg, 700, 225, "判满：tag==1 且 front==rear", { size: 16, mono: true, opacity: t2 });
        LS.txt(svg, 700, 265, "入队后 tag=1，出队后 tag=0", { size: 14, fill: "var(--ink-2)", opacity: t2 });
        LS.txt(svg, 700, 310, "看点：front==rear 到底是空是满？", { size: 14, fill: "var(--brand)", opacity: t2 });
        LS.txt(svg, 480, 375, "tag 由「最近一次操作」说话：刚入队还相等 → 满；刚出队还相等 → 空", { size: 15, fill: "var(--brand)", weight: 700, opacity: LS.clamp(p * 3 - 2, 0, 1) });
      } }
  ]
};
initLesson();
