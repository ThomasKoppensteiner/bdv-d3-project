# BDV-D3-Project

This project is a study project for the course BDV on the University of Applied Sciences Upper Austria. The main focus lays on the useage of [D3](https://github.com/d3/d3) for Big Data Visualisation.

The project is inspired by the [d3tutorial](https://github.com/sgratzl/d3tutorial) from Samuel Gratzl.

## Data source

We use the [Greenhouse gas emissions](http://stats.oecd.org/viewhtml.aspx?datasetcode=AIR_GHG&lang=en#) dataset from **OECD.stat** as data source for this project. The dataset presents trends in man-made emissions of major greenhouse gases and total emissions by gas and by source.

The following greenhouse gases are include in the dateset:

- Methane
- Carbon dioxide
- Hydrofluorocarbons
- Nitrous oxide
- Perfluorocarbons
- Sulphur hexafluoride
- Greenhouse gases (Sum of the above)

The dataset was converted from a [.csv file](./data/GHG_1990_2014.csv) to [.json file](./data/GHG_1990_2014.json).

Additionally to the above dataset, we use a population-dataset ([.csv](./data/population_per_year.csv), [.json](./data/population_per_year.json)) to calculate the greenhouse gas emission per head.

## Usage
Visit [the projects Github page](https://thomaskoppensteiner.github.io/bdv-d3-project/) for a live demo.

### Main chart
The "Main" chart shows the emission of greenhouse gas (in tonnes of CO2 equivalent, Thousands) over time for the selected country and pollutant. The view can toggle between the absolute values and the per-head values. The chart also includes the global mean and median values. By hovering over the chart a ruler appears, which indicates the current values of the lines for the specific year. By clicking on the chart the year on the ruler position is selected an the other charts are updated.

### Country emissions per pollutat chart
The "Country emissions per pollutant" chart shows the composition of the pollutants (greenhouse gases) for the selected country and the selected year in percent. By clicking either the bar or the pollutantname (label) the selected pollutant changes and the other charts get updated. The selected pollutant is highlighted in red.

### Total emissions per pollutat chart
The "Total emissions per pollutant" chart shows the composition of the pollutants (greenhouse gases) for all countries in the dataset (global) and the selected year in percent. By clicking either the bar or the pollutantname (label) the selected pollutant changes and the other charts get updated. The selected pollutant is highlighted in red.

### Total greenhouse gas emissions per country chart
The "Total greenhouse gas emissions per country" chart shows the portion of the countrys total greenhouse gas emission in percent of the total emission for the selected year. By clicking either the bar or the country (label) the selected country changes and the other charts get updated. The selected country is highlighted in red.

## Findings


## Development

### Using a local WebServer

While you can view local sites (file:///), Chrome doesn't allow you to load additional external files, e.g., JSON files, for security reasons. Therefore, you need a local webserver running for development. As alternative you can use an integrated IDE (such as WebStorm) that has a webserver already integrated.

Starting a simple python static webserver: `python -m SimpleHTTPServer`

Open [http://localhost:8000](http://localhost:8000) to explore the project.

## Disclaimer
This is a study project. Although we worked conscientious the shown data might be inconsistent or wrong. Please do not rely on the it.
