const margin = {top: 10, bottom: 100, left: 120, right: 20};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Creates sources <svg> element
const svg = d3.select('body').append('svg')
            .attr('width', width+margin.left+margin.right)
            .attr('height', height+margin.top+margin.bottom);

// Group used to enforce margin
const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

// Global variable for all data
var data;

// Scales setup
const xscale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const yscale = d3.scaleLinear().range([0, height]);
// const yscale = d3.scaleLog().range([0.1, height]);


// Axis setup
const xaxis = d3.axisBottom().scale(xscale);
const g_xaxis = g.append('g').attr("transform", `translate(0,${height})`).attr('class','x axis');

const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append('g').attr('class','y axis');

/////////////////////////

d3.json('../data/GHG_1990_2014.json', (error, data) => {
  if(error) throw error;

  filtered_data = data.filter((d) => d.year === 1990 && d.pollutant === 'Greenhouse gases' && d.variable === 'TOTAL');

  update(filtered_data);
});


// d3.csv('../data/GHG_1990_2014.csv')
//   .row(function (row) {
//     console.log(row);

//     return {
//         country:    row.Country,
//         year:      +row.Year,
//         pollutant:  row.Pollutant,
//         var:        row.VAR,
//         value:     +row.Value
//     };
//   }).get(function (error, data) {
//   filtered_data = data.filter((d) => d.year === 1990 && d.pollutant === 'Greenhouse gases' && d.var === 'TOTAL')

//   console.log(filtered_data);

//   update(filtered_data);
// });

// var data = d3.tsv("../data/GHG_1990_2014_tabs.csv").row(function (error, row) {
//     if (error) throw error;

//     return {
//         country:    row.Country,
//         year:      +row.Year,
//         pollutant:  row.Pollutant,
//         var:        row.VAR,
//         value:     +row.Value
//     }
//   }).get(function (error, data) {
//     console.log(data);
//     filtered_data = data.filter((d) => d.year === 1990); // && d.pollutant === 'Greenhouse gases' && d.var === 'TOTAL');
//     console.log(filtered_data);
//     update(filtered_data);
//   });

// console.log(data)


function update(new_data) {
  //update the scales
  xscale.domain(new_data.map((d) => d.country));

  var max_value = d3.max(new_data, (d) => d.value)

  yscale.domain([max_value,0]);
  //render the axis
  g_xaxis.call(xaxis).selectAll("text").style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );;
  g_yaxis.call(yaxis);

  // Render the chart with new data

  // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
  const rect = g.selectAll('rect').data(new_data, (d) => d.country);

  // ENTER
  // new elements
  const rect_enter = rect.enter().append('rect')
    .attr('x', 0) //set intelligent default values for animation
    .attr('y', 0)
    .attr('width', 0)
    .attr('height', 0);
  rect_enter.append('title');

  // // ENTER + UPDATE
  // // both old and new elements
  // rect.merge(rect_enter).transition()
  //   .attr('height', yscale.bandwidth())
  //   .attr('width', (d) => xscale(d.country))
  //   .attr('y', (d) => yscale(d.location.city));


  // ENTER + UPDATE
  // both old and new elements
  rect.merge(rect_enter).transition()
    .attr('height', (d) => yscale(max_value - d.value))
    .attr('width', xscale.bandwidth())
    .attr('y', (d) => height - yscale(max_value - d.value))
    .attr('x', (d) => xscale(d.country));

  rect.merge(rect_enter).select('title').text((d) => d.country);

  // EXIT
  // elements that aren't associated with data
  rect.exit().remove();

}

// interactivity
// d3.select('#filter-us-only').on('change', function() {
//   // This will be triggered when the user selects or unselects the checkbox
//   const checked = d3.select(this).property('checked');
//   if (checked === true) {
//     // Checkbox was just checked

//     // Keep only data element whose country is US
//     const filtered_data = data.filter((d) => d.location.country === 'US');

//     update(filtered_data);  // Update the chart with the filtered data
//   } else {
//     // Checkbox was just unchecked
//     update(data);  // Update the chart with all the data we have
//   }
// }
// );