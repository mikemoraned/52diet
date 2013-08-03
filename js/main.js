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

    function createModel(json) {
        var data = _.filter(toWeightOverTime(json), function(d) {return d.weight > 50;});

        var weights = _.pluck(data, 'weight');
        var min_weight = _.min(weights);
        var max_weight = _.max(weights);
        var weight_range = max_weight - min_weight;

        return {
            'data' : {
                'all'          : data,
                'weights'      : weights,
                'weightAt'     : function(index) {
                    return data[index];
                },
                'weightProportionAt' : function(index) {
                    return ((weights[index] - min_weight) / weight_range);
                },
                'summary'      : {
                    'length'       : data.length,
                    'min_weight'   : min_weight,
                    'max_weight'   : max_weight,
                    'weight_range' : weight_range
                }
            },
            'spiral' : {
//                'cycleLength' : 7//,
                'cycleLength' : data.length / 2//,
//                'cycleLength' : data.length
            }
        };
    }

    function makeArc(two, thetaStart, thetaEnd, r) {
        function thetaRToVector(theta, r) {
            var x = r * Math.cos(theta);
            var y = r * Math.sin(theta);
            return new Two.Vector(x, y);
        }

        var points = [];
        var thetaInc = Math.PI / 22.5;
        for(var theta = thetaStart; theta < thetaEnd; theta += thetaInc) {
            var x = r * Math.cos(theta);
            var y = r * Math.sin(theta);

            var point = thetaRToVector(theta, r);
            points.push(point);
        }

        var end = thetaRToVector(thetaEnd, r);
        points.push(end);

        return two.makeCurve(points, true);
    }

    function buildScene(two, model) {
        var offset = model.data.summary.length / 2;

        var cycleLength = model.spiral.cycleLength;
        var maxIndex = offset + model.data.summary.length;
        var turns = Math.ceil((1.0 * maxIndex) / cycleLength) + 1;
        var stride = ((two.height / 2.0) / turns) / cycleLength;
        console.dir(cycleLength);
        console.dir(turns);
        console.dir(stride);

        var guidePoints = [];
        var dataPoints = [];
        var arcs = [];
        for(var i = offset; i < maxIndex; i++) {
            var r_base = (1.0 * i) * stride;
            var theta = 2 * Math.PI * ((i % cycleLength) / cycleLength);

            var weight_proportion = model.data.weightProportionAt(i - offset);

            var r_offset = (stride * cycleLength) * weight_proportion;
            var r_data = r_base + r_offset;

            var x_guide = r_base * Math.cos(theta);
            var y_guide = r_base * Math.sin(theta);

            var guidePoint = new Two.Vector(x_guide, y_guide);
            guidePoints.push(guidePoint);

            var x_data = r_data * Math.cos(theta);
            var y_data = r_data * Math.sin(theta);

            var dataPoint = new Two.Vector(x_data, y_data);
            dataPoints.push(dataPoint);

            var arc = makeArc(two, theta, theta + (2 * Math.PI * (1.0 / cycleLength)), r_base);
            arc.miter = 'butt';
            arc.stroke = 'rgba(128, 0, 0, ' + weight_proportion + ')';
            arc.linewidth = 20.0;
            arc.noFill();
            arcs.push(arc);
        }

        var guide = two.makeCurve(guidePoints, true);

        var group = two.makeGroup(guide);
        group.noFill();
        group.linewidth = 0.2;
        group.stroke = 'gray';

        var dataCurve = two.makePolygon(dataPoints, true);
        dataCurve.noFill();
        dataCurve.linewidth = 0.5;
        dataCurve.stroke = 'red';

        var dataGroup = two.makeGroup(dataCurve);
        dataGroup.add(arcs);

        var combined = two.makeGroup(group, dataGroup);
        combined.translation.set(two.width / 2, two.height / 2);
    }

    function bindSpiral(model) {
        var elem = document.getElementById('weight-by-day-spiral-chart');
        var two = new Two({ width: 700, height: 700 }).appendTo(elem);

        buildScene(two, model);

        two.bind('update', function(frameCount) {

        }).play();
    }

    d3.json("/js/data/snapshot.json", function(json) {
        var model = createModel(json);
        bindSpiral(model);
    });
});