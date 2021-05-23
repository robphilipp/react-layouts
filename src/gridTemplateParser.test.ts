import {
    withAuto,
    gridTrackTemplateBuilder,
    withLineNames,
    withPixels,
    TrackSizeType,
    withGridTrack, withPercentage
} from "./gridTemplateParser";

test('should be able to build a simple grid template with one auto track and no line names', () => {
    const template = gridTrackTemplateBuilder().addTrack(withAuto()).build()
    expect(template.lastLineNames).toBeUndefined()
    expect(template.trackList.length).toBe(1)
    expect(template.trackList[0].lineNames).toBeUndefined()
    expect(template.trackList[0].track.amount).toBeUndefined()
    expect(template.trackList[0].track.sizeType).toEqual(TrackSizeType.Auto)
    expect(template.trackList[0].track.asString()).toEqual('auto')
    expect(template.asString()).toEqual('auto')
})

test('should be able to build a simple grid template with named lines', () => {
    const template = gridTrackTemplateBuilder()
        .addTrack(withAuto(), withLineNames('one', 'two'))
        .build()
    expect(template.lastLineNames?.names).toBeUndefined()
    expect(template.trackList.length).toBe(1)
    expect(template.trackList[0].lineNames?.names).toEqual(['one', 'two'])
    expect(template.asString()).toEqual('[one two] auto')
})

test('should be able to build a simple grid template with named lines and end line', () => {
    const template = gridTrackTemplateBuilder()
        .addTrack(withAuto(), withLineNames('one', 'two'))
        .build(withLineNames('end'))
    expect(template.lastLineNames?.names).toEqual(['end'])
    expect(template.trackList.length).toBe(1)
    expect(template.trackList[0].lineNames?.names).toEqual(['one', 'two'])
    expect(template.asString()).toEqual('[one two] auto [end]')
})

test('should be able to build a grid template with named lines and end line', () => {
    const template = gridTrackTemplateBuilder()
        .addTrack(withAuto(), withLineNames('one', 'two'))
        .addTrack(withPixels(10), withLineNames('size', '10size'))
        .build(withLineNames('end'))
    expect(template.lastLineNames?.names).toEqual(['end'])
    expect(template.trackList.length).toBe(2)
    expect(template.trackList[0].lineNames?.names).toEqual(['one', 'two'])
    expect(template.trackList[0].track.amount).toBeUndefined()
    expect(template.trackList[0].track.sizeType).toEqual(TrackSizeType.Auto)
    expect(template.trackList[1].lineNames?.names).toEqual(['size', '10size'])
    expect(template.trackList[1].track.amount).toEqual(10)
    expect(template.trackList[1].track.sizeType).toEqual(TrackSizeType.Pixel)
    expect(template.asString()).toEqual('[one two] auto [size 10size] 10px [end]')
})

test('should be able to build a grid template with named lines, repeat, and end line', () => {
    const template = gridTrackTemplateBuilder()
        .addTrack(withAuto(), withLineNames('one', 'two'))
        .repeat(3, withGridTrack(withPercentage(10), 'size', '10size'))
        .build(withLineNames('end'))
    expect(template.lastLineNames?.names).toEqual(['end'])
    expect(template.trackList.length).toBe(4)
    expect(template.trackList[0].lineNames?.names).toEqual(['one', 'two'])
    expect(template.trackList[0].track.amount).toBeUndefined()
    expect(template.trackList[0].track.sizeType).toEqual(TrackSizeType.Auto)
    for (let i = 1; i < 4; ++i) {
        expect(template.trackList[i].lineNames?.names).toEqual(['size', '10size'])
        expect(template.trackList[i].track.amount).toEqual(10)
        expect(template.trackList[i].track.sizeType).toEqual(TrackSizeType.Percentage)
    }
    expect(template.asString()).toEqual('[one two] auto [size 10size] 10% [size 10size] 10% [size 10size] 10% [end]')
})
