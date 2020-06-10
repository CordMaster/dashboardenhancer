import React, { useContext, Fragment, useState } from 'react';
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
    paddingLeft: 16
  },

  intContainer: {
    width: '100%',
    height: '100%',

    position: 'relative'
  },

  item: {
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 1,

    padding: theme.spacing(1),

    cursor: 'pointer',

    transition: ['transform 100ms linear', 'width 250ms linear', 'height 250ms linear', 'top 250ms linear', 'z-index 250ms 250ms'],

    '&:hover:not(.popped)': {
      transform: 'scale(1.05)',
      zIndex: 2
    },

    '&.popped': {
      top: 'calc(calc(0% / 1) / 1) !important',
      left: 'calc(calc(0% / 1) / 1) !important',
      width: 'calc(100% - 16px) !important',
      height: 'calc(100% - 16px) !important',

      zIndex: 2
    }
  },

  flexCenter: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',

    height: '100%'
  },

  iconContainer: {
    flexGrow: 1
  },

  overflowText: {
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  iframeAttribute: {
    width: '100%',
    height: '100%'
  }
}));

export default function({ index }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);
  const { allDashboards, devices, sendCommand } = useContext(HubContext);

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
      case 'window':
        Inner = WindowTile;
        break;
      case 'contact':
        Inner = ContactTile;
        break;
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

    if(Inner !== BaseTile) return <Inner key={`${tile.id}_${device.id}`} dashboardId={dashboards[index].id} tile={tile} device={device} IconOverride={IconOverride} style={tileStyles} />
    else return <Inner key={`${tile.id}_${device.id}`} label={device.label} Icon={Icons.mdiAlertCircle} style={tileStyles} />
  });

  return (
    <Paper className={classes.container} square elevation={0}>
      <div className={classes.intContainer}>
        {tiles}
      </div>
    </Paper>
  );
}

function SwitchTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.switch.value;

  const { sendCommand } = useContext(HubContext);

  const DefaultIcon = state === 'on' ? Icons.mdiToggleSwitch : Icons.mdiToggleSwitchOff;
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

function BaseTile({ label, Icon, iconColor, content, onClick, ...props }) {
  const classes = useStyles();

  const [hoverHandle, setHoverHandle] = useState(-1);
  const [popped, setPopped] = useState(false);

  const handleClick = (e) => {
    if(onClick) onClick(e);
  }

  const handleEnter = () => {
    setHoverHandle(setTimeout(() => {
      setPopped(true);
    }, 1000));
  }

  const handleLeave = () => {
    if(hoverHandle) {
      clearInterval(hoverHandle);
    }
  }

  return (
    <Paper className={`${classes.item} ${popped && '.popped'}`} elevation={8} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} {...props}>
        <div className={classes.flexCenter}>
          { Icon && 
            <div className={`${classes.flexCenter} ${classes.iconContainer}`} style={{ fontSize: 60 }}>
              <Icon fontSize="inherit" color={iconColor} />
            </div>
          }
          { content && 
            content.includes('iframe') ? <div className={classes.iframeAttribute} dangerouslySetInnerHTML={{__html: content}}></div> : <Typography variant="subtitle1" className={classes.overflowText}>{content}</Typography>
          }
          <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
        </div>
    </Paper>
  )
}