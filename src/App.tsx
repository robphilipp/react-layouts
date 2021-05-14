import React from 'react';
import {Grid, GridCell, useGridCell} from "./Grid";

function App() {
    return (
        <Grid numRows={3} numColumns={3} rowGap={10} columnGap={10} showGrid={false}>
            <GridCell row={1} column={1}>
                {/*<div style={{borderStyle: 'none', borderWidth: 1}}>1, 1</div>*/}
                <CellContents/>
            </GridCell>
            <GridCell row={1} column={2}>
                <CellContents/>
            </GridCell>
            <GridCell row={1} column={3} rowsSpanned={3}>
                <CellContents/>
            </GridCell>
            <GridCell row={2} column={1}>
                <CellContents/>
            </GridCell>
            <GridCell row={2} column={2}>
                <CellContents/>
            </GridCell>
            <GridCell row={3} column={1} columnsSpanned={2}>
                <CellContents/>
            </GridCell>
        </Grid>
    )
}

function CellContents(): JSX.Element {
    const {width, height, row, column, rowsSpanned, columnsSpanned} = useGridCell()
    return (
        <div style={{height}}>
            <div style={{backgroundColor: 'lightgrey', height: '100%'}}>
            <div>{row}, {column}</div>
            <div style={{fontSize: '0.7em', color: 'grey'}}>{width} x {height}</div>
            <div style={{fontSize: '0.7em', color: 'grey'}}>({rowsSpanned}, {columnsSpanned})</div>
            </div>
        </div>
    )
}

export default App;
