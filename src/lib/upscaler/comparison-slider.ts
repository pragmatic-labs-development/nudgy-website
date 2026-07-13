/**
 * Before/after comparison slider component.
 * Supports mouse, touch, and keyboard interaction.
 */

export function initComparisonSlider(
  container: HTMLElement,
  afterWrapper: HTMLElement,
  divider: HTMLElement
) {
  let isDragging = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setPosition(percent: number) {
    const clamped = Math.max(0, Math.min(100, percent));
    afterWrapper.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    divider.style.left = `${clamped}%`;
    container.setAttribute('aria-valuenow', String(Math.round(clamped)));
  }

  function getPercentFromEvent(clientX: number): number {
    const rect = container.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // Mouse events
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isDragging = true;
    container.setPointerCapture(e.pointerId);
    setPosition(getPercentFromEvent(e.clientX));
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    setPosition(getPercentFromEvent(e.clientX));
  }

  function onPointerUp() {
    isDragging = false;
  }

  // Keyboard support
  function onKeyDown(e: KeyboardEvent) {
    const current = parseFloat(container.getAttribute('aria-valuenow') || '50');
    const step = e.shiftKey ? 10 : 2;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setPosition(current - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setPosition(current + step);
        break;
      case 'Home':
        e.preventDefault();
        setPosition(0);
        break;
      case 'End':
        e.preventDefault();
        setPosition(100);
        break;
    }
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
  container.addEventListener('keydown', onKeyDown);

  // Set initial position
  if (!prefersReducedMotion) {
    setPosition(50);
  } else {
    setPosition(50);
  }

  // Return cleanup function
  return function destroy() {
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerUp);
    container.removeEventListener('keydown', onKeyDown);
  };
}
