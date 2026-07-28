# Deriv Real-Time Analysis Tool - Development Prompt

## PROJECT OVERVIEW

Build a sophisticated **Deriv real-time analysis tool** using MERN stack that:
- Connects to Deriv WebSocket API for live market data
- Generates multi-indicator trading signals with confidence levels
- Analyzes volatility and digit patterns for night markets
- Provides backtesting framework and live monitoring dashboard
- Tracks trade history and win rates in real-time

**Client:** Trading professional who wants to analyze Deriv markets with automated signals  
**Timeline:** 2-3 weeks build + deploy  
**Total Investment:** 30,000 KES  
**Payment Model:** Progress-based (screenshots at 50% → 15K, final 15K at go-live)

---

## TECH STACK (MERN)

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (MongoDB Atlas or local)
- **Real-Time:** Deriv WebSocket API (wss://ws.derivws.com/websockets/v3)
- **Charting:** lightweight-charts library
- **State Management:** Context API or Redux (your choice)
- **Deployment:** Render (backend) + Vercel (frontend)

---

## CORE FEATURES (FROM CLIENT REQUIREMENTS)

### 1. **3-Minute Market Direction Prediction**
   - Input: Current market data (OHLC candles, momentum indicators)
   - Output: "Up", "Down", or "Sideways" for next 3 minutes
   - Logic: RSI + MACD + Moving Average alignment
   - Used to inform signal confidence

### 2. **Signal Generator (65-80% Target Win Rate)**
   - Combine 3+ indicators: direction, volatility, momentum
   - Output: Buy/Sell signal with confidence percentage (~65-75% initial)
   - Formula: `confidence = (direction_score + volatility_score + momentum_score) / 3 * 100`
   - Include: Stop Loss & Take Profit calculations (fixed % or volatility-based)

### 3. **Volatility Analysis (CVI, 25 VIX, VI00)**
   - Stream live volatility indices from Deriv
   - Display current levels
   - Use in signal logic: high volatility = lower confidence signal
   - Track volatility trends (increasing/decreasing/stable)

### 4. **Digit Analysis for Night Markets**
   - Analyze last N candles for digit patterns
   - Track frequency of each digit (0-9)
   - Calculate:
     - Over/Under: Sum of digits > or < threshold
     - Even/Odd: Count of even vs odd digits
     - Matches: Adjacent matching digits
   - Display pattern charts & probabilities

### 5. **Trade History & Win Rate Tracking**
   - Log every signal: timestamp, type (buy/sell), confidence, outcome
   - Calculate:
     - Win rate: (winning trades / total trades) × 100
     - Average profit/loss per trade
     - Consecutive wins/losses
   - Store in MongoDB with client email as reference

### 6. **Backtesting Framework**
   - Accept historical OHLC data (weeks/months)
   - Replay trades using signal logic
   - Generate backtest report: win rate, drawdown, profit factor
   - Compare live performance vs backtest

### 7. **Live Real-Time Dashboard**
   - Current market chart (3-min candles with volume)
   - Latest signal (Buy/Sell/Hold) with confidence %
   - Volatility gauge (CVI, VIX, VI00 current levels)
   - Trade history table (last 20 trades)
   - Win rate gauge (circular progress)
   - Digit patterns chart
   - Live P&L tracker

### 8. **Notifications**
   - Browser/in-app alerts for:
     - Strong signals (confidence > 75%)
     - Market pattern matches
     - Volatility spikes
   - Optional: Desktop notifications

---

## DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│         DERIV WEBSOCKET (wss://ws.derivws.com)          │
│  (Live tick data, market data, account info)            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │   NODE.JS BACKEND (Express)   │
         ├───────────────────────────────┤
         │ • Deriv API connector         │
         │ • Signal engine               │
         │ • Volatility analyzer         │
         │ • Digit analyzer              │
         │ • Backtesting engine          │
         │ • Trade logger                │
         │ • REST API endpoints          │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         ↓                               ↓
    ┌─────────┐                   ┌──────────────┐
    │ MongoDB │                   │ React Client │
    │ Storage │                   │   Dashboard  │
    └─────────┘                   └──────────────┘
              (Trade history,          (Live charts,
               signals, user data)     real-time UI)
```

---

## DATABASE SCHEMA (MongoDB)

### Collections:

**1. clients**
```javascript
{
  _id: ObjectId,
  email: "john@gmail.com",
  apiToken: "encrypted_token",
  createdAt: ISODate,
  markets: ["Synthetic Indices", "Volatility"]
}
```

**2. signals**
```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  timestamp: ISODate,
  type: "BUY" | "SELL" | "HOLD",
  confidence: 72.5,
  priceAtSignal: 1.2345,
  stopLoss: 1.2200,
  takeProfit: 1.2600,
  directionScore: 0.8,
  volatilityScore: 0.7,
  momentumScore: 0.75,
  status: "PENDING" | "WON" | "LOST",
  outcome: null | "WON" | "LOST",
  pnl: null | 150,
  notes: ""
}
```

**3. trades**
```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  signalId: ObjectId,
  entryPrice: 1.2345,
  exitPrice: 1.2500,
  pnl: 155,
  result: "WON" | "LOST",
  timestamp: ISODate,
  duration: "3m"
}
```

**4. backtests**
```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  dataRange: { from: ISODate, to: ISODate },
  totalTrades: 150,
  winCount: 108,
  lossCount: 42,
  winRate: 72,
  avgProfit: 145.50,
  avgLoss: -95.20,
  maxDrawdown: 8.5,
  report: "Full backtest summary...",
  createdAt: ISODate
}
```

**5. settings**
```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  slippagePercentage: 0.5,
  commissionPercentage: 0.1,
  maxTradesPerDay: 50,
  confirmThreshold: 65,  // Min confidence to generate signal
  riskPercentage: 2,     // Risk per trade
  timeframe: "3m"
}
```

---

## API ENDPOINTS (Express Backend)

### Authentication & Setup
- `POST /api/auth/connect` → Connect Deriv account (token + email)
- `GET /api/auth/verify` → Verify connection status

### Signals & Trading
- `GET /api/signals/latest` → Get current signal
- `GET /api/signals/history?limit=50` → Signal history
- `POST /api/signals/manual` → Create manual signal (for testing)

### Market Data
- `GET /api/market/chart?symbol=1s_VIX50&minutes=100` → Historical candles
- `GET /api/market/volatility` → Current volatility indices
- `GET /api/market/digits?market=Synthetic&candles=50` → Digit analysis

### Trades & History
- `GET /api/trades/history?limit=20` → Recent trades
- `GET /api/trades/stats` → Win rate, P&L, streaks
- `GET /api/trades/daily-summary` → Today's performance

### Backtesting
- `POST /api/backtest/run` → Run backtest on historical data
- `GET /api/backtest/report/:id` → Get backtest results

### Dashboard
- `GET /api/dashboard/snapshot` → All data for home screen
- `GET /api/dashboard/realtime` → Live updates (WebSocket preferred)

---

## FRONTEND COMPONENTS (React)

```
App/
├─ Layout/
│  ├─ Header.jsx (logo, user menu, status)
│  └─ Sidebar.jsx (navigation)
├─ Pages/
│  ├─ Dashboard.jsx (main trading view)
│  ├─ Charts.jsx (detailed chart view)
│  ├─ SignalHistory.jsx (past signals table)
│  ├─ TradeHistory.jsx (trades log)
│  ├─ Backtest.jsx (run & view backtests)
│  ├─ Settings.jsx (configure tool)
│  └─ Login.jsx (Deriv API setup)
├─ Components/
│  ├─ SignalBox.jsx (current signal display)
│  ├─ VolatilityGauge.jsx (CVI/VIX/VI00)
│  ├─ DigitAnalysis.jsx (patterns & probabilities)
│  ├─ WinRateGauge.jsx (circular progress)
│  ├─ Chart.jsx (lightweight-charts wrapper)
│  ├─ TradeTable.jsx (reusable table)
│  ├─ Notification.jsx (alerts & toasts)
│  └─ LoadingSpinner.jsx
├─ Context/
│  ├─ AuthContext.js (user/token state)
│  ├─ MarketContext.js (live data)
│  └─ TradeContext.js (trades & signals)
├─ services/
│  ├─ api.js (axios instance & endpoints)
│  ├─ chartService.js (chart utilities)
│  └─ socketService.js (WebSocket for live updates)
└─ styles/
   └─ global.css (Tailwind + custom)
