// global variables
var hoverHighlight = 'rgba(232, 138, 12, 1)'; //#E88A0C
var transGraphColor = 'rgba(100, 100, 100, 0.2)';//#7B7B7B
var hoverFadeOut = 'rgba(17, 17, 17, 0.7)'; //#111111
var prevClickedRow = '';
var isRowClicked = false;
var circleClicked = false;
var szOn = false;
var szScale = 0.1; // the scale to invoke semantic zooming
var szLevel; // the number of levels to show (for semantic zooming)
var szPadding = 7; // the distance between two contours
var szStrokeWidth = 2; // the stroke width of the contour
var graphNum = 0; // the number of graphs in the canvas now
var classDict = {
  "https://cso.kmi.open.ac.uk/topics/artificial_intelligence" : 0,
  "https://cso.kmi.open.ac.uk/topics/robotics" : 1,
  "https://cso.kmi.open.ac.uk/topics/computer_vision" : 2,
  "https://cso.kmi.open.ac.uk/topics/computer_operating_systems" : 3,
  "https://cso.kmi.open.ac.uk/topics/bioinformatics" : 4,
  "https://cso.kmi.open.ac.uk/topics/software_engineering" : 5,
  "https://cso.kmi.open.ac.uk/topics/information_technology" : 6,
  "https://cso.kmi.open.ac.uk/topics/data_mining" : 7,
  "https://cso.kmi.open.ac.uk/topics/information_retrieval" : 8,
  "https://cso.kmi.open.ac.uk/topics/computer_programming" : 9, 
  "https://cso.kmi.open.ac.uk/topics/computer_security" : 10,
  "https://cso.kmi.open.ac.uk/topics/theoretical_computer_science" : 11,
  "https://cso.kmi.open.ac.uk/topics/internet" : 12,
  "https://cso.kmi.open.ac.uk/topics/formal_languages" : 13,
  "https://cso.kmi.open.ac.uk/topics/software" : 14,
  "https://cso.kmi.open.ac.uk/topics/hardware" : 15,
  "https://cso.kmi.open.ac.uk/topics/computer_hardware" : 15,
  "https://cso.kmi.open.ac.uk/topics/computer_aided_design" : 16,
  "https://cso.kmi.open.ac.uk/topics/computer-aided_design" : 16,
  "https://cso.kmi.open.ac.uk/topics/operating_system" : 17,
  "https://cso.kmi.open.ac.uk/topics/operating_systems" : 17,
  "https://cso.kmi.open.ac.uk/topics/computer_system" : 18,
  "https://cso.kmi.open.ac.uk/topics/computer_systems" : 18,
  "https://cso.kmi.open.ac.uk/topics/computer_network" : 19,
  "https://cso.kmi.open.ac.uk/topics/computer_networks" : 19,
  "https://cso.kmi.open.ac.uk/topics/computer_communication_networks" : 19,
  "https://cso.kmi.open.ac.uk/topics/human_computer_interaction" : 20,
  "https://cso.kmi.open.ac.uk/topics/human-computer_interaction" :20
}
colorMap = [
  d3.lab(85,-24,-1),  //#9EE2D5
  d3.lab(85,-11,36),  //#D2D98F
  d3.lab(85,8,-15),   //#D9D0F1
  d3.lab(85,62,29),   //#FF9FA2
  d3.lab(85,-8,-22),  //#B1DAFD
  d3.lab(85,17,22),   //#FEC8AC
  d3.lab(85,-32,52),  //#AFE46C
  d3.lab(85,20,-6),   //#F6C7E0
  d3.lab(85,0,20),    //#D4D4D4
  d3.lab(85,76,-100), //#FF9BFF
  d3.lab(85,-17,15),  //#BBDDB7
  d3.lab(85, -6, 85)  //#E8D600
];

