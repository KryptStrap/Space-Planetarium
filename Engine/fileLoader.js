export class OBJParser {
  constructor() {
    this.vertices = [];
    this.texcoords = [];
    this.normals = [];

    this.vertexIndices = [];
    this.texcoordsIndices = [];
    this.normalsIndices = [];

    this.combinedVertices = [];
  }

  parse(data) {
    const lines = data.split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 0) continue;

      switch (parts[0]) {
        case 'v':
          this.vertices.push([
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          ]);
          break;

        case 'vn':
          this.normals.push([
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          ]);
          break;

        case 'vt':
          this.texcoords.push([
            parseFloat(parts[1]),
            parseFloat(parts[2])
          ]);
          break;

        case 'f':
          const faceVertices = [];
          const faceTextures = [];
          const faceNormals = [];
          for (let i = 1; i < parts.length; i++) {
            const [ vIdx, tIdx, nIdx ] = parts[i].split('/').map(item => parseInt(item) - 1);

            faceVertices.push(vIdx);
            faceTextures.push(tIdx);
            faceNormals.push(nIdx);
          }

          this.triangulateFace(faceVertices, faceTextures, faceNormals);
          break;
      }
    }
    
    // Проверка и объединение вершинных данных
    if (this.vertexIndices.length === this.texcoordsIndices.length && this.vertexIndices.length === this.normalsIndices.length) {
      for (let i = 0; i < this.vertexIndices.length; i++) {
        this.combinedVertices.push(
          ...this.vertices[this.vertexIndices[i]],
          ...this.texcoords[this.texcoordsIndices[i]],
          ...this.normals[this.normalsIndices[i]]
        );
      }
    }
  }

  triangulateFace(faceVertices, faceTextures, faceNormals) {
    if (faceVertices.length > 3) {
      for (let i = 1; i < faceVertices.length - 1; i++) {
        this.vertexIndices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
        this.texcoordsIndices.push(faceTextures[0], faceTextures[i], faceTextures[i + 1]);
        this.normalsIndices.push(faceNormals[0], faceNormals[i], faceNormals[i + 1]);
      }
    } else {
      this.vertexIndices.push(...faceVertices);
      this.texcoordsIndices.push(...faceTextures);
      this.normalsIndices.push(...faceNormals);
    }
  }

  getCombinedVertices() {
    return this.combinedVertices.flat();
  }
}

export async function fileReader(filePath) {
  return fetch(filePath)
  .then(responce => responce.text())
  .then(responce => responce)
  .catch(error => console.error(error));
}

export async function imageLoader(imagePath) {
  const image = new Image();
    image.src = imagePath;
    return image;
}