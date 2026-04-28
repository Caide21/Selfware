class Report:
    def __init__(self, income, expenses):
        self.income = income
        self.expenses = expenses

    def net_profit(self):
        return self.income - self.expenses

    def show(self):
        print("Monthly Income: R", self.income)
        print("Monthly Expenses: R", self.expenses)
        print("Net Position: R", self.net_profit())

        if self.net_profit() < 0:
            print("Status: DEFICIT (burning reserves)")
        elif self.net_profit() < 2000:
            print("Status: SURVIVAL (tight loop)")
        else:
            print("Status: EXPANSION (build mode)")