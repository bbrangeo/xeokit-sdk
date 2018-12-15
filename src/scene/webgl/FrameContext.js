/**
 A **FrameContext** provides rendering context to {{#crossLink "Drawable"}}Drawables{{/crossLink}} as xeokit renders them for a frame.

 @class FrameContext
 @module xeokit
 @submodule webgl
 */
class FrameContext {

    constructor() {
        this.reset();
    }

    /**
     * Called by the renderer before each frame.
     * @private
     */
    reset() {

        /**
         * ID of the last {{#crossLink "webgl.Program"}}{{/crossLink}} that was bound during the current frame.
         * @property lastProgramId
         * @type {Number}
         */
        this.lastProgramId = null;

        /**
         * Whether backfaces are currently enabled during the current frame.
         * @property backfaces
         * @default false
         * @type {Boolean}
         */
        this.backfaces = false;

        /**
         * The vertex winding order for what we currently consider to be a backface during current
         * frame: true == "cw", false == "ccw".
         * @property frontFace
         * @default true
         * @type {Boolean}
         */
        this.frontface = true;

        /**
         * The next available texture unit to bind a {{#crossLink "webgl.Texture"}}{{/crossLink}} to.
         * @defauilt 0
         * @property textureUnit
         * @type {number}
         */
        this.textureUnit = 0;

        /**
         * Performance statistic that counts how many times the renderer has called ````gl.drawElements()```` has been
         * called so far within the current frame.
         * @default 0
         * @property drawElements
         * @type {number}
         */
        this.drawElements = 0;

        /**
         * Performance statistic that counts how many times ````gl.drawArrays()```` has been called so far within
         * the current frame.
         * @default 0
         * @property drawArrays
         * @type {number}
         */
        this.drawArrays = 0;

        /**
         * Performance statistic that counts how many times ````gl.useProgram()```` has been called so far within
         * the current frame.
         * @default 0
         * @property useProgram
         * @type {number}
         */
        this.useProgram = 0;

        /**
         * Statistic that counts how many times ````gl.bindTexture()```` has been called so far within the current frame.
         * @default 0
         * @property bindTexture
         * @type {number}
         */
        this.bindTexture = 0;

        /**
         * Counts how many times the renderer has called ````gl.bindArray()```` so far within the current frame.
         * @defaulr 0
         * @property bindArray
         * @type {number}
         */
        this.bindArray = 0;

        /**
         * Indicates which pass the renderer is currently rendering.
         *
         * See {{#crossLink "Scene/passes:property"}}Scene#passes{{/crossLink}}, which configures how many passes we render
         * per frame, which typically set to ````2```` when rendering a stereo view.
         *
         * @property pass
         * @type {number}
         */
        this.pass = 0;

        /**
         * The 4x4 viewing transform matrix the renderer is currently using when rendering castShadows.
         *
         * This sets the viewpoint to look from the point of view of each {{#crossLink "DirLight"}}{{/crossLink}}
         * or {{#crossLink "PointLight"}}{{/crossLink}} that casts a shadow.
         *
         * @property shadowViewMatrix
         * @type {Float32Array}
         */
        this.shadowViewMatrix = null;

        /**
         * The 4x4 viewing projection matrix the renderer is currently using when rendering shadows.
         *
         * @property shadowProjMatrix
         * @type {Float32Array}
         */
        this.shadowProjMatrix = null;

        /**
         * The 4x4 viewing transform matrix the renderer is currently using when rendering a ray-pick.
         *
         * This sets the viewpoint to look along the ray given to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}
         * when picking with a ray.
         *
         * @property pickViewMatrix
         * @type {Float32Array}
         */
        this.pickViewMatrix = null;

        /**
         * The 4x4 orthographic projection transform matrix the renderer is currently using when rendering a ray-pick.
         *
         * @property pickProjMatrix
         * @type {Float32Array}
         */
        this.pickProjMatrix = null;
    }
}

export {FrameContext};