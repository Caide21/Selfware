class IncomeCalculator:
    def __init__(self, days_per_week, weeks_in_month):
        self.days_per_week = days_per_week
        self.weeks_in_month = weeks_in_month

    def calculate_monthly_income(self, worker):
        mid_days = self.days_per_week * 2
        payday_days = self.days_per_week * 2

        tips = (mid_days * worker.mid_avg) + (payday_days * worker.payday_avg)
        total = tips + worker.salary

        return total