import json
from datetime import datetime
from logic.data_fetcher_fixed_new import get_latest_price

class User:
    def __init__(self,name:str,balance:float=10000.0):
        self.name=name
        self.balance=balance
        self.holdings={}
        self.history=[]

    def buy(self,stock:str,shares:int):
        price=get_latest_price(stock)
        if price is None:
            print("❌ Could not retrieve stock price.")
            return False
        
        total_cost=price*shares
        if total_cost>self.balance:
            print("❌ Not enough balance.")
            return False
        
        self.balance_=total_cost
        #accessing dictionary of holding with key of value stock
        #and then useing get method to retrive the value stored which associsted with stock key and if it not found then return 0
        self.holdings[stock]=self.holdings.get(stock,0)+shares
        self._record_transaction('buy',stock,price,shares)
        print(f"✅ Bought {shares} shares of {stock} at ${price:.2f}")
        return True
    def sell(self,stock:str,shares:int):
        price=get_latest_price(stock)
        if price is None:
            print("❌ Could not retrieve stock price.")
            return False
        
        if self.holdings.get(stock,0)<shares:
            print("❌ Not enough shares to sell.")
            return False
        #accessing dictionary of holding with key of value stock
        self.holdings[stock]-=shares
        self.balance-=price*shares
        self._record_transaction('sell', stock, price, shares)
        print(f"✅ Sold {shares} shares of {stock} at ${price:.2f}")
        return True

    def _record_transaction(self,action:str,stock:str,price:float,shares:int):
        self.history.append({
            'action':action,
            'stock':stock,
            'price':price,
            'shares':shares,
            'time':datetime.now().strftime('%Y-%m-%d %H:%M')
        })

    def show_portfolio(self):
        print(f"\n Portfolio for {self.name}")
        print(f"Balance:${self.balance:.2f}")
        for stock,shares in self.holdings.items():
            print(f"{stock}:{shares}shares")
        print("-"*30)

    def save_to_file(self,filename:str):
        data={
            'name':self.name,
            'balance':self.balance,
            'holdings':self.holdings,
            'history':self.history
        }
        with open(filename,'w') as f:
            json.dump(data,f,indent=4)

    @classmethod
    def load_from_file(cls,filename:str):
        with open(filename,'r') as f:
            data=json.load(f)
        user = cls(data['name'],data['balance'])
        user.holdings=data['holdings']
        user.history=data['history']

        return user