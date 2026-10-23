(function () {
  'use strict';
  var SUBMIT_LABEL = '// Submit Assessment';
  var CHARS = {
    chris: {
      name: 'Chris Redfield',
      role: 'S.T.A.R.S. Alpha — Marksman / B.S.A.A.',
      clearance: 'ALPHA',
      color: '#4a9fd4',
      bio: 'Headstrong, loyal, physically overwhelming. You face threats head-on '
         + 'and refuse to leave anyone behind. Your determination borders on recklessness — '
         + 'but it keeps working. Boulder optional.'
    },
    jill: {
      name: 'Jill Valentine',
      role: 'S.T.A.R.S. Alpha — Field Agent / B.S.A.A.',
      clearance: 'OMEGA',
      color: '#d465a0',
      bio: 'Strategic, resourceful, unbreakable. You plan your way out before anyone '
         + 'realises there\'s no exit. Master of unlocking. Master of survival. '
         + 'Nemesis has tried — and failed.'
    },
    leon: {
      name: 'Leon S. Kennedy',
      role: 'U.S. Government — Field Operative',
      clearance: 'DELTA',
      color: '#6fb56f',
      bio: 'Composed under fire, with hair that defies physics and a philosophical '
         + 'one-liner for every occasion. You were not prepared — and you survived anyway. '
         + 'The President\'s daughter is safe.'
    },
    claire: {
      name: 'Claire Redfield',
      role: 'TerraSave — Field Investigator',
      clearance: 'GAMMA',
      color: '#d47a40',
      bio: 'You rode into danger looking for someone you love and left with the whole city '
         + 'on your conscience. Protective, relentless, and surprisingly effective on a '
         + 'motorbike through a zombie apocalypse.'
    },
    wesker: {
      name: 'Albert Wesker',
      role: 'Umbrella Corp. — Director / Antagonist',
      clearance: 'CLASSIFIED',
      color: '#aaaaaa',
      bio: 'You possess extraordinary vision and extraordinary contempt for everyone around you. '
         + 'Sunglasses indoors. Prototype virus for personal gain. You see the board before '
         + 'anyone else knows there\'s a game. Dangerous. Exceptional. Inevitable.'
    }
  };
  var OPTIONS = {
    weapon:   ['knife', 'handgun', 'shotgun', 'smg', 'rocket', 'bowgun'],
    instinct: ['fight', 'stealth', 'run', 'dominate'],
    priority: ['protect', 'intel', 'survive', 'dominate'],
    favGame:  ['re1', 're2', 're3', 're4', 're7', 're8']
  };
  var RULES = {
    name:     { required: true,  minLen: 2, maxLen: 60, pattern: /^[\p{L}\s'\-]+$/u, hint: 'Letters, spaces, apostrophes and hyphens only.' },
    codename: { required: true,  minLen: 2, maxLen: 30, pattern: /^[a-zA-Z0-9_\-\s]+$/, hint: 'Latin letters, digits, _, - and spaces only.' },
    email:    { required: true,  maxLen: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, hint: 'Invalid email address.' },
    weapon:   { required: true,  choices: OPTIONS.weapon,   empty: 'Select a weapon.' },
    instinct: { required: true,  choices: OPTIONS.instinct, empty: 'Select a threat response.' },
    priority: { required: true,  choices: OPTIONS.priority, empty: 'Select a priority.' },
    favGame:  { required: true,  choices: OPTIONS.favGame,  empty: 'Select an incident file.' },
    message:  { required: false, maxLen: 800 }
  };
  function validate(data) {
    var errors = {};
    Object.keys(data).forEach(function (field) {
      var rule = RULES[field];
      if (!rule) return;
      var val = (data[field] || '').trim();
      if (rule.required && !val) { errors[field] = rule.empty || 'This field is required.'; return; }
      if (!val) return;
      if (rule.minLen && val.length < rule.minLen) { errors[field] = 'Minimum ' + rule.minLen + ' characters.'; return; }
      if (rule.maxLen && val.length > rule.maxLen) { errors[field] = 'Maximum ' + rule.maxLen + ' characters.'; return; }
      if (rule.choices && rule.choices.indexOf(val) === -1) { errors[field] = rule.empty; return; }
      if (rule.pattern && !rule.pattern.test(val)) { errors[field] = rule.hint || 'Invalid format.'; }
    });
    return errors;
  }
  function setField(id, err) {
    var el  = document.getElementById(id) || document.getElementById(id + '-group');
    var msg = document.getElementById(id + '-error');
    if (el) {
      el.classList.toggle('field-error', !!err);
      el.classList.toggle('field-ok',    !err);
    }
    if (msg) msg.textContent = err ? ('⚠ ' + err) : '';
  }
  function clearAll() {
    document.querySelectorAll('.field-error, .field-ok').forEach(function (el) {
      el.classList.remove('field-error', 'field-ok');
    });
    document.querySelectorAll('.field-err-msg').forEach(function (el) {
      el.textContent = '';
    });
  }
  function typewrite(el, text, speed) {
    el.textContent = '';
    if (!text) return;
    var i = 0;
    var iv = setInterval(function () {
      el.textContent += text.charAt(i++);
      if (i >= text.length) clearInterval(iv);
    }, speed);
  }
  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safeColor(c) {
    return /^#[0-9a-fA-F]{3,8}$/.test(c || '') ? c : '#cccccc';
  }
  function resetButton(btn) {
    if (btn) { btn.textContent = SUBMIT_LABEL; btn.disabled = false; }
  }
  function renderResult(codename, message, ch, savedOnServer) {
    var panel = document.getElementById('result-panel');
    if (!panel) return;
    var color = safeColor(ch.color);
    var serverBadge = savedOnServer
      ? '<span class="badge-ok">✔ Saved on the server in data/submissions.txt</span>'
      : '<span class="badge-warn">⚠ Local result only (start the server with start_server.py to save submissions)</span>';
    panel.innerHTML = [
      '<div class="result-header">',
        '<div class="result-tag">// Umbrella Corp — Assessment Report — Complete</div>',
        '<div class="result-clearance" style="color:' + color + '">CLEARANCE LEVEL: ' + esc(ch.clearance) + '</div>',
        '<div style="margin-top:6px">' + serverBadge + '</div>',
      '</div>',
      '<div class="result-sep"></div>',
      '<div class="result-body">',
        '<div><div class="result-label">Operative Codename</div>',
        '<div class="result-codename">' + esc(String(codename).toUpperCase()) + '</div></div>',
        '<div><div class="result-label">Archive Match</div>',
        '<div class="result-charname" style="color:' + color + '">' + esc(ch.name) + '</div>',
        '<div class="result-charrole">' + esc(ch.role) + '</div></div>',
      '</div>',
      '<div class="result-sep"></div>',
      '<div><div class="result-label">// Psychological Profile</div>',
      '<p id="result-bio" class="result-bio"></p></div>',
      message ? '<div class="result-sep"></div><div><div class="result-label">// Your Field Report</div><p class="result-intel">' + esc(message) + '</p></div>' : '',
      '<div class="result-sep"></div>',
      '<div class="result-tag">Transmission status: <span style="color:#22ff22">ACTIVE</span></div>'
    ].join('');
    panel.style.cssText = 'display:block;opacity:0;transform:translateY(18px);transition:opacity 0.5s ease,transform 0.5s ease;';
    requestAnimationFrame(function () {
      panel.style.opacity   = '1';
      panel.style.transform = 'translateY(0)';
    });
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var bioEl = document.getElementById('result-bio');
    if (bioEl) typewrite(bioEl, ch.bio, 16);
  }
  function showServerMessage(text) {
    var box = document.getElementById('server-error');
    if (box) box.textContent = text ? ('⚠ ' + text) : '';
  }
  function matchCharacterLocal(data) {
    var score = 0;
    score += { knife: -1, handgun: 1, shotgun: 2, smg: 2, rocket: 3, bowgun: 0 }[data.weapon] || 0;
    score += { fight: 2, stealth: -1, run: 0, dominate: 4 }[data.instinct]                     || 0;
    score += { protect: 1, intel: -1, survive: 0, dominate: 5 }[data.priority]                 || 0;
    score += { re1: 0, re2: 0, re3: -1, re4: 1, re7: -2, re8: 0 }[data.favGame]               || 0;
    if (score >= 9) return CHARS.wesker;
    if (score >= 4) return CHARS.chris;
    if (score >= 2) return CHARS.leon;
    if (score >= 0) return CHARS.claire;
    return CHARS.jill;
  }
  function serverUrl() {
    var path = window.location.pathname;
    var root = path.indexOf('/pages/') !== -1 ? path.slice(0, path.indexOf('/pages/')) : '';
    return root + '/cgi-bin/submit.py';
  }
  function submitToServer(data, btn) {
    var body = Object.keys(data)
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); })
      .join('&');
    if (window.location.protocol === 'file:') {
      resetButton(btn);
      renderResult(data.codename, data.message, matchCharacterLocal(data), false);
      return;
    }
    fetch(serverUrl(), {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (json) {
      resetButton(btn);
      if (!json.success) {
        var errs = json.errors || {};
        var generic = [];
        Object.keys(errs).forEach(function (id) {
          if (RULES[id]) setField(id, errs[id]); else generic.push(errs[id]);
        });
        showServerMessage(generic.length ? 'Server error: ' + generic.join(' ') : 'The server rejected the submission. Check the highlighted fields.');
        return;
      }
      if (btn) btn.textContent = '// Transmission Sent';
      renderResult(json.codename || data.codename, json.message || data.message, json.character, true);
    })
    .catch(function (err) {
      console.warn('Server unavailable, using local processing:', err);
      resetButton(btn);
      renderResult(data.codename, data.message, matchCharacterLocal(data), false);
    });
  }
  function initProgress() {
    var bar  = document.getElementById('form-progress-bar');
    var pct  = document.getElementById('form-progress-pct');
    var form = document.getElementById('umbrella-form');
    if (!bar || !form) return;
    var fields = ['name', 'codename', 'email', 'weapon', 'instinct', 'priority', 'favGame'];
    function update() {
      var filled = 0;
      fields.forEach(function (id) {
        var el = document.getElementById(id) || document.querySelector('[name="' + id + '"]:checked');
        if (el && el.value && el.value.trim()) filled++;
      });
      var p = Math.round(filled / fields.length * 100);
      bar.style.width      = p + '%';
      bar.style.background = p < 40 ? '#3a0000' : p < 80 ? '#8b0000' : '#cc1111';
      if (pct) pct.textContent = p + '%';
    }
    form.addEventListener('input',  update);
    form.addEventListener('change', update);
    form.addEventListener('reset',  function () { setTimeout(update, 0); });
    update();
  }
  function initForm() {
    var form = document.getElementById('umbrella-form');
    if (!form) return;
    ['name', 'codename', 'email'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () {
        var obj = {}; obj[id] = el.value;
        setField(id, validate(obj)[id] || null);
      });
    });
    ['weapon', 'favGame'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function () { setField(id, null); });
    });
    ['instinct', 'priority'].forEach(function (name) {
      document.querySelectorAll('[name="' + name + '"]').forEach(function (r) {
        r.addEventListener('change', function () { setField(name, null); });
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAll();
      showServerMessage('');
      var data = {
        name:     (document.getElementById('name')     || {}).value || '',
        codename: (document.getElementById('codename') || {}).value || '',
        email:    (document.getElementById('email')    || {}).value || '',
        weapon:   (document.getElementById('weapon')   || {}).value || '',
        instinct: (document.querySelector('[name="instinct"]:checked') || {}).value || '',
        priority: (document.querySelector('[name="priority"]:checked') || {}).value || '',
        favGame:  (document.getElementById('favGame')  || {}).value || '',
        message:  (document.getElementById('message')  || {}).value || ''
      };
      Object.keys(data).forEach(function (k) { data[k] = String(data[k]).trim(); });
      var errors = validate(data);
      if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach(function (id) { setField(id, errors[id]); });
        var first = form.querySelector('.field-error');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      var btn = form.querySelector('.btn-submit');
      if (btn) { btn.textContent = '// Processing...'; btn.disabled = true; }
      setTimeout(function () { submitToServer(data, btn); }, 600);
    });
  }
  function init() { initForm(); initProgress(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
