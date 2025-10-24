import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';


/**
 * Web component for Powers of Ten app which renders and controls intro and
 * scenes components via custom events.
 */
@customElement('ten-app')
class App extends LitElement {
  private playListener: EventListenerObject;
  private stopListener: EventListenerObject;

  @state() playIntro: boolean = false;
  @state() target: HTMLElement;

  constructor() {
    super();
    this.playListener = this.play.bind(this);
    this.stopListener = this.stop.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('play', this.playListener);
    this.addEventListener('stop', this.stopListener);
    this.addEventListener('touchstart', this.handleTouchStart, {passive: true});
    this.addEventListener('touchend', this.handleTouchEnd, {passive: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('play', this.playListener);
    this.removeEventListener('stop', this.stopListener);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  protected createRenderRoot() {
    return this;
  }

  private play() {
    this.playIntro = true;
  }

  private stop() {
    this.playIntro = false;
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

  /**
   * When removed, the 'wait' attribute triggers the attributeChangedCallback
   * in <scenes> after <intro> finishes, which then updates the browser.
   */
  protected render() {
    return html`
      <ten-intro
        ?inert="${!this.playIntro}"
        ?play="${this.playIntro}"></ten-intro>
      <ten-scenes ?wait="${this.playIntro}"></ten-scenes>
    `;
  }
}