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
    this.stopListener = this.stop.bind(this);
    this.playListener = this.play.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('stop', this.stopListener);
    this.addEventListener('play', this.playListener);
    this.addEventListener('touchstart', this.handleTouchStart, {passive: true});
    this.addEventListener('touchend', this.handleTouchEnd, {passive: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('stop', this.stopListener);
    this.removeEventListener('play', this.playListener);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  protected createRenderRoot() {
    return this;
  }

  private stop() {
    this.playIntro = false;
  }
 
  private play() {
    this.playIntro = true;
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
   * Removing the 'wait' attribute triggers a callback within the
   * <ten-scenes> element.
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