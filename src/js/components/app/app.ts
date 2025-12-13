import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Events} from '../../shared';


/**
 * Web component for Powers of Ten app which renders and controls intro and
 * scenes components via custom events.
 */
@customElement('ten-app') class App extends LitElement {
  @state() play: boolean = false;
  @state() target: HTMLElement;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(Events.TouchStart, this.handleTouchStart, {passive: true});
    this.addEventListener(Events.TouchEnd, this.handleTouchEnd, {passive: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(Events.TouchStart, this.handleTouchStart);
    this.removeEventListener(Events.TouchEnd, this.handleTouchEnd);
  }

  protected createRenderRoot() {
    return this;
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
        ?inert=${!this.play}
        ?play=${this.play}
        @stop=${() => this.play = false}></ten-intro>
      <ten-scenes
        ?wait=${this.play}
        @play=${() => this.play = true}
        @stop=${() => this.play = false}></ten-scenes>
    `;
  }
}