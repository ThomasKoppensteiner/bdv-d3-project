Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});
}

function setupMainChart() {
    var mainMargin = {top: 10, bottom: 90, left: 150, right: 20};
    var mainWidth = 800 - mainMargin.left - mainMargin.right;
    mainHeight = 600 - mainMargin.top - mainMargin.bottom;

    // Creates sources <svg> element
    var mainSvg = d3.select('#main-chart').append('svg')
        .attr('width', mainWidth + mainMargin.left + mainMargin.right)
        .attr('height', mainHeight + mainMargin.top + mainMargin.bottom);
    mainG = mainSvg.append('g')
        .attr('transform', `translate(${mainMargin.left},${mainMargin.top})`);

    // Scales setup
    mainXScale = d3.scaleLinear().range([0, mainWidth-mainMargin.right]).domain([1990,2014]);
    mainYScale = d3.scaleLinear().range([0, mainHeight]);

    // Axis setup
    mainXAxis = d3.axisBottom().scale(mainXScale).tickFormat(d3.format("d"));
    mainGXAxis = mainG.append('g').attr("transform", `translate(0,${mainHeight})`).attr('class', 'x axis').call(mainXAxis);

    mainYAxis = d3.axisLeft().scale(mainYScale);
    mainGYAxis = mainG.append('g').attr('class', 'y axis').call(mainYAxis);

    mainSvg.append("path") // this is the black vertical line to follow mouse
        .attr("class","mouseLine")
        .style("stroke","black")
        .style("stroke-width", "1px")
        .style("opacity", "0");


    var bisect = d3.bisector(function(d) { return d.Year; }).right; // reusable bisect to find points before/after line

    mainG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('class', 'overlay')
        .attr('width', mainWidth) // can't catch mouse events on a g element
        .attr('height', mainHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function(){ // on mouse out hide line, circles and text
            d3.select(".mouseLine")
                .style("opacity", "0");
            d3.selectAll(".mouseCircle circle")
                .style("opacity", "0");
            d3.selectAll(".mouseCircle text")
                .style("opacity", "0");
        })
        .on('mouseover', function(){ // on mouse in show line, circles and text
            d3.select(".mouseLine")
                .style("opacity", "1");
            d3.selectAll(".mouseCircle circle")
                .style("opacity", "1");
            d3.selectAll(".mouseCircle text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            d3.select(".mouseLine")
                .attr("d", function(){
                    yRange = mainYScale.range(); // range of y axis
                    var xCoor = d3.mouse(this)[0]; // mouse position in x
                    var xDate = mainXScale.invert(xCoor); // date corresponding to mouse x
                    d3.selectAll('.mouseCircle') // for each circle group
                        .each(function(d,i){
                            var rightIdx = bisect(data[1].values, xDate); // find date in data that right off mouse
                            /*
                             var interSect = get_line_intersection(xCoor,  // get the intersection of our vertical line and the data line
                             yRange[0],
                             xCoor,
                             yRange[1],
                             x(data[i].values[rightIdx-1].YEAR),
                             y(data[i].values[rightIdx-1].VALUE),
                             x(data[i].values[rightIdx].YEAR),
                             y(data[i].values[rightIdx].VALUE));
                             */

                            yVal = data[i].values[rightIdx-1].VALUE;
                            yCoor = y(yVal);

                            d3.select(this) // move the circle to intersection
                                .attr('transform', 'translate(' + xCoor + ',' + yCoor + ')');

                            d3.select(this.children[0]) // write coordinates out
                                .text((xDate.getFullYear()) + " , " + yVal);

                        });

                    return "M"+ xCoor +"," + yRange[0] + "L" + xCoor + "," + yRange[1]; // position vertical line
                });
        });
}

function setupCountryChart() {
    var countryMargin = {top: 10, bottom: 150, left: 120, right: 20};
    var countryWidth = 450 - countryMargin.left - countryMargin.right;
    countryHeight = 350 - countryMargin.top - countryMargin.bottom;

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
var dbg;

var TEMP_YEAR=1990;

var p = Math.max(0, d3.precisionFixed(0.001) - 2),
    formatPercent = d3.format("." + p + "%");

function updateAll(data, selCountry, selPollutant, selYear) {
    self.data = data;
    var mainAll = data.filter((d) => d.pollutant === selPollutant && d.variable === 'TOTAL')
                       .map(function(e) { return {
                           year: e.year,
                           value: e.value};
                       });

    var mainGrouped = Enumerable.From(mainAll).GroupBy("$.year", null,
        function (key, g) {
            var result = {
                year: key,
                value: g.Sum("$.value") / g.source.length
            };
            return result;
        }).ToArray();

    dbg = mainGrouped;
    var mainSelected = data.filter((d) => d.country === selCountry && d.pollutant === selPollutant && d.variable === 'TOTAL');

    updateMain(mainGrouped, mainSelected);

    var countryPollutionData = data.filter((d) => d.country === selCountry && d.year === selYear && d.variable === 'TOTAL' && d.pollutant != 'Greenhouse gases' );
    updateCountry(countryPollutionData);

    
    updateTotal(mainAll);

    initChangeHandlers();
}

var lineGen = d3.line()
    .curve(d3.curveCatmullRom)
    .x(function(d) {
        return mainXScale(d.year);
    })
    .y(function(d) {
        return mainYScale(d.value);
    });

function updateMain(allData, selectedData) {
    //update the scales
    //mainXScale.domain(allData.map((d) => d.country));

    var maxAllValue = d3.max(allData, (d) => d.value);
    var maxSelectedValue = d3.max(selectedData, (d) => d.value);


    mainYScale.domain([Math.max(maxAllValue, maxSelectedValue), 0]);
    //render the axis
    mainGXAxis.call(mainXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    mainGYAxis.call(mainYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
    const totalPath = mainG.selectAll('.total').data([allData], (d) => d.year);
    const selectedPath = mainG.selectAll('.selected').data([selectedData], d => d.year);

    // ENTER
    const totalPathEnter = totalPath.enter().append('svg:path')
        .attr('class', 'total')
        .attr('stroke', "green") //set intelligent default values for animation
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    const selectedPathEnter = selectedPath.enter().append('svg:path')
        .attr('class', 'selected')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('fill', 'none');


    // ENTER + UPDATE
    totalPath.merge(totalPathEnter).transition().attr('d', (d) => lineGen(d));

    selectedPath.merge(selectedPathEnter).transition().attr('d', (d) => lineGen(d));

    // EXIT
    totalPath.exit().remove();
    selectedPath.exit().remove();
}

function updateCountry(newData) {
    //update the scales
    countryXScale.domain(newData.map((d) => d.pollutant));
    countryYScale.domain([100.0, 0]);
    //render the axis
    countryGXAxis.call(countryXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    countryGYAxis.call(countryYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
    const rect = countryG.selectAll('rect').data(newData, (d) => d.country);

    // ENTER
    // new elements
    const rectEnter = rect.enter().append('rect')
        .attr('x', 0) //set intelligent default values for animation
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
    rectEnter.append('title');

    var sumOfPollution = d3.sum(newData, (d) => d.value);

    // ENTER + UPDATE
    // both old and new elements
    rect.merge(rectEnter).transition()
        .attr('height', (d) => countryYScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('width', countryXScale.bandwidth())
        .attr('y', (d) => countryHeight - countryYScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('x', (d) => countryXScale(d.pollutant));

    rect.merge(rectEnter).select('title').text((d) => formatPercent(d.value / sumOfPollution));

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function updateTotal(newData) {
    //update the scales
    totalXScale.domain(newData.map((d) => d.country));

    var maxValue = d3.max(newData, (d) => d.value)

    totalYScale.domain([maxValue, 0]);
    //render the axis
    totalGXAxis.call(totalXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    totalGYAxis.call(totalYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
    const rect = totalG.selectAll('rect').data(newData, (d) => d.country);

    // ENTER
    // new elements
    const rectEnter = rect.enter().append('rect')
        .attr('x', 0) //set intelligent default values for animation
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
    rectEnter.append('title');

    // ENTER + UPDATE
    // both old and new elements
    rect.merge(rectEnter).transition()
        .attr('height', (d) => totalYScale(maxValue - d.value))
        .attr('width', totalXScale.bandwidth())
        .attr('y', (d) => totalHeight - totalYScale(maxValue - d.value))
        .attr('x', (d) => totalXScale(d.country));

    rect.merge(rectEnter).select('title').text((d) => d.country);

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function fillSelector(data, id, valueSelector){
    var filteredData = Enumerable.From(data.map(valueSelector)).Distinct().ToArray();
    var options = d3.select(id).selectAll('option').data(filteredData);
    var optionsEnter = options.enter().append('option')
        .attr('value', c => c)
        .text(c => c);
    options.merge(optionsEnter);
    options.exit().remove();
}

function fillSelectors(data){
    fillSelector(data, '#selected-country', d => d.country);
    fillSelector(data, '#selected-pollutant', d => d.pollutant);
}

function initChangeHandlers() {
    d3.select('#selected-country').on("change", function(){
        updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'), TEMP_YEAR);
    });

    d3.select('#selected-pollutant').on("change", function(){
        updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'), TEMP_YEAR);
    });

    d3.select('#sub-country-chart').selectAll('rect').on("click", function(r){
        d3.select('#selected-pollutant').property("value",r.pollutant);
        updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'), TEMP_YEAR);
    });
}

function getSelectorValue(selector){
    return d3.select(selector).property("value");
}

// Setup charts
setupMainChart();
setupCountryChart();
setupTotalChart();

d3.json('data/GHG_1990_2014.json', (error, data) => {
    if (error) throw error;
    fillSelectors(data);
    updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'), TEMP_YEAR);
});