//jQuery
$("document").ready(function() {
  //submit click function
  $('#loadGraphFileBtn').on('click', function () {
      var text = $('#graphFile1').val().replace("C:\\fakepath\\", "");

      if (text != "") {
        // create canvas
        $("#graphCanvas")
          .append('<div id="canvas' + graphNum + '" class="col svgGroup"> \
                      <button id="closeCanvasBtn' + graphNum + '" type="button" class="close btn-secondary pull-left" aria-label="btnClose"> \
                        <span aria-hidden="true">&times;</span> \
                      </button> \
                        <div class="row"> \
                          <div class="col" align="center"> \
                              <div class="row"> \
                                  <svg id="svgCircles' + graphNum + '" class="svgCircles"></svg> \
                              </div> \
                              <div class="row"> \
                                <div class="divText" id="divText' + graphNum + '"> \
                                    <table id="tableText' + graphNum + '" style="border-collapse:separate; border-spacing:0 5px;"></table> \
                                </div> \
                              </div> \
                          </div> \
                          <div class="col col-lg-2" id="transGraphContent"> \
                            <svg id="svgTrans' + graphNum + '" class="svgTrans"></svg> \
                          </div> \
                      </div> \
                  </div>');

        // close current canvas
        $('#closeCanvasBtn'+ graphNum).on('click', function () {
          console.log( $(this).parent());
          $(this).parent().remove();
        });

        //send data to the server
        var data = {};
        data['filename'] = text;

        $.post("/loadGraph",data,
        function(jsonData,status){
            try {
              // draw bubble treemap
              let svg1 = d3.select("#svgCircles"+graphNum);
              svg1.selectAll("*").remove();
              jsonData["hierarchy"].children.sort((a,b) => (a.name > b.name ? 1 : -1));
              drawChart(jsonData["hierarchy"], svg1, graphNum);
            }
            catch(error) {
              console.error(error);
            }

            try {
              // draw transcript view
              let svgTrans = d3.select("#svgTrans"+graphNum);
              drawTrans(jsonData["sentences"], svgTrans, graphNum);
            }
            catch(error) {
              console.error(error);
            }

            try {
              // draw raw text view
              let svgTrans = d3.select("#svgTrans"+graphNum);
              drawText(jsonData["sentences"], svgTrans, graphNum);
            }
            catch(error) {
              console.error(error);
            }

            graphNum++;
        },"json");
      }
  });

  $('#loadTextFileBtn').on('click', function () {
    var text1 = $('#textFile').val().replace("C:\\fakepath\\", "");

    if (text1 != "") {
      // create new canvas
      $("#graphCanvas")
        .append('<div id="canvas' + graphNum + '" class="col svgGroup"> \
                    <button id="closeCanvasBtn' + graphNum + '" type="button" class="close pull-left" aria-label="btnClose"> \
                      <span aria-hidden="true">&times;</span> \
                    </button> \
                    <div class="row"> \
                        <div class="col" id="circleRow' + graphNum + '"> \
                            <div id="loader' + graphNum + '"> \
                              <div class="loader"></div> \
                              <h2>Processing...</h2> \
                            </div> \
                        </div> \
                        <div class="col col-lg-2" id="transGraphContent"> \
                            <svg id="svgTrans' + graphNum + '" class="svgTrans"></svg> \
                        </div> \
                    </div> \
                </div>');
      
      // close current canvas
      $('#closeCanvasBtn' + graphNum).on('click', function () {
        $(this).parent().remove();
      });

      //send data to the server
      var data = {};
      data['filename'] = text1;
      
      $.post("/loadText",data,
      function(jsonData, status){
          console.log(jsonData)
          try {
            // draw bubble treemap
            $("#loader"+graphNum).remove();
            $("#circleRow"+graphNum).append('<svg id="svgCircles' + graphNum + '" class="svgCircles"></svg>');
            let svgCircles= d3.select("#svgCircles"+graphNum);
            svgCircles.selectAll("*").remove();
            jsonData["hierarchy"].children.sort((a,b) => (a.name > b.name ? 1 : -1));
            drawChart(jsonData["hierarchy"], svgCircles, graphNum);
          }
          catch(error) {
            console.error(error);
          }

          try {
            // draw transcript view
            let svgTrans = d3.select("#svgTrans"+graphNum);
            console.log(svgTrans);
            drawTrans(jsonData["sentences"], svgTrans, graphNum);
          }
          catch(error) {
            console.error(error);
          }

          graphNum++;
      },"json");
    }
  });
  
  // toggle sidebar
  $('#sidebarButton').on('click', function () {
    $('#sidebar').toggleClass('active');
  });

  // show selected file name
  $('.custom-file-input').change(function (e) {
    $(this).next('.custom-file-label').html(e.target.files[0].name);
  });

  $('#showTransBtn').on('click', function() {
    d3.selectAll('#transGraphContent')
      .classed('col col-lg-2', true);

    d3.selectAll(".svgTrans")
      .style("width", "100%");

    $(this).text("Show transcript ✔");
    $('#hideTransBtn').text(" Hide transcript");
  });

  $('#hideTransBtn').on('click', function() {
    d3.selectAll('transGraphContent')
      .classed('col col-lg-2', false);

    d3.selectAll(".svgTrans")
      .style("width", "0px");

    $(this).text("Hide transcript ✔");
    $('#showTransBtn').text(" Show transcript");
  });

  $('#szSwitch').on('change.bootstrapSwitch', function (e) {
    if (e.target.checked){
      szOn = true;
      szLevel =3;
    } else {
      szOn = false;
    }
  });
});

