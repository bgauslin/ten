import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {AppData, Scene} from '../../shared';

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
    window.scrollTo(0, 0);
  }

  updateApp() {
    const {pathname} = window.location;
    const slug = pathname.split('/');
    const scene = Number(slug[1]);
    if (scene > 0 && scene <= this.scenes.length) {
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
