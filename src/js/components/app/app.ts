import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import shadowStyles from './app.scss';

/**
 * Web component for Powers Of Ten app.
 */
@customElement('ten-app')
class App extends LitElement {
  static styles = css`${shadowStyles}`;

  render() {    
    return html`
      <ten-intro play></ten-intro>
      <ten-scenes></ten-scenes>
    `;
  }
}