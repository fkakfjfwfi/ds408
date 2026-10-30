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
  document.querySelectorAll(".quiz").forEach(function (q) {
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
    });
  });
})();
