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
    repeat: (times: number, ...track: Array<GridTrack>) => GridTrackTemplateBuilder
    build: (lastLineNames?: GridLineNames) => GridTrackTemplate
}

export function gridTrackTemplateBuilder(gridTrackTemplate?: GridTrackTemplate): GridTrackTemplateBuilder {
    const template = gridTrackTemplate ?
        Object.assign({}, gridTrackTemplate) :
        {trackList: [], asString: () => ''}

    function addTrackTo(template: GridTrackTemplate, track: GridTrackSize, lineNames?: GridLineNames): GridTrackTemplateBuilder {
        template.trackList.push({lineNames, track})
        return updateBuilder(template)
    }

    // todo doesn't yet support 'auto-fill' or 'auto-fit' from the 'times' parameter
    function repeatFor(template: GridTrackTemplate, times: number, ...track: Array<GridTrack>): GridTrackTemplateBuilder {
        for (let i = 0; i < times; ++i) {
            template.trackList.push(...track)
        }
        return updateBuilder(template)
    }

    function build(template: GridTrackTemplate, lastLineNames?: GridLineNames): GridTrackTemplate {
        return {
            trackList: template.trackList,
            lastLineNames,
            asString: () => gridTrackTemplateAsString(template.trackList, lastLineNames)
        }
    }

    /**
     * Private function that update the grid track template builder with the new grid track template,
     * and updates the public functions for the builder
     * @param template The update grid track template
     * @return An updated grid-track-template builder
     */
    function updateBuilder(template: GridTrackTemplate): GridTrackTemplateBuilder {
        return {
            template,
            addTrack: (track: GridTrackSize, lineNames?: GridLineNames) => addTrackTo(template, track, lineNames),
            repeat: (times: number, ...track: Array<GridTrack>) => repeatFor(template, times, ...track),
            build: (lastLineNames?: GridLineNames) => build(template, lastLineNames)
        }
    }

    return updateBuilder(template)
}

export function withLineNames(...names: string[]): GridLineNames {
    return {names, asString: namesFor}
}

// export function gridLinesToString(gridLines: Array<GridLineNames>): string {
//     return gridLines.map(line => line.asString()).join(" ")
// }
//
// export function repeat(times: number, gridLine: GridLineNames): Array<GridLineNames> {
//     const gridLines: Array<GridLineNames> = []
//     for(let i = 0; i < times; ++i) {
//         gridLines.push(gridLine)
//     }
//     return gridLines
// }

export function withGridTrack(gridTrackSize: GridTrackSize, ...names: string[]): GridTrack {
    return {lineNames: withLineNames(...names), track: gridTrackSize}
}

export function withPixels(pixels: number): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Pixel, pixels)
}

export function withPercentage(percentage: number): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Percentage, percentage)
}

export function withFraction(fraction: number): GridTrackSize {
    return gridTrackSizeFor(TrackSizeType.Fraction, fraction)
}

export function withAuto(): GridTrackSize {
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
        `[${names.join(" ")}]` :
        ""
}

function gridTrackTemplateAsString(gridTrackList: Array<GridTrack>, lastLineNames?: GridLineNames): string {
    function amountString(sizeType: TrackSizeType, amount?: number): string {
        return amount !== undefined ? `${Math.floor(amount)}${sizeType}` : sizeType.toString()
    }

    const trackList = gridTrackList
        .map(track => {
            const names = namesFor(track.lineNames?.names)
            const space = (names && names.length > 0) ? " " : ""
            return `${names}${space}${amountString(track.track.sizeType, track.track.amount)}`
        })
        .join(" ")
    const lastLines = lastLineNames ? ` ${namesFor(lastLineNames.names)}` : ""
    return trackList + lastLines
}

// function gridLineFor(names: Array<string> | undefined, amount: number | undefined, sizeType: TrackSizeType,): GridLineNames {
//     const amountString = amount !== undefined ?
//         () => `${Math.floor(amount)}${sizeType}` :
//         () => `${sizeType}`
//     return {
//         names: names || [],
//         // size: {amount, sizeType, asString: amountString},
//         asString: () => `${namesFor(names)}${amountString()}`
//     }
// }

