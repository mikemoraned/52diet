$(function() {
    console.log("BEGINETH THE HACKING");

    function toWeightOverTime(data) {
        var items = data.items;
        var parse = d3.time.format("%a, %d %b %Y %H:%M:%S").parse;
        var values = items.map(function(d) {
            return {
                'x' : parse(d.timestamp),
                'y' : d.weight
            };
        });
//        values = values.slice(0, 10);
//        values.sort(function(a, b) {
//            return b.x.getTime() - a.x.getTime();
//        });
        return {
            'key'    : "Weight",
            'color'  : '#ff7f0e',
            'values' : values
        };
    }

    d3.json("/js/data/snapshot.json", function(json) {
        var data = toWeightOverTime(json);

        console.dir(data);

        nv.addGraph(function() {
            var chart = nv.models.lineChart();

            chart.xAxis
                .axisLabel('Date');

            chart.yAxis
                .axisLabel('Weight');

            d3.select('svg#chart')
                .datum([data])
                .transition().duration(500)
                .call(chart);

            nv.utils.windowResize(function() { d3.select('svg#chart').call(chart); });

            return chart;
        });
    });
});