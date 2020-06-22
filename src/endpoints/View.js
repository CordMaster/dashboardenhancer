import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';
import Tile, { DragPreviewTile, DragPreviewUnderTile } from '../Tile/Tile';
import { devLog, rectInside, growRect, rectOverlaps, rectsIdentical } from '../Utils';
import { useDrop, useDragLayer } from 'react-dnd';
import { modifyImmutableCollection } from '../contexts/useCollection';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    height: '100%',

    position: 'relative',

    overflow: 'hidden',

    userSelect: 'none'
  },

  popCover: {
    position: 'absolute',

    //top and bottom computed with scroll
    left: '-16px',
    right: 0,

    zIndex: 3,

    display: 'none',
    opacity: 0,


    backgroundColor: 'black',
    transition: 'opacity 250ms linear',

    '&.popped': {
      display: 'block',
      opacity: 0.5
    }
  },

  fabContainer: {
    position: 'absolute',

    zIndex: 100,

    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },

  fab: {
    '&:not(:last-child)': {
      marginRight: theme.spacing(2)
    },

    '&.dropHover': {
      cursor: 'default',

      filter: 'brightness(0.5)'
    }
  },

  addingTile: {
    position: 'absolute',

    zIndex: 2
  },

  addingTileText: {
    display: 'block'
  },

  '@keyframes fadein': {
    from: {
      opacity: 0
    },

    to: {
      opacity: 1
    }
  }
}));