function drawChart(data, svg, graphID) {
    // Create hierarchy.
    let root = d3.hierarchy(data)
        .sum(function(d) { return Math.sqrt(d.size) *10; }) // For flare.
        //.sum(function(d) { return d.size*3; })
        .sort(function(a, b) { return b.value - a.value; });

    // Create bubbletreemap.
    let bubbletreemap = d3.bubbletreemap()
        .padding(szPadding)
        .curvature(10)
        .hierarchyRoot(root)
        .width(svg.attr("width"))
        .height(svg.attr("height"))
        .colormap(colorMap); // Color brewer: 12-class Paired

    // Create gradient color palette
    let contourColor = d3.scaleLinear().domain([root.height, 0]) // [0, root.height]:Darker outside, lighter inside [root.height, 0]:Lighter outside, darker inside 
        .interpolate(d3.interpolateLab)
        .range([d3.lab("#333333"), d3.lab('#eeeeee')]); // Fill_Lighter outside, darker inside
        //.range([d3.lab("#333333"), d3.lab('#CCCCCC')]); //Fill_Darker outside, lighter inside

    // Do layout and coloring.
    let hierarchyRoot = bubbletreemap.doLayout().doColoring().hierarchyRoot();

    let leafNodes = hierarchyRoot.descendants().filter(function (candidate) {
        return !candidate.children;
    });

    let zoomGroup = svg.append("g");
    genLegend(data, svg);

    // Draw contour.
    let contourGroup = zoomGroup.append("g")
        .attr("class", "contour")
        .style('transform', 'translate(50%, 50%)');

    let tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([10, 0])
      .direction('e')
      .attr("data-clicked", false);
    svg.call(tip);

    d3.select("body").on("click",function(){
      if ((event.target.nodeName!="path")&&(event.target.nodeName!="circle")) {
          tip.hide();
          circleClicked = false;
      }
    });

    // zooming related
    szLevel = root.height;
    let zoom = d3.zoom()
      .scaleExtent([(-2*szScale+0.99), 5])
      .on("zoom", function () {
        zoomGroup.attr("transform", d3.event.transform);
        if (szOn){
          SemanticZooming_1(bubbletreemap, svg, leafNodes, graphID, contourColor, tip, root.height);
        } else {
          szLevel = root.height;
        }
      });
    svg.call(zoom);

    path = contourGroup.selectAll("path")
        .data(bubbletreemap.getContour(szLevel).filter(function(nodes) {
          return nodes.height > 0;
        })) //semantic_zooming_1
        //.data(bubbletreemap.getContour(root.height, szPadding)) //semantic_zooming_2
        .enter().append("path")
        .attr("id", function(d) { return "g-" + graphID + "-" + "c-" + d.name.substring(d.name.lastIndexOf("/")+1, d.name.length-1).replace(/%/g, '');})
        .attr("d", function(arc) { return arc.d; })
        .style("stroke", function(arc) {
            return "black"; // fill
            //return contourColor(arc.depth); // contour
            //return arc.color;
        })
        .style("stroke-width", function(arc) { 
            //return 6-arc.depth*0.7; // Thicker outside, thinner inside
            //return 1+arc.depth*0.7; // Thinner outside, thicker inside
            return szStrokeWidth; // fill
        })
        .style("fill-opacity", 0.7) 
        .style("fill", function(arc) {
            //return "white"; // contour
            return contourColor(arc.depth);// fill
        })
        .attr("transform", function(arc) {return arc.transform;})
        .on("mouseover", function(d, i) {
            HighlightPath(this.id, graphID, tip);
        })
        .on("mouseout", function(d, i) {
            RecoverPath(contourColor, this.id, graphID, tip)
        });
        
    // Draw circles.
    let circleGroup = zoomGroup.append("g")
        .attr("class", "circlesAfterPlanck")
        .style('transform', 'translate(50%, 50%)');

    //Glowing effect: Container for the gradients
    var defs = circleGroup.append("defs");

    //Filter for the outside glow
    var filter = defs.append("filter")
        .attr("id","glow")
        .attr("x", "-30%")
        .attr("y", "-30%")
        .attr("width", "160%")
        .attr("height", "160%");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","3.5")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");

    circleGroup.selectAll("circle")
        .data(leafNodes.filter(function (nodes) {
            return nodes.depth <= szLevel;
        })) //semantic_zooming_1
        //.data(leafNodes) //semantic_zooming_2
        .enter().append("circle")
        .attr("id", function(d) { return "g-" + graphID + "-" + "e-" + d.data.name.substring(d.data.name.lastIndexOf("/")+1, d.data.name.length-1).replace(/%/g, '');})
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d) { return d.color; })
        .style("stroke",  function(arc) {
            return "black"; // fill
            //return contourColor(arc.depth); // contour
            //return d3.lab(arc.color).darker(2);
        })
        //.style("fill-opacity", 0.7)
        .style("stroke-width", szStrokeWidth)
        .on("mouseover", function(d, i) {
            HighlightCircle([this.id], graphID, tip);

            d.data.location.forEach(function(location) {
              HighlightRect("g-" + graphID + "-" + "rSen-" + location[0], graphID);
            });

            // fade out other circles
            otherCircle = d3.selectAll("circle").filter(function(circle){
              if (circle.data.name == d.data.name) 
                return false;
              else
                return true;
            });
            if (!otherCircle.empty())
              otherCircle.style("opacity", 0.1);
        })
        .on("mouseout", function(d, i) {
            RecoverCircle(graphID, tip);

            d.data.location.forEach(function(location) {
              RecoverRect("g-" + graphID + "-" + "rSen-" + location[0], graphID);
            });
        })
        .on("click", function(d, i) {
            ClickCircle(d.data.name, tip);
        });
}

