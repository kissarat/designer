/**
 * Fake shapes generator
 */

designer.mouse = {offsetX: 100, offsetY: 100};
/**
 * Emulates the movement of mouse
 */
function emulateMouse() {
    designer.mouse.offsetX = rand(10, designer.width - 200);
    designer.mouse.offsetY = rand(10, designer.height - 200);
}

/**
 * Creates many shapes
 * @param {string} type - shape type
 * @param {number} number - amount
 */
function populateShape(type, number) {
    if (undefined === number)
        number = 1;
    for (var i = 0; i < number; i++) {
        designer.createShape(type, true, true);
        emulateMouse();
    }
}


loadScript('bower_components/Faker/build/build/faker.js');
//on(window, 'load', generate);

function generate() {
    var rand_image_keys = randDict(faker.image);
    function rand_image() {
        return faker.image[rand_image_keys()]();
    }
    designer.project.add();
    populateShape('rect', 2);
    populateShape('polyline', 2);
    populateShape({type: 'text', $: faker.lorem.sentence}, 1);
    populateShape({type:'image', href: rand_image}, 2);
    designer.project.add();
    populateShape({type:'image', href: rand_image}, 2);
    populateShape('rect', 3);
    populateShape({type:'foreign', $:faker.lorem.paragraph}, 3);
    populateShape('polyline', 1);
    designer.project.add();
    populateShape('rect', 1);
    populateShape('polyline', 1);
    populateShape('text', 1);
    designer.project.add();
    populateShape('rect', 2);
    populateShape('polyline', 1);
    populateShape('foreign', 1);
}


var example = JSON.stringify({
    layers: [
        {
            id: 'layer1',
            list: [
                {
                    type: 'polyline',
                    fill: 'green',
                    points: '30 30 77 21 141 42 165 115 56 123'
                }
            ]
        }
    ]
});
