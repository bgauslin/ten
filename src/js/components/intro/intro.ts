import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {AppData, Intro} from '../../shared';

import shadowStyles from './intro.scss';

/**
 * Web component for Powers Of Ten intro animation.
 */
@customElement('powers-of-ten-intro')
class AppIntro extends LitElement {
  @state() intro: Intro;
  @state() ready: boolean = false;
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
      this.ready = true;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  render() {
    if (this.ready && !this.skipIntro) {
      const {copy, tagline, title} = this.intro;
      return html`
        <div
          aria-hidden="${this.skipIntro}"
          id="intro">
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
}