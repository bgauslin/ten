import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

/**
 * Web component for Powers of Ten app which renders intro and scenes
 * components and their attributes based on the current URL.
 */
@customElement('powers-of-ten')
class App extends LitElement {
  private introListener: EventListenerObject;
  private popstateListener: EventListenerObject;
  private replayListener: EventListenerObject;

  @state() play: boolean = false;

  constructor() {
    super();
    this.introListener = this.introDone.bind(this);
    this.replayListener = this.playIntro.bind(this);
    this.popstateListener = this.playIntro.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('done', this.introListener);
    this.addEventListener('replay', this.replayListener);
    window.addEventListener('popstate', this.popstateListener);
    this.playIntro();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.introListener);
    this.removeEventListener('replay', this.replayListener);
    window.removeEventListener('popstate', this.popstateListener);
  }

  protected createRenderRoot() {
    return this;
  }

  private introDone() {
    this.play = false;
  }

  private playIntro() {
    const segments = window.location.pathname.split('/');
    const scene = Number(segments[1]);
    this.play = scene > 42 || scene === 0 || isNaN(scene);
  }

  protected render() {
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes ?wait="${this.play}"></ten-scenes>
    `;
  }
}