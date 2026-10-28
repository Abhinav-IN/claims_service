export function calcTpaSplit(
  finalBill: number,
  nonPayable: number,
  approved: number,
  coPayPercent: number,
  balance: number,
) {
  const eligible = Math.max(0, Math.min(finalBill - nonPayable, approved));
  const afterCoPay = eligible - Math.round((eligible * coPayPercent) / 100);
  const payer = Math.min(afterCoPay, balance);
  return { payer, patient: finalBill - payer };
}

export function calcPmjaySplit(packageRate: number) {
  return { payer: packageRate, patient: 0 };
}