export default function({ index, className, isSmall, style, ...props }) {
  const classes = useStyles();

  const { dashboards, modifyDashboards, config } = useContext(MainContext);

  const tiles = dashboards[index].tiles;
  //devLog(tiles);

  const smallRows = window.innerHeight > window.innerWidth ? 5 : 3;
  const smallCols = window.innerHeight > window.innerWidth ? 3 : 5;

  const rows = isSmall ? smallRows : config.panelRows;
  const cols = isSmall ? smallCols : config.panelCols;

  const newTileTemplate = {
    x: 1,
    y: rows - 2,
    w: 1,
    h: 1
  }

  const modifyTile = modifyImmutableCollection(dashboards[index].tiles, newTileTemplate, (state) => {
    modifyDashboards({ type: 'modify', index, data: { tiles: state } });
  });

  const containerRef = useRef({ scrollTop: 0 });

  const attachRef = ref => {
    containerRef.current = ref;
    dropRef(ref);
  }

  const [editMode, _setEditMode] = useState(false);
  const [addingTile, setAddingTile] = useState(null);

  const setEditMode = state => {
    _setEditMode(state);
    if(state === false) setAddingTile(false);
  }

  //prevent tile intersection
  const validateTilePosition = (srcTileIndex, desired) => {
    //wall bound check
    if(!rectInside(desired, { x: 0, y: 0, w: cols, h: rows })) return false;

    //other rect check
    for(let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      if(i !== srcTileIndex && rectOverlaps(desired, tile)) {
        return false;
      }
    }

    return true;
  }

  //convert pixels to snapped cols or rows and vice-versa
  const pxToRowsAndCols = delta => {
    return {
      x: Math.round((delta.x / containerRef.current.clientWidth) * cols),
      y: Math.round((delta.y / containerRef.current.clientHeight) * rows),
    }
  }

  const tilePositionToReal = tilePosition => {   
    const dimensions = {
      w: `${100 / (cols / tilePosition.w)}%`,
      h: `${100 / (rows / tilePosition.h)}%`,
      x: `${(100 / cols) * tilePosition.x}%`,
      y: `${(100 / rows) * tilePosition.y}%`
    }

    return dimensions;
  }

  const [dropProps, dropRef] = useDrop({
    accept: ['tile', 'tile-resize'],

    drop: (item, monitor) => {
      if(!monitor.didDrop()) {
        const type = item.type;

        const tileIndex = item.index;
        const delta = monitor.getDifferenceFromInitialOffset();
        const tile = item.tile;
        
        const deltaNorm = pxToRowsAndCols(delta);

        if(type === 'tile') {
          const newPosition = {
            x: tile.x + deltaNorm.x,
            y: tile.y + deltaNorm.y,
            w: tile.w,
            h: tile.h
          }

          if(validateTilePosition(tileIndex, newPosition)) {
            if(item.isNew) {
              modifyTile({ type: 'new', data: newPosition });
              setAddingTile(null);
            } else {
              modifyTile({ type: 'modify', index: tileIndex, data: newPosition });
            }

            return {};
          }
        } else if(type === 'tile-resize') {
          const newPosition = {
            x: tile.x,
            y: tile.y,
            w: tile.w + deltaNorm.x,
            h: tile.h + deltaNorm.y
          }

          if(validateTilePosition(tileIndex, newPosition)) {
            modifyTile({ type: 'modify', index: tileIndex, data: newPosition });

            return {};
          }

          return {};
        }
      }
    },

    collect: monitor => {
      return {
        canDrop: monitor.canDrop(),
        item: monitor.getItem(),

        isNew: monitor.getItem() && monitor.getItem().isNew,
      }
    }
  });

  const dragLayerProps = useDragLayer(monitor => {
    let position = {};
    let normPosition = {};

    const delta = monitor.getDifferenceFromInitialOffset();

    if(monitor.isDragging() && delta) {
      const item = monitor.getItem();
      const type = item.type;
      const tileIndex = item.index;
      const tile = item.tile;

      const deltaNorm = pxToRowsAndCols(delta);

      position = tilePositionToReal(tile);

      if(type === 'tile') {
        position.x = `calc(${position.x} + ${delta.x}px)`;
        position.y = `calc(${position.y} + ${delta.y}px)`;

        const newNormPosition = {
          x: tile.x + deltaNorm.x,
          y: tile.y + deltaNorm.y,
          w: tile.w,
          h: tile.h
        }

        if(validateTilePosition(tileIndex, newNormPosition)) normPosition = tilePositionToReal(newNormPosition);
      } else if(type === 'tile-resize') {
        position.w = `calc(${position.w} + ${delta.x}px)`;
        position.h = `calc(${position.h} + ${delta.y}px)`;

        const newNormPosition = {
          x: tile.x,
          y: tile.y,
          w: tile.w + deltaNorm.x,
          h: tile.h + deltaNorm.y
        }
        
        if(validateTilePosition(tileIndex, newNormPosition)) normPosition = tilePositionToReal(newNormPosition);
      } 
    }

    return {
      isDragging: monitor.isDragging(),

      position,
      normPosition
    }
  });

  const [duplicateDropProps, duplicateDropRef] = useDrop({
    accept: 'tile',

    drop: (item, monitor) => {
      const tile = item.tile;

      const newTile = {
        ...tile,

        x: newTileTemplate.x,
        y: newTileTemplate.y - tile.h + 1
      }

      setAddingTile(newTile);

      return {};
    },

    collect: monitor => {
      return {
        isOver: monitor.isOver()
      }
    }
  });

  const [deleteDropProps, deleteDropRef] = useDrop({
    accept: 'tile',

    drop: (item, monitor) => {
      const tileIndex = item.index;

      modifyTile({ type: 'delete', index: tileIndex });

      return {};
    },

    collect: monitor => {
      return {
        isOver: monitor.isOver()
      }
    }
  });

  //tile popping
  const [popped, setPopped] = useState(-1);

  useEffect(() => {
    const unPop = () => {
      setPopped(-1);
    }

    window.addEventListener('click', unPop);
    return () => window.removeEventListener('click', unPop);
  }, []);
  //tile popping

  //rows and cols are 1-indexed
  let smallCol = 1;
  let smallRow = 1;

  const uiTiles = tiles.map((tile, tileIndex) => {
    let ret = false;

    //const device = devices[tile.device];

    const dimensionsWithMobile = {
      x: isSmall ? smallCol : tile.x,
      y: isSmall ? smallRow : tile.y,
      w: isSmall ? 1 : tile.w,
      h: isSmall ? 1 : tile.h
    }

    const dimensions = tilePositionToReal(dimensionsWithMobile);
    
    /*
    const colPercentStr = `calc(100% / ${cols / colSpan})`;
    const rowPercentStr = `calc(100% / ${rows / rowSpan})`;

    const dimensions = {
      w: `${colPercentStr}`,
      h: `${rowPercentStr}`,
      x: `calc(calc(100% / ${cols}) * ${col})`,
      y: `calc(calc(100% / ${rows}) * ${row})`
    }
    */

    ret = <Tile key={tile.id} index={tileIndex} tile={tile} preview={editMode} isEditing={editMode} canDrag={editMode} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} containerRef={containerRef} {...dimensions} />

    smallCol++;
    if(smallCol > smallCols) {
      smallRow++;
      smallCol = 1;
    }

    return ret;
  });

  const mergedStyles = Object.assign({}, style, {
    overflowY: !dropProps.canDrop && popped === -1 ? 'auto' : 'hidden'
  });

  const popCoverStyles = {
    top: `calc(-16px + ${containerRef.current.scrollTop}px)`,
    bottom: `-${containerRef.current.scrollTop}px`
  }

  return (
    <Paper className={`${classes.container} ${className}`} ref={attachRef} square elevation={0} style={mergedStyles} {...props}>
      {uiTiles}
      <div className={`${classes.popCover} ${popped !== -1 && 'popped'}`} style={popCoverStyles}></div>

      { !isSmall &&
        <div className={classes.fabContainer}>
          { dropProps.canDrop && dropProps.item.type === 'tile' && !dropProps.isNew &&
            <Fragment>
              <Fab ref={duplicateDropRef} className={`${classes.fab} ${duplicateDropProps.isOver ? 'dropHover' : ''}`} variant="extended" disableRipple>
                <Icons.mdiContentCopy />
                Duplicate
              </Fab>

              <Fab ref={deleteDropRef} className={`${classes.fab} ${deleteDropProps.isOver ? 'dropHover' : ''}`} variant="extended" color="secondary" disableRipple>
                <Icons.mdiDelete />
                Delete
              </Fab>
            </Fragment>
          }

          { !(dropProps.canDrop && dropProps.item.type === 'tile') &&
            <Fragment>
              { editMode &&
                <Fragment>
                  { !addingTile ?
                    <Fab className={classes.fab} variant="extended" color="primary" onClick={() => setAddingTile(newTileTemplate)}>
                      <Icons.mdiPlus />
                      Add
                    </Fab>
                    :
                    <Fab className={classes.fab} variant="extended" color="secondary" onClick={() => setAddingTile(null)}>
                      <Icons.mdiCancel />
                      Cancel
                    </Fab>
                  }
                </Fragment>
              }

              <Fab className={classes.fab} color="primary" onClick={() => setEditMode(!editMode)}>
                { !editMode ? <Icons.mdiPencil /> : <Icons.mdiCheck /> }
              </Fab>
            </Fragment>
          }
        </div>
      }

      { dragLayerProps.isDragging && <DragPreviewTile {...dragLayerProps.position} /> }
      { dragLayerProps.isDragging && <DragPreviewUnderTile {...dragLayerProps.normPosition} /> }

      { addingTile && !dropProps.isNew &&
        <Fragment>
          <Tile index={-1} tile={addingTile} relative canDrag isEditing {...tilePositionToReal(addingTile)} />
          <TileAddBackdrop {...tilePositionToReal(growRect(addingTile, 0.5))} />
        </Fragment>
      }
    </Paper>
  );
}

function TileAddBackdrop({ x, y, w, h }) {
  const classes = useStyles();

  const styles = {
    top: y,
    left: x,
    width: w,
    height: h
  }

  return (
    <Paper className={classes.addingTile} style={styles}>
      <Typography className={classes.addingTileText} variant="caption" align="center">Drag to add</Typography>
    </Paper>
  )
}