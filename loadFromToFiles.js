function saveToFile() {
  const dataToSave = JSON.stringify(loadedObjects, 2);
  const blob = new Blob([dataToSave], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "saved_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const contents = e.target.result;
    var parsedData = JSON.parse(contents, reviver);
    console.log(parsedData);

    for (j = 1; j < parsedData.length; j = j + 1) {
      loadModelparsedData(parsedData[j]);
    }
  };
  reader.readAsText(file);
}

function loadModelparsedData(model) {
  modelName = model.modelName;
  if (!modelName) return false;

  var objectCharacteristics = objectsList[modelName];
  if (!objectCharacteristics) return false;
  var objectWorldMatrix = new Array();
  var projectionMatrix = new Array();
  var diffuseColor = new Array(); //diffuse material colors of objs
  var facesNumber = new Array();
  var specularColor = new Array();
  var diffuseTextureObj = new Array(); //Texture material
  var nTexture = new Array(); //Number of textures per object
  var observerPositionObj = new Array();
  var lightDirectionObj = new Array();
  var lightPositionObj = new Array();
  var vertexBufferObjectId = new Array();
  var indexBufferObjectId = new Array();

  utils.get_json(
    modelsDir + objectCharacteristics.location,
    function (loadedModel) {
      objectModel = loadedModel;
    }
  );

  if (objectCharacteristics.type == room) {
    if (roomLoaded) {
      alert("Room already loaded, refresh the page to change room type.");
      return;
    } else {
      roomLoaded = true;
    }
  }
  sceneObjects = objectModel.meshes.length;
  perspectiveMatrix = utils.MakePerspective(
    70,
    gl.canvas.width / gl.canvas.height,
    nearPlane,
    farPlane
  );
  viewMatrix = utils.MakeView(1.5, 1.9, 3.0, 10.0, 30.0);
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  id = id + 1;

  for (i = 0; i < sceneObjects; i++) {
    objectWorldMatrix[i] = new utils.identityMatrix();
    projectionMatrix[i] = new utils.identityMatrix();
    diffuseColor[i] = [1.0, 1.0, 1.0, 1.0];
    specularColor[i] = [1.0, 1.0, 1.0, 1.0];
    observerPositionObj[i] = new Array(3);
    lightDirectionObj[i] = new Array(3);
    lightPositionObj[i] = new Array(3);
  }

  var minVertX = 1110;
  var maxVertX = -111110;
  var minVertY = 1110;
  var maxVertY = -111110;
  var minVertZ = 1110;
  var maxVertZ = -11110;

  for (i = 0; i < sceneObjects; i++) {
    objectWorldMatrix[i] = objectModel.rootnode.children[i].transformation;
    var meshMatIndex = objectModel.meshes[i].materialindex;
    var UVFileNamePropertyIndex = -1;
    var diffuseColorPropertyIndex = -1;
    var specularColorPropertyIndex = -1;
    for (
      n = 0;
      n < objectModel.materials[meshMatIndex].properties.length;
      n++
    ) {
      if (objectModel.materials[meshMatIndex].properties[n].key == "$tex.file")
        UVFileNamePropertyIndex = n;
      if (
        objectModel.materials[meshMatIndex].properties[n].key == "$clr.diffuse"
      )
        diffuseColorPropertyIndex = n;
      if (
        objectModel.materials[meshMatIndex].properties[n].key == "$clr.specular"
      )
        specularColorPropertyIndex = n;
    }

    //*** Getting vertex and normals
    var objVertex = [];
    for (n = 0; n < objectModel.meshes[i].vertices.length / 3; n++) {
      var x = objectModel.meshes[i].vertices[n * 3];
      var y = objectModel.meshes[i].vertices[n * 3 + 1];
      var z = objectModel.meshes[i].vertices[n * 3 + 2];
      objVertex.push(x, y, z);
      //these if's are used to determine how big the object is
      if (x < minVertX) minVertX = x;
      if (x > maxVertX) maxVertX = x;

      if (y < minVertY) minVertY = y;
      if (y > maxVertY) maxVertY = y;

      if (z < minVertZ) minVertZ = z;
      if (z > maxVertZ) maxVertZ = z;
      //used to have the grid at the beginning
      if (objectCharacteristics.type == solid) {
        objVertex.push(0.0, 0.0, 0.0, 0.0, 0.0);
      } else {
        objVertex.push(
          objectModel.meshes[i].normals[n * 3],
          objectModel.meshes[i].normals[n * 3 + 1],
          objectModel.meshes[i].normals[n * 3 + 2]
        );
        if (
          UVFileNamePropertyIndex >= 0 &&
          objectModel.meshes[i].texturecoords
        ) {
          objVertex.push(
            objectModel.meshes[i].texturecoords[0][n * 2],
            1.0 - objectModel.meshes[i].texturecoords[0][n * 2 + 1]
          );
        } else {
          objVertex.push(0.0, 0.0);
        }
      }
    }

    facesNumber[i] = objectModel.meshes[i].faces.length;
    console.log("Face Number: " + facesNumber[i]);

    if (UVFileNamePropertyIndex >= 0) {
      nTexture[i] = true;
      console.log(
        objectModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex]
          .value
      );
      imageName =
        objectModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex]
          .value;
      imageName =
        objectCharacteristics.location.split("/")[0] + "/" + imageName;
      diffuseTextureObj[i] = getTexture(modelsDir + imageName);
    } else {
      nTexture[i] = false;
    }
    //*** mesh color
    diffuseColor[i] =
      objectModel.materials[meshMatIndex].properties[
        diffuseColorPropertyIndex
      ].value; // diffuse value

    diffuseColor[i].push(1.0); // Alpha value added

    specularColor[i] =
      objectModel.materials[meshMatIndex].properties[
        specularColorPropertyIndex
      ].value;
    //  console.log("Specular: " + specularColor[i]);
    vertexBufferObjectId[i] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertex), gl.STATIC_DRAW);

    //Creating index buffer
    facesData = [];
    for (n = 0; n < objectModel.meshes[i].faces.length; n++) {
      facesData.push(
        objectModel.meshes[i].faces[n][0],
        objectModel.meshes[i].faces[n][1],
        objectModel.meshes[i].faces[n][2]
      );
    }
    indexBufferObjectId[i] = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(facesData),
      gl.STATIC_DRAW
    );
  }

  loadedObjects.push({
    u_id: id,
    modelName: modelName,
    isRoom: objectCharacteristics.type == room,
    isFurniture: objectCharacteristics.type == furniture,
    isSolid: objectCharacteristics.type == solid,
    sceneObjects: sceneObjects,

    objectWorldMatrix: model.objectWorldMatrix,
    projectionMatrix: model.projectionMatrix,
    diffuseColor: model.diffuseColor,
    originalColor: model.originalColor,

    facesNumber: facesNumber,

    specularColor: model.specularColor,

    diffuseTextureObj: diffuseTextureObj,
    nTexture: nTexture,

    observerPositionObj: model.observerPositionObj,
    lightDirectionObj: model.lightDirectionObj,
    lightPositionObj: model.lightPositionObj,

    vertexBufferObjectId: vertexBufferObjectId,
    indexBufferObjectId: indexBufferObjectId,

    currentRotation: model.currentRotation,
    currentScale: model.currentScale,
    currentMoveZ: model.currentMoveZ,
    currentMoveY: model.currentMoveY,
    currentMoveX: model.currentMoveX,
    x: model.x,
    y: model.y,
    z: model.z,
    originX: model.originX,
    originY: model.originY,
    originZ: model.originZ,
    isCollided: false,
    isSelected: false,
  });
}

// Функция replacer для сериализации объектов с WebGLBuffer
function replacer(key, value) {
  if (value instanceof WebGLBuffer) {
    // Преобразование WebGLBuffer в строку или другую форму
    return { type: "WebGLBuffer", data: "<WebGLBuffer data>" };
  }
  return value;
}

// Функция reviver для восстановления WebGLBuffer из строки
function reviver(key, value) {
  if (value && typeof value === "object" && value.type === "WebGLBuffer") {
    // Произвести восстановление WebGLBuffer из строки или другой формы
    return "<WebGLBuffer data>";
  }
  return value;
}
