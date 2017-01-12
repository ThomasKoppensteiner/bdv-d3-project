#ruby
require "csv"
require "json"

countries = []


def to_float(value)
  value.gsub(".","").gsub(",",".").to_f
end

CSV.foreach("./GHG_1990_2014.csv", headers: :first_row, col_sep: ";") do |row|
  country   = row[0]
  year      = row[1]
  pollutant = row[2]
  variable  = row[3]
  value     = row[4]

  # countries.push({country: country, years: []}) unless countries.any? {|c| c[:country] == country}
  
  # years = countries.find{|c| c[:country] == country}[:years]
  # years.push({year: year, pollutants: []}) unless years.any? {|y| y[:year] == year}
  
  # pollutants = years.find{|y| y[:year] == year}[:pollutants]
  # pollutants.push({pollutant: pollutant, variables: []}) unless pollutants.any?{|po| po[:pollutant] == pollutant}

  # variables = pollutants.find{|po| po[:pollutant] == pollutant}[:variables]
  # variables.push(variable: variable, value: value.to_f)

  countries.push(country: country, year: year.to_i, pollutant: pollutant, variable: variable, value: to_float(value))
end

File.open("./GHG_1990_2014.json", "w") {|f| f.write(JSON.pretty_generate(countries)) }

puts "File './GHG_1990_2014.json' created."
