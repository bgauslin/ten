import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

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
  @state() level = 0;
  @state() items: Item[];
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
      this.ready = true;
      console.log('data', data);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  render() {
    const items = [];
    for (let i = 0; i < 42; i++) {
      const disabled = i !== this.level;
      const visited = i <= this.level;
      items.push(html`
        <li
          ?data-visited="${visited}"
          ?disabled="${disabled}">
          ${i + 1}
        </li>
      `);
    }

    const start = this.level === 0;
    const end = this.level === items.length - 1;

    return html`
      <ul>${items}</ul>
      <button
        aria-label="Zoom out"
        ?disabled="${start}"
        @click="${() => this.level -= 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
        </svg>
      </button>
      <button
        aria-label="Zoom in"
        ?disabled="${end}"
        @click="${() => this.level += 1}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="18"/>
        </svg>
      </button>
    `;
  }
}
