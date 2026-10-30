/* 动画课堂播放器引擎：场景制播放 + SVG 动画 + 语音旁白同步
 * 用法：页面定义 window.LESSON = { id, title, scenes:[{caption, narration, voice, audio, duration, draw(svg,p)}] } 后调用 initLesson()
 */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ── SVG 小工具库（暴露给场景绘制函数） ── */
  var LS = {
    NS: SVGNS,
    el: function (name, attrs, parent) {
      var e = document.createElementNS(SVGNS, name);
      for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    },
    txt: function (parent, x, y, str, opts) {
      opts = opts || {};
      var t = LS.el("text", {
        x: x, y: y, fill: opts.fill || "var(--svg-ink)",
        "font-size": opts.size || 15, "text-anchor": opts.anchor || "middle",
        "font-weight": opts.weight || "normal",
        "font-family": opts.mono ? "Consolas,monospace" : "inherit"
      }, parent);
      t.textContent = str;
      if (opts.opacity != null) t.setAttribute("opacity", opts.opacity);
      return t;
    },
    box: function (parent, x, y, w, h, opts) {
      opts = opts || {};
      return LS.el("rect", {
        x: x, y: y, width: w, height: h, rx: opts.rx == null ? 10 : opts.rx,
        fill: opts.fill || "var(--svg-fill)", stroke: opts.stroke || "var(--line)",
        "stroke-width": opts.sw || 1.5, opacity: opts.opacity == null ? 1 : opts.opacity
      }, parent);
    },
    circle: function (parent, cx, cy, r, opts) {
      opts = opts || {};
      return LS.el("circle", {
        cx: cx, cy: cy, r: r, fill: opts.fill || "var(--svg-fill)",
        stroke: opts.stroke || "var(--brand)", "stroke-width": opts.sw || 2,
        opacity: opts.opacity == null ? 1 : opts.opacity
      }, parent);
    },
    arrow: function (parent, x1, y1, x2, y2, opts) {
      opts = opts || {};
      var g = LS.el("g", { opacity: opts.opacity == null ? 1 : opts.opacity }, parent);
      LS.el("line", {
        x1: x1, y1: y1, x2: x2, y2: y2,
        stroke: opts.stroke || "var(--brand)", "stroke-width": opts.sw || 2.5,
        "marker-end": "url(#lessonArrowHead)"
      }, g);
      return g;
    },
    clear: function (svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); },
    ease: function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); }
  };
  window.LS = LS;

  /* ── 播放器 ── */
  function Player(container, lesson) {
    this.c = container; this.lesson = lesson; this.idx = 0; this.p = 0;
    this.playing = false; this.speed = 1; this.raf = null; this.last = 0;
    this.audio = null; this.audioReady = false; this.muted = false;
    this.build();
    this.showScene(0);
  }
  Player.prototype.build = function () {
    var self = this;
    var n = this.lesson.scenes.length;
    this.c.innerHTML =
      '<div class="player">' +
      '<div class="stage"><svg viewBox="0 0 960 400" width="100%" height="380">' +
      '<defs><marker id="lessonArrowHead" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" fill="var(--brand)"/></marker></defs></svg>' +
      '<div class="caption"><span class="voice-tag"></span><span class="cap-text"></span></div></div>' +
      '<div class="ctrl">' +
      '<button class="play" title="播放/暂停 (空格)">▶</button>' +
      '<button class="prev" title="上一幕 (←)">⏮</button>' +
      '<button class="next" title="下一幕 (→)">⏭</button>' +
      '<button class="replay" title="重播本幕 (R)">↺</button>' +
      '<div class="pbar"><div class="pfill"></div><div class="pknob"></div>' +
      (Array.from({ length: n }, function (_, i) {
        return '<span class="dot" data-scene="' + i + '" title="第 ' + (i + 1) + ' 幕" style="left:' + ((i + .5) / n * 100).toFixed(2) + '%"></span>';
      }).join("")) +
      "</div>" +
      '<span class="scene-label"></span>' +
      '<select class="speed-sel"><option value="1">1.0x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="0.75">0.75x</option></select>' +
      '<button class="mute" title="语音开/关">🔊</button>' +
      "</div>" +
      '<div class="hint">快捷键：空格 播放/暂停 · ← → 切幕 · R 重播本幕 · 进度条上的圆点可跳转到任意一幕</div>' +
      "</div>";
    this.svg = this.c.querySelector("svg");
    this.capTag = this.c.querySelector(".voice-tag");
    this.capText = this.c.querySelector(".cap-text");
    this.playBtn = this.c.querySelector(".play");
    this.pfill = this.c.querySelector(".pfill");
    this.pknob = this.c.querySelector(".pknob");
    this.label = this.c.querySelector(".scene-label");
    this.pbar = this.c.querySelector(".pbar");

    this.playBtn.addEventListener("click", function () { self.toggle(); });
    this.c.querySelector(".prev").addEventListener("click", function () { self.goto(self.idx - 1); });
    this.c.querySelector(".next").addEventListener("click", function () { self.goto(self.idx + 1); });
    this.c.querySelector(".replay").addEventListener("click", function () { self.goto(self.idx); });
    this.c.querySelector(".mute").addEventListener("click", function (e) {
      self.muted = !self.muted;
      e.currentTarget.textContent = self.muted ? "🔇" : "🔊";
      if (self.muted) self.stopAudio();
      else if (self.playing && self.audio) self.audio.play().catch(function () {});
    });
    this.c.querySelector(".speed-sel").addEventListener("change", function (e) {
      self.speed = parseFloat(e.target.value);
      if (self.audio) self.audio.playbackRate = self.speed;
    });
    this.c.querySelectorAll(".dot").forEach(function (d) {
      d.addEventListener("click", function (ev) {
        ev.stopPropagation();
        self.goto(parseInt(d.getAttribute("data-scene"), 10));
      });
    });
    function barSeek(ev) {
      if (ev.target.classList && ev.target.classList.contains("dot")) return;
      var r = self.pbar.getBoundingClientRect();
      var ratio = LS.clamp((ev.clientX - r.left) / r.width, 0, 1);
      var total = self.lesson.scenes.length;
      self.goto(Math.min(total - 1, Math.floor(ratio * total)));
    }
    this.pbar.addEventListener("click", barSeek);
    document.addEventListener("keydown", function (e) {
      if (!self.isVisible()) return;
      if (e.code === "Space") { e.preventDefault(); self.toggle(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); self.goto(self.idx - 1); }
      else if (e.code === "ArrowRight") { e.preventDefault(); self.goto(self.idx + 1); }
      else if (e.code === "KeyR") { self.goto(self.idx); }
    });
  };
  Player.prototype.isVisible = function () {
    var r = this.c.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0;
  };
  Player.prototype.sceneDur = function (s) {
    var base = s.duration || 6;
    if (this.audio && this.audioReady && isFinite(this.audio.duration) && this.audio.duration > 0) {
      return Math.max(this.audio.duration / this.speed + .3, 2.5);
    }
    return base;
  };
  Player.prototype.stopAudio = function () {
    if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; }
  };
  Player.prototype.showScene = function (i, keepPaused) {
    this.stopAudio();
    this.idx = i; this.p = 0;
    var s = this.lesson.scenes[i];
    this.capText.textContent = s.narration;
    this.capTag.textContent = s.voice === "M" ? "云健" : "晓晓";
    this.label.textContent = "第 " + (i + 1) + " / " + this.lesson.scenes.length + " 幕";
    LS.clear(this.svg);
    s.draw(this.svg, 0, s);
    this.updateBar();
    this.audioReady = false;
    var self = this;
    if (s.audio !== false) {
      var a = new Audio("assets/audio/" + this.lesson.id + "-s" + (i + 1) + ".mp3");
      a.preload = "auto"; a.playbackRate = this.speed;
      a.addEventListener("loadedmetadata", function () { self.audioReady = true; });
      a.addEventListener("error", function () { self.audioReady = false; });
      this.audio = a;
    } else { this.audio = null; }
    if (!keepPaused && this.playing) {
      if (!this.muted) this.audio && this.audio.play().catch(function () {});
      this.tickStart();
    }
  };
  Player.prototype.updateBar = function () {
    var n = this.lesson.scenes.length;
    var overall = (this.idx + this.p) / n;
    this.pfill.style.width = (overall * 100).toFixed(2) + "%";
    this.pknob.style.left = (overall * 100).toFixed(2) + "%";
  };
  Player.prototype.tickStart = function () {
    var self = this;
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    function tick(now) {
      if (!self.playing) return;
      var dt = (now - self.last) / 1000 * self.speed;
      self.last = now;
      self.p += dt / self.sceneDur(self.lesson.scenes[self.idx]);
      if (self.p >= 1) {
        if (self.idx < self.lesson.scenes.length - 1) {
          self.showScene(self.idx + 1);
        } else { self.finish(); return; }
      } else {
        var s = self.lesson.scenes[self.idx];
        s.draw(self.svg, self.p, s);
        self.updateBar();
      }
      self.raf = requestAnimationFrame(tick);
    }
    this.raf = requestAnimationFrame(tick);
  };
  Player.prototype.finish = function () {
    this.playing = false;
    this.playBtn.textContent = "▶";
    this.p = 1;
    this.updateBar();
    var s = this.lesson.scenes[this.idx];
    s.draw(this.svg, 1, s);
  };
  Player.prototype.toggle = function () {
    var self = this;
    this.playing = !this.playing;
    this.playBtn.textContent = this.playing ? "⏸" : "▶";
    if (this.playing) {
      if (this.p >= 1) this.showScene(this.idx === this.lesson.scenes.length - 1 ? 0 : this.idx);
      if (!this.muted) this.audio && this.audio.play().catch(function () {});
      this.tickStart();
    } else {
      // 暂停：只暂停语音不归零，恢复时从暂停处继续（与动画进度一致）
      if (this.audio) this.audio.pause();
      cancelAnimationFrame(this.raf);
    }
  };
  Player.prototype.goto = function (i) {
    if (i < 0) i = 0;
    if (i >= this.lesson.scenes.length) i = this.lesson.scenes.length - 1;
    this.showScene(i, !this.playing);
  };

  window.initLesson = function () {
    if (!window.LESSON) return;
    var holder = document.getElementById("lesson");
    if (holder) new Player(holder, window.LESSON);
  };
})();
