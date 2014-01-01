$(() ->
  console.log("Started")

  svg = dimple.newSvg("#chartContainer", 590, 500)
  d3.json("/js/data/snapshot.json", (data) =>
    now = moment()
    aYearAgo = now.subtract('years', 1)
    console.dir(aYearAgo)
    items = data.items.
      filter((i) => i.weight > 50).
      filter((i) => moment(i.timestamp).isAfter(aYearAgo))
    myChart = new dimple.chart(svg, items)
    myChart.setBounds(60, 30, 505, 305)
    x = myChart.addTimeAxis("x", "timestamp", null, "%Y-%m-%d")
    x.addOrderRule("Date")
    myChart.addMeasureAxis("y", "weight")
    s = myChart.addSeries(null, dimple.plot.line)
    myChart.draw();
  )
)