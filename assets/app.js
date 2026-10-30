/* 408 数据结构可视化课堂 · 共享逻辑：主题 / 打卡 / 练习 / 导航 */
(function () {
  "use strict";

  /* ── 主题切换（明暗双主题，记忆在 localStorage） ── */
  var THEME_KEY = "ds408_theme";
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.querySelector(".theme-btn");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved || "light");
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".theme-btn");
    if (!btn) return;
    var cur = document.documentElement.getAttribute("data-theme") || "light";
    var next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* ── 导航高亮 ── */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  /* ── 打卡清单（localStorage 持久化） ── */
  var CK_KEY = "ds408_checklist";
  function loadCK() {
    try { return JSON.parse(localStorage.getItem(CK_KEY) || "{}"); } catch (e) { return {}; }
  }
  function saveCK(o) {
    try { localStorage.setItem(CK_KEY, JSON.stringify(o)); } catch (e) {}
  }
  function refreshCounters() {
    var state = loadCK();
    document.querySelectorAll("[data-ck-scope]").forEach(function (scope) {
      var items = scope.querySelectorAll(".check-item");
      var done = 0;
      items.forEach(function (it) {
        var id = it.getAttribute("data-ck");
        if (state[id]) { done++; }
      });
      var counter = scope.querySelector(".progress-pill");
      if (counter) counter.textContent = done + " / " + items.length + " 已打卡";
      // 同步首页总计数
      document.querySelectorAll("[data-ck-total]").forEach(function (el) {
        var all = loadCK(); var total = 0, dn = 0;
        Object.keys(all).forEach(function (k) { total++; if (all[k]) dn++; });
        el.textContent = dn + " / " + total + " 项已打卡";
      });
    });
  }
  document.addEventListener("change", function (ev) {
    var box = ev.target.closest(".check-item input[type=checkbox]");
    if (!box) return;
    var item = box.closest(".check-item");
    var id = item.getAttribute("data-ck");
    if (!id) return;
    var state = loadCK();
    state[id] = box.checked;
    saveCK(state);
    item.classList.toggle("done", box.checked);
    refreshCounters();
  });
  // 初始化勾选状态
  var ckState = loadCK();
  document.querySelectorAll(".check-item").forEach(function (it) {
    var id = it.getAttribute("data-ck");
    if (id && ckState[id]) { it.classList.add("done"); var b = it.querySelector("input"); if (b) b.checked = true; }
  });
  refreshCounters();

  /* ── 练习题（选择题判题 + 可展开解析 + 难度/年份标签自动渲染） ── */
  document.querySelectorAll(".quiz").forEach(function (q) {
    // 从 data-diff / data-year 自动渲染标签，避免每题手写 HTML
    var tag = q.querySelector(".q-tag");
    if (tag) {
      var diff = q.getAttribute("data-diff");
      var year = q.getAttribute("data-year");
      var bits = [];
      if (diff) {
        var map = { basic: ["基础", "lvl basic"], mid: ["提高", "lvl mid"], real: ["真题", "lvl real"] };
        if (map[diff]) bits.push('<span class="' + map[diff][1] + '">' + map[diff][0] + "</span>");
      }
      if (year) bits.push('<span class="q-year">' + year + "年 408 真题</span>");
      if (bits.length) tag.insertAdjacentHTML("afterbegin", bits.join(""));
    }
  });

  /* ── 题库 HUD：进度 / 正确率 / 错题本 / 收藏 / 随机抽题（全部 localStorage 持久化） ── */
  var QS_KEY = "ds408_qstats", FAV_KEY = "ds408_fav";
  function loadJSON(k, d) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
  }
  function saveJSON(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
    return h.toString(36);
  }
  /* 题干文本（去掉标签）作为稳定 ID：改写题干才会换 ID，加题/挪位置都不受影响 */
  function stemOf(q) {
    var head = q.querySelector(".q-head");
    if (!head) return "";
    var clone = head.cloneNode(true);
    var t = clone.querySelector(".q-tag");
    if (t) t.parentNode.removeChild(t);
    return clone.textContent.replace(/\s+/g, " ").trim().slice(0, 160);
  }

  var PAGE = location.pathname.split("/").pop() || "index.html";
  var quizzes = Array.prototype.slice.call(document.querySelectorAll(".quiz"));
  var qStats = loadJSON(QS_KEY, {});
  var qFavs = loadJSON(FAV_KEY, {});
  quizzes.forEach(function (q) { q.__qid = PAGE + "-" + hashStr(stemOf(q)); });

  var hudBar = null, hudMode = "all";
  function refreshHud() {
    if (!hudBar) return;
    var answered = 0, correct = 0, wrong = 0, fav = 0;
    quizzes.forEach(function (q) {
      var s = qStats[q.__qid];
      if (s === 1) { answered++; correct++; }
      else if (s === 0) { answered++; wrong++; }
      if (qFavs[q.__qid]) fav++;
    });
    hudBar.querySelector(".hud-n b").textContent = answered;
    hudBar.querySelector(".hud-acc b").textContent = answered ? Math.round(correct / answered * 100) + "%" : "—";
    hudBar.querySelector(".hud-wrong b").textContent = wrong;
    hudBar.querySelector(".hud-fav b").textContent = fav;
    hudBar.querySelectorAll("[data-hud]").forEach(function (b) {
      var m = b.getAttribute("data-hud");
      if (m === "all" || m === "reset") { b.classList.add("ghost"); return; }
      b.classList.toggle("on", m === hudMode);
    });
  }
  function announce(msg) {
    if (!hudBar) return;
    var el = hudBar.querySelector(".hud-msg");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }
  function applyMode(mode) {
    hudMode = mode;
    var show = quizzes;
    if (mode === "wrong") show = quizzes.filter(function (q) { return qStats[q.__qid] === 0; });
    else if (mode === "fav") show = quizzes.filter(function (q) { return qFavs[q.__qid]; });
    else if (mode === "random") {
      var arr = quizzes.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      show = arr.slice(0, Math.min(10, arr.length));
    }
    quizzes.forEach(function (q) { q.style.display = show.indexOf(q) >= 0 ? "" : "none"; });
    if (mode === "wrong" && !show.length) announce("错题本是空的 —— 继续保持！");
    if (mode === "fav" && !show.length) announce("还没有收藏题 —— 点题卡右上角的 ☆");
    if (mode === "random") announce("已随机抽取 " + show.length + " 题");
    if (mode === "all") announce("已显示全部 " + quizzes.length + " 题");
    refreshHud();
  }
  function buildHud() {
    if (!quizzes.length) return;
    var bar = document.createElement("div");
    bar.className = "quiz-hud";
    bar.innerHTML =
      '<div class="hud-stats">' +
        '<span class="hud-n">已答 <b>0</b> / ' + quizzes.length + "</span>" +
        '<span class="hud-acc">正确率 <b>—</b></span>' +
        '<span class="hud-wrong">错题 <b>0</b></span>' +
        '<span class="hud-fav">收藏 <b>0</b></span>' +
      "</div>" +
      '<div class="hud-actions">' +
        '<button data-hud="wrong">只看错题</button>' +
        '<button data-hud="fav">只看收藏</button>' +
        '<button data-hud="random">随机 10 题</button>' +
        '<button data-hud="all" class="ghost">显示全部</button>' +
        '<button data-hud="reset" class="ghost">重置进度</button>' +
      "</div>" +
      '<div class="hud-msg"></div>';
    var wrap = document.querySelector(".wrap");
    if (wrap) {
      var toc = wrap.querySelector(".toc");
      wrap.insertBefore(bar, toc ? toc : wrap.firstChild);
    }
    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-hud]");
      if (!b) return;
      var m = b.getAttribute("data-hud");
      if (m === "reset") {
        quizzes.forEach(function (q) { delete qStats[q.__qid]; });
        saveJSON(QS_KEY, qStats);
        location.reload();
        return;
      }
      applyMode(m === hudMode && m !== "all" ? "all" : m);
    });
    hudBar = bar;
    refreshHud();
  }

  quizzes.forEach(function (q) {
    var opts = q.querySelectorAll(".opt");
    var answer = q.getAttribute("data-answer"); // 如 "B"
    var picked = null;
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        if (q.getAttribute("data-done") === "1") return;
        opts.forEach(function (x) { x.classList.remove("sel"); });
        o.classList.add("sel");
        picked = o.getAttribute("data-opt");
      });
    });
    var btn = q.querySelector(".btn-ans");
    var res = q.querySelector(".q-res");
    var exp = q.querySelector(".q-exp");

    // 收藏星标
    var head = q.querySelector(".q-head");
    if (head) {
      var star = document.createElement("button");
      star.className = "q-fav";
      star.type = "button";
      star.title = "收藏这道题";
      star.textContent = qFavs[q.__qid] ? "★" : "☆";
      if (qFavs[q.__qid]) star.classList.add("on");
      star.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (qFavs[q.__qid]) { delete qFavs[q.__qid]; star.textContent = "☆"; star.classList.remove("on"); }
        else { qFavs[q.__qid] = 1; star.textContent = "★"; star.classList.add("on"); }
        saveJSON(FAV_KEY, qFavs);
        refreshHud();
      });
      head.style.position = "relative";
      head.appendChild(star);
    }

    // 恢复上次作答状态
    if (qStats[q.__qid] !== undefined) {
      q.setAttribute("data-done", "1");
      var wasOk = qStats[q.__qid] === 1;
      opts.forEach(function (x) {
        if (x.getAttribute("data-opt") === answer) x.classList.add("right");
      });
      if (res) {
        res.textContent = wasOk ? "✅ 上次答对" : "❌ 上次答错（正确答案是 " + answer + "）";
        res.className = "q-res " + (wasOk ? "good" : "bad");
      }
      if (btn) btn.textContent = "查看解析";
    }

    if (btn) btn.addEventListener("click", function () {
      if (q.getAttribute("data-done") === "1") {
        exp.classList.toggle("show");
        btn.textContent = exp.classList.contains("show") ? "收起解析" : "查看解析";
        return;
      }
      if (!picked) { res.textContent = "先选一个答案再提交哦"; res.className = "q-res"; return; }
      q.setAttribute("data-done", "1");
      var ok = picked === answer;
      res.textContent = ok ? "✅ 答对了！" : "❌ 答错了，正确答案是 " + answer;
      res.className = "q-res " + (ok ? "good" : "bad");
      opts.forEach(function (x) {
        var v = x.getAttribute("data-opt");
        if (v === answer) x.classList.add("right");
        else if (v === picked) x.classList.add("wrong");
      });
      btn.textContent = "查看解析";
      exp.classList.add("show");
      qStats[q.__qid] = ok ? 1 : 0;
      saveJSON(QS_KEY, qStats);
      refreshHud();
      if (!ok) announce("已收入错题本，可点「只看错题」重做");
    });
  });
  buildHud();
})();
