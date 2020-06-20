import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';
import Tile from '../Tile/Tile';
import { devLog } from '../Utils';

const useStyles = makeStyles(theme => ({
  container: {
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',

    paddingTop: 16,
    paddingLeft: 16,

    overflow: 'hidden',

    userSelect: 'none'
  },

  intContainer: {
    width: '100%',
    height: '100%',

    position: 'relative'
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

  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: '50%',

    transform: 'translateX(-50%)',

    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  contentText: {
    fontSize: 'inherit'
  },

  advancedContainer: {
    animation: '250ms $fadein',

    height: '100%',
    flexGrow: 1,

    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center'
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

  const { dashboards, config } = useContext(MainContext);
  const { devices } = useContext(HubContext);

  const containerRef = useRef({ scrollTop: 0 });

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

  const smallRows = window.innerHeight > window.innerWidth ? 5 : 3;
  const smallCols = window.innerHeight > window.innerWidth ? 3 : 5;

  const rows = isSmall ? smallRows : config.panelRows;
  const cols = isSmall ? smallCols : config.panelCols;

  //rows and cols are 1-indexed
  let smallCol = 1;
  let smallRow = 1;

  const uiTiles = layout.map(tile => {
    let ret = false;

    const device = devices[tile.device];

    const col = isSmall ? smallCol : tile.x;
    const row = isSmall ? smallRow : tile.y;

    const rowSpan = isSmall ? 1 : tile.w;
    const colSpan = isSmall ? 1 : tile.h;

    if(device) {
      const colPercentStr = `calc(100% / ${cols / colSpan})`;
      const rowPercentStr = `calc(100% / ${rows / rowSpan})`;
      
      const dimensions = {
        w: `calc(${colPercentStr} - 16px)`,
        h: `calc(${rowPercentStr} - 16px)`,
        x: `calc(calc(100% / ${cols}) * ${col - 1})`,
        y: `calc(calc(100% / ${rows}) * ${row - 1})`
      }

      return <Tile key={tile.id} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} containerRef={containerRef} {...dimensions} />
    }

    smallCol++;
    if(smallCol > smallCols) {
      smallRow++;
      smallCol = 1;
    }

    return ret;
  });

  const mergedStyles = Object.assign({}, style, {
    overflowY: popped !== -1 ? 'hidden' : style.overflowY
  });

  const popCoverStyles = {
    top: `calc(-16px + ${containerRef.current.scrollTop}px)`,
    bottom: `-${containerRef.current.scrollTop}px`
  }

  return (
    <Paper className={`${classes.container} ${className}`} ref={containerRef} square elevation={0} style={mergedStyles} {...props}>
      <div className={classes.intContainer}>
        {uiTiles}
        <div className={`${classes.popCover} ${popped !== -1 && 'popped'}`} style={popCoverStyles}></div>
      </div>
    </Paper>
  );
}