import { COMPONENT } from '../lib/constants.js';
import { getMinMax } from './utils.js';

import BufferView from '../mesh/BufferView.js';
import Accessor from '../mesh/Accessor.js';
import Primitive from '../mesh/Primitive.js';

/**
 * Generates a plane, and returns a primitive.
 * 
 * @param {Material} material 
 * @param {integer} mode 
 * @returns {Primitive}
 */
export default (material, mode, dimentions) => {
    if (typeof material === 'undefined') {
        throw Error('A Material-instance must be passed as an argument.');
    }
    let stackAngleStep = Math.PI/(dimentions);
    let sliceAngleStep = (Math.PI*2)/dimentions;

    let points = [];
    //let uvs = []; ???
    let uvs = [];

    for (let i=0; i<dimentions; i++) {
        points.push(vec4(0.0, 0.5, 0.0, 1.0));
        points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep, 0.5));
        points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep, 0.5));
        for (let j=1; j<dimentions-1; j++) {
            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+0), 0.5));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+0), 0.5));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+1), 0.5));

            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+0), 0.5));
            points.push(getCoordinate((i+1)*sliceAngleStep, stackAngleStep*(j+1), 0.5));
            points.push(getCoordinate((i+0)*sliceAngleStep, stackAngleStep*(j+1), 0.5));
        }

        points.push(vec4(0.0,-0.5,0.0,1.0));
        points.push(getCoordinate((i+0)*sliceAngleStep, Math.PI-stackAngleStep, 0.5));
        points.push(getCoordinate((i+1)*sliceAngleStep, Math.PI-stackAngleStep, 0.5));
    }

    let surfaceNormals = generateSurfaceNormals(points);
    
    const bufferView = new BufferView(new Float32Array(points.concat(surfaceNormals, uvs)).buffer);

    const { min, max } = getMinMax(points);

    const attributes = {
        POSITION: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', points.length, 0, min, max),
        NORMAL: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', surfaceNormals.length, points.length * 4),
        TEXCOORD_0: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC2', uvs.length, points.length * 4 + surfaceNormals.length * 4)
    };

    const primitive = new Primitive(attributes, material, null, mode);

    return primitive;
}

/**
 * Generates point on a spheres based on latitude and longitude
 * and a given radius.
 *
 * @param longitude {Number} angle in radians, valid from [0, 2*π)
 * @param latitude {Number} angle in radians, valid from [0, π]
 * @param radius {Number} the radius of the sphere point
 * @returns {vec4} a sphere point
 */
function getCoordinate(longitude, latitude, radius) {
    var y = Math.cos(latitude);
    var x = Math.cos(longitude) * Math.sin(latitude);
    var z = Math.sin(longitude) * Math.sin(latitude);

    return scale(radius, vec4(x, y, z, 1.0));
}

function generateSurfaceNormals(triangleVertices) {
    "use strict";

    // TODO: Move into a utility library
    // TODO: Make a version fitted to indexed vertices
    // TODO: Make a version for generating vertex normals

    if (triangleVertices.length % 3 != 0) {
        console.log("Length of triangleVertices is not a multiple of 3, it is not possible generate complete surface normals");
    }

    var numFaces = Math.floor(triangleVertices.length / 3);

    var surfaceNormals = [];

    for (var i = 0; i < numFaces; ++i) {
        // We need three points to generate a surface.
        var vertex_a = triangleVertices[3*i + 0];
        var vertex_b = triangleVertices[3*i + 1];
        var vertex_c = triangleVertices[3*i + 2];

        var vec_a = subtract(vertex_b, vertex_a);
        var vec_b = subtract(vertex_c, vertex_a);

        var normal_vector = normalize(cross(vec_a, vec_b));

        surfaceNormals.push(normal_vector);
        surfaceNormals.push(normal_vector);
        surfaceNormals.push(normal_vector);
    }

    return surfaceNormals;
}