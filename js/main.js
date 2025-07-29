// 1) Define all scenes in order:
const scenes = [
  introScene,
  histogramScene,
  scatterScene,
  top5Scene,
  dashboardScene
];
let curr = 0;

// 2) Load data once:
d3.csv("data/movies.csv").then(raw => {
  const movies = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    genre:  d.genre     // keep the raw genre string
  }));

  // initial draw
  draw(movies);

  // wire buttons
  d3.select("#next").on("click", () => {
    curr = Math.min(curr + 1, scenes.length - 1);
    draw(movies);
  });
  d3.select("#prev").on("click", () => {
    curr = Math.max(curr - 1, 0);
    draw(movies);
  });
});

// 3) Central draw func:
function draw(data) {
  // enable/disable nav
  d3.select("#prev").property("disabled", curr === 0);
  d3.select("#next").property("disabled", curr === scenes.length - 1);

  // show/hide genre filter only on last scene
  d3.select("#genre-container")
    .style("display", curr === scenes.length - 1 ? "block" : "none");

  // clear viz
  d3.select("#my_dataviz").html("");
  d3.select("#tooltip").style("display", "none");

  // run current scene
  scenes[curr](data);
}

// 4) Scenes:

function introScene() {
  d3.select("#my_dataviz")
    .append("h1")
    .text("IMDB’s Top 250 Hollywood Movies");
}

function histogramScene(data) {
  const margin = {top: 20, right: 20, bottom: 30, left: 40};
  const width  = 500 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale & bins
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.rating)).nice()
    .range([0, width]);
  const histogram = d3.bin()
    .domain(x.domain())
    .thresholds(x.ticks(20));
  const bins = histogram(data.map(d=>d.rating));

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d=>d.length)])
    .nice()
    .range([height, 0]);

  // bars
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
      .attr("x",      d=> x(d.x0) + 1)
      .attr("y",      d=> y(d.length))
      .attr("width",  d=> x(d.x1) - x(d.x0) - 1)
      .attr("height", d=> height - y(d.length))
      .attr("fill", "#69b3a2");

  // axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  svg.append("g")
      .call(d3.axisLeft(y));

  // subtitle
  d3.select("#my_dataviz")
    .append("h2")
    .text("Rating Distribution");
}

function scatterScene(data) {
  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width  = 500 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.year)).nice()
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.rating)).nice()
    .range([height, 0]);

  // dots
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("cx", d=>x(d.year))
      .attr("cy", d=>y(d.rating))
      .attr("r",  3)
      .attr("fill","#69b3a2")
      .attr("opacity",0.7);

  // axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  d3.select("#my_dataviz")
    .append("h2")
    .text("Ratings Over Time");
}

function top5Scene(data) {
  const top5 = data
    .slice()
    .sort((a,b)=>b.rating - a.rating)
    .slice(0,5);

  const margin = {top: 20, right: 20, bottom: 30, left: 100};
  const width  = 500 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top5, d=>d.rating)]).nice()
    .range([0, width]);
  const y = d3.scaleBand()
    .domain(top5.map(d=>d.title))
    .range([0, height])
    .padding(0.1);

  svg.selectAll("rect")
    .data(top5)
    .enter().append("rect")
      .attr("y",      d=>y(d.title))
      .attr("width",  d=>x(d.rating))
      .attr("height", y.bandwidth())
      .attr("fill",   "#69b3a2");

  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  d3.select("#my_dataviz")
    .append("h2")
    .text("Top 5 Movies");
}

function dashboardScene(data) {
  // build dropdown once
  const allGenres = Array.from(
    new Set(data.flatMap(d => d.genre.split(",").map(s=>s.trim())))
  ).sort();

  const sel = d3.select("#genre-select");
  if (sel.selectAll("option").empty()) {
    sel.selectAll("option")
      .data(["All", ...allGenres])
      .enter().append("option")
        .attr("value", d=>d)
        .text(d=>d);
    // re‑draw on change
    sel.on("change", () => renderDashboard(data));
  }

  // show and render
  renderDashboard(data);
  d3.select("#my_dataviz")
    .append("h2")
    .text("Explore All Movies");
}

function renderDashboard(data) {
  // clear viz
  d3.select("#my_dataviz").html("");

  const selected = d3.select("#genre-select").property("value");
  const filtered = selected === "All"
    ? data
    : data.filter(d =>
        d.genre.split(",").map(s=>s.trim()).includes(selected)
      );

  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width  = 500 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(filtered, d=>d.year)).nice()
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(d3.extent(filtered, d=>d.rating)).nice()
    .range([height, 0]);

  // axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  // tooltip div
  const tip = d3.select("#tooltip");

  // dots with tooltip
  svg.selectAll("circle")
    .data(filtered)
    .join("circle")
      .attr("cx", d=>x(d.year))
      .attr("cy", d=>y(d.rating))
      .attr("r",  4)
      .attr("fill","#69b3a2")
      .attr("opacity",0.7)
      .on("mouseover", (e,d) => {
        tip.style("display","block")
           .html(`<strong>${d.title}</strong><br/>${d.year}, ${d.rating}★`);
      })
      .on("mousemove", e => {
        tip.style("left", (e.pageX + 10) + "px")
           .style("top",  (e.pageY + 10) + "px");
      })
      .on("mouseout", () => {
        tip.style("display","none");
      });
}
