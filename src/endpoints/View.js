import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab, AppBar, Tabs, Tab, DialogContent } from '@material-ui/core';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';

import { devLog, rectInside, growRect, rectOverlaps, rectsIdentical, multipleClasses } from '../Utils';
import { useDrop, useDragLayer } from 'react-dnd';
import { useModifyImmutableCollection } from '../contexts/useCollection';

import { DragPreviewUnderTile, AbsoluteTile, DraggableTile } from '../components/tiles/Tile';
import useConfigDialog from '../components/useConfigDialog';
import TileConfig from '../components/tiles/TileConfig';
import tileMappings from '../components/tiles/tileMappings';
import Color from 'color';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    height: '100%',

    position: 'absolute',

    overflow: 'hidden',

    userSelect: 'none',

    '&.small': {
      boxSizing: 'border-box',

      paddingRight: 16,
      paddingBottom: 16
    }
  },

  subContainer: {
    position: 'relative',

    width: '100%',
    height: '100%'
  },

  popCover: {
    position: 'absolute',

    //top and bottom computed with scroll
    left: '-16px',
    right: 0,

    zIndex: 50,

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

    zIndex: 20
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
  },

  blur: {
    filter: 'blur(5px)'
  }
}));

export default function({ index, isSmall, ...props }) {
  const { dashboards, config } = useContext(MainContext);

  const uiPanels = dashboards.map((dashboard, thisIndex) => {
    const style = {
      opacity: thisIndex !== index ? 0 : 1,
      zIndex: thisIndex !== index ? -1 : 0
    };

    if(thisIndex === index || (config.panel.cache && thisIndex !== index)) return <Panel key={dashboard.id} index={thisIndex} isSmall={isSmall} style={style} />;
    else return false;
  });

  return (
    <Fragment>
      {uiPanels}
    </Fragment>
  );

}

