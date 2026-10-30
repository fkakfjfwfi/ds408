/* 第 7 章交互实验室：next/nextval 计算 + KMP 匹配动画 */
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
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var S = "abaababaabaabc";
  var svg = document.getElementById("kmp-svg");
  var noteEl = document.getElementById("kmp-note");
  var patInput = document.getElementById("kmp-pat");
  var runId = 0;

  /* 计算 next（1 起始，next[1]=0）/ nextval */
  function computeNext(pat) {
    var m = pat.length, next = [0, 0], nextval = [0, 0]; // 下标从 1 用
    next[1] = 0; if (m >= 2) next[2] = 1;
    for (var j = 3; j <= m; j++) {
      // 求 T[1..j-1] 的最长相等真前后缀长度 k
      var sub = pat.slice(0, j - 1), k = 0;
      for (var len = sub.length - 1; len >= 1; len--) {
        if (sub.slice(0, len) === sub.slice(sub.length - len)) { k = len; break; }
      }
      next[j] = k + 1;
    }
    nextval[1] = 0;
    for (var j2 = 2; j2 <= m; j2++) {
      nextval[j2] = (pat[j2 - 1] === pat[next[j2] - 1]) ? nextval[next[j2]] : next[j2];
    }
    return { next: next, nextval: nextval };
  }

  function drawTable(pat, nx, nv) {
    svg.innerHTML = "";
    var cw = [70, 70, 200, 130], x0 = 120, y0 = 40;
    var heads = ["j", "T[j]", "next[j]", "nextval[j]"];
    var xs = [x0, x0 + 60, x0 + 190, x0 + 390];
    heads.forEach(function (h, c) { T(svg, xs[c] + 30, y0, h, 13.5, "var(--ink-3)", 700); });
    for (var j = 1; j <= pat.length; j++) {
      var y = y0 + j * 40;
      E("rect", { x: x0, y: y, width: 500, height: 34, rx: 8, fill: "var(--card-2)", stroke: "var(--line)", "stroke-width": 1.2 }, svg);
      T(svg, xs[0] + 30, y + 22, j + "", 15, "var(--ink-3)", 700, true);
      T(svg, xs[1] + 30, y + 22, pat[j - 1], 16, "var(--svg-ink)", 800, true);
      T(svg, xs[2] + 30, y + 22, nx[j] + "", 16, "var(--brand)", 800, true);
      T(svg, xs[3] + 30, y + 22, nv[j] + "", 16, "var(--accent)", 800, true);
    }
    T(svg, 720, 60, "next[1]=0，next[2]=1", 13.5, "var(--ink-3)", 400);
    T(svg, 720, 90, "其余：看 T[1..j−1]", 13.5, "var(--ink-3)", 400);
    T(svg, 720, 110, "数相等真前后缀 + 1", 13.5, "var(--ink-3)", 400);
    T(svg, 720, 150, "nextval：若 T[j] 与", 13.5, "var(--accent)", 400);
    T(svg, 720, 170, "T[next[j]] 相同 → 继承", 13.5, "var(--accent)", 400);
  }

  function drawMatch(step) {
    // step: {i, j, kind: 'ok'|'bad'|'jump'|'done', align}
    svg.innerHTML = "";
    var cw = 48, x0 = 40, y1 = 60, y2 = 150;
    T(svg, 10, y1 + 26, "S", 15, "var(--ink-3)", 800);
    T(svg, 10, y2 + 26, "T", 15, "var(--brand)", 800);
    for (var i = 0; i < S.length; i++) {
      var m = null;
      if (step.matchedFrom != null && i >= step.matchedFrom && i < step.i) m = "match";
      if (i === step.i - 1) m = step.kind === "bad" ? "bad" : "cur";
      E("rect", { x: x0 + i * cw, y: y1, width: cw - 6, height: 46, rx: 7,
        fill: m === "match" ? "var(--green-soft)" : m === "cur" ? "var(--accent-soft)" : m === "bad" ? "var(--red-soft)" : "var(--svg-fill)",
        stroke: m === "match" ? "var(--green)" : m === "cur" ? "var(--accent)" : m === "bad" ? "var(--red)" : "var(--line)", "stroke-width": m ? 2.5 : 1.5 }, svg);
      T(svg, x0 + i * cw + (cw - 6) / 2, y1 + 30, S[i], 18, m === "bad" ? "var(--red)" : m === "cur" ? "var(--accent)" : "var(--svg-ink)", 800);
      T(svg, x0 + i * cw + (cw - 6) / 2, y1 + 66, (i + 1) + "", 10, "var(--ink-3)", 400);
    }
    var pat = step.pat, j = step.j;
    var align = step.i - j; // T[1] 对齐 S[align]（0 基）
    for (var k = 0; k < pat.length; k++) {
      var m2 = k === j - 1 ? (step.kind === "bad" ? "bad" : "cur") : (k < j - 1 ? "match" : null);
      E("rect", { x: x0 + (align + k) * cw, y: y2, width: cw - 6, height: 46, rx: 7,
        fill: m2 === "match" ? "var(--green-soft)" : m2 === "cur" ? "var(--accent-soft)" : m2 === "bad" ? "var(--red-soft)" : "var(--card)",
        stroke: m2 === "match" ? "var(--green)" : m2 === "cur" ? "var(--accent)" : m2 === "bad" ? "var(--red)" : "var(--line)", "stroke-width": m2 ? 2.5 : 1.2 }, svg);
      T(svg, x0 + (align + k) * cw + (cw - 6) / 2, y2 + 30, pat[k], 18, m2 === "bad" ? "var(--red)" : m2 === "cur" ? "var(--accent)" : m2 ? "var(--brand)" : "var(--ink-3)", 800);
    }
    T(svg, 760, y2 + 26, "j=" + j, 15, "var(--brand)", 800, true);
    T(svg, 760, y1 + 26, "i=" + step.i, 15, "var(--accent)", 800, true);
  }

  /* 预计算匹配步骤 */
  function matchSteps(pat, nx) {
    var steps = [], m = pat.length, i = 1, j = 1;
    steps.push({ i: 1, j: 1, kind: "ok", pat: pat, note: "起点：i=1，j=1，开始逐位比较" });
    while (i <= S.length) {
      if (S[i - 1] === pat[j - 1]) {
        i++; j++;
        if (j > m) {
          steps.push({ i: i - 1, j: m, kind: "done", pat: pat, matchedFrom: i - m - 1, note: "🎉 完整匹配！模式串命中主串位序 " + (i - m) + " ~ " + (i - 1) + "（i 全程没有回退）" });
          return steps;
        }
        steps.push({ i: i, j: j, kind: "ok", pat: pat, matchedFrom: i - j, note: "S[" + (i - 1) + "] = T[" + j + "] = '" + S[i - 2] + "' ✓ 双双右移（i=" + i + ", j=" + j + "）" });
      } else {
        if (j !== 1) {
          var oldJ = j;
          j = nx[j];
          steps.push({ i: i, j: j, kind: "jump", pat: pat, matchedFrom: i - j, note: "S[" + i + "] ≠ T[" + oldJ + "] → 失配！j 滑到 next[" + oldJ + "] = " + j + "，i 原地不动" });
        } else {
          i++;
          steps.push({ i: i, j: 1, kind: "jump", pat: pat, note: "j 已是 1 仍失配 → i 右移一位，从头再比" });
        }
      }
    }
    return steps;
  }

  var lastNext = null;
  document.getElementById("kmp-calc").addEventListener("click", function () {
    var pat = patInput.value.trim();
    if (!pat) { noteEl.innerHTML = "请输入模式串（建议 4~8 个字符）"; return; }
    var r = computeNext(pat);
    lastNext = r.next;
    drawTable(pat, r.next, r.nextval);
    noteEl.innerHTML = "已计算 <b>" + pat + "</b> 的 next 与 nextval。对照手算过程检查，然后点「播放匹配」看它们如何工作。";
  });
  document.getElementById("kmp-play").addEventListener("click", async function () {
    var pat = patInput.value.trim();
    if (!pat) { noteEl.innerHTML = "请先输入模式串"; return; }
    var nx = computeNext(pat).next;
    lastNext = nx;
    var steps = matchSteps(pat, nx);
    var id = ++runId;
    for (var i = 0; i < steps.length; i++) {
      if (id !== runId) return;
      drawMatch(steps[i]);
      noteEl.innerHTML = steps[i].note;
      await sleep(steps[i].kind === "jump" ? 1100 : 750);
    }
  });
  document.getElementById("kmp-reset").addEventListener("click", function () {
    runId++; svg.innerHTML = "";
    patInput.value = "abaabc";
    noteEl.innerHTML = "主串固定为 S = " + S + "（长度 14）。先算 next，再播放匹配。";
  });
})();
