"use client";

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseUnits, formatUnits, JsonRpcSigner, Eip1193Provider } from 'ethers';
import { useExchangeRate, convertPHPtoUSD, formatUSDC } from '@/hooks/useExchangeRate';
import EthereumProvider from '@walletconnect/ethereum-provider';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  bookingId: string;
  customerEmail: string;
  customerName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Stablecoin Contract ABI (ERC-20 standard - works for USDC, BUSD, etc.)
const STABLECOIN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// Stablecoin Contract Addresses on different chains
const STABLECOIN_CONTRACTS = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum Mainnet USDC
  bsc: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BSC BUSD (Binance USD - most popular on BSC)
};

const CHAIN_INFO = {
  ethereum: { name: 'Ethereum', chainId: '0x1', chainIdNum: 1, token: 'USDC' },
  bsc: { name: 'BSC (BNB Chain)', chainId: '0x38', chainIdNum: 56, token: 'BUSD' },
};

// WalletConnect Project ID - get one at https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export function CryptoPaymentModal({
  isOpen,
  onClose,
  amount,
  bookingId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}: CryptoPaymentModalProps) {
  const [selectedChain, setSelectedChain] = useState<keyof typeof STABLECOIN_CONTRACTS>('ethereum');
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [amountUSDC, setAmountUSDC] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'loading' | 'chain-select' | 'wallet-select' | 'confirm' | 'processing' | 'success'>('loading');
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'trustwallet' | 'walletconnect' | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [wcProvider, setWcProvider] = useState<EthereumProvider | null>(null);

  const recipientAddress = process.env.NEXT_PUBLIC_METAMASK_WALLET_ADDRESS || '';

  // For displaying PHP amount
  const amountPHP = amount;

  // Validation: Ensure amount prop is valid
  useEffect(() => {
    console.log('💰 CryptoPaymentModal received amount prop:', amount);
    if (isOpen && (!amount || amount <= 0)) {
      console.error('❌ CRITICAL: Modal opened with invalid amount:', amount);
      setError(`Invalid payment amount received: ${amount}. Please close and try again.`);
    }
  }, [isOpen, amount]);

  // Get real-time exchange rate
  const { rate: exchangeRate, isLoading: rateLoading, lastUpdated } = useExchangeRate();

  // Convert PHP to USD using real-time exchange rate + 6% fee for conversion costs
  useEffect(() => {
    console.log('💱 Exchange rate calculation effect triggered');
    console.log('  rateLoading:', rateLoading);
    console.log('  amount (PHP):', amount);
    console.log('  exchangeRate:', exchangeRate);

    if (!rateLoading) {
      const baseUSD = convertPHPtoUSD(amount, exchangeRate);
      console.log('  baseUSD (no fee):', baseUSD);

      // Add 6% to cover crypto conversion/cashout fees
      const feePercentage = Number(process.env.NEXT_PUBLIC_USDC_FEE_PERCENTAGE) || 6;
      const usdWithFee = baseUSD * (1 + feePercentage / 100);
      console.log('  feePercentage:', feePercentage);
      console.log('  usdWithFee:', usdWithFee);

      const formatted = formatUSDC(usdWithFee);
      console.log('  formatted USDC:', formatted);

      setAmountUSD(usdWithFee);
      setAmountUSDC(formatted);

      console.log('✅ Amount calculation complete:', formatted, 'USDC');
    } else {
      console.log('⏳ Still loading exchange rate, skipping calculation');
    }
  }, [amount, exchangeRate, rateLoading]);

  // Add delay when modal opens to ensure exchange rate loads
  useEffect(() => {
    if (isOpen && step === 'loading') {
      console.log('🔄 Modal opened, starting continuous exchange rate check...');
      console.log('Initial state:', { rateLoading, amountUSDC, exchangeRate, amount });

      let attempts = 0;
      const maxAttempts = 20; // Check for up to 20 seconds (20 checks * 1 second)

      const checkInterval = setInterval(() => {
        attempts++;
        console.log(`📊 Check #${attempts}/${maxAttempts}:`, {
          rateLoading,
          amountUSDC,
          exchangeRate,
          parsed: amountUSDC ? Number.parseFloat(amountUSDC) : 0
        });

        // Success condition: rate loaded and amount calculated
        if (!rateLoading && amountUSDC && Number.parseFloat(amountUSDC) > 0 && !isNaN(Number.parseFloat(amountUSDC))) {
          console.log('✅✅✅ SUCCESS! Amount loaded:', amountUSDC, 'USDC');
          console.log('✅ Exchange rate:', exchangeRate);
          console.log('✅ Base USD:', amountUSD);
          console.log('✅ PHP amount:', amount);
          clearInterval(checkInterval);
          setError(''); // Clear any previous errors
          setStep('chain-select'); // Go to network selection first
          return;
        }

        // Timeout condition
        if (attempts >= maxAttempts) {
          console.error('❌❌❌ TIMEOUT after 20 seconds!');
          console.error('Final state:', { rateLoading, amountUSDC, exchangeRate, amountUSD });
          clearInterval(checkInterval);

          // If we at least have an exchange rate (even if fallback), allow proceeding with warning
          if (exchangeRate && exchangeRate > 0 && amountUSDC && Number.parseFloat(amountUSDC) > 0) {
            console.log('⚠️ Using fallback/cached exchange rate:', exchangeRate);
            setError('Using cached exchange rate. The amount may not be 100% up-to-date.');
            setStep('chain-select'); // Go to network selection first
          } else {
            setError('Exchange rate loading timed out and no fallback available. Please close and try again, or check your internet connection.');
            setStep('chain-select'); // Go to network selection first
          }
          return;
        }

        // Still loading...
        console.log(`⏳ Still loading... (${maxAttempts - attempts} seconds remaining)`);
      }, 1000); // Check every 1 second

      return () => {
        console.log('🧹 Cleaning up interval check');
        clearInterval(checkInterval);
      };
    }
  }, [isOpen, step, amountUSDC, rateLoading, exchangeRate, amount, amountUSD]);

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setTimeout(() => {
        setStep('loading');
        setError('');
        setSelectedWallet(null);
        setWalletAddress('');
        setTxHash('');
        setWcProvider(null);
      }, 300); // Small delay to avoid flash
    }
  }, [isOpen]);

  const connectWallet = async (walletType: 'metamask' | 'trustwallet' | 'walletconnect') => {
    try {
      setError('');
      setSelectedWallet(walletType);

      // WalletConnect flow
      if (walletType === 'walletconnect') {
        try {
          const provider = await EthereumProvider.init({
            projectId: WALLETCONNECT_PROJECT_ID,
            chains: [CHAIN_INFO[selectedChain].chainIdNum],
            optionalChains: [1, 56], // Ethereum and BSC
            showQrModal: true,
            metadata: {
              name: 'Palm Riders Siargao',
              description: 'Scooter Rental Payment',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://palmriders.com',
              icons: ['https://palmriders.com/logo.png']
            }
          });

          await provider.connect();

          const accounts = provider.accounts;
          if (accounts.length === 0) {
            throw new Error('No accounts found. Please try again.');
          }

          setWcProvider(provider);
          setWalletAddress(accounts[0]);
          setStep('confirm');
          return;
        } catch (wcError) {
          console.error('WalletConnect error:', wcError);
          if (wcError instanceof Error && wcError.message.includes('User rejected')) {
            setError('Connection was cancelled. Please try again.');
          } else {
            setError('Failed to connect via WalletConnect. Please try again.');
          }
          setStep('wallet-select');
          return;
        }
      }

      // Browser extension wallet flow (MetaMask, Trust Wallet)
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or Trust Wallet extension, or use WalletConnect for mobile.');
      }

      let provider;

      // Find the specific wallet provider
      if (window.ethereum.providers?.length) {
        // Multiple wallets installed
        let walletProvider;

        if (walletType === 'metamask') {
          walletProvider = window.ethereum.providers.find((p) => p.isMetaMask && !p.isTrust);
        } else if (walletType === 'trustwallet') {
          walletProvider = window.ethereum.providers.find((p) => p.isTrust);
        }

        if (!walletProvider) {
          walletProvider = window.ethereum;
        }

        provider = new BrowserProvider(walletProvider);
      } else {
        provider = new BrowserProvider(window.ethereum);
      }

      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      setWalletAddress(accounts[0]);
      setStep('confirm');

    } catch (err) {
      console.error('Wallet connection error:', err);

      if (err instanceof Error) {
        if (err.message.includes('user rejected') || err.message.includes('User rejected') || err.message.includes('denied')) {
          setError('You cancelled the wallet connection. Please try again.');
          setStep('wallet-select');
          return;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      onError(errorMessage);
      setStep('wallet-select');
    }
  };

  const switchChain = async (chain: keyof typeof STABLECOIN_CONTRACTS) => {
    try {
      // For WalletConnect
      if (selectedWallet === 'walletconnect' && wcProvider) {
        try {
          await wcProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_INFO[chain].chainId }],
          });
          setSelectedChain(chain);
          return true;
        } catch (wcError) {
          console.error('WalletConnect chain switch error:', wcError);
          setError(`Please switch to ${CHAIN_INFO[chain].name} in your wallet app`);
          return false;
        }
      }

      // For browser extensions
      if (!window.ethereum) {
        throw new Error('Wallet is not installed');
      }

      let ethereumProvider;
      if (window.ethereum.providers?.length) {
        let walletProvider;

        if (selectedWallet === 'metamask') {
          walletProvider = window.ethereum.providers.find((p) => p.isMetaMask && !p.isTrust);
        } else if (selectedWallet === 'trustwallet') {
          walletProvider = window.ethereum.providers.find((p) => p.isTrust);
        }

        if (!walletProvider) {
          throw new Error(`${selectedWallet || 'Wallet'} not found`);
        }
        ethereumProvider = walletProvider;
      } else {
        ethereumProvider = window.ethereum;
      }

      const chainId = CHAIN_INFO[chain].chainId;
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      setSelectedChain(chain);
      return true;
    } catch (err: unknown) {
      const error = err as { code?: number };
      if (error.code === 4902) {
        setError(`Please add ${CHAIN_INFO[chain].name} network to your wallet`);
      } else {
        setError(`Failed to switch to ${CHAIN_INFO[chain].name}`);
      }
      return false;
    }
  };

  const sendUSDC = async () => {
    console.log('\n\n');
    console.log('🚀🚀🚀 sendUSDC() CALLED 🚀🚀🚀');
    console.log('==========================================');
    console.log('CURRENT STATE AT FUNCTION START:');
    console.log('==========================================');
    console.log('Props:');
    console.log('  amount (PHP):', amount);
    console.log('  bookingId:', bookingId);
    console.log('  customerEmail:', customerEmail);
    console.log('  customerName:', customerName);
    console.log('\nState Variables:');
    console.log('  amountPHP:', amountPHP);
    console.log('  amountUSD:', amountUSD);
    console.log('  amountUSDC:', amountUSDC);
    console.log('  exchangeRate:', exchangeRate);
    console.log('  rateLoading:', rateLoading);
    console.log('  lastUpdated:', lastUpdated);
    console.log('  selectedChain:', selectedChain);
    console.log('  selectedWallet:', selectedWallet);
    console.log('  walletAddress:', walletAddress);
    console.log('==========================================\n');

    try {
      setIsProcessing(true);
      setStep('processing');
      setError('');

      let provider: BrowserProvider | null = null;
      let signer: JsonRpcSigner | null = null;

      // WalletConnect flow
      if (selectedWallet === 'walletconnect' && wcProvider) {
        // Switch chain if needed
        try {
          await wcProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_INFO[selectedChain].chainId }],
          });
        } catch (wcError) {
          setError(`Please switch to ${CHAIN_INFO[selectedChain].name} in your wallet app`);
          setStep('confirm');
          setIsProcessing(false);
          return;
        }
        provider = new BrowserProvider(wcProvider as Eip1193Provider);
        signer = await provider.getSigner();
      } else {
        if (!window.ethereum) {
          throw new Error('MetaMask not found');
        }

        // IMPORTANT: Switch to correct network FIRST
        console.log(`Switching to ${CHAIN_INFO[selectedChain].name}...`);
        const switched = await switchChain(selectedChain);
        if (!switched) {
          throw new Error(`Please switch to ${CHAIN_INFO[selectedChain].name} network in MetaMask`);
        }

        // Wait a bit for network to fully switch
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Use selected wallet specifically (in case multiple wallets are installed)
        let ethereumProvider;
        if (window.ethereum.providers?.length) {
          let walletProvider;

          if (selectedWallet === 'metamask') {
            walletProvider = window.ethereum.providers.find((p) => p.isMetaMask && !p.isTrust);
          } else if (selectedWallet === 'trustwallet') {
            walletProvider = window.ethereum.providers.find((p) => p.isTrust);
          }

          if (!walletProvider) {
            throw new Error(`${selectedWallet || 'Wallet'} not found`);
          }
          ethereumProvider = walletProvider;
        } else {
          ethereumProvider = window.ethereum;
        }

        provider = new BrowserProvider(ethereumProvider);
        signer = await provider.getSigner();
      }

      // Verify we're on the correct network
      const network = await provider.getNetwork();
      const expectedChainId = BigInt(CHAIN_INFO[selectedChain].chainIdNum);
      if (network.chainId !== expectedChainId) {
        throw new Error(`Please switch to ${CHAIN_INFO[selectedChain].name} in your wallet and try again`);
      }

      // Get stablecoin contract for selected chain
      const tokenName = CHAIN_INFO[selectedChain].token;
      const tokenAddress = STABLECOIN_CONTRACTS[selectedChain];
      console.log(`Using ${tokenName} contract: ${tokenAddress} on ${CHAIN_INFO[selectedChain].name}`);

      const stablecoinContract = new Contract(tokenAddress, STABLECOIN_ABI, signer);

      // Verify stablecoin contract is valid (with timeout and better error handling)
      let contractDecimals = 18; // Default assumption (BUSD uses 18, USDC uses 6)
      try {
        console.log(`Verifying ${tokenName} contract...`);
        console.log('Contract address:', tokenAddress);
        console.log('Chain:', CHAIN_INFO[selectedChain].name);
        console.log('Expected token:', tokenName);

        // Add timeout to prevent hanging
        const decimalsPromise = stablecoinContract.decimals();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Contract verification timeout')), 5000)
        );

        const decimals = await Promise.race([decimalsPromise, timeoutPromise]) as bigint;
        contractDecimals = Number(decimals);

        console.log(`✅ ${tokenName} contract verified. Decimals: ${contractDecimals}`);

        if (contractDecimals !== 6 && contractDecimals !== 18) {
          console.error(`⚠️ Unexpected decimals: ${contractDecimals}`);
          throw new Error(`Invalid ${tokenName} contract! Expected 6 or 18 decimals, got ${contractDecimals}`);
        }

        if (contractDecimals === 18 && tokenName === 'USDC') {
          console.warn('⚠️ Warning: This token uses 18 decimals instead of standard USDC 6 decimals');
          console.warn('⚠️ This might be a different stablecoin. Proceeding anyway...');
        }

        if (contractDecimals === 6 && tokenName === 'BUSD') {
          console.warn('⚠️ Warning: Expected BUSD with 18 decimals but got 6 decimals');
        }

      } catch (contractError) {
        console.error(`❌ ${tokenName} contract verification failed:`, contractError);
        console.error('Contract address:', tokenAddress);
        console.error('Chain:', CHAIN_INFO[selectedChain].name);

        const errorMsg = contractError instanceof Error ? contractError.message : 'Unknown error';

        throw new Error(
          `${tokenName} contract verification failed on ${CHAIN_INFO[selectedChain].name}. ` +
          `Error: ${errorMsg}. Please make sure you have ${tokenName} tokens in your wallet.`
        );
      }

      // Try to add stablecoin token to wallet for visibility (only for browser extensions)
      if (selectedWallet !== 'walletconnect' && window.ethereum) {
        try {
          let ethereumProvider = window.ethereum;
          if (window.ethereum.providers?.length) {
            let walletProvider;

            if (selectedWallet === 'metamask') {
              walletProvider = window.ethereum.providers.find((p) => p.isMetaMask && !p.isTrust);
            } else if (selectedWallet === 'trustwallet') {
              walletProvider = window.ethereum.providers.find((p) => p.isTrust);
            }

            if (walletProvider) {
              ethereumProvider = walletProvider;
            }
          }

          await ethereumProvider.request({
            method: 'wallet_watchAsset',
            params: [{
              type: 'ERC20',
              options: {
                address: tokenAddress,
                symbol: tokenName,
                decimals: contractDecimals,
              },
            }],
          });
          console.log(`✅ ${tokenName} token added to wallet`);
        } catch (addTokenError) {
          console.log(`⚠️ Could not add ${tokenName} token (user may have declined or already has it)`);
        }
      }

      // USDC has 6 decimals
      console.log('==========================================');
      console.log('=== 🔍 PAYMENT AMOUNT DEBUG (BEFORE TX) ===');
      console.log('==========================================');
      console.log(`amountPHP (prop from booking):`, amountPHP);
      console.log(`exchangeRate:`, exchangeRate);
      console.log(`rateLoading:`, rateLoading);
      console.log(`amountUSD (calculated):`, amountUSD);
      console.log(`amountUSDC (string to send): "${amountUSDC}"`);
      console.log('==========================================');

      // CRITICAL VALIDATION LAYER 1: Check PHP amount prop
      if (!amountPHP || amountPHP <= 0 || isNaN(amountPHP)) {
        const errorMsg = `❌ LAYER 1 FAILED: Invalid PHP amount prop: ${amountPHP}`;
        console.error(errorMsg);
        throw new Error(`The booking amount is invalid (₱${amountPHP}). Please go back and check your booking details.`);
      }
      console.log('✅ LAYER 1 PASSED: PHP amount is valid');

      // CRITICAL VALIDATION LAYER 2: Check exchange rate
      if (!exchangeRate || exchangeRate <= 0 || isNaN(exchangeRate)) {
        const errorMsg = `❌ LAYER 2 FAILED: Invalid exchange rate: ${exchangeRate}`;
        console.error(errorMsg);
        throw new Error(`Exchange rate is invalid (${exchangeRate}). Please close and wait 10 seconds before trying again.`);
      }
      console.log('✅ LAYER 2 PASSED: Exchange rate is valid');

      // CRITICAL VALIDATION LAYER 3: Check USDC string
      if (!amountUSDC || amountUSDC === '' || amountUSDC === '0' || amountUSDC === '0.00' || amountUSDC === '0.0') {
        const errorMsg = `❌ LAYER 3 FAILED: amountUSDC string is zero or empty: "${amountUSDC}"`;
        console.error(errorMsg);
        console.error('This would ONLY send gas fees - TRANSACTION BLOCKED!');
        throw new Error(`CRITICAL ERROR: Payment amount is zero. Exchange rate may not have loaded. Close modal, wait 10 seconds, and try again.`);
      }
      console.log('✅ LAYER 3 PASSED: USDC string is not empty/zero');

      // CRITICAL VALIDATION LAYER 4: Parse and validate number
      const parsedAmount = Number.parseFloat(amountUSDC);
      console.log(`Parsed amount as number:`, parsedAmount);

      if (isNaN(parsedAmount)) {
        const errorMsg = `❌ LAYER 4A FAILED: Parsed amount is NaN from "${amountUSDC}"`;
        console.error(errorMsg);
        throw new Error(`Invalid USDC amount format: "${amountUSDC}". Please close and try again.`);
      }

      if (parsedAmount <= 0) {
        const errorMsg = `❌ LAYER 4B FAILED: Parsed amount is <= 0: ${parsedAmount}`;
        console.error(errorMsg);
        console.error('This would ONLY send gas fees - TRANSACTION BLOCKED!');
        throw new Error(`CRITICAL ERROR: Payment amount is ${parsedAmount} USDC. This would only charge gas fees. Transaction blocked.`);
      }

      if (parsedAmount < 0.01) {
        const errorMsg = `❌ LAYER 4C FAILED: Parsed amount too small: ${parsedAmount} USDC`;
        console.error(errorMsg);
        throw new Error(`Amount too small: ${parsedAmount} USDC. Minimum is $0.01. This would only charge gas fees. Transaction blocked.`);
      }
      console.log('✅ LAYER 4 PASSED: Parsed amount is valid number > $0.01');

      // CRITICAL VALIDATION LAYER 5: Parse to base units (using contract decimals)
      console.log(`\nParsing "${amountUSDC}" to base units (${contractDecimals} decimals)...`);
      const amountBaseUnits = parseUnits(amountUSDC, contractDecimals);
      console.log(`Result: ${amountBaseUnits.toString()} base units`);
      console.log(`Human readable: ${formatUnits(amountBaseUnits, contractDecimals)} USDC`);

      // CRITICAL VALIDATION LAYER 6: Verify base units
      if (amountBaseUnits === BigInt(0)) {
        const errorMsg = `❌ LAYER 6A FAILED: Base units = 0`;
        console.error(errorMsg);
        console.error(`Input string: "${amountUSDC}"`);
        console.error('parseUnits returned 0 - this would ONLY send gas fees!');
        throw new Error(`CRITICAL: parseUnits("${amountUSDC}", ${contractDecimals}) returned 0. Transaction blocked to prevent gas-only payment.`);
      }

      if (amountBaseUnits <= BigInt(0)) {
        const errorMsg = `❌ LAYER 6B FAILED: Base units <= 0: ${amountBaseUnits.toString()}`;
        console.error(errorMsg);
        throw new Error(`Invalid base units: ${amountBaseUnits.toString()}. Transaction blocked.`);
      }

      // Verify base units match expected value (adjusted for decimals)
      const expectedMinimum = contractDecimals === 6 ? BigInt(10000) : BigInt('10000000000000000'); // 0.01 in 6 or 18 decimals
      if (amountBaseUnits < expectedMinimum) {
        const errorMsg = `❌ LAYER 6C FAILED: Base units ${amountBaseUnits.toString()} < minimum ${expectedMinimum.toString()}`;
        console.error(errorMsg);
        throw new Error(`Amount too small in base units. Transaction blocked.`);
      }
      console.log('✅ LAYER 6 PASSED: Base units are valid');

      console.log('\n==========================================');
      console.log('🎉 ALL VALIDATION LAYERS PASSED!');
      console.log('==========================================');
      console.log(`✅ Will send: ${formatUnits(amountBaseUnits, contractDecimals)} USDC`);
      console.log(`✅ Equivalent to: ₱${amountPHP} PHP`);
      console.log(`✅ Base units: ${amountBaseUnits.toString()}`);
      console.log(`✅ Decimals: ${contractDecimals}`);
      console.log('==========================================\n');

      // Check balance
      console.log(`Checking ${tokenName} balance...`);
      const balance = await stablecoinContract.balanceOf(walletAddress);
      console.log(`Balance: ${formatUnits(balance, contractDecimals)} ${tokenName}`);

      if (balance < amountBaseUnits) {
        throw new Error(`Insufficient ${tokenName} balance. You have ${formatUnits(balance, contractDecimals)} ${tokenName} but need ${amountUSDC} ${tokenName}`);
      }

      // Validate recipient address
      if (!recipientAddress || recipientAddress === '') {
        throw new Error('Recipient address not configured. Please contact support.');
      }

      // Final pre-flight check
      console.log('==========================================');
      console.log('🚀 FINAL PRE-FLIGHT CHECK BEFORE SENDING');
      console.log('==========================================');
      console.log('Token:', tokenName);
      console.log('Recipient:', recipientAddress);
      console.log('Amount (string):', amountUSDC);
      console.log('Amount (parsed):', Number.parseFloat(amountUSDC));
      console.log('Amount (BigInt base units):', amountBaseUnits.toString());
      console.log('Amount (in human readable):', formatUnits(amountBaseUnits, contractDecimals), tokenName);
      console.log('Expected to send:', formatUnits(amountBaseUnits, contractDecimals), `${tokenName} (NOT just gas)`);
      console.log('Contract decimals:', contractDecimals);
      console.log('==========================================');

      // CRITICAL CHECK: Verify amount is correct before sending
      const humanReadableAmount = formatUnits(amountBaseUnits, contractDecimals);
      if (Number.parseFloat(humanReadableAmount) < 0.01) {
        throw new Error(`CRITICAL ERROR: Amount too small (${humanReadableAmount} ${tokenName}). This would only pay gas fees. Aborting transaction.`);
      }

      // Log the exact function call about to be made
      console.log('\n==========================================');
      console.log('📞 CALLING CONTRACT TRANSFER FUNCTION NOW');
      console.log('==========================================');
      console.log(`Function: ${tokenName}Contract.transfer(to, amount)`);
      console.log('Contract address:', tokenAddress);
      console.log('Parameter 1 (to):', recipientAddress);
      console.log('Parameter 2 (amount):', amountBaseUnits);
      console.log('  - Type:', typeof amountBaseUnits);
      console.log('  - toString():', amountBaseUnits.toString());
      console.log('  - Human readable:', humanReadableAmount, tokenName);
      console.log('==========================================\n');

      // Send transaction
      console.log(`✅ All checks passed. Sending ${humanReadableAmount} ${tokenName} to ${recipientAddress}...`);

      // IMPORTANT: Save the amount before the call to verify it doesn't change
      const amountBeforeCall = amountBaseUnits;
      console.log('💾 Saved amount before call:', amountBeforeCall.toString());

      const tx = await stablecoinContract.transfer(recipientAddress, amountBaseUnits);

      // Verify amount didn't change
      console.log('🔍 Amount after call:', amountBaseUnits.toString());
      console.log('🔍 Are they equal?', amountBeforeCall === amountBaseUnits);

      setTxHash(tx.hash);
      console.log(`✅ Transaction submitted: ${tx.hash}`);
      console.log(`🔍 Verify on explorer: https://${selectedChain === 'bsc' ? 'bscscan.com' : 'etherscan.io'}/tx/${tx.hash}`);
      console.log('\n⚠️⚠️⚠️ VERY IMPORTANT ⚠️⚠️⚠️');
      console.log(`Open the transaction on the block explorer and verify:`);
      console.log(`1. Look for "Token Transfer" or "Transfer" event`);
      console.log(`2. Confirm amount is ${humanReadableAmount} ${tokenName}`);
      console.log(`3. If you only see gas fees, share the transaction link!\n`);

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      await tx.wait();
      console.log('Transaction confirmed!');

      setStep('success');
      onSuccess();
    } catch (err: unknown) {
      console.error('USDC payment error:', err);
      const error = err as { message?: string; code?: string };
      let errorMessage = error.message || 'Transaction failed';

      // Provide more helpful error messages
      if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected in your wallet';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees. You need some ' + CHAIN_INFO[selectedChain].name + ' native token for gas.';
      } else if (errorMessage.includes('could not decode')) {
        errorMessage = `Invalid USDC contract on ${CHAIN_INFO[selectedChain].name}. Please make sure you're on the correct network.`;
      }

      setError(errorMessage);
      onError(errorMessage);
      setStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>💰</span>
              Pay with Crypto
              {selectedChain && step !== 'loading' && (
                <span className="text-sm font-normal text-slate-600 ml-2">
                  ({CHAIN_INFO[selectedChain].token} on {CHAIN_INFO[selectedChain].name})
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
          {/* Info Banner */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="text-lg">ℹ️</span>
              <span className="text-sm font-medium">Wallet DApp or Chrome extension only</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-sm text-slate-600 mb-2">Total Amount</div>
              {rateLoading ? (
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  <span className="animate-pulse">Calculating...</span>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-blue-600 mb-2">${amountUSDC} USDC</div>
                  <div className="text-sm text-slate-500">≈ ₱{amountPHP.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-2">
                    Rate: $1 = ₱{exchangeRate.toFixed(2)}
                    <span className="ml-1" title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
                      🔄
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-800">
              <div className="font-semibold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Preparing Payment...</h3>
              <p className="text-slate-600 mb-2">Loading real-time exchange rate</p>
              <p className="text-slate-500 text-sm">This may take up to 20 seconds</p>
              <div className="mt-4 text-xs text-slate-400">
                {rateLoading ? 'Fetching exchange rate from API...' :
                 amountUSDC && Number.parseFloat(amountUSDC) > 0 ? 'Rate loaded! Proceeding...' :
                 'Calculating USDC amount...'}
              </div>
            </div>
          )}

          {/* Step 1: Select Network (FIRST) */}
          {step === 'chain-select' && (
            <div>
              {/* Show amount status */}
              {rateLoading ? (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
                  <div className="text-center">
                    <div className="animate-pulse text-yellow-800 font-semibold flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading exchange rate, please wait...
                    </div>
                  </div>
                </div>
              ) : !amountUSDC || Number.parseFloat(amountUSDC) <= 0 || isNaN(Number.parseFloat(amountUSDC)) ? (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <div className="text-center text-red-800">
                    <div className="font-semibold mb-2">ERROR: Invalid Amount</div>
                    <div className="text-sm">Please close this modal and try again.</div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-green-800 mb-1">You will pay:</div>
                    <div className="text-3xl font-bold text-green-700">${amountUSDC} USDC</div>
                    <div className="text-sm text-green-700 mt-1">≈ ₱{amountPHP.toLocaleString()}</div>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-4 text-slate-800">Step 1: Choose Network</h3>

              <div className="space-y-3 mb-6">
                {(Object.keys(CHAIN_INFO) as Array<keyof typeof CHAIN_INFO>).map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    disabled={rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedChain === chain
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2 text-slate-800">
                          {CHAIN_INFO[chain].name}
                          <span className="text-xs font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            {CHAIN_INFO[chain].token}
                          </span>
                        </div>
                      </div>
                      {selectedChain === chain && (
                        <div className="text-blue-500 text-2xl">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('wallet-select')}
                disabled={rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Wallet Selection
              </button>
            </div>
          )}

          {/* Step 2: Select Wallet (SECOND) */}
          {step === 'wallet-select' && (
            <div>
              {/* Show selected network */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Network: <strong>{CHAIN_INFO[selectedChain].name}</strong> ({CHAIN_INFO[selectedChain].token})
              </div>

              <h3 className="text-lg font-semibold mb-4 text-slate-800">Step 2: Choose Wallet</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => connectWallet('metamask')}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-left transition-all flex items-center gap-4"
                >
                  <div className="text-4xl">🦊</div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-800">MetaMask</div>
                    <div className="text-sm text-slate-600">Most popular wallet</div>
                  </div>
                </button>

                <button
                  onClick={() => connectWallet('trustwallet')}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all flex items-center gap-4"
                >
                  <div className="text-4xl">🛡️</div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-800">Trust Wallet</div>
                    <div className="text-sm text-slate-600">Mobile & browser wallet</div>
                  </div>
                </button>

                {/* WalletConnect option - hidden for now
                <button
                  onClick={() => connectWallet('walletconnect')}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 text-left transition-all flex items-center gap-4"
                >
                  <div className="text-4xl">🔗</div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-800">WalletConnect</div>
                    <div className="text-sm text-slate-600">Connect any mobile wallet (QR code)</div>
                  </div>
                </button>
                */}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> Make sure you have {CHAIN_INFO[selectedChain].token} tokens and some {CHAIN_INFO[selectedChain].name} native token for gas fees.
                </div>
              </div>

              <button
                onClick={() => setStep('chain-select')}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-all"
              >
                Back to Network Selection
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-green-800">
                    <strong>Wallet Connected</strong>
                    <div className="mt-1 font-mono text-xs">{walletAddress}</div>
                  </div>
                </div>

                {(!amountUSDC || Number.parseFloat(amountUSDC) <= 0 || rateLoading) && (
                  <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg text-yellow-800">
                    <div className="font-semibold mb-1">Warning</div>
                    <div className="text-sm">
                      {rateLoading ? 'Loading exchange rate, please wait...' : 'Invalid payment amount detected. Please close and try again.'}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold mb-3 text-slate-800">Transaction Details</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Network:</span>
                    <span className="font-semibold text-slate-800">{CHAIN_INFO[selectedChain].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className={`font-semibold ${!amountUSDC || Number.parseFloat(amountUSDC) <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {amountUSDC || '0.00'} {CHAIN_INFO[selectedChain].token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">≈ PHP Amount:</span>
                    <span className="font-semibold text-slate-800">₱{amountPHP.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">To:</span>
                    <span className="font-mono text-xs text-slate-800">{recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('wallet-select')}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={sendUSDC}
                  disabled={isProcessing || rateLoading || !amountUSDC || Number.parseFloat(amountUSDC) <= 0 || isNaN(Number.parseFloat(amountUSDC))}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  title={rateLoading ? 'Loading exchange rate...' : !amountUSDC || Number.parseFloat(amountUSDC) <= 0 ? 'Waiting for amount to load...' : 'Send payment'}
                >
                  {rateLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    `Send ${amountUSDC} ${CHAIN_INFO[selectedChain].token}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Processing Transaction...</h3>
              <p className="text-slate-600 mb-4">Please confirm in your wallet and wait for confirmation</p>
              {txHash && (
                <div className="bg-blue-50 rounded-lg p-4 inline-block">
                  <div className="text-xs text-slate-600 mb-1">Transaction Hash:</div>
                  <div className="font-mono text-sm">{txHash.slice(0, 20)}...{txHash.slice(-10)}</div>
                </div>
              )}
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful! 🎉</h3>
              <p className="text-slate-600 mb-6">Your USDC payment has been confirmed</p>

              {txHash && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-slate-600 mb-2">Transaction Hash:</div>
                  <div className="font-mono text-xs mb-3 break-all">{txHash}</div>
                  <a
                    href={`https://${selectedChain === 'bsc' ? 'bscscan.com' : 'etherscan.io'}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    View on Explorer →
                  </a>
                </div>
              )}

              <button
                onClick={onClose}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isTrust?: boolean;
      providers?: Array<{
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        isMetaMask?: boolean;
        isTrust?: boolean;
      }>;
    };
  }
}
