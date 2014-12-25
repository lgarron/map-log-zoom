var debug = true;

var dim = 640;
var dimOut = 1024;
var numZoomLevels = 22;

var sqrt2 = Math.sqrt(2);

function loadImages(readyCallback) {
  console.log("Loading images.");

  var images = {};

  var count = 0;
  function join() {
    count++;
    if (count == numZoomLevels) {
      // Use setTimeout to allow the <img>s to load first.
      setTimeout(readyCallback.bind(this, images), 0);
    }
  }

  for (var zoom = 1; zoom <= numZoomLevels; zoom++) {
    var img = document.createElement("img");
    img.addEventListener("load", join);
    // Eiffel Tower: 48.85837,2.294481
    // Trafalgar: 51.508039,-0.128069
    // Times Square: 40.758895,-73.985131
    // Golden Gate: 37.819929,-122.478255
    img.src = "https://maps.googleapis.com/maps/api/staticmap?center=37.819929,-122.478255&zoom=" + zoom + "&size=2048x2048&maptype=satellite";
    document.getElementById("images").appendChild(img);
    images[zoom] = img;
  }
}

function draw(images) {
  console.log("Preparing source canvases.");

  var canvases = {};
  var canvasImageData = {};

  for (var zoom = 1; zoom <= numZoomLevels; zoom++) {
    canvases[zoom] = document.createElement("canvas");
    canvases[zoom].width = dim;
    canvases[zoom].height = dim;

    if (debug) {
      document.getElementById("canvases").appendChild(canvases[zoom]);
    }

    var context = canvases[zoom].getContext("2d");
    context.drawImage(images[zoom], 0, 0, dim, dim);
    canvasImageData[zoom] = context.getImageData(0, 0, dim, dim).data;
  }

  // function getPixel(i, x, y) {
  //   return [
  //     canvasImageData[i][4*(y * dim + x) + 0],
  //     canvasImageData[i][4*(y * dim + x) + 1],
  //     canvasImageData[i][4*(y * dim + x) + 2],
  //     canvasImageData[i][4*(y * dim + x) + 3]
  //   ]
  // }

  console.log("Rendering output canvas.");

  var canvas = document.getElementById("output");
  canvas.width  = dimOut;
  canvas.height = dimOut;
  var context = canvas.getContext("2d");

  for (var y = 0; y < dimOut; y++) {
    for (var x = 0; x < dimOut; x++) {
  // for (var y = dim/2; y < dim/2+1; y++) {
  //   for (var x = dim/2; x < dim; x++) {

      // if (x == 0 && y == 0) {
      //   continue;
      // }

      try {

      var dx = x - (dimOut/2);
      var dy = y - (dimOut/2);
      var distance = Math.sqrt(dx*dx + dy*dy);
      var level = (1 + numZoomLevels * distance / dimOut / sqrt2 * 3);

      var floor = Math.floor(level);
      var frac = level - floor;

      var start = 1/4;
      var end = 3/4;
      var innerDistance = dim/2/sqrt2 * (start + (end - start) * (frac + 1) / 2);
      var outerDistance = dim/2/sqrt2 * (start + (end - start) * (frac + 0) / 2);

      // console.log(level, innerDistance, outerDistance);

      var innerX = Math.floor((dim/2) + innerDistance * (dx / distance));
      var innerY = Math.floor((dim/2) + innerDistance * (dy / distance));
      var outerX = Math.floor((dim/2) + outerDistance * (dx / distance));
      var outerY = Math.floor((dim/2) + outerDistance * (dy / distance));

      var innerR = canvasImageData[numZoomLevels - floor    ][4*(innerY * dim + innerX) + 0];
      var innerG = canvasImageData[numZoomLevels - floor    ][4*(innerY * dim + innerX) + 1];
      var innerB = canvasImageData[numZoomLevels - floor    ][4*(innerY * dim + innerX) + 2];
      var innerA = canvasImageData[numZoomLevels - floor    ][4*(innerY * dim + innerX) + 3];

      var outerR = canvasImageData[numZoomLevels - floor - 1][4*(outerY * dim + outerX) + 0];
      var outerG = canvasImageData[numZoomLevels - floor - 1][4*(outerY * dim + outerX) + 1];
      var outerB = canvasImageData[numZoomLevels - floor - 1][4*(outerY * dim + outerX) + 2];
      var outerA = canvasImageData[numZoomLevels - floor - 1][4*(outerY * dim + outerX) + 3];

      var r = Math.floor(innerR * (1-frac) + outerR * (frac));
      var g = Math.floor(innerG * (1-frac) + outerG * (frac));
      var b = Math.floor(innerB * (1-frac) + outerB * (frac));
      var a = Math.floor(innerA * (1-frac) + outerA * (frac));

      // console.log(r, g, b, a);

      // Fastest way.
      // From http://stackoverflow.com/a/4900656/2846155
      context.fillStyle = "rgba("+r+","+g+","+b+","+a+")";
      context.fillRect(x, y, 1, 1);
      }
      catch (e) {}
    }
  }

}

window.addEventListener("load", function() {
  loadImages(draw);
});