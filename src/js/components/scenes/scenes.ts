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
  private popstateListener: EventListenerObject;

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

  /**
   * The 'wait' attribute is controlled by <app> when it receives
   * events from other elements. This element updates the URL when
   * the <scenes> element is finished playing.
   */
  protected updated(changed: PropertyValues<this>) {
    if (changed.get('wait') && !this.wait) {
      this.updateBrowser(this.power);
    }
  }

  private async fetchData(): Promise<Scene[]> {
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
    this.power = this.max;

    // Play the intro if the URL doesn't have a valid power. Otherwise, jump
    // to the desired scene on initial page load.
    const segments = window.location.pathname.split('/');
    const power = parseInt(segments[segments.length - 1]);

    if (power >= this.min && power <= this.max) {
      this.power = power;
      this.updateBrowser(this.power);
      this.dispatchEvent(new CustomEvent('stop', {
        bubbles: true,
        composed: true,
      }));
    } else {
      this.playIntro();
    }
  }

  private nextScene() {
    if (this.power > this.min) {
      this.power -= 1;
      this.updateBrowser(this.power);
    }
  }

  private prevScene() {
    if (this.power < this.max) {
      this.power += 1;
      this.updateBrowser(this.power);
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
        this.updateBrowser(this.max);
      }
    }
    const interval = setInterval(countdown, 250); // Must match CSS duration.
  }

  /**
   * Toggles an attribute that triggers animations for smooth transitions
   * between components.
   */
  replayIntro() {
    this.replay = true;
    this.addEventListener('animationend', () => {
      this.replay = false;
      this.playIntro();
    }, {once: true});
  }

  private playIntro() {
    this.updateBrowser();
    this.dispatchEvent(new CustomEvent('play', {
      bubbles: true,
      composed: true,
    }));
  }
	
  private updateBrowser(power: number = null) {
    // Always get last segment and either remove it or put it back.
    const segments = window.location.pathname.split('/');
    let last = segments[segments.length - 1];

    // Update props as needed if there's user-provided stuff in the URL.
    if (!power) {
      power = parseInt(last, 10);
      const isNumeric = /^\d+$/.test(last);

      // Play <scenes> component if URL is bad. Otherwise, go to the scene.
      if (!isNumeric || power < this.min || power > this.max) {
        last = '';
      } else {
        this.power = power;
      }
    } else {
      last = `${power}`;
    }

    // Always update address bar.
    segments.pop();
    segments.push(last);
    history.replaceState(null, '', segments.join('/'));

    // Update browser's history list.
    if (power) {
      const scene = this.scenes.find(scene => parseInt(scene.power) === this.power);
      const {distance} = scene;
      document.title = `10^${this.power} · ${distance[0]} · ${this.appTitle}`;
    } else {
      document.title = this.appTitle;
    }
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
        const power_ = parseInt(power);

        const small = `images/${image}@small.webp`;
        const medium = `images/${image}@medium.webp`;
        const large = `images/${image}@large.webp`;;

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
