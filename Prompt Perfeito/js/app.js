// ===== MAIN APPLICATION =====

class PromptPerfeitoApp {
  constructor() {
    this.fields = ['papel', 'contexto', 'tarefa', 'formato', 'tom', 'evite'];
    this.currentTheme = 'dark';
    this.isInitialized = false;
    
    this.init();
  }
  
  /**
   * Initialize application
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }
      
      // Initialize components
      await this.initializeComponents();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup keyboard shortcuts
      Utils.setupKeyboardShortcuts();
      
      // Setup scroll reveal
      Utils.setupScrollReveal();
      
      // Setup ripple effects
      Utils.setupRippleEffect();
      
      // Load user settings
      this.loadSettings();
      
      // Initialize preview
      this.updatePreview();
      
      // Show welcome message for first-time users
      this.showWelcomeMessage();
      
      // Mark as initialized
      this.isInitialized = true;
      
      Utils.updateStatus('Aplicação carregada', true);
      
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      Utils.showToast('Erro ao carregar aplicação', 'error');
    }
  }
  
  /**
   * Initialize components
   */
  async initializeComponents() {
    // Initialize storage
    if (window.Storage) {
      Storage.init();
    }
    
    // Initialize templates
    if (window.Templates) {
      await Templates.init();
    }
    
    // Setup theme system
    this.initializeTheme();
    
    // Setup field counters
    this.setupFieldCounters();
    
    // Setup auto-save
    this.setupAutoSave();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Form field listeners
    this.fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field) {
        field.addEventListener('input', Utils.debounce(() => {
          this.updatePreview();
          Templates.updateFieldCounter(fieldName);
        }, 300));
        
        field.addEventListener('blur', () => {
          this.autoSave();
        });
      }
    });
    
    // Button listeners
    this.setupButtonListeners();
    
    // Modal listeners
    this.setupModalListeners();
    
    // Theme toggle
    this.setupThemeToggle();
    
    // Window listeners
    window.addEventListener('beforeunload', () => {
      this.autoSave();
    });
    
    // Visibility change (for auto-save when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.autoSave();
      }
    });
  }
  
  /**
   * Setup button listeners
   */
  setupButtonListeners() {
    // Copy prompt button
    const copyBtn = document.getElementById('copyPrompt');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyPrompt());
    }
    
    // Save prompt button
    const saveBtn = document.getElementById('savePrompt');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.savePrompt());
    }
    
    // Share prompt button
    const shareBtn = document.getElementById('sharePrompt');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.sharePrompt());
    }
    
    // Clear form button
    const clearBtn = document.getElementById('clearForm');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearForm());
    }
    
    // Random template button
    const randomBtn = document.getElementById('randomize');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => Templates.applyRandomTemplate());
    }
    
    // History button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => this.showHistory());
    }
    
    // Help button
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => Utils.showModal('helpModal'));
    }
  }
  
  /**
   * Setup modal listeners
   */
  setupModalListeners() {
    // Close modal buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          Utils.hideModal(modal.id);
        }
      }
      
      // Close modal when clicking outside
      if (e.target.classList.contains('modal')) {
        Utils.hideModal(e.target.id);
      }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          Utils.hideModal(modal.id);
        });
      }
    });
  }
  
  /**
   * Setup theme toggle
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }
  
  /**
   * Initialize theme system
   */
  initializeTheme() {
    // Load saved theme or detect system preference
    const savedTheme = Storage.getSettings().theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    this.currentTheme = savedTheme || systemTheme;
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Storage.getSettings().theme) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  /**
   * Apply theme
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    
    // Save theme preference
    Storage.saveSettings({ theme });
  }
  
  /**
   * Toggle theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    
    Utils.showToast(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
  }
  
  /**
   * Setup field counters
   */
  setupFieldCounters() {
    this.fields.forEach(fieldName => {
      Templates.updateFieldCounter(fieldName);
    });
  }
  
  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.autoSave();
    }, 30000); // Auto-save every 30 seconds
  }
  
  /**
   * Auto-save current form state
   */
  autoSave() {
    if (!Storage.getSettings().autoSave) return;
    
    const formData = {};
    this.fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field) {
        formData[fieldName] = field.value;
      }
    });
    
    // Only save if there's content
    const hasContent = Object.values(formData).some(value => value.trim());
    if (hasContent) {
      localStorage.setItem('promptPerfeito_autoSave', JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  /**
   * Load auto-saved data
   */
  loadAutoSave() {
    try {
      const autoSaveData = localStorage.getItem('promptPerfeito_autoSave');
      if (autoSaveData) {
        const { data, timestamp } = JSON.parse(autoSaveData);
        
        // Check if auto-save is recent (within 24 hours)
        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now - saveTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          // Ask user if they want to restore
          if (confirm('Encontramos dados não salvos. Deseja restaurá-los?')) {
            this.fields.forEach(fieldName => {
              const field = document.getElementById(fieldName);
              if (field && data[fieldName]) {
                field.value = data[fieldName];
                Templates.updateFieldCounter(fieldName);
              }
            });
            
            this.updatePreview();
            Utils.showToast('Dados restaurados com sucesso', 'success');
          }
        }
        
        // Clear old auto-save data
        localStorage.removeItem('promptPerfeito_autoSave');
      }
    } catch (error) {
      console.error('Erro ao carregar auto-save:', error);
    }
  }
  
  /**
   * Load user settings
   */
  loadSettings() {
    const settings = Storage.getSettings();
    
    // Apply theme
    if (settings.theme) {
      this.applyTheme(settings.theme);
    }
    
    // Load auto-saved data if enabled
    if (settings.autoSave !== false) {
      this.loadAutoSave();
    }
  }
  
  /**
   * Update prompt preview
   */
  updatePreview() {
    const preview = document.getElementById('promptPreview');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const qualityScore = document.getElementById('qualityScore');
    
    if (!preview) return;
    
    const prompt = this.buildPrompt();
    
    if (prompt.trim()) {
      preview.innerHTML = `<pre>${Utils.sanitizeHTML(prompt)}</pre>`;
      
      // Update stats
      const chars = Utils.countCharacters(prompt);
      const words = Utils.countWords(prompt);
      const quality = Utils.calculatePromptQuality(prompt);
      
      if (charCount) charCount.textContent = chars;
      if (wordCount) wordCount.textContent = words;
      
      if (qualityScore) {
        const qualityInfo = Utils.formatQuality(quality.quality);
        qualityScore.textContent = qualityInfo.text;
        qualityScore.className = `stat-value ${qualityInfo.class}`;
      }
    } else {
      preview.innerHTML = `
        <div class="preview-placeholder">
          <span class="placeholder-icon">✨</span>
          <p>Preencha os campos acima para ver a pré-visualização do seu prompt</p>
        </div>
      `;
      
      if (charCount) charCount.textContent = '0';
      if (wordCount) wordCount.textContent = '0';
      if (qualityScore) {
        qualityScore.textContent = 'Aguardando';
        qualityScore.className = 'stat-value';
      }
    }
  }
  
  /**
   * Build prompt from form fields
   */
  buildPrompt() {
    const values = {};
    this.fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      values[fieldName] = field ? field.value.trim() : '';
    });
    
    const parts = [
      values.papel ? `Atue como ${values.papel}.` : 'Atue como [papel desejado].',
      values.contexto ? `Estou em ${values.contexto}.` : 'Estou em [contexto/situação].',
      values.tarefa ? `Preciso que você ${values.tarefa}.` : 'Preciso que você [tarefa exata].',
      values.formato ? `Me responda em ${values.formato}.` : 'Me responda em [formato da resposta].',
      values.tom ? `Use um tom ${values.tom}.` : 'Use um tom [tom/estilo].',
      values.evite ? `Evite ${values.evite}.` : 'Evite [coisas que não quero na resposta].'
    ];
    
    return parts.join('\n');
  }
  
  /**
   * Copy prompt to clipboard
   */
  async copyPrompt() {
    const prompt = this.buildPrompt();
    
    if (!prompt.trim()) {
      Utils.showToast('Nenhum prompt para copiar', 'warning');
      return;
    }
    
    const success = await Utils.copyToClipboard(prompt);
    
    if (success) {
      Utils.showToast('Prompt copiado para a área de transferência!', 'success');
      Storage.updateStats('promptsCopied');
      
      // Add to history
      Storage.saveToHistory(prompt);
      
      // Animate copy button
      const copyBtn = document.getElementById('copyPrompt');
      if (copyBtn) {
        copyBtn.classList.add('btn-success');
        setTimeout(() => copyBtn.classList.remove('btn-success'), 1000);
      }
    } else {
      Utils.showToast('Erro ao copiar. Tente novamente.', 'error');
    }
  }
  
  /**
   * Save prompt to favorites
   */
  savePrompt() {
    const prompt = this.buildPrompt();
    
    if (!prompt.trim()) {
      Utils.showToast('Nenhum prompt para salvar', 'warning');
      return;
    }
    
    const result = Storage.addToFavorites(prompt);
    
    if (result.success) {
      Utils.showToast('Prompt salvo nos favoritos!', 'success');
      
      // Animate save button
      const saveBtn = document.getElementById('savePrompt');
      if (saveBtn) {
        saveBtn.classList.add('btn-success');
        setTimeout(() => saveBtn.classList.remove('btn-success'), 1000);
      }
    } else {
      Utils.showToast(result.message || 'Erro ao salvar prompt', 'error');
    }
  }
  
  /**
   * Share prompt
   */
  async sharePrompt() {
    const prompt = this.buildPrompt();
    
    if (!prompt.trim()) {
      Utils.showToast('Nenhum prompt para compartilhar', 'warning');
      return;
    }
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prompt Perfeito',
          text: prompt,
          url: window.location.href
        });
        Utils.showToast('Prompt compartilhado!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.fallbackShare(prompt);
        }
      }
    } else {
      this.fallbackShare(prompt);
    }
  }
  
  /**
   * Fallback share method
   */
  fallbackShare(prompt) {
    // Create shareable URL with encoded prompt
    const encodedPrompt = encodeURIComponent(prompt);
    const shareUrl = `${window.location.origin}${window.location.pathname}?prompt=${encodedPrompt}`;
    
    // Copy URL to clipboard
    Utils.copyToClipboard(shareUrl).then(success => {
      if (success) {
        Utils.showToast('Link de compartilhamento copiado!', 'success');
      } else {
        // Show share modal as last resort
        this.showShareModal(prompt, shareUrl);
      }
    });
  }
  
  /**
   * Show share modal
   */
  showShareModal(prompt, shareUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'shareModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Compartilhar Prompt</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="share-options">
            <div class="share-option">
              <label>Link de compartilhamento:</label>
              <div class="share-url-container">
                <input type="text" class="field-input" value="${shareUrl}" readonly>
                <button class="btn btn-primary" onclick="Utils.copyToClipboard('${shareUrl}').then(() => Utils.showToast('Link copiado!', 'success'))">
                  Copiar
                </button>
              </div>
            </div>
            
            <div class="share-option">
              <label>Texto do prompt:</label>
              <textarea class="field-input" rows="6" readonly>${prompt}</textarea>
              <button class="btn btn-secondary" onclick="Utils.copyToClipboard(\`${prompt.replace(/`/g, '\\`')}\`).then(() => Utils.showToast('Prompt copiado!', 'success'))">
                Copiar Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal close
    modal.querySelector('.modal-close').addEventListener('click', () => {
      Utils.hideModal('shareModal');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  /**
   * Clear form
   */
  clearForm() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
      this.fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
          field.value = '';
          Templates.updateFieldCounter(fieldName);
        }
      });
      
      this.updatePreview();
      Utils.showToast('Formulário limpo', 'info');
      
      // Focus first field
      const firstField = document.getElementById(this.fields[0]);
      if (firstField) {
        firstField.focus();
      }
    }
  }
  
  /**
   * Show history modal
   */
  showHistory() {
    const history = Storage.getHistory(20);
    const favorites = Storage.getFavorites();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'historyModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Histórico e Favoritos</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="history-tabs">
            <button class="tab-btn active" data-tab="history">📚 Histórico (${history.length})</button>
            <button class="tab-btn" data-tab="favorites">⭐ Favoritos (${favorites.length})</button>
            <button class="tab-btn" data-tab="stats">📊 Estatísticas</button>
          </div>
          
          <div class="tab-content">
            <div class="tab-panel active" id="history-panel">
              ${this.renderHistoryPanel(history)}
            </div>
            
            <div class="tab-panel" id="favorites-panel">
              ${this.renderFavoritesPanel(favorites)}
            </div>
            
            <div class="tab-panel" id="stats-panel">
              ${this.renderStatsPanel()}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup tab switching
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update active tab
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        modal.querySelector(`#${tab}-panel`).classList.add('active');
      });
    });
    
    // Setup item actions
    this.setupHistoryActions(modal);
    
    // Setup modal close
    modal.querySelector('.modal-close').addEventListener('click', () => {
      Utils.hideModal('historyModal');
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  /**
   * Render history panel
   */
  renderHistoryPanel(history) {
    if (history.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>Nenhum prompt no histórico ainda.</p>
          <p>Seus prompts aparecerão aqui quando você copiá-los.</p>
        </div>
      `;
    }
    
    return `
      <div class="history-actions">
        <button class="btn btn-ghost btn-sm" onclick="this.clearHistory()">
          🗑️ Limpar Histórico
        </button>
      </div>
      <div class="history-list">
        ${history.map(item => `
          <div class="history-item" data-id="${item.id}">
            <div class="history-content">
              <div class="history-preview">${item.prompt.substring(0, 100)}...</div>
              <div class="history-meta">
                <span class="history-date">${Utils.formatDate(new Date(item.timestamp))}</span>
              </div>
            </div>
            <div class="history-actions">
              <button class="btn btn-ghost btn-sm use-prompt" data-prompt='${JSON.stringify(item.fields)}'>
                📋 Usar
              </button>
              <button class="btn btn-ghost btn-sm copy-prompt" data-prompt="${Utils.sanitizeHTML(item.prompt)}">
                📄 Copiar
              </button>
              <button class="btn btn-ghost btn-sm delete-history" data-id="${item.id}">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render favorites panel
   */
  renderFavoritesPanel(favorites) {
    if (favorites.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">⭐</span>
          <p>Nenhum prompt favorito ainda.</p>
          <p>Salve seus prompts favoritos para acesso rápido.</p>
        </div>
      `;
    }
    
    return `
      <div class="favorites-list">
        ${favorites.map(item => `
          <div class="favorite-item" data-id="${item.id}">
            <div class="favorite-content">
              <div class="favorite-name">${item.name}</div>
              <div class="favorite-preview">${item.prompt.substring(0, 80)}...</div>
              <div class="favorite-meta">
                <span class="favorite-date">${Utils.formatDate(new Date(item.timestamp))}</span>
              </div>
            </div>
            <div class="favorite-actions">
              <button class="btn btn-ghost btn-sm use-prompt" data-prompt='${JSON.stringify(item.fields)}'>
                📋 Usar
              </button>
              <button class="btn btn-ghost btn-sm copy-prompt" data-prompt="${Utils.sanitizeHTML(item.prompt)}">
                📄 Copiar
              </button>
              <button class="btn btn-ghost btn-sm delete-favorite" data-id="${item.id}">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render stats panel
   */
  renderStatsPanel() {
    const stats = Storage.getStats();
    const storageInfo = Storage.getStorageInfo();
    
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.promptsCreated || 0}</div>
          <div class="stat-label">Prompts Criados</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">${stats.promptsCopied || 0}</div>
          <div class="stat-label">Prompts Copiados</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">${stats.templatesUsed || 0}</div>
          <div class="stat-label">Templates Usados</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">${storageInfo ? storageInfo.sizeFormatted : 'N/A'}</div>
          <div class="stat-label">Dados Armazenados</div>
        </div>
      </div>
      
      <div class="stats-actions">
        <button class="btn btn-outline" onclick="Storage.exportData()">
          📤 Exportar Dados
        </button>
        <button class="btn btn-outline" onclick="document.getElementById('importFile').click()">
          📥 Importar Dados
        </button>
        <input type="file" id="importFile" accept=".json" style="display: none;">
      </div>
    `;
  }
  
  /**
   * Setup history actions
   */
  setupHistoryActions(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('use-prompt')) {
        const promptData = JSON.parse(e.target.dataset.prompt);
        this.loadPromptData(promptData);
        Utils.hideModal('historyModal');
        setTimeout(() => modal.remove(), 300);
      }
      
      if (e.target.classList.contains('copy-prompt')) {
        const prompt = e.target.dataset.prompt;
        Utils.copyToClipboard(prompt).then(success => {
          if (success) {
            Utils.showToast('Prompt copiado!', 'success');
          }
        });
      }
      
      if (e.target.classList.contains('delete-history')) {
        const id = e.target.dataset.id;
        if (confirm('Excluir este item do histórico?')) {
          Storage.deleteHistoryItem(id);
          e.target.closest('.history-item').remove();
          Utils.showToast('Item removido do histórico', 'info');
        }
      }
      
      if (e.target.classList.contains('delete-favorite')) {
        const id = e.target.dataset.id;
        if (confirm('Remover este item dos favoritos?')) {
          Storage.removeFromFavorites(id);
          e.target.closest('.favorite-item').remove();
          Utils.showToast('Item removido dos favoritos', 'info');
        }
      }
    });
    
    // Import file handler
    const importFile = modal.querySelector('#importFile');
    if (importFile) {
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          Storage.importData(file)
            .then(() => {
              Utils.showToast('Dados importados com sucesso!', 'success');
              Utils.hideModal('historyModal');
              setTimeout(() => modal.remove(), 300);
            })
            .catch(error => {
              Utils.showToast(`Erro ao importar: ${error.message}`, 'error');
            });
        }
      });
    }
  }
  
  /**
   * Load prompt data into form
   */
  loadPromptData(promptData) {
    this.fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field && promptData[fieldName]) {
        field.value = promptData[fieldName];
        Templates.updateFieldCounter(fieldName);
        Templates.triggerFieldAnimation(field);
      }
    });
    
    this.updatePreview();
    Utils.showToast('Prompt carregado!', 'success');
  }
  
  /**
   * Clear history
   */
  clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
      Storage.clearHistory();
      Utils.showToast('Histórico limpo', 'info');
      
      // Refresh history modal if open
      const historyModal = document.getElementById('historyModal');
      if (historyModal) {
        Utils.hideModal('historyModal');
        setTimeout(() => {
          historyModal.remove();
          this.showHistory();
        }, 300);
      }
    }
  }
  
  /**
   * Show welcome message for first-time users
   */
  showWelcomeMessage() {
    const settings = Storage.getSettings();
    
    if (settings.showTips !== false && !localStorage.getItem('promptPerfeito_welcomed')) {
      setTimeout(() => {
        Utils.showToast('Bem-vindo ao Prompt Perfeito Pro! 🎉', 'info', 5000);
        localStorage.setItem('promptPerfeito_welcomed', 'true');
      }, 1000);
    }
  }
  
  /**
   * Handle URL parameters (for shared prompts)
   */
  handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPrompt = urlParams.get('prompt');
    
    if (sharedPrompt) {
      try {
        const decodedPrompt = decodeURIComponent(sharedPrompt);
        // Parse prompt back to fields (basic implementation)
        // This could be enhanced to better parse the prompt structure
        
        Utils.showToast('Prompt compartilhado carregado!', 'success');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Erro ao carregar prompt compartilhado:', error);
      }
    }
  }
  
  /**
   * Cleanup on page unload
   */
  cleanup() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App = new PromptPerfeitoApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.App) {
    window.App.cleanup();
  }
});

