// js/main.js

// ———————————————————————————
// 1. Grab the SVG + set up margins
// ———————————————————————————
const svg = d3.select("#chart");            // matches <svg id="chart">
const width = +svg.attr("width");           // 800
const height = +svg.attr("height");         // 500
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const inner_width  = width  - margin.left - margin.right;
const inner_height = height - margin.top  - margin.bottom;

// ———————————————————————————
// 2. Scene state & list
// ———————————————————————————
let curr_scene = 0;
const scenes = [ histogram, scatterplot, top5, dashboard ];

// ———————————————————————————
// 3. Load and preprocess data
// ———————————————————————————
d3.csv("data/movies.csv").then(raw => {
  // Convert strings to numbers, pick only the fields we need
  const moviesData = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    poster: d.posterURL  // if your CSV has that column
  }));

  // Make it globally accessible for debugging
  window.moviesData = moviesData;

  // Draw the first scene
  drawCurrentScene();

  // Wire up the Next button
  d3.select("#next").on("click", () => {
    curr_scene = Math.min(curr_scene + 1, scenes.length - 1);
    drawCurrentScene();
  });
});

// ———————————————————————————
// 4. Clear and draw helper
// ———————————————————————————
function drawCurrentScene() {
  // 1) remove every mark in the SVG
  svg.selectAll("*").remove();

  // 2) create a <g> shifted by the margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 3) invoke the current scene, passing in that <g> and the data
  scenes[curr_scene](g, window.moviesData);
}

// ———————————————————————————
// 5. Scene 1: Histogram of ratings
// ———————————————————————————
function histogram(g, data) {
  // a) x‐scale & bins
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.rating)).nice()
    .range([0, inner_width]);

  const bins = d3.bin()
    .domain(x.domain())
    .thresholds(x.ticks(20))
    (data.map(d => d.rating));

  // b) y‐scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, b => b.length)]).nice()
    .range([inner_height, 0]);

  // c) draw bars
  g.selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x",     d => x(d.x0))
      .attr("y",     d => y(d.length))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => inner_height - y(d.length))
      .attr("fill",   "steelblue");

  // d) axes
  g.append("g")
      .attr("transform", `translate(0,${inner_height})`)
      .call(d3.axisBottom(x))
    .append("text")
      .attr("x", inner_width).attr("y", 30).attr("text-anchor","end")
      .text("IMDb Rating");

  g.append("g")
      .call(d3.axisLeft(y).ticks(5))
    .append("text")
      .attr("x", -margin.left + 5).attr("y", -10).attr("text-anchor","start")
      .text("Number of Films");

  // e) annotation on the tallest bar
  const maxBin = bins.reduce((a,b) => b.length > a.length ? b : a, bins[0]);
  const ann = [{
    note:   { title: "Most Common", label: `~${((maxBin.x0+maxBin.x1)/2).toFixed(1)}★` },
    x:      x((maxBin.x0+maxBin.x1)/2),
    y:      y(maxBin.length),
    dy:     -30, dx: 0
  }];
  g.append("g").call(d3.annotation().annotations(ann));
}

// ———————————————————————————
// 6. Scene 2: Year vs. Rating scatter
// ———————————————————————————
function scatterplot(g, data) {
  // TODO: implement x = year, y = rating, plot circles, axes, annotation
}

// ———————————————————————————
// 7. Scene 3: Top‐5 with posters
// ———————————————————————————
function top5(g, data) {
  // TODO: filter rating ≥ 9.0, then append image & text for each top movie
}

// ———————————————————————————
// 8. Scene 4: Free‐play dashboard
// ———————————————————————————
function dashboard(g, data) {
  // TODO: full scatter + tooltips + optional filter widgets
}