function drawTrans(senList, svg, graphID, speakerDiff=0) {
  svg.selectAll("*").remove();

  var w = $("#transGraphContent").width();
  var h = $("#transGraphContent").height();

  var docLength = senList.length;
  var transcriptScale = d3.scaleLinear()
                          .domain([0, docLength])
                          .range([0, h]);
  var constantHeight = 0;
  var maxTranLine = 0

  // to normalize the widths of the lines of sentence, need to find
  // the maximum length
  for (i=0; i<senList.length;i++){
    if (maxTranLine < senList[i].sentence.length){
      maxTranLine =senList[i].sentence.length;
    }
  }

  // create and store data object for visualization
  var graphData = [];
  for (i=0; i < senList.length; i++){
    var d = {};
    // var ySec = hmsToSec(captionArray[i][0]);
    var ySec = i;
    d.timeStamp = ySec;
    var yloc = transcriptScale(ySec);
    d.y = yloc;
    //d.speaker = captionArray[i][2];
    if (speakerDiff === 0){
      d.x = 0;
      d.fillColor = transGraphColor;
      d.width = senList[i].sentence.length/maxTranLine * w;
      // d.width = w;
    } else {
      var speakerIndex = speakerList.indexOf(captionArray[i][2]);
      if (speakerIndex === -1){
        // uncomment the below to show other speakers as well
        // (apart from the participants)
        /*
        d.y = transScaleY(speakerList.length - 5);
        d.fillColor = transGraphColor;
        d.height = transScaleY(0.9);
        */
      } else {
        d.x = transScaleX(speakerList.length - speakerIndex - 1);
        d.fillColor = speakerColors[speakerIndex];
        d.width = transScaleX(0.9);
      }
    }
    if (constantHeight !== 0){
      d.height = 10;
    } else {
      // var endSec = hmsToSec(captionArray[i][1]);
      var endSec = i+1;
      d.endTime = endSec;
      // var startSec = hmsToSec(captionArray[i][0]);
      var startSec = i;
      var scaledHeight = transcriptScale(endSec - startSec);
      if (scaledHeight < 1){
        d.height = 1;
      } else {
        d.height = scaledHeight;
      };
    }
    d.sentence = senList[i].sentence;
    d.marks = senList[i].marks;
    /*if ( (!($.isEmptyObject(textMetadataObj))) && 
         (showIC) ) {
      d.fillColor = icColorArray[i];
    }*/
    graphData.push(d);
  }

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .direction('w');
  svg.call(tip);

  var rects = svg.selectAll("rect")
  .data(graphData).enter()
  .append("rect")
  .attr("id", function (d, i) { return "g-" + graphID + "-" + "rSen" + "-" + i})
  .attr("x", function (d) { return d.x; })
  .attr("y", function (d) { return d.y; })
  .attr("width", function (d) { return d.width; })
  .attr("z", 1)
  .attr("height", function (d) { return d.height; })
  .attr("fill", d.fillColor)
  .on("mouseover", function(d, i){
    // highlight corresponding rectangles
    HighlightRect(this.id, graphID, tip, d, i);

    // highlight corresponding circles
    idList = [];
    d.marks.forEach(function(mark) {
      entityName = mark.entityURI.substring(mark.entityURI.lastIndexOf("/")+1, mark.entityURI.length-1).replace(/%/g, '');
      idList.push("g-" + graphID + "-" + "e" + "-" + entityName);
    });
    HighlightCircle(idList, graphID);

    // highlight corresponding raw text
    var textId = d3.select(this).attr('id').replace('rSen', 'line');
    d3.select('#'+textId).style('background-color', hoverHighlight);
  })
  .on("mouseout", function(d){
    RecoverRect(this.id, graphID, tip);
    RecoverCircle(graphID, tip);

    // recover corresponding raw text
    var textId = d3.select(this).attr('id').replace('rSen', 'line');
    d3.select('#'+textId).transition().style('background-color', null);
  });

  var fisheye = d3.fisheye.circular().radius(200);
    svg.on('mousemove', function(){
        // implementing fisheye distortion
        fisheye.focus(d3.mouse(this));
        rects.each(function(d) { d.fisheye = fisheye(d); })
             .attr("y", function(d) { return d.fisheye.y; })
             .attr("width", function(d) {
                return d.width * d.fisheye.z;
             })
             .attr("height", function(d) { 
               return d.height * d.fisheye.z; 
             });
    });
    svg.on('mouseleave', function(){
        rects.each(function(d){d.fisheye = fisheye(d);})
             .attr("y", function(d){return d.y;})
             .attr("width", function(d){return d.width;})
             .attr("height", function(d){return d.height;});
    });

}