export function Panel({ index, className, isSmall, style, ...props }) {
  const classes = useStyles();

  const { dashboards, modifyDashboards, config, locked, save } = useContext(MainContext);

  const dashboard = dashboards[index];
  const tiles = dashboard.tiles;
  //devLog(tiles);

  const smallRows = window.innerHeight > window.innerWidth ? 5 : 3;
  const smallCols = window.innerHeight > window.innerWidth ? 3 : 5;

  const rows = isSmall ? smallRows : config.panel.panelRows;
  const cols = isSmall ? smallCols : config.panel.panelCols;

  const newTileTemplate = {
    type: null, // needs to be set

    options: null, //needs to be set

    position: {
      x: 1,
      y: rows - parseInt(rows / 12) - 1,
      w: parseInt(cols / 12),
      h: parseInt(rows / 12)
    }
  }

  const modifyTiles = useModifyImmutableCollection(dashboards[index].tiles, newTileTemplate, (state) => {
    modifyDashboards({ type: 'modify', index, data: { tiles: state } });
  });

  const containerRef = useRef({ scrollTop: 0 });

  const attachRef = ref => {
    containerRef.current = ref;
    dropRef(ref);
  }

  const [editMode, _setEditMode] = useState(false);
  const [addingTile, setAddingTile] = useState(null);

  //the config dialog
  const [optionBuffer, setOptionBuffer] = useState({});

  const [providedConfigDialog, setConfigOpen] = useConfigDialog((tileIndex) => `Configure ${tiles[tileIndex].label ? tiles[tileIndex].label : "Tile"}`, (tileIndex) => {
    const tile = tiles[tileIndex];

    return <TileConfig tile={tile} optionBuffer={optionBuffer} setOptionBuffer={setOptionBuffer} />
  }, (tileIndex) => {
    modifyTiles({ type: 'modify', index: tileIndex, data: { options: optionBuffer } });
    setOptionBuffer({});
  });

  const setEditMode = state => {
    _setEditMode(state);
    if(state === false) {
      setAddingTile(null);
      save();
    }
  }

  //disable edit on change
  useEffect(() => {
    if(isSmall || locked) setEditMode(false);
  }, [isSmall, locked])

  //prevent tile intersection
  const validateTilePosition = (srcTileIndex, desired) => {
    //size check
    if(desired.w < 1 || desired.h < 1) return false;

    //wall bound check
    if(!rectInside(desired, { x: 0, y: 0, w: cols, h: rows })) return false;

    //other rect check
    for(let i = 0; i < tiles.length; i++) {
      const tilePosition = tiles[i].position;

      if(i !== srcTileIndex && rectOverlaps(desired, tilePosition)) {
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
        const tilePosition = item.tile.position;
        
        const deltaNorm = pxToRowsAndCols(delta);

        if(type === 'tile') {
          const newPosition = {
            x: tilePosition.x + deltaNorm.x,
            y: tilePosition.y + deltaNorm.y,
            w: tilePosition.w,
            h: tilePosition.h
          }

          if(validateTilePosition(tileIndex, newPosition)) {
            if(item.isNew) {
              modifyTiles({ type: 'new', data: { ...item.tile, position: newPosition } });
              setAddingTile(null);
            } else {
              modifyTiles({ type: 'modify', index: tileIndex, data: { position: newPosition } });
            }

            return {};
          }
        } else if(type === 'tile-resize') {
          const newPosition = {
            x: tilePosition.x,
            y: tilePosition.y,
            w: tilePosition.w + deltaNorm.x,
            h: tilePosition.h + deltaNorm.y
          }

          if(validateTilePosition(tileIndex, newPosition)) {
            modifyTiles({ type: 'modify', index: tileIndex, data: { position: newPosition } });

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

    let tile = {};

    let isDragging = false;

    const delta = monitor.getDifferenceFromInitialOffset();

    if(monitor.isDragging() && delta) {
      isDragging = true;

      const item = monitor.getItem();
      const type = item.type;
      const tileIndex = item.index;
      tile = item.tile;
      const tilePosition = item.tile.position;

      const deltaNorm = pxToRowsAndCols(delta);

      position = tilePositionToReal(tilePosition);

      if(type === 'tile') {
        position.x = `calc(${position.x} + ${delta.x}px)`;
        position.y = `calc(${position.y} + ${delta.y}px)`;

        const newNormPosition = {
          x: tilePosition.x + deltaNorm.x,
          y: tilePosition.y + deltaNorm.y,
          w: tilePosition.w,
          h: tilePosition.h
        }

        if(validateTilePosition(tileIndex, newNormPosition)) normPosition = tilePositionToReal(newNormPosition);
      } else if(type === 'tile-resize') {
        position.w = `calc(${position.w} + ${delta.x}px)`;
        position.h = `calc(${position.h} + ${delta.y}px)`;

        const newNormPosition = {
          x: tilePosition.x,
          y: tilePosition.y,
          w: tilePosition.w + deltaNorm.x,
          h: tilePosition.h + deltaNorm.y
        }
        
        if(validateTilePosition(tileIndex, newNormPosition)) normPosition = tilePositionToReal(newNormPosition);
      }
    }

    return {
      isDragging: isDragging,

      tile,

      position,
      normPosition
    }
  });

  const [duplicateDropProps, duplicateDropRef] = useDrop({
    accept: 'tile',

    drop: (item, monitor) => {
      const tilePosition = item.tile.position;

      const newTile = {
        ...item.tile,
        position: {
          ...tilePosition,
          x: newTileTemplate.position.x,
          y: rows - tilePosition.h - 1
        }
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

      modifyTiles({ type: 'delete', index: tileIndex });

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

  //rows and cols are 0-indexed
  let smallCol = 0;
  let smallRow = 0;

  const uiTiles = tiles.map((tile, tileIndex) => {
    let ret = false;

    //const device = devices[tile.device];
    const tilePosition = tile.position;

    const dimensionsWithMobile = {
      x: isSmall ? smallCol : tilePosition.x,
      y: isSmall ? smallRow : tilePosition.y,
      w: isSmall ? 1 : tilePosition.w,
      h: isSmall ? 1 : tilePosition.h
    }

    let dimensions = tilePositionToReal(dimensionsWithMobile);

    //add padding for mobile
    if(isSmall) {
      dimensions.x = `calc(${dimensions.x} + 16px)`;
      dimensions.y = `calc(${dimensions.y} + 16px)`;

      dimensions.w = `calc(${dimensions.w} - 16px)`;
      dimensions.h = `calc(${dimensions.h} - 16px)`;
    }

    const handleConfigOpen = () => {
      setOptionBuffer(tile.options);
      setConfigOpen(tileIndex);
    }

    ret = <DraggableTile key={tile.id} index={tileIndex} Type={tileMappings[tile.type].Type} tile={tile} className={multipleClasses([popped !== -1 && popped !== tile.id, classes.blur])} preview={editMode} isEditing={editMode} canDrag={editMode} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} onSettingsClick={handleConfigOpen} containerRef={containerRef} {...dimensions} />

    smallCol++;
    if(smallCol > smallCols) {
      smallRow++;
      smallCol = 1;
    }

    return ret;
  });
  
  const mergedStyles = Object.assign({}, style, {
    //backgroundColor from dashboard
    backgroundColor: Color(dashboard.backgroundColor).rgb().string(),

    overflowY: !isSmall || popped !== -1 ? 'hidden' : 'auto'
  });

  const popCoverStyles = {
    top: `calc(-16px + ${containerRef.current.scrollTop}px)`,
    bottom: `-${containerRef.current.scrollTop}px`
  }

  return (
    <Paper className={multipleClasses(classes.container, [isSmall, 'small'], className)} square elevation={0} style={mergedStyles} {...props}>
      <div className={multipleClasses(classes.popCover, [popped !== -1, 'popped'])} style={popCoverStyles}></div>

      <div ref={attachRef} className={classes.subContainer}>
        {uiTiles}
        { !isSmall && !locked &&
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
                      <Fragment>
                        <Fab className={classes.fab} variant="extended" onClick={() => setAddingTile({ ...newTileTemplate, type: 'iframeTile', options: tileMappings.iframeTile.defaultOptions })}>
                          <Icons.mdiApplication />
                          Add an iframe
                        </Fab>
                        {console.log()}
                        <Fab className={classes.fab} variant="extended" onClick={() => setAddingTile({ ...newTileTemplate, type: 'hubitatTile', options: tileMappings.hubitatTile.defaultOptions })}>
                          <Icons.mdiHomeLightbulb />
                          Add a Hubitat tile
                        </Fab>
                      </Fragment>
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

        { dragLayerProps.isDragging && <AbsoluteTile Type={tileMappings[dragLayerProps.tile.type].Type} options={dragLayerProps.tile.options} preview isDragging {...dragLayerProps.position} /> }
        { dragLayerProps.isDragging && <DragPreviewUnderTile {...dragLayerProps.normPosition} /> }

        { addingTile && !dropProps.isNew &&
          <Fragment>
            <DraggableTile index={-1} Type={tileMappings[addingTile.type].Type} tile={addingTile} relative canDrag isEditing {...tilePositionToReal(addingTile.position)} />
            <TileAddBackdrop {...tilePositionToReal(growRect(addingTile.position, 0.5))} />
          </Fragment>
        }

        { editMode &&
          <BackgroundGrid cols={cols} rows={rows} />
        }

        {providedConfigDialog}
      </div>
    </Paper>
  );
}

function TileAddSpeedDial({ setAddingTile }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <SpeedDial icon={<Icons.mdiPlus />} open={open} onOpen={() => setOpen(true)} onClose={handleClose} ariaLabel="">
      <SpeedDialAction icon={<Icons.mdiApplication />} onClick={() => handleClose() & setAddingTile()} />
      <SpeedDialAction icon={<Icons.mdiHomeLightbulb />} onClick={() => handleClose() & setAddingTile()} />
    </SpeedDial>
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

const useBDStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 1
  },

  dot: {
    position: 'absolute',
    
    transform: 'translate(-50%, -50%)',

    backgroundColor: theme.palette.grey[600]
  }
}));

const BackgroundGrid = React.memo(({ rows, cols }) => {
  const classes = useBDStyles();

  const dots = [];

  const maj = Math.max(rows, cols);

  for(let x = 0; x <= cols; x++) {
    for(let y = 0; y <= rows; y++) {
      const style = {
        width: 350 / maj,
        height: 350 / maj,
    
        borderRadius: 700 / maj,

        top: `${(100 / rows) * y}%`,
        left: `${(100 / cols) * x}%`
      }

      dots.push(<div key={`dot_${x}_${y}`} className={classes.dot} style={style}></div>);
    }
  }

  return (
    <div className={classes.container}>
      {dots}
    </div>
  )
});