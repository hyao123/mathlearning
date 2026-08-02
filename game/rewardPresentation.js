const FULL_REVEAL_RARITIES = new Set(["rare", "epic", "legendary", "mythic"]);

function mergeTransactions(transactions = [], predicate = () => true) {
  const merged = new Map();
  transactions.filter((transaction) => transaction && predicate(transaction)).forEach((transaction) => {
    const existing = merged.get(transaction.itemId);
    merged.set(transaction.itemId, existing
      ? {
        ...existing,
        requestedQuantity: (existing.requestedQuantity || 0) + (transaction.requestedQuantity || 0),
        awardedQuantity: (existing.awardedQuantity || 0) + (transaction.awardedQuantity || 0),
        rewardTypes: [...new Set([...(existing.rewardTypes || [existing.rewardType]), transaction.rewardType])]
      }
      : { ...transaction, rewardTypes: [transaction.rewardType] });
  });
  return [...merged.values()];
}

function awardedTransactions(transactions = []) {
  return mergeTransactions(transactions, (transaction) => transaction.status === "awarded" && transaction.awardedQuantity > 0);
}

function nonAwardedTransactions(transactions = []) {
  return mergeTransactions(transactions, (transaction) => transaction.status !== "awarded");
}

function getRewardPresentation(transactions, getItem) {
  const awarded = awardedTransactions(transactions);
  const hasSpecialReward = awarded.some((transaction) => {
    const item = getItem(transaction.itemId);
    return transaction.rewardType !== "fixed" || FULL_REVEAL_RARITIES.has(item?.rarity);
  });
  return {
    mode: hasSpecialReward ? "reveal" : "toast",
    transactions: awarded,
    hasStreakChest: awarded.some((transaction) => transaction.rewardType === "streak-chest")
  };
}

module.exports = { FULL_REVEAL_RARITIES, awardedTransactions, nonAwardedTransactions, getRewardPresentation };
