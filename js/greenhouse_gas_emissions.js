var perHead = false;

// Global vars for main chart, needed in other functions
var mainMargin, mainWidth, mainHeight, mainXScale, mainYScale, mainGXAxis, mainGYAxis, mainXAxis, mainYAxis, mainG, mouseG;
// Global vars for country chart, needed in other functions
var countryChartSetup;
// Global vars for total chart, needed in other functions
var totalChartSetup;

function setupMainChart() {
    mainMargin = {top: 10, bottom: 90, left: 100, right: 25};
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

    // text label for the x axis
    mainG.append("text")
        .attr("class", "axis-label main")
        .attr("transform",
            "translate(" + (mainWidth/2) + " ," +
            (mainHeight +  mainMargin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Year");

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
        .attr('width', mainWidth - mainMargin.right)
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
            if(!perHead){
                d3.selectAll(".mouse-circle circle")
                    .style("opacity", "1");
                d3.selectAll(".mouse-circle text")
                    .style("opacity", "1");
            }
            else {
                d3.selectAll(".mouse-circle:not(.mouse-circle-mean) circle")
                    .style("opacity", "1");
                d3.selectAll(".mouse-circle:not(.mouse-circle-mean) text")
                    .style("opacity", "1");
            }
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
                        if(line != null){

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
                                .text(mainYScale.invert(pos.y).toFixed(perHead ? 4 : 0));

                            return "translate(" + mouse[0] + "," + pos.y +")";
                        }
                    });
            };


            selectText(".mouse-circle-mean", "mean");
            selectText(".mouse-circle-median", "median");
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
    var createCircle = function(spec, color){
        const circle = mouseG.append('g').attr('class', 'mouse-circle ' + spec);
        circle.append('circle')
            .attr('r', 7)
            .style('stroke', color)
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        circle.append('text')
            .attr("transform", "translate(10,3)");
    };

    if(!perHead){
        createCircle("mouse-circle-mean", "green");
    }

    createCircle("mouse-circle-median", "blue");
    createCircle("mouse-circle-selected", "red");
}

function setupCountryChart(){
    countryChartSetup = setupPercentChart("#sub-country-chart", "Pollutants");
}

function setupTotalChart(){
    totalChartSetup = setupPercentChart("#sub-total-chart", "Pollutants");
}

function setupPercentChart(selector, xAxisText){
    var margin = {top: 60, bottom: 150, left: 120, right: 20};
    var width = 450 - margin.left - margin.right;
    var chartHeight = 400 - margin.top - margin.bottom;

    // Creates sources <svg> element
    var svg = d3.select(selector).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom);

    var svgGroup = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales setup
    var xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
    var yScale = d3.scaleLinear().range([0, chartHeight]);

    // Axis setup
    var xAxis = d3.axisBottom().scale(xScale);
    var gXAxis = svgGroup.append('g').attr("transform", `translate(0,${chartHeight})`).attr('class', 'x axis');

    var yAxis = d3.axisLeft().scale(yScale).tickFormat(function(d) { return d+ "%" });
    var gYAxis = svgGroup.append('g').attr('class', 'y axis');

    // Title
    chartTitle = svgGroup.append("text")
        .attr("class", "title-label sub-chart")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (0 - 20) + ")")
        .style("text-anchor", "middle");

    // text label for the x axis
    svgGroup.append("text")
        .attr("class", "axis-label sub-chart")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (chartHeight +  margin.bottom - 20) + ")")
        .style("text-anchor", "middle")
        .text(xAxisText);

    return {
        chartHeight: chartHeight,
        svgGroup:    svgGroup,
        xScale:      xScale,
        yScale:      yScale,
        xAxis:       xAxis,
        yAxis:       yAxis,
        gXAxis:      gXAxis,
        gYAxis:      gYAxis,
        chartTitle:  chartTitle
    };
}

var p = Math.max(0, d3.precisionFixed(0.001) - 2),
    formatPercent = d3.format("." + p + "%");

function updateAll(data) {
    self.data = data;

    var selCountry = getSelectorValue('#selected-country');
    var selPollutant = getSelectorValue('#selected-pollutant');
    var selYear = parseInt(getSelectorValue('#selected-year'));

    var popSelected = gPop.filter(e => e.Country===selCountry)[0];
    var popGlobal = gPop.filter(e => e.Country==='Total')[0];

    var mainAll = data.filter((d) => d.pollutant === selPollutant && d.variable === 'TOTAL')
                       .map(function(e) { return {
                           year: e.year,
                           value: e.value};
                       });

    var mainGrouped = Enumerable.From(mainAll).GroupBy("$.year", null,
        function (key, g) {
            var result = {
                year: key,
                median: d3.median(g.source, v => v.value),
                mean: d3.mean(g.source, v => v.value),
                phead: d3.sum(g.source, v => v.value * 1000) / popGlobal[key]
            };
            return result;
        }).ToArray();

    var mainSelected = data.filter((d) => d.country === selCountry && d.pollutant === selPollutant && d.variable === 'TOTAL').map(function(r) {
        return {
            year: r.year,
            value: r.value,
            phead: 1000 * r.value / popSelected[r.year]
        };
    });

    updateMain(mainGrouped, mainSelected);

    updateSubCharts(data);
}

