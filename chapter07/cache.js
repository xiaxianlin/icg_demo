var canvas
var gl

var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)]
var vertices = [vec2(-0.5, -0.5), vec2(-0.5, 0.5), vec2(0.5, 0.5), vec2(0.5, 0.5), vec2(0.5, -0.5), vec2(-0.5, -0.5)]
var pointsArray = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)]

var program1, program2
var texture1

var framebuffer, renderbuffer

function init() {
    canvas = document.getElementById('canvas')
    gl = WebGLUtils.setupWebGL(canvas)
    if (!gl) {
        return console.log('WebGL is not available')
    }

    texture1 = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture1)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindTexture(gl.TEXTURE_2D, null)

    framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    renderbuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0)

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        return console.log('Frame Buffer Not Complete')
    }

    program1 = initShaders(gl, 'vertex-shader1', 'fragment-shader1')
    program2 = initShaders(gl, 'vertex-shader2', 'fragment-shader2')

    gl.useProgram(program1)

    var buffer1 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)

    var vPosition = gl.getAttribLocation(program1, 'vPosition')
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    gl.viewport(0, 0, 64, 64)
    gl.clearColor(0.5, 0.5, 0.5, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)

    gl.disableVertexAttribArray(vPosition)
    gl.useProgram(program2)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture1)

    var buffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2)
    gl.bufferData(gl.ARRAY_BUFFER, new flatten(vertices), gl.STATIC_DRAW)

    var vPosition = gl.getAttribLocation(program2, 'vPosition')
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    var buffer3 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer3)
    gl.bufferData(gl.ARRAY_BUFFER, new flatten(texCoord), gl.STATIC_DRAW)

    var vTexCoord = gl.getAttribLocation(program2, 'vTexCoord')
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vTexCoord)

    gl.uniform1i(gl.getUniformLocation(program2, 'textture'), 0)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.viewport(0, 0, 512, 512)

    render()
}

function render() {
    gl.clearColor(0.0, 0.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

window.onload = init
