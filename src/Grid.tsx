import * as React from 'react'
import {cloneElement, createContext, CSSProperties, useCallback, useContext, useLayoutEffect, useState} from 'react'
import {Dimensions} from "./dimensions";
import {
    cellDimensionFor,
    emptyGridTrackTemplate,
    gridLineNamesFor,
    GridTrackTemplate,
    gridTrackTemplateBuilder,
    trackIndexFor,
    withFraction,
    withGridTrack
} from "./gridTemplates";

interface UseGridValues {
    width: number
    height: number
    gridTemplateRows: GridTrackTemplate
    gridTemplateColumns: GridTrackTemplate
    rowGap: number
    columnGap: number
    showGrid: boolean
}

const initialGridValues: UseGridValues = {
    width: 10,
    height: 10,
    gridTemplateRows: emptyGridTrackTemplate(),
    gridTemplateColumns: emptyGridTrackTemplate(),
    rowGap: 0,
    columnGap: 0,
    showGrid: false
}

const GridContext = createContext<UseGridValues>(initialGridValues)

interface GridDimensions {
    numRows: number
    numColumns: number
}

export interface Props {
    // supplies the dimensions of the (parent) container whose dimensions
    // this grid uses.
    dimensionsSupplier: () => Dimensions
    gridTemplateRows?: GridTrackTemplate
    gridTemplateColumns?: GridTrackTemplate
    // the number pixels between rows in the grid
    rowGap?: number
    // the number pixels between columns in the grid
    columnGap?: number
    showGrid?: boolean
    // additional styles
    styles?: CSSProperties
    // the children grid-cells
    children: JSX.Element | Array<JSX.Element>
}

/**
 * Grid layout for use when the grid cells need to pass one their size (in pixels) to their
 * children. This is useful when the child uses a canvas or svg element that needs to have its
 * explicit size set.
 *
 * The grid expects a size (width, height) in pixels, which may be supplied by the `DimensionProvider`,
 * and the number rows and columns that comprise the grid. The children of the <Grid/> must be
 * <GridCell/> elements.
 *
 * For single elements requiring a size in pixels, use the raw `DimensionProvider`.
 *
 * Uses CSS grid underneath.
 * @param props The properties defining the grid's dimensions and children
 * @return A JSX element representing the grid
 * @constructor
 */
export function Grid(props: Props): JSX.Element {
    const {
        dimensionsSupplier,
        gridTemplateRows,
        gridTemplateColumns,
        rowGap = 0,
        columnGap = 0,
        showGrid = false,
        styles,
        children
    } = props

    const {width, height} = dimensionsSupplier()

    const calcGridDimensions = useCallback(
        (): GridDimensions => {
            if (!Array.isArray(children)) {
                return {
                    numRows: trackIndexFor((children.props as CellProps).row, gridTemplateRows || emptyGridTrackTemplate()),
                    numColumns: trackIndexFor((children.props as CellProps).column, gridTemplateColumns || emptyGridTrackTemplate())
                }
            }
            return children
                .map(child => {
                    const props = (child.props as CellProps)
                    return {numRows: props.row, numColumns: props.column} as GridDimensions
                })
                .reduce((dim1, dim2) => ({
                    numRows: Math.max(dim1.numRows, dim2.numRows),
                    numColumns: Math.max(dim1.numColumns, dim2.numColumns)
                }))
        },
        [children]
    )

    const [gridDimensions, setGridDimensions] = useState<GridDimensions>(calcGridDimensions())

    useLayoutEffect(
        () => {
            setGridDimensions(calcGridDimensions())
        },
        [calcGridDimensions]
    )

    if (width === undefined || height === undefined) {
        return <></>
    }

    const {numRows, numColumns} = gridDimensions

    if (numRows <= 0 && gridTemplateRows === undefined) {
        throw new Error(`<Grid/> rows defined by the children must be 1 or larger, or the grid-template-rows property must be set; specified rows: ${numRows}`)
    }
    if (numColumns <= 0 && gridTemplateColumns === undefined) {
        throw new Error(`<Grid/> columns defined by the children must be 1 or larger, or the grid-template-columns property must be set; specified columns: ${numColumns}`)
    }

    // use the specified grid templates, or use the default values calculated from the
    // children's (row, column) properties
    // todo move this into a useMemo so that they are only recalculated if the values change
    const templateRows = gridTemplateRows || gridTrackTemplateBuilder()
        .repeatFor(numRows, withGridTrack(withFraction(1)))
        .build()
    const templateColumns = gridTemplateColumns || gridTrackTemplateBuilder()
        .repeatFor(numColumns, withGridTrack(withFraction(1)))
        .build()

    /**
     * Clones the children (or child) and adds the height, width, numRows, and numColumns props.
     * @param children An array of `GridCell` or a single JSX element
     * @return The enriched children
     */
    function enrich(children: JSX.Element | Array<JSX.Element>): JSX.Element | Array<JSX.Element> {
        const childElements = Array.isArray(children) ? children : [children];

        const invalidChildren = childElements.filter(child => !(child.type.name === "GridCell"));
        if (invalidChildren.length > 0) {
            throw new Error(
                "<Grid/> allows only <GridCell/> as children; " +
                `invalid children: ${invalidChildren.map(child => typeof child.type).join(", ")}`
            )
        }
        return childElements.map(child => cloneElement(
            child,
            {
                key: `grid-cell-${child.props.row}-${child.props.column}`,
                height, width,
                numRows, numColumns
            }
        ))
    }

    return (
        <GridContext.Provider value={{
            width, height,
            gridTemplateRows: templateRows,
            gridTemplateColumns: templateColumns,
            rowGap, columnGap,
            showGrid
        }}>
            <div style={{
                display: "grid",
                gridTemplateRows: templateRows.asString(),
                gridTemplateColumns: templateColumns.asString(),
                minWidth: width,
                minHeight: height,
                rowGap,
                columnGap,
                ...styles
            }}>
                {enrich(children)}
            </div>
        </GridContext.Provider>
    )
}

