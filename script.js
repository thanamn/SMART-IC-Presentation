const slidesList = [
    'slides/slide1.html',
    'slides/slide3.html',
    'slides/slide2.html',
    'slides/slide1c.html',        // Intro - Capital Costs
    'slides/slide4.html',
    'slides/slide1b.html',        // Intro - Project Overivew
    'slides/slide1d.html',        // Intro - Literature Gap / Closing the Loop
    'slides/slide1e.html',        // Intro - Roadmap
    'slides/slide5.html',         // Sec II Platform (Fig 1)
    'slides/slide5b.html',        // Sec II AI Outputs to Fab Actions
    'slides/slide5d.html',        // Sec II.A Why Multivariate Deep Learning
    'slides/slide5e.html',        // Sec II.A Three Core AI Tasks
    'slides/slide5f.html',        // Sec II.B Extending MES into Meta-MES
    'slides/slide5g.html',        // Sec II.B Dynamic Scheduling & Feedback
    'slides/slide5c.html',        // Sec III.A Case Study
    'slides/slide6.html',         // Sec III.A Data Characteristics
    'slides/slide7.html',         // Methodology
    'slides/slide10.html',        // Sec III.B.1 Offline Reconstruction
    'slides/slide11.html',        // Sec III.B.1 Detecting Failures (Fig 2)
    'slides/slide12.html',        // Sec III.B.1 Performance (Fig 3)
    'slides/slide12f.html',       // Sec III.B.2 Real-time Window Logic
    'slides/slide9.html',         // Sec III.B.2 Sliding Window (Fig 4)
    'slides/slide12b.html',       // Sec III.C Forecasting
    'slides/slide12c.html',       // Sec III.D Synthetic Data (Fig 5)
    'slides/slide12d.html',       // Sec III.E Meta-MES Optimization
    'slides/slide13.html',        // Sec IV Summary & DATE
    'slides/slide14.html',        // Sec IV Integrated Framework & Feedback
    'slides/slide17.html'         // Q&A
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
      if (!slides || slides.length === 0) return;
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

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

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
