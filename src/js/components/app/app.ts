import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() appTitle: string = 'Powers Of Ten';
  @state() play: boolean = true;
  @state() popstateListener: EventListenerObject;
  @state() scene: Number;
  @state() scenesEvent = 'sceneUpdated';
  @state() scenesListener: EventListenerObject;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.scenesListener = this.updateTitle.bind(this);
    this.popstateListener = this.updateScene.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(this.scenesEvent, this.scenesListener);
    window.addEventListener('popstate', this.popstateListener);
    this.updateScene();
  }

  disconnectedCallback() {
    super.connectedCallback();
    this.removeEventListener(this.scenesEvent, this.scenesListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  updateScene() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);
    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;
  }

  updateTitle(event: CustomEvent) {
    const {power} = event.detail;
    document.title = `10^${power} · ${this.appTitle}`;
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes scene="${this.scene}"></ten-scenes>
    `;
  }
}