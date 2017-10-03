System.import('./build/ts/d3wasm.js')
  .then(({d3wasm}) => {

    var canvas = document.querySelector("canvas"),
      context = canvas.getContext("2d"),
      width = canvas.width,
      height = canvas.height;


    const simulation = d3wasm.forceSimulation(graph.nodes, true)
      .force('charge', d3wasm.manyBody());

    function ticked() {
      console.log('tick');
      simulation.tick();
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2 + 40);
  
      // context.beginPath();
      // graph.links.forEach(drawLink);
      // context.strokeStyle = "#aaa";
      // context.stroke();
  
      context.beginPath();
      graph.nodes.forEach(drawNode);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();
  
      context.restore();
    }
  
  
    function drawLink(d) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }
  
    function drawNode(d) {
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
  
    setInterval(ticked, 100);
    ticked();
    
  });

