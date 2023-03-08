import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {AppData, Scene, SCENE_COUNT} from '../../shared';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() popstateListener: EventListenerObject;
  @state() ready: boolean = false;
  @state() scene = 0;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
    this.popstateListener = this.updateApp.bind(this);
    window.addEventListener('popstate', this.popstateListener, false);
  }

  disconnectedCallback() {
    super.connectedCallback();
    window.removeEventListener('popstate', this.popstateListener, false);
  }

  async fetchData(): Promise<AppData> {
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

  nextScene() {
    if (this.scene < SCENE_COUNT) {
      this.scene += 1;
      this.updateUrl();
    }
  }

  prevScene() {
    if (this.scene > 0) {
      this.scene -= 1;
      this.updateUrl();
    }
  }

  updateUrl() {
    const slug = this.scene + 1;
    history.pushState(null, '', slug.toString());
  }

  updateApp() {
    const {pathname} = window.location;
    const slug = pathname.split('/');
    const scene = Number(slug[1]);
    if (scene > 0 && scene <= SCENE_COUNT) {
      this.scene = scene - 1;
    } else {
      history.replaceState(null, '', '');
    }
  }

  render() {
    if (this.ready) {
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
        const {blurb, distance, image, power} = scene;
        return html`
          <li
            aria-hidden="${index !== this.scene}"  
            ?data-viewed="${index <= this.scene}">
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
        ?disabled="${this.scene === 0}"
        @click="${this.prevScene}">
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
        ?disabled="${this.scene === this.scenes.length - 1}"
        @click="${this.nextScene}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="12" x2="18" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="18"/>
        </svg>
      </button>
    `;
  }
}
