// ===== STORAGE MANAGEMENT =====

class StorageManager {
  constructor() {
    this.storageKey = 'promptPerfeito';
    this.version = '2.0';
    this.maxHistoryItems = 50;
    this.maxFavorites = 20;
    
    this.init();
  }
  
  /**
   * Initialize storage
   */
  init() {
    try {
      // Check if localStorage is available
      if (!this.isStorageAvailable()) {
        console.warn('localStorage não está disponível');
        return;
      }
      
      // Migrate from old version if needed
      this.migrateData();
      
      // Initialize default data structure
      const data = this.getData();
      if (!data.version || data.version !== this.version) {
        this.initializeData();
      }
    } catch (error) {
      console.error('Erro ao inicializar storage:', error);
    }
  }
  
  /**
   * Check if localStorage is available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Get all data from storage
   */
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao ler dados do storage:', error);
      return {};
    }
  }
  
  /**
   * Save data to storage
   */
  setData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados no storage:', error);
      return false;
    }
  }
  
  /**
   * Initialize default data structure
   */
  initializeData() {
    const defaultData = {
      version: this.version,
      settings: {
        theme: 'dark',
        autoSave: true,
        showTips: true,
        language: 'pt-BR'
      },
      history: [],
      favorites: [],
      customTemplates: [],
      stats: {
        promptsCreated: 0,
        promptsCopied: 0,
        templatesUsed: 0,
        lastUsed: null
      }
    };
    
    this.setData(defaultData);
  }
  
  /**
   * Migrate data from old versions
   */
  migrateData() {
    try {
      // Check for old version data
      const oldData = localStorage.getItem('promptperfeito');
      if (oldData) {
        const parsed = JSON.parse(oldData);
        
        // Migrate to new structure
        const newData = {
          version: this.version,
          settings: {
            theme: 'dark',
            autoSave: true,
            showTips: true,
            language: 'pt-BR'
          },
          history: parsed.history || [],
          favorites: [],
          customTemplates: [],
          stats: {
            promptsCreated: parsed.history?.length || 0,
            promptsCopied: 0,
            templatesUsed: 0,
            lastUsed: null
          }
        };
        
        this.setData(newData);
        localStorage.removeItem('promptperfeito'); // Remove old data
      }
    } catch (error) {
      console.error('Erro na migração de dados:', error);
    }
  }
  
  /**
   * Save prompt to history
   */
  saveToHistory(prompt) {
    try {
      const data = this.getData();
      const historyItem = {
        id: Utils.generateId(),
        prompt: prompt,
        timestamp: new Date().toISOString(),
        fields: this.getCurrentFields()
      };
      
      // Add to beginning of history
      data.history = data.history || [];
      data.history.unshift(historyItem);
      
      // Limit history size
      if (data.history.length > this.maxHistoryItems) {
        data.history = data.history.slice(0, this.maxHistoryItems);
      }
      
      // Update stats
      data.stats = data.stats || {};
      data.stats.promptsCreated = (data.stats.promptsCreated || 0) + 1;
      data.stats.lastUsed = new Date().toISOString();
      
      this.setData(data);
      return historyItem;
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
      return null;
    }
  }
  
  /**
   * Get history items
   */
  getHistory(limit = null) {
    try {
      const data = this.getData();
      const history = data.history || [];
      return limit ? history.slice(0, limit) : history;
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return [];
    }
  }
  
  /**
   * Delete history item
   */
  deleteHistoryItem(id) {
    try {
      const data = this.getData();
      data.history = (data.history || []).filter(item => item.id !== id);
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao deletar item do histórico:', error);
      return false;
    }
  }
  
  /**
   * Clear all history
   */
  clearHistory() {
    try {
      const data = this.getData();
      data.history = [];
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      return false;
    }
  }
  
  /**
   * Add to favorites
   */
  addToFavorites(prompt) {
    try {
      const data = this.getData();
      const favoriteItem = {
        id: Utils.generateId(),
        prompt: prompt,
        timestamp: new Date().toISOString(),
        fields: this.getCurrentFields(),
        name: this.generateFavoriteName(prompt)
      };
      
      data.favorites = data.favorites || [];
      
      // Check if already exists
      const exists = data.favorites.some(fav => fav.prompt === prompt);
      if (exists) {
        return { success: false, message: 'Prompt já está nos favoritos' };
      }
      
      data.favorites.unshift(favoriteItem);
      
      // Limit favorites size
      if (data.favorites.length > this.maxFavorites) {
        data.favorites = data.favorites.slice(0, this.maxFavorites);
      }
      
      this.setData(data);
      return { success: true, item: favoriteItem };
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return { success: false, message: 'Erro interno' };
    }
  }
  
  /**
   * Get favorites
   */
  getFavorites() {
    try {
      const data = this.getData();
      return data.favorites || [];
    } catch (error) {
      console.error('Erro ao obter favoritos:', error);
      return [];
    }
  }
  
  /**
   * Remove from favorites
   */
  removeFromFavorites(id) {
    try {
      const data = this.getData();
      data.favorites = (data.favorites || []).filter(item => item.id !== id);
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return false;
    }
  }
  
  /**
   * Save custom template
   */
  saveCustomTemplate(template) {
    try {
      const data = this.getData();
      const templateItem = {
        id: Utils.generateId(),
        ...template,
        timestamp: new Date().toISOString(),
        isCustom: true
      };
      
      data.customTemplates = data.customTemplates || [];
      data.customTemplates.unshift(templateItem);
      
      this.setData(data);
      return templateItem;
    } catch (error) {
      console.error('Erro ao salvar template personalizado:', error);
      return null;
    }
  }
  
  /**
   * Get custom templates
   */
  getCustomTemplates() {
    try {
      const data = this.getData();
      return data.customTemplates || [];
    } catch (error) {
      console.error('Erro ao obter templates personalizados:', error);
      return [];
    }
  }
  
  /**
   * Delete custom template
   */
  deleteCustomTemplate(id) {
    try {
      const data = this.getData();
      data.customTemplates = (data.customTemplates || []).filter(item => item.id !== id);
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao deletar template personalizado:', error);
      return false;
    }
  }
  
  /**
   * Get settings
   */
  getSettings() {
    try {
      const data = this.getData();
      return data.settings || {};
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return {};
    }
  }
  
  /**
   * Save settings
   */
  saveSettings(settings) {
    try {
      const data = this.getData();
      data.settings = { ...data.settings, ...settings };
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  }
  
  /**
   * Update stats
   */
  updateStats(statType, increment = 1) {
    try {
      const data = this.getData();
      data.stats = data.stats || {};
      data.stats[statType] = (data.stats[statType] || 0) + increment;
      data.stats.lastUsed = new Date().toISOString();
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return false;
    }
  }
  
  /**
   * Get stats
   */
  getStats() {
    try {
      const data = this.getData();
      return data.stats || {};
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {};
    }
  }
  
  /**
   * Export all data
   */
  exportData() {
    try {
      const data = this.getData();
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        exportVersion: this.version
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-perfeito-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return false;
    }
  }
  
  /**
   * Import data
   */
  importData(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!this.validateImportData(importedData)) {
              reject(new Error('Formato de arquivo inválido'));
              return;
            }
            
            // Merge with existing data
            const currentData = this.getData();
            const mergedData = this.mergeImportData(currentData, importedData);
            
            this.setData(mergedData);
            resolve(true);
          } catch (error) {
            reject(new Error('Erro ao processar arquivo'));
          }
        };
        
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Validate import data
   */
  validateImportData(data) {
    return data && 
           typeof data === 'object' && 
           (data.version || data.exportVersion) &&
           (data.history || data.favorites || data.customTemplates);
  }
  
  /**
   * Merge import data with existing data
   */
  mergeImportData(current, imported) {
    return {
      version: this.version,
      settings: { ...current.settings, ...imported.settings },
      history: this.mergeArrays(current.history || [], imported.history || [], 'prompt'),
      favorites: this.mergeArrays(current.favorites || [], imported.favorites || [], 'prompt'),
      customTemplates: this.mergeArrays(current.customTemplates || [], imported.customTemplates || [], 'name'),
      stats: { ...current.stats, ...imported.stats }
    };
  }
  
  /**
   * Merge arrays avoiding duplicates
   */
  mergeArrays(current, imported, uniqueField) {
    const merged = [...current];
    
    imported.forEach(item => {
      const exists = merged.some(existing => 
        existing[uniqueField] === item[uniqueField]
      );
      
      if (!exists) {
        merged.push({
          ...item,
          id: Utils.generateId() // Generate new ID to avoid conflicts
        });
      }
    });
    
    return merged;
  }
  
  /**
   * Get current form fields
   */
  getCurrentFields() {
    const fields = ['papel', 'contexto', 'tarefa', 'formato', 'tom', 'evite'];
    const result = {};
    
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element) {
        result[field] = element.value;
      }
    });
    
    return result;
  }
  
  /**
   * Generate favorite name from prompt
   */
  generateFavoriteName(prompt) {
    const words = prompt.split(' ').slice(0, 5);
    return words.join(' ') + (prompt.split(' ').length > 5 ? '...' : '');
  }
  
  /**
   * Clear all data
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      this.initializeData();
      return true;
    } catch (error) {
      console.error('Erro ao limpar todos os dados:', error);
      return false;
    }
  }
  
  /**
   * Get storage usage info
   */
  getStorageInfo() {
    try {
      const data = JSON.stringify(this.getData());
      const size = new Blob([data]).size;
      
      return {
        size: size,
        sizeFormatted: Utils.formatFileSize(size),
        itemCount: {
          history: this.getHistory().length,
          favorites: this.getFavorites().length,
          customTemplates: this.getCustomTemplates().length
        }
      };
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error);
      return null;
    }
  }
}

// Create global instance
window.Storage = new StorageManager();

