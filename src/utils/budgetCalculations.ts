

// Add the missing updateItemStatus function
export const updateItemStatus = (item: any) => {
  const newItem = { ...item };
  
  // Calculate the difference between 'menjadi' and 'semula' values
  const selisih = newItem.jumlahMenjadi - newItem.jumlahSemula;
  newItem.selisih = selisih;
  
  // Determine the status based on the changes
  if (newItem.jumlahSemula === 0) {
    // This is a new item
    newItem.status = 'new';
  } else if (selisih !== 0) {
    // This item has changes
    newItem.status = 'changed';
  } else {
    // No change
    newItem.status = 'unchanged';
  }
  
  return newItem;
};

// Add formatCurrency function
export const formatCurrency = (amount: number, showPrefix: boolean = true): string => {
  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const formattedAmount = formatter.format(amount);
  return showPrefix ? `Rp ${formattedAmount}` : formattedAmount;
};

// Add calculateAmount function - apply rounding
export const calculateAmount = (volume: number, unitPrice: number): number => {
  return roundToThousands(volume * unitPrice);
};

// Add calculateDifference function
export const calculateDifference = (original: number, updated: number): number => {
  return updated - original;
};

// Update roundToThousands function to properly round to thousands
export const roundToThousands = (value: number): number => {
  return Math.round(value / 1000) * 1000;
};

// Add getRowStyle function
export const getRowStyle = (status: string): string => {
  switch (status) {
    case 'changed':
      return 'bg-yellow-50';
    case 'new':
      return 'bg-blue-50';
    case 'deleted':
      return 'bg-red-50';
    default:
      return '';
  }
};

