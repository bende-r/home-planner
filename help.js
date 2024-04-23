function openPopup() {
  document.getElementById("test").style.display = "block";
}

function closePopup() {
  document.getElementById("test").style.display = "none";
}

function requestCORSIfNotSameOrigin(img, url) {
  if (new URL(url).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}

function getTexture(image_URL) {
  var image = new Image();
  image["webGLTexture"] = false;
  requestCORSIfNotSameOrigin(image, image_URL);

  image.onload = function (e) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    image["webGLTexture"] = texture;
  };

  image.src = image_URL;

  return image;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read_prop(obj, prop) {
  return obj[prop];
}

/**
 * The function used to display the menu with the objects when clicking on the menu on the left side.
 **/
function openFurniture(roomStyle) {
  if (roomStyle == 1) {
    if (document.getElementById("bedroom").style.display == "block")
      document.getElementById("bedroom").style.display = "none";
    else document.getElementById("bedroom").style.display = "block";
  } else if (roomStyle == 2) {
    if (document.getElementById("living-room").style.display == "block")
      document.getElementById("living-room").style.display = "none";
    else document.getElementById("living-room").style.display = "block";
  } else if (roomStyle == 3) {
    if (document.getElementById("kitchen").style.display == "block")
      document.getElementById("kitchen").style.display = "none";
    else document.getElementById("kitchen").style.display = "block";
  } else if (roomStyle == 4) {
    if (document.getElementById("decor").style.display == "block")
      document.getElementById("decor").style.display = "none";
    else document.getElementById("decor").style.display = "block";
  } else if (roomStyle == 5) {
    if (document.getElementById("office").style.display == "block")
      document.getElementById("office").style.display = "none";
    else document.getElementById("office").style.display = "block";
  } else if (roomStyle == 6) {
    if (document.getElementById("childroom").style.display == "block")
      document.getElementById("childroom").style.display = "none";
    else document.getElementById("childroom").style.display = "block";
  }
}

//The function for the button to set the view on top
function topView() {
  angle = 0.0;
  elevation = -90.0;
}

//The function for the button to reset the view
function resetView() {
  elevation = -25;
  angle = -15;
  lookRadius = 10.0;
}

function checkCollisionColorChange(objectA, objectB) {
  objectACoords = {
    AxisX: utils.makeAxisX(objectA.currentRotation),
    AxisY: utils.makeAxisY(objectA.currentRotation),
    AxisZ: utils.makeAxisZ(objectA.currentRotation),
    u_id: objectA.u_id,
    isRoom: objectA.isRoom,
    Pos: [
      objectA.originX + objectA.currentMoveX,
      objectA.originY + objectA.currentMoveY,
      objectA.originZ + objectA.currentMoveZ,
    ],
    Half_size: {
      x: 0.5 * objectA.x * objectA.currentScale,
      y: 0.5 * objectA.y * objectA.currentScale,
      z: 0.5 * objectA.z * objectA.currentScale,
    },
  };

  objectBCoords = {
    AxisX: utils.makeAxisX(objectB.currentRotation),
    AxisY: utils.makeAxisY(objectB.currentRotation),
    AxisZ: utils.makeAxisZ(objectB.currentRotation),
    u_id: objectB.u_id,
    isRoom: objectB.isRoom,
    Pos: [
      objectB.originX + objectB.currentMoveX,
      objectB.originY + objectB.currentMoveY,
      objectB.originZ + objectB.currentMoveZ,
    ],
    Half_size: {
      x: 0.5 * objectB.x * objectB.currentScale,
      y: 0.5 * objectB.y * objectB.currentScale,
      z: 0.5 * objectB.z * objectB.currentScale,
    },
  };

  // if (
  //   !objectACoords.isRoom &&
  //   !objectBCoords.isRoom &&
  //   getCollision(objectACoords, objectBCoords)
  // ) {
  //   let i = loadedObjects.findIndex((item) => item.u_id === objectA.u_id);
  //   let j = loadedObjects.findIndex((item) => item.u_id === objectB.u_id);

  //   loadedObjects[i].isCollided = true;
  //   loadedObjects[j].isCollided = true;
  // } else {
  //   let i = loadedObjects.findIndex((item) => item.u_id === objectA.u_id);
  //   let j = loadedObjects.findIndex((item) => item.u_id === objectB.u_id);

  //   loadedObjects[i].isCollided = false;
  //   loadedObjects[j].isCollided = false;
  // }
  
  const matchingObjectsA = loadedObjects.filter(
    (item) => item.u_id === objectA.u_id
  );
  const matchingObjectsB = loadedObjects.filter(
    (item) => item.u_id === objectB.u_id
  );

  matchingObjectsA.forEach((obj) => {
    obj.isCollided = false; // Сбросить флаг для всех объектов с u_id === objectA.u_id
  });

  matchingObjectsB.forEach((obj) => {
    obj.isCollided = false; // Сбросить флаг для всех объектов с u_id === objectB.u_id
  });

  if (
    !objectA.isRoom &&
    !objectB.isRoom &&
    getCollision(objectACoords, objectBCoords)
  ) {
    matchingObjectsA.forEach((obj) => {
      obj.isCollided = true; // Установить флаг для всех объектов с u_id === objectA.u_id
    });

    matchingObjectsB.forEach((obj) => {
      obj.isCollided = true; // Установить флаг для всех объектов с u_id === objectB.u_id
    });
  }
}

// function checkCollisionColorChange1(objectId, objectB) {
//   for (i = 0; i < loadedObjects.length; i++) {
//     objectA = {
//       AxisX: utils.makeAxisX(loadedObjects[i].currentRotation),
//       AxisY: utils.makeAxisY(loadedObjects[i].currentRotation),
//       AxisZ: utils.makeAxisZ(loadedObjects[i].currentRotation),
//       u_id: loadedObjects[i].u_id,
//       isRoom: loadedObjects[i].isRoom,
//       Pos: [
//         loadedObjects[i].originX + loadedObjects[i].currentMoveX,
//         loadedObjects[i].originY + loadedObjects[i].currentMoveY,
//         loadedObjects[i].originZ + loadedObjects[i].currentMoveZ,
//       ],
//       Half_size: {
//         x: 0.5 * loadedObjects[i].x * loadedObjects[i].currentScale,
//         y: 0.5 * loadedObjects[i].y * loadedObjects[i].currentScale,
//         z: 0.5 * loadedObjects[i].z * loadedObjects[i].currentScale,
//       },
//     };

//     if (
//       objectA.u_id != objectId &&
//       !objectA.isRoom &&
//       !objectA.isSolid &&
//       getCollision(objectA, objectB)
//     ) {
//       loadedObjects[i].isCollided = true;
//       currentControlledObject.isCollided = true;
//     } else {
//       loadedObjects[i].isCollided = false;
//       currentControlledObject.isCollided = false;
//     }
//   }

//   // Восстанавливаем цвета объектов, если столкновений не было
//   if (collisionColorObjects.length === 0) {
//     loadedObjects.forEach((obj) => {
//       obj.diffuseColor = obj.originalColor;
//     });
//   }

//   collisionColorObjects = [];
// }

//The button used to disable or enable collision

function disableCollision() {
  if (collisionDisabled == false) {
    collisionDisabled = true;
    document.getElementById("disable-collision").innerHTML = "enable collision";
  } else if (collisionDisabled == true) {
    collisionDisabled = false;
    document.getElementById("disable-collision").innerHTML =
      "disable collision";
  }
}

function radToDeg(r) {
  return (r * 180) / Math.PI;
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

//Called when the slider for texture influence is changed
function updateTextureInfluence(val) {
  textureInfluence = val;
}

function updateLightType(val) {
  currentLightType = parseInt(val);
}

// function updateShader(val) {
//   currentShader = parseInt(val);
// }

function updateAmbientLightInfluence(val) {
  ambientLightInfluence = val;
}

function updateEmitInfluence(val) {
  emitInfluence = val;
}

function updateAmbientLightColor(val) {
  val = val.replace("#", "");
  ambientLightColor[0] = parseInt(val.substring(0, 2), 16) / 255;
  ambientLightColor[1] = parseInt(val.substring(2, 4), 16) / 255;
  ambientLightColor[2] = parseInt(val.substring(4, 6), 16) / 255;
  ambientLightColor[3] = 1.0;
}
