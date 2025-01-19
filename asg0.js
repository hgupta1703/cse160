function main() {
  const canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';  
  ctx.fillRect(0, 0, canvas.width, canvas.height); 
  const drawButton = document.getElementById('draw-button');

 
  drawButton.addEventListener('click', handleDrawEvent);

  function handleDrawEvent() {
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);  

    const v1X = parseFloat(document.getElementById('v1-x-input').value);
    const v1Y = parseFloat(document.getElementById('v1-y-input').value);

    const v2X = parseFloat(document.getElementById('v2-x-input').value);
    const v2Y = parseFloat(document.getElementById('v2-y-input').value);

    const v1 = new Vector3([v1X, v1Y, 0]);
    const v2 = new Vector3([v2X, v2Y, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
  }

  const drawButton_1 = document.getElementById('draw-button-1'); 

 
  drawButton_1.addEventListener('click', handleDrawOperationEvent);

  function handleDrawOperationEvent() {
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';  
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    
    const v1X = parseFloat(document.getElementById('v1-x-input').value);
    const v1Y = parseFloat(document.getElementById('v1-y-input').value);
    const v1 = new Vector3([v1X, v1Y, 0]);

    
    const v2X = parseFloat(document.getElementById('v2-x-input').value);
    const v2Y = parseFloat(document.getElementById('v2-y-input').value);
    const v2 = new Vector3([v2X, v2Y, 0]);

    
    drawVector(v1, "red");
    drawVector(v2, "blue");

   
    const operation = document.getElementById('operation-selector').value;
    const scalar = parseFloat(document.getElementById('scalar-input').value);

    let v3, v4;
    if (operation === 'add') {
      v3 = new Vector3(v1.elements);
      v3.add(v2);
      console.log(v3)
      drawVector(v3, "green");
    } else if (operation === 'sub') {
      v3 = new Vector3(v1.elements);
      v3.sub(v2);
      drawVector(v3, "green");
    } else if (operation === 'mul') {
      v3 = new Vector3(v1.elements);
      v3.mul(scalar);
      v4 = new Vector3(v2.elements);
      v4.mul(scalar);
      drawVector(v3, "green");
      drawVector(v4, "green");
    } else if (operation === 'div') {
      if (scalar !== 0) {
        v3 = new Vector3(v1.elements);
        v3.div(scalar);
        v4 = new Vector3(v2.elements);
        v4.div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
      } else {
        alert('Cannot divide by zero!');
      }
    } else if (operation === 'magnitude') {
      const v1Mag = v1.magnitude();
      const v2Mag = v2.magnitude();
      console.log(`Magnitude v1: ${v1Mag}`);
      console.log(`Magnitude v2: ${v2Mag}`);
    } else if (operation === 'normalize') {
      v1.normalize();
      v2.normalize();
      drawVector(v1, "green");
      drawVector(v2, "green");
    } else if (operation === 'angle'){

      const angle = angleBetween(v1, v2);
      if (angle !== null) {
          console.log(`Angle between vectors: ${angle.toFixed(2)} degrees`);
      }

    } if (operation === 'area') {
      const area = areaTriangle(v1, v2);
      console.log(`Area of the triangle: ${area.toFixed(2)}`);
    }
    
  }

  function areaTriangle(v1, v2) {
    const crossProduct = Vector3.cross(v1, v2);
    const magnitude = crossProduct.magnitude(); 
    const area = magnitude / 2; 
    return area;
  }

  function angleBetween(v1, v2) {
      const dotProduct = Vector3.dot(v1, v2);
      const magnitudeV1 = v1.magnitude();
      const magnitudeV2 = v2.magnitude();

      if (magnitudeV1 === 0 || magnitudeV2 === 0) {
          console.error('Cannot compute the angle with a zero-length vector.');
          return null;
      }    
      const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
      const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta)); 
      const angleRadians = Math.acos(clampedCosTheta);

      const angleDegrees = angleRadians * (180 / Math.PI);
      return angleDegrees;
  }


  function drawVector(v, color) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);

    const scale = 20;
    const x = canvas.width / 2 + v.elements[0] * scale;
    const y = canvas.height / 2 - v.elements[1] * scale;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
