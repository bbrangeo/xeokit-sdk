import {Map} from "../../../utils/Map.js";
import {stats} from "../../../stats.js"
import {Program} from "../../../webgl/Program.js";
import {BatchingPickShaderSource} from "./batchingPickShaderSource.js";

const ids = new Map({});

/**
 * @private
 * @constructor
 */
const BatchingPickRenderer = function (hash, layer) {
    this.id = ids.addItem({});
    this._hash = hash;
    this._scene = layer.model.scene;
    this._useCount = 0;
    this._shaderSource = new BatchingPickShaderSource(layer);
    this._allocate(layer);
};

const renderers = {};

BatchingPickRenderer.get = function (layer) {
    const scene = layer.model.scene;
    const hash = getHash(scene);
    let renderer = renderers[hash];
    if (!renderer) {
        renderer = new BatchingPickRenderer(hash, layer);
        if (renderer.errors) {
            console.log(renderer.errors.join("\n"));
            return null;
        }
        renderers[hash] = renderer;
        stats.memory.programs++;
    }
    renderer._useCount++;
    return renderer;
};

function getHash(scene) {
    return [scene.canvas.canvas.id, "", scene._clipsState.getHash()].join(";")
}

BatchingPickRenderer.prototype.getValid = function () {
    return this._hash === getHash(this._scene);
};

BatchingPickRenderer.prototype.put = function () {
    if (--this._useCount === 0) {
        ids.removeItem(this.id);
        if (this._program) {
            this._program.destroy();
        }
        delete renderers[this._hash];
        stats.memory.programs--;
    }
};

BatchingPickRenderer.prototype.webglContextRestored = function () {
    this._program = null;
};

BatchingPickRenderer.prototype.drawLayer = function (frameCtx, layer) {
    const model = layer.model;
    const scene = model.scene;
    const gl = scene.canvas.gl;
    const state = layer._state;
    if (!this._program) {
        this._allocate(layer);
    }
    if (frameCtx.lastProgramId !== this._program.id) {
        frameCtx.lastProgramId = this._program.id;
        this._bindProgram(frameCtx, layer);
    }
    gl.uniformMatrix4fv(this._uModelMatrix, gl.FALSE, model.worldMatrix);
    this._aPosition.bindArrayBuffer(state.positionsBuf, gl.UNSIGNED_SHORT, false); // TODO: Don't need these params, these are now derived from the buffer.
    frameCtx.bindArray++;
    if (this._aFlags) {
        this._aFlags.bindArrayBuffer(state.flagsBuf, gl.UNSIGNED_BYTE, true);
        frameCtx.bindArray++;
    }
    if (this._aPickColor) {
        this._aPickColor.bindArrayBuffer(state.pickColorsBuf, gl.UNSIGNED_BYTE, true);
        frameCtx.bindArray++;
    }

    state.indicesBuf.bind();
    frameCtx.bindArray++;
    gl.uniform1i(this._uPickMeshIndexBase, frameCtx.pickMeshIndex);
    frameCtx.pickMeshIndex += layer.numObjects;
    gl.drawElements(state.primitive, state.indicesBuf.numItems, state.indicesBuf.itemType, 0);
    frameCtx.drawElements++;
};

BatchingPickRenderer.prototype._allocate = function (layer) {
    var scene = layer.model.scene;
    const gl = scene.canvas.gl;
    const clipsState = scene._clipsState;
    this._program = new Program(gl, this._shaderSource);
    if (this._program.errors) {
        this.errors = this._program.errors;
        return;
    }
    const program = this._program;
    this._uPositionsDecodeMatrix = program.getLocation("positionsDecodeMatrix");
    this._uModelMatrix = program.getLocation("modelMatrix");
    this._uViewMatrix = program.getLocation("viewMatrix");
    this._uProjMatrix = program.getLocation("projMatrix");
    this._uClips = [];
    const clips = clipsState.clips;
    for (var i = 0, len = clips.length; i < len; i++) {
        this._uClips.push({
            active: program.getLocation("clipActive" + i),
            pos: program.getLocation("clipPos" + i),
            dir: program.getLocation("clipDir" + i)
        });
    }
    this._aPosition = program.getAttribute("position");
    this._aPickColor = program.getAttribute("pickColor");
    this._aFlags = program.getAttribute("flags");
    this._uPickMeshIndexBase = program.getLocation("pickMeshIndexBase");
};

BatchingPickRenderer.prototype._bindProgram = function (frameCtx, layer) {
    const scene = this._scene;
    const gl = scene.canvas.gl;
    const program = this._program;
    const clipsState = scene._clipsState;
    const camera = scene.camera;
    const cameraState = camera._state;
    program.bind();
    frameCtx.useProgram++;
    gl.uniformMatrix4fv(this._uViewMatrix, false, frameCtx.pickViewMatrix || cameraState.matrix);
    gl.uniformMatrix4fv(this._uProjMatrix, false, frameCtx.pickProjMatrix || camera.project._state.matrix);
    gl.uniformMatrix4fv(this._uPositionsDecodeMatrix, false, layer._state.positionsDecodeMatrix);
    if (clipsState.clips.length > 0) {
        const clips = scene._clipsState.clips;
        let clipUniforms;
        let uClipActive;
        let clip;
        let uClipPos;
        let uClipDir;
        for (var i = 0, len = this._uClips.length; i < len; i++) {
            clipUniforms = this._uClips[i];
            uClipActive = clipUniforms.active;
            clip = clips[i];
            if (uClipActive) {
                gl.uniform1i(uClipActive, clip.active);
            }
            uClipPos = clipUniforms.pos;
            if (uClipPos) {
                gl.uniform3fv(clipUniforms.pos, clip.pos);
            }
            uClipDir = clipUniforms.dir;
            if (uClipDir) {
                gl.uniform3fv(clipUniforms.dir, clip.dir);
            }
        }
    }
};

export {BatchingPickRenderer};
