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

var thetaLoc = null
var theta = [0, 0, 0]
var axix = 0
var xAxis = 0
var yAxis = 1
var zAxis = 2

function quad(a, b, c, d) {
    let vertexColors = getColors()
    var indices = [a, b, c, a, c, d]
    for (var i = 0; i < indices.length; ++i) {
        colors.push(vertexColors[indices[i]])
        // colors.push(vertexColors[a])
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
