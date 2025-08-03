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


//helper to highlight the important parts of each chart

/*d3.csv("data/movies.csv").then(raw => {
  const movies = raw.map(d => ({
    title:  d.name,
    year:   +d.year,
    rating: +d.rating,
    genre:  d.genre
  }));*/



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

/*
function draw(data) {
 if (count === 0) {
    d3.select("#prev").property("disabled", true);
  } else {
    d3.select("#prev").property("disabled", false);
  }

  if (count === scenes.length - 1) {
    d3.select("#next").property("disabled", true);
  } else {
    d3.select("#next").property("disabled", false);
  }

  if (count === scenes.length - 1) {
    d3.select("#genre-container").style("display", "block");
  } else {
    d3.select("#genre-container").style("display", "none");
  }

  d3.select("#charts").html("");
  d3.select("#tooltip").style("display", "none");

  scenes[count](data);
}*/

function intro() {
  const container = d3.select("#charts");
  container.append("h1")
    .text("IMDB's Top 250 Hollywood Movies");

  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Hello! In this visualization you'll explore the top IMDb‑rated Hollywood films.");
}

/*
example code for histogram:
<script>

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv", function(data) {

  // X axis: scale and draw:
  var x = d3.scaleLinear()
      .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .value(function(d) { return d.price; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
      .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")

});
</script>
*/

/*
annotation code:const annotations = [
  {
    note: {
      label: "Here is the annotation label",
      title: "Annotation title"
    },
    x: 100,
    y: 100,
    dy: 100,
    dx: 100
  }
]

// Add annotation to the chart
// Features of the annotation
const annotations = [
  {
    note: {
      label: "Here is the annotation label",
      title: "Annotation title"
    },
    x: 100,
    y: 100,
    dy: 100,
    dx: 100
  }
]

// Add annotation to the chart
// Features of the annotation
const annotations = [
  {
    note: {
      label: "Here is the annotation label",
      title: "Annotation title"
    },
    x: 100,
    y: 100,
    dy: 100,
    dx: 100
  }
]
const makeAnnotations = d3.annotation()
  .annotations(annotations)
d3.select("#example1")
  .append("g")
  .call(makeAnnotations)


</script>

*/
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
      label: "Most of the top 250 movies cluster at this rating",
      title: "Peak at a rating of 8.1"
    },
    x: x(8.1),
    y: y(highest_count),
    dy: -30,
    dx: 20
  }
]
const makeAnnotations = d3Annotation.annotation()
  .type(d3Annotation.annotationLabel)
  .annotations(annotations)
  .textWrap(80);
svg.append("g")
.attr("class", "annotation-group")
.call(makeAnnotations);


}

/*
example code: 
<script>

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 4000])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 500000])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.GrLivArea); } )
      .attr("cy", function (d) { return y(d.SalePrice); } )
      .attr("r", 1.5)
      .style("fill", "#69b3a2")

})

</script>
*/
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
      label: "Outliers greater than or equal to 9 stars",
      title: "Films break a rating of 9"
    },
    x: x(2010),
    y: y(9.3),
    dy: -50,
    dx: 30
  }
]


const makeAnnotations = d3Annotation.annotation()
  .type(d3Annotation.annotationLabel)
  .annotations(annotations)
  .textWrap(80);

svg.append("g").attr("class", "annotation-group").call(makeAnnotations);

}

/*
example code:
<script>


// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 13000])
    .range([ 0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.Country; }))
    .padding(.1);
  svg.append("g")
    .call(d3.axisLeft(y))

  //Bars
  svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.Country); })
    .attr("width", function(d) { return x(d.Value); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#69b3a2")


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")

})

</script>
*/
function top5(data) {
  const top5 = data.slice()
    .sort(function(a,b) { return b.rating - a.rating; })
    .slice(0,5);

  const margin = {top: 20, right: 20, bottom: 50, left: 200};
  const total_width  = 700;
  const  total_height = 400;
  const width  = total_width - margin.left - margin.right;
  const height = total_height - margin.top  - margin.bottom;

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

  const container = d3.select("#charts");
  container.append("h2").text("Top 5 Movies");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("These are the five highest rated films ever, according to IMDb users. The Shawshank Redemption is highlighted in yellow, showing it is the highest rating movie,");
}

//create the dashboard 
function dashboard(data) {
  const genres = Array.from(
    new Set(data.flatMap(function(d) {
      return d.genre.split(",").map(function(s) { 
        return s.trim(); });
    }))
  ).sort();

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

  renderDashboard(data);

  const container = d3.select("#charts");
  container.append("h2").text("Explore All Movies");
  container.append("textarea")
    .attr("class", "desc-box")
    .attr("readonly", true)
    .text("Use the dropdown above to filter by genre and hover over dots for titles and ratings. Any ratings greater than equal to 9 will be highlighted in yellow.");
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
  const total_width  = 600;
  const total_height  = 400;
  const width  = total_width - margin.left - margin.right;
  const height = total_height - margin.top  - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
      .attr("width", total_width)
      .attr("height", total_height)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain(d3.extent(filt, function(d) { 
      return d.year; }))
    .nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(filt, function(d) { 
      return d.rating; }))
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

 

