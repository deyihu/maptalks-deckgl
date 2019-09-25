import * as maptalks from 'maptalks';
import * as deck from 'deck.gl';

const options = {
    'container': 'front',
    'renderer': 'dom',
    'zoomOffset': 0
};


export class DeckGLLayer extends maptalks.Layer {
    // getDeckGL() {
    //     const render = this._getRenderer();
    //     if (render) {
    //         return render.deckgl;
    //     }
    // }

    setProps(props) {
        const render = this._getRenderer();
        this.props = maptalks.Util.extend({}, props);
        let options = this._initDeckOption(props);
        if (render) {
            render.deckgl.setProps(options);
        }
        return this;
    }

    // onAdd() {
    //     let self = this;
    //     function animimation() {
    //         const render = self._getRenderer();
    //         if (render) {
    //             // render.sync();
    //         }
    //         self.syncAnimation = requestAnimationFrame(animimation);
    //     }
    //     animimation();
    // }

    onRemove() {
        if (this.syncAnimation) cancelAnimationFrame(this.syncAnimation);
        const render = this._getRenderer();
        if (render) {
            render.deckgl.finalize();
        }
        super.onRemove();
    }

    setOpacity(opacity) {
        const render = this._getRenderer();
        if (render) {
            const container = render._container;
            container.style.opacity = opacity;
        }
        return this;
    }

    getOpacity() {
        const render = this._getRenderer();
        if (render) {
            const container = render._container;
            return Math.min(1, parseFloat(container.style.opacity));
        }
        return 0;
    }

    setZIndex(z) {
        const render = this._getRenderer();
        if (render) {
            const container = render._container;
            container.style.zIndex = z;
        }
        return this;
    }

    getZIndex() {
        const render = this._getRenderer();
        if (render) {
            const container = render._container;
            if (container)
                return container.style.zIndex;
        }
        return 0;
    }

    show() {
        const render = this._getRenderer();
        if (render) {
            render.show();
        }
        return this;
    }

    hide() {
        const render = this._getRenderer();
        if (render) {
            render.hide();
        }
        return this;
    }

    _initDeckOption(options = {}) {
        const layers = options.layers || [];
        let newLayers = [];
        layers.forEach(element => {
            newLayers.push(this._getDeckLayer(element));
        });
        options.layers = newLayers;
        return options;
    }

    _getDeckLayer(layer = {}) {
        const type = layer.layerType;
        let options = maptalks.Util.extend({}, layer);
        return new deck[type](options);
    }
}

DeckGLLayer.mergeOptions(options);

export class DeckGLRenderer {

    constructor(layer) {
        this.layer = layer;
    }

    render() {
        if (!this._container) {
            this._createLayerContainer();
        }
        this.sync();
        this.layer.fire('layerload');

    }

    drawOnInteracting() {
        this.sync();
    }

    sync() {
        const props = this.getView();
        if (this.deckgl) {
            if (this.deckgl.setProps) {
                this.deckgl.setProps({ viewState: maptalks.Util.extend({}, props) });
            }
        }
    }

    needToRedraw() {
        const map = this.getMap();
        const renderer = map._getRenderer();
        return map.isInteracting() || renderer && (renderer.isStateChanged && renderer.isStateChanged() || renderer.isViewChanged && renderer.isViewChanged());
    }

    getMap() {
        return this.layer.getMap();
    }

    _isVisible() {
        return this._container && this._container.style.display === '';
    }

    show() {
        if (this._container) {
            this._container.style.display = '';
        }
    }

    hide() {
        if (this._container) {
            this._container.style.display = 'none';
        }
    }

    setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    }

    getZIndex() {
        return this._zIndex || 0;
    }

    remove() {
        this._removeLayerContainer();
    }

    isCanvasRender() {
        return false;
    }

    initDeckGL() {
        const deckOption = {
            canvas: this._container.firstChild
        };
        const options = maptalks.Util.extend({}, deckOption, { viewState: this.getView() });
        this.deckgl = new deck.Deck(options);
        const layer = this.layer;
        if (layer && layer.props) {
            layer.setProps(layer.props);
        }
    }



    _createLayerContainer() {
        const container = this._container = maptalks.DomUtil.createEl('div');
        const canvas = document.createElement('canvas');
        canvas.getContext('webgl2', { preserveDrawingBuffer: true })
        container.appendChild(canvas);

        container.style.cssText = 'position:absolute;left:0px;top:0px;opacity:1;';
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        const parentContainer = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parentContainer.appendChild(container);
        if (!this.deckgl) this.initDeckGL();
    }

    _removeLayerContainer() {
        if (this._container) {
            maptalks.DomUtil.removeDomNode(this._container);
        }
        delete this._levelContainers;
    }

    _resetContainer() {
        const size = this.getMap().getSize();
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
        const canvas = this._container.firstChild;
        canvas.width = '100%';
        canvas.height = '100%'
        this.sync();
    }


    getEvents() {
        return {
            // '_zoomstart': this.onZoomStart,
            // '_zoomend': this.onZoomEnd,
            // '_zooming': this.onZoomEnd,
            // '_dragrotatestart': this.onDragRotateStart,
            // '_dragrotateend': this.onDragRotateEnd,
            // '_movestart': this.onMoveStart,
            // '_moving': this.onMoveStart,
            // '_moveend': this.onMoveEnd,
            '_resize': this._resetContainer
        };
    }

    getView() {
        const map = this.getMap();
        const zoomOffset = this.layer.options.zoomOffset;
        // const res = map.getResolution();
        const center = map.getCenter(), zoom = map.getZoom(), bearing = map.getBearing(), pitch = map.getPitch(), maxZoom = map.getMaxZoom();
        // const size = map.getSize();
        return {
            longitude: center.x,
            latitude: center.y,
            zoom: getMapBoxZoom(map.getResolution()) - zoomOffset,
            maxZoom: maxZoom - 1,
            pitch: pitch,
            bearing: bearing,
            width: '100%',
            height: '100%'
        };
    }
}

const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));
function getMapBoxZoom(res) {
    return 19 - Math.log(res / MAX_RES) / Math.LN2;
}
DeckGLLayer.registerRenderer('dom', DeckGLRenderer);