```

---

## BACKEND CORE MODULES (Node.js)

```
backend/
├─ config/
│  ├─ db.js (MongoDB connection)
│  └─ deriv.js (Deriv API config)
├─ controllers/
│  ├─ authController.js
│  ├─ signalController.js
│  ├─ marketController.js
│  ├─ tradeController.js
│  └─ backtestController.js
├─ services/
│  ├─ derivService.js (WebSocket connection & data)
│  ├─ signalEngine.js (main signal logic)
│  ├─ volatilityAnalyzer.js (CVI/VIX tracking)
│  ├─ digitAnalyzer.js (digit patterns)
│  ├─ backtestEngine.js (historical replay)
│  └─ notificationService.js (alerts)
├─ models/
│  ├─ Client.js
│  ├─ Signal.js
│  ├─ Trade.js
│  ├─ Backtest.js
│  └─ Settings.js
├─ routes/
│  ├─ auth.js
│  ├─ signals.js
│  ├─ market.js
│  ├─ trades.js
│  └─ backtest.js
├─ middleware/
│  ├─ auth.js (verify token)
│  └─ errorHandler.js
├─ utils/
│  ├─ indicators.js (RSI, MACD, MA calculations)
│  ├─ formatters.js (date, number formatting)
│  └─ logger.js (console logging)
└─ server.js (main entry point)
```

---

## DERIV WEBSOCKET INTEGRATION

### Connection & Authentication
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3');

ws.onopen = () => {
  // Authenticate with client's API token
  ws.send(JSON.stringify({
    authorize: clientApiToken,
    req_id: 1
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Process incoming data
};
```

