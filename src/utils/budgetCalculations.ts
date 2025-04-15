
export const getRowStyle = (status: string): string => {
  switch (status) {
    case 'changed':
      return 'row-changed';
    case 'new':
      return 'row-new';
    case 'deleted':
      return 'row-deleted';
    default:
      return '';
  }
};

export const formatCurrency = (value: number, includeSymbol = true): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const formatted = value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return includeSymbol ? `Rp ${formatted}` : formatted;
};

export const calculateAmount = (volume: number, hargaSatuan: number): number => {
  return volume * hargaSatuan;
};

export const calculateDifference = (semula: number, menjadi: number): number => {
  return menjadi - semula;
};

export const roundToThousands = (num: number): number => {
  return Math.round(num / 1000) * 1000;
};

export const getCellClass = (item: any, field: string): string => {
  if (field.includes('menjadi') && item.status === 'changed') {
    // Return 'text-blue-600 font-medium' class for "menjadi" values when item status is "changed"
    return 'text-blue-600 font-bold';
  }
  return '';
};

// Add the missing updateItemStatus function
export const updateItemStatus = (item: any): any => {
  const updatedItem = { ...item };
  
  // If jumlah_menjadi is different from jumlah_semula, mark as changed
  if (updatedItem.jumlahMenjadi !== updatedItem.jumlahSemula) {
    updatedItem.status = 'changed';
  } else {
    // If they are the same, check if any other relevant fields changed
    if (updatedItem.volumeMenjadi !== updatedItem.volumeSemula ||
        updatedItem.satuanMenjadi !== updatedItem.satuanSemula ||
        updatedItem.hargaSatuanMenjadi !== updatedItem.hargaSatuanSemula) {
      updatedItem.status = 'changed';
    } else {
      updatedItem.status = 'unchanged';
    }
  }
  
  return updatedItem;
};
