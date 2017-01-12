function setupMainChart() {
    var mainMargin = {top: 10, bottom: 110, left: 120, right: 20};
    var mainWidth = 800 - mainMargin.left - mainMargin.right;
    mainHeight = 600 - mainMargin.top - mainMargin.bottom;

    // Creates sources <svg> element
    mainG = d3.select('#main-chart').append('svg')
        .attr('width', mainWidth + mainMargin.left + mainMargin.right)
        .attr('height', mainHeight + mainMargin.top + mainMargin.bottom)
        .append('g')
        .attr('transform', `translate(${mainMargin.left},${mainMargin.top})`);

    // Scales setup
    mainXScale = d3.scaleBand().rangeRound([0, mainWidth]).paddingInner(0.1);
    mainYScale = d3.scaleLinear().range([0, mainHeight]);

    // Axis setup
    mainXAxis = d3.axisBottom().scale(mainXScale);
    mainGXAxis = mainG.append('g').attr("transform", `translate(0,${mainHeight})`).attr('class', 'x axis');

    mainYAxis = d3.axisLeft().scale(mainYScale);
    mainGYAxis = mainG.append('g').attr('class', 'y axis');
}

function setupCountryChart() {
    var countryMargin = {top: 10, bottom: 100, left: 120, right: 20};
    var countryWidth = 450 - countryMargin.left - countryMargin.right;
    countryHeight = 300 - countryMargin.top - countryMargin.bottom;

    // Creates sources <svg> element
    countryG = d3.select('#sub-country-chart').append('svg')
        .attr('width', countryWidth + countryMargin.left + countryMargin.right)
        .attr('height', countryHeight + countryMargin.top + countryMargin.bottom)
        .append('g')
        .attr('transform', `translate(${countryMargin.left},${countryMargin.top})`);

    // Scales setup
    countryXScale = d3.scaleBand().rangeRound([0, countryWidth]).paddingInner(0.1);
    countryYScale = d3.scaleLinear().range([0, countryHeight]);

    // Axis setup
    countryXAxis = d3.axisBottom().scale(countryXScale);
    countryGXAxis = countryG.append('g').attr("transform", `translate(0,${countryHeight})`).attr('class', 'x axis');

    countryYAxis = d3.axisLeft().scale(countryYScale);
    countryGYAxis = countryG.append('g').attr('class', 'y axis');
}

function setupTotalChart() {
    var totalMargin = {top: 10, bottom: 100, left: 120, right: 20};
    var totalWidth = 450 - totalMargin.left - totalMargin.right;
    totalHeight = 300 - totalMargin.top - totalMargin.bottom;

    // Creates sources <svg> element
    totalG = d3.select('#sub-total-chart').append('svg')
        .attr('width', totalWidth + totalMargin.left + totalMargin.right)
        .attr('height', totalHeight + totalMargin.top + totalMargin.bottom)
        .append('g')
        .attr('transform', `translate(${totalMargin.left},${totalMargin.top})`);

    // Scales setup
    totalXScale = d3.scaleBand().rangeRound([0, totalWidth]).paddingInner(0.1);
    totalYScale = d3.scaleLinear().range([0, totalHeight]);

    // Axis setup
    totalXAxis = d3.axisBottom().scale(totalXScale);
    totalGXAxis = totalG.append('g').attr("transform", `translate(0,${totalHeight})`).attr('class', 'x axis');

    totalYAxis = d3.axisLeft().scale(totalYScale);
    totalGYAxis = totalG.append('g').attr('class', 'y axis');
}

// Global vars for main chart, needed in other functions
var mainHeight, mainXScale, mainYScale, mainGXAxis, mainGYAxis, mainXAxis, mainYAxis, mainG;
// Global vars for country chart, needed in other functions
var countryHeight, countryXScale, countryYScale, countryGXAxis, countryGYAxis, countryXAxis, countryYAxis, countryG;
// Global vars for total chart, needed in other functions
var totalHeight, totalXScale, totalYScale, totalGXAxis, totalGYAxis, totalXAxis, totalYAxis, totalG;

// Global variable for all data
var data;

function updateAll(data) {
    main_data = data.filter((d) => d.year === 1990 && d.pollutant === 'Greenhouse gases' && d.variable === 'TOTAL');

    updateMain(main_data);
    updateTotal(main_data);
    updateCountry(main_data);
}

function updateMain(new_data) {
    //update the scales
    mainXScale.domain(new_data.map((d) => d.country));

    var max_value = d3.max(new_data, (d) => d.value)

    mainYScale.domain([max_value, 0]);
    //render the axis
    mainGXAxis.call(mainXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    mainGYAxis.call(mainYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
    const rect = mainG.selectAll('rect').data(new_data, (d) => d.country);

    // ENTER
    // new elements
    const rect_enter = rect.enter().append('rect')
        .attr('x', 0) //set intelligent default values for animation
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
    rect_enter.append('title');

    // ENTER + UPDATE
    // both old and new elements
    rect.merge(rect_enter).transition()
        .attr('height', (d) => mainYScale(max_value - d.value))
        .attr('width', mainXScale.bandwidth())
        .attr('y', (d) => mainHeight - mainYScale(max_value - d.value))
        .attr('x', (d) => mainXScale(d.country));

    rect.merge(rect_enter).select('title').text((d) => d.country);

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function updateCountry(new_data) {
    //update the scales
    countryXScale.domain(new_data.map((d) => d.country));

    var max_value = d3.max(new_data, (d) => d.value)

    countryYScale.domain([max_value, 0]);
    //render the axis
    countryGXAxis.call(countryXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    countryGYAxis.call(countryYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
    const rect = countryG.selectAll('rect').data(new_data, (d) => d.country);

    // ENTER
    // new elements
    const rect_enter = rect.enter().append('rect')
        .attr('x', 0) //set intelligent default values for animation
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
    rect_enter.append('title');

    // ENTER + UPDATE
    // both old and new elements
    rect.merge(rect_enter).transition()
        .attr('height', (d) => countryYScale(max_value - d.value))
        .attr('width', countryXScale.bandwidth())
        .attr('y', (d) => countryHeight - countryYScale(max_value - d.value))
        .attr('x', (d) => countryXScale(d.country));

    rect.merge(rect_enter).select('title').text((d) => d.country);

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function updateTotal(new_data) {
    //update the scales
    totalXScale.domain(new_data.map((d) => d.country));

    var max_value = d3.max(new_data, (d) => d.value)

    totalYScale.domain([max_value, 0]);
    //render the axis
    totalGXAxis.call(totalXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    totalGYAxis.call(totalYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
    const rect = totalG.selectAll('rect').data(new_data, (d) => d.country);

    // ENTER
    // new elements
    const rect_enter = rect.enter().append('rect')
        .attr('x', 0) //set intelligent default values for animation
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
    rect_enter.append('title');

    // ENTER + UPDATE
    // both old and new elements
    rect.merge(rect_enter).transition()
        .attr('height', (d) => totalYScale(max_value - d.value))
        .attr('width', totalXScale.bandwidth())
        .attr('y', (d) => totalHeight - totalYScale(max_value - d.value))
        .attr('x', (d) => totalXScale(d.country));

    rect.merge(rect_enter).select('title').text((d) => d.country);

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

// Setup charts
setupMainChart();
setupCountryChart();
setupTotalChart();

d3.json('../data/GHG_1990_2014.json', (error, data) => {
    if (error) throw error;
    updateAll(data);
});
