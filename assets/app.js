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

  /* ══════════ 题库：进度 / 错题本 / 收藏 / 随机抽题 ══════════
   * 持久化设计（v2，专治"刷新后进度丢失"）：
   *  1) 主键 = 页码 + 题目在该页的顺序号（#0、#1…），永不受题干改写影响；
   *  2) 同时记录题干指纹 h，用于识别"题目被改写过"；
   *  3) 记录草稿 d（选中但未提交的选项），刷新后仍保留选中态；
   *  4) 兼容迁移旧版（ds408_qstats，主键为题干哈希）的数据；
   *  5) localStorage 不可用时在状态栏显式警告，不再静默失败。
   */
  var QS_KEY = "ds408_qstats_v2";
  var QS_KEY_OLD = "ds408_qstats";
  var FAV_KEY = "ds408_fav";

  var storageOK = (function () {
    try {
      var k = "__ds408_probe__";
      localStorage.setItem(k, "1");
      var ok = localStorage.getItem(k) === "1";
      localStorage.removeItem(k);
      return ok;
    } catch (e) { return false; }
  })();

  function loadJSON(k, d) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
  }
  function saveJSON(k, o) {
    try { localStorage.setItem(k, JSON.stringify(o)); return true; }
    catch (e) { return false; }
  }
  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
    return h.toString(36);
  }
  /* 题干指纹：去掉标签与收藏星标后的正文 */
  function stemOf(q) {
    var head = q.querySelector(".q-head");
    if (!head) return "";
    var clone = head.cloneNode(true);
    var drop = clone.querySelectorAll(".q-tag, .q-fav");
    for (var i = 0; i < drop.length; i++) drop[i].parentNode.removeChild(drop[i]);
    return clone.textContent.replace(/\s+/g, " ").trim().slice(0, 200);
  }

  var PAGE = location.pathname.split("/").pop() || "index.html";
  var quizzes = Array.prototype.slice.call(document.querySelectorAll(".quiz"));
  var qStats = loadJSON(QS_KEY, {});
  var qFavs = loadJSON(FAV_KEY, {});

  quizzes.forEach(function (q, idx) {
    q.__qid = PAGE + "#" + idx;
    q.__hash = hashStr(stemOf(q));
    q.__rec = qStats[q.__qid];
  });

  /* 旧版数据迁移：旧主键形如 "ch01.html-哈希"，按题干指纹匹配到新主键 */
  (function migrateOld() {
    var old = loadJSON(QS_KEY_OLD, null);
    if (!old || typeof old !== "object") return;
    var byHash = {};
    quizzes.forEach(function (q) { byHash[q.__hash] = q; });
    var moved = 0;
    Object.keys(old).forEach(function (k) {
      if (k.indexOf(PAGE + "-") !== 0) return;
      var h = k.slice(PAGE.length + 1);
      var q = byHash[h];
      if (!q) return;
      if (q.__rec === undefined) {
        var v = old[k];
        if (typeof v === "number") q.__rec = { r: v, h: h, d: null };
        else if (v && typeof v === "object") q.__rec = { r: v.r, h: h, d: v.d || null };
        moved++;
      }
      delete old[k];
    });
    if (moved) {
      quizzes.forEach(function (q) { if (q.__rec) qStats[q.__qid] = q.__rec; });
      saveJSON(QS_KEY, qStats);
      saveJSON(QS_KEY_OLD, old);
    }
  })();

  function recOf(q) { return q.__rec || null; }

  var hudBar = null, hudMode = "all";
  function refreshHud() {
    if (!hudBar) return;
    var answered = 0, correct = 0, wrong = 0, fav = 0;
    quizzes.forEach(function (q) {
      var r = recOf(q);
      if (r && r.r === 1) { answered++; correct++; }
      else if (r && r.r === 0) { answered++; wrong++; }
      if (qFavs[q.__qid]) fav++;
    });
    hudBar.querySelector(".hud-n b").textContent = answered;
    hudBar.querySelector(".hud-acc b").textContent = answered ? Math.round(correct / answered * 100) + "%" : "—";
    hudBar.querySelector(".hud-wrong b").textContent = wrong;
    hudBar.querySelector(".hud-fav b").textContent = fav;
    var warn = hudBar.querySelector(".hud-warn");
    if (warn) {
      if (storageOK) {
        warn.textContent = "";
        warn.style.display = "none";
      } else {
        warn.textContent = "⚠️ 当前浏览器禁用了本地存储（可能是无痕模式），答题进度无法保存。请用普通窗口打开本页。";
        warn.style.display = "block";
      }
    }
    hudBar.querySelectorAll("[data-hud]").forEach(function (b) {
      var m = b.getAttribute("data-hud");
      if (m === "all" || m === "reset") { b.classList.add("ghost"); return; }
      b.classList.toggle("on", m === hudMode);
    });
  }
  function announce(msg, bad) {
    if (!hudBar) return;
    var el = hudBar.querySelector(".hud-msg");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("bad", !!bad);
    el.classList.add("show");
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.remove("show"); }, 2800);
  }
  function persist(silent) {
    var ok = saveJSON(QS_KEY, qStats);
    if (!ok && !silent) announce("⚠️ 保存失败：浏览器禁用了本地存储（无痕模式？），刷新后会丢失", true);
    return ok;
  }
  function applyMode(mode) {
    hudMode = mode;
    var show = quizzes;
    if (mode === "wrong") show = quizzes.filter(function (q) { var r = recOf(q); return r && r.r === 0; });
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
        '<span class="hud-auto">进度自动保存在本机浏览器</span>' +
      "</div>" +
      '<div class="hud-actions">' +
        '<button data-hud="wrong">只看错题</button>' +
        '<button data-hud="fav">只看收藏</button>' +
        '<button data-hud="random">随机 10 题</button>' +
        '<button data-hud="all" class="ghost">显示全部</button>' +
        '<button data-hud="reset" class="ghost">重置进度</button>' +
      "</div>" +
      '<div class="hud-msg"></div>' +
      '<div class="hud-warn"></div>';
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
        if (!confirm("确定清空本页的答题进度？收藏不受影响。")) return;
        quizzes.forEach(function (q) { delete qStats[q.__qid]; q.__rec = null; });
        persist();
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

    function paintSelected(v) {
      opts.forEach(function (x) {
        x.classList.toggle("sel", x.getAttribute("data-opt") === v);
      });
    }
    function saveDraft(v) {
      q.__rec = q.__rec || { r: null, h: q.__hash, d: null };
      q.__rec.d = v;
      q.__rec.h = q.__hash;
      qStats[q.__qid] = q.__rec;
      var ok = persist(true); // 草稿静默保存，失败只在提交时提示
      return ok;
    }

    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        if (q.getAttribute("data-done") === "1") return;
        picked = o.getAttribute("data-opt");
        paintSelected(picked);
        saveDraft(picked);
      });
    });

    var btn = q.querySelector(".btn-ans");
    var res = q.querySelector(".q-res");
    var exp = q.querySelector(".q-exp");

    /* 恢复：已提交 → 显示结果；只选了没提交 → 恢复选中态 */
    var rec = recOf(q);
    if (rec && (rec.r === 0 || rec.r === 1)) {
      q.setAttribute("data-done", "1");
      opts.forEach(function (x) {
        var v = x.getAttribute("data-opt");
        if (v === answer) x.classList.add("right");
        else if (rec.d && v === rec.d && rec.r === 0) x.classList.add("wrong");
      });
      if (res) {
        res.textContent = rec.r === 1 ? "✅ 上次答对（已保存）" : "❌ 上次答错（正确答案是 " + answer + "）";
        res.className = "q-res " + (rec.r === 1 ? "good" : "bad");
      }
      if (btn) btn.textContent = "查看解析";
      if (rec.h !== q.__hash) {
        var tip = document.createElement("div");
        tip.className = "q-updated";
        tip.textContent = "题目已更新，旧答案仅供参考";
        var head0 = q.querySelector(".q-head");
        if (head0) head0.appendChild(tip);
      }
    } else if (rec && rec.d) {
      picked = rec.d;             // 草稿：恢复上次选中的选项，等你提交
      paintSelected(picked);
      if (res) { res.textContent = "已恢复上次选择（未提交）"; res.className = "q-res"; }
    }

    /* 收藏星标 */
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
        if (!saveJSON(FAV_KEY, qFavs)) announce("⚠️ 收藏保存失败：本地存储不可用", true);
        refreshHud();
      });
      head.style.position = "relative";
      head.appendChild(star);
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
      q.__rec = { r: ok ? 1 : 0, h: q.__hash, d: picked };
      qStats[q.__qid] = q.__rec;
      var savedOK = persist();
      refreshHud();
      if (!savedOK) return; // persist 已给出失败提示
      announce(ok ? "已保存 ✓" : "已保存 ✓ 并收入错题本（可点「只看错题」重做）");
    });
  });
  buildHud();
})();
