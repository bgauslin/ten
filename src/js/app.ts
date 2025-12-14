import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';


/**
 * Lit web component which controls the intro and scenes components.
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