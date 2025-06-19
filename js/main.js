const svg = d3.select("#chart");
//make width a number using unary operator: const yAccessor = d => +d.sales;
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = {top:20, bottom:40, left:40, right:30};
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;

//define what scene the user is on
let curr_scene = 0;
const scenes = [histogram, scatterplot, top5, dashboard];

//convert the csv aspects into actual data
d3.csv("data/movies.csv", d=>({title:d.name, year:+d.year, rating:+drating, poster:d.posterURL})).then(movies_data =>{
  drawCurrentScene();
  d3.select("#next").on("click", ()=> {
    curr_scene_index = Math.min(curr_scene + 1, scenes.length - 1);
    drawCurrentScene();
  });
});

//write drawCurrentScene helper function
function drawCurrentScene() {
  //clear previous things
  svg.selectAll("*").remove();
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  scenes[curr_scene_index](g, window.moviesData);
}

//create the histogram for the ratings of all the movies
function histogram(g, data) {
  //create the x-axis
  const x = d3.scaleLinear().domain(d3.extent(data, d => d.rating)).nice().range([0, inner_width]);
  const bins = d3.bin().domain(x.domain()).thresholds(x.ticks(20))(data.map(d=>d.rating));

  //y-axis now
  const y = d3.scaleLinear().domain([0, d3.max(bins, b=>b.length)]).nice().range([inner_height, 0]);

  //create each bar, rectangles
  g.selectAll("rect").data(bins).join("rect").attr("x", d=>x(d.x0)).attr("y", d=>y(d.length))
  .attr("width", d=>Math.max(0, x(d.x1) - x(d.x0) - 1)).attr("height", d=>inner_height - y(d.length)).attr("fill", "steelblue");

  //add the axes to the graph
  g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
    .append("text")
      .attr("x", innerW).attr("y", 30).attr("text-anchor","end")
      .text("IMDb Rating");
  g.append("g")
      .call(d3.axisLeft(y).ticks(5))
    .append("text")
      .attr("x", -margin.left+5).attr("y",-10).attr("text-anchor","start")
      .text("Number of Films");

  const maxBin = bins.reduce((a,b) => b.length>a.length?b:a, bins[0]);
  const ann = [{
    note:   { title: "Most Common", label: `~${((maxBin.x0+maxBin.x1)/2).toFixed(1)}★` },
    x:      x((maxBin.x0+maxBin.x1)/2),
    y:      y(maxBin.length),
    dy:     -30, dx: 0
  }];
  g.append("g").call(d3.annotation().annotations(ann));

}

