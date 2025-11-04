from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from utils import read_csv_as_dict

app = FastAPI(
    title="Collective: Take-home by KC Kim",
    version="1.0.0",
)

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],  # Allow all headers
)

@app.get("/validate")
def validate():
    # Read the transactions and bank balances from the CSV files
    transactions = read_csv_as_dict("data/transactions.csv")
    bank_balances = read_csv_as_dict("data/bank_balances.csv")
    
    # Initialize the dictionaries to store the transaction totals and cumulative transaction totals per date
    transaction_total_per_date = {}
    transaction_total_per_date_cumulative = {}
    transactions_per_date = {}
    cur_transaction_total = 0

    # Iterate through the transactions and calculate the transaction totals and cumulative transaction totals per date
    for row in transactions:
        transaction_date = row["date"]
        transaction_amount = float(row["amount"])

        if transaction_date not in transaction_total_per_date:
            transaction_total_per_date[transaction_date] = 0
            # Initialize the list to store the transactions for the date
            transactions_per_date[transaction_date] = []
        
        transaction_total_per_date[transaction_date] += transaction_amount
        transactions_per_date[transaction_date].append(transaction_amount)
        
        cur_transaction_total += transaction_amount
        transaction_total_per_date_cumulative[transaction_date] = cur_transaction_total

    bank_balance_per_date = {}

    for row in bank_balances:
        bank_balance_date = row["date"]
        bank_balance_amount = float(row["balance"])
        bank_balance_per_date[bank_balance_date] = bank_balance_amount

    res = []

    all_dates = sorted(set(list(transaction_total_per_date.keys()) + list(bank_balance_per_date.keys())))

    for date in all_dates:
        transaction_total = transaction_total_per_date.get(date, 0)
        # Get the previous date's transaction_total if available
        if transaction_total == 0:
            idx = all_dates.index(date)
            if idx > 0:
                prev_date = all_dates[idx - 1]
                transaction_cumulative = transaction_total_per_date_cumulative.get(prev_date, 0)
        else:
            transaction_cumulative = transaction_total_per_date_cumulative.get(date, 0)
        bank_balance = bank_balance_per_date.get(date, 0)
        match_bool = transaction_cumulative == bank_balance
        transactions_list = transactions_per_date.get(date, [])
        
        # Output the results in the format of the ReconciliationResult class
        res.append({
            "date": date,
            "bank_balance": bank_balance,
            "transaction_total_per_date": transaction_total,
            "transaction_total_per_date_cumulative": transaction_cumulative,
            "transactions_per_date": transactions_list,
            "match_bool": match_bool,
        })

    return {"results": res}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)