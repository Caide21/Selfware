from worker import Worker
from income import IncomeCalculator
from financial_os import FinancialOS

# -------------------------
# Workers
# -------------------------
caide = Worker("Caide", 4500, 350, 600)
justin = Worker("Justin", 4500, 350, 600)

# -------------------------
# Income System
# -------------------------
calc = IncomeCalculator(5, 4)

caide_income = calc.calculate_monthly_income(caide)
justin_income = calc.calculate_monthly_income(justin)

combined_income = caide_income + justin_income

# -------------------------
# Financial OS (Core Engine)
# -------------------------
os = FinancialOS(combined_income)

# -------------------------
# Run System (WITH EXPLANATION LAYER)
# -------------------------
os.report_with_explanation()