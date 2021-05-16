import * as React from 'react'
import {cloneElement, createContext, CSSProperties, useContext} from "react";
import {Dimensions} from "./dimensions";

interface UseGridValues {
    width: number
    height: number
    numRows: number
    numColumns: number
    rowGap: number
    columnGap: number
    showGrid: boolean
}

const initialGridValues = {
    width: 10,
    height: 10,
    numRows: 1,
    numColumns: 1,
    rowGap: 0,
    columnGap: 0,
    showGrid: false
}

const GridContext = createContext<UseGridValues>(initialGridValues)

export interface Props {
    // supplies the dimensions of the (parent) container whose dimensions
    // this grid uses.
    dimensionsSupplier: () => Dimensions
    // the number of rows in the grid
    numRows: number
    // the number of columns in the grid
    numColumns: number
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
        numRows,
        numColumns,
        rowGap = 0,
        columnGap = 0,
        showGrid = false,
        styles,
        children
    } = props

    const {width, height} = dimensionsSupplier()

    if (width === undefined || height === undefined) {
        return <></>
    }
    if (numRows <= 0) {
        throw new Error(`<Grid/> rows must be 1 or larger; specified rows: ${numRows}`)
    }
    if (numColumns <= 0) {
        throw new Error(`<Grid/> columns must be 1 or larger; specified columns: ${numColumns}`)
    }

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
            numRows, numColumns,
            rowGap, columnGap,
            showGrid
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                gridTemplateRows: `repeat(${numRows}, 1fr)`,
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
    column: number
    columnsSpanned?: number
    row: number
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
        numRows, numColumns,
        rowGap, columnGap,
        showGrid
    } = useContext<UseGridValues>(GridContext)

    if (row < 1 || row > numRows) {
        throw new Error(
            `<GridCell/> row must be greater than 1 and less than the number of rows; number rows: ${numRows}; row: ${row}`
        )
    }
    if (rowsSpanned < 1) {
        throw new Error(
            `The number of rows spanned by this <GridCell/> greater than 1; rows spanned: ${rowsSpanned}`
        )
    }
    if (column < 1 || column > numColumns) {
        throw new Error(
            `<GridCell/> column must be greater than 1 and less than the number of columns; number columns: ${numColumns}; column: ${column}`
        )
    }
    if (columnsSpanned < 1) {
        throw new Error(
            `The number of columns spanned by this <GridCell/> greater than 1; columns spanned: ${columnsSpanned}`
        )
    }

    /**
     * Calculates the dimension (i.e. width or height) of the grid cell, accounting for the cell gap and
     * column and row spanning.
     * @param dim The overall dimension (i.e. width or height) of the area
     * @param num The number of rows or columns
     * @param gap The row or column gap
     * @param spanned The number of rows or columns spanned by this cell
     * @return The dimension (i.e. width or height) of the cell
     */
    function dimension(dim: number, num: number, gap: number, spanned: number): number {
        const corr = showGrid ? 1 : 0
        return Math.floor(
            (dim - (num - 1) * gap) * spanned / num + (spanned - 1) * gap - (corr / 2) * num + (spanned - 1) * corr
        )
    }

    const debug: CSSProperties = showGrid ?
        {borderStyle: 'dashed', borderWidth: 1, borderColor: 'lightgrey'} :
        {}
    const cellWidth = dimension(width, numColumns, columnGap, columnsSpanned)
    const cellHeight = dimension(height, numRows, rowGap, rowsSpanned)
    return (
        <GridCellContext.Provider value={{
            width: cellWidth,
            height: cellHeight,
            row, column,
            rowsSpanned, columnsSpanned
        }}>
            <div
                style={{
                    height: cellHeight,
                    width: cellWidth,
                    gridColumnStart: column,
                    gridColumnEnd: Math.min(column + columnsSpanned, numColumns + 1),
                    gridRowStart: row,
                    gridRowEnd: Math.min(row + rowsSpanned, numRows + 1),
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