### Data Subscriptions (What to Stream)
```javascript
// 1. Tick data (every price update)
ws.send(JSON.stringify({
  ticks: "1s_VIX50",  // Get Volatility 50 ticks
  req_id: 2
}));

// 2. Candle data (OHLC)
ws.send(JSON.stringify({
  forget_all: "candles",
  req_id: 3
}));

// 3. Volatility indices
ws.send(JSON.stringify({
  ticks: "crix_crash_1000", // Synthetic Indices
  req_id: 4
}));

// 4. Account balance
ws.send(JSON.stringify({
  balance: 1,
  req_id: 5
}));
```

---

## SIGNAL ENGINE ALGORITHM

### Pseudocode for Signal Generation:

```javascript
async function generateSignal(marketData) {
  // 1. Calculate 3-min direction
  const directionScore = calculateDirection(marketData);
  // directionScore: 0.0 (DOWN) to 1.0 (UP)

  // 2. Calculate volatility impact
  const volatilityScore = calculateVolatility(marketData);
  // volatilityScore: 0.0 (high vol) to 1.0 (low vol)

  // 3. Calculate momentum
  const momentumScore = calculateMomentum(marketData);
  // momentumScore: 0.0 to 1.0

  // 4. Combine into confidence
  const confidence = (directionScore + volatilityScore + momentumScore) / 3 * 100;

  // 5. Generate signal
  let signal = "HOLD";
  if (directionScore > 0.6 && confidence > 65) signal = "BUY";
  if (directionScore < 0.4 && confidence > 65) signal = "SELL";

  // 6. Calculate SL & TP
  const atr = calculateATR(marketData);
  const stopLoss = currentPrice - atr;
  const takeProfit = currentPrice + (atr * 1.5);

  return {
    type: signal,
    confidence: Math.round(confidence),
    stopLoss,
    takeProfit,
    timestamp: new Date()
  };
}
```

### Indicator Implementations Needed:
- **RSI (14 period):** Momentum oscillator
- **MACD (12,26,9):** Trend & momentum
- **Moving Averages (20, 50 period):** Trend confirmation
- **ATR (14 period):** Volatility measurement
- **Digit Frequency:** Last N candles digit tracking

---

## BACKTESTING FRAMEWORK

### Process:
1. Accept historical data (weeks/months of OHLC)
2. Replay each candle through signal engine
3. Log each signal with entry & exit
4. Calculate metrics:
   - Win rate: (wins / total) × 100
   - Profit factor: (gross profit / gross loss)
   - Max drawdown: Largest peak-to-trough decline
   - Avg trade duration
5. Generate report with charts

### Output Report Example:
```javascript
{
  totalTrades: 150,
  wins: 108,
  losses: 42,
  winRate: 72,
  avgProfit: 145.50,
  avgLoss: -95.20,
  profitFactor: 2.15,
  maxDrawdown: 8.5,
  totalProfit: 5223.50,
  recommendations: "Win rate looks solid. Consider testing tighter SL to reduce losses."
}
```

