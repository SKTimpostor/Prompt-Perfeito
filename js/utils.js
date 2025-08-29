// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  } else if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto remove
  const autoRemove = setTimeout(() => removeToast(toast), duration);
  
  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoRemove);
    removeToast(toast);
  });
  
  return toast;
}

/**
 * Remove toast notification
 */
function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Show modal
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in text
 */
function countCharacters(text) {
  return text.length;
}

/**
 * Calculate prompt quality score
 */
function calculatePromptQuality(prompt) {
  const words = countWords(prompt);
  const chars = countCharacters(prompt);
  
  let score = 0;
  let quality = 'poor';
  
  // Length scoring
  if (chars >= 100 && chars <= 500) score += 30;
  else if (chars > 500 && chars <= 1000) score += 20;
  else if (chars > 50) score += 10;
  
  // Word count scoring
  if (words >= 20 && words <= 100) score += 25;
  else if (words > 100 && words <= 150) score += 15;
  else if (words > 10) score += 10;
  
  // Structure scoring
  if (prompt.includes('Atue como')) score += 15;
  if (prompt.includes('Preciso que')) score += 15;
  if (prompt.includes('responda em') || prompt.includes('formato')) score += 10;
  if (prompt.includes('tom') || prompt.includes('estilo')) score += 10;
  if (prompt.includes('Evite')) score += 10;
  
  // Determine quality level
  if (score >= 80) quality = 'excellent';
  else if (score >= 60) quality = 'good';
  else if (score >= 40) quality = 'average';
  else quality = 'poor';
  
  return { score, quality };
}

/**
 * Format prompt quality for display
 */
function formatQuality(quality) {
  const qualityMap = {
    excellent: { text: 'Excelente', class: 'quality-excellent' },
    good: { text: 'Boa', class: 'quality-good' },
    average: { text: 'Média', class: 'quality-average' },
    poor: { text: 'Ruim', class: 'quality-poor' }
  };
  
  return qualityMap[quality] || qualityMap.poor;
}

/**
 * Animate element entrance
 */
function animateEntrance(element, animation = 'fadeIn', delay = 0) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    element.style.transition = 'all 0.6s ease-out';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    element.classList.add(`animate-${animation}`);
  }, delay);
}

/**
 * Setup scroll reveal animations
 */
function setupScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right')
    .forEach(el => observer.observe(el));
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Copy prompt
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('copyPrompt')?.click();
    }
    
    // Ctrl/Cmd + L: Clear form
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      document.getElementById('clearForm')?.click();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        hideModal(modal.id);
      });
    }
    
    // Ctrl/Cmd + H: Show history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      document.getElementById('historyBtn')?.click();
    }
    
    // Ctrl/Cmd + ?: Show help
    if ((e.ctrlKey || e.metaKey) && e.key === '?') {
      e.preventDefault();
      document.getElementById('helpBtn')?.click();
    }
  });
}

/**
 * Setup ripple effect for buttons
 */
function setupRippleEffect() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-ripple')) {
      const button = e.target;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  });
}

/**
 * Update status indicator
 */
function updateStatus(text, active = false) {
  const indicator = document.getElementById('statusIndicator');
  const statusText = indicator.querySelector('.status-text');
  
  statusText.textContent = text;
  
  if (active) {
    indicator.classList.add('active');
    setTimeout(() => indicator.classList.remove('active'), 2000);
  }
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 0) {
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get random item from array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if device is mobile
 */
function isMobile() {
  return window.innerWidth <= 768;
}

/**
 * Check if device supports touch
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get browser info
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  return {
    name: browser,
    userAgent: ua,
    isMobile: isMobile(),
    isTouch: isTouchDevice()
  };
}

// Export functions for use in other modules
window.Utils = {
  debounce,
  throttle,
  generateId,
  formatDate,
  copyToClipboard,
  showToast,
  removeToast,
  showModal,
  hideModal,
  isValidEmail,
  sanitizeHTML,
  countWords,
  countCharacters,
  calculatePromptQuality,
  formatQuality,
  animateEntrance,
  setupScrollReveal,
  setupKeyboardShortcuts,
  setupRippleEffect,
  updateStatus,
  scrollToElement,
  isInViewport,
  getRandomItem,
  shuffleArray,
  formatFileSize,
  isMobile,
  isTouchDevice,
  getBrowserInfo
};

