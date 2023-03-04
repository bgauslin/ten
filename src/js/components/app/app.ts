import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './app.scss';

interface Item {
  content: string,
  distance: string[],
  image: string,
  power: string,
}

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() items: Item[];
  @state() level = 0;
  @state() powers: string[];
  @state() ready: boolean = false;

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  private async fetchData(): Promise<any> {
    if (this.ready) {
      return;
    }

    try {
      const response = await fetch('https://gauslin.com/api/ten.json');
      const data = await response.json();
      this.items = data.items;
      this.powers = this.items.map(item => item.power);
      this.ready = true;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  render() {
    if (this.ready) {
      return html`
        ${this.renderMeta()}
        ${this.renderItems()}
        ${this.renderZoomOut()}
        ${this.renderZoomIn()}
      `;
    }
  }

  renderMeta() {
    return html`
      <div class="meta">
        <div class="distance">
          <span>DISTANCE</span>
        </div>
        <div class="power">
          10<sup>${this.powers[this.level]}</sup>
        </div>
      </div>
    `;
  }

  renderItems() {    
    return html`
      <ul>
      ${this.items.map((item: Item, index: number) => {
        const disabled = index !== this.level;
        const visited = index <= this.level;
        const {content} = item;
        return html`
          <li
            ?data-visited="${visited}"
            ?disabled="${disabled}">
            <img
              alt=""
              src=""
              srcset=""
              sizes="100vw">
            <div class="blurb">
              ${unsafeHTML(content)}
            </div>
          </li>
        `;
      })}
      </ul>
    `;
  }

  renderZoomOut() {
    return html`
      <button
        aria-label="Zoom out"
        ?disabled="${this.level === 0}"
        @click="${() => this.level -= 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
        </svg>
      </button>
    `;
  }

  renderZoomIn() {
    return html`
      <button
        aria-label="Zoom in"
        ?disabled="${this.level === this.items.length - 1}"
        @click="${() => this.level += 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="18"/>
        </svg>
      </button>
    `;
  }
}
