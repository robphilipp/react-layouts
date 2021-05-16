import * as React from "react";
import {cloneElement, CSSProperties} from "react";

export enum AlignItems {
    Center = 'center',
    Stretch = 'stretch',
    FlexStart = 'flex-start',
    FlexEnd = 'flex-end',
}

export enum JustifyContent {
    SpaceAround = 'space-around',
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

interface FlexProps {
    flexDirection?: FlexDirection
    alignItems?: AlignItems
    justifyContent?: JustifyContent
    flexWrap?: FlexWrap
    styles?: CSSProperties
    children: JSX.Element | Array<JSX.Element>
}

export function FlexContainer(props: FlexProps): JSX.Element {
    const {
        flexDirection = FlexDirection.Row,
        alignItems = AlignItems.Center,
        justifyContent = JustifyContent.SpaceAround,
        flexWrap = FlexWrap.NoWrap,
        styles = {},
        children
    } = props

    function enrich(children: JSX.Element | Array<JSX.Element>): JSX.Element | Array<JSX.Element> {
        const childElements = Array.isArray(children) ? children : [children];
        return childElements.map(child => cloneElement(child, {}))
    }

    return (
        <div
            style={{
                ...styles,
                display: 'flex',
                flexDirection,
                alignItems,
                flexWrap,
                justifyContent,
            }}
        >
            {enrich(children)}
        </div>
    )
}

interface FlexItemProps {
    flexGrow?: number
    flexBasis?: number
    flexShrink?: number
    alignSelf?: AlignItems
    children: JSX.Element
}

export function FlexItem(props: FlexItemProps): JSX.Element {
    const {
        flexGrow,
        flexBasis,
        flexShrink,
        alignSelf,
        children,
    } = props

    // const style: CSSProperties = {
    //     display: 'flex'
    // }
    //
    // if (proportion !== undefined) {
    //     style.flexGrow = proportion
    // }
    // if (minimumSize !== undefined) {
    //     style.flexBasis = minimumSize
    // }
    // return (
    //     <div style={style}>
    //         {children}
    //     </div>
    // )
    return (
        <div style={{
            display: 'flex',
            flexGrow,
            flexBasis,
            flexShrink,
            alignSelf,
        }}>
            {children}
        </div>
    )
}

