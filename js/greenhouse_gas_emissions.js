// Global vars for main chart, needed in other functions
var mainWidth, mainHeight, mainXScale, mainYScale, mainGXAxis, mainGYAxis, mainXAxis, mainYAxis, mainG, mouseG;
// Global vars for country chart, needed in other functions
var countryHeight, countryXScale, countryYScale, countryGXAxis, countryGYAxis, countryXAxis, countryYAxis, countryG;
// Global vars for total chart, needed in other functions
var totalHeight, totalXScale, totalYScale, totalGXAxis, totalGYAxis, totalXAxis, totalYAxis, totalG;

function setupMainChart() {
    var mainMargin = {top: 10, bottom: 90, left: 150, right: 25};
    mainWidth = 800 - mainMargin.left - mainMargin.right;
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

    createOverlay();
}

function createOverlay(){
    mouseG = mainG.append('g').attr('class', 'overlay');

    // this is the black vertical line to follow the mouse
    mouseG.append("path")
        .attr("class","mouse-line")
        .style("stroke","black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    createMouseCircles();

    // rect to catch mouse movements on canvas
    mouseG.append('svg:rect')
        .attr('class', 'overlay')
        .attr('width', mainWidth - 25)
        .attr('height', mainHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function(){
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-circle circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-circle text")
                .style("opacity", "0");
        })
        .on('mouseover', function(){ // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-circle circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-circle text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);

            // vertical ruler
            d3.select(".mouse-line")
                .attr("d", function(){
                    yRange = mainYScale.range(); // range of y axis
                    var xCoor = d3.mouse(this)[0]; // mouse position in x
                    return "M"+ xCoor +"," + yRange[0] + "L" + xCoor + "," + yRange[1];
                });

            // circles and text
            var selectText = function(s, c) {
                d3.selectAll(s)
                    .attr("transform", function(d, i) {
                        var xYear = mainXScale.invert(mouse[0]),
                            bisect = d3.bisector(function(d) { return d.year; }).right;

                        var line = document.getElementsByClassName(c)[0];
                        var beginning = 0,
                            end = line.getTotalLength(),
                            target = null;

                        while (true){
                            target = Math.floor((beginning + end) / 2);
                            pos = line.getPointAtLength(target);
                            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                                break;
                            }
                            if (pos.x > mouse[0])      end = target;
                            else if (pos.x < mouse[0]) beginning = target;
                            else break;
                        }

                        d3.select(this).select('text')
                            .text(mainYScale.invert(pos.y).toFixed());

                        return "translate(" + mouse[0] + "," + pos.y +")";
                    });
            };

            selectText(".mouse-circle-total", "total");
            selectText(".mouse-circle-selected", "selected");
        })
        .on('click', function() {
            var xYear = mainXScale.invert(d3.mouse(this)[0]).toFixed();
            var country = getSelectorValue('#selected-country');
            d3.select('#selected-year').property("value",xYear);
            updateSubCharts(data);
        });
}

function createMouseCircles(){
    const total = mouseG.append('g').attr('class', 'mouse-circle mouse-circle-total');
    total.append('circle')
        .attr('r', 7)
        .style('stroke', 'green')
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    total.append('text')
        .attr("transform", "translate(10,3)");

    const selected = mouseG.append('g').attr('class', 'mouse-circle mouse-circle-selected');
    selected.append('circle')
        .attr('r', 7)
        .style('stroke', 'red')
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    selected.append('text')
        .attr("transform", "translate(10,3)");
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
    var totalMargin = {top: 10, bottom: 150, left: 120, right: 20};
    var totalWidth = 450 - totalMargin.left - totalMargin.right;
    totalHeight = 350 - totalMargin.top - totalMargin.bottom;

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

var p = Math.max(0, d3.precisionFixed(0.001) - 2),
    formatPercent = d3.format("." + p + "%");



function updateAll(data) {
    self.data = data;

    var selCountry = getSelectorValue('#selected-country');
    var selPollutant = getSelectorValue('#selected-pollutant');

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

    updateSubCharts(data);
}

function updateSubCharts(data) {
    var selCountry = getSelectorValue('#selected-country');
    var selPollutant = getSelectorValue('#selected-pollutant');
    var selYear = parseInt(getSelectorValue('#selected-year'));

    var countryPollutions = data.filter((d) => d.country === selCountry && d.year === selYear && d.variable === 'TOTAL' && d.pollutant != 'Greenhouse gases' );
    updateCountry(countryPollutions);

    var totalPollutions = data.filter((d) => d.year === selYear && d.variable === 'TOTAL' && d.pollutant != 'Greenhouse gases' );
    var totalPollutionsGrouped = Enumerable.From(totalPollutions).GroupBy("$.pollutant", null,
        function(key, g) {
            var result = {
                pollutant: key,
                value: g.Sum("$.value")
            }
            return result;
        }).ToArray();
    updateTotal(totalPollutionsGrouped);

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

    updateLegend();
}

function updateCountry(newData) { 
    updatePollutionPercentChart(countryG, countryXScale, countryYScale, countryGXAxis, countryGYAxis, countryXAxis, countryYAxis, countryHeight, newData);
}

function updateTotal(newData) { 
    updatePollutionPercentChart(totalG, totalXScale, totalYScale, totalGXAxis, totalGYAxis, totalXAxis, totalYAxis, totalHeight, newData);
}

function updatePollutionPercentChart(svgGroup, xScale, yScale, gXAxis, gYAxis, xAxis, yAxis, chartHeight, newData){
    //update the scales
    xScale.domain(newData.map((d) => d.pollutant));
    yScale.domain([100.0, 0]);

    //render the axis
    gXAxis.call(xAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    gYAxis.call(yAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
    const rect = svgGroup.selectAll('rect').data(newData, (d) => d.country);

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
        .attr('height', (d) => yScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('width', xScale.bandwidth())
        .attr('y', (d) => chartHeight - yScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('x', (d) => xScale(d.pollutant));

    rect.merge(rectEnter).select('title').text((d) => formatPercent(d.value / sumOfPollution));

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function updateLegend(){
    const legendItems = [ { title: 'total', color: "green" }, { title: getSelectorValue('#selected-country'), color: "red" } ];
    const legendRect = mainG.selectAll('.legendRect').data(legendItems);
    const legendRectEnter = legendRect.enter().append('rect').attr('class', 'legendRect');
    legendRect.merge(legendRectEnter)
        .attr('x', mainWidth - 120)
        .attr('y', function(d, i){
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
            return d.color;
        });

    const legendText = mainG.selectAll('.legendText').data(legendItems);
    const legendTextEnter = legendText.enter().append('text').attr('class', 'legendText');
    legendText.merge(legendTextEnter)
        .attr('x', mainWidth - 96)
        .attr('y', function(d, i) {
            return (i * 20) + 9;
        })
        .text(function(d) {
            return d.title;
        });
    legendRect.exit().remove();
    legendText.exit().remove();
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
        updateAll(data);
    });

    d3.select('#selected-pollutant').on("change", function(){
        updateAll(data);
    });

    d3.select('#sub-country-chart').selectAll('rect').on("click", function(r){
        d3.select('#selected-pollutant').property("value",r.pollutant);
        updateAll(data);
    });

    d3.select('#sub-total-chart').selectAll('rect').on("click", function(r){
        d3.select('#selected-pollutant').property("value",r.pollutant);
        updateAll(data);
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
    updateAll(data);
});
