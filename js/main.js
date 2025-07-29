// 1) All five scenes:
const scenes = [
  introScene,
  histogramScene,
  scatterScene,
  top5Scene,
  dashboardScene
];
let curr = 0;

// 2) Load the CSV once:
d3.csv("data/movies.csv").then(raw => {
  const movies = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    genre:  d.genre
  }));

  draw(movies);

  d3.select("#next").on("click", () => {
    curr = Math.min(curr + 1, scenes.length - 1);
    draw(movies);
  });
  d3.select("#prev").on("click", () => {
    curr = Math.max(curr - 1, 0);
    draw(movies);
  });
});

// 3) Central draw() clears & runs the current scene:
function draw(data) {
  d3.select("#prev").property("disabled", curr === 0);
  d3.select("#next").property("disabled", curr === scenes.length - 1);

  d3.select("#genre-container")
    .style("display", curr === scenes.length - 1 ? "block" : "none");

  d3.select("#my_dataviz").html("");
  d3.select("#tooltip").style("display", "none");

  scenes[curr](data);
}

// 4) Scenes themselves:

function introScene() {
  const container = d3.select("#my_dataviz");
  container.append("h1").text("IMDB’s Top 250 Hollywood Movies");
  container.append("textarea")
    .attr("placeholder", "Write notes here…");
}

function histogramScene(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH)
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
    .domain([0, d3.max(bins, d=>d.length)]).nice()
    .range([height, 0]);

  // Bars
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
      .attr("x",      d=> x(d.x0) + 1)
      .attr("y",      d=> y(d.length))
      .attr("width",  d=> x(d.x1) - x(d.x0) - 1)
      .attr("height", d=> height - y(d.length))
      .attr("fill", "#69b3a2");

  // Axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  svg.append("g")
      .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
      .attr("x", width/2).attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");
  svg.append("text")
      .attr("transform","rotate(-90)")
      .attr("x", -height/2).attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Number of Movies");

  // Subtitle & notes
  d3.select("#my_dataviz").append("h2").text("Rating Distribution");
  d3.select("#my_dataviz").append("textarea")
    .attr("placeholder", "Write notes here…");
}

function scatterScene(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.year)).nice()
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.rating)).nice()
    .range([height, 0]);

  // Points
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("cx", d=>x(d.year))
      .attr("cy", d=>y(d.rating))
      .attr("r",  4)
      .attr("fill","#69b3a2")
      .attr("opacity",0.7);

  // Axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
      .attr("x", width/2).attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Release Year");
  svg.append("text")
      .attr("transform","rotate(-90)")
      .attr("x", -height/2).attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  d3.select("#my_dataviz").append("h2").text("Ratings Over Time");
  d3.select("#my_dataviz").append("textarea")
    .attr("placeholder", "Write notes here…");
}

function top5Scene(data) {
  const top5 = data
    .slice()
    .sort((a,b)=>b.rating - a.rating)
    .slice(0,5);

  // _Larger_ SVG + big left margin
  const margin  = {top: 20, right: 20, bottom: 50, left: 200};
  const fullW   = 700, fullH = 400;
  const width   = fullW - margin.left - margin.right;
  const height  = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top5, d=>d.rating)]).nice()
    .range([0, width]);
  const y = d3.scaleBand()
    .domain(top5.map(d=>d.title))
    .range([0, height])
    .padding(0.2);

  // Bars
  svg.selectAll("rect")
    .data(top5)
    .enter().append("rect")
      .attr("y",      d=>y(d.title))
      .attr("width",  d=>x(d.rating))
      .attr("height", y.bandwidth())
      .attr("fill",   "#69b3a2");

  // Axes
  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // Axis labels
  svg.append("text")
      .attr("x", width/2).attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");
  svg.append("text")
      .attr("transform","rotate(-90)")
      .attr("x", -height/2).attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .text("Movie Title");

  d3.select("#my_dataviz").append("h2").text("Top 5 Movies");
  d3.select("#my_dataviz").append("textarea")
    .attr("placeholder", "Write notes here…");
}

function dashboardScene(data) {
  // Build the genre dropdown on first run:
  const genres = Array.from(
    new Set(data.flatMap(d => d.genre.split(",").map(s=>s.trim())))
  ).sort();
  const sel = d3.select("#genre-select");
  if (sel.selectAll("option").empty()) {
    sel.selectAll("option")
      .data(["All", ...genres])
      .enter().append("option")
        .attr("value", d=>d)
        .text(d=>d);
    sel.on("change", () => renderDashboard(data));
  }

  renderDashboard(data);

  d3.select("#my_dataviz").append("h2").text("Explore All Movies");
  d3.select("#my_dataviz").append("textarea")
    .attr("placeholder", "Write notes here…");
}

function renderDashboard(data) {
  d3.select("#my_dataviz").html("");

  const chosen = d3.select("#genre-select").property("value");
  const filt   = chosen === "All"
    ? data
    : data.filter(d =>
        d.genre.split(",").map(s=>s.trim()).includes(chosen)
      );

  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width",  fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(filt, d=>d.year)).nice()
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(d3.extent(filt, d=>d.rating)).nice()
    .range([height, 0]);

  // Axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
      .attr("x", width/2).attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Release Year");
  svg.append("text")
      .attr("transform","rotate(-90)")
      .attr("x", -height/2).attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  // Tooltip div
  const tip = d3.select("#tooltip");

  // Dots
  svg.selectAll("circle")
    .data(filt)
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
