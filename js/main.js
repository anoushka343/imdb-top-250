const svg    = d3.select("#chart");
const width  = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 100, right: 60, bottom: 140, left: 250 };
const innerW = width  - margin.left - margin.right;
const innerH = height - margin.top  - margin.bottom;

let curr = 0;
const scenes = [
  introScene,
  histogramScene,
  scatterScene,
  top5Scene,
  dashboardScene
];

d3.csv("data/movies.csv").then(raw => {
  const data = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    genre:  d.genre
  }));
  window.movies = data;
  draw();

  d3.select("#next").on("click", () => {
    curr = Math.min(curr + 1, scenes.length - 1);
    draw();
  });
  d3.select("#prev").on("click", () => {
    curr = Math.max(curr - 1, 0);
    draw();
  });
});


function draw() {
  svg.selectAll("*").remove();

  d3.select("#prev").attr("disabled", curr === 0 ? true : null);
  d3.select("#next").attr("disabled", curr === scenes.length - 1 ? true : null);

  d3.select("#dash-controls")
    .style("display", curr === scenes.length - 1 ? "inline-block" : "none");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  scenes[curr](g, window.movies);
}


function annotate(g, annos) {
  const maker = d3.annotation().annotations(annos).type(d3.annotationLabel);
  g.append("g").call(maker);
}


function introScene(g) {
  const cx = innerW / 2;
  const cy = innerH / 2;

  g.append("text")
    .attr("x", cx)
    .attr("y", cy - 20)
    .attr("text-anchor", "middle")
    .style("fill", "#ffc300")
    .style("font-size", "40px")
    .style("font-weight", "bold")
    .text("IMDB's Top 250 Hollywood Movies");

}

function histogramScene(g, data) {
  g.append("text")
    .attr("x", innerW/2).attr("y", -margin.top/2 + 20)
    .attr("text-anchor","middle")
    .style("font-size","32px").style("fill","#ffc300")
    .text("Scene 1: Rating Distribution");

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.rating)).nice()
    .range([0, innerW]);
  const bins = d3.bin()
    .domain(x.domain())
    .thresholds(x.ticks(20))
    (data.map(d=>d.rating));
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, b=>b.length)]).nice()
    .range([innerH, 0]);

  g.selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x",     d=>x(d.x0)+1)
      .attr("y",     d=>y(d.length))
      .attr("width", d=>x(d.x1)-x(d.x0)-2)
      .attr("height",d=>innerH - y(d.length))
      .attr("fill",  "#ffc300");

  g.append("g")
    .attr("transform",`translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickSize(0).tickPadding(12))
    .selectAll("text").attr("fill","#ffc300");
  g.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10))
    .selectAll("text").attr("fill","#ffc300");


  g.append("text")
    .attr("x", innerW/2).attr("y", innerH+60)
    .attr("text-anchor","middle")
    .style("font-size","18px").attr("fill","#fff")
    .text("IMDb Rating");

  g.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -innerH/2).attr("y", -70)
    .attr("text-anchor","middle")
    .style("font-size","18px").attr("fill","#fff")
    .text("Number of Movies");


  const peak = bins.reduce((a,b)=>b.length>a.length?b:a);
  const m    = (peak.x0+peak.x1)/2;
  annotate(g,[{
    x: x(m), y: y(peak.length),
    note:{title:"Peak Rating",label:`~${m.toFixed(1)}★`},
    dy:-50, dx:0
  }]);
}


function scatterScene(g, data) {
  g.append("text")
    .attr("x", innerW/2).attr("y", -margin.top/2 + 20)
    .attr("text-anchor","middle")
    .style("font-size","32px").style("fill","#ffc300")
    .text("Scene 2: Ratings Over Time");

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.year)).nice()
    .range([0, innerW]);
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.rating)).nice()
    .range([innerH, 0]);

  const xG = g.append("g")
    .attr("transform",`translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  const yG = g.append("g")
    .call(d3.axisLeft(y));

  [xG, yG].forEach(axisG => {
    axisG.selectAll("text").attr("fill","#ffc300");
    axisG.selectAll(".domain").attr("stroke","#ffc300");
    axisG.selectAll(".tick line").attr("stroke","#ffc300");
  });


  g.append("text")
    .attr("x", innerW/2).attr("y", innerH+40)
    .attr("text-anchor","middle")
    .style("font-size","16px").attr("fill","#fff")
    .text("Release Year");

  g.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -innerH/2).attr("y", -50)
    .attr("text-anchor","middle")
    .style("font-size","16px").attr("fill","#fff")
    .text("IMDb Rating");

  g.selectAll("circle")
    .data(data)
    .join("circle")
      .attr("cx", d=>x(d.year))
      .attr("cy", d=>y(d.rating))
      .attr("r", 6)
      .attr("fill","#ffc300")
      .attr("opacity",0.85);

  const top = data.reduce((a,b)=>b.rating>a.rating?b:a);
  annotate(g,[{
    x: x(top.year), y: y(top.rating),
    note:{title:top.title,label:`${top.year}, ${top.rating.toFixed(1)}★`},
    dy:-40, dx:0
  }]);
}


