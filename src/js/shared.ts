export enum Events {
  AnimationEnd = 'animationend',
  Click = 'click',
  KeyUp = 'keyup',
  Play = 'play',
  Stop = 'stop',
  TouchEnd = 'touchend',
  TouchStart = 'touchstart',
}

export interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}
