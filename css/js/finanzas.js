/**
 * GESTOR DE FINANZAS
 * =================
 * Sistema completo de ahorro y movimientos financieros
 */

class FinancesManager {
    constructor() {
        this.DAILY_GOAL = 10;
        this.loadFinancesData();
        this.initialize();
    }

    /**
     * INICIALIZAR FINANZAS
     */
    initialize() {
        if (!auth.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }

        this.setupEventListeners();
        this.renderFinances();
        console.log('💰 Sistema de finanzas cargado');
    }

    /**
     * CARGAR DATOS DE FINANZAS
     */
    loadFinancesData() {
        this.data = storage.get('finances') || {
            transactions: [],
            daily_goal: this.DAILY_GOAL,
            created_at: new Date().toISOString()
        };
    }

    /**
     * GUARDAR DATOS DE FINANZAS
     */
    saveFinancesData() {
        storage.set('finances', this.data);
        console.log('💾 Datos financieros guardados');
    }

    /**
     * SETUP DE EVENT LISTENERS
     */
    setupEventListeners() {
        // Agregar dinero
        const addMoneyForm = document.getElementById('addMoneyForm');
        if (addMoneyForm) {
            addMoneyForm.addEventListener('submit', (e) => this.handleAddMoney(e));
        }

        // Retirar dinero
        const withdrawMoneyForm = document.getElementById('withdrawMoneyForm');
        if (withdrawMoneyForm) {
            withdrawMoneyForm.addEventListener('submit', (e) => this.handleWithdrawMoney(e));
        }

        // Cambiar período de gráfico
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChartPeriod(e));
        });

        // Botón de historial
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.showHistoryModal());
        }

        // Cerrar modal de historial
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => this.closeHistoryModal());
        }
    }

    /**
     * AGREGAR DINERO
     */
    handleAddMoney(e) {
        e.preventDefault();

        const amountInput = document.getElementById('addMoneyAmount');
        const amount = parseFloat(amountInput.value);

        if (!this.validateAmount(amount)) {
            showNotification('❌ Ingresa una cantidad válida', 'error');
            return;
        }

        const transaction = {
            id: generateUUID(),
            type: 'income',
            amount: amount,
            date: getCurrentDate(),
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            description: `Ahorro del día`,
            timestamp: new Date().toISOString()
        };

        this.data.transactions.push(transaction);
        this.saveFinancesData();
        this.renderFinances();

        amountInput.value = '';
        showNotification(`✅ ¡Se agregaron S/. ${amount}!`, 'success');

        console.log('✅ Dinero agregado:', transaction);
    }

    /**
     * RETIRAR DINERO
     */
    handleWithdrawMoney(e) {
        e.preventDefault();

        const amountInput = document.getElementById('withdrawMoneyAmount');
        const amount = parseFloat(amountInput.value);

        if (!this.validateAmount(amount)) {
            showNotification('❌ Ingresa una cantidad válida', 'error');
            return;
        }

        const currentTotal = this.getTotalSaved();
        if (amount > currentTotal) {
            showNotification(`❌ No tienes suficientes fondos. Total: S/. ${currentTotal}`, 'error');
            return;
        }

        const transaction = {
            id: generateUUID(),
            type: 'withdrawal',
            amount: -amount,
            date: getCurrentDate(),
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            description: `Retiro de fondos`,
            timestamp: new Date().toISOString()
        };

        this.data.transactions.push(transaction);
        this.saveFinancesData();
        this.renderFinances();

        amountInput.value = '';
        showNotification(`💸 Retiraste S/. ${amount}`, 'success');

        console.log('💸 Dinero retirado:', transaction);
    }

    /**
     * VALIDAR CANTIDAD
     */
    validateAmount(amount) {
        return !isNaN(amount) && amount > 0 && amount < 100000;
    }

    /**
     * OBTENER TOTAL AHORRADO
     */
    getTotalSaved() {
        return this.data.transactions.reduce((total, transaction) => {
            return total + transaction.amount;
        }, 0);
    }

    /**
     * OBTENER DEUDA ACTUAL
     */
    getDebtAmount() {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const daysPassed = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24)) + 1;
        const goalAmount = this.DAILY_GOAL * daysPassed;
        const totalSaved = this.getTotalSaved();
        
        return Math.max(0, goalAmount - totalSaved);
    }

    /**
     * OBTENER PORCENTAJE DE META
     */
    getGoalPercentage() {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const daysPassed = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24)) + 1;
        const goalAmount = this.DAILY_GOAL * daysPassed;
        const totalSaved = this.getTotalSaved();
        
        return Math.min(100, (totalSaved / goalAmount) * 100);
    }

    /**
     * OBTENER TRANSACCIONES POR PERÍODO
     */
    getTransactionsByPeriod(period) {
        const today = new Date();
        let startDate;

        if (period === 'week') {
            startDate = getWeekStart(today);
        } else if (period === 'month') {
            startDate = getMonthStart(today);
        } else if (period === 'year') {
            startDate = getYearStart(today);
        }

        return this.data.transactions.filter(transaction => {
            const transDate = new Date(transaction.date);
            return transDate >= startDate && transDate <= today;
        });
    }

    /**
     * ELIMINAR TRANSACCIÓN
     */
    deleteTransaction(transactionId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            this.data.transactions = this.data.transactions.filter(t => t.id !== transactionId);
            this.saveFinancesData();
            this.renderFinances();
            showNotification('✅ Transacción eliminada', 'success');
            console.log('🗑️ Transacción eliminada:', transactionId);
        }
    }

    /**
     * EDITAR TRANSACCIÓN
     */
    editTransaction(transactionId) {
        const transaction = this.data.transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const newAmount = prompt(`Cantidad actual: S/. ${Math.abs(transaction.amount)}\nNueva cantidad:`, Math.abs(transaction.amount));
        
        if (newAmount === null) return;

        const amount = parseFloat(newAmount);
        if (!this.validateAmount(amount)) {
            showNotification('❌ Cantidad inválida', 'error');
            return;
        }

        // Calcular el ajuste
        const oldAmount = transaction.amount;
        const newAmountSigned = transaction.type === 'withdrawal' ? -amount : amount;
        const difference = newAmountSigned - oldAmount;

        transaction.amount = newAmountSigned;
        transaction.edited_at = new Date().toISOString();

        this.saveFinancesData();
        this.renderFinances();

        showNotification(`✅ Transacción corregida (Ajuste: S/. ${difference.toFixed(2)})`, 'success');
        console.log('✏️ Transacción editada:', transaction);
    }

    /**
     * MOSTRAR HISTORIAL MODAL
     */
    showHistoryModal() {
        const modal = document.getElementById('historyModal');
        const historyContent = document.getElementById('historyContent');

        const period = document.querySelector('.chart-btn.active')?.dataset.period || 'month';
        const transactions = this.getTransactionsByPeriod(period);

        if (transactions.length === 0) {
            historyContent.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No hay transacciones en este período</p>';
        } else {
            let html = `
                <div class="history-header">
                    <h3>Historial de Transacciones</h3>
                    <p style="color: var(--accent-color);">Período: ${period.charAt(0).toUpperCase() + period.slice(1)}</p>
                </div>
                <div class="history-list">
            `;

            transactions.reverse().forEach(t => {
                const isIncome = t.type === 'income';
                const color = isIncome ? 'var(--success-green)' : 'var(--danger-red)';
                const icon = isIncome ? '➕' : '➖';

                html += `
                    <div class="history-item" style="border-left: 4px solid ${color};">
                        <div class="history-item-header">
                            <span style="color: ${color}; font-weight: bold; font-size: 1.1rem;">
                                ${icon} S/. ${Math.abs(t.amount).toFixed(2)}
                            </span>
                            <span style="color: var(--text-light); font-size: 0.85rem;">
                                ${t.time}
                            </span>
                        </div>
                        <div class="history-item-details">
                            <p>${t.description}</p>
                            <p style="color: #888; font-size: 0.8rem;">📅 ${formatDate(t.date)}</p>
                        </div>
                        <div class="history-item-actions">
                            <button class="btn-mini" onclick="finances.editTransaction('${t.id}')">✏️ Editar</button>
                            <button class="btn-mini btn-danger" onclick="finances.deleteTransaction('${t.id}')">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            historyContent.innerHTML = html;
        }

        modal.classList.remove('hidden');
        modal.style.animation = 'zoom-in 0.3s ease-out';
    }

    /**
     * CERRAR HISTORIAL MODAL
     */
    closeHistoryModal() {
        const modal = document.getElementById('historyModal');
        modal.classList.add('hidden');
    }

    /**
     * MANEJAR CAMBIO DE PERÍODO DE GRÁFICO
     */
    handleChartPeriod(e) {
        const buttons = document.querySelectorAll('.chart-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const period = e.target.dataset.period;
        console.log(`📊 Cambiando período a: ${period}`);
        this.renderChart(period);
    }

    /**
     * RENDERIZAR GRÁFICO
     */
    renderChart(period) {
        const transactions = this.getTransactionsByPeriod(period);
        const canvas = document.getElementById('financeChart');

        if (!canvas) return;

        // Agrupar transacciones por día
        const dailyData = {};

        transactions.forEach(t => {
            if (!dailyData[t.date]) {
                dailyData[t.date] = { income: 0, withdrawal: 0, total: 0 };
            }
            if (t.type === 'income') {
                dailyData[t.date].income += t.amount;
            } else {
                dailyData[t.date].withdrawal += Math.abs(t.amount);
            }
            dailyData[t.date].total += t.amount;
        });

        // Crear contexto del canvas
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Limpiar canvas
        ctx.fillStyle = 'rgba(10, 14, 39, 0.5)';
        ctx.fillRect(0, 0, width, height);

        // Dibujar gráfico personalizado
        const dates = Object.keys(dailyData).sort();
        const maxAmount = Math.max(
            ...Object.values(dailyData).map(d => Math.abs(d.total)),
            this.DAILY_GOAL * 1.2
        );

        const chartHeight = height - 60;
        const chartWidth = width - 60;
        const barWidth = chartWidth / (dates.length || 1);

        // Dibujar ejes
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, height - 40);
        ctx.lineTo(width - 10, height - 40);
        ctx.stroke();

        // Dibujar barras
        dates.forEach((date, index) => {
            const data = dailyData[date];
            const x = 50 + (index * barWidth) + (barWidth / 2);
            const barHeight = (data.total / maxAmount) * chartHeight;

            // Color basado en tipo
            if (data.total > 0) {
                ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
            } else {
                ctx.fillStyle = 'rgba(255, 71, 87, 0.7)';
            }

            ctx.fillRect(x - (barWidth * 0.35), height - 40 - barHeight, barWidth * 0.7, barHeight);

            // Etiqueta de fecha
            ctx.fillStyle = 'rgba(224, 224, 224, 0.7)';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), x, height - 15);
        });

        console.log('📊 Gráfico renderizado para período:', period);
    }

    /**
     * RENDERIZAR TODA LA SECCIÓN DE FINANZAS
     */
    renderFinances() {
        const totalSaved = this.getTotalSaved();
        const debtAmount = this.getDebtAmount();
        const goalPercentage = this.getGoalPercentage();

        // Actualizar números principales
        const totalElement = document.getElementById('totalSaved');
        const debtElement = document.getElementById('debtAmount');
        const percentageElement = document.getElementById('goalPercentage');

        if (totalElement) {
            totalElement.textContent = `S/. ${totalSaved.toFixed(2)}`;
            totalElement.className = totalSaved >= debtAmount ? 'amount-positive neon-glow' : 'amount-negative';
        }

        if (debtElement) {
            debtElement.textContent = `S/. ${debtAmount.toFixed(2)}`;
            debtElement.className = debtAmount > 0 ? 'amount-debt' : 'amount-positive';
        }

        if (percentageElement) {
            percentageElement.textContent = `${Math.round(goalPercentage)}%`;
        }

        // Actualizar barra de progreso
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${goalPercentage}%`;
            const color = goalPercentage >= 100 ? 'var(--success-green)' : 
                         goalPercentage >= 50 ? 'var(--primary-color)' : 
                         'var(--warning-orange)';
            progressBar.style.background = color;
        }

        // Renderizar gráfico del período activo
        const activePeriod = document.querySelector('.chart-btn.active')?.dataset.period || 'month';
        this.renderChart(activePeriod);

        console.log('✨ Finanzas renderizadas');
    }
}

// Instancia global del Finances Manager
let finances;

/**
 * INICIAR CUANDO EL DOM ESTÉ LISTO
 */
document.addEventListener('DOMContentLoaded', () => {
    finances = new FinancesManager();
});
