/**
 * Custom element for Powers of Ten intro animation that programmatically
 * renders SVG elements for a field of stars, an atom, and text copy.
 */
customElements.define('ten-intro', class extends HTMLElement {
  private animationListener: EventListenerObject;
  private appTitle: string;
  private button: HTMLButtonElement;
  private intro: string[] = [
    'What would you see if your vision could encompass an expanse of one billion light years?',
    'Or if you could peer inside the microscopic realm of the atom?',
    'In 42 consecutive scenes, each at a different “power of ten” level of magnification, you will travel from the breathtakingly vast to the extraordinarily small.',
  ];

  constructor() {
    super();
    this.animationListener = this.done.bind(this);
    this.appTitle = document.title;
  }

  static observedAttributes = ['play'];

  connectedCallback() {
    this.addEventListener('animationend', this.animationListener);
  }

  disconnectedCallback() {
    this.removeEventListener('animationend', this.animationListener);
  }

  attributeChangedCallback() {
    this.play();
  }

  /**
   * Listens for last element's animation to complete, then lets the app know
   * that the intro is done and to show the scenes now.
   */
  private done(event: AnimationEvent) {
    const target = <HTMLElement>event.target;

    if (['h1', 'button'].includes(target.tagName.toLowerCase())) {
      this.removeAttribute('play');
      this.removeAttribute('skip');
      this.innerHTML = '';
      
      this.dispatchEvent(new CustomEvent('done', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  private play() {
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

    this.button = this.querySelector('button');
    this.button.addEventListener('click', () => {
      this.setAttribute('skip', '');
      this.button.disabled = true;
    });
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