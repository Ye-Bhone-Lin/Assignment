// Initialize WebGL and set up the canvas
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported!');
}

// Vertex Shader source code
const vertexShaderSource = `
attribute vec3 a_Position; // Input vertex positions
uniform mat4 u_ModelMatrix; // Transformation matrix
void main() {
    gl_Position = u_ModelMatrix * vec4(a_Position, 1.0); // Apply transformations
}
`;

// Fragment Shader source code
const fragmentShaderSource = `
precision mediump float;
uniform vec4 u_Color; // Surface color
void main() {
    gl_FragColor = u_Color; // Set the fragment color
}
`;

// Helper function to create and compile a shader
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Helper function to create a program with vertex and fragment shaders
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// Compile shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Use the created program
gl.useProgram(program);

// Define vertices of a pentagon (polygon with five vertices)
const vertices = new Float32Array([
    0.0,  0.5, 0.0, // Top
    -0.47,  0.15, 0.0, // Top-left
    -0.29, -0.4, 0.0, // Bottom-left
    0.29, -0.4, 0.0, // Bottom-right
    0.47,  0.15, 0.0, // Top-right
]);

// Create a buffer and transfer vertices to the GPU
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Associate vertex positions with the shader program
const a_Position = gl.getAttribLocation(program, 'a_Position');
gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_Position);

// Uniform location for the color
const u_Color = gl.getUniformLocation(program, 'u_Color');

// Uniform location for the transformation matrix
const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');

// Initialize rotation angle
let angle = 0.0;

// Function to draw the scene
function draw() {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the color to red (or change to blue by setting vec4(0.0, 0.0, 1.0, 1.0))
    gl.uniform4f(u_Color, 1.0, 0.0, 0.0, 1.0);

    // Create a rotation matrix
    const radians = (angle * Math.PI) / 180.0;
    const cosB = Math.cos(radians);
    const sinB = Math.sin(radians);
    const modelMatrix = new Float32Array([
        cosB, -sinB, 0.0, 0.0,
        sinB,  cosB, 0.0, 0.0,
        0.0,   0.0,  1.0, 0.0,
        0.0,   0.0,  0.0, 1.0,
    ]);

    // Pass the transformation matrix to the shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);

    // Draw the pentagon
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
}

// Animation loop
function animate() {
    angle += 0.5; // Increment the angle for rotation
    draw();
    requestAnimationFrame(animate); // Recursively call animate
}

// Start the animation
animate();