function top5Scene(g, data) {
  g.append("text")
    .attr("x", innerW/2).attr("y", -margin.top/2 + 20)
    .attr("text-anchor","middle")
    .style("font-size","32px").style("fill","#ffc300")
    .text("Scene 3: Top 5 Movies");

  const top5 = data.slice().sort((a,b)=>b.rating-a.rating).slice(0,5);
  const x    = d3.scaleLinear().domain([0,d3.max(top5,d=>d.rating)]).nice().range([0,innerW]);
  const y    = d3.scaleBand().domain(top5.map(d=>d.title)).range([0,innerH]).padding(0.3);

  g.selectAll("rect").data(top5).join("rect")
    .attr("y", d=>y(d.title))
    .attr("width", d=>x(d.rating))
    .attr("height", y.bandwidth())
    .attr("fill","#ffc300");

  g.append("g")
    .call(d3.axisLeft(y).tickSize(0).tickPadding(12))
    .selectAll("text").attr("fill","#fff");

  g.append("g")
    .attr("transform",`translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickSize(0).tickPadding(12))
    .selectAll("text").attr("fill","#ffc300");

  g.append("text")
    .attr("x", innerW/2).attr("y", innerH+60)
    .attr("text-anchor","middle")
    .style("font-size","18px").attr("fill","#fff")
    .text("IMDb Rating");

  const best = top5[0];
  annotate(g,[{
    x: x(best.rating)-20,
    y: y(best.title)+y.bandwidth()/2,
    note:{title:"All-time #1",label:best.title},
    dx:-80, dy:0,
    subject:{radius:y.bandwidth()/2+4,padding:4}
  }]);
}


function dashboardScene(g, data) {
  g.append("text")
    .attr("x", innerW/2).attr("y", -margin.top/2 + 20)
    .attr("text-anchor","middle")
    .style("font-size","32px").style("fill","#ffc300")
    .text("Scene 4: Explore All Movies");

  const sel = d3.select("#genre-select");
  if (!sel.selectAll("option").size()) {
    const genres = Array.from(new Set(data.flatMap(d=>d.genre.split(",").map(s=>s.trim())))).sort();
    sel.selectAll("option").data(["All", ...genres]).enter().append("option")
      .attr("value", d=>d).text(d=>d);
    sel.on("change", draw);
  }

  const chosen = sel.property("value");
  const filt   = chosen==="All"
    ? data
    : data.filter(d=>d.genre.split(",").map(s=>s.trim()).includes(chosen));

  const x = d3.scaleLinear().domain(d3.extent(filt,d=>d.year)).nice().range([0,innerW]);
  const y = d3.scaleLinear().domain(d3.extent(filt,d=>d.rating)).nice().range([innerH,0]);

  const xG = g.append("g")
      .attr("transform",`translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSize(0).tickPadding(12));
  const yG = g.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

  [xG, yG].forEach(axisG => {
    axisG.selectAll("text").attr("fill","#ffc300");
    axisG.selectAll(".domain").attr("stroke","#ffc300");
    axisG.selectAll(".tick line").attr("stroke","#ffc300");
  });

  const tooltip = d3.select("body").selectAll(".tooltip").data([null]).join("div").attr("class","tooltip");

  g.selectAll("circle").data(filt).join("circle")
    .attr("cx", d=>x(d.year)).attr("cy", d=>y(d.rating)).attr("r",6)
    .attr("fill","#ffc300").attr("opacity",0.85)
    .on("mouseover", (evt,d) => tooltip.style("opacity",1).html(`<strong>${d.title}</strong>`))
    .on("mousemove", evt => tooltip.style("left",(evt.pageX+12)+"px").style("top",(evt.pageY+12)+"px"))
    .on("mouseout", () => tooltip.style("opacity",0));

  g.append("text")
    .attr("x", innerW/2).attr("y", innerH+60)
    .attr("text-anchor","middle")
    .style("font-size","18px").attr("fill","#fff")
    .text("Release Year");
  g.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -innerH/2).attr("y", -70)
    .attr("text-anchor","middle")
    .style("font-size","18px").attr("fill","#fff")
    .text("IMDb Rating");
}
