import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() appTitle: string = 'Powers Of Ten';
  @state() introListener: EventListenerObject;
  @state() play: boolean = true;
  @state() popstateListener: EventListenerObject;
  @state() scene: Number;
  @state() scenesListener: EventListenerObject;
  @state() wait: Boolean = true;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.introListener = this.stopWaiting.bind(this);
    this.popstateListener = this.updateScene.bind(this);
    this.scenesListener = this.updateTitle.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateScene();
    this.addEventListener('done', this.introListener);
    this.addEventListener('updateScene', this.scenesListener);
    window.addEventListener('popstate', this.popstateListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.introListener);
    this.removeEventListener('updateScene', this.scenesListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  stopWaiting() {
    this.wait = false;
  }

  updateScene() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);
    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;

    if (this.wait) {
      history.replaceState(null, '', '/');
    }
  }

  updateTitle(event: CustomEvent) {
    const {power} = event.detail;
    document.title = `10^${power} · ${this.appTitle}`;
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes
        scene="${this.scene}"
        ?wait="${this.wait}"></ten-scenes>
    `;
  }
}