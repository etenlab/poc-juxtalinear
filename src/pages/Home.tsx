import React, { useContext, useEffect, useRef, useState } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react"
import {
  DragDropContext,
  StrictModeDroppable,
  Draggable,
  DropResult,
  DraggableLocation,
} from "../components/Droppable"
import { Button, Grid, Stack } from "@mui/material"
import "./Home.css"

import { SentenceContext } from "../App"
import { readUsfm } from "../utils/readUsfm"

const grid = 3

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "black",

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
})

const Home: React.FC = () => {
  const usfmOpenRef = useRef<HTMLInputElement>(null)

  const { sentences, curIndex, setSentences } = useContext(SentenceContext)
  const [itemArrays, setItemArrays] = useState<
    { id: string; content: string }[][]
  >([])

  useEffect(() => {
    if (sentences.length) {
      setItemArrays([getItems()])
    }
  }, [sentences, curIndex])

  const getItems = () =>
    sentences[curIndex][0].sourceString
      .split(/ +/)
      .map((w: string, n: number) => ({
        id: `item-${n}`,
        content: w,
      }))

  const openUsfm = () => {
    usfmOpenRef.current?.click()
  }

  const openUsfmHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return
    }

    let srcUsfm
    try {
      srcUsfm = await e.target.files.item(0)?.text()
    } catch (err) {
      console.log(`Could not load srcUsfm: ${err}`)
      return
    }

    setSentences(readUsfm(srcUsfm))
  }

  const reorder = (
    list: { id: string; content: string }[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // dropped outside the list
    if (!destination) {
      return
    }

    const sInd = +source.droppableId
    const dInd = +destination.droppableId

    if (sInd === dInd) {
      const newItems = reorder(
        itemArrays[sInd],
        source.index,
        destination.index
      )
      const newItemArrays = [...itemArrays]
      newItemArrays[sInd] = newItems
      setItemArrays(newItemArrays)
    } else {
      const result = move(
        itemArrays[sInd],
        itemArrays[dInd],
        source,
        destination
      )
      const newItemArrays = [...itemArrays]
      newItemArrays[sInd] = result[sInd]
      newItemArrays[dInd] = result[dInd]

      setItemArrays(newItemArrays.filter((group) => group.length))
    }
  }

  const handleDoubleClick = (item: any, rowN: number, colN: number) => {
    let newItemArrays = [...itemArrays]
    if (colN === newItemArrays[rowN].length || (colN === 0 && rowN === 0)) {
      // first col in first row
      return
    }
    if (colN === 0) {
      // merge with previous row
      newItemArrays[rowN - 1] = [
        ...newItemArrays[rowN - 1],
        ...newItemArrays[rowN],
      ]
      newItemArrays[rowN] = []
      newItemArrays = newItemArrays.filter((a) => a.length)
    } else {
      // Make new row
      newItemArrays = [
        ...newItemArrays.slice(0, rowN),
        newItemArrays[rowN].slice(0, colN),
        newItemArrays[rowN].slice(colN),
        ...newItemArrays.slice(rowN + 1),
      ]
    }
    setItemArrays(newItemArrays)
    console.log(newItemArrays)
  }

  /**
   * Moves an item from one chunk to another chunk.
   */
  const move = (
    source: Iterable<unknown> | ArrayLike<unknown>,
    destination: Iterable<unknown> | ArrayLike<unknown>,
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)

    destClone.splice(droppableDestination.index, 0, removed)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: { [key: string]: any } = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone

    return result
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* <IonHeader collapse="condense"> 
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer /> */}
        <Stack flexDirection={"row"}>
          <Button variant="contained" onClick={openUsfm}>
            Open usfm
          </Button>
          <Button variant="contained">Save usfm</Button>
          <input
            type="file"
            ref={usfmOpenRef}
            onChange={openUsfmHandler}
            hidden
          />
        </Stack>
        <Grid container spacing={2}>
          <Grid item sm={4}>
            {sentences.length ? sentences[curIndex][0].sourceString : ""}
          </Grid>
          <Grid item sm={4}>
            <DragDropContext onDragEnd={onDragEnd}>
              {itemArrays.map((items, n) => (
                <StrictModeDroppable
                  key={n}
                  droppableId={`${n}`}
                  direction="horizontal"
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      {items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              onClick={(event) =>
                                event.detail === 2 &&
                                handleDoubleClick(item, n, index)
                              }
                            >
                              {item.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              ))}
            </DragDropContext>
          </Grid>
          <Grid item sm={4}></Grid>
        </Grid>
      </IonContent>
    </IonPage>
  )
}

export default Home
