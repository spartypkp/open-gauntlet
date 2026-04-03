class TransactionProcessor:
    def __init__(self):
        self.accounts = {}  # id -> balance (float)

    def create_account(self, account_id, initial_balance=0):
        if account_id in self.accounts:
            return False
        self.accounts[account_id] = float(initial_balance)
        return True

    def deposit(self, account_id, amount):
        if account_id not in self.accounts:
            return None
        self.accounts[account_id] += amount
        return self.accounts[account_id]

    def transfer(self, from_id, to_id, amount):
        if from_id not in self.accounts or to_id not in self.accounts:
            return None
        if self.accounts[from_id] < amount:
            return False
        self.accounts[from_id] -= amount
        self.accounts[to_id] += amount
        return True

    def get_balance(self, account_id):
        if account_id not in self.accounts:
            return None
        return self.accounts[account_id]