---

## DEVELOPMENT PHASES

### Phase 1: Core Setup (Days 1-3)
- [ ] Deriv WebSocket connection working
- [ ] MongoDB schema & models set up
- [ ] Basic Express server with routes
- [ ] Client authentication (API token storage)
- [ ] Live market data streaming

**Deliverable:** Screenshots of backend logs showing live data flow

### Phase 2: Signal Engine (Days 4-7)
- [ ] Implement RSI, MACD, MA indicators
- [ ] Build signal generation logic
- [ ] Volatility analysis (CVI/VIX/VI00 tracking)
- [ ] Digit analysis engine
- [ ] Trade history logging
- [ ] API endpoints for signals/trades

**Deliverable:** Screenshots of signal generation with sample signals

### Phase 3: Frontend Dashboard (Days 8-14)
- [ ] React app setup with Vite
- [ ] Live chart (lightweight-charts)
- [ ] Signal display box
- [ ] Volatility gauge
- [ ] Trade history table
- [ ] Win rate display
- [ ] Digit analysis charts

**Deliverable:** Screenshots of live dashboard with real data

### Phase 4: Backtesting & Polish (Days 14-18)
- [ ] Backtesting engine
- [ ] Backtest report generation
- [ ] Settings/configuration UI
- [ ] Notifications system
- [ ] Error handling & logging
- [ ] Deployment setup

**Deliverable:** Final system deployed & live

---

## IMPORTANT NOTES

### Security
- Never log API tokens to console
- Encrypt tokens in database
- Validate all client inputs
- Use HTTPS in production
- Implement rate limiting

### Performance
- WebSocket should stay open, not reconnect constantly
- Cache indicator calculations (5-min cache)
- Use indexes in MongoDB for frequent queries
- Paginate trade history (50 per page)

### Real vs Backtest
- Live system will have slippage & commission (not in backtest)
- Live win rate will be lower than backtest (set expectations)
- Include 0.5-1% slippage in calculations

### Client Monitoring
- They will monitor in real-time after go-live
- No ongoing involvement needed from you
- Provide clear documentation on how to use dashboard
- Include troubleshooting guide

---

## DEPENDENCIES YOU'LL NEED

### Backend
```
express, mongoose, ws, axios, dotenv, bcryptjs, jsonwebtoken,
cors, helmet, body-parser, lodash, date-fns
```

### Frontend
```
react, vite, tailwindcss, axios, react-router-dom, 
lightweight-charts, recharts (optional for backtesting charts)
```

---

## DEPLOYMENT TARGETS

- **Backend:** Render.com (free tier available)
- **Frontend:** Vercel (free tier)
- **Database:** MongoDB Atlas (free tier 512MB)
- **Domain:** Optional (client can use Vercel default subdomain)

---

## COMMUNICATION WITH CLIENT

When you reach 50% progress:
1. Take screenshot of:
   - Backend logs showing live Deriv data connection
   - Signal generation console output
   - Sample signals with timestamps & confidence
2. Send screenshot + brief message:
   ```
   "Hi, reached 50% progress! System is now:
   ✓ Connected to Deriv WebSocket
   ✓ Streaming live market data
   ✓ Generating signals with 65%+ confidence
   ✓ Logging trades to database
   
   Remaining: Frontend dashboard, backtesting, final polish
   
   Sending payment link for first 15K now..."
   ```
3. After they confirm payment → Continue to completion

---

## START HERE

When you paste this into Claude Code, ask it to:

1. **First:** Set up Express server with Deriv WebSocket connection
   - Create backend folder structure
   - Set up MongoDB connection
   - Test live data streaming from Deriv
   
2. **Then:** Build the signal engine
   - Implement indicators (RSI, MACD, MA)
   - Create signal generation function
   - Start logging to MongoDB

3. **After:** Build React frontend
   - Create dashboard layout
   - Connect to backend API
   - Display real-time signals

4. **Finally:** Add backtesting + polish

---

**Ready to build? Paste this entire prompt into Claude Code and ask:** 

"Build the Deriv Analysis Tool following this complete specification. Start with Phase 1 (Express server + Deriv WebSocket connection). Show me working code with clear file structure."

Good luck! 🚀
