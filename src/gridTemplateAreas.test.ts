import {gridArea, gridTemplateAreasBuilder} from "./gridTemplateAreas";

test('should be able to create a grid-template-areas', () => {
    const template = gridTemplateAreasBuilder()
        .addArea('a', gridArea(1, 2, 3, 1))
        .addArea('b', gridArea(2, 1))
        .build()

    expect(template.asString()).toEqual(`". a"\n"b a"\n". a"`)
})