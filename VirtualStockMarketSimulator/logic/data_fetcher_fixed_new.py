import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import random

# Setting up Twelve Data API
API_KEY = "c2b4ce58b2d144969ccf5d75131923d5"  # Replace with your Twelve Data API key
BASE_URL = "https://api.twelvedata.com"

# Global variable to track if we're using mock data
is_using_mock_data = False

def fetch_realtime_minute_data(ticker: str, count: int = 30) -> pd.DataFrame:
    """Fetch real-time minute candle data from Twelve Data API.
    
    Args:
        ticker: Stock symbol (e.g., 'AAPL')
        count: Number of data points to retrieve
        
    Returns:
        DataFrame with real-time minute candle data or None if fetch fails
    """
    try:
        # First try to get real-time minute data
        url = f"{BASE_URL}/time_series"
        params = {
            "symbol": ticker,
            "interval": "1min",
            "outputsize": count,
            "apikey": API_KEY,
            "timezone": "UTC"  # Ensures consistent timezone across requests
        }
        
        print(f"Fetching real-time minute candles for {ticker}...")
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        # Check for error response from TwelveData
        if data.get("status") == "error":
            print(f"❌ API error: {data.get('message')}")
            return None
        
        if "values" in data and len(data["values"]) > 0:
            print(f"✅ Successfully fetched REAL-TIME minute candle data for {ticker}")
            
            # Parse data into DataFrame
            df = pd.DataFrame(data["values"])
            
            # Convert string dates to datetime and numeric values
            df["datetime"] = pd.to_datetime(df["datetime"])
            for col in ["open", "high", "low", "close", "volume"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col])
            
            # Rename columns to match our convention
            df = df.rename(columns={
                "datetime": "timestamp",
                "open": "Open",
                "high": "High",
                "low": "Low", 
                "close": "Close",
                "volume": "Volume"
            })
            
            # Add mock data indicator and set index
            df["is_mock"] = False
            df = df.set_index("timestamp")
            
            # Sort by date (oldest first)
            df = df.sort_index()
            
            return df
        else:
            print(f"⚠️ No real-time minute data available for {ticker}")
            return None
            
    except Exception as e:
        print(f"❌ Error fetching real-time minute data: {e}")
        return None

def fetch_data(ticker: str, interval: str = "1min", count: int = 30) -> pd.DataFrame:
    """Fetch historical market data from Twelve Data or generate mock data.
    
    Args:
        ticker: Stock symbol (e.g., 'AAPL')
        interval: '1min', '5min', '15min', '30min', '1h', '1day', '1week', '1month'
        count: Number of data points to retrieve
        
    Returns:
        DataFrame with market data (includes 'is_mock' column to indicate data source)
    """
    global is_using_mock_data
    is_using_mock_data = False
    
    # For real-time minute candles, we'll prioritize this approach
    if interval == "1min":
        realtime_df = fetch_realtime_minute_data(ticker, count)
        if realtime_df is not None and not realtime_df.empty:
            return realtime_df
    
    try:
        # Try to get historical data from Twelve Data
        url = f"{BASE_URL}/time_series"
        params = {
            "symbol": ticker,
            "interval": interval,
            "outputsize": count,
            "apikey": API_KEY
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        # Check for error response from TwelveData
        if data.get("status") == "error":
            print(f"❌ API error: {data.get('message')}")
            raise Exception(data.get('message'))
        
        if "values" in data:
            print(f"✅ Using REAL historical data for {ticker}")
            is_using_mock_data = False
            
            # Parse data into DataFrame
            df = pd.DataFrame(data["values"])
            
            # Convert string dates to datetime and numeric values
            df["datetime"] = pd.to_datetime(df["datetime"])
            for col in ["open", "high", "low", "close", "volume"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col])
            
            # Rename columns to match our convention
            df = df.rename(columns={
                "datetime": "timestamp",
                "open": "Open",
                "high": "High",
                "low": "Low", 
                "close": "Close",
                "volume": "Volume"
            })
            
            # Add mock data indicator and set index
            df["is_mock"] = False
            df = df.set_index("timestamp")
            
            # Sort by date (oldest first)
            df = df.sort_index()
            
            return df
        
        # If historical data fails, try getting just the current price
        url = f"{BASE_URL}/price"
        params = {
            "symbol": ticker,
            "apikey": API_KEY
        }
        
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        # Check for error response from TwelveData
        if data.get("status") == "error":
            print(f"❌ Price API error: {data.get('message')}")
            raise Exception(data.get('message'))
        
        if "price" in data:
            current_price = float(data["price"])
            print(f"⚠️ Using REAL current price but MOCK historical data for {ticker}")
            is_using_mock_data = True
            return _generate_mock_data(ticker, current_price, count, interval)
    
    except Exception as e:
        print(f"❌ API request failed: {e}")
    
    # Fall back to completely mocked data
    print(f"⚠️ Using COMPLETELY MOCK data for {ticker}")
    is_using_mock_data = True
    return _generate_mock_data(ticker, _get_mock_base_price(ticker), count, interval)

