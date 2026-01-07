export const formatCurrency = (value: number | null) => {
  if (value === null) {
    return '-';
  }

  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);
};
