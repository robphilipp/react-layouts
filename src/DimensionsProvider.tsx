import * as React from "react";
import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";

interface UseDimensionValues {
    width: number
    height: number
}

type Dimensions = UseDimensionValues

const initialDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
}

const DimensionsContext = createContext<UseDimensionValues>(initialDimensions)

interface Props {
    children: JSX.Element | Array<JSX.Element>
}

export function DimensionsProvider(props: Props): JSX.Element {
    const {children} = props;

    // const divRef = useRef<HTMLDivElement>(null)
    const currentDimensionsRef = useRef<Dimensions>({width: 0, height: 0})
    const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions)
    const updateDimensions = useCallback(
        () => {
            const winDim = {width: window.innerWidth, height: window.innerHeight}
            if (distance(currentDimensionsRef.current, winDim, 2)) {
                setDimensions(winDim)
            }
        },
        [currentDimensionsRef]
    )

    useEffect(
        () => {
            updateDimensions()
            window.addEventListener('resize', updateDimensions)

            return () => {
                window.removeEventListener('resize', updateDimensions)
            }
        },
        [updateDimensions]
    )

    function distance(d1: Dimensions, d2: Dimensions, threshold: number): boolean {
        return (Math.sqrt(
            (d1.width - d2.width) * (d1.width - d2.width) +
            (d1.height - d2.height) * (d1.height - d2.height)
        )) > threshold
    }


    return (
        // <div
        //     // ref={divRef}
        //     style={{
        //         height: '100vh',
        //         width: '100%',
        //         margin: 0,
        //         padding: 0,
        //         // backgroundColor: 'red'
        //     }}>
            <DimensionsContext.Provider value={dimensions}>
                {children}
            </DimensionsContext.Provider>
        // </div>
    );
}

/**
 * React hook that must be used within a {@link DimensionsProvider}
 * @return The dimensions values of the element
 */
export function useDimensions(): UseDimensionValues {
    const context = useContext<UseDimensionValues>(DimensionsContext)
    const {width, height} = context
    if (width === undefined || height === undefined) {
        throw new Error("useDimensions can only be used when the parent is a <DimensionsProvider/>")
    }
    return context
}