interface UseGridCellValues {
    width: number
    height: number
    row: number
    column: number
    rowsSpanned: number
    columnsSpanned: number
}

const initialCellValues: UseGridCellValues = {
    width: 10, height: 10, row: 1, column: 1, rowsSpanned: 1, columnsSpanned: 1
}

const GridCellContext = createContext<UseGridCellValues>(initialCellValues)

interface CellProps {
    column: number | string
    columnsSpanned?: number
    row: number | string
    rowsSpanned?: number
    // additional styles
    styles?: CSSProperties
    children: JSX.Element
}

/**
 * A cell in the <Grid/> whose location and size are controlled by the <Grid/> parent. The parent <Grid/>
 * component provides the width and height of the entire area it manages. The <GridCell/> uses the width
 * and height from the parent, its grid location and the row and column spans, to determine the width and
 * height of the <GridCell/>. It passes the calculated width and height to it child.
 *
 * Uses CSS grid underneath.
 * @param props The properties defining the location and row and column spans and the width and height
 * managed by the parent <Grid/>
 * @return A sized <GridCell/>
 * @constructor
 */
export function GridCell(props: CellProps): JSX.Element {
    const {
        column,
        columnsSpanned = 1,
        row,
        rowsSpanned = 1,
        styles,
        children,
    } = props

    const {
        width, height,
        gridTemplateRows, gridTemplateColumns,
        rowGap, columnGap,
        showGrid
    } = useContext<UseGridValues>(GridContext)

    // find the column and row indexes (the row or column could have been specified as a grid-line name
    const columnIndex = trackIndexFor(column, gridTemplateColumns)
    if (columnIndex === 0 && typeof column === 'string') {
        const lineNames = gridLineNamesFor(gridTemplateColumns).join(", ")
        throw new Error(
            `<GridCell/> line-name for specified column identifier not found in any tracks; column: "${column}"; line-names: [${lineNames}]`
        )
    }
    const rowIndex = trackIndexFor(row, gridTemplateRows)
    if (rowIndex === 0 && typeof row === 'string') {
        const lineNames = gridLineNamesFor(gridTemplateRows).join(", ")
        throw new Error(
            `<GridCell/> line-name for specified row identifier not found in any tracks; row: "${row}"; line-names: [${lineNames}]`
        )
    }

    // ensure that the row index and column index are within valid bounds
    const numRows = gridTemplateRows.trackList.length
    const numColumns = gridTemplateColumns.trackList.length
    if (rowIndex < 1 || rowIndex > numRows) {
        throw new Error(
            `<GridCell/> row must be greater than 1 and less than the number of rows; number rows: ${numRows}; row: ${row}`
        )
    }
    if (rowsSpanned < 1) {
        throw new Error(
            `The number of rows spanned by this <GridCell/> greater than 1; rows spanned: ${rowsSpanned}`
        )
    }
    if (columnIndex < 1 || columnIndex > numColumns) {
        throw new Error(
            `<GridCell/> column must be greater than 1 and less than the number of columns; number columns: ${numColumns}; column: ${column}`
        )
    }
    if (columnsSpanned < 1) {
        throw new Error(
            `The number of columns spanned by this <GridCell/> greater than 1; columns spanned: ${columnsSpanned}`
        )
    }

    // update the style when in debug mode
    const debug: CSSProperties = showGrid ?
        {borderStyle: 'dashed', borderWidth: 1, borderColor: 'lightgrey'} :
        {}
    const cellWidth = cellDimensionFor(width, columnIndex, columnGap, columnsSpanned, gridTemplateColumns)
    const cellHeight = cellDimensionFor(height, rowIndex, rowGap, rowsSpanned, gridTemplateRows)
    // console.log(
    //     "cell (r, c)", row, column,
    //     "dims (w, h)", cellWidth, cellHeight,
    //     "spanned (r, c)", rowsSpanned, columnsSpanned,
    //     "template (r, c)", gridTemplateRows.trackSizes(height, rowGap), gridTemplateColumns.trackSizes(width, columnGap)
    // )
    return (
        <GridCellContext.Provider value={{
            width: cellWidth,
            height: cellHeight,
            row: rowIndex,
            column: columnIndex,
            rowsSpanned, columnsSpanned
        }}>
            <div
                style={{
                    height: cellHeight,
                    width: cellWidth,
                    gridColumnStart: column,
                    gridColumnEnd: Math.min(columnIndex + columnsSpanned, numColumns + 1),
                    gridRowStart: row,
                    gridRowEnd: Math.min(rowIndex + rowsSpanned, numRows + 1),
                    ...debug,
                    ...styles
                }}
            >
                {cloneElement(children, {width: cellWidth, height: cellHeight})}
            </div>
        </GridCellContext.Provider>
    )
}

/**
 * React hook used to provide information about the grid cell.
 * @return The width and height of the grid cell and information about the cell's location and spanning
 */
export function useGridCell(): UseGridCellValues {
    const context = useContext<UseGridCellValues>(GridCellContext)
    const {width, height, row, column} = context
    if (width === undefined || height === undefined || row === undefined || column === undefined) {
        throw new Error("useGridCell can only be used when the parent is a <GridCell/>")
    }
    return context
}
