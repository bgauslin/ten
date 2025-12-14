import {LitElement, PropertyValues, css, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {Events, Scene} from './shared';
import shadowStyles from './shadow-styles/scenes.scss';


/**
 * Lit web component that fetches all scenes from a JSON endpoint and displays
 * the current scene based on URL parameter.
 */
@customElement('ten-scenes') class Scenes extends LitElement {
  private appTitle: string;
  private keyHandler: EventListenerObject;

  @property({type: Number}) power: number;
  @property({reflect: true, type: Boolean}) replay = false;
  @property({reflect: true, type: Boolean}) rewind = false;
  @property({type: Boolean}) wait = false;

  @state() max: number;
  @state() min: number;
  @state() scenes: Scene[];

  constructor() {
    super();
    this.appTitle = document.title;
    this.keyHandler = this.handleKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(Events.KeyUp, this.keyHandler);
    this.fetchScenes();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(Events.KeyUp, this.keyHandler);
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
      this.dispatchEvent(new CustomEvent(Events.Stop));
    } else {
      this.power = this.max;
      this.dispatchEvent(new CustomEvent(Events.Play));
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
    this.addEventListener(Events.AnimationEnd, () => {
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
    if (!this.scenes) return;

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
              loading="${power_ < (this.power - 1) ? 'lazy' : 'eager'}"
              sizes="(min-width: 49rem) 600px, 100vw"
              src="${medium}"
              srcset="${small} 600w, ${medium} 900w, ${large} 1200w">
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
              ${index === this.scenes.length - 1 ? html`
                <button
                  class="rewind"
                  title="Rewind to the start"
                  ?disabled=${this.power !== this.min}
                  @click=${this.rewindScenes}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12,6 L6,12 L12,18 M20,6 L14,12 L20,18 Z" />
                  </svg>
                  Rewind
                </button>` : nothing}
            </div>
          </li>
        `;
      })}
      </ul>
      
      <button
        class="nav"
        id="prev"
        title="Zoom out by a power of 10"
        ?disabled=${this.power === this.max || this.rewind}
        @click=${this.prevScene}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M7,12 h10"/>
        </svg>
      </button>

      <button
        class="nav"
        id="replay"
        title="Replay the intro"
        ?disabled=${this.power !== this.max || this.rewind}
        @click=${this.replayIntro}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M11,7 L6,12 L11,17 M6,12 L18,12"/>
        </svg>
      </button>
      
      <button
        class="nav"
        id="next"
        title="Zoom in by a power of 10"
        ?disabled=${this.power === this.min || this.rewind}
        @click=${this.nextScene}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6,12 h12 M12,6 v12"/>
        </svg>
      </button>
    `;    
  }

  // Shadow DOM stylesheet.
  static styles = css`${shadowStyles}`;
}
