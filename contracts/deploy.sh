#!/usr/bin/env bash
#
# BaseCommons Smart Contract Deployment Script
# =============================================
# Usage:
#   bash deploy.sh [mainnet|sepolia]
#
# Required env vars:
#   WALLET_PRIVATE_KEY  - 64-char hex private key (no 0x prefix)
#   BASESCAN_API_KEY    - For contract verification on Basescan
#   ADMIN_ADDRESS       - (optional) Admin wallet address; defaults to deployer
#
# Network wallet: 0xFfb6505912FCE95B42be4860477201bb4e204E9f
# Needs at least 0.01 ETH on the chosen network.

set -euo pipefail

NETWORK="${1:-sepolia}"

case "$NETWORK" in
  mainnet)
    RPC="https://mainnet.base.org"
    CHAIN=8453
    EXPLORER_URL="https://basescan.org/address"
    ;;
  sepolia)
    RPC="https://sepolia.base.org"
    CHAIN=84532
    EXPLORER_URL="https://sepolia.basescan.org/address"
    ;;
  *)
    echo "❌ Unknown network: $NETWORK. Use 'mainnet' or 'sepolia'."
    exit 1
    ;;
esac

PK="0x$(echo "$WALLET_PRIVATE_KEY" | sed 's/^0x//')"
DEPLOYER=$(cast wallet address --private-key "$PK" 2>/dev/null)
BALANCE=$(cast balance "$DEPLOYER" --rpc-url "$RPC" 2>/dev/null)
BALANCE_ETH=$(python3 -c "print(f'{int('$BALANCE') / 1e18:.6f}')" 2>/dev/null || echo "?")

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  BaseCommons Contract Deployer            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Network  : Base $NETWORK (chain $CHAIN)"
echo "  Deployer : $DEPLOYER"
echo "  Balance  : $BALANCE_ETH ETH"
echo "  RPC      : $RPC"
echo ""

if (( $(echo "$BALANCE < 2000000000000000" | python3 -c "import sys; print(int(open('/dev/stdin').read().strip().replace('<','<')))") )); then
  echo "⚠️  WARNING: Balance may be insufficient for deployment"
fi

# Compile
echo "🔨 Compiling contracts..."
forge build --root . 2>&1

# Deploy
echo ""
echo "🚀 Deploying BaseCommons..."
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:DeployScript \
  --broadcast \
  --rpc-url "$RPC" \
  --chain-id "$CHAIN" \
  --private-key "$PK" \
  --root . \
  -vvvv 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract deployed address
CONTRACT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP 'Contract Address: \K0x[0-9a-fA-F]+' | head -1)

if [ -z "$CONTRACT_ADDR" ]; then
  CONTRACT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP 'deployed at: \K0x[0-9a-fA-F]+' | head -1)
fi

if [ -z "$CONTRACT_ADDR" ]; then
  echo "❌ Could not parse deployed contract address from output."
  echo "Look in the output above for the contract address."
  exit 1
fi

echo ""
echo "✅ Contract deployed at: $CONTRACT_ADDR"
echo "   Explorer: $EXPLORER_URL/$CONTRACT_ADDR"
echo ""

# Verify on Basescan
if [ -n "${BASESCAN_API_KEY:-}" ]; then
  echo "🔍 Verifying on Basescan..."
  ADMIN_ADDR="${ADMIN_ADDRESS:-$DEPLOYER}"
  forge verify-contract \
    "$CONTRACT_ADDR" \
    src/BaseCommons.sol:BaseCommons \
    --chain-id "$CHAIN" \
    --etherscan-api-key "$BASESCAN_API_KEY" \
    --constructor-args "$(cast abi-encode 'constructor(address)' $ADMIN_ADDR)" \
    --root . \
    --watch 2>&1 || echo "⚠️  Verification failed — verify manually on Basescan"
  echo ""
else
  echo "⚠️  BASESCAN_API_KEY not set — skipping verification."
  echo "   Verify manually at: https://basescan.org"
fi

echo "📝 Add this to your environment variables:"
echo ""
echo "   VITE_BASE_COMMONS_ADDRESS=$CONTRACT_ADDR"
echo "   VITE_CHAIN_ID=$CHAIN"
echo ""
echo "🎉 Deployment complete!"
