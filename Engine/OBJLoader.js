export class OBJParser {
    constructor() {
      this.vertices = [];
      this.faces = [];
    }
  
    parse(data) {
      const lines = data.split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 0) continue;
  
        switch (parts[0]) {
          case 'v':
            this.vertices.push(
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            );
            break;
  
          case 'f':
            const faceVertices = [];
            for (let i = 1; i < parts.length; i++) {
              const vertexPart = parts[i].split('/')[0]; 
              const vertexIndex = parseInt(vertexPart) - 1;
              faceVertices.push(vertexIndex);
            }
            this.faces.push(faceVertices);
            break;
        }
      }
    }
  
    getVertices() {
      return new Float32Array(this.vertices);
    }
  
    getFaces() {
      return this.faces;
    }
  }

export async function modelFileLoader(file) {
  return fetch(file)
  .then(responce => responce.text())
  .then(responce => responce)
  .catch(error => console.error(error));
}
