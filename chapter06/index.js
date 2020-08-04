var gl = null

var points = []
var normals = []
var index = 0

var numTimesToSubdivide = 5

var va = vec4(0.0, 0.0, -1, 1)
var vb = vec4(0.0, 0.942809, 0.333333, 1)
var vc = vec4(-0.816497, -0.471405, 0.333333, 1)
var vd = vec4(0.816497, -0.471405, 0.333333, 1)

var eye
var at = vec3(0.0, 0.0, 0.0)
var up = vec3(0.0, 1.0, 0.0)

var near = -10
var far = 10
var radius = 1.5
var theta = 0.0
var phi = 0.0
var dr = (5.0 * Math.PI) / 180.0

var left = -3.0
var right = 3.0
var ytop = 3.0
var bottom = -3.0

var modelViewMatrix, projectionMatrix
var modelViewMatrixLoc, projectionMatrixLoc
var normalMatrix, normalMatrixLoc

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0) // 光源位置

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0) // 环境光
var lightDiffues = vec4(1.0, 1.0, 1.0, 1.0) // 漫反射
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0) // 镜面反射

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0)
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0)
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0)
var materialShininess = 100.0 // 高光系数

var backAmbient, backDiffuse, backSpecular
var emission = vec4(0.0, 0.3, 0.3, 1.0) // 自发光光源

var ambientProduct, diffuseProduct, specularProduct

function triangle(a, b, c) {
    var t1 = subtract(b, a)
    var t2 = subtract(c, a)
    var normal = normalize(cross(t2, t1))
    normal = vec4(normal)
    normal[3] = 0.0

    normals.push(normal, normal, normal)
    points.push(a, b, c)
    index += 3
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {
        var ab = normalize(mix(a, b, 0.5), true)
        var ac = normalize(mix(a, c, 0.5), true)
        var bc = normalize(mix(b, c, 0.5), true)

        divideTriangle(a, ab, ac, count - 1)
        divideTriangle(ab, b, bc, count - 1)
        divideTriangle(bc, c, ac, count - 1)
        divideTriangle(ab, bc, ac, count - 1)
    } else {
        triangle(a, b, c)
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n)
    divideTriangle(d, c, b, n)
    divideTriangle(a, d, b, n)
    divideTriangle(a, c, d, n)
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    eye = vec3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
    )

    modelViewMatrix = lookAt(eye, at, up)
    projectionMatrix = ortho(left, right, bottom, ytop, near, far)

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ]

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix))

    // gl.drawArrays(gl.TRIANGLES, 0, points.length)
    for (var i = 0; i < index; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3)
    }
    window.requestAnimFrame(render)
}

function bindEvents() {
    document.getElementById('IncreaseR').onclick = function () {
        radius *= 2.0
    }
    document.getElementById('DecreaseR').onclick = function () {
        radius *= 0.5
    }
    document.getElementById('IncreaseT').onclick = function () {
        theta += dr
    }
    document.getElementById('DecreaseT').onclick = function () {
        theta -= dr
    }
    document.getElementById('IncreaseP').onclick = function () {
        phi += dr
    }
    document.getElementById('DecreaseP').onclick = function () {
        phi -= dr
    }
    document.getElementById('IncreaseSubdivisions').onclick = function () {
        numTimesToSubdivide++
        index = 0
        points = []
        normals = []
        init()
    }
    document.getElementById('DecreaseSubdivisions').onclick = function () {
        if (numTimesToSubdivide > 0) numTimesToSubdivide--
        index = 0
        points = []
        normals = []
        init()
    }
}

function init() {
    canvas = document.getElementById('canvas')
    gl = WebGLUtils.setupWebGL(canvas)
    if (!gl) {
        console.log('WebGL is not available')
        return
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    gl.enable(gl.DEPTH_TEST)

    var program = initShaders(gl, 'vertex-shader', 'fragment-shader')
    gl.useProgram(program)

    ambientProduct = mult(lightAmbient, materialAmbient)
    diffuseProduct = mult(lightDiffues, materialDiffuse)
    specularProduct = mult(lightSpecular, materialSpecular)

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide)

    var nBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW)

    var vNormal = gl.getAttribLocation(program, 'vNormal')
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vNormal)

    var pBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)

    var vPosition = gl.getAttribLocation(program, 'vPosition')
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix')
    projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix')
    normalMatrixLoc = gl.getUniformLocation(program, 'normalMatrix')

    gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), flatten(ambientProduct))
    gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), flatten(diffuseProduct))
    gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), flatten(specularProduct))
    gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), flatten(lightPosition))
    gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess)

    bindEvents()

    render()
}

window.onload = init
