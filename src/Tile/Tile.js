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

export default function PopableTile({ popped, setPopped, ...props }) {
  const [hoverHandle, setHoverHandle] = useState(-1);

  const handleEnter = (e) => {
    //really hacky
    if(e.nativeEvent.type === 'touchstart' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
      setHoverHandle(setTimeout(() => {
        setPopped();
      }, 1000));
    }
  }

  const handleLeave = (e) => {
    //really hacky
    if(e.nativeEvent.type === 'touchend' || e.nativeEvent.type === 'touchcancel' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
      if(hoverHandle) clearInterval(hoverHandle);
    }
  }

  return <BaseTile popped={popped} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave} onTouchCancel={handleLeave} {...props} />
}

export function BaseTile({ label, primaryContent, secondaryContent, onClick, popped, poppedContent, containerRef, preview, x, y, w, h, ...props }) {
  const classes = useStyles();

  const handleClick = (e) => {
    if(onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  let styles = {
    position: 'relative',
    height: 250,
    margin: '16px 0'
  }

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
          <Paper className={`${classes.tile} ${popped ? 'popped' : ''} ${popped && !poppedContent ? 'popped-big' : ''}`} elevation={8} style={styles} onClick={handleClick} {...props}>
              <CSSTransition in={popped} timeout={250} classNames="popped">
                <div className={`${classes.featuredContainer} ${popped ? 'popped' : ''}`}>
                    { primaryContent }
                    { secondaryContent }
                    { outerTransitionState === 'entered' &&
                      <div className={classes.advancedContainer}>
                        { poppedContent }
                      </div>
                    }
                </div>
              </CSSTransition>
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
  return <BaseTile preview {...props} />
}