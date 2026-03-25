const slidesList = [
  'slides/slide1.html',
  'slides/slide3.html',
  'slides/slide2.html',
  'slides/slide1c.html',        // Intro - Capital Costs
  'slides/slide1b.html',        // Intro - Project Overivew
  'slides/slide1d.html',        // Intro - Literature Gap / Closing the Loop
  'slides/slide4.html',         // Intro - Why AI / ML Fits
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
  'slides/slide17.html'         // Q&A
];

const runtimeScriptUrl = document.currentScript ? new URL(document.currentScript.src, window.location.href) : new URL(window.location.href);
const ASSET_VERSION = runtimeScriptUrl.searchParams.get('v') || '20260325-1';

let slides = [];
let current = 0;
let progressFill;
let counter;
let listenersAttached = false;
let slidesLoadPromise = null;
let isPrinting = false;

function withAssetVersion(path) {
  if (!path || /^(data:|blob:|https?:|\/\/)/i.test(path)) return path;

  const url = new URL(path, window.location.href);
  url.searchParams.set('v', ASSET_VERSION);
  return url.toString();
}

function versionSlideAssets(container) {
  container.querySelectorAll('img[src]').forEach((img) => {
    const source = img.getAttribute('src');
    if (!source) return;
    img.src = withAssetVersion(source);
  });
}

function waitForImages(root = document) {
  const images = Array.from(root.querySelectorAll('img'));
  const pending = images.filter((img) => !img.complete);
  if (pending.length === 0) return Promise.resolve();

  return Promise.all(
    pending.map((img) => new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }))
  );
}

async function ensureAllSlidesLoaded() {
  if (slides.length >= slidesList.length) return;
  if (!slidesLoadPromise) {
    const app = document.getElementById('app');
    if (!app) return;
    slidesLoadPromise = loadRemainingSlides(app, slides.length);
  }
  await slidesLoadPromise;
}

async function preparePresentationForPrint() {
  await ensureAllSlidesLoaded();
  await waitForImages(document.getElementById('app'));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function printPresentation() {
  if (isPrinting) return;
  isPrinting = true;
  document.body.classList.add('print-mode');

  try {
    await preparePresentationForPrint();
    window.print();
  } catch (error) {
    console.error('Error preparing print:', error);
    window.print();
  }
}

async function initPresentation() {
  const app = document.getElementById('app');
  if (!app) return;

  progressFill = document.getElementById('progressFill');
  counter = document.getElementById('counter');
  attachInteractionHandlers();

  await appendSlide(slidesList[0], app, 0);
  showSlide(0);

  // Load the remaining slides in the background so the first slide is visible immediately.
  const startIndex = slides.length > 0 ? 1 : 0;
  slidesLoadPromise = loadRemainingSlides(app, startIndex);
}

async function appendSlide(slidePath, container, index) {
  try {
    const response = await fetch(withAssetVersion(slidePath), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    const section = document.createElement('section');
    section.className = 'slide';
    const variantClass = getSlideVariant(typeof index === 'number' ? index : slides.length);
    if (variantClass) section.classList.add(variantClass);
    section.innerHTML = html;
    versionSlideAssets(section);
    container.appendChild(section);
    slides.push(section);
    if (slides.length > 1) {
      showSlide(current);
    }
    return section;
  } catch (error) {
    console.error(`Error loading ${slidePath}:`, error);
    return null;
  }
}

async function loadRemainingSlides(container, startIndex = 1) {
  for (let i = startIndex; i < slidesList.length; i += 1) {
    await appendSlide(slidesList[i], container, i);
  }
}

function getSlideVariant(index) {
  if (index === 0) return 'title-slide';
  if (index === slidesList.length - 1) return 'thankyou-slide';
  return 'content-slide';
}

function attachInteractionHandlers() {
  if (listenersAttached) return;
  listenersAttached = true;

  document.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      await printPresentation();
      return;
    }

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

  // Navigate by clicking left/right thirds when content isn't selected.
  document.addEventListener('click', (e) => {
    const selection = window.getSelection();
    if (e.target.closest('button') || e.target.closest('a') || (selection && selection.toString())) return;
    const xRatio = e.clientX / window.innerWidth;
    if (xRatio > 0.78) nextSlide();
    else if (xRatio < 0.22) prevSlide();
  });

  window.addEventListener('beforeprint', () => {
    document.body.classList.add('print-mode');
    void preparePresentationForPrint();
  });

  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode');
    isPrinting = false;
  });
}

function showSlide(index) {
  if (slides.length === 0) return;
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
  });
  const progress = slides.length > 1 ? (current / (slides.length - 1)) * 100 : 100;
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
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
