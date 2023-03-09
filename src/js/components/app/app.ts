import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() appTitle: string = 'Powers Of Ten';
  @state() infoEvent = 'info';
  @state() infoListener: EventListenerObject;
  @state() play: boolean = true;
  @state() popstateListener: EventListenerObject;
  @state() scene: Number;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.infoListener = this.updateInfo.bind(this);
    this.popstateListener = this.updateScene.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(this.infoEvent, this.infoListener);
    window.addEventListener('popstate', this.popstateListener);
    this.updateScene();
  }

  disconnectedCallback() {
    super.connectedCallback();
    this.removeEventListener(this.infoEvent, this.infoListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  updateScene() {
    const slug = window.location.pathname.split('/');
    const scene = Number(slug[1]);
    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;
  }

  updateInfo(event: CustomEvent) {
    const {distance, power} = event.detail;
    document.title = `10^${power} · ${this.appTitle}`;
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes scene="${this.scene}"></ten-scenes>
    `;
  }
}