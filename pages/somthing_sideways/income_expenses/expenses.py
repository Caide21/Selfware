class Expenses:
    def __init__(self, food=2500, diesel=2000):
        self.food = food
        self.diesel = diesel

    def total_expenses(self):
        return self.food + self.diesel