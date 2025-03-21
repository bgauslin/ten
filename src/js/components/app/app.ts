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
  private scenes = 42;

  @state() play: boolean = false;
  @state() target: HTMLElement;

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
    this.addEventListener('touchstart', this.handleTouchStart, {passive: true});
    this.addEventListener('touchend', this.handleTouchEnd, {passive: true});
    window.addEventListener('popstate', this.popstateListener);
    this.playIntro();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.introListener);
    this.removeEventListener('replay', this.replayListener);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
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
    const scene = parseInt(segments[segments.length - 1]);
    this.play = scene > this.scenes || scene === 0 || isNaN(scene);
  }

  private handleTouchStart(event: TouchEvent) {
    this.target = <HTMLElement>event.composedPath()[0];
    if (this.target.tagName === 'BUTTON') {
      this.target.classList.add('touch');
    }
  }

  private handleTouchEnd() {
    this.target.classList.remove('touch');
  }

  protected render() {
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes ?wait="${this.play}"></ten-scenes>
    `;
  }
}