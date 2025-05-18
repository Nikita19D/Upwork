import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from logic.user import User
import time


user=User("Alex")

user.show_portfolio()
user.buy("AAPL",shares=5)
time.sleep(20)
user.sell("AAPL",shares=2)
user.show_portfolio

user.save_to_file("alex_portfolio.json")
user.load_from_file("alex_portfolio.json")
user.show_portfolio()



