
Template.circles.rendered = function(){
  var self = this;
  self.svg = d3.select(self.find("svg"));

  var width = $(document).width(),
    height = $(document).height();


  var minDimension = d3.min([width, height]);
  var circleRad = minDimension/10;
  var ringRadX = width/2 - circleRad - 20;
  var ringRadY = height/2 - circleRad - 20;
  var ringRad = d3.min([ringRadX, ringRadY]);
  var fontSize = ringRad/8;
  var trDuration = 100;

  self.svg.attr('width', width)
    .attr('height', height);

  var updateCircles = function(selection){

  };

  var transitionRadius = function(selection, radius){
    selection.transition()
        .duration(trDuration)
        .attr('r', radius);
  };

  var layout = function(d, i){
    var curr = d3.select(this);
    console.log(curr);

    var circle = curr.append('circle')
      .attr('class', 'bkg-circle');
    var label = curr.append('text')
      .attr('class', 'circle-label')
      .attr('transform', 'translate(0,5)')
      .style('font-size', fontSize + 'px');
    var hoverCircle = curr.append('circle')
      .attr('class', 'hover-circle');

    //unparametrized location
    var loc = i/data.length;

    var x = Math.cos(loc*Math.PI*2)*ringRad;
    var y = Math.sin(loc*Math.PI*2)*ringRad;

    console.log(x, y);

    curr.attr('transform', 'translate(' + x + ',' + y + ')');

    circle.attr('r', circleRad);
    hoverCircle.attr('r', circleRad);

    hoverCircle.on('mouseover', function(){
      transitionRadius(circle, circleRad + 20);
      transitionRadius(hoverCircle, circleRad + 20);

      label.transition().duration(trDuration)
        .style('font-size', (fontSize + 15) + 'px');
    });

    hoverCircle.on('mouseout', function(){
      transitionRadius(circle, circleRad);
      transitionRadius(hoverCircle, circleRad);

      label.transition().duration(trDuration)
        .style('font-size', fontSize + 'px');
    });

    label.text(d.name);
  };

  var circles = self.svg.select('.circles');

  circles.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

  var data = [
    {name: 'Simon'},
    {name: 'Jeff'},
    {name: 'Derek'},
    {name: 'Simon'},
    {name: 'Jeff'},
    {name: 'Derek'},
    {name: 'Simon'},
    {name: 'Derek'}
  ];

  circles.selectAll('g')
    .data(data).enter()
    .append('g')
    .each(layout);


};