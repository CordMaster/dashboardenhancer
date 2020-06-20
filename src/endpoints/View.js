import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';
import Tile from '../Tile/Tile';
import { devLog } from '../Utils';
import { useDrop } from 'react-dnd';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    height: '100%',

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

  const [dropProps, dropRef] = useDrop({
    accept: 'tile',

    drop: (item, monitor) => {
      if(!monitor.didDrop()) {
        const tileIndex = item.index;
        const delta = monitor.getDifferenceFromInitialOffset();
        const tile = dashboards[index].tiles[tileIndex];

        modifyDashboards({ type: 'modify', index, path: ['tiles', tileIndex], data: { x: tile.x + Math.round((delta.x / containerRef.current.clientWidth) * cols), y: tile.y + Math.round((delta.y / containerRef.current.clientHeight) * rows) }});

        return {};
      }
    },

    collect: monitor => {
      return {
        canDrop: monitor.canDrop()
      }
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
      const tiles = dashboards[index].tiles;

      modifyDashboards({ type: 'modify', index, data: { tiles: [ ...tiles.splice(tileIndex, 1) ] } });

      return {};

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

  const layout = dashboards[index].tiles;
  devLog(layout);

  //rows and cols are 1-indexed
  let smallCol = 1;
  let smallRow = 1;

  const uiTiles = layout.map(tile => {
    let ret = false;

    //const device = devices[tile.device];

    const col = isSmall ? smallCol : tile.x;
    const row = isSmall ? smallRow : tile.y;

    const rowSpan = isSmall ? 1 : tile.w;
    const colSpan = isSmall ? 1 : tile.h;

    const colPercentStr = `calc(100% / ${cols / colSpan})`;
    const rowPercentStr = `calc(100% / ${rows / rowSpan})`;
    
    const dimensions = {
      w: `${colPercentStr}`,
      h: `${rowPercentStr}`,
      x: `calc(calc(100% / ${cols}) * ${col})`,
      y: `calc(calc(100% / ${rows}) * ${row})`
    }

    ret = <Tile key={tile.id} index={index} preview={editMode} isEditing={editMode} canDrag={editMode} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} containerRef={containerRef} {...dimensions} />

    smallCol++;
    if(smallCol > smallCols) {
      smallRow++;
      smallCol = 1;
    }

    return ret;
  });

  const mergedStyles = Object.assign({}, style, {
    overflowY: popped !== -1 ? 'hidden' : 'auto'
  });

  const popCoverStyles = {
    top: `calc(-16px + ${containerRef.current.scrollTop}px)`,
    bottom: `-${containerRef.current.scrollTop}px`
  }

  return (
    <Paper className={`${classes.container} ${className}`} ref={attachRef} square elevation={0} style={mergedStyles} {...props}>
      {uiTiles}
      <div className={`${classes.popCover} ${popped !== -1 && 'popped'}`} style={popCoverStyles}></div>

      <div className={classes.fabContainer}>
        { dropProps.canDrop &&
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

        { !dropProps.canDrop &&
          <Fab className={classes.fab} color="primary" onClick={() => setEditMode(!editMode)}>
            { !editMode ? <Icons.mdiPencil /> : <Icons.mdiCheck /> }
          </Fab>
        }
      </div>
    </Paper>
  );
}