function drawText(senList, table, graphID) {
  displayLines = [];
  
  for (i=0; i < senList.length; i++) {
    displayLines.push(
      '<tr id="row' + i + '">' +
      '<td style="border: 1px solid ' + transGraphColor + '; ' +
      'border-right: 7px solid ' + transGraphColor + '; ' +
      'color: rgba(100, 100, 100, 1); ' +
      'font-family:Roboto; font-size:13pt; padding: 5px;"' +
      'class="unselectable" id="g-' + graphID + '-' + 'tag-' + i + '">' +
      i + '</td>' +
      '<td id="g-' + graphID + '-' + 'line-' + i + '" ' +
      'class="tdText">' +
      senList[i].sentence + '</td></tr>');
  }

  var tableBody = $('#tableText'+graphID).append('<tbody></tbody>');
  for (var j in displayLines) {
    tableBody.append(displayLines[j]);
  }

  d3.selectAll(".tdText")
    .on("mouseover", function(){
      d3.select(this).style('background-color', hoverHighlight);
      var rectId = d3.select(this).attr('id').replace('line', 'rSen');
      //d3.select('#'+rectId).attr('fill', hoverHighlight);
      HighlightRect(rectId, graphID);
    })
    .on("mouseout", function(){
      d3.select(this).style('background-color', null);
      var rectId = d3.select(this).attr('id').replace('line', 'rSen');
      //d3.select('#'+rectId).attr('fill', transGraphColor);
      RecoverRect(rectId, graphID);
    });
}

