import React, { useState } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { CSSTransition, Transition } from 'react-transition-group';

const useStyles = makeStyles(theme => ({
  tile: {
    boxSizing: 'border-box',
    position: 'absolute',

    width: 'auto',
    height: 'auto',

    padding: theme.spacing(2),

    zIndex: 1,

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    '&:hover:not(.popped)': {
      transform: 'scale(1.05)',
      zIndex: 2,
    },

    '&.popped': {
      //position computed with scroll

      //weird min-height fix
      display: 'flex',

      transform: 'translate(-50%, -50%)',

      cursor: 'initial',
    },

    '&.popped-big': {
      width: 'calc(75% - 16px) !important',
      height: 'calc(75% - 16px) !important',
    },

    '&[class*="popped-"]:not(.popped-exit-done)': {
      zIndex: 4,

      transition: ['transform 250ms linear', 'min-width 250ms linear', 'min-height 250ms linear', 'top 250ms linear', 'left 250ms linear']
    }
  },

  featuredContainer: {
    display: 'inline-block',

    position: 'absolute',
    top: '50%',
    left: '50%',

    transform: 'translate(-50%, -50%)',

    fontSize: '3em',

    transition:  ['transform 250ms linear', 'top 250ms linear', 'left 250ms linear', 'font-size 250ms linear']
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

  popContainer: {
    animation: '250ms $fadein',

    height: '100%',
    flexGrow: 1,

    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center'
  }
}));

export default function BaseTile({ label, primaryContent, onlyPrimary, secondaryContent, onClick, config, x, y, w, h, preview, popped, setPopped, poppedContent, containerRef, ...props }) {
  const classes = useStyles();

  const [hoverHandle, setHoverHandle] = useState(-1);

  const handleClick = (e) => {
    if(!preview && onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  const handleEnter = (e) => {
    if(!preview) {
      //really hacky
      if(e.nativeEvent.type === 'touchstart' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
        setHoverHandle(setTimeout(() => {
          setPopped();
        }, 1000));
      }
    }
  }

  const handleLeave = (e) => {
    if(!preview) {
      //really hacky
      if(e.nativeEvent.type === 'touchend' || e.nativeEvent.type === 'touchcancel' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
        if(hoverHandle) clearInterval(hoverHandle);
      }
    }
  }

  //start with preview styles
  let styles = { position: 'relative', height: 250, margin: '16px 0' };

  if(!preview) {
    const tileStyles = {
      top: y,
      left: x,
      minWidth: w,
      minHeight: h,
      width: w,
      height: h
    }

    const poppedStyles = {
      top: `calc(50% + ${containerRef.current.scrollTop}px)`,
      left: '50%',
      minWidth: 'calc(50% - 16px)',
      minHeight: 'calc(25% - 16px)',

      width: 'auto',
      height: 'auto'
    }

    styles = popped ? poppedStyles : tileStyles;
  }

  return (
    <Transition in={popped} timeout={250}>
      { outerTransitionState =>
        <CSSTransition in={popped} timeout={250} classNames="popped">
          <Paper className={`${classes.tile} ${popped ? 'popped' : ''} ${popped && onlyPrimary ? 'popped-big' : ''}`} elevation={8} style={styles} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave} onTouchCancel={handleLeave} {...props}>
              { onlyPrimary && primaryContent }
              { !onlyPrimary &&
                <CSSTransition in={popped} timeout={250} classNames="popped">
                  <div className={`${classes.featuredContainer} ${popped ? 'popped' : ''}`}>
                      { primaryContent }
                      { secondaryContent }
                      { outerTransitionState === 'entered' &&
                        <div className={classes.popContainer}>
                          {poppedContent}
                        </div>
                      }
                  </div>
                </CSSTransition>
              }
              <div className={classes.textContainer}>
                <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
              </div>
          </Paper>
        </CSSTransition>
      }
    </Transition>
  )
}

export function PreviewTileType(props) {
  return <BaseTile preview styleOverride={{ position: 'relative' }} {...props} />
}