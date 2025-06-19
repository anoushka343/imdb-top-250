// track which scene we’re in
let sceneIndex = 0;
const scenes = [scene1, scene2, scene3, sceneFree];

d3.csv("data/movies.csv").then(data => {
  // coerce strings to numbers
  data.forEach(d => {
    d.rating = +d.rating;
    d.year   = +d.year;
  });
  window.movies = data;            // for console inspection
  renderScene();
  d3.select("#next").on("click", () => {
    sceneIndex = Math.min(sceneIndex + 1, scenes.length - 1);
    renderScene();
  });
});

function renderScene() {
  d3.select("#viz").html("");      // clear the SVG
  scenes[sceneIndex](window.movies);
}

function scene1(data)    { /* TODO: histogram of ratings */ }
function scene2(data)    { /* TODO: year vs rating scatter */ }
function scene3(data)    { /* TODO: highlight top-9.0+ films */ }
function sceneFree(data) { /* TODO: full chart + tooltips */ }