function genTipsHtml(data, index) {
  s_html = "<font size=5 color='#FFF'>"+ index +":  </font>";

  plain_start = 0
  plain_end = 0
  text = data.sentence;
  data.marks.forEach(function(mark){
    plain_end = mark.start_char;
    s_html = s_html + text.substring(plain_start, plain_end);
    s_html = s_html + '<span style="background-color:' + colorMap[classDict[mark.category.substring(1, mark.category.length-1)] % colorMap.length] + ' ">' + "<font color='#212529'>" + text.substring(mark.start_char, mark.end_char) + '</font></span>';
    plain_start = mark.end_char;
  });
  s_html = s_html + text.substring(plain_start, text.length);

  return s_html;
}

// abadoned
function doIt(fileName1, fileName2 = null) {
  let svg1 = d3.select("#svgCircles1");

  d3.json(fileName1 + "?nocache=" + (new Date()).getTime(), function (error, data1) {
      data1.children.sort((a,b) => (a.name > b.name ? 1 : -1));
      drawChart(data1, svg1);
      
      if(fileName2) {
          let svg2 = d3.select("#svgCircles2");
          d3.json(fileName2 + "?nocache=" + (new Date()).getTime(), function (error, data2) {
              data2.children.sort((a,b) => (a.name > b.name ? 1 : -1));

              // put the element of data2 at the same position as in data
              children_modified = new Array(data2.children.length).fill(null);
              children_left = []
              data2.children.forEach(element => {
                  index = data1.children.findIndex(child => child.name == element.name)
                  if (index != -1 && index<data2.children.length)    
                      children_modified[index] = element;
                  else
                      children_left.push(element);
              });
              children_left.forEach(element => {
                  index = children_modified.findIndex(child => !child);
                  children_modified[index] = element;
              });
              data2.children = children_modified;

              drawChart(data2, svg2);
          });
      }
  });
}

function genLegend(data, svg) {
  let legendGroup = svg.append("svg")
        .attr("class", "svgLegend");
  var legendVals = d3.scaleOrdinal()
                  .domain(data.children.map(function(v) { return v.name;}));
                  //.domain(Object.keys(classDict).map(function(v) { return v.substring(v.lastIndexOf("/")+1, v.length); }));

  var legend = legendGroup.selectAll('.legend')
  .data(legendVals.domain())
  .enter().append('g')
  .attr("transform", function (d, i) {
    pos_y = (i * 17) + 10; 
    return "translate(10," + pos_y + ")";
  });

  legend.append('rect')
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 15)
  .attr("height", 10)
  .style("fill", function (d, i) {
    return colorMap[classDict[d.substring(1,d.length-1)]%12];
  });

  legend.append('text')
  .attr("x", 20)
  .attr("y", 10)
  //.attr("dy", ".35em")
  .text(function (d, i) {
    return d.substring(d.lastIndexOf("/")+1, d.length-1);;
  })
  .attr("class", "textselected")
  .style("text-anchor", "start")
  .style("font-size", 15);
}

