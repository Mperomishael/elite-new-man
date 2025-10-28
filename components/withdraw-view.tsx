// ...existing code...
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Bitcoin, Wallet, AlertCircle, Check } from "lucide-react"
import { createWithdrawalRequest } from "@/lib/admin-service"

interface WithdrawViewProps {
  userId: string
  username: string
  availableBalance: number
}

export function WithdrawView({ userId, username, availableBalance }: WithdrawViewProps) {
  const [amount, setAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC")
  const [walletAddress, setWalletAddress] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"crypto" | "bank">("crypto")

  // Bank withdrawal fields
  const [bankCountry, setBankCountry] = useState<string>("United States")
  const [bankName, setBankName] = useState<string>("")
  const [accountNumber, setAccountNumber] = useState<string>("")
  const [accountHolderName, setAccountHolderName] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const MIN_WITHDRAWAL = 100
  const quickPercentages = [25, 50, 75, 100]

  // Minimal hard-coded mapping of countries -> banks (expandable)
 const BANKS: Record<string, string[]> = useMemo(
  () => ({
    // 🌎 NORTH AMERICA
    "United States": [
      "Bank of America", "Chase", "Wells Fargo", "CitiBank", "US Bank", "PNC Bank",
      "Capital One", "TD Bank", "Truist", "Goldman Sachs", "Morgan Stanley"
    ],
    Canada: [
      "Royal Bank of Canada", "TD Canada Trust", "Scotiabank", "BMO", "CIBC", "National Bank of Canada"
    ],
    Mexico: [
      "BBVA Mexico", "Banorte", "Santander Mexico", "HSBC Mexico", "Inbursa", "Banco del Bajío"
    ],
    "Dominican Republic": [
      "Banco Popular Dominicano", "BanReservas", "Scotiabank RD", "BHD León"
    ],
    Jamaica: [
      "National Commercial Bank", "Scotiabank Jamaica", "First Global Bank", "Sagicor Bank"
    ],
    Bahamas: [
      "Commonwealth Bank", "RBC Royal Bank Bahamas", "Scotiabank Bahamas", "Bank of The Bahamas"
    ],
    "Trinidad and Tobago": [
      "Republic Bank", "First Citizens", "Scotiabank TT", "RBC Royal Bank TT"
    ],

    // 🌍 EUROPE
    "United Kingdom": [
      "HSBC UK", "Barclays", "Lloyds", "NatWest", "Santander UK", "TSB", "Monzo", "Revolut", "Starling Bank"
    ],
    Ireland: [
      "AIB", "Bank of Ireland", "Permanent TSB", "Ulster Bank"
    ],
    Germany: [
      "Deutsche Bank", "Commerzbank", "KfW", "Postbank", "HypoVereinsbank"
    ],
    France: [
      "BNP Paribas", "Société Générale", "Crédit Agricole", "Crédit Mutuel", "La Banque Postale"
    ],
    Spain: [
      "Banco Santander", "BBVA", "CaixaBank", "Bankinter", "Sabadell"
    ],
    Italy: [
      "UniCredit", "Intesa Sanpaolo", "Banco BPM", "BPER Banca", "Monte dei Paschi di Siena"
    ],
    Netherlands: [
      "ING", "Rabobank", "ABN AMRO", "De Volksbank"
    ],
    Switzerland: [
      "UBS", "Credit Suisse", "Raiffeisen", "Julius Baer"
    ],
    Sweden: [
      "SEB", "Swedbank", "Nordea", "Handelsbanken"
    ],
    Norway: [
      "DNB", "SpareBank 1", "Nordea Norge", "Handelsbanken Norge"
    ],
    Denmark: [
      "Danske Bank", "Nordea Danmark", "Jyske Bank", "Sydbank"
    ],
    Finland: [
      "Nordea Finland", "OP Financial Group", "Säästöpankki", "Handelsbanken Finland"
    ],
    Poland: [
      "PKO Bank Polski", "mBank", "Santander Polska", "ING Bank Śląski"
    ],
    CzechRepublic: [
      "Česká spořitelna", "Komerční banka", "ČSOB", "Moneta Money Bank"
    ],
    Austria: [
      "Erste Bank", "Raiffeisen Bank", "BAWAG P.S.K.", "UniCredit Austria"
    ],
    Portugal: [
      "Caixa Geral de Depósitos", "Millennium BCP", "Novo Banco", "Santander Portugal"
    ],
    Greece: [
      "National Bank of Greece", "Alpha Bank", "Eurobank", "Piraeus Bank"
    ],
    Belgium: [
      "BNP Paribas Fortis", "KBC", "ING Belgium", "Belfius"
    ],
    Romania: [
      "Banca Transilvania", "BRD", "ING Romania", "Raiffeisen Romania"
    ],
    Hungary: [
      "OTP Bank", "K&H Bank", "Erste Bank Hungary", "Raiffeisen Hungary"
    ],
    Croatia: [
      "Zagrebačka Banka", "PBZ", "Erste Bank Croatia", "Addiko Bank"
    ],
    Bulgaria: [
      "UniCredit Bulbank", "DSK Bank", "Postbank Bulgaria", "Raiffeisen Bulgaria"
    ],
    Ukraine: [
      "PrivatBank", "Oschadbank", "Raiffeisen Bank Ukraine", "Ukreximbank"
    ],
    Russia: [
      "Sberbank", "VTB", "Gazprombank", "Alfa Bank"
    ],
    Belarus: [
      "Belarusbank", "Belagroprombank", "Belinvestbank", "Priorbank"
    ],

    // 🌏 ASIA
    China: [
      "ICBC", "China Construction Bank", "Bank of China", "Agricultural Bank of China", "China Merchants Bank"
    ],
    Japan: [
      "Mizuho", "MUFG", "Sumitomo Mitsui", "Resona Bank", "Japan Post Bank"
    ],
    India: [
      "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank"
    ],
    Pakistan: [
      "Habib Bank", "MCB Bank", "United Bank Limited", "Allied Bank"
    ],
    Bangladesh: [
      "Sonali Bank", "BRAC Bank", "Dutch-Bangla Bank", "Islami Bank Bangladesh"
    ],
    Singapore: [
      "DBS Bank", "OCBC Bank", "UOB", "CIMB Singapore", "Standard Chartered Singapore"
    ],
    Malaysia: [
      "Maybank", "CIMB Bank", "Public Bank", "RHB Bank", "Hong Leong Bank"
    ],
    Indonesia: [
      "Bank Mandiri", "BCA", "BRI", "BNI"
    ],
    Thailand: [
      "Bangkok Bank", "Kasikornbank", "Siam Commercial Bank", "Krung Thai Bank"
    ],
    Vietnam: [
      "Vietcombank", "BIDV", "Techcombank", "VietinBank"
    ],
    Philippines: [
      "BDO Unibank", "Metrobank", "Land Bank", "Security Bank", "UnionBank"
    ],
    Nepal: [
      "Nabil Bank", "Nepal Investment Bank", "Standard Chartered Nepal", "NIC Asia Bank"
    ],
    SriLanka: [
      "Bank of Ceylon", "People’s Bank", "Commercial Bank", "Hatton National Bank"
    ],
    UAE: [
      "Emirates NBD", "Abu Dhabi Commercial Bank", "Mashreq", "First Abu Dhabi Bank"
    ],
    "Saudi Arabia": [
      "Al Rajhi Bank", "Samba", "NCB", "Riyad Bank"
    ],
    Qatar: [
      "Qatar National Bank", "Doha Bank", "Commercial Bank of Qatar", "Qatar Islamic Bank"
    ],
    Turkey: [
      "Ziraat Bankası", "İşbank", "Garanti BBVA", "Akbank", "Halkbank"
    ],
    Israel: [
      "Bank Hapoalim", "Bank Leumi", "Mizrahi Tefahot", "Discount Bank"
    ],
    Lebanon: [
      "Bank Audi", "Blom Bank", "Byblos Bank", "Fransabank"
    ],
    Jordan: [
      "Arab Bank", "Cairo Amman Bank", "Housing Bank", "Jordan Kuwait Bank"
    ],
    Iraq: [
      "Rafidain Bank", "Rasheed Bank", "Trade Bank of Iraq", "Gulf Commercial Bank"
    ],
    Iran: [
      "Bank Melli", "Bank Sepah", "Bank Tejarat", "Bank Mellat"
    ],

    // 🌍 AFRICA
    Nigeria: [
      "Zenith Bank", "GTBank", "First Bank", "UBA", "Access Bank", "Fidelity Bank", "Sterling Bank", "Union Bank"
    ],
    Ghana: [
      "GCB Bank", "Ecobank Ghana", "Stanbic Bank Ghana", "Fidelity Bank Ghana"
    ],
    Kenya: [
      "Equity Bank", "KCB Bank", "Co-operative Bank", "NCBA Bank", "Stanbic Bank Kenya"
    ],
    SouthAfrica: [
      "Standard Bank", "FNB", "Nedbank", "Absa", "Capitec Bank", "TymeBank"
    ],
    Liberia: [
      "LBDI", "Ecobank Liberia", "UBA Liberia", "Global Bank Liberia", "GN Bank"
    ],
    SierraLeone: [
      "Rokel Commercial Bank", "Sierra Leone Commercial Bank", "UBA Sierra Leone", "Ecobank Sierra Leone"
    ],
    Cameroon: [
      "Afriland First Bank", "BICEC", "Ecobank Cameroon", "UBA Cameroon"
    ],
    IvoryCoast: [
      "SGBCI", "Ecobank Côte d’Ivoire", "UBA Côte d’Ivoire", "NSIA Banque"
    ],
    Senegal: [
      "Société Générale Sénégal", "Ecobank Sénégal", "CBAO", "UBA Sénégal"
    ],
    Egypt: [
      "National Bank of Egypt", "Banque Misr", "CIB Egypt", "QNB Alahli"
    ],
    Morocco: [
      "Attijariwafa Bank", "BMCE Bank", "Banque Populaire", "CIH Bank"
    ],
    Ethiopia: [
      "Commercial Bank of Ethiopia", "Awash Bank", "Dashen Bank", "Bank of Abyssinia"
    ],
    Tanzania: [
      "CRDB Bank", "NMB Bank", "Stanbic Tanzania", "Exim Bank Tanzania"
    ],
    Uganda: [
      "Stanbic Uganda", "Centenary Bank", "DFCU Bank", "Absa Uganda"
    ],
    Botswana: [
      "First Capital Bank", "Stanbic Bank Botswana", "Absa Botswana", "FNB Botswana"
    ],
    Namibia: [
      "Bank Windhoek", "FNB Namibia", "Standard Bank Namibia", "Nedbank Namibia"
    ],
    Zimbabwe: [
      "CBZ Bank", "Stanbic Zimbabwe", "FBC Bank", "ZB Bank"
    ],
    Malawi: [
      "National Bank of Malawi", "FDH Bank", "Standard Bank Malawi", "NBS Bank"
    ],

    // 🌎 SOUTH AMERICA
    Brazil: [
      "Itaú", "Bradesco", "Banco do Brasil", "Santander Brasil", "Caixa Econômica Federal"
    ],
    Argentina: [
      "Banco Nación", "BBVA Argentina", "Banco Galicia", "Banco Santander Río"
    ],
    Chile: [
      "Banco de Chile", "BancoEstado", "Santander Chile", "BCI"
    ],
    Colombia: [
      "Bancolombia", "Davivienda", "Banco de Bogotá", "Banco Popular"
    ],
    Peru: [
      "Banco de Crédito del Perú", "Interbank", "BBVA Perú", "Scotiabank Perú"
    ],
    Ecuador: [
      "Banco Pichincha", "Banco de Guayaquil", "Produbanco", "Banco Internacional"
    ],
    Uruguay: [
      "Banco República", "Santander Uruguay", "BBVA Uruguay", "Scotiabank Uruguay"
    ],
    Paraguay: [
      "Banco Itaú Paraguay", "Banco Continental", "Visión Banco", "Banco Regional"
    ],
    Bolivia: [
      "Banco Mercantil Santa Cruz", "Banco BISA", "Banco Unión", "Banco Ganadero"
    ],
    Venezuela: [
      "Banco de Venezuela", "BBVA Provincial", "Banesco", "Banco Mercantil"
    ],

    // 🌏 OCEANIA
    Australia: [
      "Commonwealth Bank", "ANZ", "NAB", "Westpac", "Macquarie Bank"
    ],
    NewZealand: [
      "ANZ NZ", "ASB Bank", "BNZ", "Westpac NZ", "Kiwibank"
    ],
    Fiji: [
      "Bank of South Pacific", "ANZ Fiji", "Westpac Fiji"
    ],
    Samoa: [
      "ANZ Samoa", "National Bank of Samoa", "Samoa Commercial Bank"
    ],
  }),
  [],
)


  // Ensure we have a default bankName for the initial country
  useEffect(() => {
    if (!bankName && BANKS[bankCountry] && BANKS[bankCountry].length) {
      setBankName(BANKS[bankCountry][0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePercentage = (percentage: number) => {
    const withdrawAmount = ((availableBalance * percentage) / 100).toFixed(2)
    setAmount(withdrawAmount)
  }

  const handleWithdraw = async () => {
    const parsedAmount = Number.parseFloat(amount || "0")

    if (parsedAmount <= 0 || parsedAmount > availableBalance || parsedAmount < MIN_WITHDRAWAL) {
      setErrorMessage(
        parsedAmount < MIN_WITHDRAWAL
          ? `Minimum withdrawal is $${MIN_WITHDRAWAL}.`
          : parsedAmount > availableBalance
          ? "Withdrawal amount exceeds available balance."
          : "Please enter a valid amount."
      )
      return
    }

    // Branch by withdrawal method
    if (withdrawMethod === "crypto") {
      if (!walletAddress) {
        setErrorMessage("Please add a wallet address.")
        return
      }
    } else {
      // bank withdraw validations
      if (!bankCountry || !bankName) {
        setErrorMessage("Please select a country and a bank.")
        return
      }
      if (!accountNumber || accountNumber.trim().length < 4) {
        setErrorMessage("Please enter a valid account number.")
        return
      }
      if (!accountHolderName || accountHolderName.trim().length < 2) {
        setErrorMessage("Please enter the account holder's name.")
        return
      }
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      // For bank withdrawals, encode the bank details into the "walletAddress" field so backend can differentiate.
      const destination =
        withdrawMethod === "crypto"
          ? walletAddress
          : `BANK|${bankCountry}|${bankName}|${accountHolderName}|${accountNumber}`

      const currency = withdrawMethod === "crypto" ? selectedCrypto : "BANK"

      const result = await createWithdrawalRequest(userId, username, parsedAmount, currency, destination)

      if (result && result.success) {
        setIsSubmitted(true)
      } else {
        setErrorMessage(result?.message || "Processed successfully.")
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-slate-300 text-sm">
              Your withdrawal request for ${amount} has been submitted. You will be
              notified once it's processed.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setAmount("")
              setWalletAddress("")
              setBankCountry("United States")
              setBankName("")
              setAccountNumber("")
              setAccountHolderName("")
              setWithdrawMethod("crypto")
              setSelectedCrypto("BTC")
              setErrorMessage("")
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Make Another Withdrawal
          </button>
        </div>
      </div>
    )
  }

  const parsedAmountForWarning = Number.parseFloat(amount || "0")
  const formDisabled = isLoading || availableBalance < MIN_WITHDRAWAL
  // determine if submit button should be disabled depending on method
  const isCryptoReady = withdrawMethod === "crypto" ? !!amount && !!walletAddress && parsedAmountForWarning >= MIN_WITHDRAWAL && parsedAmountForWarning <= availableBalance : true
  const isBankReady = withdrawMethod === "bank" ? !!amount && !!bankName && !!bankCountry && !!accountNumber && !!accountHolderName && parsedAmountForWarning >= MIN_WITHDRAWAL && parsedAmountForWarning <= availableBalance : true
  const isSubmitDisabled = isLoading || availableBalance < MIN_WITHDRAWAL || !(withdrawMethod === "crypto" ? isCryptoReady : isBankReady)

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">Withdraw Funds</h2>
        <p className="text-slate-400 text-xs md:text-sm">Transfer money from your account</p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs md:text-sm mb-1">Available Balance</p>
            <p className="text-2xl md:text-3xl font-bold">${availableBalance?.toFixed(2)}</p>
          </div>
          <Wallet className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
        </div>
      </div>

      {/* Balance too low notice */}
      {availableBalance < MIN_WITHDRAWAL && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-yellow-300">
            Your available balance is below the minimum withdrawal amount of ${MIN_WITHDRAWAL}. Add funds to withdraw.
          </p>
        </div>
      )}

      {/* Withdrawal Method Selection */}
      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium">Withdrawal Method</label>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            onClick={() => setWithdrawMethod("crypto")}
            disabled={formDisabled}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${withdrawMethod === "crypto"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              <div className="text-left">
                <p className="font-bold text-sm md:text-base">Crypto</p>
                <p className="text-xs text-slate-400">BTC / USDT</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setWithdrawMethod("bank")}
            disabled={formDisabled}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${withdrawMethod === "bank"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-bold">🏦</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm md:text-base">Bank</p>
                <p className="text-xs text-slate-400">International transfer</p>
              </div>
            </div>
          </button>
        </div>

        {/* Crypto options when selected */}
        {withdrawMethod === "crypto" && (
          <div className="grid grid-cols-2 gap-2 md:gap-3 mt-3">
            <button
              onClick={() => setSelectedCrypto("BTC")}
              disabled={formDisabled}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "BTC"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Bitcoin className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                <div className="text-left">
                  <p className="font-bold text-sm md:text-base">Bitcoin</p>
                  <p className="text-xs text-slate-400">BTC</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setSelectedCrypto("USDT")}
              disabled={formDisabled}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "USDT"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-bold">₮</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm md:text-base">Tether</p>
                  <p className="text-xs text-slate-400">USDT</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">Withdrawal Amount (USD)</label>
        <p className="text-xs text-amber-400 mb-3">Minimum withdrawal: ${MIN_WITHDRAWAL}</p>
        <div className="relative mb-3 md:mb-4">
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold text-slate-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={MIN_WITHDRAWAL}
            max={availableBalance}
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 md:pl-10 pr-4 py-3 md:py-4 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          />
        </div>

        {/* Quick Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentage(percentage)}
              disabled={formDisabled}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs md:text-sm font-medium transition-colors active:scale-95 disabled:opacity-60"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {/* Destination Inputs: Crypto wallet or Bank details */}
      {withdrawMethod === "crypto" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <label className="text-xs md:text-sm text-slate-400 mb-2 block">{selectedCrypto} Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder={`Enter your ${selectedCrypto} wallet address`}
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-3">
          <label className="text-xs md:text-sm text-slate-400 mb-2 block">Bank Details</label>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={bankCountry}
              onChange={(e) => {
                const country = e.target.value
                setBankCountry(country)
                const banks = BANKS[country] || []
                setBankName(banks[0] || "")
              }}
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              {Object.keys(BANKS).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={formDisabled || !(BANKS[bankCountry] && BANKS[bankCountry].length)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              {(BANKS[bankCountry] || []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="Account holder name"
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none"
          />

          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account number / IBAN"
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none"
          />
        </div>
      )}

      {/* Warning */}
      {amount && (parsedAmountForWarning > availableBalance || parsedAmountForWarning < MIN_WITHDRAWAL) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">
            {parsedAmountForWarning > availableBalance
              ? "Withdrawal amount exceeds available balance"
              : `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`}
          </p>
        </div>
      )}

      {/* Inline error message */}
      {errorMessage && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 md:p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={isSubmitDisabled}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 transform active:scale-95 text-sm md:text-base disabled:opacity-60"
      >
        {isLoading ? "Submitting..." : `Request Withdrawal $${amount || "0.00"}`}
      </button>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 md:p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="space-y-1 text-xs">
    
            <li>• Processing typically takes 15-60 minutes</li>
            <li>• Ensure your wallet address is correct</li>
            <li>• You will be notified once processed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
// ...existing code...
