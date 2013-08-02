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

    function renderSpiral() {
        // Make an instance of two and place it on the page.
        var elem = document.getElementById('weight-by-day-spiral-chart');
        var two = new Two({ width: 285, height: 200 }).appendTo(elem);

        var circle = two.makeCircle(-70, 0, 50);
        var rect = two.makeRectangle(70, 0, 100, 100);
        circle.fill = '#FF8000';
        circle.stroke = 'orangered';
        rect.fill = 'rgba(0, 200, 255, 0.75)';
        rect.stroke = '#1C75BC';

// Groups can take an array of shapes and/or groups.
        var group = two.makeGroup(circle, rect);

// And have translation, rotation, scale like all shapes.
        group.translation.set(two.width / 2, two.height / 2);
        group.rotation = Math.PI / 2;
        group.scale = 0.75;

        two.update();
    }

    function renderChart(json) {
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
    }

    d3.json("/js/data/snapshot.json", function(json) {
        //renderChart(json);
        renderSpiral();
    });
});