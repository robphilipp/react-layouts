import React, {useEffect, useRef, useState} from 'react';
import {useDimensions} from "./DimensionsProvider";

interface Dimensions {
    width: number
    height: number
}

function App() {
    const {width, height} = useDimensions()

    // console.log("width", width, "window", window.innerWidth, window.outerWidth)
    // console.log("height", height, "window", window.innerHeight, window.outerHeight)

    return (
        <div style={{height: '100%', backgroundColor: 'red'}}>
            {/* first div is effectively the margin (a wrapper)*/}
            <div style={{height: height - 20, padding: 10}}>
            <div style={{height: height - 20 - 20, backgroundColor: 'green', padding: 10}}>
                Test ({width}, {height})
            </div>
            </div>
        </div>
    )
}

export default App;
