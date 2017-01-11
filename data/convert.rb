#ruby
require "csv"
require "json"

h = {countries: {}}

CSV.foreach("./GHG_1990_2014.csv", headers: :first_row, col_sep: ";") do |row|
  country   = row[0]
  year      = row[1]
  pollutant = row[2]
  variable  = row[3]
  value     = row[4]

  countries = h[:countries]
  countries.merge!(country => {years: {}}) unless countries.include?(country)
  
  years = countries[country][:years]
  years.merge!(year => {pollutants: {}}) unless years.include?(year)
  
  pollutants = years[year][:pollutants]
  pollutants.merge!(pollutant => {variables: {}}) unless pollutants.include?(pollutant)

  variables = pollutants[pollutant][:variables]
  variables.merge!(variable => {value: value.to_f})
end

File.open("./GHG_1990_2014.json", "w") {|f| f.write(JSON.pretty_generate(h)) }

puts "File './GHG_1990_2014.json' created."