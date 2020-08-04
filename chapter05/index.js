var gl = null

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

var points = []
var colors = []

var modelViewMatrixLoc = null
var projectionMatrixLoc = null
var modelViewMatrix = null
var projectionMatrix = null

var eye = null
var at = vec3(0.0, 0.0, 0.0)
var up = vec3(0.0, 1.0, 0.0)

var far = 1
var near = -1
var radius = 1
var theta = 0.0
var phi = 0.0

var left = -1.0
var right = 1.0
var ytop = 1.0
var bottom = -1.0

function quad(a, b, c, d) {
    var vertexColors = getColors()
    var indices = [a, b, c, a, c, d]
    for (var i = 0; i < indices.length; ++i) {
        // colors.push(vertexColors[indices[i]])
        colors.push(vertexColors[a])
        points.push(vertices[indices[i]])
    }
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
    gl = WebGLUtils.setupWebGL(document.getElementById('canvas'))
    if (!gl) {
        return console.log("WebGL isn't available")
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    gl.enable(gl.DEPTH_TEST)

    var program = initShaders(gl, 'vertex-shader', 'fragment-shader')
    gl.useProgram(program)

    colorCube()

    var cBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)

    var vColor = gl.getAttribLocation(program, 'vColor')
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vColor)

    var vBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)

    var vPosition = gl.getAttribLocation(program, 'vPosition')
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix')
    projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix')

    document.getElementById('depthSlider').onchange = function () {
        far = event.srcElement.value / 2
        near = -event.srcElement.value / 2
    }
    document.getElementById('radiusSlider').onchange = function () {
        radius = event.srcElement.value
    }
    document.getElementById('thetaSlider').onchange = function () {
        theta = (event.srcElement.value * Math.PI) / 180.0
    }
    document.getElementById('phiSlider').onchange = function () {
        phi = (event.srcElement.value * Math.PI) / 180.0
    }
    document.getElementById('heightSlider').onchange = function () {
        ytop = event.srcElement.value / 2
        bottom = -event.srcElement.value / 2
    }
    document.getElementById('widthSlider').onchange = function () {
        right = event.srcElement.value / 2
        left = -event.srcElement.value / 2
    }

    render()
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi))

    modelViewMatrix = lookAt(eye, at, up)

    projectionMatrix = ortho(left, right, bottom, ytop, near, far)

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

    gl.drawArrays(gl.TRIANGLES, 0, 36)
    requestAnimationFrame(render)
}

window.onload = init
