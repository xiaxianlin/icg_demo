var gl = null

var pointsArray = []
var colorsArray = []

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
]
var vertexColros = getColors()

var thetaLoc = null
var theta = [45.0, 45.0, 45.0]
var axix = 0
var xAxis = 0
var yAxis = 1
var zAxis = 2

var texCoordsArray = []
var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)]

// Create a checkerboard pattern using floats
var texSize = 64
var image1 = new Array()

for (var i = 0; i < texSize; i++) {
    image1[i] = new Array()
}

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        image1[i][j] = new Float32Array(4)
    }
}

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var c = ((i & 0x8) == 0) ^ ((j & 0x8) == 0)
        image1[i][j] = [c, c, c, 1]
    }
}

// Convert floats to ubytes for texture
var image2 = new Uint8Array(4 * texSize * texSize)
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        for (var k = 0; k < 4; k++) {
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k]
        }
    }
}
function configureTexture(image) {
    var texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[0])

    pointsArray.push(vertices[b])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[1])

    pointsArray.push(vertices[c])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[2])

    pointsArray.push(vertices[a])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[0])

    pointsArray.push(vertices[c])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[2])

    pointsArray.push(vertices[d])
    colorsArray.push(vertexColros[a])
    texCoordsArray.push(texCoord[3])
}

function colorCube() {
    quad(1, 0, 3, 2) // 前面
    quad(2, 3, 7, 6) // 左面
    quad(3, 0, 4, 7) // 下面
    quad(6, 5, 1, 2) // 上面
    quad(4, 5, 6, 7) // 后面
    quad(5, 4, 0, 1) // 右面
}

function init() {
    canvas = document.getElementById('canvas')
    gl = WebGLUtils.setupWebGL(canvas)
    if (!gl) {
        return console.log('WebGL is not available')
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    gl.enable(gl.DEPTH_TEST)

    var program = initShaders(gl, 'vertex-shader', 'fragment-shader')
    gl.useProgram(program)

    colorCube()

    var cBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW)
    var vColor = gl.getAttribLocation(program, 'vColor')
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vColor)

    var pBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)
    var vPosition = gl.getAttribLocation(program, 'vPosition')
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    var tBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW)
    var vTexCoord = gl.getAttribLocation(program, 'vTexCoord')
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vTexCoord)

    configureTexture(image2)

    thetaLoc = gl.getUniformLocation(program, 'theta')

    document.getElementById('RotateX').onclick = () => (axix = xAxis)
    document.getElementById('RotateY').onclick = () => (axix = yAxis)
    document.getElementById('RotateZ').onclick = () => (axix = zAxis)

    render()
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    theta[axix] += 1.0

    gl.uniform3fv(thetaLoc, theta)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
    requestAnimationFrame(render)
}

window.onload = init
