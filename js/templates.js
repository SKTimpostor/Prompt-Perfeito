// ===== TEMPLATE MANAGEMENT =====

class TemplateManager {
  constructor() {
    this.templates = {};
    this.currentCategory = null;
    this.suggestions = {
      papel: [
        'Professor especialista',
        'Consultor de negócios',
        'Desenvolvedor sênior',
        'Designer UX/UI',
        'Copywriter profissional',
        'Analista de dados',
        'Especialista em marketing',
        'Mentor de carreira',
        'Escritor criativo',
        'Pesquisador acadêmico'
      ],
      contexto: [
        'Estou começando na área',
        'Preciso melhorar minha estratégia',
        'Tenho um projeto em andamento',
        'Quero aprender algo novo',
        'Estou enfrentando um desafio',
        'Preciso de orientação',
        'Estou criando um produto',
        'Quero otimizar meu processo',
        'Tenho uma ideia inovadora',
        'Preciso resolver um problema'
      ],
      tarefa: [
        'criar um plano detalhado',
        'gerar 10 ideias criativas',
        'escrever um código funcional',
        'explicar em passos simples',
        'fazer uma análise completa',
        'desenvolver uma estratégia',
        'criar um roteiro estruturado',
        'elaborar um relatório',
        'projetar uma solução',
        'otimizar o processo atual'
      ],
      formato: [
        'lista numerada e organizada',
        'tabela comparativa',
        'código comentado',
        'guia passo a passo',
        'relatório executivo',
        'apresentação estruturada',
        'checklist prático',
        'fluxograma visual',
        'resumo em tópicos',
        'tutorial detalhado'
      ],
      tom: [
        'profissional e objetivo',
        'amigável e didático',
        'técnico mas acessível',
        'criativo e inspirador',
        'formal e estruturado',
        'casual e descontraído',
        'motivador e encorajador',
        'analítico e preciso',
        'simples e direto',
        'detalhado e completo'
      ],
      evite: [
        'jargões técnicos complexos',
        'informações desatualizadas',
        'soluções muito genéricas',
        'textos muito longos',
        'linguagem muito formal',
        'exemplos irrelevantes',
        'explicações superficiais',
        'termos em inglês',
        'conceitos muito avançados',
        'informações desnecessárias'
      ]
    };
    
    this.init();
  }
  
  /**
   * Initialize template manager
   */
  async init() {
    try {
      await this.loadTemplates();
      this.renderTemplates();
      this.setupEventListeners();
      this.setupSuggestions();
    } catch (error) {
      console.error('Erro ao inicializar templates:', error);
    }
  }
  
  /**
   * Load templates from JSON file
   */
  async loadTemplates() {
    try {
      const response = await fetch('data/templates.json');
      const data = await response.json();
      this.templates = data.categories;
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      // Fallback to empty templates
      this.templates = {};
    }
  }
  
  /**
   * Render templates in the grid
   */
  renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Add custom templates first
    const customTemplates = Storage.getCustomTemplates();
    if (customTemplates.length > 0) {
      customTemplates.forEach(template => {
        grid.appendChild(this.createTemplateCard(template, true));
      });
    }
    
    // Add predefined templates
    Object.entries(this.templates).forEach(([categoryKey, category]) => {
      category.templates.forEach(template => {
        const card = this.createTemplateCard({
          ...template,
          category: category.name,
          categoryIcon: category.icon
        });
        grid.appendChild(card);
      });
    });
    
