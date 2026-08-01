const FULL_REVEAL_RARITIES = new Set(["rare", "epic", "legendary", "mythic"]);

function awardedTransactions(transactions = []) {
  const merged = new Map();
  transactions.filter((transaction) => transaction?.status === "awarded" && transaction.awardedQuantity > 0).forEach((transaction) => {
    const existing = merged.get(transaction.itemId);
    merged.set(transaction.itemId, existing
      ? { ...existing, awardedQuantity: existing.awardedQuantity + transaction.awardedQuantity, rewardTypes: [...new Set([...(existing.rewardTypes || [existing.rewardType]), transaction.rewardType])] }
      : { ...transaction, rewardTypes: [transaction.rewardType] });
  });
  return [...merged.values()];
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

module.exports = { FULL_REVEAL_RARITIES, awardedTransactions, getRewardPresentation };