function SemanticZooming_1(bubbletreemap, svg, leafNodes, graphID, contourColor, tip, treeHeight) {
  szLevel = 3 + Math.floor((d3.event.transform.k-1)/szScale);
  szLevel = szLevel<=treeHeight? szLevel : treeHeight;

  // update contours
  let newPath = svg.select("g").select(".contour").selectAll("path")
    .data(bubbletreemap.getContour(szLevel).filter(function(nodes) {
      return nodes.height > 0;
    }));
  newPath.exit().remove();
  newPath.enter().append("path")
    .attr("id", function(d) { return "g-" + graphID + "-" + "c-" + d.name.substring(d.name.lastIndexOf("/")+1, d.name.length-1).replace(/%/g, '');})
    .attr("d", function(arc) { return arc.d; })
    .style("stroke", function(arc) {
        return "black"; // fill
        //return contourColor(arc.depth); // contour
        //return d3.lab(arc.color).darker(2);
    })
    .style("stroke-width", function(arc) { 
        //return 6-arc.depth*0.7; // Thicker outside, thinner inside
        //return 1+arc.depth*0.7; // Thinner outside, thicker inside
        return szStrokeWidth; // fill
    })
    .style("fill-opacity", 0.7) 
    .style("fill", function(arc) {
        //return "white"; // contour
        return contourColor(arc.depth);// fill
    })
    .attr("transform", function(arc) {return arc.transform;})
    .on("mouseover", function(d, i) {
        HighlightPath(this.id, graphID, tip);
    })
    .on("mouseout", function(d, i) {
        RecoverPath(contourColor, this.id, graphID, tip)
    });

  // update circles
  let newCircle = svg.select("g").select(".circlesAfterPlanck").selectAll("circle")
                  .data(leafNodes.filter(function (nodes) {
                    return nodes.depth <= szLevel;
                  }));
  newCircle.exit().remove();
  newCircle.enter().append("circle")
    .attr("id", function(d) { return "g-" + graphID + "-" + "e-" + d.data.name.substring(d.data.name.lastIndexOf("/")+1, d.data.name.length-1).replace(/%/g, '');})
    .attr("r", function(d) { return d.r; })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .style("fill", function(d) { return d.color; })
    .style("stroke",  function(arc) {
        return "black"; // fill
        //return contourColor(arc.depth); // contour
        //return d3.lab(arc.color).darker(2);
    })
    //.style("fill-opacity", 0.7)
    .style("stroke-width", szStrokeWidth)
    .on("mouseover", function(d, i) {
        HighlightCircle([this.id], graphID, tip);

        d.data.location.forEach(function(location) {
          HighlightRect("g-" + graphID + "-" + "rSen-" + location[0], graphID);
        });
    })
    .on("mouseout", function(d, i) {
        RecoverCircle(graphID, tip);

        d.data.location.forEach(function(location) {
          RecoverRect("g-" + graphID + "-" + "rSen-" + location[0], graphID);
        });
    })
    .on("click", function(d, i) {
        ClickCircle(d.data.name, tip);
    });
  }

