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
 * Web component for all Powers of Ten scenes that fetches the scenes from a
 * JSON endpoint and renders the current scene based on URL slug.
 */
@customElement('ten-scenes')
class Scenes extends LitElement {
  private appTitle: string;
  private keyListener: EventListenerObject;

  @property({type: Number, reflect: true}) power: number;
  @property({type: Boolean, reflect: true}) replay = false;
  @property({type: Boolean, reflect: true}) rewind = false;
  @property({type: Boolean, reflect: true}) wait = false;

  @state() max: number;
  @state() min: number;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.appTitle = document.title;
    this.keyListener = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.keyListener);
    this.fetchScenes();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.keyListener);
  }

  private async fetchScenes(): Promise<Scene[]> {
    try {
      const response = await fetch('scenes.json');
      const {scenes} = await response.json();
      this.scenes = scenes;
      this.setup();
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private setup() {
    // Set bounds and initial power from data in fetched scenes.
    const first = this.scenes[0];
    const last = this.scenes[this.scenes.length - 1];
    
    this.max = parseInt(first.power);
    this.min = parseInt(last.power);

    // Play the intro if the URL doesn't have a valid power. Otherwise, jump
    // to the desired scene on initial page load.
    const params = new URLSearchParams(window.location.search);
    const power = parseInt(params.get('power'));

    if (power >= this.min && power <= this.max) {
      this.power = power;
      this.dispatchEvent(new CustomEvent('stop', {bubbles: true}));
    } else {
      this.power = this.max;
      this.dispatchEvent(new CustomEvent('play', {bubbles: true}));
    }
  }

  /**
   * The 'wait' attribute is controlled by <app> when it receives
   * events from other elements.
   */
  protected updated(changed: PropertyValues<this>) {
    // Intro.
    if (!changed.get('wait') && this.wait) {
      this.updateBrowser(); 
    }

    // First scene after the intro.
    if (changed.get('wait') && !this.wait) {
      this.updateBrowser(this.power); 
    }

    // Current scene.
    if (changed.has('power') && !this.wait) {
      this.updateBrowser(this.power);
    }
  }

  private updateBrowser(power?: number) {
    const url = new URL(window.location.href);
    let title = this.appTitle;

    if (power >= this.min && power <= this.max) {
      url.searchParams.set('power', `${power}`);
      const scene = this.scenes.find(scene => scene.power === `${power}`);
      title = `10^${power} · ${scene.distance[0]} · ${this.appTitle}`;
    } else {
      url.searchParams.delete('power');
    }

    document.title = title;
    history.replaceState(null, '', url);
  }

  private nextScene() {
    if (this.power > this.min) {
      this.power -= 1;
    }
  }

  private prevScene() {
    if (this.power < this.max) {
      this.power += 1;
    }
  }

  private rewindScenes() {
    this.rewind = true;
    this.power += 1;

    const countdown = () => {
      if (this.power < this.max) {
        this.power += 1;
      } else {
        clearInterval(interval);
        this.rewind = false;
      }
    }
    const interval = setInterval(countdown, 250); // Must match CSS duration.
  }

  /**
   * Toggles an attribute that triggers animations for smooth transitions
   * between components.
   */
  private replayIntro() {
    this.replay = true;
    this.addEventListener('animationend', () => {
      this.replay = false;
      this.dispatchEvent(new CustomEvent('play', {bubbles: true}));
    }, {once: true});
  }

  private handleKey(event: KeyboardEvent) {
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
        const power_ = parseInt(power);

        const small = `./images/${image}@small.webp`;
        const medium = `./images/${image}@medium.webp`;
        const large = `./images/${image}@large.webp`;;

        return html`
          <li
            aria-hidden="${power_ !== this.power}"  
            ?data-viewed="${power_ >= this.power}">
            <img
              alt=""
              src="${medium}"
              srcset="${small} 600w, ${medium} 900w, ${large} 1200w"
              sizes="(min-width: 49rem) 600px, 100vw"
              loading="${power_ < (this.power - 1) ? 'lazy' : 'eager'}">
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
        title="Zoom out by a power of 10"
        ?disabled="${this.power === this.max || this.rewind}"
        @click="${this.prevScene}">
        <svg aria-hidden="true" viewbox="0 0 24 24">
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
        title="Zoom in by a power of 10"
        ?disabled="${this.power === this.min || this.rewind}"
        @click="${this.nextScene}">
        <svg aria-hidden="true" viewbox="0 0 24 24">
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
        ?disabled="${this.power !== this.max || this.rewind}"
        @click="${this.replayIntro}">
        <svg aria-hidden="true" viewbox="0 0 24 24">
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
          ?disabled="${this.power !== this.min}"
          @click="${this.rewindScenes}">
          <svg aria-hidden="true" viewbox="0 0 24 24">
            <path d="M 12,6 L 6,12 L 12,18 Z" />
            <path d="M 20,6 L 14,12 L 20,18 Z" />
          </svg>
          Rewind
        </button>
      `;
    }
  }
}
