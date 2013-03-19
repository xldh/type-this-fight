var CanvasBoxClass = Class.extend({
    canvas: null,
    ctx: null,
    layers: null,
    /**
     * @constructor
     * @param {string} canvasId
     * @returns
     */
    init: function (canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (Object.prototype.toString.call(this.canvas)
        !== '[object HTMLCanvasElement]') {
            throw new Error('Canvas element not found with id: "' + canvasId + '"');
        }
        this.ctx = this.canvas.getContext('2d');
    },
    display: function () {
        for (var i = 0, l = this.layers.length; i < l; i++) {
            this.layers[i];
        }
    },
    /**
     * Sets width of the canvas element
     * @param {number} width
     * @returns {CanvasBoxClass}
     */
    setWidth: function (width) {
        this.canvas.width = width;
        return this;
    },
    /**
     * Sets height of the canvas element
     * @param {number} height
     * @ returns {CanvasBoxClass}
     */
     setHeight: function(height) {
        this.canvas.height = height;
        return this;
    }
});
