class FinancialOS:
    def __init__(self, income):
        self.income = income

        self.core_expenses = {
            "food": 2500,
            "diesel": 2000,
            "meds": 3500,
            "pens": 600
        }

        self.lifestyle = {
            "snacks": 1000,
            "fun": 3750
        }

        self.savings_rate = 0.40

    def core_total(self):
        return sum(self.core_expenses.values())

    def lifestyle_total(self):
        return sum(self.lifestyle.values())

    def savings(self):
        return self.income * self.savings_rate

    def net(self):
        return self.income - (self.core_total() + self.lifestyle_total() + self.savings())

    def report_with_explanation(self):
        core = self.core_total()
        lifestyle = self.lifestyle_total()
        savings = self.savings()
        net = self.net()

        print("\n--- FINANCIAL OS REPORT ---\n")

        print(f"Income: R{self.income}")
        print("→ Total money earned by the system (Caide + Justin combined)\n")

        print(f"Core Expenses: R{core}")
        print("→ Non-negotiable survival costs (food, diesel, meds, tools)\n")

        print(f"Lifestyle Expenses: R{lifestyle}")
        print("→ Quality of life spending (fun, snacks, enjoyment)\n")

        print(f"Savings (40%): R{savings}")
        print("→ Money locked away for future safety and opportunities\n")

        print(f"Net Buffer: R{net}")
        print("→ Flexible money left for unexpected events or scaling\n")

        print("\n--- SYSTEM STATUS ---")

        if net < 0:
            print("WARNING: Deficit system (expenses exceed income)")
        elif net < 3000:
            print("Status: Tight system (low flexibility)")
        else:
            print("Status: Healthy system (stable + scalable)")