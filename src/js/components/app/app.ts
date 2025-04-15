import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

/**
 * Web component for Powers of Ten app which renders and controls intro and
 * scenes components via custom events.
 */
@customElement('ten-app')
class App extends LitElement {
  private doneListener: EventListenerObject;
  private replayListener: EventListenerObject;

  @state() play: boolean = true;
  @state() target: HTMLElement;

  constructor() {
    super();
    this.doneListener = this.done.bind(this);
    this.replayListener = this.replay.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('done', this.doneListener);
    this.addEventListener('replay', this.replayListener);
    this.addEventListener('touchstart', this.handleTouchStart, {passive: true});
    this.addEventListener('touchend', this.handleTouchEnd, {passive: true});
    this.firstRun();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('done', this.doneListener);
    this.removeEventListener('replay', this.replayListener);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * Disables intro if there's a valid power number in the URL on page load.
   */
  private firstRun() {
    const segments = window.location.pathname.split('/');
    const power = parseInt(segments[segments.length - 1]);
    this.play = power < -16 || power > 25 || isNaN(power);
  }

  private done() {
    this.play = false;
  }
 
  private replay() {
    this.play = true;
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
   * When the intro animation finishes, it sends a custom event to the app
   * which toggles the 'wait' attribute on the scenes component which in turn
   * udpates itself and the browser URL.
   */
  protected render() {
    return html`
      <ten-intro ?play="${this.play}"></ten-intro>
      <ten-scenes ?wait="${this.play}"></ten-scenes>
    `;
  }
}