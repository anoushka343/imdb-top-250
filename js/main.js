//order of the all the scenes
const scenes = [
  intro,
  histogram,
  scatterplot,
  top5,
  dashboard
];

//keeep a tracker to know which scene the user is one
let count = 0;

//read with the csv function
d3.csv("data/movies.csv", m => ({
  title: m.name, 
  year: +m.year,
  rating: +m.rating,
  genre: m.genre
}))
.then(movies => {
  console.log("loaded", movies.length, "movies");
  draw(movies);

  d3.select("#next").on("click", () => {
    if(count < scenes.length - 1) {
      count++;
      draw(movies);
    }
});
d3.select("#prev").on("click", () => {
  if(count > 0) {
    count--;
    draw(movies);
  }
});
})



//this will draw all the scenes and controls
function draw(data) {
  //turn off the previous button if the scene count is 0
  if(count == 0) {
    d3.select("#prev").attr("disabled", true);
  }
  else {
    //otherwise allow it to continue
    d3.select("#prev").attr("disabled", null);
  }

  //if within bounds then advance
  if(count == scenes.length - 1) {
    d3.select("#next").attr("disabled", true);
  }
  //otherwise disable
  else {
    d3.select("#next").attr("disabled", null);
  }
  //if it's the last scene then show the genres
  if(count === scenes.length - 1) {
    d3.select("#genre-container").style("display", "block");
  }
  //otherwise don't show
  else {
    d3.select("#genre-container").style("display", "none");
  }
  //clear the charts and hide the tooltip
  d3.select("#charts").html("");
  d3.select("#tooltip").style("display", "none");

  scenes[count](data);
}



function intro() {
  const container = d3.select("#charts");
  container.append("h1")
    .text("IMDB's Top 250 Hollywood Movies");

  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Hello! In this visualization you'll explore the top IMDb‑rated Hollywood films.");
}


function histogram(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const total_width  = 600;
  const total_height = 400;
  const width  = total_width - margin.left - margin.right;
  const height = total_height - margin.top  - margin.bottom;

  //create the chart svg for the histogram
  const container = d3.select("#charts");
  container.append("h2").text("Rating Distribution");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("This histogram shows the count of movies by rating. Notice most films cluster around 7–9 stars. The bars highlighted in yellow show higher‐rated movies.");

    const svgContainer = container.append("svg")
    .attr("viewBox", `0 0 ${total_width} ${total_height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

  const svg = svgContainer
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //make the x-axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { 
      return d.rating; }))
    .nice()
    .range([0, width]);
  
    //create the histogram
  const histogram = d3.bin()
    .domain(x.domain())
    .thresholds(x.ticks(20));
  const bins = histogram(data.map(function(d) { 
    return d.rating; }));

  //create the y-axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { 
      return d.length; })])
    .nice()
    .range([height, 0]);
  
  //make the actual bars for the histogram
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
      .attr("x", function(d) { 
        return x(d.x0) + 1; })
      .attr("y", function(d) { 
        return y(d.length); })
      .attr("width", function(d) { 
        return x(d.x1) - x(d.x0) - 1; })
      .attr("height", function(d) { 
        return height - y(d.length); })
      .attr("fill", function(d) {
        if(d.x0 >= 9 && typeof d.x0 !== "undefined") {
          return "#FFC107";
        }
        else {
          return "#FF6F61"; 
        }
      })
  
  //add everything to the svg tag
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  svg.append("g")
      .call(d3.axisLeft(y));
  
      //label the the axis with the text names
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
  const highest_bin = bins.find(d => d.x0 <= 8.1 && d.x1 > 8.1);
  const highest_count = highest_bin.length;
  const annotations = [
  {
    note: {
      label: "Most clustered near 8.1",
    },
    x: x(8.1),
    y: y(highest_count),
    dy: 50,
    dx: 150
  }
]
const makeAnnotations = d3.annotation()
  .type(d3.annotationLabel)
  .annotations(annotations)
  .textWrap(80);
svg.append("g")
.attr("class", "annotation-group")
.call(makeAnnotations);


}


function scatterplot(data) {
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const total_width  = 600;
  const total_height = 400;
  const width  = total_width - margin.left - margin.right;
  const height = total_height - margin.top  - margin.bottom;

  //add the chart size to the svg
  const container = d3.select("#charts");
  container.append("h2").text("Ratings Over Time");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Scatterplot of release year vs. rating. Look for clusters or trends over time. Yellow dots show the highest‐rated films.");

  const svgContainer = container.append("svg")
    .attr("viewBox", `0 0 ${total_width} ${total_height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

   const svg = svgContainer
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //do the scale linear
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { 
      return d.year; }))
    .nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { 
      return d.rating; }))
    .nice()
    .range([height, 0]);
  
  //add the dots on
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("cx", function(d) { 
        return x(d.year); })
      .attr("cy", function(d) { 
        return y(d.rating); })
      .attr("r", 4)
      .attr("fill", function(d) {
        if(d.rating >= 9) {
          return "#FFC107";
        }
        else {
          return "#FF6F61"; 
        }

      })
      .attr("opacity", 0.7);
    
      //add all the axes tickets and text
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
const annotations = [
  {
    note: {
      label: "Outliers are ratings greater than or equal to 9 stars",
    },
    x: x(2010),
    y: y(9.3),
    dy: 30,
    dx: -300
  }
]


