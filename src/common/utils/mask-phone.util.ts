export function maskPhones(items: any[]) {
  return items.map((item) => {
    if (item?.phone && item.phone.startsWith('09') && item.phone.length >= 11) {
      item.phone = item.phone.replace(/^(\d{4})\d+(\d{3})$/, '$1****$2');
    }

    return item;
  });
}
