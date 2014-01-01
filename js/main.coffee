$(() ->
  console.log("Started")

  svg = dimple.newSvg("#chartContainer", 590, 400)
  d3.json("/js/data/snapshot.json", (data) =>
    items = data.items
    myChart = new dimple.chart(svg, items)
    myChart.setBounds(60, 30, 505, 305)
    x = myChart.addTimeAxis("x", "timestamp")
    x.addOrderRule("Date")
    myChart.addMeasureAxis("y", "weight")
    s = myChart.addSeries(null, dimple.plot.line)
    myChart.draw();
  )
)