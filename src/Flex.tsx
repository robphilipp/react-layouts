import * as React from "react";
import {cloneElement, createContext, CSSProperties, useCallback, useContext, useRef, useState} from "react";
import {Dimensions} from "./dimensions";

export enum AlignItems {
    Center = 'center',
    Stretch = 'stretch',
    FlexStart = 'flex-start',
    FlexEnd = 'flex-end',
}

export enum JustifyContent {
    SpaceAround = 'space-around',
    SpaceEvenly = 'space-evenly',
    SpaceBetween = 'space-between',
    NoSpace = 'space-none'
}

export enum FlexDirection {
    Row = 'row',
    Column = 'column',
}

export enum FlexWrap {
    Wrap = 'wrap',
    NoWrap = 'nowrap',
    WrapReverse = 'wrap-reverse',
}

interface UseFlexValues {
    width?: number
    height?: number
    flexDirection: FlexDirection
}

const initialFlexValues: UseFlexValues = {
    width: undefined,
    height: undefined,
    flexDirection: FlexDirection.Row
}

const FlexContext = createContext<UseFlexValues>(initialFlexValues)

interface FlexProps {
    // supplies the dimensions of the (parent) container whose dimensions
    // this grid uses.
    dimensionsSupplier?: () => Dimensions
    // the layout direction, or the direction of the main axis
    flexDirection?: FlexDirection
    // alignment for the cross-axis (i.e. if flex direction is row, this would align vertically,
    // or if the flex direction is column, this would align horizontally)
    alignItems?: AlignItems
    flexWrap?: FlexWrap
    columnGap?: number
    rowGap?: number
    styles?: CSSProperties
    children: JSX.Element | Array<JSX.Element>
}

export function FlexContainer(props: FlexProps): JSX.Element {
    const {
        dimensionsSupplier,
        flexDirection = FlexDirection.Row,
        alignItems = AlignItems.Center,
        flexWrap = FlexWrap.NoWrap,
        columnGap,
        rowGap,
        styles = {},
        children
    } = props

    const {width, height} = dimensionsSupplier ? dimensionsSupplier() : {width: undefined, height: undefined}

    function enrich(children: JSX.Element | Array<JSX.Element>): JSX.Element | Array<JSX.Element> {
        const childElements = Array.isArray(children) ? children : [children];
        return childElements.map(child => cloneElement(child, {
            width, height,
            flexDirection,
        }))
    }

    return (
        <FlexContext.Provider value={{
            width, height, flexDirection
        }}>
            <div
                style={{
                    ...styles,
                    width, height,
                    display: 'flex',
                    flexDirection,
                    alignItems,
                    flexWrap,
                    columnGap,
                    rowGap,
                }}
            >
                {enrich(children)}
            </div>
        </FlexContext.Provider>
    )
}

interface UseFlexItemValues {
    width?: number
    height?: number
    flexDirection: FlexDirection
}

const initialFlexItemValues: UseFlexItemValues = {
    width: undefined,
    height: undefined,
    flexDirection: FlexDirection.Row
}

const FlexItemContext = createContext<UseFlexItemValues>(initialFlexItemValues)

interface FlexItemProps {
    flexGrow?: number
    flexBasis?: number
    flexShrink?: number
    justifyContent?: JustifyContent
    alignSelf?: AlignItems
    order?: number
    children: JSX.Element | Array<JSX.Element>
}

export function FlexItem(props: FlexItemProps): JSX.Element {
    const {
        flexGrow,
        flexBasis,
        flexShrink,
        justifyContent = JustifyContent.SpaceAround,
        alignSelf,
        order,
        children,
    } = props

    const {width, height, flexDirection} = useContext<UseFlexValues>(FlexContext)

    const [cellDimensions, setCellDimensions] = useState<Dimensions>({width: 10, height: 10})
    const divRef = useCallback(
        (node: HTMLDivElement) => {
            if (node !== null) {
                // const {width: cellWidth, height: cellHeight} = node.getBoundingClientRect()
                const dims = node.getBoundingClientRect()
                if (flexDirection === FlexDirection.Row) {
                    dims.height = height || dims.height
                } else {
                    dims.width = width || dims.width
                }
                setCellDimensions({width: Math.floor(dims.width), height: Math.floor(dims.height)})
            }
        },
        [width, height]
    )

    function enrich(children: JSX.Element | Array<JSX.Element>): JSX.Element | Array<JSX.Element> {
        const childElements = Array.isArray(children) ? children : [children];
        return childElements.map(child => cloneElement(child, {
            width: cellDimensions.width,
            height: cellDimensions.height
        }))
    }

    return (
        <FlexItemContext.Provider value={{
            width: cellDimensions.width,
            height: cellDimensions.height,
            flexDirection
        }}>
            <div ref={divRef} style={{
                display: 'flex',
                flexGrow,
                flexBasis,
                flexShrink,
                justifyContent: justifyContent === JustifyContent.NoSpace ? undefined : justifyContent,
                alignSelf,
                order,
            }}>
                {enrich(children)}
            </div>
        </FlexItemContext.Provider>
    )
}

export function useFlexItem(): UseFlexItemValues {
    const context = useContext<UseFlexItemValues>(FlexItemContext)
    return context
}

