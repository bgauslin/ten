import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './app.scss';

interface AppData {
  intro: Intro,
  scenes: Scene[],
}

interface Intro {
  copy: string,
  tagline: string,
  title: string,
}

interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}

/**
 * Web component for Powers Of Ten app.
 */
@customElement('powers-of-ten')
class App extends LitElement {
  @state() intro: Intro;
  @state() level = 0;
  @state() ready: boolean = false;
  @state() scenes: Scene[];
  @state() skipIntro: boolean = false;

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  async fetchData(): Promise<AppData> {
    if (this.ready) {
      return;
    }

    try {
      const response = await fetch('https://gauslin.com/api/ten.json');
      const data = await response.json();
      this.intro = data.intro;
      this.scenes = data.scenes;
      this.ready = true;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  render() {
    if (this.ready) {
      return html`
        ${this.renderIntro()}
        ${this.renderPrev()}
        ${this.renderNext()}
        ${this.renderScenes()}
      `;
    }
  }

  renderIntro() {
    const {copy, tagline, title} = this.intro;
    return html`
      <div
        id="intro"
        ?data-skip="${this.skipIntro}">
        <header>
          <h1>${title}</h1>
          <p class="tagline">${tagline}</p>
        </header>
        ${unsafeHTML(copy)}
        ${unsafeHTML(this.renderStars())}
        ${this.renderAtom()}
      </div>
      <button
        id="skip"
        type="button"
        ?disabled="${this.skipIntro}"
        @click="${() => this.skipIntro = true}">
        Skip intro
      </button>
    `;
  }

  renderAtom() {
    return html`
      <div id="atom" aria-hidden="true">
        <div class="nucleus"></div>
        <div class="electron" id="electron-1"></div>
        <div class="electron" id="electron-2"></div>
        <div class="electron" id="electron-3"></div>
        <svg viewBox="0 0 600 600">
          <path d="M 384 299 C 384 151.539978 346.391907 32 300 32 C 253.608078 32 216 151.539978 216 299 C 216 446.460022 253.608078 566 300 566 C 346.391907 566 384 446.460022 384 299 Z"/>
          <path d="M 342 371.746124 C 469.704102 298.016113 554.424744 205.676575 531.22876 165.5 C 508.032837 125.323425 385.704102 152.523865 258 226.253845 C 130.295868 299.983887 45.575256 392.323425 68.77121 432.5 C 91.967163 472.676575 214.295868 445.476135 342 371.746124 Z"/>
          <path d="M 342 226.253845 C 214.295868 152.523865 91.967163 125.323425 68.77121 165.5 C 45.575256 205.676575 130.295868 298.016113 258 371.746124 C 385.704102 445.476135 508.032837 472.676575 531.22876 432.5 C 554.424744 392.323425 469.704102 299.983887 342 226.253845 Z"/>
        </svg>
      </div>
    `;
  }

  renderStars() {
    const bounds = 1000;
    const points = [];
    const qty = 1000;
  
    for (let i = 0; i < qty; i++) {
      const cx = Math.floor(Math.random() * bounds);
      const cy = Math.floor(Math.random() * bounds);
      const r = (Math.floor(Math.random() * 3) + 1) / 2;
      points.push([cx, cy, r]);
    }
  
    let svg = `<svg id="stars" viewbox="0 0 ${bounds} ${bounds}">`;
    for (const point of points) {
      const [cx, cy, r] = point;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`;
    };
    svg += '</svg>';

    return svg;
  }

  renderScenes() {    
    return html`
      <ul>
      ${this.scenes.map((scene: Scene, index: number) => {
        const {blurb, distance, image, power} = scene;
        return html`
          <li
            aria-hidden="${index !== this.level}"  
            ?data-viewed="${index <= this.level}">
            <img
              alt="${image} (TEMPORARY)"
              src="https://picsum.photos/600"
              srcset="https://picsum.photos/1200 1200w, https://picsum.photos/600 600w"
              sizes="(min-width: 37.5rem) 600px, 100vw">
            <p class="distance">
              ${distance.map(value => html`<span>${value}</span>`)}
            </p>
            <p class="power">
              10<sup>${power}</sup>
            </p>
            <div class="blurb">
              ${unsafeHTML(blurb)}
            </div>
          </li>
        `;
      })}
      </ul>
    `;
  }

  renderPrev() {
    return html`
      <button
        class="zoom"
        id="prev"
        title="Zoom out to previous scene"
        ?disabled="${this.level === 0}"
        @click="${() => this.level -= 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
        </svg>
      </button>
    `;
  }

  renderNext() {
    return html`
      <button
        class="zoom"
        id="next"
        title="Zoom in to next scene"
        ?disabled="${this.level === this.scenes.length - 1}"
        @click="${() => this.level += 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="18"/>
        </svg>
      </button>
    `;
  }
}
