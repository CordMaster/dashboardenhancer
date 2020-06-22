import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';
import Tile, { DragPreviewTile } from '../Tile/Tile';
import { devLog, rectInside, expandRect, rectOverlaps } from '../Utils';
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
      filter: 'brightness(0.5)'
    }
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

  const modifyTile = modifyImmutableCollection(dashboards[index].tiles, {}, (state) => {
    modifyDashboards({ type: 'modify', index, data: { tiles: state } });
  });

  const smallRows = window.innerHeight > window.innerWidth ? 5 : 3;
  const smallCols = window.innerHeight > window.innerWidth ? 3 : 5;

  const rows = isSmall ? smallRows : config.panelRows;
  const cols = isSmall ? smallCols : config.panelCols;

  const containerRef = useRef({ scrollTop: 0 });

  const attachRef = ref => {
    containerRef.current = ref;
    dropRef(ref);
  }

  const [editMode, setEditMode] = useState(false);

  //prevent tile intersection
  const validateTilePosition = (desired) => {
    if(!rectInside(desired, expandRect({ x: 0, y: 0, w: cols, h: rows }, 1))) return false;

    for(let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      if(rectOverlaps(desired, expandRect(tile, -1)) || rectOverlaps(tile, expandRect(desired, -1))) return false;
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
    const colPercentStr = `calc(100% / ${cols / tilePosition.w})`;
    const rowPercentStr = `calc(100% / ${rows / tilePosition.h})`;
    
    const dimensions = {
      w: `${colPercentStr}`,
      h: `${rowPercentStr}`,
      x: `calc(calc(100% / ${cols}) * ${tilePosition.x})`,
      y: `calc(calc(100% / ${rows}) * ${tilePosition.y})`
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
        const tile = dashboards[index].tiles[tileIndex];
        
        const deltaNorm = pxToRowsAndCols(delta);

        if(type === 'tile') {
          const newPosition = {
            x: tile.x + deltaNorm.x,
            y: tile.y + deltaNorm.y,
            w: tile.w,
            h: tile.h
          }

          if(validateTilePosition(newPosition)) {
            modifyTile({ type: 'modify', index: tileIndex, data: newPosition });

            return {};
          }
        } else if(type === 'tile-resize') {
          const newPosition = {
            x: tile.x,
            y: tile.y,
            w: tile.w + deltaNorm.x,
            h: tile.h + deltaNorm.y
          }

          if(validateTilePosition(newPosition)) {
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
        item: monitor.getItem()
      }
    }
  });

  const dragLayerProps = useDragLayer(monitor => {
    let computedPosition = {}

    const delta = monitor.getDifferenceFromInitialOffset();

    if(monitor.isDragging() && delta) {
      const item = monitor.getItem();
      const type = item.type;
      const tile = tiles[item.index];

      const deltaNorm = pxToRowsAndCols(delta);

      if(type === 'tile') {
        const newPosition = {
          x: tile.x + deltaNorm.x,
          y: tile.y + deltaNorm.y,
          w: tile.w,
          h: tile.h
        }

        if(validateTilePosition(newPosition)) computedPosition = tilePositionToReal(newPosition);
      } else if(type === 'tile-resize') {
        const newPosition = {
          x: tile.x,
          y: tile.y,
          w: tile.w + deltaNorm.x,
          h: tile.h + deltaNorm.y
        }
        
        if(validateTilePosition(newPosition)) computedPosition = tilePositionToReal(newPosition);
      } 
    }

    return {
      isDragging: monitor.isDragging(),
      computedPosition
    }
  });

  const [duplicateDropProps, duplicateDropRef] = useDrop({
    accept: 'tile',

    drop: (item, monitor) => {
     
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

    ret = <Tile key={tile.id} index={tileIndex} preview={editMode} isEditing={editMode} canDrag={editMode} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} containerRef={containerRef} {...dimensions} />

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
          { dropProps.canDrop && dropProps.item.type === 'tile' &&
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
                <Fab className={classes.fab} variant="extended" color="primary">
                  <Icons.mdiPlus />
                  Add
                </Fab>
              }

              <Fab className={classes.fab} color="primary" onClick={() => setEditMode(!editMode)}>
                { !editMode ? <Icons.mdiPencil /> : <Icons.mdiCheck /> }
              </Fab>
            </Fragment>
          }
        </div>
      }

      { dragLayerProps.isDragging && <DragPreviewTile {...dragLayerProps.computedPosition} /> }
    </Paper>
  );
}