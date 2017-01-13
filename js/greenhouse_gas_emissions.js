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
var dbg;

function updateAll(data, sel_country, sel_pollutant) {
    self.data = data;
    var main_all = data.filter((d) => d.pollutant === sel_pollutant && d.variable === 'TOTAL')
                       .map(function(e) { return {
                           year: e.year,
                           value: e.value};
                       });

    var main_grouped = Enumerable.From(main_all).GroupBy("$.year", null,
        function (key, g) {
            var result = {
                year: key,
                value: g.Sum("$.value") / g.source.length
            };
            return result;
        }).ToArray();

    dbg = main_grouped;
    var main_selected = data.filter((d) => d.country === sel_country && d.pollutant === sel_pollutant && d.variable === 'TOTAL');

    updateMain(main_grouped, main_selected);
    updateTotal(main_all);
    updateCountry(main_all);
}

var lineGen = d3.line()
    .curve(d3.curveCatmullRom)
    .x(function(d) {
        return mainXScale(d.year);
    })
    .y(function(d) {
        return mainYScale(d.value);
    });

function updateMain(all_data, selected_data) {
    //update the scales
    //mainXScale.domain(all_data.map((d) => d.country));

    var max_all_value = d3.max(all_data, (d) => d.value);
    var max_selected_value = d3.max(selected_data, (d) => d.value);


    mainYScale.domain([Math.max(max_all_value, max_selected_value), 0]);
    //render the axis
    mainGXAxis.call(mainXAxis).selectAll("text").style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    ;
    mainGYAxis.call(mainYAxis);

    // Render the chart with new data
    // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
    const total_path = mainG.selectAll('.total').data([all_data], (d) => d.year);
    const selected_path = mainG.selectAll('.selected').data([selected_data], d => d.year);

    // ENTER
    const total_path_enter = total_path.enter().append('svg:path')
        .attr('class', 'total')
        .attr('stroke', "green") //set intelligent default values for animation
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    const selected_path_enter = selected_path.enter().append('svg:path')
        .attr('class', 'selected')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('fill', 'none');


    // ENTER + UPDATE
    total_path.merge(total_path_enter).transition()
        .attr('d', (d) => lineGen(d));

    selected_path.merge(selected_path_enter).transition()
        .attr('d', (d) => lineGen(d));

    // EXIT
    total_path.exit().remove();
    selected_path.exit().remove();
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

function fillSelector(data, id, value_selector){
    var filtered_data = Enumerable.From(data.map(value_selector)).Distinct().ToArray();
    var options = d3.select(id).selectAll('option').data(filtered_data);
    var options_enter = options.enter().append('option')
        .attr('value', c => c)
        .text(c => c);
    options.merge(options_enter);
    options.exit().remove();
}

function fillSelectors(data){
    fillSelector(data, '#selected-country', d => d.country);
    fillSelector(data, '#selected-pollutant', d => d.pollutant);
}

function initChangeHandlers() {
    d3.select('#selected-country').on("change", function(){
        updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'));
    });

    d3.select('#selected-pollutant').on("change", function(){
        updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'));
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
    updateAll(data, getSelectorValue('#selected-country'), getSelectorValue('#selected-pollutant'));
    initChangeHandlers();
});