function HighlightCircle(idList, graphID, tip=null) {
  // Use D3 to select all elements in multiple graph
  circles = d3.selectAll("circle").filter(function(circle) {
    flag = false;
    idList.forEach(function(id){
      specificName = '/' + id.substring(id.lastIndexOf("-")+1, id.length)+'>';
      if (circle.data.name.includes(specificName))
        flag = true;
    });
    return flag;
  });

  // highlight circles in idList
  if (!circles.empty()) {
    circles
    //.style("fill", function(d) {return d3.lab(d.color).darker(2);})
    .style("stroke-width", 1)
    //.style("stroke-dasharray", "3,3")
    //.style("fill", hoverHighlight)
    //.style("stroke", "white")
    .style("stroke", function(d) {return d3.lab(d.color).brighter(1);})
    .style("filter", "url(#glow)");
    //.style("filter", function(d) {return "Glow(Color=" + d.color + ", Strength=255)";})
    //.attr("r", function(d) { return 0; })
    
    circles.nodes().forEach(function(d) {
      if(tip!=null && !circleClicked) {
        labelText = d.id.substring(d.id.lastIndexOf("-")+1, d.id.length);
        tip.html(labelText).show();
      }
    })
  }

  // fade out other circles
  otherCircles = d3.selectAll("circle").filter(function(circle) {
    flag = true;
    idList.forEach(function(id){
      specificName = '/' + id.substring(id.lastIndexOf("-")+1, id.length)+'>';
      if (circle.data.name.includes(specificName))
        flag = false;
    });
    return flag;
  });
  if (!otherCircles.empty())
    //otherCircle.style("fill", transGraphColor);
    otherCircles.style("opacity", 0.1);
}

function RecoverCircle(graphID, tip) {
  // recover all circles
  d3.selectAll("circle")
    .style("fill", function(d) { return d.color;})
    .style("stroke", "black")
    .style("stroke-width", szStrokeWidth)
    .style("stroke-dasharray", null)
    .style("filter", null)
    .style("opacity", 1);

  if(tip!=null && !circleClicked) {
    tip.hide();
  }
}

function ClickCircle(uri, tip) {
  labelText = "<div>" + uri.substring(uri.lastIndexOf("/")+1, uri.length-1) + "</div>";
  labelText += '<a href="' + uri.substring(1, uri.length-1) + '">Read more</link>';
  console.log(labelText);
  tip.html(labelText).show();
  circleClicked = true;
}

function HighlightPath(id, graphID, tip){
  // Use D3 to select all elements in multiple graph
  paths = d3.selectAll("path").filter(function(path) {
    specificName = '/' + id.substring(id.lastIndexOf("-")+1, id.length)+'>';
    if (path.name.includes(specificName))
      return true;
    else
      return false;
  });
  paths.style("fill-opacity", 0.7) 
  .style("fill", function(arc) {return d3.lab(arc.color).darker(1);})
  //.style("fill", function(arc) { return d3.rgb(contourColor(arc.depth)).darker(2);})
  //.style("stroke", function(arc) {return d3.lab(arc.color).brighter(1);})
  .style("stroke-width", szStrokeWidth+1);
  
  if(tip!=null && !circleClicked) {
    labelText = id.substring(id.lastIndexOf("-")+1, id.length);
    tip.html(labelText).show();
  }
}

function RecoverPath(contourColor, id, graphID, tip) {
  // Use D3 to select all elements in multiple graph
  paths = d3.selectAll("path").filter(function(path) {
    specificName = '/' + id.substring(id.lastIndexOf("-")+1, id.length)+'>';
    if (path.name.includes(specificName))
      return true;
    else
      return false;
  });
  paths.style("fill-opacity", 0.7) // fill:1.0 contour:0.0
  //.style("fill", "white") // contour
  .style("fill", function(arc) { return contourColor(arc.depth);})// fill
  //.style("stroke", function(arc) {return contourColor(arc.depth);})
  .style("stroke-width", szStrokeWidth); 

  if(tip!=null && !circleClicked)
    tip.hide();
}

function HighlightRect(id, graphID, tip=null, data=null, index=null){
  d3.select("#" + id)
    .attr('fill', hoverHighlight);

  // tip == null: hover over a circle
  // tip != null: hover over a rectangle
  if (tip != null) {
    tip.html(genTipsHtml(data, index)).show();
  }
}

function RecoverRect(id, graphID, tip=null){
  d3.select("#" + id)
    .attr('fill', transGraphColor);

  if (tip) {
    tip.hide();
  }
}