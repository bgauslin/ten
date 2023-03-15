import {LitElement, PropertyValues, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './scenes.scss';

const ENDPOINT = 'https://gauslin.com/api/ten/scenes.json';
const IMAGE_PATH = 'https://assets.gauslin.com/images/ten/';

interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}

/**
 * Web component for all Powers of Ten scenes.
 */
@customElement('ten-scenes')
class Scenes extends LitElement {
  @property({type: Boolean, reflect: true}) rewind = false;
  @property({type: Number, reflect: true}) scene = 1;
  @property({type: Boolean, reflect: true}) wait = false;
  @state() appTitle: string;
  @state() popstateListener: EventListenerObject;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.appTitle = document.title;
    this.popstateListener = this.updateSceneFromUrl.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.popstateListener);
    this.fetchData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.popstateListener);
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.get('wait') && this.wait === false) {
      this.updateWindow();
    }
  }

  async fetchData(): Promise<Scene[]> {
    try {
      const response = await fetch(ENDPOINT);
      this.scenes = await response.json();
      if (!this.wait) {
        this.updateSceneFromUrl();
      }
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  nextScene() {
    if (this.scene < this.scenes.length) {
      this.scene += 1;
      this.updateWindow();
    }
  }

  prevScene() {
    if (this.scene > 1) {
      this.scene -= 1;
      this.updateWindow();
    }
  }

  updateWindow() {
    history.pushState(null, '', this.scene.toString());
    this.updateDocument();
  }

   updateSceneFromUrl() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);

    if (scene > 42 || scene === 0 || isNaN(scene)) {
      history.replaceState(null, '', '/');
    }

    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;
    this.updateDocument();
  }

  updateDocument() {
    const {distance, power} = this.scenes[this.scene - 1];
    document.title = `${power} · ${distance[0]} · ${this.appTitle}`;
  }

  rewindScenes() {
    this.rewind = true;
    this.scene -= 1;

    const countdown = () => {
      if (this.scene > 1) {
        this.scene -= 1;
      } else {
        clearInterval(interval);
        this.rewind = false;
        history.pushState(null, '', '/1');
      }
    }
    const interval = setInterval(countdown, 250); // Must match CSS duration.
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

  // TODO(#4): Update <img> attributes with real image.
  renderScenes() {    
    return html`
      <ul>
      ${this.scenes.map((scene: Scene, index: number) => {
        const {blurb, image, distance, power} = scene;
        const currentScene = this.scene - 1;
        return html`
          <li
            aria-hidden="${index !== currentScene}"  
            ?data-viewed="${index <= currentScene}">
            <img
              alt=""
              src="${IMAGE_PATH}${image}@small.webp">
            <div class="info">
              <p class="distance">
                ${distance.map(value => html`<span>${value}</span>`)}
              </p>
              <p class="power">
                10<sup>${power}</sup>
              </p>
            </div>
            <hr aria-hidden="true">
            <div class="blurb">
              ${unsafeHTML(blurb)}
              ${this.renderRewind(index)}
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
        ?disabled="${this.scene === 1 || this.rewind}"
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
        ?disabled="${this.scene === this.scenes.length || this.rewind}"
        @click="${this.nextScene}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <path d="M6,12 h12 M12,6 v12"/>
        </svg>
      </button>
    `;
  }

  renderRewind(index: number) {
    if (index === this.scenes.length - 1) {
      return html`
        <button
          class="rewind"
          title="Rewind to the start"
          @click="${this.rewindScenes}">
          <svg viewbox="0 0 24 24">
            <path d="M 12,6 L 6,12 L 12,18 Z" />
            <path d="M 20,6 L 14,12 L 20,18 Z" />
          </svg>
          Rewind
        </button>
      `;
    }
  }
}
