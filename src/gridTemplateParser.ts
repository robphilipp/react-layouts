export enum TrackSizeType {
    Pixel= 'px',
    Percentage = '%',
    Fraction = 'fr',
    Auto = 'auto'
}

const PixelRegex = /[0-9]+px/i
const PercentageRegex = /[0-9]+%/
const FractionRegex = /[0-9]+fr/
const AutoRegex = /auto/i

export interface GridTrackSize {
    amount?: number
    sizeType: TrackSizeType
    asString: () => string
}

/**
 * Names for the grid line (i.e. represented in css as [name1 name2 ... nameN]
 */
export interface GridLineNames {
    names: Array<string>
    asString: () => string
}

interface GridTrack {
    lineNames?: GridLineNames
    track: GridTrackSize
}

interface GridTrackTemplate {
    trackList: Array<GridTrack>
    lastLineNames?: GridLineNames
    asString: () => string
}

export interface GridTrackTemplateBuilder {
    template: GridTrackTemplate
    addTrack: (track: GridTrackSize, lineNames?: GridLineNames) => GridTrackTemplateBuilder
    build: (lastLineNames?: GridLineNames) => GridTrackTemplate
}

export function gridTrackTemplateBuilder(gridTrackTemplate?: GridTrackTemplate): GridTrackTemplateBuilder {
    const template = gridTrackTemplate ?
        Object.assign({}, gridTrackTemplate) :
        {trackList: [], asString: () => ''}

    function addTrackTo(template: GridTrackTemplate, track: GridTrackSize, lineNames?: GridLineNames): GridTrackTemplateBuilder {
        template.trackList.push({lineNames, track})
        return {
            template,
            addTrack: (track: GridTrackSize, lineNames?: GridLineNames) => addTrackTo(template, track, lineNames),
            build: (lastLineNames?: GridLineNames) => build(template, lastLineNames)
        }
    }

    function build(template: GridTrackTemplate, lastLineNames?: GridLineNames): GridTrackTemplate {
        return {
            trackList: template.trackList,
            lastLineNames,
            asString: () => gridTrackTemplateAsString(template.trackList, template.lastLineNames)
        }
    }

    return {
        template,
        addTrack: (track: GridTrackSize, lineNames?: GridLineNames) => addTrackTo(template, track, lineNames),
        build: (lastLineNames?: GridLineNames) => build(template, lastLineNames)
    }
}

// export interface GridLineBuilder {
//     template: {trackList: Array<Track>, line?: GridLineNames}
//     names: (names: Array<string>) => GridTrackBuilder
// }
//
// export interface GridTrackBuilder {
//     template: {trackList: Array<Track>, line?: GridLineNames}
//     track: (track: GridTrack) => GridLineBuilder
// }

//
// interface GridTemplateBuilder {
//     template: GridTemplate
//
// }
//
// function gridTemplateBuilder(): ((names: Array<string>) => Function) | ((track: GridTrack) => Function) {
//     const template = {trackList: []}
//     let current
//     function gridLine(names: Array<string>): Function {
//         current = 'line'
//         return gridTrack
//     }
//
//     function gridTrack(track: GridTrack): Function {
//         current = 'track'
//         return gridLine
//     }
//
//     return current === undefined || current === 'track' ? gridLine : gridTrack
// }


// function addGridLine(names: Array<string>, template: GridTemplate): GridTrackBuilder {
//     template.trackList.push({names: names, asString: namesFor})
//     return {
//         template,
//         track: (track: GridTrack) => addGridTrack(track, template)
//     }
// }
//
// function addGridTrack(track: GridTrack, template: GridTemplate): GridLineBuilder {
//     return {
//         template,
//         names: (names: Array<string>) => addGridLine(names, template)
//     }
// }
//
// function gridTemplateBuilder(): GridTemplateBuilder {
//     const template: GridTemplate = {trackList: []}
//
//     return {
//         template,
//         names: (names: Array<string>) => addGridLine(names, template),
//         track: (track: GridTrack) => addGridTrack(track, template)
//     }
// }


export function gridLinesToString(gridLines: Array<GridLineNames>): string {
    return gridLines.map(line => line.asString()).join(" ")
}

export function repeat(times: number, gridLine: GridLineNames): Array<GridLineNames> {
    const gridLines: Array<GridLineNames> = []
    for(let i = 0; i < times; ++i) {
        gridLines.push(gridLine)
    }
    return gridLines
}

export function pixelsFor(pixels: number, names?: Array<string>): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Pixel, pixels)
}

export function percentageFor(percentage: number, names?: Array<string>): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Percentage, percentage)
}

export function fractionFor(fraction: number, names?: Array<string>): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Fraction, fraction)
}

export function autoFor(): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Auto)
}

function gridTrackSizeFor(sizeType: TrackSizeType, amount?: number): GridTrackSize {
    const amountString = amount !== undefined ?
        () => `${Math.floor(amount)}${sizeType}` :
        () => `${sizeType}`

    return {
        amount,
        sizeType,
        asString: amountString
    }
}

function namesFor(names?: Array<string>): string {
    return names && names.length > 0 ?
        `[${names.join(" ")}] ` :
        ""
}

function gridTrackTemplateAsString(gridTrackList: Array<GridTrack>, lastLineNames?: GridLineNames): string {
    function amountString(sizeType: TrackSizeType, amount?: number): string {
        return amount !== undefined ? `${Math.floor(amount)}${sizeType}` : sizeType.toString()
    }

    const trackList = gridTrackList
        .map(track => `${namesFor(track.lineNames?.names)}${amountString(track.track.sizeType, track.track.amount)}`)
        .join(" ")
    const lastLines = lastLineNames ? `${namesFor(lastLineNames.names)} ` : ""
    return trackList + lastLines
}

function gridLineFor(names: Array<string> | undefined, amount: number | undefined, sizeType: TrackSizeType,): GridLineNames {
    const amountString = amount !== undefined ?
        () => `${Math.floor(amount)}${sizeType}` :
        () => `${sizeType}`
    return {
        names: names || [],
        // size: {amount, sizeType, asString: amountString},
        asString: () => `${namesFor(names)}${amountString()}`
    }
}

