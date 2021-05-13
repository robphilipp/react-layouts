import React, {useEffect, useRef, useState} from 'react';
import {useDimensions} from "./DimensionsProvider";
import {Grid, GridCell} from "./Grid";

interface Dimensions {
    width: number
    height: number
}

function App() {
    const {width, height} = useDimensions()

    // console.log("width", width, "window", window.innerWidth, window.outerWidth)
    // console.log("height", height, "window", window.innerHeight, window.outerHeight)

    // return (
    //     <div style={{height: '100%', backgroundColor: 'red'}}>
    //         {/* first div is effectively the margin (a wrapper)*/}
    //         <div style={{height: height - 20, padding: 10}}>
    //         <div style={{height: height - 20 - 20, backgroundColor: 'green', padding: 10}}>
    //             Test ({width}, {height})
    //         </div>
    //         </div>
    //     </div>
    // )

    return (
        <Grid numRows={3} numColumns={2} rowGap={10} columnGap={10}>
            <GridCell row={1} column={1}>
                <div style={{height: '100%', borderStyle: 'none', borderWidth: 1}}>1, 1</div>
            </GridCell>
            <GridCell row={1} column={2}>
                <div style={{height: '100%', borderStyle: 'none', borderWidth: 1}}>1, 2</div>
            </GridCell>
            <GridCell row={2} column={1}>
                <div style={{height: '100%', borderStyle: 'solid', borderWidth: 1}}>1, 2</div>
            </GridCell>
            <GridCell row={2} column={2}>
                <div style={{height: '100%', borderStyle: 'solid', borderWidth: 1}}>2, 2</div>
            </GridCell>
            <GridCell row={3} column={1} columnsSpanned={2}>
                <div style={{height: '100%', borderStyle: 'none', borderWidth: 1}}>3, 1</div>
            </GridCell>
        </Grid>
    )
}

export default App;
