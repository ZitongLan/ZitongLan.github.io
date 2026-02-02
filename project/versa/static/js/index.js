console.log("[Versa demos] index.js loaded");

window.HELP_IMPROVE_VIDEOJS = false;

// var INTERP_BASE = "https://homes.cs.washington.edu/~kpar/nerfies/interpolation/stacked";
// var NUM_INTERP_FRAMES = 240;

// var interp_images = [];
// function preloadInterpolationImages() {
//   for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
//     var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
//     interp_images[i] = new Image();
//     interp_images[i].src = path;
//   }
// }

// function setInterpolationImage(i) {
//   var image = interp_images[i];
//   image.ondragstart = function() { return false; };
//   image.oncontextmenu = function() { return false; };
//   $('#interpolation-image-wrapper').empty().append(image);
// }

$(document).ready(function () {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

  });

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listener to  event
    carousels[i].on('before:show', state => {
      console.log(state);
    });
  }

  // Access to bulmaCarousel instance of an element
  var element = document.querySelector('#my-element');
  if (element && element.bulmaCarousel) {
    // bulmaCarousel instance is available as element.bulmaCarousel
    element.bulmaCarousel.on('before-show', function (state) {
      console.log(state);
    });
  }

  /*var player = document.getElementById('interpolation-video');
  player.addEventListener('loadedmetadata', function() {
    $('#interpolation-slider').on('input', function(event) {
      console.log(this.value, player.duration);
      player.currentTime = player.duration / 100 * this.value;
    })
  }, false);*/
  // preloadInterpolationImages();

  // $('#interpolation-slider').on('input', function(event) {
  //   setInterpolationImage(this.value);
  // });
  // setInterpolationImage(0);
  // $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);
  bulmaSlider.attach();

})


// 1) List your files here (filenames only). Path is assumed to be static/videos/<filename>
const VIDEO_FILES = [
  "combined_bene_vanilla.mp4",
  "combined_bene_ele.mp4",
  "combined_bene_gt.mp4",
  "combined_bene_tx_rotation_ele.mp4",
  "combined_bene_tx_rotation_ssl.mp4",
  "combined_bene_tx_rotation_gt.mp4",

  "combined_pomaria_vanilla.mp4",
  "combined_pomaria_ele.mp4",
  "combined_pomaria_gt.mp4",
  "combined_pomaria_tx_rotation_ele.mp4",
  "combined_pomaria_tx_rotation_ssl.mp4",
  "combined_pomaria_tx_rotation_gt.mp4",
  "combined_pomaria_tx_moving_vanilla.mp4",
  "combined_pomaria_tx_moving_ele.mp4",
  "combined_pomaria_tx_moving_gt.mp4",

  "combined_rs_vanilla.mp4",
  "combined_rs_ele.mp4",
  "combined_rs_gt.mp4",
  "combined_rs_tx_rotation1_ele.mp4",
  "combined_rs_tx_rotation1_ssl.mp4",
  "combined_rs_tx_rotation1_gt.mp4",
  "combined_rs_tx_rotation2_ele.mp4",
  "combined_rs_tx_rotation2_ssl.mp4",
  "combined_rs_tx_rotation2_gt.mp4",
];

const BASE = "./static/videos/";

// global state
let oursMode = "ele"; // or "ssl"
let activeCase = "all";
let activeScenario = "all";

function parseFile(fn) {
  // expected patterns:
  // combined_<case>_<method>.mp4
  // combined_<case>_<scenario...>_<method>.mp4
  // method in {vanilla, ele, ssl, gt}
  const name = fn.replace(".mp4", "");
  const parts = name.split("_");
  if (parts[0] !== "combined") return null;

  const method = parts[parts.length - 1];
  const allowed = new Set(["vanilla", "ele", "ssl", "gt"]);
  if (!allowed.has(method)) return null;

  const theCase = parts[1];
  theCase[0].toUpperCase();
  const scenarioParts = parts.slice(2, parts.length - 1);
  const scenario = scenarioParts.length ? scenarioParts.join("_") : "default";

  // if scenario is default, make it tx is fixed
  // if (scenario === "default") scenario = "Tx fixed";

  return { fn, theCase, scenario, method };
}

function buildIndex(files) {
  // index[case][scenario][method] = filename
  const index = {};
  const cases = new Set();
  const scenarios = new Set();

  for (const fn of files) {
    const p = parseFile(fn);
    if (!p) continue;
    cases.add(p.theCase);
    scenarios.add(p.scenario);

    index[p.theCase] ??= {};
    index[p.theCase][p.scenario] ??= {};
    index[p.theCase][p.scenario][p.method] = fn;
  }

  return { index, cases: [...cases].sort(), scenarios: [...scenarios].sort() };
}

function fillFilters(cases, scenarios) {
  const caseSel = document.getElementById("caseFilter");
  const scSel = document.getElementById("scenarioFilter");

  for (const c of cases) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    caseSel.appendChild(opt);
  }
  for (const s of scenarios) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s.replaceAll("_", " ");
    scSel.appendChild(opt);
  }

  caseSel.addEventListener("change", e => { activeCase = e.target.value; render(); });
  scSel.addEventListener("change", e => { activeScenario = e.target.value; render(); });

  // document.getElementById("expandAll").addEventListener("click", () => {
  //   document.querySelectorAll(".demo-row").forEach(r => r.classList.remove("row-collapsed"));
  // });
  // document.getElementById("collapseAll").addEventListener("click", () => {
  //   document.querySelectorAll(".demo-row").forEach(r => r.classList.add("row-collapsed"));
  // });
}

