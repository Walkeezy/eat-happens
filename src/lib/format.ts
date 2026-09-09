export const formatCurrency = (value: string | number | null) => {
  if (value === null) {
    return '-';
  }

  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return '-';
  }

  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount);
};