function updateSubCharts(data) {
    var selCountry = getSelectorValue('#selected-country');
    var selPollutant = getSelectorValue('#selected-pollutant');
    var selYear = parseInt(getSelectorValue('#selected-year'));

    countryChartSetup.chartTitle.text(selCountry+", "+selYear);
    totalChartSetup.chartTitle.text("Total, "+selYear);

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
    var maxAllValue = d3.max(allData, (d) => !perHead ? d.mean : d.phead);
    var maxSelectedValue = d3.max(selectedData, (d) => !perHead ? d.value : d.phead);

    mainYScale.domain([Math.max(maxAllValue, maxSelectedValue), 0]);
    //render the axis
    mainGXAxis.call(mainXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    mainGYAxis.call(mainYAxis);

    var enterUpdateMerge = function(c, data, color){
        const path = mainG.selectAll('.'+c).data([data], (d) => d.year);
        const pathEnter = path.enter().append('svg:path')
            .attr('class', c)
            .attr('stroke', color) //set intelligent default values for animation
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        path.merge(pathEnter).transition().attr('d', (d) => lineGen(d));
        path.exit().remove();
    };

    var remove = function(c) {
        mainG.selectAll('.'+c).remove();
    }

    if(!perHead){
        var totalMeanData = allData.map(function(e) { return {
            year: e.year,
            value: e.mean };
        });

        const totalMedianData = allData.map(function(e) { return {
            year: e.year,
            value: e.median };
        });

        enterUpdateMerge('mean', totalMeanData, 'green');
        enterUpdateMerge('median', totalMedianData, 'blue');
    }
    else {
        const totalPerHeadData = allData.map(function(e) { return {
            year: e.year,
            value: e.phead };
        });

        selectedData = selectedData.map(function(e) { return {
           year: e.year,
           value: e.phead };
        });

        remove('mean');
        enterUpdateMerge('median', totalPerHeadData, 'blue');
    }

    enterUpdateMerge('selected', selectedData, 'red');

    updateLegend();
}

function updateCountry(newData) {
    updatePollutionPercentChart(countryChartSetup, newData);
}

function updateTotal(newData) {
    updatePollutionPercentChart(totalChartSetup, newData);
}

function updatePollutionPercentChart(chartSetup, newData){
    //update the scales
    chartSetup.xScale.domain(newData.map((d) => d.pollutant));
    chartSetup.yScale.domain([100.0, 0]);

    //render the axis
    chartSetup.gXAxis.call(chartSetup.xAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    chartSetup.gYAxis.call(chartSetup.yAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
    const rect = chartSetup.svgGroup.selectAll('rect').data(newData, (d) => d.country);

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
        .attr('height', (d) => chartSetup.yScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('width', chartSetup.xScale.bandwidth())
        .attr('y', (d) => chartSetup.chartHeight - chartSetup.yScale(100 - (d.value * 100 / sumOfPollution)))
        .attr('x', (d) => chartSetup.xScale(d.pollutant));

    rect.merge(rectEnter).select('title').text((d) => formatPercent(d.value / sumOfPollution));

    // EXIT
    // elements that aren't associated with data
    rect.exit().remove();
}

function updateLegend(){
    var legendItems;
    if(!perHead) {
        legendItems = [
            { title: 'Global mean', color: "green" },
            { title: 'Global median', color: "blue" },
            { title: getSelectorValue('#selected-country'), color: "red" }];
    }
    else {
        legendItems = [
            { title: 'Global', color: "blue" },
            { title: getSelectorValue('#selected-country'), color: "red" }];
    }

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

    // y axis label
    mainG.selectAll(".y-axis-label").remove();
    mainG.append("text")
        .attr("class", "axis-label main y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 10 - mainMargin.left)
        .attr("x",0 - (mainHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(perHead ? "Tonnes of CO2 equivalent" : "Tonnes of CO2 equivalent, Thousands");
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

    d3.select('#selected-per-head').on('change', function() {
        perHead = d3.select(this).property('checked');
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
    d3.json('data/population_per_year.json', (popError, popData) => {
        if(popError) throw popError;
        gPop = popData;

        fillSelectors(data);
        updateAll(data);
    });
});
