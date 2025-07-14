export const scrollToItem = (itemId: string, selector?: string) => {
  if (typeof window === 'undefined') return;
  
  const attemptScroll = () => {
    const possibleSelectors = [
      `[data-item-id="${itemId}"]`,
      `[data-id="${itemId}"]`,
      `[data-employer-id="${itemId}"]`,
      `[data-jobseeker-id="${itemId}"]`,
      `[data-application-id="${itemId}"]`,
      `[data-job-id="${itemId}"]`,
      ...(selector ? [selector] : [])
    ];

    let targetElement = null;
    
    for (const sel of possibleSelectors) {
      targetElement = document.querySelector(sel);
      if (targetElement) break;
    }

    if (targetElement) {
      const offset = 100;
      const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementTop - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      targetElement.classList.add('highlight-item');

      setTimeout(() => {
        targetElement?.classList.remove('highlight-item');
      }, 2000);

      return true;
    }
    
    return false;
  };

  if (attemptScroll()) return;

  setTimeout(() => {
    if (attemptScroll()) return;

    setTimeout(() => {
      attemptScroll();
    }, 1000);
  }, 300);
};

export const restoreScrollWithItemHighlight = (
  itemIdSessionKey: string,
  fallbackScrollKey: string,
  selector?: string
) => {
  if (typeof window === 'undefined') return;

  const selectedItemId = sessionStorage.getItem(itemIdSessionKey);
  
  if (selectedItemId) {
    sessionStorage.removeItem(itemIdSessionKey);

    scrollToItem(selectedItemId, selector);
  } else {
    const savedPosition = localStorage.getItem(fallbackScrollKey);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      setTimeout(() => {
        window.scrollTo({ top: position, behavior: 'smooth' });
      }, 100);
    }
  }
};
