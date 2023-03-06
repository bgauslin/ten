export interface AppData {
  intro: Intro,
  scenes: Scene[],
}

export interface Intro {
  copy: string,
  tagline: string,
  title: string,
}

export interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}