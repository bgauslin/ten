/**
 * Custom element for Powers of Ten intro animation that programmatically
 * renders SVG elements for a field of stars, an atom, and text copy.
 */
customElements.define('ten-intro', class extends HTMLElement {
  private animationHandler: EventListenerObject;
  private appTitle: string;
  private clickHandler: EventListenerObject;
  private intro: string[] = [
    'What would you see if your vision could encompass an expanse of one billion light years?',
    'Or if you could peer inside the microscopic realm of the atom?',
    'In 42 consecutive scenes, each at a different “power of ten” level of magnification, you will travel from the breathtakingly vast to the extraordinarily small.',
  ];
  private ready: boolean = false;

  static observedAttributes: string[] = ['play'];

  constructor() {
    super();
    this.appTitle = document.title;
    this.animationHandler = this.handleAnimation.bind(this);
    this.clickHandler = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.addEventListener('animationend', this.animationHandler);
    this.addEventListener('click', this.clickHandler);
  }

  disconnectedCallback() {
    this.removeEventListener('animationend', this.animationHandler);
    this.removeEventListener('click', this.clickHandler);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'play' && newValue === '') {
      this.play();
    }
  }

  /**
   * Sets 'skip' attribute to automatically trigger the final fade-out animation
   * after the <h1> animation ends.
   */
  private handleAnimation(event: AnimationEvent) {
    const target = <HTMLElement>event.target;

    // Trigger animation via temporary attribute.
    if (target.tagName.toLowerCase() === 'h1') {
      this.setAttribute('skip', '');
    }

    // Fade-out animation is over; clean up and show the scenes.
    if (target === this && this.hasAttribute('skip')) {
      this.removeAttribute('skip');
      this.innerHTML = '';
      this.ready = false;
      this.dispatchEvent(new CustomEvent('stop', {bubbles: true}));
    }
  }

  /**
   * Sets 'skip' attribute when the <button> is clicked to trigger the final
   * fade-out animation.
   */
  private handleClick(event: Event) {
    const target = <HTMLElement>event.target;
    if (target.tagName === 'BUTTON') {
      this.setAttribute('skip', '');
    }
  }

  /**
   * Renders the DOM then lets CSS animations take over.
   */
  private play() {
    if (this.ready) return;

    const meta = <HTMLMetaElement>document.head.querySelector('[name="description"]');
    const [stars, atom, overview] = this.intro;
    
    this.innerHTML = `
      <header>
        <h1>${this.appTitle}</h1>
        <p class="tagline">${meta.content}</p>
      </header>
      ${this.renderStars()}
      <p data-blurb="stars">${stars}</p>
      ${this.renderAtom()}
      <p data-blurb="atom">${atom}</p>
      <p data-blurb="overview">${overview}</p>
      <button type="button">
        Skip
        <svg aria-hidden="true" viewbox="0 0 24 24">
          <path d="M6,6 L16,12 L6,18 M18,6 L18,18 L20,18 L20,6 Z" />
        </svg>
      </button>
    `;

    this.ready = true;
  }

  private renderStars() {
    return `
      <div aria-hidden="true" class="stars">
        ${this.renderStarfield()}
        ${this.renderMeteors()}
      </div>
    `;
  }

  private renderStarfield() {
    const radii = [[.5, 500], [.75, 300], [1, 200]];
    const size = 1000;

    let paths = '';
    for (let i = 0; i < radii.length; i++) {
      let path = '';
      const [r, qty] = radii[i];
      
      for (let j = 0; j < qty; j++) {
        const cx = Math.floor(Math.random() * size);
        const cy = Math.floor(Math.random() * size);

        path += `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${r * -2},0`;
        if (i < qty - 1) {
          path += ' ';
        }
      }
      paths += `
        <svg class="starfield" viewbox="0 0 ${size} ${size}">
          <path d="${path}"/>
        </svg>
      `;
    }

    return paths;
  }

  private renderMeteors() {
    let meteors = '';
    for (let i = 0; i < 5; i++) {
      meteors += `<div class="meteor" id="meteor-${i + 1}"></div>`;
    }
    return meteors;
  }

  private renderAtom() {
    return `
      <div aria-hidden="true" class="atom">
        ${this.renderNucleus()} 
        ${this.renderElectrons()}
      </div>
    `;
  }

  private renderNucleus() {
    const protons = [[33, 60], [67, 60], [50, 31]];
    const neutrons = [[33, 40], [67, 40], [50, 70]];
    const middle = [[50, 50]];
  
    let particles = '';
    const draw = (classname: string, coords: number[][]) => {
      for (const coord of coords) {
        const [cx, cy] = coord;
        particles += `<circle class="${classname}" cx="${cx}" cy="${cy}" r="17"></circle>`;
      }
    }
    draw('proton', protons);
    draw('neutron', neutrons);
    draw('proton', middle);

    return `
      <div class="nucleus">
        <svg viewbox="0 0 100 100">
          ${particles}
        </svg>
      </div>
    `;
  }

  private renderElectrons() {
    // Value for 'path' must match 'offset-path' value in Sass module.
    const path = 'M10 100a90 30 0 1 0 180 0a90 30 0 1 0 -180 0 Z';

    let electrons = '';
    for (let i = 0; i < 3; i++) {
      electrons += `
        <div class="electron" id="electron-${i + 1}">
          <div class="particle"></div>
          <svg viewbox="0 0 200 200">
            <path class="orbit" d="${path}"/>
          </svg>
        </div>
      `;
    }
    return electrons;
  }
});