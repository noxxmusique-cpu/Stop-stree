// Mental Health App JavaScript

class MentalHealthApp {
  constructor() {
    this.currentTimer = null;
    this.timerInterval = null;
    this.isTimerRunning = false;
    this.journalData = this.loadFromStorage('journalData', []);
    this.progressData = this.loadFromStorage('progressData', {});
    this.exerciseData = this.loadFromStorage('exerciseData', {});
    
    this.init();
  }

  loadFromStorage(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }

  init() {
    this.setupEventListeners();
    this.setupNavigation();
    this.setupStarRatings();
    this.setupAnxietySlider();
    this.updateProgressStats();
    this.setupThemeToggle();
  }

  setupEventListeners() {
    // Emergency button
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showEmergencyModal();
      });
    }

    // Exercise buttons
    document.querySelectorAll('.exercise-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const exercise = e.target.dataset.exercise;
        const duration = parseInt(e.target.dataset.duration);
        this.startExercise(exercise, duration);
      });
    });

    // Timer controls
    const startTimer = document.getElementById('startTimer');
    const pauseTimer = document.getElementById('pauseTimer');
    const stopTimer = document.getElementById('stopTimer');

    if (startTimer) {
      startTimer.addEventListener('click', (e) => {
        e.preventDefault();
        this.startTimer();
      });
    }

    if (pauseTimer) {
      pauseTimer.addEventListener('click', (e) => {
        e.preventDefault();
        this.pauseTimer();
      });
    }

    if (stopTimer) {
      stopTimer.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopTimer();
      });
    }

    // Modal close buttons
    const closeTimer = document.getElementById('closeTimer');
    const closeEmergency = document.getElementById('closeEmergency');

    if (closeTimer) {
      closeTimer.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('timerModal');
        this.stopTimer();
      });
    }

    if (closeEmergency) {
      closeEmergency.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('emergencyModal');
      });
    }

    // Modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const modal = overlay.closest('.modal');
          this.hideModal(modal.id);
          if (modal.id === 'timerModal') {
            this.stopTimer();
          }
        }
      });
    });

    // Journal actions
    const saveJournal = document.getElementById('saveJournal');
    const exportData = document.getElementById('exportData');

    if (saveJournal) {
      saveJournal.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveJournalEntry();
      });
    }

    if (exportData) {
      exportData.addEventListener('click', (e) => {
        e.preventDefault();
        this.exportUserData();
      });
    }

    // Emergency steps
    document.querySelectorAll('.emergency-timer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const duration = parseInt(e.target.dataset.duration);
        this.hideModal('emergencyModal');
        this.startExercise('emergency-breathing', duration);
      });
    });

    document.querySelectorAll('.step-complete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.markEmergencyStepComplete(e.target);
      });
    });

    // Hero actions
    const startProgram = document.getElementById('startProgram');
    const learnMore = document.getElementById('learnMore');

    if (startProgram) {
      startProgram.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('program').scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (learnMore) {
      learnMore.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('program').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        e.target.classList.add('active');
        
        // Scroll to section
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Update active nav on scroll
    window.addEventListener('scroll', () => {
      const sections = ['home', 'program', 'journal', 'nutrition'];
      let current = '';

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = section;
          }
        }
      });

      if (current) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  setupStarRatings() {
    document.querySelectorAll('.star-rating').forEach(rating => {
      const stars = rating.querySelectorAll('i');
      const ratingType = rating.dataset.rating;

      stars.forEach((star, index) => {
        star.addEventListener('click', (e) => {
          e.preventDefault();
          const value = index + 1;
          
          // Update visual state
          stars.forEach((s, i) => {
            if (i <= index) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });

          // Store rating
          this.updateRating(ratingType, value);
        });

        star.addEventListener('mouseover', () => {
          stars.forEach((s, i) => {
            if (i <= index) {
              s.style.color = '#FFD700';
            } else {
              s.style.color = '';
            }
          });
        });

        star.addEventListener('mouseleave', () => {
          stars.forEach(s => {
            s.style.color = '';
          });
        });
      });
    });
  }

  setupAnxietySlider() {
    const slider = document.getElementById('anxietyLevel');
    const valueDisplay = document.getElementById('anxietyValue');

    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
        this.updateAnxietyLevel(parseInt(e.target.value));
      });
    }
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    this.updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-color-scheme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-color-scheme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.updateThemeIcon(newTheme);
    });
  }

  updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  startExercise(exerciseType, duration) {
    const exerciseData = this.getExerciseData(exerciseType);
    
    const exerciseTitle = document.getElementById('exerciseTitle');
    if (exerciseTitle) {
      exerciseTitle.textContent = exerciseData.title;
    }
    
    // Set up instructions
    const instructionsList = document.getElementById('instructionsList');
    if (instructionsList) {
      instructionsList.innerHTML = '';
      exerciseData.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
      });
    }

    // Set timer
    this.currentTimer = {
      duration: duration,
      remaining: duration,
      exercise: exerciseType
    };

    this.updateTimerDisplay();
    this.showModal('timerModal');
  }

  getExerciseData(exerciseType) {
    const exercises = {
      'breathing': {
        title: 'Respiration diaphragmatique',
        instructions: [
          'Allongez-vous, une main sur la poitrine, l\'autre sur le ventre',
          'Inspirez lentement par le nez en gonflant le ventre (4 secondes)',
          'Expirez par la bouche (6 secondes)',
          'Répétez jusqu\'à la fin du temps imparti'
        ]
      },
      'breathing478': {
        title: 'Technique 4-7-8',
        instructions: [
          'Inspirez pendant 4 secondes',
          'Retenez votre souffle pendant 7 secondes',
          'Expirez pendant 8 secondes',
          'Répétez 4 cycles'
        ]
      },
      'meditation': {
        title: 'Méditation de pleine conscience',
        instructions: [
          'Observez votre respiration sans la contrôler',
          'Focalisez-vous sur les sensations au niveau des narines',
          'Quand l\'esprit divague, revenez doucement à la respiration',
          'Restez présent et bienveillant envers vous-même'
        ]
      },
      'progressive': {
        title: 'Relaxation Progressive de Jacobson',
        instructions: [
          'Contractez puis relâchez chaque groupe musculaire (5-10 secondes)',
          'Progression : pieds → mollets → cuisses → abdomen → bras → épaules → visage',
          'Concentrez-vous sur le contraste entre tension et détente',
          'Respirez profondément entre chaque groupe musculaire'
        ]
      },
      'extended': {
        title: 'Méditation étendue',
        instructions: [
          'Augmentez progressivement la durée de votre méditation',
          'Intégrez la pleine conscience sur les sensations corporelles',
          'Pratiquez la respiration alternée des narines',
          'Observez vos pensées sans jugement'
        ]
      },
      'cognitive': {
        title: 'Restructuration Cognitive',
        instructions: [
          'Identifiez vos pensées automatiques anxiogènes',
          'Questionnez leur validité : "Quelles preuves ai-je pour/contre ?"',
          'Développez des pensées alternatives plus réalistes',
          'Tenez un journal de pensées pour suivre vos progrès'
        ]
      },
      'exposure': {
        title: 'Exposition Progressive Contrôlée',
        instructions: [
          'Identifiez vos déclencheurs d\'anxiété (échelle 0-10)',
          'Exposez-vous progressivement aux situations 2-5/10 d\'anxiété',
          'Restez jusqu\'à ce que l\'anxiété diminue de moitié',
          'Exposition intéroceptive : apprivoisez les sensations de panique'
        ]
      },
      'biofeedback': {
        title: 'Biofeedback et Visualisation',
        instructions: [
          'Cohérence cardiaque (4s inspiration/6s expiration)',
          'Visualisation positive de situations stressantes',
          'Développement de mantras personnalisés',
          'Pratiquez la visualisation de votre lieu de sécurité'
        ]
      },
      'proactive': {
        title: 'Gestion Proactive',
        instructions: [
          'Planification des stratégies d\'intervention précoce',
          'Création d\'un "kit d\'urgence" mental',
          'Pratique régulière même sans anxiété',
          'Identification de vos signaux d\'alarme précoces'
        ]
      },
      'emergency-breathing': {
        title: 'Respiration d\'urgence 4-7-8',
        instructions: [
          'Inspirez par le nez pendant 4 secondes',
          'Retenez votre souffle pendant 7 secondes',
          'Expirez complètement par la bouche pendant 8 secondes',
          'Répétez ce cycle 4 fois minimum'
        ]
      }
    };

    return exercises[exerciseType] || exercises['breathing'];
  }

  startTimer() {
    if (!this.currentTimer) return;

    this.isTimerRunning = true;
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';

    this.timerInterval = setInterval(() => {
      this.currentTimer.remaining--;
      this.updateTimerDisplay();

      if (this.currentTimer.remaining <= 0) {
        this.completeExercise();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isTimerRunning = false;
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isTimerRunning = false;
    this.currentTimer = null;
    
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  updateTimerDisplay() {
    if (!this.currentTimer) return;

    const minutes = Math.floor(this.currentTimer.remaining / 60);
    const seconds = this.currentTimer.remaining % 60;

    const minutesEl = document.getElementById('timerMinutes');
    const secondsEl = document.getElementById('timerSeconds');
    
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

    // Update progress circle
    const progress = (this.currentTimer.duration - this.currentTimer.remaining) / this.currentTimer.duration;
    const circumference = 283; // 2 * π * 45
    const offset = circumference - (progress * circumference);
    
    const timerCircle = document.getElementById('timerCircle');
    if (timerCircle) {
      timerCircle.style.strokeDashoffset = offset;
    }
  }

  completeExercise() {
    this.stopTimer();
    
    // Mark exercise as completed
    const exerciseType = this.currentTimer.exercise;
    const today = new Date().toDateString();
    
    if (!this.exerciseData[today]) {
      this.exerciseData[today] = [];
    }
    
    this.exerciseData[today].push({
      type: exerciseType,
      completedAt: new Date().toISOString(),
      duration: this.currentTimer.duration
    });
    
    this.saveToStorage('exerciseData', this.exerciseData);
    
    // Show success message
    this.showSuccessMessage('Exercice terminé ! Excellent travail 🎉');
    
    // Update progress stats
    this.updateProgressStats();
    
    // Hide modal
    this.hideModal('timerModal');
  }

  showSuccessMessage(message) {
    // Create success message element
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Insert at top of page
    document.body.insertBefore(successEl, document.body.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (successEl.parentNode) {
        successEl.parentNode.removeChild(successEl);
      }
    }, 3000);
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      
      // Focus management
      const focusableElements = modal.querySelectorAll('button, input, textarea, select');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showEmergencyModal() {
    // Reset emergency steps
    document.querySelectorAll('.emergency-step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index === 0) {
        step.classList.add('active');
      }
    });
    
    this.showModal('emergencyModal');
  }

  markEmergencyStepComplete(button) {
    const step = button.closest('.emergency-step');
    step.classList.remove('active');
    step.classList.add('completed');
    
    // Activate next step
    const nextStep = step.nextElementSibling;
    if (nextStep && nextStep.classList.contains('emergency-step')) {
      nextStep.classList.add('active');
    }
    
    // Update button text
    button.innerHTML = '<i class="fas fa-check"></i> Terminé';
    button.disabled = true;
  }

  saveJournalEntry() {
    const anxietySlider = document.getElementById('anxietyLevel');
    const journalTextArea = document.getElementById('journalText');
    
    if (!anxietySlider || !journalTextArea) return;

    const anxietyLevel = parseInt(anxietySlider.value);
    const sleepRating = this.getCurrentRating('sleep');
    const energyRating = this.getCurrentRating('energy');
    const journalText = journalTextArea.value;

    const entry = {
      date: new Date().toISOString(),
      anxiety: anxietyLevel,
      sleep: sleepRating,
      energy: energyRating,
      notes: journalText
    };

    this.journalData.push(entry);
    this.saveToStorage('journalData', this.journalData);

    // Clear form
    journalTextArea.value = '';
    anxietySlider.value = 5;
    
    const anxietyValue = document.getElementById('anxietyValue');
    if (anxietyValue) anxietyValue.textContent = '5';
    
    // Reset star ratings
    document.querySelectorAll('.star-rating i').forEach(star => {
      star.classList.remove('active');
    });

    this.showSuccessMessage('Entrée de journal sauvegardée !');
    this.updateProgressStats();
  }

  getCurrentRating(type) {
    const ratingElement = document.querySelector(`[data-rating="${type}"]`);
    if (!ratingElement) return 0;
    
    const activeStars = ratingElement.querySelectorAll('i.active');
    return activeStars.length;
  }

  updateRating(type, value) {
    // Store current ratings temporarily
    if (!window.currentRatings) {
      window.currentRatings = {};
    }
    window.currentRatings[type] = value;
  }

  updateAnxietyLevel(level) {
    if (!window.currentRatings) {
      window.currentRatings = {};
    }
    window.currentRatings.anxiety = level;
  }

  updateProgressStats() {
    const today = new Date().toDateString();
    const thisWeek = this.getThisWeekDates();
    
    // Calculate completed exercises this week
    let completedExercises = 0;
    thisWeek.forEach(date => {
      const dateStr = date.toDateString();
      if (this.exerciseData[dateStr]) {
        completedExercises += this.exerciseData[dateStr].length;
      }
    });
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = Object.keys(this.exerciseData).sort((a, b) => new Date(b) - new Date(a));
    
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = sortedDates[i];
      const date = new Date(dateStr);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.toDateString() === expectedDate.toDateString() && this.exerciseData[dateStr].length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate average anxiety this week
    const weekJournalEntries = this.journalData.filter(entry => {
      const entryDate = new Date(entry.date);
      return thisWeek.some(date => date.toDateString() === entryDate.toDateString());
    });
    
    const averageAnxiety = weekJournalEntries.length > 0
      ? (weekJournalEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / weekJournalEntries.length).toFixed(1)
      : '0.0';
    
    // Update display
    const completedExercisesEl = document.getElementById('completedExercises');
    const currentStreakEl = document.getElementById('currentStreak');
    const averageAnxietyEl = document.getElementById('averageAnxiety');
    
    if (completedExercisesEl) completedExercisesEl.textContent = completedExercises;
    if (currentStreakEl) currentStreakEl.textContent = currentStreak;
    if (averageAnxietyEl) averageAnxietyEl.textContent = averageAnxiety;
  }

  getThisWeekDates() {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      dates.push(date);
    }
    
    return dates;
  }

  exportUserData() {
    const exportData = {
      journalData: this.journalData,
      exerciseData: this.exerciseData,
      progressData: this.progressData,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    this.showSuccessMessage('Données exportées avec succès !');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mentalHealthApp = new MentalHealthApp();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // ESC to close modals
  if (e.key === 'Escape') {
    const visibleModal = document.querySelector('.modal:not(.hidden)');
    if (visibleModal && window.mentalHealthApp) {
      window.mentalHealthApp.hideModal(visibleModal.id);
      if (visibleModal.id === 'timerModal') {
        window.mentalHealthApp.stopTimer();
      }
    }
  }
  
  // Ctrl+E for emergency
  if (e.ctrlKey && e.key === 'e') {
    e.preventDefault();
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.click();
  }
});

// Handle visibility change (pause timer when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.mentalHealthApp && window.mentalHealthApp.isTimerRunning) {
    window.mentalHealthApp.pauseTimer();
  }
});