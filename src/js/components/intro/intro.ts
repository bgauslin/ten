import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {AppData, Intro} from '../../shared';

import shadowStyles from './intro.scss';

/**
 * Web component for Powers Of Ten intro animation.
 */
@customElement('ten-intro')
class AppIntro extends LitElement {
  @property({attribute: 'playing', type: Boolean, reflect: true}) playing = true;
  @state() animationListener: EventListenerObject;
  @state() intro: Intro;
  @state() ready: boolean = false;
  @state() skip: boolean = false;

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.animationListener = this.checkAnimation.bind(this);
    this.renderRoot.addEventListener('animationend', this.animationListener);
    this.getStorage();
  }

  getStorage() {
    const skip = JSON.parse(localStorage.getItem('skip'));
    if (skip) {
      this.skip = true;
      this.playing = false;
    } else {
      this.fetchData();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.renderRoot.removeEventListener('animationend', this.animationListener);
  }

  checkAnimation(e: AnimationEvent) {
    const target = <HTMLElement>e.target;
    if (target.tagName === 'H1' || target.tagName === 'BUTTON' && this.skip) {
      this.playing = false;
    }
  }

  async fetchData(): Promise<AppData> {
    if (this.ready) {
      return;
    }

    try {
      const response = await fetch('https://gauslin.com/api/ten.json');
      const data = await response.json();
      this.intro = data.intro;
      this.ready = true;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  skipIntro() {
    this.skip = true;
    localStorage.setItem('skip', JSON.stringify(this.skip));
  }

  render() {
    if (this.ready && this.playing) {
      const {copy, tagline, title} = this.intro;
      return html`
        <header>
          <h1>${title}</h1>
          <p class="tagline">${tagline}</p>
        </header>
        
        ${unsafeHTML(copy)}
        
        <div aria-hidden="true" class="stars">
          ${unsafeHTML(this.renderStars())}
          ${this.renderMeteors()}
        </div>

        ${this.renderAtom()}

        <button
          type="button"
          ?disabled="${this.skip}"
          @click="${this.skipIntro}">
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