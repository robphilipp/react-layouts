import {autoFor, gridTrackTemplateBuilder, TrackSizeType} from "./gridTemplateParser";

test('should be able to build a simple grid', () => {
    const template = gridTrackTemplateBuilder().addTrack(autoFor()).build()
    expect(template.lastLineNames).toBeUndefined()
    expect(template.trackList.length).toBe(1)
    expect(template.trackList[0].lineNames).toBeUndefined()
    expect(template.trackList[0].track.amount).toBeUndefined()
    expect(template.trackList[0].track.sizeType).toEqual(TrackSizeType.Auto)
    expect(template.trackList[0].track.asString()).toEqual('auto')
    expect(template.asString()).toEqual('auto')
})

export {}