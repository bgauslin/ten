import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() play: boolean = true;
  @state() popstateListener: EventListenerObject;
  @state() scene: Number;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.popstateListener = this.updateScene.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.popstateListener, false);
    this.updateScene();
  }

  disconnectedCallback() {
    super.connectedCallback();
    window.removeEventListener('popstate', this.popstateListener, false);
  }

  updateScene() {
    const slug = window.location.pathname.split('/');
    const scene = Number(slug[1]);
    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes scene="${this.scene}"></ten-scenes>
    `;
  }
}