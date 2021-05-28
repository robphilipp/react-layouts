import React, {useLayoutEffect, useRef, useState} from 'react';
import {Grid, GridCell, useGridCell} from "./Grid";
import {useFlexItem} from "./Flex";
import {useWindowDimensions} from "./WindowDimensionsProvider";
import {GridTrackTemplate, gridTrackTemplateBuilder, withFraction, withGridTrack, withPixels} from "./gridTemplates";
import {gridArea, gridTemplateAreasBuilder} from "./gridTemplateAreas";

function App() {
    // return (
    //     <FlexContainer
    //         dimensionsSupplier={useWindowDimensions}
    //         flexDirection={FlexDirection.Row}
    //         // justifyContent={JustifyContent.SpaceBetween}
    //         // alignContent={JustifyContent.SpaceAround}
    //         // alignItems={Align.Stretch}
    //         columnGap={0}
    //     >
    //         <FlexItem order={3}>
    //             <BoxContents name='1a'/>
    //             <BoxContents name='1b'/>
    //             <BoxContents name='1c'/>
    //             {/*<FlexContainer*/}
    //             {/*    dimensionsSupplier={useFlexItem}*/}
    //             {/*    flexDirection={FlexDirection.Row}*/}
    //             {/*    // justifyContent={JustifyContent.SpaceEvenly}*/}
    //             {/*    alignContent={Align.Stretch}*/}
    //             {/*    // alignItems={Align.Stretch}*/}
    //             {/*    columnGap={0}*/}
    //             {/*>*/}
    //             {/*    <FlexItem>*/}
    //             {/*        <BoxContents name='1a'/>*/}
    //             {/*    </FlexItem>*/}
    //             {/*    <FlexItem>*/}
    //             {/*        <BoxContents name='1b'/>*/}
    //             {/*    </FlexItem>*/}
    //             {/*    <FlexItem>*/}
    //             {/*        <BoxContents name='1c'/>*/}
    //             {/*    </FlexItem>*/}
    //             {/*</FlexContainer>*/}
    //         </FlexItem>
    //         <FlexItem alignSelf={Align.FlexStart}>
    //             <BoxContents name='2a'/>
    //         </FlexItem>
    //         <FlexItem flexBasis={300} order={-1} alignSelf={Align.Stretch}>
    //             <BoxContents name='3a'/>
    //         </FlexItem>
    //     </FlexContainer>
    // )

    const [showLast, setShowLast] = useState<boolean>(true)

    function createNestedGridTemplateColumn(showLast: boolean): GridTrackTemplate {
        return gridTrackTemplateBuilder()
            .repeatFor(showLast ? 3 : 2, withGridTrack(withFraction(1), 'last one'))
            .build()
    }

    return (
        <Grid
            dimensionsSupplier={useWindowDimensions}
            gridTemplateColumns={gridTrackTemplateBuilder()
                .addTrack(withPixels(150))
                .addTrack(withFraction(1))
                .addTrack(withPixels(100))
                .build()
            }
            gridTemplateRows={gridTrackTemplateBuilder()
                .addTrack(withPixels(65))
                .addTrack(withFraction(1))
                .addTrack(withPixels(40))
                .build()
            }
            gridTemplateAreas={gridTemplateAreasBuilder()
                .addArea('header', gridArea(1, 1, 1, 3))
                .addArea('sidebar', gridArea(2, 1))
                .addArea('main', gridArea(2, 2))
                .addArea('aside', gridArea(2, 3))
                .addArea('footer', gridArea(3, 1, 1, 3))
                .build()
            }
            rowGap={5}
            columnGap={5}
            showGrid={false}
        >
            <GridCell gridAreaName='header'>
                <CellContents/>
            </GridCell>
            <GridCell row={2} column={1}>
                <CellContents/>
            </GridCell>
            <GridCell gridAreaName='main'>
                <Grid
                    dimensionsSupplier={useGridCell}
                    gridTemplateColumns={createNestedGridTemplateColumn(showLast)}
                    columnGap={1}
                    rowGap={1}
                >
                    <GridCell column={1} row={1}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={1} row={2}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={3} row={3} isVisible={showLast}>
                        <CellContents showRemoveButton={true} onRemoveButtonClick={() => setShowLast(false)}/>
                    </GridCell>
                    <GridCell column={1} row={4}>
                        <CellContents/>
                    </GridCell>
                    <GridCell column={2} row={1} rowsSpanned={4}>
                        <CellContents/>
                    </GridCell>
                </Grid>
            </GridCell>
            <GridCell gridAreaName='aside'>
                <CellContents/>
            </GridCell>
            <GridCell gridAreaName='footer'>
                <CellContents/>
            </GridCell>
        </Grid>
    )
    // return (
    //     <Grid
    //         dimensionsSupplier={useWindowDimensions}
    //         gridTemplateColumns={gridTrackTemplateBuilder()
    //             .addTrack(withPixels(200), withLineNames('nav'))
    //             .repeatFor(2, withGridTrack(withFraction(1), 'last one'))
    //             .build()
    //         }
    //         rowGap={5}
    //         columnGap={5}
    //         showGrid={false}
    //     >
    //         <GridCell row={1} column='nav'>
    //             <CellContents/>
    //         </GridCell>
    //         <GridCell row={1} column={2}>
    //             <CellContents/>
    //         </GridCell>
    //         <GridCell row={1} column={3} rowsSpanned={3}>
    //             <Grid
    //                 dimensionsSupplier={useGridCell}
    //                 gridTemplateColumns={gridTrackTemplateBuilder()
    //                     .repeatFor(3, withGridTrack(withFraction(1), 'last one'))
    //                     .build()}
    //                 columnGap={1}
    //                 rowGap={1}
    //             >
    //                 <GridCell column={1} row={1}>
    //                     <CellContents/>
    //                 </GridCell>
    //                 <GridCell column={1} row={2}>
    //                     <CellContents/>
    //                 </GridCell>
    //                 <GridCell column={3} row={3}>
    //                     <CellContents/>
    //                 </GridCell>
    //                 <GridCell column={1} row={4}>
    //                     <CellContents/>
    //                 </GridCell>
    //                 <GridCell column={2} row={1} rowsSpanned={4}>
    //                     <CellContents/>
    //                 </GridCell>
    //             </Grid>
    //             {/*<CellContents/>*/}
    //         </GridCell>
    //         <GridCell row={2} column='nav'>
    //             <CellContents/>
    //         </GridCell>
    //         <GridCell row={2} column={2}>
    //             <CellContents/>
    //         </GridCell>
    //         <GridCell row={3} column='nav' columnsSpanned={2}>
    //             <CellContents/>
    //         </GridCell>
    //     </Grid>
    // )
}

