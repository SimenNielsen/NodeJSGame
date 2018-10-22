
export default class CollisionObject {

    constructor(mesh, dynamic) {

        this.mesh = mesh;
        this.dynamic = (dynamic == null) ? false : true;

        this._onIntersect = null;

    }

    setOnIntersectListener(listener) {
        this._onIntersect = listener;
    }
}