const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// WebGL-Setup
if (!gl) {
    console.error('WebGL wird von diesem Browser nicht unterstützt.');
}

// Shader-Quellen
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Shader erstellen und kompilieren
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Shader-Programm erstellen
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Funktion zum Erzeugen der Weihnachtsbaumgeometrie
function createTreeVertices() {
    const vertices = [];

    // Dreiecke für die "Äste" des Baums
    const layers = 5;
    const layerHeight = 0.3;
    const layerWidth = 0.6;
    for (let i = 1; i <= layers; i++) {
        const y = (layers - i) * layerHeight - 0.4;
        const width = layerWidth * i / layers;
        vertices.push(
            -width, y - layerHeight,   // Linke Ecke des Dreiecks
             width, y - layerHeight,   // Rechte Ecke des Dreiecks
             0.0, y                    // Spitze des Dreiecks
        );
    }

    // Rechteck für den Baumstamm
    const trunkWidth = 0.1;
    const trunkHeight = 0.3;
    vertices.push(
        -trunkWidth, -1.0,              // Linke untere Ecke des Stammes
         trunkWidth, -1.0,              // Rechte untere Ecke des Stammes
         trunkWidth, -1.0 + trunkHeight, // Rechte obere Ecke des Stammes
         
        -trunkWidth, -1.0,              // Linke untere Ecke des Stammes
        -trunkWidth, -1.0 + trunkHeight, // Linke obere Ecke des Stammes
         trunkWidth, -1.0 + trunkHeight  // Rechte obere Ecke des Stammes
    );

    return new Float32Array(vertices);
}

// Baumdaten generieren
const vertices = createTreeVertices();

// Buffer erstellen und binden
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Attribut-Zeiger setzen
const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Farben für die einzelnen Teile des Baums festlegen
const colorLocation = gl.getUniformLocation(program, "u_color");

function drawScene() {
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Grüne Dreiecke (Baumzweige)
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1); // Dunkelgrün
    gl.drawArrays(gl.TRIANGLES, 0, 5 * 3); // 5 Dreiecke mit je 3 Vertices

    // Braunes Rechteck (Baumstamm)
    gl.uniform4f(colorLocation, 0.5, 0.25, 0.1, 1); // Braun
    gl.drawArrays(gl.TRIANGLES, 5 * 3, 6); // Rechteck hat 2 Dreiecke mit insgesamt 6 Vertices
}

drawScene();
