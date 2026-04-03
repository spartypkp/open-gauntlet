class TransactionProcessor:
    def __init__(self):
        self.accounts = {}
        self.spending = {}
        self.next_payment_id = 0
        self.payments = {}  # payment_id -> {from_id, to_id, amount, scheduled_at, status}

    def create_account(self, account_id, initial_balance=0):
        if account_id in self.accounts:
            return False
        self.accounts[account_id] = float(initial_balance)
        self.spending[account_id] = 0.0
        return True

    def _do_transfer(self, from_id, to_id, amount):
        """Execute a transfer between two existing accounts. Returns True if successful."""
        if self.accounts[from_id] < amount:
            return False
        self.accounts[from_id] -= amount
        self.accounts[to_id] += amount
        self.spending[from_id] += amount
        return True

    def _process_due_payments(self, timestamp):
        if timestamp is None:
            return
        due = sorted(
            (p["scheduled_at"], p["order"], pid)
            for pid, p in self.payments.items()
            if p["status"] == "pending" and p["scheduled_at"] <= timestamp
        )
        for _, _, pid in due:
            p = self.payments[pid]
            if p["from_id"] in self.accounts and p["to_id"] in self.accounts:
                if self._do_transfer(p["from_id"], p["to_id"], p["amount"]):
                    p["status"] = "executed"
                else:
                    p["status"] = "failed"
            else:
                p["status"] = "failed"

    def deposit(self, account_id, amount, timestamp=None):
        self._process_due_payments(timestamp)
        if account_id not in self.accounts:
            return None
        self.accounts[account_id] += amount
        return self.accounts[account_id]

    def transfer(self, from_id, to_id, amount, timestamp=None):
        self._process_due_payments(timestamp)
        if from_id not in self.accounts or to_id not in self.accounts:
            return None
        if not self._do_transfer(from_id, to_id, amount):
            return False
        return True

    def get_balance(self, account_id):
        if account_id not in self.accounts:
            return None
        return self.accounts[account_id]

    def top_spenders(self, n):
        items = list(self.spending.items())
        items.sort(key=lambda x: (-x[1], x[0]))
        return [f"{aid}({int(amt)})" for aid, amt in items[:n]]

    def schedule_payment(self, from_id, to_id, amount, scheduled_at):
        if from_id not in self.accounts or to_id not in self.accounts:
            return None
        pid = f"payment_{self.next_payment_id}"
        self.payments[pid] = {
            "from_id": from_id,
            "to_id": to_id,
            "amount": amount,
            "scheduled_at": scheduled_at,
            "status": "pending",
            "order": self.next_payment_id
        }
        self.next_payment_id += 1
        return pid

    def cancel_payment(self, payment_id):
        if payment_id not in self.payments or self.payments[payment_id]["status"] != "pending":
            return False
        self.payments[payment_id]["status"] = "cancelled"
        return True
