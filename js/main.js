$(function() {
    //console.log("BEGINETH THE HACKING");

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

    function renderSpiral(json) {
        var data = _.filter(toWeightOverTime(json), function(d) {return d.weight > 50;});

        // Make an instance of two and place it on the page.
        var elem = document.getElementById('weight-by-day-spiral-chart');
        var two = new Two({ width: 700, height: 700 }).appendTo(elem);

//        var circle = two.makeCircle(-70, 0, 50);
//        var rect = two.makeRectangle(70, 0, 100, 100);
//        circle.fill = '#FF8000';
//        circle.stroke = 'orangered';
//        rect.fill = 'rgba(0, 200, 255, 0.75)';
//        rect.stroke = '#1C75BC';

// Groups can take an array of shapes and/or groups.
//        var group = two.makeGroup(circle, rect);

// And have translation, rotation, scale like all shapes.
//        group.translation.set(two.width / 2, two.height / 2);
//        group.rotation = Math.PI / 2;
//        group.scale = 0.75;

        console.dir(data.length);
//        var cycleLength = 7;
//        var cycleLength = data.length / 2;
        var cycleLength = data.length;
        var turns = Math.ceil((1.0 * data.length) / cycleLength) + 1;
        var stride = ((two.height / 2.0) / turns) / cycleLength;
        console.dir(cycleLength);
        console.dir(turns);
        console.dir(stride);

        var weights = _.pluck(data, 'weight');
        var min_weight = _.min(weights);
        var max_weight = _.max(weights);
        var weight_range = max_weight - min_weight;

        var guidePoints = [];
        var dataPoints = [];
        var centre = new Two.Vector(0, 0);
        var lines = [];
        for(var i = 0; i < data.length; i++) {
            var r_base = (1.0 * i) * stride;
            var theta = 2 * Math.PI * ((i % cycleLength) / cycleLength);

            var r_offset = (stride * cycleLength) * ((data[i].weight - min_weight) / weight_range);
            var r_data = r_base + r_offset;

            var x_guide = r_base * Math.cos(theta);
            var y_guide = r_base * Math.sin(theta);

            var guidePoint = new Two.Vector(x_guide, y_guide);
            guidePoints.push(guidePoint);

            var x_data = r_data * Math.cos(theta);
            var y_data = r_data * Math.sin(theta);

            var dataPoint = new Two.Vector(x_data, y_data);
            dataPoints.push(dataPoint);

//            console.dir(point.x);
//            console.dir(point.y);

            lines.push(two.makeLine(centre.x, centre.y, guidePoint.x, guidePoint.y));
        }

//        var guide = two.makeCurve(0.0, 0.0, 0.1, 0.3, 0.0, 0.5, -0.5, -0.7, true);
//        guide.linewidth = 0.05;
        var guide = two.makeCurve(guidePoints, true);

        var group = two.makeGroup(guide);
        group.add(lines);
        group.noFill();
        group.linewidth = 0.2;
        group.stroke = 'gray';
//        group.translation.set(two.width / 2, two.height / 2);
//        group.scale = (two.width / 2);
        //group.scale = 10;

        var dataCurve = two.makeCurve(dataPoints, true);
        dataCurve.noFill();
        dataCurve.linewidth = 0.2;
        dataCurve.stroke = 'red';
//        dataCurve.translation.set(two.width / 2, two.height / 2);

        var combined = two.makeGroup(group, dataCurve);
        combined.translation.set(two.width / 2, two.height / 2);

// Bind a function to scale and rotate the group
// to the animation loop.
        two.bind('update', function(frameCount) {
            // This code is called everytime two.update() is called.
            // Effectively 60 times per second.
//            if (group.scale > 0.9999) {
//                group.scale = group.rotation = 0;
//            }
//            var t = (1 - group.scale) * 0.125;
//            group.scale += t;
//            group.rotation += t * 4 * Math.PI;
        }).play();
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
        renderSpiral(json);
    });
});