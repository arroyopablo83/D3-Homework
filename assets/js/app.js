// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
let chart = d3.select("#scatter")
  .append("div")
  .classed("chart", true);
// and shift the latter by left and top margins.
var svg = chart
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
let chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(hairData, chosenXAxis) {
  // create scales
  let xLinearScale = d3.scaleLinear()
      .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
        d3.max(hairData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);

    return xLinearScale;

}

function yScale(hairData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenYAxis]) * 0.8,
      d3.max(hairData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
  
  }
  // function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

//función para actualizar etiquetas de ESTADO
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}
//función para estilizar los valores del eje x para la información sobre herramientas
function styleX(value, chosenXAxis) {

  //estilo basado en variable
  //pobreza
  if (chosenXAxis === 'poverty') {
      return `${value}%`;
  }
  //household income
  else if (chosenXAxis === 'income') {
      return `${value}`;
  }
  else {
    return `${value}`;
  }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

  var label;

  //poverty
  if (chosenXAxis === 'poverty') {
    var xLabel = 'Poverty:';
  }
  //income
  else if (chosenXAxis === 'income'){
    var xLabel = 'Median Income:';
  }
  //age
  else {
    var xLabel = 'Age:';
  }
  //Y label
  //healthcare
  if (chosenYAxis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(chosenYAxis === 'obesity') {
    var yLabel = 'Obesity:';
  }
//smoking
  else{
    var yLabel = 'Smokers:';
  }
  var toolTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-8, 0])
  .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
});

  circlesGroup.call(toolTip);

   //Agregar
   circlesGroup.on('mouseover', toolTip.show)
   .on('mouseout', toolTip.hide);

   return circlesGroup;
}
// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(hairData, err) {
    if (err) throw err;
    
    // parse data
    
    hairData.forEach(function(data) {      
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
    });
    
  // xLinearScale function above csv import
  var xLinearScale = xScale(hairData, chosenXAxis);
  var yLinearScale = yScale(hairData, chosenYAxis);

  // Create y scale function
//   var yLinearScale = d3.scaleLinear()
//     .domain([0, d3.max(hairData, d => d.num_hits)])
//     .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

 // append x axis
 var yAxis = chartGroup.append("g")
 .classed("y-axis", true)
 //.attr("transform", `translate(0, ${height})`)
 .call(leftAxis);

//   // append y axis
//   chartGroup.append("g")
//     .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  //agregar texto inicial
  var textGroup = chartGroup.selectAll('.stateText')
    .data(hairData)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr('font-size', '10px')
    .text(function(d){return d.abbr});

  // Create group for two x-axis labels
  var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var poverty= xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var age= xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var income = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

  //crear un grupo para etiquetas Y
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcare = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokes = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesity = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          //replace chosen x with a value
          chosenXAxis = value; 

          //update x for new data
          xLinearScale = xScale(hairData, chosenXAxis);

          //update x 
          xAxis = renderXAxis(xLinearScale, xAxis);

          //upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update text 
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update tooltip
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          //change of classes changes text
          if (chosenXAxis === 'poverty') {
            poverty.classed('active', true).classed('inactive', false);
            age.classed('active', false).classed('inactive', true);
            income.classed('active', false).classed('inactive', true);
          }
          else if (chosenXAxis === 'age') {
            poverty.classed('active', false).classed('inactive', true);
            age.classed('active', true).classed('inactive', false);
            income.classed('active', false).classed('inactive', true);
          }
          else {
            poverty.classed('active', false).classed('inactive', true);
            age.classed('active', false).classed('inactive', true);
            income.classed('active', true).classed('inactive', false);
          }
        }
      });

    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenYAxis) {
            //replace chosenY with value  
            chosenYAxis = value;

            //update Y scale
            yLinearScale = yScale(hairData, chosenYAxis);

            //update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            //Udate CIRCLES with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update TEXT with new Y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //Change of the classes changes text
            if (chosenYAxis === 'obesity') {
              obesity.classed('active', true).classed('inactive', false);
              smokes.classed('active', false).classed('inactive', true);
              healthcare.classed('active', false).classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
              obesity.classed('active', false).classed('inactive', true);
              smokes.classed('active', true).classed('inactive', false);
              healthcare.classed('active', false).classed('inactive', true);
            }
            else {
              obesity.classed('active', false).classed('inactive', true);
              smokes.classed('active', false).classed('inactive', true);
              healthcare.classed('active', true).classed('inactive', false);
            }
          }
        });

}).catch(function(error) {
  console.log(error);
});
