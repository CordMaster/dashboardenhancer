import React from 'react';

export default function({ value }) {
  const w = 26 * (value / 100);

  return (
    <svg width="100%" height="100%" viewBox="0 0 32 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
      <g id="Battery">
        <rect x="2" y="2" width={w} height="12" style={{ fill: 'rgb(0,255,51)' }}/>
        <path d="M30,4C30,1.792 28.208,0 26,0L4,0C1.792,0 0,1.792 0,4L0,12C0,14.208 1.792,16 4,16L26,16C28.208,16 30,14.208 30,12L30,4ZM28,4L28,12C28,13.104 27.104,14 26,14L4,14C2.896,14 2,13.104 2,12L2,4C2,2.896 2.896,2 4,2L26,2C27.104,2 28,2.896 28,4Z"/>
        <rect x="30" y="5.348" width="2" height="5.304"/>
      </g>
    </svg>
  );
}