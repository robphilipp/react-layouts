import * as React from "react";
import {cloneElement} from "react";

export enum AlignItems {
    Center = 'center',
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
    children: JSX.Element | Array<JSX.Element>
}

export function FlexContainer(props: FlexProps): JSX.Element {
    const {
        flexDirection = FlexDirection.Row,
        alignItems = AlignItems.Center,
        justifyContent = JustifyContent.SpaceAround,
        flexWrap = FlexWrap.NoWrap,
        children
    } = props

    function enrich(children: JSX.Element | Array<JSX.Element>): JSX.Element | Array<JSX.Element> {
        const childElements = Array.isArray(children) ? children : [children];
        return childElements.map(child => cloneElement(child, {}))
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection,
                alignItems,
                justifyContent
            }}
        >
            {enrich(children)}
        </div>
    )
}

interface FlexItemProps {
    children: JSX.Element
}

export function FlexItem(props: FlexItemProps): JSX.Element {
    const {
        children
    } = props

    return (
        <div style={{display: 'flex'}}>{children}</div>
    )
}

