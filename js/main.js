// 1) All five scenes
const scenes = [
  introScene,
  histogramScene,
  scatterScene,
  top5Scene,
  dashboardScene
];
let curr = 0;

// 2) Load data once
d3.csv("data/movies.csv").then(raw => {
  const movies = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    genre:  d.genre
  }));

  draw(movies);

  d3.select("#next").on("click", function() {
    if (curr < scenes.length - 1) {
      curr = curr + 1;
      draw(movies);
    }
  });
  d3.select("#prev").on("click", function() {
    if (curr > 0) {
      curr = curr - 1;
      draw(movies);
    }
  });
});

// 3) Central draw()
function draw(data) {
  // Back button
  if (curr === 0) {
    d3.select("#prev").property("disabled", true);
  } else {
    d3.select("#prev").property("disabled", false);
  }

  // Next button
  if (curr === scenes.length - 1) {
    d3.select("#next").property("disabled", true);
  } else {
    d3.select("#next").property("disabled", false);
  }

  // Show or hide genre filter
  if (curr === scenes.length - 1) {
    d3.select("#genre-container").style("display", "block");
  } else {
    d3.select("#genre-container").style("display", "none");
  }

  // Clear out previous slide
  d3.select("#charts").html("");
  d3.select("#tooltip").style("display", "none");

  // Draw current scene
  scenes[curr](data);
}

// 4) Scenes

function introScene() {
  const container = d3.select("#charts");
  container.append("h1")
    .text("IMDB's Top 250 Hollywood Movies");

  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Welcome! In this visualization you'll explore the top IMDb‑rated Hollywood films.");
}

function histogramScene(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X scale & bins
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.rating; }))
    .nice()
    .range([0, width]);

  const histogram = d3.bin()
    .domain(x.domain())
    .thresholds(x.ticks(20));
  const bins = histogram(data.map(function(d) { return d.rating; }));

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { return d.length; })])
    .nice()
    .range([height, 0]);

  // Bars
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x0) + 1; })
      .attr("y", function(d) { return y(d.length); })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
      .attr("height", function(d) { return height - y(d.length); })
      .attr("fill", "#69b3a2");

  // Axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  svg.append("g")
      .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Number of Movies");

  const container = d3.select("#charts");
  container.append("h2").text("Rating Distribution");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("This histogram shows the count of movies by rating. Notice most films cluster around 7–9 stars.");
}

function scatterScene(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.rating; }))
    .nice()
    .range([height, 0]);

  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("cx", function(d) { return x(d.year); })
      .attr("cy", function(d) { return y(d.rating); })
      .attr("r", 4)
      .attr("fill", "#69b3a2")
      .attr("opacity", 0.7);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Release Year");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  const container = d3.select("#charts");
  container.append("h2").text("Ratings Over Time");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Scatterplot of release year vs. rating. Look for clusters or trends over time.");
}

function top5Scene(data) {
  const top5 = data.slice()
    .sort(function(a,b) { return b.rating - a.rating; })
    .slice(0,5);

  const margin = {top: 20, right: 20, bottom: 50, left: 200};
  const fullW  = 700, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain([0, d3.max(top5, function(d) { return d.rating; })])
    .nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(top5.map(function(d) { return d.title; }))
    .range([0, height])
    .padding(0.2);

  svg.selectAll("rect")
    .data(top5)
    .enter().append("rect")
      .attr("y", function(d) { return y(d.title); })
      .attr("width", function(d) { return x(d.rating); })
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2");

  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .text("Movie Title");

  const container = d3.select("#charts");
  container.append("h2").text("Top 5 Movies");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("These are the five highest rated films ever, according to IMDb users.");
}

function dashboardScene(data) {
  const genres = Array.from(
    new Set(data.flatMap(function(d) {
      return d.genre.split(",").map(function(s) { return s.trim(); });
    }))
  ).sort();

  const sel = d3.select("#genre-select");
  if (sel.selectAll("option").empty()) {
    sel.selectAll("option")
      .data(["All"].concat(genres))
      .enter().append("option")
        .attr("value", function(d) { return d; })
        .text(function(d) { return d; });
    sel.on("change", function() { renderDashboard(data); });
  }

  renderDashboard(data);

  const container = d3.select("#charts");
  container.append("h2").text("Explore All Movies");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Use the dropdown above to filter by genre and hover over dots for titles and ratings.");
}

function renderDashboard(data) {
  d3.select("#charts").html("");

  const chosen = d3.select("#genre-select").property("value");
  let filt;
  if (chosen === "All") {
    filt = data;
  } else {
    filt = data.filter(function(d) {
      return d.genre.split(",").map(function(s) { return s.trim(); })
        .indexOf(chosen) >= 0;
    });
  }

  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const fullW  = 600, fullH = 400;
  const width  = fullW - margin.left - margin.right;
  const height = fullH - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", fullW)
      .attr("height", fullH)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain(d3.extent(filt, function(d) { return d.year; }))
    .nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(filt, function(d) { return d.rating; }))
    .nice()
    .range([height, 0]);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g")
      .call(d3.axisLeft(y));

  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Release Year");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  const tip = d3.select("#tooltip");

  svg.selectAll("circle")
    .data(filt)
    .enter().append("circle")
      .attr("cx", function(d) { return x(d.year); })
      .attr("cy", function(d) { return y(d.rating); })
      .attr("r", 4)
      .attr("fill", "#69b3a2")
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        tip.style("display", "block")
           .html("<strong>" + d.title + "</strong><br/>" 
                 + d.year + ", " + d.rating + "★");
      })
      .on("mousemove", function(event) {
        tip.style("left", (event.pageX + 10) + "px")
           .style("top",  (event.pageY + 10) + "px");
      })
      .on("mouseout", function() {
        tip.style("display", "none");
      });
}
