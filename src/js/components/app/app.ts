import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

/**
 * Web component for Powers of Ten app which renders intro and scenes
 * components and their attributes based on the current URL.
 */
@customElement('powers-of-ten')
class App extends LitElement {
  @state() introListener: EventListenerObject;
  @state() play: boolean = false;
  @state() popstateListener: EventListenerObject;

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

  createRenderRoot() {
    return this;
  }

  introDone() {
    this.play = false;
  }

  playIntro() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);
    this.play = scene > 42 || scene === 0 || isNaN(scene);
  }

  render() { 
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes ?wait="${this.play}"></ten-scenes>
    `;
  }
}