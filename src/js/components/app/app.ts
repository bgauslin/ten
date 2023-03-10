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

  static styles = css`${shadowStyles}`;

  constructor() {
    super();
    this.introListener = this.introDone.bind(this);
    this.popstateListener = this.playIntro.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('done', this.introListener);
    window.addEventListener('popstate', this.popstateListener);
    this.playIntro();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.introListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  introDone() {
    this.play = false;
  }

  playIntro() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);

    if (isNaN(scene) || scene > 42) {
      this.play = true;
    } else {
      this.play = scene === 0;
    }
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes ?wait="${this.play}"></ten-scenes>
    `;
  }
}