    // Add stagger animation
    grid.classList.add('stagger-children');
  }
  
  /**
   * Create template card element
   */
  createTemplateCard(template, isCustom = false) {
    const card = document.createElement('div');
    card.className = 'template-card hover-lift';
    card.setAttribute('data-template-id', template.id);
    
    card.innerHTML = `
      <div class="template-header">
        <span class="template-icon">${template.categoryIcon || '📝'}</span>
        <div>
          <div class="template-name">${template.name}</div>
          <div class="template-category">${template.category || 'Personalizado'}</div>
        </div>
        ${isCustom ? `
          <button class="btn btn-ghost btn-sm delete-template" data-id="${template.id}" title="Excluir template">
            🗑️
          </button>
        ` : ''}
      </div>
      <div class="template-description">
        ${this.generateTemplateDescription(template)}
      </div>
    `;
    
    // Add click event
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-template')) {
        this.applyTemplate(template);
      }
    });
    
    // Add delete event for custom templates
    if (isCustom) {
      const deleteBtn = card.querySelector('.delete-template');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCustomTemplate(template.id);
      });
    }
    
    return card;
  }
  
  /**
   * Generate template description
   */
  generateTemplateDescription(template) {
    const parts = [];
    
    if (template.papel) parts.push(`👤 ${template.papel}`);
    if (template.tarefa) parts.push(`⚡ ${template.tarefa}`);
    if (template.formato) parts.push(`📋 ${template.formato}`);
    
    return parts.slice(0, 2).join('<br>') + (parts.length > 2 ? '<br>...' : '');
  }
  
  /**
   * Apply template to form
   */
  applyTemplate(template) {
    const fields = ['papel', 'contexto', 'tarefa', 'formato', 'tom', 'evite'];
    
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element && template[field]) {
        element.value = template[field];
        this.updateFieldCounter(field);
        this.triggerFieldAnimation(element);
      }
    });
    
    // Update preview
    window.App.updatePreview();
    
    // Update stats
    Storage.updateStats('templatesUsed');
    
    // Show success message
    Utils.showToast(`Template "${template.name}" aplicado com sucesso!`, 'success');
    
    // Scroll to form
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      Utils.scrollToElement(formSection, 100);
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Custom template button
    const customTemplateBtn = document.getElementById('customTemplateBtn');
    if (customTemplateBtn) {
      customTemplateBtn.addEventListener('click', () => {
        this.showCustomTemplateModal();
      });
    }
    
    // Template search
    this.setupTemplateSearch();
    
    // Template filters
    this.setupTemplateFilters();
  }
  
  /**
   * Setup template search
   */
  setupTemplateSearch() {
    // Create search input if it doesn't exist
    const templatesSection = document.querySelector('.templates-section');
    if (!templatesSection) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'template-search';
    searchContainer.innerHTML = `
      <input type="text" id="templateSearch" class="field-input" placeholder="🔍 Buscar templates...">
    `;
    
    const sectionHeader = templatesSection.querySelector('.section-header');
    sectionHeader.appendChild(searchContainer);
    
    // Add search functionality
    const searchInput = document.getElementById('templateSearch');
    searchInput.addEventListener('input', Utils.debounce((e) => {
      this.filterTemplates(e.target.value);
    }, 300));
  }
  
  /**
   * Setup template filters
   */
  setupTemplateFilters() {
    const templatesSection = document.querySelector('.templates-section');
    if (!templatesSection) return;
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'template-filters';
    filterContainer.innerHTML = `
      <div class="filter-buttons">
        <button class="filter-btn active" data-category="all">Todos</button>
        ${Object.entries(this.templates).map(([key, category]) => 
          `<button class="filter-btn" data-category="${key}">${category.icon} ${category.name}</button>`
        ).join('')}
        <button class="filter-btn" data-category="custom">📝 Personalizados</button>
      </div>
    `;
    
    templatesSection.appendChild(filterContainer);
    
    // Add filter functionality
    filterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        // Update active state
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => 
          btn.classList.remove('active')
        );
        e.target.classList.add('active');
        
        // Filter templates
        this.filterTemplatesByCategory(e.target.dataset.category);
      }
    });
  }
  
  /**
   * Filter templates by search term
   */
  filterTemplates(searchTerm) {
    const cards = document.querySelectorAll('.template-card');
    const term = searchTerm.toLowerCase();
    
    cards.forEach(card => {
      const name = card.querySelector('.template-name').textContent.toLowerCase();
      const category = card.querySelector('.template-category').textContent.toLowerCase();
      const description = card.querySelector('.template-description').textContent.toLowerCase();
      
      const matches = name.includes(term) || 
                     category.includes(term) || 
                     description.includes(term);
      
      card.style.display = matches ? 'block' : 'none';
    });
  }
  
  /**
   * Filter templates by category
   */
  filterTemplatesByCategory(category) {
    const cards = document.querySelectorAll('.template-card');
    
    cards.forEach(card => {
      const templateId = card.dataset.templateId;
      let shouldShow = false;
      
      if (category === 'all') {
        shouldShow = true;
      } else if (category === 'custom') {
        shouldShow = Storage.getCustomTemplates().some(t => t.id === templateId);
      } else {
        shouldShow = this.templates[category]?.templates.some(t => t.id === templateId);
      }
      
      card.style.display = shouldShow ? 'block' : 'none';
    });
  }
  
  /**
   * Setup field suggestions
   */
  setupSuggestions() {
    Object.keys(this.suggestions).forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (!field) return;
      
      const suggestionsContainer = document.getElementById(`${fieldName}Suggestions`);
      if (!suggestionsContainer) return;
      
      field.addEventListener('input', Utils.debounce(() => {
        this.showSuggestions(fieldName, field.value);
      }, 300));
      
      field.addEventListener('focus', () => {
        if (!field.value) {
          this.showSuggestions(fieldName, '');
        }
      });
      
      field.addEventListener('blur', () => {
        setTimeout(() => {
          this.hideSuggestions(fieldName);
        }, 200);
      });
    });
  }
  
  /**
   * Show suggestions for a field
   */
  showSuggestions(fieldName, value) {
    const suggestionsContainer = document.getElementById(`${fieldName}Suggestions`);
    if (!suggestionsContainer) return;
    
    const suggestions = this.suggestions[fieldName] || [];
    const filteredSuggestions = value 
      ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
      : suggestions.slice(0, 5);
    
    if (filteredSuggestions.length === 0) {
      this.hideSuggestions(fieldName);
      return;
    }
    
    suggestionsContainer.innerHTML = filteredSuggestions
      .map(suggestion => `
        <div class="suggestion-item" data-value="${suggestion}">
          ${suggestion}
        </div>
      `).join('');
    
    suggestionsContainer.style.display = 'block';
    
    // Add click events
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const field = document.getElementById(fieldName);
        field.value = item.dataset.value;
        this.updateFieldCounter(fieldName);
        this.hideSuggestions(fieldName);
        window.App.updatePreview();
      });
    });
  }
  
  /**
   * Hide suggestions for a field
   */
  hideSuggestions(fieldName) {
    const suggestionsContainer = document.getElementById(`${fieldName}Suggestions`);
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  }
  
  /**
   * Update field character counter
   */
  updateFieldCounter(fieldName) {
    const field = document.getElementById(fieldName);
    const counter = document.getElementById(`${fieldName}Counter`);
    
    if (field && counter) {
      const maxLength = field.getAttribute('maxlength') || 100;
      const currentLength = field.value.length;
      counter.textContent = `${currentLength}/${maxLength}`;
      
      // Update counter color based on usage
      counter.className = 'field-counter';
      if (currentLength > maxLength * 0.9) {
        counter.classList.add('counter-warning');
      } else if (currentLength > maxLength * 0.7) {
        counter.classList.add('counter-caution');
      }
    }
  }
  
  /**
   * Trigger field animation
   */
  triggerFieldAnimation(element) {
    element.classList.add('field-updated');
    setTimeout(() => {
      element.classList.remove('field-updated');
    }, 600);
  }
  
  /**
   * Show custom template modal
   */
  showCustomTemplateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'customTemplateModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Criar Template Personalizado</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="customTemplateForm">
            <div class="field-group">
              <label for="templateName">Nome do Template</label>
              <input type="text" id="templateName" class="field-input" required 
                     placeholder="Ex: Meu Template de Marketing">
            </div>
            
            <div class="field-group">
              <label for="templateCategory">Categoria</label>
              <input type="text" id="templateCategory" class="field-input" 
                     placeholder="Ex: Marketing, Programação, etc.">
            </div>
            
            <div class="form-grid">
              <div class="field-group">
                <label for="templatePapel">Papel</label>
                <input type="text" id="templatePapel" class="field-input" 
                       placeholder="Ex: Especialista em...">
              </div>
              
              <div class="field-group">
                <label for="templateContexto">Contexto</label>
                <input type="text" id="templateContexto" class="field-input" 
                       placeholder="Ex: Estou trabalhando em...">
              </div>
              
              <div class="field-group">
                <label for="templateTarefa">Tarefa</label>
                <input type="text" id="templateTarefa" class="field-input" 
                       placeholder="Ex: criar um plano...">
              </div>
              
              <div class="field-group">
                <label for="templateFormato">Formato</label>
                <input type="text" id="templateFormato" class="field-input" 
                       placeholder="Ex: lista numerada...">
              </div>
              
              <div class="field-group">
                <label for="templateTom">Tom</label>
                <input type="text" id="templateTom" class="field-input" 
                       placeholder="Ex: profissional...">
              </div>
              
              <div class="field-group">
                <label for="templateEvite">Evite</label>
                <input type="text" id="templateEvite" class="field-input" 
                       placeholder="Ex: jargões técnicos...">
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" onclick="Utils.hideModal('customTemplateModal')">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Salvar Template
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup form submission
    const form = document.getElementById('customTemplateForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCustomTemplate();
    });
    
    // Setup modal close
    modal.querySelector('.modal-close').addEventListener('click', () => {
      Utils.hideModal('customTemplateModal');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Focus first input
    setTimeout(() => {
      document.getElementById('templateName').focus();
    }, 100);
  }
  
  /**
   * Save custom template
   */
  saveCustomTemplate() {
    const form = document.getElementById('customTemplateForm');
    const formData = new FormData(form);
    
    const template = {
      name: document.getElementById('templateName').value,
      category: document.getElementById('templateCategory').value || 'Personalizado',
      papel: document.getElementById('templatePapel').value,
      contexto: document.getElementById('templateContexto').value,
      tarefa: document.getElementById('templateTarefa').value,
      formato: document.getElementById('templateFormato').value,
      tom: document.getElementById('templateTom').value,
      evite: document.getElementById('templateEvite').value
    };
    
    // Validate required fields
    if (!template.name.trim()) {
      Utils.showToast('Nome do template é obrigatório', 'error');
      return;
    }
    
    // Save to storage
    const savedTemplate = Storage.saveCustomTemplate(template);
    if (savedTemplate) {
      Utils.showToast('Template personalizado salvo com sucesso!', 'success');
      Utils.hideModal('customTemplateModal');
      setTimeout(() => {
        document.getElementById('customTemplateModal').remove();
      }, 300);
      
      // Re-render templates
      this.renderTemplates();
    } else {
      Utils.showToast('Erro ao salvar template', 'error');
    }
  }
  
  /**
   * Delete custom template
   */
  deleteCustomTemplate(templateId) {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      if (Storage.deleteCustomTemplate(templateId)) {
        Utils.showToast('Template excluído com sucesso', 'success');
        this.renderTemplates();
      } else {
        Utils.showToast('Erro ao excluir template', 'error');
      }
    }
  }
  
  /**
   * Get random template
   */
  getRandomTemplate() {
    const allTemplates = [];
    
    // Add predefined templates
    Object.values(this.templates).forEach(category => {
      allTemplates.push(...category.templates);
    });
    
    // Add custom templates
    allTemplates.push(...Storage.getCustomTemplates());
    
    return allTemplates.length > 0 ? Utils.getRandomItem(allTemplates) : null;
  }
  
  /**
   * Apply random template
   */
  applyRandomTemplate() {
    const randomTemplate = this.getRandomTemplate();
    if (randomTemplate) {
      this.applyTemplate(randomTemplate);
    } else {
      Utils.showToast('Nenhum template disponível', 'warning');
    }
  }
}

// Create global instance
window.Templates = new TemplateManager();