def _generate_mock_data(ticker: str, base_price: float, count: int, interval: str = "1day") -> pd.DataFrame:
    """Generate mock historical data for testing purposes"""
    print(f"Generating mock data for {ticker} with base price {base_price}")
    
    # Determine time interval based on interval parameter
    is_intraday = interval in ["1min", "5min", "15min", "30min", "1h"]
    
    # Generate appropriate timestamps
    end_date = datetime.now()
    
    if is_intraday:
        # Extract the number of minutes
        if interval == "1h":
            minutes = 60
        else:
            minutes = int(interval.replace("min", ""))
            
        # Generate timestamps at specified minute intervals
        dates = []
        for i in range(count):
            dates.append(end_date - timedelta(minutes=i * minutes))
        dates.reverse()  # Make dates go from oldest to newest
    else:
        # For daily/weekly/monthly data
        if interval == "1day":
            days = 1
        elif interval == "1week":
            days = 7
        elif interval == "1month":
            days = 30
        else:
            days = 1
            
        dates = [end_date - timedelta(days=i * days) for i in range(count)]
        dates.reverse()  # Make dates go from oldest to newest
    
    # Generate realistic price movements
    closes = []
    current = base_price * (0.8 + 0.4 * random.random())  # Start at 80-120% of base
    
    # Set appropriate volatility based on timeframe
    volatility = 0.03  # Default for daily
    if is_intraday:
        volatility = 0.005  # Lower volatility for intraday
    
    for _ in range(count):
        # Change between +/- volatility percent
        change = current * random.uniform(-volatility, volatility)
        current += change
        closes.append(current)
    
    # Generate OHLCV data
    opens = [c * (1 + random.uniform(-0.01, 0.01)) for c in closes]
    highs = [max(o, c) * (1 + random.uniform(0, 0.02)) for o, c in zip(opens, closes)]
    lows = [min(o, c) * (1 - random.uniform(0, 0.02)) for o, c in zip(opens, closes)]
    
    # Generate appropriate volume
    if is_intraday:
        volumes = [int(random.uniform(10000, 1000000)) for _ in range(count)] 
    else:
        volumes = [int(random.uniform(100000, 10000000)) for _ in range(count)]
    
    # Create DataFrame
    df = pd.DataFrame({
        "timestamp": dates,
        "Open": opens,
        "High": highs,
        "Low": lows,
        "Close": closes,
        "Volume": volumes,
        "is_mock": True  # Flag indicating this is mock data
    })
    
    df.set_index("timestamp", inplace=True)
    return df

def _get_mock_base_price(ticker: str) -> float:
    """Return a realistic base price for common stocks"""
    mock_prices = {
        "AAPL": 198.53,
        "GOOGL": 176.45,
        "MSFT": 420.35,
        "AMZN": 180.75,
        "META": 510.92,
        "TSLA": 182.12,
        "NVDA": 950.37
    }
    return mock_prices.get(ticker, 100.0)

def get_latest_price(ticker: str) -> tuple[float, bool]:
    """Get latest price - tries API first, falls back to mock data.
    
    Returns:
        tuple: (price, is_mock) where is_mock is True if the price is mocked
    """
    try:
        # Try the actual API for current price
        url = f"{BASE_URL}/price"
        params = {
            "symbol": ticker,
            "apikey": API_KEY
        }
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        # Check for error response from TwelveData
        if data.get("status") == "error":
            print(f"❌ Price API error: {data.get('message')}")
            raise Exception(data.get('message'))
        
        if "price" in data:
            price = float(data["price"])
            print(f"✅ Using REAL price for {ticker}: ${price}")
            return price, False
        
        # If API fails, generate a mock price
        base_price = _get_mock_base_price(ticker)
        mock_price = base_price * (1 + random.uniform(-0.02, 0.02))
        print(f"⚠️ Using MOCK price for {ticker}: ${mock_price:.2f}")
        return mock_price, True
    
    except Exception as e:
        print(f"❌ Error fetching latest price: {e}")
        # Fall back to mock
        base_price = _get_mock_base_price(ticker)
        mock_price = base_price * (1 + random.uniform(-0.02, 0.02))
        print(f"⚠️ Using MOCK price for {ticker}: ${mock_price:.2f}")
        return mock_price, True

# Add a function to get continuous real-time updates
def get_realtime_updates(ticker: str, callback_function=None, interval_seconds: int = 60, max_updates: int = None):
    """
    Stream real-time market data updates for a ticker
    
    Args:
        ticker: Stock symbol to monitor
        callback_function: Function to call with each update (receives DataFrame)
        interval_seconds: How often to fetch updates (default 60s)
        max_updates: Maximum number of updates to fetch (default: None = continuous)
    
    Returns:
        None (runs until interrupted or max_updates reached)
    """
    update_count = 0
    
    print(f"Starting real-time monitoring for {ticker} every {interval_seconds} seconds...")
    
    try:
        while True:
            # Fetch the latest minute candle data
            latest_data = fetch_realtime_minute_data(ticker, count=1)
            
            # Execute callback if provided
            if callback_function and latest_data is not None and not latest_data.empty:
                callback_function(latest_data)
            
            update_count += 1
            if max_updates and update_count >= max_updates:
                print(f"Reached maximum update count ({max_updates}). Stopping.")
                break
                
            # Wait for the next update interval
            time.sleep(interval_seconds)
                
    except KeyboardInterrupt:
        print("\nReal-time monitoring stopped by user.")
    except Exception as e:
        print(f"Error during real-time monitoring: {e}")

if __name__ == "__main__":
    # Test the functionality
    print("Testing Twelve Data API integration...")
    
    # Try different intervals
    intervals = ["1min", "1day"]
    for interval in intervals:
        print(f"\nFetching {interval} data for AAPL...")
        df = fetch_data("AAPL", interval=interval, count=10)
        print(f"Data timeframe: {df.index.min()} to {df.index.max()}")
        print(f"Number of data points: {len(df)}")
        print(df.head(3))
    
    # Test current price
    price, is_mock = get_latest_price("AAPL")
    print(f"\nLatest price for AAPL: ${price:.2f} {'(MOCK)' if is_mock else '(REAL)'}")
    
    def print_update(data):
         print(f"New data at {datetime.now()}: {data.iloc[0]['Close']}")
     
    get_realtime_updates("AAPL", callback_function=print_update, interval_seconds=60, max_updates=5)
