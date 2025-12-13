import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Events} from '../../shared';


/**
 * Web component for Powers of Ten app which renders and controls intro and
 * scenes components via custom events.
 */
@customElement('ten-app') class App extends LitElement {
  @state() play: boolean = false;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected createRenderRoot() {
    return this;
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
      <ten-touch></ten-touch>
    `;
  }
}