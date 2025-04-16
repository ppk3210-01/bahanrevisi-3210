
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
