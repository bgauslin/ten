import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './app.scss';

interface Scene {
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
  @state() ready: boolean = false;
  @state() scenes: Scene[];

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
        ${this.renderMeta()}
        ${this.renderScenes()}
        ${this.renderPrev()}
        ${this.renderNext()}
      `;
    }
  }

  renderMeta() {
    return html`

    `;
  }

  renderScenes() {    
    return html`
      <ul>
      ${this.scenes.map((scene: Scene, index: number) => {
        const disabled = index !== this.level;
        const visited = index <= this.level;
        const {content, distance, power} = scene;
        return html`
          <li
            ?data-visited="${visited}"
            ?disabled="${disabled}">
            <img
              alt=""
              src="https://picsum.photos/800"
              srcset=""
              sizes="100vw">
              <div class="meta">
                <div class="distance">
                  ${distance.map(value => html`<span>${value}</span>`)}
                </div>
                <div class="power">
                  10<sup>${power}</sup>
                </div>
            </div>
            <div class="blurb">
              ${unsafeHTML(content)}
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
        aria-label="Zoom out to previous scene"
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
        aria-label="Zoom in to next scene"
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