function videoEl(src, label) {
  const v = document.createElement("video");
  v.src = src;
  v.controls = true;
  v.playsInline = true;
  v.preload = "metadata";
  v.setAttribute("aria-label", label);
  return v;
}

function naEl(text = "N/A") {
  const d = document.createElement("div");
  d.className = "na";
  d.textContent = text;
  return d;
}

function rowLabel(caseName, scenario) {
  const wrap = document.createElement("div");
  wrap.className = "row-label";

  const title = document.createElement("div");
  title.className = "row-title";
  title.textContent = `${caseName} / ${scenario === "default" ? "default" : scenario.replaceAll("_", " ")}`;

  const meta = document.createElement("div");
  meta.className = "row-meta";
  meta.textContent = "Play and scrub to compare (sync enabled).";

  const controls = document.createElement("div");
  controls.className = "row-controls";

  const btnPlay = document.createElement("button");
  btnPlay.textContent = "Play all";

  const btnPause = document.createElement("button");
  btnPause.textContent = "Pause";

  const btnReset = document.createElement("button");
  btnReset.textContent = "Reset";

  controls.append(btnPlay, btnPause, btnReset);

  // const collapse = document.createElement("button");
  // collapse.className = "collapse-toggle";
  // collapse.textContent = "Collapse / Expand row";

  wrap.append(title, meta, controls);

  return { wrap, btnPlay, btnPause, btnReset };
}

function enableSync(videos) {
  // Sync scrubbing: when one seeks, others follow (basic, practical sync)
  let isSyncing = false;

  videos.forEach(v => {
    v.addEventListener("seeking", () => {
      if (isSyncing) return;
      isSyncing = true;
      const t = v.currentTime;
      for (const u of videos) {
        if (u !== v && Math.abs(u.currentTime - t) > 0.05) u.currentTime = t;
      }
      isSyncing = false;
    });
  });
}

let GLOBAL = null;

function render() {
  const rowsRoot = document.getElementById("demoRows");
  rowsRoot.innerHTML = "";

  const { index } = GLOBAL;

  const caseNames = Object.keys(index).sort();
  for (const c of caseNames) {
    if (activeCase !== "all" && c !== activeCase) continue;

    const scenarioNames = Object.keys(index[c]).sort((a, b) => {
      if (a === "default") return -1;
      if (b === "default") return 1;
      return a.localeCompare(b);
    });

    for (const s of scenarioNames) {
      if (activeScenario !== "all" && s !== activeScenario) continue;

      const methods = index[c][s];

      // Build one row
      const row = document.createElement("div");
      row.className = "demo-row";

      const { wrap: label, btnPlay, btnPause, btnReset } = rowLabel(c, s);

      const cellVan = document.createElement("div");
      cellVan.className = "cell";
      const cellOurs = document.createElement("div");
      cellOurs.className = "cell";
      const cellGT = document.createElement("div");
      cellGT.className = "cell";

      const hasEle = !!methods.ele;
      const hasSsl = !!methods.ssl;
      const hasGt = !!methods.gt;
      const hasVanilla = !!methods.vanilla;

      const isEleViewRow = hasVanilla && hasEle && hasGt;     // vanilla+ele+gt
      const isSslViewRow = hasEle && hasSsl && hasGt;         // ele+ssl+gt

      if (oursMode === "ele" && !isEleViewRow) continue;
      if (oursMode === "ssl" && !isSslViewRow) continue;

      let v1 = null;

      if (oursMode === "ele") {
        v1 = methods.vanilla ? videoEl(BASE + methods.vanilla, `${c} ${s} vanilla`) : null;
      }

      if (oursMode === "ssl") {
        v1 = methods.ele ? videoEl(BASE + methods.ele, `${c} ${s} ele`) : null;
      }

      // ours = ele or ssl
      const oursFile = methods[oursMode];
      const oursMissing = (oursMode === "ssl" && !methods.ssl) ? "SSL not available" : "N/A";
      const v2 = oursFile ? videoEl(BASE + oursFile, `${c} ${s} ours ${oursMode}`) : null;

      const v3 = methods.gt ? videoEl(BASE + methods.gt, `${c} ${s} gt`) : null;

      cellVan.append(v1 ?? naEl("N/A"));
      cellOurs.append(v2 ?? naEl(oursMissing));
      cellGT.append(v3 ?? naEl("N/A"));

      row.append(label, cellVan, cellOurs, cellGT);
      rowsRoot.appendChild(row);

      // Hook controls for this row
      const vids = [v1, v2, v3].filter(Boolean);
      if (vids.length >= 2) enableSync(vids);

      btnPlay.addEventListener("click", () => vids.forEach(v => v.play()));
      btnPause.addEventListener("click", () => vids.forEach(v => v.pause()));
      btnReset.addEventListener("click", () => {
        vids.forEach(v => { v.pause(); v.currentTime = 0; });
      });

      // collapse.addEventListener("click", () => row.classList.toggle("row-collapsed"));
    }
  }
}

function initToggle() {
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      oursMode = btn.dataset.ours;
      render();
    });
  });
}

// init
// (function boot() {
//   GLOBAL = buildIndex(VIDEO_FILES);
//   fillFilters(GLOBAL.cases, GLOBAL.scenarios);
//   initToggle();
//   render();
// })();

document.addEventListener("DOMContentLoaded", () => {
  GLOBAL = buildIndex(VIDEO_FILES);
  fillFilters(GLOBAL.cases, GLOBAL.scenarios);
  initToggle();
  render();
});