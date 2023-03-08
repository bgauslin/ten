import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import shadowStyles from './app.scss';

interface Scene {
  blurb: string,
  distance: string[],
  image: string,
  power: string,
}

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() hasSlug: Boolean = false;
  @state() intro?: HTMLElement;
  @state() introObserver: MutationObserver;
  @state() popstateListener: EventListenerObject;
  @state() playing: boolean = false;
  @state() ready: boolean = false;
  @state() scene = 0;
  @state() scenes: Scene[];

  static styles = css`${shadowStyles}`;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
    this.watchIntro();
    this.popstateListener = this.updateScene.bind(this);
    window.addEventListener('popstate', this.popstateListener, false);
  }

  disconnectedCallback() {
    super.connectedCallback();
    window.removeEventListener('popstate', this.popstateListener, false);
    this.introObserver.disconnect();
  }

  watchIntro() {
    this.intro = document.querySelector('ten-intro');
    if (this.intro) {
      this.introObserver = new MutationObserver(this.waitForIntro.bind(this));
      this.introObserver.observe(this.intro, {attributes: true});
    }
  }

  waitForIntro(records: MutationRecord[]) {
    for (const mutation of records) {
      const {attributeName, target} = mutation;
      this.playing = (<HTMLElement>target).hasAttribute('playing');
      if (attributeName === 'playing' && !this.playing && !this.hasSlug) {
        history.replaceState(null, '', '/1');
      }
    }
  }

  async fetchData(): Promise<Scene[]> {
    if (this.ready) {
      return;
    }

    try {
      const response = await fetch('https://gauslin.com/api/ten/scenes.json');
      this.scenes = await response.json();
      this.updateScene();
      this.ready = true;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  updateScene() {
    const {pathname} = window.location;
    const slugs = pathname.split('/');
    const slug = Number(slugs[1]);

    if (slug > 0 && slug <= this.scenes.length) {
      this.scene = slug - 1;
      this.hasSlug = true;
    } else {
      this.scene = 0;
      const url = this.playing ? '/' : '/1';
      history.replaceState(null, '', url);
    }
  }

  nextScene() {
    if (this.scene < this.scenes.length) {
      this.scene += 1;
      this.updateWindow();
    }
  }

  prevScene() {
    if (this.scene > 0) {
      this.scene -= 1;
      this.updateWindow();
    }
  }

  updateWindow() {
    const slug = this.scene + 1;
    history.pushState(null, '', slug.toString());
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
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
        const {blurb, distance, power} = scene;
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
        ?disabled="${this.scene === 0}"
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
        ?disabled="${this.scene === this.scenes.length - 1}"
        @click="${this.nextScene}">
        <svg viewbox="0 0 24 24" aria-hidden="true">
          <path d="M6,12 h12 M12,6 v12"/>
        </svg>
      </button>
    `;
  }
}
