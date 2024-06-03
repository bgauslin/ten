import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';

import shadowStyles from './intro.scss';

interface Intro {
  copy: string[],
  tagline: string,
  title: string,
}

/**
 * Web component for Powers of Ten intro animation.
 */
@customElement('ten-intro')
class AppIntro extends LitElement {
  private animationListener: EventListenerObject;
  private endpoint = 'https://gauslin.com/api/ten/intro.json';

  @property({type: Boolean, reflect: true}) play = false;
  @property({type: Boolean, reflect: true}) skip = false;
  @state() intro: Intro;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.animationListener = this.done.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.renderRoot.addEventListener('animationend', this.animationListener);
    this.fetchData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.renderRoot.removeEventListener('animationend', this.animationListener);
  }

  private async fetchData(): Promise<Intro> {
    try {
      const response = await fetch(this.endpoint);
      this.intro = await response.json();
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private done(event: AnimationEvent) {
    const target = <HTMLElement>event.target;

    if (['h1', 'button'].includes(target.tagName.toLowerCase())) {
      this.play = false;
      this.skip = false;

      this.dispatchEvent(new CustomEvent('done', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  protected render() {
    if (this.intro && this.play) {
      const {copy, tagline, title} = this.intro;
      return html`
        <header>
          <h1>${title}</h1>
          <p class="tagline">${tagline}</p>
        </header>

        ${this.renderStars()}
        <p>${copy[0]}</p>

        ${this.renderAtom()}
        <p>${copy[1]}</p>

        <p>${copy[2]}</p>

        <button
          type="button"
          ?disabled="${this.skip}"
          @click="${() => this.skip = true}">
          Skip
          <svg viewbox="0 0 24 24" aria-hidden="true">
            <path d="M 6,6 L 12,12 L 6,18 Z" />
            <path d="M 14,6 L 20,12 L 14,18 Z" />
          </svg>
        </button>
      `;
    }
  }

  private renderStars() {
    return html`
      <div aria-hidden="true" class="stars">
        ${this.renderStarfield()}
        ${this.renderMeteors()}
      </div>
    `;
  }

  private renderStarfield() {
    const qty = 1000;
    const size = 1000;

    let path = '';
    for (let i = 0; i < qty; i++) {
      const cx = Math.floor(Math.random() * size);
      const cy = Math.floor(Math.random() * size);
      const r = (Math.floor(Math.random() * 2) + 1) / 2;

      path += `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${r * -2},0`;
      if (i < qty - 1) {
        path += ' ';
      }
    }

    return html`
      <svg class="starfield" viewbox="0 0 ${size} ${size}">
        <path d="${path}"/>
      </svg>
    `;
  }

  private renderMeteors() {
    const meteors = [];
    for (let i = 0; i < 5; i++) {
      meteors.push(html`<div class="meteor" id="meteor-${i + 1}"></div>`);
    }
    return html`${meteors}`;
  }

  private renderAtom() {
    return html`
      <div aria-hidden="true" class="atom">
        ${this.renderNucleus()} 
        ${this.renderElectrons()}
      </div>
    `;
  }

  private renderNucleus() {
    const protons = [[33, 60], [67, 60], [50, 31]];
    const neutrons = [[33, 40], [67, 40], [50, 70]];
    const middle = [[50, 50]];
  
    let particles = '';
    const draw = (classname: string, coords: number[][]) => {
      for (const coord of coords) {
        const [cx, cy] = coord;
        particles += `<circle class="${classname}" cx="${cx}" cy="${cy}" r="17"></circle>`;
      }
    }
    draw('proton', protons);
    draw('neutron', neutrons);
    draw('proton', middle);

    return html`
      <div class="nucleus">
        <svg viewbox="0 0 100 100">
          ${unsafeSVG(particles)}
        </svg>
      </div>
    `;
  }

  private renderElectrons() {
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
    return electrons;
  }
}