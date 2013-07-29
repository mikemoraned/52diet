$(function() {
    console.log("BEGINETH THE HACKING");

    function toWeightOverTime(data) {
        var parse = d3.time.format("%a, %d %b %Y %H:%M:%S").parse;
        var values = data.items.map(function(d) {
            return {
                'date' : parse(d.timestamp),
                'weight' : d.weight
            };
        });
        return values;
    }

    d3.json("/js/data/snapshot.json", function(json) {
        var data = toWeightOverTime(json);

        var cross = crossfilter(data);

        var all = cross.groupAll();

        function reduceByMax(group, fn) {
            function reduceAdd(p, v) {
                if (fn(v) > p) {
                    p = fn(v);
                }
                return p;
            }

            function reduceRemove(p, v) {
                throw "not implemented";
            }

            function reduceInitial() {
                return 0;
            }

            return group.reduce(reduceAdd, reduceRemove, reduceInitial);
        }

        var dayDimension = cross.dimension(function(d) { return d.date; });
        var weightDimension = cross.dimension(function(d) { return d.weight; });
        weightDimension.filterRange([80, 100]);
        var weightByDayGroup = reduceByMax(dayDimension.group(), function(d) { return d.weight; });

        console.dir(dayDimension.top(10));
        console.dir(weightByDayGroup.top(10));

        var minDay = dayDimension.top(1)[0].date;
        var maxDay = dayDimension.bottom(1)[0].date;

        var minWeight = weightDimension.bottom(1)[0].weight;
        var maxWeight = weightDimension.top(1)[0].weight;

        console.dir(minDay);
        console.dir(maxDay);

        dc.lineChart("#weight-by-day-chart")
            .width(990)
            .height(250)
            .dimension(dayDimension)
            .group(weightByDayGroup)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .x(d3.time.scale().domain([maxDay, minDay]))
            .y(d3.scale.linear().domain([minWeight, maxWeight]))
            ;

        dc.renderAll();
    });
});