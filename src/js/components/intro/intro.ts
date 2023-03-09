import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './intro.scss';

const ENDPOINT = 'https://gauslin.com/api/ten/intro.json';

interface Intro {
  copy: string[],
  tagline: string,
  title: string,
}

/**
 * Web component for Powers Of Ten intro animation.
 */
@customElement('ten-intro')
class AppIntro extends LitElement {
  @property({type: Boolean, reflect: true, attribute: 'play'}) playIntro = false;
  @property({type: Boolean, reflect: true}) skipped = false;

  @state() animationListener: EventListenerObject;
  @state() intro: Intro;
  @state() storage = 'intro';

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.animationListener = this.stop.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.renderRoot.addEventListener('animationend', this.animationListener);
    this.fetchData();
    this.play();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.renderRoot.removeEventListener('animationend', this.animationListener);
  }

  async fetchData(): Promise<Intro> {
    try {
      const response = await fetch(ENDPOINT);
      this.intro = await response.json();
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  play() {
    const storage = JSON.parse(localStorage.getItem(this.storage));
    if (storage) {
      const {skip} = storage;
      this.playIntro = !skip;
      this.skipped = skip;

      if (!this.playIntro) {
        this.dispatchEvent(new CustomEvent('done', {bubbles: true, composed: true}));
      }
    }
  }

  stop(event: AnimationEvent) {
    const target = <HTMLElement>event.target;
    if (['h1', 'button'].includes(target.tagName.toLowerCase())) {
      this.dispatchEvent(new CustomEvent('done', {bubbles: true, composed: true}));
      this.playIntro = false;
    }
  }

  skip() {
    this.skipped = true;
    localStorage.setItem(this.storage, JSON.stringify({skip: true}));
  }

  render() {
    if (this.intro && this.playIntro) {
      const {copy, tagline, title} = this.intro;
      return html`
        <header>
          <h1>${title}</h1>
          <p class="tagline">${tagline}</p>
        </header>

        ${copy.map(blurb => html`<p>${blurb}</p>`)}
        
        <div aria-hidden="true" class="stars">
          ${unsafeHTML(this.renderStars())}
          ${this.renderMeteors()}
        </div>

        ${this.renderAtom()}

        <button
          type="button"
          ?disabled="${this.skipped}"
          @click="${this.skip}">
          Skip
          <svg viewbox="0 0 24 24">
            <path d="M 6,6 L 12,12 L 6,18 Z" />
            <path d="M 14,6 L 20,12 L 14,18 Z" />
          </svg>
        </button>
      `;
    }
  }

  // TODO: Replace nucleus with 6 particles (with animations).
  renderAtom() {
    const electrons = [];
    for (let i = 0; i < 3; i++) {
      electrons.push(html`
        <div class="electron" id="electron-${i + 1}">
          <div class="particle"></div>
          <svg viewBox="0 0 200 200">
            <path class="orbit" d="M10 100a90 30 0 1 0 180 0a90 30 0 1 0 -180 0 Z"/>
          </svg>
        </div>
      `);
    }

    return html`
      <div aria-hidden="true" class="atom">
        <div class="nucleus"></div>  
        ${electrons}
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
      const r = (Math.floor(Math.random() * 2) + 1) / 2;
      points.push([cx, cy, r]);
    }
  
    let svg = `<svg class="starfield" viewbox="0 0 ${bounds} ${bounds}">`;
    for (const point of points) {
      const [cx, cy, r] = point;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`;
    };
    svg += '</svg>';

    return svg;
  }

  renderMeteors() {
    const meteors = [];
    for (let i = 0; i < 5; i++) {
      meteors.push(html`
        <div class="meteor" id="meteor-${i + 1}"></div>
      `);
    }
    return html`${meteors}`;
  }
}