const makeAnnotations = d3.annotation()
  .type(d3.annotationLabel)
  .annotations(annotations)
  .textWrap(80);

svg.append("g").attr("class", "annotation-group").call(makeAnnotations);

}


function top5(data) {
  const top5 = data.slice()
    .sort(function(a,b) { 
      return b.rating - a.rating; })
    .slice(0,5);

  const margin = {top: 20, right: 20, bottom: 50, left: 200};
  const total_width  = 700;
  const total_height = 400;
  const width = total_width - margin.left - margin.right;
  const height = total_height - margin.top  - margin.bottom;
  const container = d3.select("#charts");
  container.append("h2").text("Top 5 Movies");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("These are the five highest rated films ever, according to IMDb users. The Shawshank Redemption is highlighted in yellow, showing it is the highest rating movie,");

  //add the size of the chart
  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", total_width)
      .attr("height", total_height)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //do the scale linear stuff
  const x = d3.scaleLinear()
    .domain([0, d3.max(top5, function(d) { 
      return d.rating; })])
    .nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(top5.map(function(d) { 
      return d.title; }))
    .range([0, height])
    .padding(0.2);
    
  //add the bars corresponding to each movie
  svg.selectAll("rect")
    .data(top5)
    .enter().append("rect")
      .attr("y", function(d) { 
        return y(d.title); })
      .attr("width", function(d) { 
        return x(d.rating); })
      .attr("height", y.bandwidth())
      .attr("fill", function(d,i){
        if(i ===0) {
          return "#FFC107";
        }
        else {
          return "#FF6F61";
        }
      });
  //add the x and y axis to the chart
  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("IMDb Rating");

  //rotate the bar chart to make it easier to see
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .text("Movie Title");

  
}

//create the dashboard 
function dashboard(data) {
  const genres = Array.from(
    new Set(data.flatMap(function(d) {
      return d.genre.split(",").map(function(s) { 
        return s.trim(); });
    }))
  ).sort();

    //add filter genre box for the user
  const sel = d3.select("#genre-select");
  if (sel.selectAll("option").empty()) {
    sel.selectAll("option")
      .data(["All"].concat(genres))
      .enter().append("option")
        .attr("value", function(d) { 
          return d; })
        .text(function(d) { 
          return d; });
    sel.on("change", function() { 
      renderDashboard(data); });
  }
  //call helper to make the dashboard
  renderDashboard(data);

  
}

function renderDashboard(data) {
  d3.select("#charts").html("");

  //title for the scene 
  const container = d3.select("#charts");
  container.append("h2").text("Explore All Movies");
  //add the text box
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Use the dropdown above to filter by genre and hover over dots for titles and ratings. Any ratings greater than equal to 9 will be highlighted in yellow.");
  
    //filter based on seelction, all = display all movies, otherwise display specifics
    const chosen = d3.select("#genre-select").property("value");
  let filter;
  if (chosen === "All") {
    filter = data;
  } else {
    filter = data.filter(function(d) {
      return d.genre.split(",").map(function(s) { return s.trim(); })
        .indexOf(chosen) >= 0;
    });
  }

  //set sizes
  const margin = {top: 20, right: 20, bottom: 50, left: 60};
  const total_width = 600;
  const total_height = 400;
  const width = total_width - margin.left - margin.right;
  const height= total_height - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", total_width)
      .attr("height", total_height)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //add axes
  const x = d3.scaleLinear()
    .domain(d3.extent(filter, function(d) { 
      return d.year; }))
    .nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(filter, function(d) { 
      return d.rating; }))
    .nice()
    .range([height, 0]);

    //add to svg tab
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

  //create the tootlip
  const tip = d3.select("#tooltip");

      //if circle is hoevered on, display star rating and name of the movie
      //yellow are above 9, keep that standard
      //rest are the coral
  svg.selectAll("circle")
    .data(filter)
    .enter().append("circle")
      .attr("cx", function(d) { 
        return x(d.year); })
      .attr("cy", function(d) { 
        return y(d.rating); })
      .attr("r", 4)
      .attr("fill", function(d){
        if (d.rating >= 9) {
          return "#FFC107";
        }
        else {
          return "#FF6F61";
        }
      })
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