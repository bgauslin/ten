import {LitElement, PropertyValues, css, html} from 'lit';
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
 * Web component for all Powers of Ten scenes.
 */
@customElement('ten-scenes')
class Scenes extends LitElement {
  private appTitle = document.title;
  private keyListener: EventListenerObject;
  private popstateListener: EventListenerObject;

  @property({type: Boolean, reflect: true}) rewind = false;
  @property({type: Number, reflect: true}) scene = 1;
  @property({type: Boolean, reflect: true}) wait = false;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.popstateListener = this.updateBrowser.bind(this);
    this.keyListener = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.keyListener);
    window.addEventListener('popstate', this.popstateListener);
    this.fetchData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.keyListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.get('wait') && !this.wait) {
      this.updateBrowser(`${this.scene}`);
    }
  }

  private async fetchData(): Promise<Scene[]> {
    try {
      const response = await fetch('ten.json');
      this.scenes = await response.json();
      if (!this.wait) {
        this.updateBrowser();
      }
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private nextScene() {
    if (this.scene < this.scenes.length) {
      this.scene += 1;
      this.updateBrowser(`${this.scene}`);
    }
  }

  private prevScene() {
    if (this.scene > 1) {
      this.scene -= 1;
      this.updateBrowser(`${this.scene}`);
    }
  }

  private rewindScenes() {
    this.rewind = true;
    this.scene -= 1;

    const countdown = () => {
      if (this.scene > 1) {
        this.scene -= 1;
      } else {
        clearInterval(interval);
        this.rewind = false;
        this.updateBrowser('1');
      }
    }
    const interval = setInterval(countdown, 250); // Must match CSS duration.
  }
  
  private replayIntro() {
    this.updateBrowser('');
    this.dispatchEvent(new CustomEvent('replay', {
      bubbles: true,
      composed: true,
    }));
  }
	
  private updateBrowser(scene: string = null) {
    const segments = window.location.pathname.split('/');

    if (!scene) {
      const last = segments[segments.length - 1];
      const isNumeric = /^\d+$/.test(last);
      const scene_ = parseInt(last, 10);

      if (!isNumeric || scene === '') {
        scene = '';
      } else if (scene_ < 1 || scene_ > this.scenes.length) {
        scene = '1';
      } else {
        scene = `${scene_}`;
        this.scene = scene_;
      }
    }

    segments.pop();
    segments.push(`${scene}`);
    history.replaceState(null, '', segments.join('/'));

    const {distance, power} = this.scenes[this.scene - 1];
    document.title = `${power} · ${distance[0]} · ${this.appTitle}`;
  }

  handleKey(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowRight':
        this.nextScene();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        this.prevScene();
        break;
      case 'KeyR':
        this.rewindScenes();
        break;
      default:
        break;
    }
  }

  protected render() {
    if (this.scenes) {
      return html`
        ${this.renderScenes()}
        ${this.renderPrev()}
        ${this.renderReplay()}
        ${this.renderNext()}
      `;
    }
  }

  private renderScenes() {    
    return html`
      <ul>
      ${this.scenes.map((scene: Scene, index: number) => {
        const {blurb, image, distance, power} = scene;
        const currentScene = this.scene - 1;

        const small = `img/${image}@small.webp`;
        const medium = `img/${image}@medium.webp`;
        const large = `img/${image}@large.webp`;;

        return html`
          <li
            aria-hidden="${index !== currentScene}"  
            ?data-viewed="${index <= currentScene}">
            <img
              alt=""
              src="${medium}"
              srcset="${small} 600w, ${medium} 900w, ${large} 1200w"
              sizes="(min-width: 49rem) 600px, 100vw"
              loading="${index > (currentScene + 1) ? 'lazy' : 'eager'}">
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

  private renderPrev() {
    return html`
      <button
        class="nav"
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

  private renderNext() {
    return html`
      <button
        class="nav"
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

  private renderReplay() {
    return html`
      <button
        class="nav"
        id="replay"
        title="Replay the intro"
        ?disabled="${this.scene !== 1 || this.rewind}"
        @click="${this.replayIntro}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <path d="M 11,7 L 6,12 L 11,17 M 6,12 L 18,12"/>
        </svg>
      </button>
    `;
  }

  private renderRewind(index: number) {
    if (index === this.scenes.length - 1) {
      return html`
        <button
          class="rewind"
          title="Rewind to the start"
          ?disabled="${this.scene !== this.scenes.length}"
          @click="${this.rewindScenes}">
          <svg viewbox="0 0 24 24" aria-hidden="true">
            <path d="M 12,6 L 6,12 L 12,18 Z" />
            <path d="M 20,6 L 14,12 L 20,18 Z" />
          </svg>
          Rewind
        </button>
      `;
    }
  }
}
