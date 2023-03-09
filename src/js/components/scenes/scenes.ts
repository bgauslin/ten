import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './scenes.scss';

interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}

/**
 * Web component for all Powers Of Ten scenes.
 */
@customElement('ten-scenes')
class Scenes extends LitElement {
  @property({attribute: 'scene', type: Number, reflect: true}) scene = 1;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData(); 
  }

  async fetchData(): Promise<Scene[]> {
    try {
      const response = await fetch('https://gauslin.com/api/ten/scenes.json');
      this.scenes = await response.json();
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  nextScene() {
    if (this.scene < this.scenes.length) {
      this.scene += 1;
      this.updateUrl();
    }
  }

  prevScene() {
    if (this.scene > 1) {
      this.scene -= 1;
      this.updateUrl();
    }
  }

  updateUrl() {
    history.pushState(null, '', this.scene.toString());
    window.requestAnimationFrame(() => window.scrollTo(0, 0)); // TODO
  }

  render() {
    if (this.scenes) {
      return html`
        ${this.renderScenes()}
        ${this.renderPrev()}
        ${this.renderNext()}
      `;
    }
  }

  renderScenes() {    
    return html`
      <ul>
      ${this.scenes.map((scene: Scene, index: number) => {
        const {blurb, distance, power} = scene;
        const currentScene = this.scene - 1;
        return html`
          <li
            aria-hidden="${index !== currentScene}"  
            ?data-viewed="${index <= currentScene}">
            <img
              alt=""
              src="https://picsum.photos/600"
              srcset="https://picsum.photos/1200 1200w, https://picsum.photos/600 600w"
              sizes="(min-width: 37.5rem) 600px, 100vw">
            <div class="info">
              <p class="distance">
                ${distance.map(value => html`<span>${value}</span>`)}
              </p>
              <p class="power">
                10<sup>${power}</sup>
              </p>
            </div>
            <hr>
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
        ?disabled="${this.scene === 1}"
        @click="${this.prevScene}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <path d="M7,12 h10"/>
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
        ?disabled="${this.scene === this.scenes.length}"
        @click="${this.nextScene}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <path d="M6,12 h12 M12,6 v12"/>
        </svg>
      </button>
    `;
  }
}
