const progress = document.getElementById('reading-progress');
const toast = document.getElementById('toast');
let toastTimeout;

function updateProgress() {
  const remaining = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${remaining > 0 ? Math.min(100, (window.scrollY / remaining) * 100) : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

function announce(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2700);
}

document.querySelectorAll('.copy-button').forEach(button => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    const value = source?.textContent.trim();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      if (!copied) { announce('Copy failed. Select the prompt text instead.'); return; }
    }
    announce('Prompt copied');
    const previous = button.textContent;
    button.textContent = 'Copied ✓';
    setTimeout(() => button.textContent = previous, 2300);
  });
});

const poll = document.querySelector('[data-poll="bottleneck"]');
const pollButtons = [...poll.querySelectorAll('[data-choice]')];
const pollResponse = poll.querySelector('.poll-response');
let savedChoice = null;
try { savedChoice = localStorage.getItem('himsr-workshop-bottleneck'); } catch { /* local file preview can block storage */ }
function showChoice(choice) {
  pollButtons.forEach(button => {
    const selected = button.dataset.choice === choice;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const label = pollButtons.find(button => button.dataset.choice === choice)?.textContent;
  pollResponse.textContent = label ? `You chose: ${label}. Raise your hand when this option is called.` : '';
}
showChoice(savedChoice);
pollButtons.forEach(button => button.addEventListener('click', () => {
  try { localStorage.setItem('himsr-workshop-bottleneck', button.dataset.choice); } catch { /* choice still works for this visit */ }
  showChoice(button.dataset.choice);
}));

const cueButton = document.getElementById('presenter-toggle');
cueButton.addEventListener('click', () => {
  const active = document.body.classList.toggle('show-cues');
  cueButton.setAttribute('aria-pressed', String(active));
  cueButton.textContent = active ? 'Hide cues' : 'Presenter cues';
});

const reveal = document.getElementById('reveal-answer');
const answer = document.getElementById('scenario-answer');
reveal.addEventListener('click', () => {
  const open = answer.hidden;
  answer.hidden = !open;
  reveal.setAttribute('aria-expanded', String(open));
  reveal.textContent = open ? 'Hide discussion points ↑' : 'Reveal discussion points ↓';
});

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-25% 0px -60% 0px' });
sections.forEach(section => observer.observe(section));

