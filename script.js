const slidesList = [
    'slides/slide1.html',
    'slides/slide2.html',
    'slides/slide3.html',
    'slides/slide4.html',
    'slides/slide1b.html',        // End of Intro: Project Overview
    'slides/slide5.html',         // Sec II: Platform (Figure 1)
    'slides/slide5b.html',        // Sec II: Two Pillars
    'slides/slide6.html',         // Sec III.A/B: Data Imbalance
    'slides/slide7.html',         // Sec III.B: Generative Models (Why AE/VAE)
    'slides/slide10.html',        // Sec III.B.1: Reconstruction Phase
    'slides/slide11.html',        // Sec III.B.1: Detecting Failures (Figure 2)
    'slides/slide12.html',        // Sec III.B.1: ROC Curves (Figure 3)
    'slides/slide8.html',         // Sec III.B.2: Temporal Feature Eng. (Real-time prep)
    'slides/slide9.html',         // Sec III.B.2: Sliding Window (Figure 4)
    'slides/slide12b.html',       // Sec III.C: Forecasting
    'slides/slide12c.html',       // Sec III.D: Synthetic Generation (Figure 5)
    'slides/slide12d.html',       // Sec III.E: Meta-MES Feedback
    'slides/slide13.html',        // Wrap-up: Deployment
    'slides/slide14.html',
    'slides/slide15.html',
    'slides/slide16.html',
    'slides/slide17.html'
];

let slides = [];
let current = 0;
let progressFill;
let counter;

async function initPresentation() {
    const app = document.getElementById('app');
    
    // Fetch all slides and append them to #app
    for (const slidePath of slidesList) {
        try {
            const response = await fetch(slidePath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();
            
            // Wrap fetched content in a <section class="slide">
            const section = document.createElement('section');
            section.className = 'slide';
            section.innerHTML = html;
            app.appendChild(section);
        } catch (error) {
            console.error(`Error loading ${slidePath}:`, error);
        }
    }

    // Initialize layout and navigation variables matching example.html
    slides = Array.from(document.querySelectorAll('.slide'));
    progressFill = document.getElementById('progressFill');
    counter = document.getElementById('counter');
    
    // Setup event listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        showSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        showSlide(slides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    });

    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);

    // Navigate by clicking left/right thirds, but ignore buttons and selectable content.
    document.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || window.getSelection().toString()) return;
      const xRatio = e.clientX / window.innerWidth;
      if (xRatio > 0.78) nextSlide();
      else if (xRatio < 0.22) prevSlide();
    });

    // Initialize first slide
    showSlide(0);
}

function showSlide(index) {
  if (slides.length === 0) return;
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
  });
  const progress = slides.length > 1 ? (current / (slides.length - 1)) * 100 : 100;
  progressFill.style.width = `${progress}%`;
  counter.textContent = `${current + 1} / ${slides.length}`;
  document.title = `Slide ${current + 1} · SMART-IC deck`;
}

function nextSlide() {
  showSlide(current + 1);
}

function prevSlide() {
  showSlide(current - 1);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.warn(err);
  }
}

// Boot the presentation
initPresentation();
