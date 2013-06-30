
Template.circles.rendered = function(){
  var self = this;
  self.svg = d3.select(self.find("svg"));

  if (! self.handle) {
    self.handle = Deps.autorun(function () {

      var width = $(document).width() - 400,
        height = $(document).height();


      var users = Users.find().fetch();

      var minDimension = d3.min([width, height]);
      var circleRad = minDimension/10;
      var ringRadX = width/2 - circleRad - 20;
      var ringRadY = height/2 - circleRad - 20;
      var ringRad = d3.min([ringRadX, ringRadY]);
      var fontSize = ringRad/8;
      var trDuration = 100;

      self.svg.attr('width', width)
        .attr('height', height);


      var createCircle = function(d, i){
        var curr = d3.select(this);
        curr.append('circle')
          .attr('class', 'bkg-circle');

        curr.append('text')
          .attr('class', 'circle-label')
          .attr('transform', 'translate(0,5)')
          .style('font-size', fontSize + 'px');

        curr.append('circle')
          .attr('class', 'hover-circle');
      };

      var transitionRadius = function(selection, radius){
        selection.transition()
            .duration(trDuration)
            .attr('r', radius);
      };

      var layout = function(d, i){
        var curr = d3.select(this);

        var circle = curr.select('.bkg-circle');
        var label = curr.select('.circle-label');
        var hoverCircle = curr.select('.hover-circle');

        //unparametrized location
        var loc = i/users.length;

        var x = Math.cos(loc*Math.PI*2)*ringRad;
        var y = Math.sin(loc*Math.PI*2)*ringRad;

        curr.transition().attr('transform', 'translate(' + x + ',' + y + ')');

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

        label.text(d.userName);
      };

      var circleG = self.svg.select('.circles');

      circleG.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

      circles = circleG.selectAll('g')
        .data(users);

      //update
      circles.each(layout);

      //enter
      circles.enter()
        .append('g')
        .each(createCircle)
        .each(layout);

      //remove
      circles.exit().remove();


      //render controls
      var controlsG = self.svg.select('.controls');

      controlsG.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

      var playCircle = controlsG.select('.play');

      playCircle.attr('r', ringRad/2);


    });
  }
};