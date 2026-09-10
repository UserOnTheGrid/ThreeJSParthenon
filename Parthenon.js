// Import three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Every measurement of this model is scaled down by 10%

function main(){
    // Make our canvas
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //resizeRendererToDisplaySize(renderer);

    // Set up Camera
    // Frustrum settings
    const fov = 12.5; // Field of View
    const aspect = window.innerWidth / window.innerHeight; // Ratio of view's height and width
    const near = 0.1; // Minimum fov value closest to the camera
    const far = 50; // Maximum fov value farthest from the camera
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(10.12, 0, 23.35);
    camera.rotation.set(0.03, 0.43, -0.01);

    // Apply pointlight settings
    //const lightPlaceholderGeo = new THREE.SphereGeometry(0.2, 5, 5);
    const colorSpotlight = 0xfad505;
    const intensity = 2;
    const distance = 2;
    const torches = new THREE.Group();

    
    // Make the scene
    const scene = new THREE.Scene(); // Scene
    const building = new THREE.Group();

    const posX = 15;
    const posY = 10;
    const posZ = 15;

    // Apply directional light
    const colorMoonlight = 0xdba81d;
    const moonLight = new THREE.DirectionalLight(colorMoonlight, 4);
    //const moonLightPlaceholder = makeSimpleShape(lightPlaceholderGeo, posX, posY, posZ);
    moonLight.position.set(posX, posY, posZ);
    //scene.add(moonLightPlaceholder);
    scene.add(moonLight);

    // -- BUILDING THE PARTHENON --

    // Make Crepidoma (Stepped Platform)
    var base = new THREE.Group();
    var numSteps = 3;
    var stepHeight = 0.0508; // 0.508m
    var baseHeight = stepHeight * numSteps;
    var currentStepHeight = stepHeight;
    var scaleX = 3.1 + 0.45; // 31m
    var scaleZ = 6.95 + 0.3; // 69.5m
    for(var i = 0; i < numSteps; i++){
        const geoStep = new THREE.BoxGeometry(scaleX, stepHeight, scaleZ); // Geometry
        const matStep = makeMaterial("bricks/albedo.png", "bricks/normal.png", "bricks/ao.png", 24, 1);
        const step = makeShape(geoStep, matStep, 0, currentStepHeight, 0);
        base.add(step);
        scaleX-=0.15;
        scaleZ-=0.1;
        currentStepHeight+=stepHeight;
        //console.log("ScaleX: " + scaleX + "\nScaleZ: " + scaleZ);
    }
    building.add(base);

    // Add Cella (Central Chamber)
    const geoCella = new THREE.BoxGeometry(1.92, 1.373, 2.98); // Width = 19.2m | Height = 13.73m | Length = 29.8m
    const matCella = makeMaterial("marble/albedo.png", "marble/normal.png", "marble/ao.png", 4, 4);
    var cella = makeShape(geoCella, matCella, 0, baseHeight + (1.373 / 2), 0); // y is not 0 so that the Cella rests on the Crepidoma
    building.add(cella);

    // Add Columns
    var totalColumns = new THREE.Group();
    // Add Outer Columns (8 x 17)
    var outerColumns = new THREE.Group();
    var horizontalColumns = 8;
    var verticalColumns = 17;
    var columnRadius = 0.095; // 0.95m
    var columnHeight = 1.04; // 10.4m
    var currX = 0;
    const geoCol = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 15);
    const matCol = makeMaterial("pillar/albedo.jpg", "pillar/normal.png", "pillar/ao.jpg", 1, 1);
    // Column placement is automatically determined through a for loop
    for(var x = 0; x < horizontalColumns; x++){
        // Measurements of column placement is generally x - parthenonWidth / 2 and y - parthenonLength / 2
        // The denominator is slightly tweaked to further refine placement
        var columnFront = makeShape(geoCol, matCol, currX - (3.1/2.05), baseHeight + (1.04 / 2), 6.95 - (6.95/1.965));
        var columnBack = makeShape(geoCol, matCol, -(currX - (3.1/2.05)), baseHeight + (1.04 / 2), -(6.95 - (6.95/1.965)));
        if (x > 0 && x < horizontalColumns - 1){
            const pointLightFront = new THREE.PointLight(colorSpotlight, intensity, distance);
            var offsetZ = (6.95 - (6.95/1.965)) - (columnRadius * 2);
            //const lightPlaceholderFront = makeSimpleShape(lightPlaceholderGeo, currX - (3.1/2.05), baseHeight * 3, offsetZ);
            pointLightFront.position.set(currX - (3.1/2.05), baseHeight * 2, offsetZ);
            //scene.add(lightPlaceholderFront);
            torches.add(pointLightFront);
            const pointLightBack = new THREE.PointLight(colorSpotlight, intensity, distance);
            //const lightPlaceholderBack = makeSimpleShape(lightPlaceholderGeo, currX - (3.1/2.05), baseHeight * 3, -offsetZ);
            pointLightBack.position.set(currX - (3.1/2.05), baseHeight * 2, -offsetZ);
            //scene.add(lightPlaceholderBack);
            torches.add(pointLightBack);
        }
        // Column spacing (2.243m) is determined based on the relationship between the diameter of columns, the number of columns, and the Parthenon's width
        currX += (0.2243 * 1.925); // Ditto for column space
        outerColumns.add(columnFront);
        outerColumns.add(columnBack);
    }
    var currY = (0.2325 * 2.05);
    for(var y = 0; y < verticalColumns - 2; y++){
        var columnFront = makeShape(geoCol, matCol, -(3.1 - (3.1/1.95)), baseHeight + (1.04 / 2), -(currY - (6.95/1.965)));
        var columnBack = makeShape(geoCol, matCol, (3.1 - (3.1/1.95)), baseHeight + (1.04 / 2), (currY - (6.95/1.965)));
        if (y < verticalColumns){
            const pointLightRight = new THREE.PointLight(colorSpotlight, intensity, distance);
            var offsetX = (3.1 - (3.1/1.95)) - (columnRadius * 2);
            //const lightPlaceholderRight = makeSimpleShape(lightPlaceholderGeo, offsetX, baseHeight * 3, (currY - (6.95/1.965)));
            pointLightRight.position.set(offsetX, baseHeight * 2, (currY - (6.95/1.965)));
            torches.add(pointLightRight);
            //scene.add(lightPlaceholderRight);
            const pointLightLeft = new THREE.PointLight(colorSpotlight, intensity, distance);
            //const lightPlaceholderLeft = makeSimpleShape(lightPlaceholderGeo, -offsetX, baseHeight * 3, (currY - (6.95/1.965)));
            pointLightLeft.position.set(-offsetX, baseHeight * 2, (currY - (6.95/1.965)));
            //scene.add(lightPlaceholderLeft);
            torches.add(pointLightLeft);
        }
        currY += (0.2325 * 1.875);
        outerColumns.add(columnFront);
        outerColumns.add(columnBack);
    }
    totalColumns.add(outerColumns);

    building.add(torches);

    // Add Inner Columns (6 front and back in parallel)
    var innerColumns = new THREE.Group();
    var innerHorizontalColumns = 6;
    var currInnerX = 2.98; // Inner Columns are placed inside Parthenon
    for(var x = 0; x < innerHorizontalColumns; x++){
        var columnFront = makeShape(geoCol, matCol, (currInnerX - (2.98/1.4)), baseHeight + (1.04 / 2), 1.92);
        var columnBack = makeShape(geoCol, matCol, -(currInnerX - (2.98/1.4)), baseHeight + (1.04 / 2), -1.92);
        currInnerX -= ((0.175) * 1.4) + 0.095;
        innerColumns.add(columnFront);
        innerColumns.add(columnBack);

    }
    totalColumns.add(innerColumns);
    building.add(totalColumns);

    // Add Entablatures (Rectangular structures directly above columns)
    var totalEntablatures = new THREE.Group();
    // Outer Entablatures
    var outerEntablatures = new THREE.Group();
    // Scaling and placements of Entablatures are also determined through adding a product/fraction with slight refining
    const geoHorizontalEntablature = new THREE.BoxGeometry(3.1 + (columnRadius * 1.25), 0.33, columnRadius * 2.05); // Height = 3.3m
    const geoVerticalEntablature = new THREE.BoxGeometry(columnRadius * 2.05, 0.33, 6.95 - (2 * (columnRadius * 2)) + (columnRadius / 1.25));
    const matEntablature = makeMaterial("marble/albedo.png", "marble/normal.png", "marble/ao.png", 16, 1);
    var southEntablature = makeShape(geoHorizontalEntablature, matEntablature, 0, columnHeight + 0.32, 6.95 - (6.95/1.965));
    var northEntablature = makeShape(geoHorizontalEntablature, matEntablature, 0, columnHeight + 0.32, -6.95 + (6.95/1.965));
    var westEntablature = makeShape(geoVerticalEntablature, matEntablature, 3.1 - (3.1/1.95), columnHeight + 0.32, 0);
    var eastEntablature = makeShape(geoVerticalEntablature, matEntablature, -3.1 + (3.1/1.95), columnHeight + 0.32, 0);
    outerEntablatures.add(southEntablature);
    outerEntablatures.add(northEntablature);
    outerEntablatures.add(westEntablature);
    outerEntablatures.add(eastEntablature);

    totalEntablatures.add(outerEntablatures);

    // Inner Entablatures
    var innerEntablatures = new THREE.Group();
    // Ditto for the inner entablatures, in which only two are needed for the inner columns
    const geoInnerEntablature = new THREE.BoxGeometry(1.92, 0.33, columnRadius * 2.05);
    var southInnerEntablature = makeShape(geoInnerEntablature, matEntablature, 0, columnHeight + 0.32, 1.92);
    var northInnerEntablature = makeShape(geoInnerEntablature, matEntablature, 0, columnHeight + 0.32, -1.92);
    innerEntablatures.add(southInnerEntablature);
    innerEntablatures.add(northInnerEntablature);

    totalEntablatures.add(innerEntablatures);
    building.add(totalEntablatures);

    // Add Roof
    var roof = new THREE.Group();
    const geoRoofBase = new THREE.BoxGeometry(3.1 + 0.3, stepHeight, 6.95 + 0.25); // Base of roof is assumed to be the second step of the crepidoma
    const matRoofBase = makeMaterial("limestone/albedo.png", "limestone/normal.png", "limestone/ao.png", 30, 1);
    const roofBase = makeShape(geoRoofBase, matRoofBase, 0, columnHeight + (1 / 2), 0);
    roof.add(roofBase);

    // A unique shape is created for the triangular roof, which has since collapsed
    var roofHeight = 0.2812; // Approximate Height of Triangular Roof is the remainder of the Parthenon's height minus the height of the columns and the roof base
    const geoRoof = triangularPrism((3.1 / 2) + 0.1, roofHeight, (6.95 / 2) + 0.075);
    const matRoof = makeMaterial("marble/albedo.png", "marble/albedo.png", "marble/ao.png", 16, 16);
    //var matRoof = new THREE.MeshPhongMaterial({0xffffff});
    const roofTop = makeShape(geoRoof, matRoof, 0, columnHeight + (0.48) + stepHeight, 0);
    roof.add(roofTop);
    
    building.add(roof);

    // Add Acropolis Grounds
    const acropolisGrounds = new THREE.Group();
    const matAcro = makeMaterial("acrobricksalt/albedo.png", "acrobricksalt/normal.png", "acrobricksalt/ao.png", 32, 12);
    const geoAcroBackPart = new THREE.BoxGeometry(20, 5, 30);
    const acropolisBack = makeShape(geoAcroBackPart, matAcro, -2.5, -2.5, -11);

    const geoAcroEdge = new THREE.BoxGeometry(20, 5, 20);
    const acropolisEdge = makeShape(geoAcroEdge, matAcro, -6.26, -2.5, 7.25);
    acropolisEdge.rotation.y = 45;
    acropolisGrounds.add(acropolisBack);
    acropolisGrounds.add(acropolisEdge);

    scene.add(acropolisGrounds);


    // Render whole scene
    scene.add(building);
    // add background
    const skybox = new THREE.CubeTextureLoader().load([
        "skybox/galaxy+X.jpg",
        "skybox/galaxy-X.jpg",
        "skybox/galaxy+Y.jpg",
        "skybox/galaxy-Y.jpg",
        "skybox/galaxy+Z.jpg",
        "skybox/galaxy-Z.jpg"]);
    scene.background = skybox;
    // add ground
    //const geoGround = new THREE.PlaneGeometry(100, 100);
    renderer.render(scene, camera);

    // Quick function that sets the shape's material, mesh, and position
    function makeShape(geo, mat, x, y, z){
        //const mat = new THREE.MeshPhongMaterial({ /*color,*/ map: texture1, normalMap: texture2, side: THREE.DoubleSide });
        // PROBLEM: Phong Material on Triangular Prism is always black b.c. it isn't reflecting any light
        // Until the problem is solved, all mats are basic, not phong.
        const shape = new THREE.Mesh(geo, mat);
        shape.position.x = x;
        shape.position.y = y;
        shape.position.z = z;
    
        return shape; // Mesh is only returned, as add() is used to parent objects not only to the scene, but also eachother
    }

    /*
    function makeSimpleShape(geo, x, y, z){
        //const mat = new THREE.MeshPhongMaterial({ color, map: texture1, normalMap: texture2, side: THREE.DoubleSide });
        // PROBLEM: Phong Material on Triangular Prism is always black b.c. it isn't reflecting any light
        // Until the problem is solved, all mats are basic, not phong.
        const mat = new THREE.MeshBasicMaterial(0xFFFFFF);
        const shape = new THREE.Mesh(geo, mat);
        shape.position.x = x;
        shape.position.y = y;
        shape.position.z = z;
    
        return shape; // Mesh is only returned, as add() is used to parent objects not only to the scene, but also eachother
    }
    */

    function makeMaterial(albedoSource, normalSource, aoSource, tileX, tileY){
        const albedoTex = makeTexture(albedoSource, tileX, tileY);
        const normalTex = makeTexture(normalSource, tileX, tileY);
        const aoTex = makeTexture(aoSource, tileX, tileY);
        //const specularTex = makeTexture(specularSource, tileX, tileY);

        var mat = new THREE.MeshPhongMaterial({map: albedoTex, normalMap: normalTex, aoMap: aoTex, side: THREE.DoubleSide});

        return mat;
    }

    function makeTexture(source, tileX, tileY){
        const texture = new THREE.TextureLoader().load(source);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(tileX, tileY);

        return texture;
    }

    // Makes the geometry of a triangular prism through a three.js geometry buffer
    function triangularPrism(width, height, length){
        //const prism = new THREE.Shape();

        const geometry = new THREE.BufferGeometry();

        // width = x, height = y, length = z
        const vertices = new Float32Array( [
            // Front Face
            -width, 0.0, -length, // v0
            0.0, height, -length, // v1 - Tip of the prism
           width, 0.0, -length, // v2

           // Back Face
            -width, 0.0, length, // v3
            0.0, height, length, // v4 - Tip of the prism
            width, 0.0, length, // v5
        ] );

        // Connects all of the vertices together
        const indices = [
            // front
            0, 1, 2,

            // left
            1, 0, 4,
            3, 4, 0,
            
            // right
            1, 4, 2,
            2, 4, 5,

            // back
            4, 3, 5,

            // bottom
            3, 0, 5,
            2, 5, 0,
        ];
        
        geometry.setIndex( indices );
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'normal', new THREE.BufferAttribute( vertices, 3 ) );

        return geometry;
    }

    function resizeRendererToDisplaySize(renderer){
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if(needResize){
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
    
    // Rotate the cube
    function render(time){
        time *= 0.001; // Time is in SECONDS
            const speed = 1;
            const rot = time * speed;
            //building.rotation.y = rot;
            //console.log("Camera X: " + camera.position.x + "\nCamera Y: " + camera.position.y + "\nCamera Z: " + camera.position.z);
            //console.log("Camera Rotation X: " + camera.rotation.x + "\nCamera Rotation Y: " + camera.rotation.y + "\nCamera Rotation Z: " + camera.rotation.z);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


main();