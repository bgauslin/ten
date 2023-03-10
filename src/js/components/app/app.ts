import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  @state() introListener: EventListenerObject;
  @state() play: boolean = true;
  @state() popstateListener: EventListenerObject;
  @state() scene: Number;

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.introListener = this.introDone.bind(this);
    this.popstateListener = this.updateScene.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('done', this.introListener);
    window.addEventListener('popstate', this.popstateListener);
    this.updateScene();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.introListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  introDone() {
    this.play = false;
  }

  updateScene() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);

    if (isNaN(scene)) {
      this.play = true;
      history.replaceState(null, '', '/');
    } else {
      this.play = scene === 0;
    }

    this.scene = (scene >= 1 && scene <= 42) ? scene : 1;
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes
        scene="${this.scene}"
        ?wait="${this.play}"></ten-scenes>
    `;
  }
}