$(() ->
  console.log("Started")

  now = moment()
  aYearAgo = now.subtract('years', 1)
  console.dir(aYearAgo)

  _.mixin(
    extractStartOfDay: (items, datePropertyReader) ->
      format = d3.time.format("%Y-%m-%d")
      _.map(items, (item) =>
        m = moment(datePropertyReader(item))
        startOfDay = m.startOf('day')
        item['day'] = format(startOfDay.toDate())
        item
      )
  )

  svg = dimple.newSvg("#chartContainer", 620, 600)
  d3.json("/js/data/weight.json", (weightData) =>
    d3.json("/js/data/fitnessActivities.json", (activityData) =>

      weightItems = _.chain(weightData.items).
        filter((i) => i.weight > 50).
        filter((i) => moment(i.timestamp).isAfter(aYearAgo)).
        extractStartOfDay((item) => item.timestamp).
        value()

      console.dir(weightItems)

      activityItems = _.chain(activityData.items).
        filter((i) => moment(i.start_time).isAfter(aYearAgo)).
        extractStartOfDay((item) => item.start_time).
        value()

      console.dir(activityItems)

#      caloriesPerDay = _.chain(activityItems).
#        groupBy((item) => moment(item.start_time).startOf('day')).
#        map((items, startOfDayMoment) =>
#          {
#            timestamp: startOfDayMoment.toDate().toString()
#            total_calories: _.reduce(items, (total, item) => item.total_calories + total, 0)
#          }
#        ).
#        value()
#
#      console.dir(caloriesPerDay)

#      mergedItems = weightItems
#      _.each(activityItems, (item, index) =>
#        _.keys(item).forEach((key) =>
#          mergedItems[index][key] = item[key]
#        )
#      )
#
#      console.dir(mergedItems)

      myChart = new dimple.chart(svg, weightItems)
      myChart.setBounds(60, 30, 505, 305)

      x1 = myChart.addTimeAxis("x", "timestamp", null, "%Y-%m-%d")
      x1.addOrderRule("Date")

      x2 = myChart.addTimeAxis("x", "start_time", null, "%Y-%m-%d")
      x2.addOrderRule("Date")

      y1 = myChart.addMeasureAxis("y", "weight")
      y1.overrideMin = 80
      myChart.addSeries(null, dimple.plot.line, [x1, y1])

      y2 = myChart.addMeasureAxis("y", "total_calories")
      myChart.addSeries(null, dimple.plot.bar, [x2, y2])

      myChart.draw()
    )
  )
)