function noop() {
    /* empty */
}

function removeButton(onClick: () => void): JSX.Element {
    return (
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <button onClick={onClick}>Remove</button>
        </div>
    )
}

interface CellContentsProps {
    showRemoveButton?: boolean
    onRemoveButtonClick?: () => void
}

function CellContents(props: CellContentsProps): JSX.Element {
    const {showRemoveButton = false, onRemoveButtonClick = noop} = props
    const {width, height, row, column, rowsSpanned, columnsSpanned} = useGridCell()
    if (width > 130) {
        return (
            <div style={{height}}>
                <div style={{backgroundColor: 'lightgrey', height: '100%'}}>
                    <div>
                        <span>{row}, {column}</span>
                        <span style={{fontSize: '0.7em', color: 'grey', marginLeft: 7}}>{width} x {height}</span>
                        <span style={{
                            fontSize: '0.7em',
                            color: 'grey',
                            marginLeft: 7
                        }}>({rowsSpanned} x {columnsSpanned})</span>
                    </div>
                    <Canvas width={width - 20} height={height / 3}/>
                    {showRemoveButton ? removeButton(onRemoveButtonClick) : <span/>}
                </div>
            </div>
        )
    }
    return (
        <div style={{height}}>
            <div style={{backgroundColor: 'lightgrey', height: '100%'}}>
                <div>{row}, {column}</div>
                <div style={{fontSize: '0.7em', color: 'grey'}}>{width} x {height}</div>
                <div style={{fontSize: '0.7em', color: 'grey'}}>({rowsSpanned} x {columnsSpanned})</div>
                <Canvas width={width / 2} height={height / 3}/>
                {showRemoveButton ? removeButton(onRemoveButtonClick) : <span/>}
            </div>
        </div>
    )
}

interface CanvasProps {
    width: number
    height: number
}


function Canvas(props: CanvasProps): JSX.Element {
    const {width, height} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useLayoutEffect(
        () => {
            if (canvasRef.current !== null) {
                const context = canvasRef.current.getContext('2d')
                if (context) {
                    context.fillStyle = `rgb(${width % 255}, ${height % 255}, 100)`
                    context.rect(10, 10, width - 10, height - 10)
                    context.fill()
                }
            }
        },
        [width, height]
    )

    return <canvas ref={canvasRef} width={width} height={height}/>
}

function BoxContents(props: { name: string }): JSX.Element {
    const {name} = props
    const {width, height} = useFlexItem()
    return (
        <div>
            <div>{name}</div>
            <div style={{color: 'gray', fontSize: '0.7em', marginRight: 5}}>{width}x{height}</div>
        </div>
    )
}

export default App;
