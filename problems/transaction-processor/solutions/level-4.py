class TransactionProcessor:
    def __init__(self):
        self.accounts = {}
        self.spending = {}
        self.next_payment_id = 0
        self.payments = {}
        self.tx_log = []    # list of (timestamp, account_id, delta)
        self.merged = {}    # merged_id -> survivor_id

    def create_account(self, account_id, initial_balance=0):
        if account_id in self.accounts:
            return False
        self.accounts[account_id] = float(initial_balance)
        self.spending[account_id] = 0.0
        self.tx_log.append((0, account_id, float(initial_balance)))
        return True

    def _resolve_account(self, account_id):
        while account_id in self.merged:
            account_id = self.merged[account_id]
        return account_id

    def _do_transfer(self, from_id, to_id, amount, timestamp=None):
        """Execute a transfer between two existing accounts. Returns True if successful."""
        if self.accounts[from_id] < amount:
            return False
        self.accounts[from_id] -= amount
        self.accounts[to_id] += amount
        self.spending[from_id] += amount
        if timestamp is not None:
            self.tx_log.append((timestamp, from_id, -amount))
            self.tx_log.append((timestamp, to_id, amount))
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
            from_id = self._resolve_account(p["from_id"])
            to_id = self._resolve_account(p["to_id"])
            if from_id in self.accounts and to_id in self.accounts:
                if self._do_transfer(from_id, to_id, p["amount"], timestamp):
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
        if timestamp is not None:
            self.tx_log.append((timestamp, account_id, amount))
        return self.accounts[account_id]

    def transfer(self, from_id, to_id, amount, timestamp=None):
        self._process_due_payments(timestamp)
        if from_id not in self.accounts or to_id not in self.accounts:
            return None
        if not self._do_transfer(from_id, to_id, amount, timestamp):
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

    def merge_accounts(self, id1, id2):
        if id1 == id2:
            return False
        if id1 not in self.accounts or id2 not in self.accounts:
            return None
        # Transfer balance
        self.accounts[id1] += self.accounts[id2]
        # Cancel id2's pending from-payments
        for pid, p in self.payments.items():
            if p["status"] == "pending":
                if p["from_id"] == id2:
                    p["status"] = "cancelled"
                if p["to_id"] == id2:
                    p["to_id"] = id1
        # Remove id2 from active accounts but keep tx_log for history
        del self.accounts[id2]
        del self.spending[id2]
        self.merged[id2] = id1
        return True

    def get_balance_at(self, account_id, time_at):
        if account_id not in self.accounts and account_id not in self.merged:
            has_history = any(aid == account_id for _, aid, _ in self.tx_log)
            if not has_history:
                return None
        balance = 0.0
        for ts, aid, delta in self.tx_log:
            if aid == account_id and ts <= time_at:
                balance += delta
        return balance
