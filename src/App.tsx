import React from 'react';
import {Grid, GridCell, useGridCell} from "./Grid";
import {useWindowDimensions} from "./WindowDimensionsProvider";

function App() {
    return (
        <Grid
            dimensionsSupplier={useWindowDimensions}
            numRows={3}
            numColumns={3}
            rowGap={10}
            columnGap={10}
            showGrid={false}
        >
            <GridCell row={1} column={1}>
                <CellContents/>
            </GridCell>
            <GridCell row={1} column={2}>
                <CellContents/>
            </GridCell>
            <GridCell row={1} column={3} rowsSpanned={3}>
                <Grid
                    dimensionsSupplier={useGridCell}
                    numRows={4}
                    numColumns={2}
                    columnGap={5}
                    rowGap={5}
                >
                    <GridCell column={1} row={1}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={1} row={2}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={1} row={3}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={1} row={4}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={2} row={1} rowsSpanned={4}>
                        <CellContents/>
                    </GridCell>
                </Grid>
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
