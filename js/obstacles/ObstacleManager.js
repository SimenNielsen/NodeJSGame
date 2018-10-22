import { vec4 } from '../engine/lib/gl-matrix.js';

import { Mesh, Primitives, PhongMaterial } from '../engine/index.js';
import { CollisionObject } from '../physics/index.js';

export default class ObstacleManager {
    constructor(scene, physicsManager, floorTexture, blockTexture) {

        this.scene = scene;
        this.physicsManager = physicsManager;

        const boxMaterial = new PhongMaterial({
            shininess: 15,
            map: blockTexture
        });

        this.boxPrimitive = Primitives.createBox(boxMaterial);

        const floorMaterial = new PhongMaterial({
            shininess: 3,
            map: floorTexture
        });

        this.planePrimitive = Primitives.createPlane(floorMaterial);

        this.sizeX = 8;
        this.sizeY = 1;
        this.density = 0.0;

        
        this.chunks = [];
        this.nextChunk = null;
        this.currentChunk = null;
        this.previousChunk = null;
        
        this.viewDist = 15;
        
        this.reset();
    }

    generateChunk(offset, spawnBlocks) {

        const sizeX = this.sizeX;
        const sizeY = this.sizeY;
        const density = this.density;

        // create the floor:
        const floor = new Mesh([this.planePrimitive]);
        floor.applyScale(sizeX, 1, sizeY);
        floor.applyTranslation(0, -0.5, offset - (sizeY / 2));
        this.scene.add(floor);

        // generate blocks:
                const blocks = [];
        if(spawnBlocks){
        const numberOfBlocks = 1;//Math.floor((sizeX * sizeY) * density);


        const populated = new Map();

        let x = Math.floor(Math.random() * sizeX);
        let y = Math.floor(Math.random() * sizeY);
        
        
        let block = new Mesh([this.boxPrimitive]);
        block.setTranslation(x - (sizeX / 2) + 0.5, 0, (y - (sizeY - 0.5)) + offset);
        this.scene.add(block);

        // add collision object.
        const blockCollisionObject = new CollisionObject(block);
        this.physicsManager.add(blockCollisionObject);

        blocks.push(blockCollisionObject);
        /*for (let i = 0; i < numberOfBlocks; i++) {

            let x = Math.floor(Math.random() * sizeX);
            let y = Math.floor(Math.random() * sizeY);

            while (true) {

                if (populated.has((y * sizeX) + x)) {

                    x = Math.floor(Math.random() * sizeX);
                    y = Math.floor(Math.random() * sizeY);

                } else {
                    break;
                }

            }

            let block = new Mesh([this.boxPrimitive]);
            block.setTranslation(x - (sizeX / 2) + 0.5, 0, (y - (sizeY - 0.5)) + offset);
            this.scene.add(block);

            // add collision object.
            const blockCollisionObject = new CollisionObject(block);
            this.physicsManager.add(blockCollisionObject);

            blocks.push(blockCollisionObject);

        }
        console.log(blocks.length);*/
        }
        return { floor, blocks, offset };

    }

    destroyChunk(chunk) {

        if (chunk !== null) {
            this.scene.remove(chunk.floor);

            for (let block of chunk.blocks) {

                this.scene.remove(block.mesh);
                this.physicsManager.remove(block);

            }
        }

    }

    update(positionZ) {

        const offset = Math.floor(positionZ); // position[2] is the z-component of the position vector.

        if (offset % this.sizeY === 0) {

            if (offset < this.chunks[this.viewDist-1].offset) {
                // the player just entered the next chunk.

                // destroy the previous chunk.
               //this.destroyChunk(this.previousChunk);
                if(offset < this.chunks[this.chunks.length-1].offset-6){
                    this.destroyChunk(this.chunks.pop());
                }
                // create a new next chunk.
                //this.nextChunk = this.generateChunk(offset - this.sizeY);
                this.chunks.unshift(this.generateChunk(offset - (this.sizeY * this.viewDist-1), true));
            }
        }

    }

    reset() {

        if (this.previousChunk !== null) {
            this.destroyChunk(this.previousChunk);
            this.previousChunk = null;
        }

        if (this.currentChunk !== null) {
            this.destroyChunk(this.currentChunk);
            this.currentChunk = null;
        }

        if (this.nextChunk !== null) {
            this.destroyChunk(this.nextChunk);
            this.nextChunk = null;
        }
        for(let i = 0; i < this.chunks.length; i++){
            this.destroyChunk(this.chunks.pop());
        }
        for(let i = -1; i < this.viewDist; i++){
            this.chunks.unshift(this.generateChunk(-this.sizeY * i, false));
        }
        //this.chunks.pop();
        console.log(this.chunks.length);
    }
}