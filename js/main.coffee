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

    joinOnDay: (itemsArrays) ->
      combined = _.flatten(itemsArrays, true)
      _.chain(combined).groupBy('day').map((itemsForDay) =>
        _.chain(itemsForDay).
        map((item) => _.pairs(item)).
        flatten(true).
#        tap((i) => console.dir(i)).
        object().
        value()
      ).
      value()

    fillInGaps: (items, propertyName) ->

      itemsOrderedByDayDesc = _.chain(items).
        sortBy((item) => moment(item.day).unix()).
        reverse().
        value()

      entriesWithPropertyOrderedByDayDesc = _.chain(itemsOrderedByDayDesc).
        filter((item) => item[propertyName]).
        map((item) =>
          entry = { day: item.day }
          entry[propertyName] = item[propertyName]
          entry
        ).
        value()

      console.log("Sorted:")
      console.dir(entriesWithPropertyOrderedByDayDesc)

      findClosest = (day) =>
        found = _.find(entriesWithPropertyOrderedByDayDesc,
          (item) => moment(item.day).unix() <= day.unix())
        if day.unix() == moment(found.day).unix()
          found
        else
          entry = { day: d3.time.format("%Y-%m-%d")(day.toDate()) }
          entry[propertyName] = found[propertyName]
          entry

      minDay = moment(_.last(itemsOrderedByDayDesc).day)
      day = moment(_.min(itemsOrderedByDayDesc).day)

      console.log("#{day.format("dddd, MMMM Do YYYY, h:mm:ss a")} -- #{minDay.format("dddd, MMMM Do YYYY, h:mm:ss a")}")

      filledIn = []
      while (day.isAfter(minDay))
        filledIn.push(findClosest(day))
        day.subtract(1, 'day')

      console.log("Filled in:")
      console.dir(filledIn)

      filledIn
  )

  svg = dimple.newSvg("#chartContainer", 620, 600)
  d3.json("/js/data/weight.json", (weightData) =>
    d3.json("/js/data/fitnessActivities.json", (activityData) =>

      weightItems = _.chain(weightData.items).
        extractStartOfDay((item) => item.timestamp).
        fillInGaps('weight').
        value()

      console.dir(weightItems)

      activityItems = _.chain(activityData.items).
        extractStartOfDay((item) => item.start_time).
        value()

      console.dir(activityItems)

      items = _.chain([weightItems, activityItems]).
        joinOnDay().
        filter((i) => moment(i.day).isAfter(aYearAgo)).
        filter((i) => i.weight > 50).
        value()

      console.dir(items)

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

      myChart = new dimple.chart(svg, items)
      myChart.setBounds(60, 30, 505, 305)

      x = myChart.addTimeAxis("x", "day", "%Y-%m-%d", "%Y-%m-%d")
      x.addOrderRule("Date")

      y1 = myChart.addMeasureAxis("y", "weight")
      y1.overrideMin = 80
      myChart.addSeries(null, dimple.plot.line, [x, y1])

      y2 = myChart.addMeasureAxis("y", "total_calories")
      myChart.addSeries(null, dimple.plot.bar, [x, y2])

      myChart.draw()
    )
  )
)