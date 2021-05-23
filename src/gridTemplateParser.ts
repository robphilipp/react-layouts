export enum TrackSizeType {
    Pixel= 'px',
    Percentage = '%',
    Fraction = 'fr',
    Auto = 'auto'
}

// const PixelRegex = /[0-9]+px/i
// const PercentageRegex = /[0-9]+%/
// const FractionRegex = /[0-9]+fr/
// const AutoRegex = /auto/i

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

export interface GridTrack {
    lineNames?: GridLineNames
    track: GridTrackSize
}

export interface GridTrackTemplate {
    trackList: Array<GridTrack>
    lastLineNames?: GridLineNames
    trackSizes: (containerDimension: number) => Array<number>
    asString: () => string
}

export const emptyGridTrackTemplate = (): GridTrackTemplate => ({
    trackList: [],
    trackSizes: () => [],
    asString: () => ""
})

export interface GridTrackTemplateBuilder {
    template: GridTrackTemplate
    addTrack: (track: GridTrackSize, lineNames?: GridLineNames) => GridTrackTemplateBuilder
    repeatFor: (times: number, ...track: Array<GridTrack>) => GridTrackTemplateBuilder
    build: (lastLineNames?: GridLineNames) => GridTrackTemplate
}

export function gridTrackTemplateBuilder(gridTrackTemplate?: GridTrackTemplate): GridTrackTemplateBuilder {
    const template = gridTrackTemplate ?
        Object.assign({}, gridTrackTemplate) :
        emptyGridTrackTemplate()

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

    // todo doesn't yet account for 'auto'
    /**
     * Calculates the track size (does not account for the gaps, spans, etc. Those are applied in
     * the grid cell size calculation
     * @param template
     * @param containerSize
     */
    function trackSizesFor(template: GridTrackTemplate, containerSize: number): Array<number> {
        // first set all the fixed and percentage sizes
        const dimensions = template.trackList.map(track => {
            switch(track.track.sizeType) {
                case TrackSizeType.Pixel:
                    return track.track.amount || 0
                case TrackSizeType.Percentage:
                    return Math.floor(containerSize * (track.track.amount || 0) / 100)
                case TrackSizeType.Fraction:
                    return -(track.track.amount || 0)
                case TrackSizeType.Auto:
                default:
                    return NaN
            }
        })

        // apportion the fractional sizes
        const usedSpace = dimensions
            .filter(size => size > 0 && !isNaN(size))
            .reduce((a, b) => a + b, 0)
        // console.log("container-size", containerSize, "used-space", usedSpace, "dimensions", dimensions)

        if (usedSpace >= containerSize) {
            // when all the space is used up, then set the fractional sizes to 0
            dimensions.forEach((size, index, dims) => {
                if (size < 0 || isNaN(size)) {
                    dims[index] = 0
                }
            })
        } else {
            // there is space available to apportion to the remaining tracks
            // 1. calculate the total fraction number (recall that the fractional numbers are negative)
            const totalFraction = dimensions
                .filter(size => size < 0)
                .map(size => -size)
                .reduce((a, b) => a + b, 0)
            // console.log("total-fraction", totalFraction)
            // 2. apportion the fractions to the remaining space
            dimensions.forEach((size, index, dims) => {
                if (size < 0) {
                    dims[index] = (-size / totalFraction) * (containerSize - usedSpace)
                    // dims[index] = Math.floor((-size / totalFraction) * (containerSize - usedSpace))
                    // console.log("apportioned-size", dimensions[index])
                }
            })
        }

        // console.log("dimensions", dimensions)
        return dimensions
    }

    function build(template: GridTrackTemplate, lastLineNames?: GridLineNames): GridTrackTemplate {
        return {
            trackList: template.trackList,
            lastLineNames,
            trackSizes: (containerSize: number) => trackSizesFor(template, containerSize),
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
            repeatFor: (times: number, ...track: Array<GridTrack>) => repeatFor(template, times, ...track),
            build: (lastLineNames?: GridLineNames) => build(template, lastLineNames),
        }
    }

    return updateBuilder(template)
}

export function withLineNames(...names: string[]): GridLineNames {
    return {names, asString: namesFor}
}

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

