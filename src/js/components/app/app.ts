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
        class="intro"
        ?data-skip="${this.skipIntro}">
        <header>
          <h1>${title}</h1>
          <p class="tagline">${tagline}</p>
        </header>
        ${unsafeHTML(copy)}
        ${unsafeHTML(this.svgStars())}
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

  svgStars() {
    const bounds = 1000;
    const points = [];
    const qty = 1000;
  
    for (let i = 0; i < qty; i++) {
      const cx = Math.floor(Math.random() * bounds);
      const cy = Math.floor(Math.random() * bounds);
      const r = (Math.floor(Math.random() * 3) + 1) / 2;
      points.push([cx, cy, r]);
    }
  
    let svg = `<svg viewbox="0 0 ${bounds} ${bounds}" id="stars">`;
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
