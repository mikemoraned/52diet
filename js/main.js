$(function() {
    console.log("BEGINETH THE HACKING");
    d3.json("/js/data/snapshot.json", function(data) {
       console.dir(data);
       // Mon, 29 Jul 2013 00:00:00
       var items = data.items;
       var weightOverTime = items.map(function(d) {
           return {
               'weight' : d.weight,
               'time'   : moment(d.timestamp, "ddd, DD MMM YYYY hh:mm:ss").toDate()
           };
       });
       console.dir(weightOverTime);
    });
});