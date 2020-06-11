import React, { useContext, Fragment, useState, useEffect } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';

const useStyles = makeStyles(theme => ({
  container: {
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',

    paddingTop: 16,
    paddingLeft: 16,

    overflow: 'hidden'
  },

  intContainer: {
    width: '100%',
    height: '100%',

    position: 'relative'
  },

  item: {
    boxSizing: 'border-box',
    position: 'absolute',

    padding: theme.spacing(1),

    zIndex: 1,

    cursor: 'pointer',

    '--transitions': ,

    //back
    transition: ['transform 100ms linear 0ms', 'width 250ms linear', 'height 250ms linear', 'top 250ms linear', 'left 250ms linear'],

    '&:hover:not(.popped)': {
      transform: 'scale(1.05)',
      zIndex: 2,
    },

    '&.popped': {
      top: 'calc(25% / 2) !important',
      left: 'calc(25% / 2) !important',
      width: 'calc(75% - 16px) !important',
      height: 'calc(75% - 16px) !important',

      cursor: 'initial',

      zIndex: 4,
    },
  },

  popCover: {
    position: 'absolute',

    top: '-16px',
    left: '-16px',
    right: 0,
    bottom: 0,

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

  contentContainer: {
    width: '100%',
    height: '100%'
  },

  iconContainer: {
    display: 'inline-block',

    position: 'absolute',
    top: '50%',
    left: '50%',

    transform: 'translate(-50%, -50%)',

    fontSize: 60,

    transition:  ['transform 250ms linear', 'top 250ms linear', 'left 250ms linear', 'font-size 250ms linear'],

    '&.popped': {
      top: 16,
      left: 16,

      transform: 'none',

      fontSize: 100,
    },
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

  overflowText: {
    
  },

  iframeAttribute: {
    width: '100%',
    height: '100%',

    border: 'none'
  }
}));

export default function({ index }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);
  const { allDashboards, devices, sendCommand } = useContext(HubContext);

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

  const layout = allDashboards[dashboards[index].id].layout;
  console.log(layout);

  //rows and cols are 1-indexed
  const tiles = layout.tiles.map(tile => {
    const device = devices[tile.device];

    const colPercentStr = `calc(100% / ${layout.cols / tile.colSpan})`;
    const rowPercentStr = `calc(100% / ${layout.rows / tile.rowSpan})`;
    const tileStyles = {
      width: `calc(${colPercentStr} - 16px)`,
      height: `calc(${rowPercentStr} - 16px)`,
      top: `calc(calc(100% / ${layout.rows}) * ${tile.row - 1})`,
      left: `calc(calc(100% / ${layout.cols}) * ${tile.col - 1})`,
    }

    let Inner = BaseTile;
    let IconOverride;
    switch (tile.template) {
      case 'switch':
        Inner = SwitchTile;
        break;
      case 'dimmer':
        Inner = SwitchTile;
        break;
      case 'motion':
        Inner = MotionTile;
        break;
      /*case 'window':
        Inner = WindowTile;
        break;*/
      /*case 'contact':
        Inner = ContactTile;
        break;*/
      case 'bulb':
        Inner = SwitchTile;
        break;
      case 'attribute':
        Inner = AttributeTile;
        break;
      case 'temperature':
        Inner = AttributeTile;
        break;
      case 'humidity':
        Inner = AttributeTile;
        break;
      default:
        IconOverride = false;
        break;
    }

    if(tile.customIcon) {
      const preProcIcon = tile.customIcon.replace('he-', '').replace(/_[0-9]/g, '').replace(/[0-9]/g, '');
      const regExpr = /_([a-z])/g;
      let match;
      let fixedSearch = preProcIcon;
      while((match = regExpr.exec(preProcIcon)) !== null) {
        fixedSearch = fixedSearch.replace(match[0], match[1].toUpperCase());
      }

      IconOverride = getIcon(fixedSearch);
    }

    if(Inner !== BaseTile) return <Inner key={`${tile.id}_${device.id}`} dashboardId={dashboards[index].id} tile={tile} device={device} IconOverride={IconOverride} style={tileStyles} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} />
    else return <Inner key={`${tile.id}_${device.id}`} label={device.label} Icon={Icons.mdiAlertCircle} style={tileStyles} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} />
  });

  return (
    <Paper className={classes.container} square elevation={0}>
      <div className={classes.intContainer}>
        {tiles}
        <div className={`${classes.popCover} ${popped !== -1 && 'popped'}`}></div>
      </div>
    </Paper>
  );
}

function SwitchTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.switch.value;

  const { sendCommand } = useContext(HubContext);

  const DefaultIcon = state === 'on' ? Icons.mdiToggleSwitch : Icons.mdiToggleSwitchOffOutline;
  const iconColor = state === 'on' ? 'primary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    sendCommand(dashboardId, device.id, state === 'on' ? 'off' : 'on');
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function MotionTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.motion.value;

  const DefaultIcon = Icons.mdiMotionSensor;
  const iconColor = state === 'active' ? 'secondary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function WindowTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiWindowOpenVariant : Icons.mdiWindowClosedVariant;
  const iconColor = state === 'open' ? 'secondary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function ContactTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiDoorOpen : Icons.mdiDoorClosed;
  const iconColor = state === 'open' ? 'secondary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function AttributeTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = tile.templateExtra ? device.attr[tile.templateExtra].value : device.attr[tile.template].value;

  return (
    <BaseTile content={state} label={device.label} {...props} />
  )
}

function BaseTile({ label, Icon, iconColor, content, onClick, popped, setPopped, ...props }) {
  const classes = useStyles();

  const [hoverHandle, setHoverHandle] = useState(-1);

  const handleClick = (e) => {
    if(onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  const handleEnter = () => {
    setHoverHandle(setTimeout(() => {
      setPopped();
    }, 1000));
  }

  const handleLeave = () => {
    if(hoverHandle) clearInterval(hoverHandle);
  }

  return (
    <Paper className={`${classes.item} ${popped && 'popped'}`} elevation={8} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} {...props}>
        <div className={classes.contentContainer}>
          { Icon && 
            <div className={`${classes.iconContainer} ${popped && 'popped'}`}>
              <Icon fontSize="inherit" color={iconColor} />
            </div>
          }
          { content && 
            content.includes('iframe') ? <iframe className={classes.iframeAttribute} title={$.parseHTML(content)[1].src} src={$.parseHTML(content)[1].src}></iframe> : <Typography variant="subtitle1" className={classes.overflowText}>{content}</Typography>
          }

          <div className={classes.textContainer}>
            <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
          </div>
        </div>
    </Paper>
  )
}