
// Diet Chat Planner JavaScript

class DietPlanner {
    constructor() {
        this.currentTab = 'planner';
        this.userProfile = {};
        this.mealPlan = {};
        this.currentMealSlot = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserProfile();
        this.loadMealPlan();
        this.setupChatBot();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Meal planner events
        document.getElementById('generatePlan').addEventListener('click', () => {
            this.generateMealPlan();
        });

        document.querySelectorAll('.meal-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                this.openMealModal(e.currentTarget);
            });
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeMealModal();
        });

        document.getElementById('saveMeal').addEventListener('click', () => {
            this.saveMeal();
        });

        // Chat events
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sendQuickQuestion(e.target.dataset.question);
            });
        });

        // Profile events
        document.getElementById('saveProfile').addEventListener('click', () => {
            this.saveProfile();
        });

        // Calculate calories on input change
        ['height', 'weight', 'age', 'activity', 'goal'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.calculateCalories();
                });
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('mealModal');
            if (e.target === modal) {
                this.closeMealModal();
            }
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
    }

    // Meal Planning Functions
    generateMealPlan() {
        const mealSuggestions = {
            breakfast: [
                { name: "Greek Yogurt with Berries", calories: 250, description: "Greek yogurt with mixed berries and honey" },
                { name: "Oatmeal with Banana", calories: 300, description: "Steel-cut oats with sliced banana and almonds" },
                { name: "Avocado Toast", calories: 320, description: "Whole grain toast with avocado and poached egg" },
                { name: "Smoothie Bowl", calories: 280, description: "Acai smoothie bowl with granola and fruits" },
                { name: "Scrambled Eggs", calories: 220, description: "Scrambled eggs with spinach and cheese" }
            ],
            lunch: [
                { name: "Grilled Chicken Salad", calories: 450, description: "Mixed greens with grilled chicken and vinaigrette" },
                { name: "Quinoa Buddha Bowl", calories: 420, description: "Quinoa with roasted vegetables and tahini dressing" },
                { name: "Turkey Wrap", calories: 380, description: "Whole wheat wrap with turkey, hummus, and vegetables" },
                { name: "Lentil Soup", calories: 350, description: "Hearty lentil soup with vegetables and herbs" },
                { name: "Tuna Salad", calories: 340, description: "Fresh tuna salad with mixed vegetables" }
            ],
            dinner: [
                { name: "Salmon with Vegetables", calories: 520, description: "Baked salmon with roasted seasonal vegetables" },
                { name: "Chicken Stir-Fry", calories: 480, description: "Chicken stir-fry with brown rice and mixed vegetables" },
                { name: "Vegetarian Pasta", calories: 450, description: "Whole wheat pasta with marinara and vegetables" },
                { name: "Lean Beef with Sweet Potato", calories: 550, description: "Grilled lean beef with roasted sweet potato" },
                { name: "Fish Tacos", calories: 420, description: "Grilled fish tacos with cabbage slaw" }
            ]
        };

        document.querySelectorAll('.meal-slot').forEach(slot => {
            const meal = slot.dataset.meal;
            const suggestions = mealSuggestions[meal];
            const randomMeal = suggestions[Math.floor(Math.random() * suggestions.length)];

            const content = slot.querySelector('.meal-content');
            content.innerHTML = `
                <strong>${randomMeal.name}</strong><br>
                <small>${randomMeal.description}</small><br>
                <span style="color: #e74c3c; font-weight: bold;">${randomMeal.calories} cal</span>
            `;
            content.classList.add('has-meal');

            // Save to meal plan
            const day = slot.closest('.day-column').dataset.day;
            if (!this.mealPlan[day]) this.mealPlan[day] = {};
            this.mealPlan[day][meal] = randomMeal;
        });

        this.saveMealPlan();
        this.showNotification('Meal plan generated successfully!', 'success');
    }

    openMealModal(mealSlot) {
        this.currentMealSlot = mealSlot;
        document.getElementById('mealModal').style.display = 'block';

        // Clear form
        document.getElementById('mealName').value = '';
        document.getElementById('mealDescription').value = '';
        document.getElementById('mealCalories').value = '';
    }

    closeMealModal() {
        document.getElementById('mealModal').style.display = 'none';
        this.currentMealSlot = null;
    }

    saveMeal() {
        if (!this.currentMealSlot) return;

        const name = document.getElementById('mealName').value;
        const description = document.getElementById('mealDescription').value;
        const calories = document.getElementById('mealCalories').value;

        if (!name) {
            this.showNotification('Please enter a meal name', 'error');
            return;
        }

        const content = this.currentMealSlot.querySelector('.meal-content');
        content.innerHTML = `
            <strong>${name}</strong><br>
            <small>${description}</small><br>
            ${calories ? `<span style="color: #e74c3c; font-weight: bold;">${calories} cal</span>` : ''}
        `;
        content.classList.add('has-meal');

        // Save to meal plan
        const day = this.currentMealSlot.closest('.day-column').dataset.day;
        const meal = this.currentMealSlot.dataset.meal;
        if (!this.mealPlan[day]) this.mealPlan[day] = {};
        this.mealPlan[day][meal] = { name, description, calories };

        this.saveMealPlan();
        this.closeMealModal();
        this.showNotification('Meal saved successfully!', 'success');
    }

    // Chat Functions
    setupChatBot() {
        this.chatResponses = {
            "what foods are high in protein": "Great question! High-protein foods include: lean meats (chicken, turkey, lean beef), fish (salmon, tuna, cod), eggs, dairy products (Greek yogurt, cottage cheese), legumes (lentils, chickpeas, beans), nuts and seeds, and quinoa.",
            "how can i lose weight healthily": "Healthy weight loss involves: 1) Creating a moderate calorie deficit (500-750 calories/day), 2) Eating whole, nutrient-dense foods, 3) Regular exercise combining cardio and strength training, 4) Staying hydrated, 5) Getting adequate sleep, and 6) Being patient and consistent.",
            "what's a good breakfast for energy": "For sustained energy, try: oatmeal with berries and nuts, Greek yogurt with fruit and granola, avocado toast with eggs, or a smoothie with protein powder, spinach, banana, and nut butter. Include protein, healthy fats, and complex carbs.",
            "low carb meal ideas": "Low-carb meal ideas: Grilled chicken with roasted vegetables, salmon with cauliflower rice, zucchini noodles with meat sauce, lettuce wrap tacos, egg-based dishes, cheese and vegetable omelets, and salads with protein.",
            "default": "I'm here to help with your nutrition questions! You can ask me about meal planning, specific foods, dietary goals, or nutrition advice. What would you like to know?"
        };
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = this.getBotResponse(message);
            this.addChatMessage(response, 'bot');
        }, 1000);
    }

    sendQuickQuestion(question) {
        this.addChatMessage(question, 'user');

        setTimeout(() => {
            const response = this.getBotResponse(question);
            this.addChatMessage(response, 'bot');
        }, 1000);
    }

    addChatMessage(message, type) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${type === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        for (const [key, response] of Object.entries(this.chatResponses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return this.chatResponses.default;
    }

    // Profile Functions
    saveProfile() {
        const profile = {
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value,
            age: document.getElementById('age').value,
            activity: document.getElementById('activity').value,
            goal: document.getElementById('goal').value,
            vegetarian: document.getElementById('vegetarian').checked,
            vegan: document.getElementById('vegan').checked,
            glutenfree: document.getElementById('glutenfree').checked,
            keto: document.getElementById('keto').checked,
            paleo: document.getElementById('paleo').checked
        };

        this.userProfile = profile;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        this.calculateCalories();
        this.showNotification('Profile saved successfully!', 'success');
    }

    loadUserProfile() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            this.userProfile = JSON.parse(saved);
            this.populateProfileForm();
            this.calculateCalories();
        }
    }

    populateProfileForm() {
        Object.keys(this.userProfile).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.userProfile[key];
                } else {
                    element.value = this.userProfile[key];
                }
            }
        });
    }

    calculateCalories() {
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const age = parseFloat(document.getElementById('age').value);
        const activity = document.getElementById('activity').value;
        const goal = document.getElementById('goal').value;

        if (!height || !weight || !age) {
            document.getElementById('dailyCalories').textContent = 'Enter your details to calculate';
            return;
        }

        // Basic BMR calculation (Mifflin-St Jeor Equation)
        const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5; // For males (simplified)

        // Activity multipliers
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725,
            extra: 1.9
        };

        let dailyCalories = bmr * (activityMultipliers[activity] || 1.2);

        // Adjust for goals
        const goalAdjustments = {
            lose: -500,
            gain: +500,
            muscle: +300,
            maintain: 0
        };

        dailyCalories += goalAdjustments[goal] || 0;

        document.getElementById('dailyCalories').textContent = `${Math.round(dailyCalories)} calories/day`;
    }

    // Storage Functions
    saveMealPlan() {
        localStorage.setItem('mealPlan', JSON.stringify(this.mealPlan));
    }

    loadMealPlan() {
        const saved = localStorage.getItem('mealPlan');
        if (saved) {
            this.mealPlan = JSON.parse(saved);
            this.displayMealPlan();
        }
    }

    displayMealPlan() {
        Object.keys(this.mealPlan).forEach(day => {
            const dayColumn = document.querySelector(`[data-day="${day}"]`);
            if (dayColumn) {
                Object.keys(this.mealPlan[day]).forEach(meal => {
                    const mealSlot = dayColumn.querySelector(`[data-meal="${meal}"]`);
                    const mealData = this.mealPlan[day][meal];
                    if (mealSlot && mealData) {
                        const content = mealSlot.querySelector('.meal-content');
                        content.innerHTML = `
                            <strong>${mealData.name}</strong><br>
                            <small>${mealData.description}</small><br>
                            ${mealData.calories ? `<span style="color: #e74c3c; font-weight: bold;">${mealData.calories} cal</span>` : ''}
                        `;
                        content.classList.add('has-meal');
                    }
                });
            }
        });
    }

    // Utility Functions
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DietPlanner();
});
